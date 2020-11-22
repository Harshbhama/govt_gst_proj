const {  anx1Queries } = require("../../db/anx1Queries/anx1Queries");
const anx1Comm = require("../../db/queries");
const queries= require("../../db/queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const sqlite3 = require('sqlite3').verbose();
const { STATUS_CD_ZERO, STATUS_CD_ONE , DB_PATH, DB_EXT} = require('../../utility/constants');
//const {saveItemDetails3H , updateItemDetails , getValuesToSaveItemDetailsBatch} = require('../../dao/anx1Dao')
const _ = require("lodash");
const {save3Aor3HSummary,save3Aor3HSummaryTxn} = require("../anx1SummaryDao")
const logger  = require('../../utility/logger').logger;

/**
 * 
 * @param {*} gstin 
 */
async function getTab3idetails(gstin, rtnprd , flag) {
    try {
      let sql = anx1Queries.table3i.getAll3i;
      if(flag == "F") sql = anx1Queries.table3i.getAll3iErr
        let rows = await db.fetchAllById(sql,[rtnprd], gstin) 
        return ( rows.length === 0 ) ? ({ message: `No Data found`, gstin : gstin , statusCd: "0"}) : rows 
    } catch (err) {
        
        if (err.message.includes("no such table"))
        return({ message: `No Data found`, gstin : gstin ,
         statusCd: "0"});
      else
     return({ message: err.message, gstin : gstin ,
            statusCd: "0" });

    }
    
}


function save3ISummary(gstin, fp, taxperiod) {

    console.log("Inside save3ISummary for :" + gstin + "," + fp + "," + taxperiod);
  
    return new Promise(function (resolve, reject) {
  
      let summObj3I;
  
      return db.fetchById(anx1Queries.table3i.calculate3iSumm, [fp, taxperiod], gstin)
        .then((rows, err) => {
          if (err) {
            console.log(err);
            reject({ error: err, statusCd: STATUS_CD_ZERO });
          }
          else {
            summObj3I = rows;
            return true;
          }
        }).then((isSummaryCalculated) => {
          return db.getCount(anx1Queries.table3i.getCountMarkForDelfor3i, [fp, taxperiod], gstin);
        })
        .then((count) => {
          summObj3I.cgst = null;
          summObj3I.sgst = null;
          return save3Aor3HSummary(gstin, fp, taxperiod, count, summObj3I, "3I");
        })
        .then((isSummarySaved) => {
          resolve({ message: "SUCCESS", statusCd: STATUS_CD_ONE });
        })
        .catch((err) => {
          console.log("err : " + err); 
          reject({ error: err, statusCd: STATUS_CD_ZERO });
        });
    });
  }
  
  
//generate json for dao layer 3I

function get3IjSON(gstin, rtnprd,flag){
  return new Promise(function (resolve, reject) {
    logger.log("info","Inside get3IjSON : %s" , flag);
    let sql = anx1Queries.table3i.get3IjSON;
    if (flag == "F")
      sql = anx1Queries.table3i.get3IErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

// save 3I with Transaction.
async function saveTab3iTxn(tab3i ,items, gstin) {
  logger.log("info","Starting saveTab3iTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
           gstindb.exec('BEGIN TRANSACTION;'); 

           await db.saveTxn(anx1Queries.table3i.save3i , [
                tab3i.docref ,
                tab3i.pos , 
                tab3i.taxVal , 
                tab3i.igst , 
                tab3i.cess ,          
                tab3i.suptype , 
                tab3i.upldt,
                tab3i.diffpercnt,          
                tab3i.rfndelg,
                tab3i.flag ,
                tab3i.status,    
                tab3i.fp,
                tab3i.taxPeriod,
                tab3i.errorcode || null,
                tab3i.errmsg || null
            ] , gstindb)
           await db.saveTxn(anx1Comm.anx1Queries.itemDetails.saveItemDetailsBatch + prepareItems3i(items),[], gstindb)       
           await save3ISummaryTxn(gstin , tab3i.fp , tab3i.taxPeriod,gstindb)  
     
          db.dbCommit(gstindb);
        return({ message: "Document added successfully", statusCd: "1",  docref: tab3i.docref })
        logger.log("info","Ending saveTab3iTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    } catch (err) {
           logger.log("info","Error in  saveTab3iTxn : %s  ::  %s", new Date().toString(),err);
          if (err.message.includes("UNIQUE constraint failed"))
         throw new Error( `Document already exists`);
       else
      throw new Error( err.message);
      } finally{
        db.closeDBConn(gstindb)
      }

}


/**
 * To edit the 3I Documents and item details
 * @param {*} tab3i 
 * @param {*} items 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxPeriod 
 * @param {*} flag 
 */
async function editTab3iTxn(tab3i ,items , gstin, fp, taxPeriod, flag) {
  logger.log("info","Starting editTab3iTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);

  try {
    gstindb.exec('BEGIN TRANSACTION;');

    let insertItems = [];
    let updateItems = [];
  
  // Segregate Insert and Update Items  based on ItemId undefined
    items.forEach((item) => ( _.isUndefined(item.itemid) ? insertItems : updateItems).push(item));
  
    await db.saveTxn(anx1Queries.table3i.edit3i , [
      tab3i.docref ,
      tab3i.pos , 
      tab3i.taxVal , 
      tab3i.igst , 
      tab3i.cess ,          
      tab3i.flag ,
      tab3i.status ,
      null,
      tab3i.errorcode || null,
      tab3i.errmsg || null,
      tab3i.docid
        ] , gstindb)
  
        /** update Item details */
    let updateRecordCount = await updateItemsTxn(updateItems, gstindb) || 0
      /** Insert the new Items provided as input */

      let insertRecordCount = 0
      if(insertItems.length > 0)
      insertRecordCount = await db.saveTxn(anx1Comm.anx1Queries.itemDetails.saveItemDetailsBatch + prepareItems3i(insertItems),[], gstindb)  
  
      if(items.length !== (insertRecordCount + updateRecordCount)) { 
        throw new Error(message = "Error in updating Item Details") 
      } 
  
      await save3ISummaryTxn(gstin ,fp ,taxPeriod,gstindb)
      logger.log("info", "save3ISummaryTxn in edit  : %s, %s, %s", gstin, fp, taxPeriod)

      if((flag && flag == "F") || tab3i.flag == "C"){ // Summary to be calculated for error flow - corrected records
        console.log("Saving error summary for 3I");
        await save3ISummaryTxn(gstin ,fp ,taxPeriod,gstindb, "F")
      }

      db.dbCommit(gstindb)
      
      logger.log("info","Ending editTab3iTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      return { message: "Document updated successfully", statusCd: STATUS_CD_ONE}
      
  } catch (err) {
    logger.log("info","Error editTab3iTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
     if (err.message.includes("UNIQUE constraint failed")){
              throw new Error( message =  `Document already exists`);
            }
            else {
               throw new Error( message = err.message);
            }
  }finally{
    db.closeDBConn(gstindb)
  }
 }

/**
 * update Items into the 
 */

 /**
 * To delete the 3I Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function deleteTab3iBydocidsTxn(docIds, gstin, fp, rtnprd) {
  logger.log("info","Starting deleteTab3iBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    try {
    
    gstindb.exec('BEGIN TRANSACTION;');   

    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllByIdInTransaction(anx1Queries.table3i.getTab3iByDocIds, docIds, gstindb, true);

    if (docIdsResult.length === 0) {
      logger.log("info","End of deleteTab3iBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      throw new Error(message = `No Document(s) found to delete`);
    } 
    else {
      logger.log("debug", "docIds : %s", JSON.stringify(docIdsResult));

      // input docIds and Db output docIdsResult are being compared to check all records are found in DB 
      //if any differnce found error will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);

      if (diffRec.length === 0) {
        // Delete the items for the corresponding docrefs
        let deleteItemsBydocref = await db.deleteBySqlInClauseTxn(queries.anx1Queries.itemDetails.deleteItemsByitemRef,_.map(docIdsResult, "docref"), gstindb);
      
        logger.log("debug", "deleteItemsBydocref : %s", deleteItemsBydocref);
        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClauseTxn(anx1Queries.table3i.deleteTab3iByDocIds,docIds, gstindb);

        await save3ISummaryTxn(gstin, fp, rtnprd, gstindb);
        await save3ISummaryTxn(gstin, fp, rtnprd, gstindb, "F"); 
        db.dbCommit(gstindb)
      
       logger.log("info","End of deleteTab3iBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString()); 
       return deleteRecords || 0;
        
      } else {
        logger.log("info","End of deleteTab3iBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
        throw new Error(message = `record(s) not found for the given docId(s) ${diffRec}`);
      }
    }
    } catch (error) {
      logger.log("info","End of deleteTab3iBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      throw new Error(error);
    } finally{
      db.closeDBConn(gstindb);
    }
  };

  


/**
 * Async / await method to from DAO layer to DB call
 * 1. check if record exists in table : if yes continue the process of deleting.
 * 2. If any one of the record not found based on Item Id sent in input
 *
 * @param {*} itemIds array of Items Ids and the GSTIN as a DB name
 * @param {*} dbName
 */
async function deleteTab3iByItemIdTxn(itemIds = [], gstin, fp, taxperiod, flag, status) {
  logger.log("info","Starting deleteTab3iByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);

  try {
    gstindb.exec('BEGIN TRANSACTION;'); 
   
    let item = await db.fetchAllByIdTxn( queries.anx1Queries.itemDetails.getItemRefByItemId, itemIds, gstindb,true);
    if (item.length === 0) {
      throw new Error((message = "No Records found for delete Item"));
    }
    // fetch all items based on docRef
    let listOfItems = await db.fetchAllByIdTxn(queries.anx1Queries.itemDetails.getItemsByRefId,[item[0].ITEMREF],gstindb);

    if (listOfItems.length > 1) {
      // delete the record from item table only if it has more than one records
      let deleteRecords = await db.deleteBySqlInClauseTxn(queries.anx1Queries.itemDetails.deleteItemsByItemIds,itemIds,gstindb);

    } else if (listOfItems.length === 1) {
      throw new Error( (message = "Kindly delete the document level before deleting the last item"));
    } else {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch row from 3I table based on docRef
    let row3I = await db.fetchAllByIdTxn(anx1Queries.table3i.get3iDetailsByDocRef,[item[0].ITEMREF],gstindb);

    // Prepare object to update in table3cd after calcualtion
    let updateItem = {
      TAXVAL: row3I[0].TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3I[0].IGST - item[0].IGST || 0,
      CESS: row3I[0].CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };

    // update record DB call
    await db.updateOrDeleteTxn(
      anx1Queries.table3i.update3iDetailsByDocRef,[updateItem.TAXVAL, updateItem.IGST, updateItem.CESS, updateItem.DOCREF],gstindb
    );
    
    if(status && status === "F"){
      await db.updateOrDeleteTxn(anx1Queries.table3i.update3iFlagByDocRef, [updateItem.DOCREF], gstindb);  // to update flag as corrected
    } 

    if(flag && flag === "F"){
      await save3ISummaryTxn(gstin, fp, taxperiod,gstindb, flag);   // generate error summary on item delete 
    }

    await save3ISummaryTxn(gstin, fp, taxperiod,gstindb);
    db.dbCommit(gstindb)
    logger.log("info","Ending deleteTab3iByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    return "Item deleted successfully";

  } catch (error) {
    throw new Error(error);
  }finally{
    db.closeDBConn(gstindb)
  }
}

async function updateItemsTxn(items = [], gstindb) {
  let updatedRecordsCount = await items.map( async (item) => {
    await db.saveTxn(anx1Comm.anx1Queries.itemDetails.updateItemDetails, [
      item.hsn, item.apptaxrate, item.taxable_value,
      item.igst, item.cgst || null, item.sgst || null,
      item.cess, item.itemref, item.itemid], gstindb)
  }) 

  return updatedRecordsCount.length
}

/**
* This function will save the item level details of 3I Table in DB
* @param {*} items 
*/
function prepareItems3i(items) {
  let  insertRow =  _.reduce(items, (accumulaterRow, row) =>{
      return accumulaterRow + `,` + `( "${row.hsn}", ${row.apptaxrate},${row.taxable_value},${row.igst}, 
      ${row.cgst || null},${row.sgst || null},${row.cess}, "${row.itemref}" )` 
    },[]).substring(1)
  return insertRow ;
}

async function save3ISummaryTxn(gstin, fp, taxperiod, gstindb, flag) {
  try {
    logger.log("info", "Inside save3ISummaryTxn for  : %s, %s, %s", gstin, fp, taxperiod)
    /** Calculate Summary object */
    let summObj3I = await db.fetchByIdTxn((flag && flag == "F" ? queries.anx1Queries.errorSummary.calculate3iErrSumm : anx1Queries.table3i.calculate3iSumm), [fp, taxperiod], gstindb)
    
    /** get the count for mark for delete */
    let MarkForDeleteCount = await db.getCountTxn((flag && flag == "F" ? queries.anx1Queries.errorSummary.getYetToBeCorrectedCount3i : anx1Queries.table3i.getCountMarkForDelfor3i), [fp, taxperiod], gstindb)
    
    if(summObj3I != undefined && summObj3I != null){
    	summObj3I.cgst = 0;
    	summObj3I.sgst = 0;
      summObj3I.igst = summObj3I.igst?summObj3I.igst:0;
	    summObj3I.cess = summObj3I.cess?summObj3I.cess:0;
    }
    /** Save teh summary as per new changes done in table */
    let sumarrySaved = await save3Aor3HSummaryTxn(gstin, fp, taxperiod, MarkForDeleteCount, summObj3I, "3I", gstindb, flag)
   
    return { message: "SUCCESS", statusCd: STATUS_CD_ONE }

  } catch (error) {
    throw new Error(error)
  }
}


module.exports={
    getTab3idetails: getTab3idetails,
    get3IjSON : get3IjSON,
    saveTab3iTxn: saveTab3iTxn,
    editTab3iTxn:editTab3iTxn,
    deleteTab3iBydocidsTxn:deleteTab3iBydocidsTxn,
    deleteTab3iByItemIdTxn:deleteTab3iByItemIdTxn,
    save3ISummaryTxn :save3ISummaryTxn
}

