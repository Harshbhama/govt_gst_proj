const {  anx1aQueries } = require("../../db/queriesanx1a");
const queries= require("../../db/queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const sqlite3 = require('sqlite3').verbose();
const { STATUS_CD_ONE , DB_PATH, DB_EXT} = require('../../utility/constants');
const _ = require("lodash");
const {save3Aor3HSummaryTxn,save3Aor3HErrorSummaryTxn} = require("../anx1SummaryDao")
const logger  = require('../../utility/logger').logger;
const anx1Comm = require("../../db/queries");


/**
 * 
 * @param {*} gstin 
 */
async function getTab3jadetails(gstin, rtnprd , flag) {
    try {
      let sql = anx1aQueries.table3ja.getAll3j
      if(flag == "F") sql =anx1aQueries.table3ja.getAll3jErr
        let rows = await db.fetchAllById(sql,[rtnprd], gstin) 
        return ( rows.length === 0 ) ? ({ message: `No document added`, gstin : gstin , statusCd: "0"}) : rows 
    } catch (err) {
        
        if (err.message.includes("no such table"))
        return({ message: `No Data found`, gstin : gstin ,
         statusCd: "0"});
      else
     return({ message: err.message, gstin : gstin ,
            statusCd: "0" });

    }
    
}


//generate json for dao layer 3J

function get3JAjSON(gstin, rtnprd,flag){
  return new Promise(function (resolve, reject) {
    logger.log("info","Inside get3JjSON : %s" , flag);
    let sql = anx1aQueries.table3ja.get3jjSON;
    if (flag == "F")
      sql = anx1aQueries.table3ja.get3JErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

/**
 * To save data into 3Jtable
 * @param {*} tab3j 
 * @param {*} items 
 * @param {*} gstin 
 */
async function saveTab3jaTxn(tab3j ,items, gstin ) {
  logger.log("info","Starting saveTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
    gstindb.exec('BEGIN TRANSACTION;'); 
     let tab3jRow = await db.saveTxn(anx1aQueries.table3ja.save3j, [
          tab3j.odocref ,
          tab3j.odoctyp ,
          tab3j.odocnum ,
          tab3j.odocdt ,
          tab3j.opcode ,
          tab3j.oyear ,
          tab3j.docref ,
          tab3j.doctyp,
          tab3j.pos , 
          tab3j.docnum,
          tab3j.pcode,
          tab3j.docdt,
          tab3j.docval,
          tab3j.year,
          tab3j.taxVal , 
          tab3j.igst , 
          tab3j.cess ,          
          tab3j.suptype , 
          tab3j.upldt,         
          tab3j.rfndelg,
          tab3j.flag ,
          tab3j.status,    
          tab3j.fp,
          tab3j.taxPeriod,
          tab3j.errcode,
          tab3j.errdetails
      ] , gstindb) 

    await db.saveTxn(anx1aQueries.itemDetails.saveItemDetailsBatch + prepareItems3j(items),[], gstindb)       
    await save3JASummaryTxn(gstin , tab3j.fp , tab3j.taxPeriod,gstindb)  

    db.dbCommit(gstindb);
      logger.log("info","Ending saveTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      return({ message: "Document added successfully", statusCd: "1",  docref: tab3j.docref })
      } catch (err) {
        //  db.closeDBConn(gstindb)
          logger.log("info","Error in  saveTab3jTxn : %s  ::  %s", new Date().toString(),err);
          if (err.message.includes("UNIQUE constraint failed"))
         throw new Error(message =  `Document already exists`);
       else
      return({ message: err.message, docref : tab3j.docref ,
             statusCd: "0" });
      }finally{
    db.closeDBConn(gstindb)
      }

}

/**
* This function will save the item level details of 3J Table in DB
* @param {*} items 
*/
function prepareItems3j(items) {
  let insertRow =  _.reduce(items, (accumulaterRow, row) =>{
    console.log("hsnnn :: " + row.hsn)
    return accumulaterRow + `,` + `( "${row.hsn}", ${row.apptaxrate},${row.taxable_value},${row.igst}, 
    ${row.cgst || null},${row.sgst || null},${row.cess}, "${row.itemref}" )` 
  },[]).substring(1)
  return insertRow ;
}

async function save3JASummaryTxn(gstin, fp, taxperiod, gstindb){
  try {
    logger.log("info","Inside save3JASummaryTxn : %s  ::  %s",gstin,fp);
    /** Calculate Summary object */
    let summObj3J = await db.fetchByIdTxn(anx1aQueries.table3ja.calculate3jSumm, [fp, taxperiod], gstindb)
    
    /** get the count for mark for delete */
    let MarkForDeleteCount = await db.getCountTxn(anx1aQueries.table3ja.getCountMarkForDelfor3j, [fp, taxperiod], gstindb)
    
    if(summObj3J != undefined && summObj3J != null) {
    	  summObj3J.cgst = 0;
	      summObj3J.sgst = 0;
	      summObj3J.igst = summObj3J.igst?summObj3J.igst:0;
	      summObj3J.cess = summObj3J.cess?summObj3J.cess:0;
    }
    /** Save the summary as per new changes done in table */
    await save3Aor3HSummaryTxn(gstin, fp, taxperiod, MarkForDeleteCount, summObj3J, "3JA", gstindb)
   
    return { message: "SUCCESS", statusCd: STATUS_CD_ONE }

  } catch (error) {
    throw new Error(error);
  }
}
//for Error Summary
async function save3JAErrorSummaryTxn(gstin, fp, taxperiod, gstindb,flag,actionFlag){
  try {
    logger.log("info","Inside save3JASummaryTxn : %s  ::  %s",gstin,fp,actionFlag);
    /** Calculate Summary object */
    if(flag && flag =="N"){ 
      if(actionFlag && actionFlag =="C"){
        var summObj3J = await db.fetchByIdTxn(anx1aQueries.table3ja.calculate3jErrSumm, [fp, taxperiod], gstindb)
      }
  }
  else if(flag && (flag == "F")){
    var summObj3J = await db.fetchByIdTxn(anx1aQueries.table3ja.calculate3jErrSumm, [fp, taxperiod], gstindb)
  }
    
  if(flag && flag =="N"){ 
    if(actionFlag && actionFlag =="C"){
        /** get the count for yet to correct  */
      var MarkForDeleteCount = await db.getCountTxn(anx1aQueries.table3ja.getCountYetToCorrectfor3j, [fp, taxperiod], gstindb)
    } else {
      var MarkForDeleteCount = await db.getCountTxn(anx1aQueries.table3ja.getCountMarkForDelfor3j, [fp, taxperiod], gstindb);
    } 
}
else if(flag && (flag == "F")){
   /** get the count for yet to correct  */
  var MarkForDeleteCount = await db.getCountTxn(anx1aQueries.table3ja.getCountYetToCorrectfor3j, [fp, taxperiod], gstindb)
}
    if(summObj3J != undefined && summObj3J != null) {
    	summObj3J.cgst = 0;
	summObj3J.sgst = 0;
	summObj3J.igst = summObj3J.igst?summObj3J.igst:0;
	summObj3J.cess = summObj3J.cess?summObj3J.cess:0;
    }
        /** Save the summary as per new changes done in table */
    let sumarrySaved = await save3Aor3HErrorSummaryTxn(gstin, fp, taxperiod, MarkForDeleteCount, summObj3J, "3JA", gstindb,flag,actionFlag)
   
    return { message: "SUCCESS", statusCd: STATUS_CD_ONE }

  } catch (error) {
    throw new Error(error);
  }
}
/**
 * 
 * @param {*} tab3j 
 * @param {*} items 
 * @param {*} gstin 
 * to edit data into table 3J
 */
async function editTab3jaTxn(tab3j ,items, gstin,flag,actionFlag) {
  logger.log("info","Starting editTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let docref  = tab3j.docref;
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
    
      gstindb.exec('BEGIN TRANSACTION;'); 
      let insertItems = [];
      let updateItems = [];

      items.forEach((item) => ( _.isUndefined(item.itemid) ? insertItems : updateItems).push(item));

       await db.saveTxn(anx1aQueries.table3ja.update3j , [
        tab3j.odocref ,
        tab3j.odoctyp ,
        tab3j.odocnum ,
        tab3j.odocdt ,
        tab3j.opcode ,
        tab3j.oyear ,
        tab3j.docref ,
        tab3j.doctyp,
        tab3j.pos , 
        tab3j.docnum,
        tab3j.pcode,
        tab3j.docdt,
        tab3j.docval,
        tab3j.year,
        tab3j.taxVal , 
        tab3j.igst , 
        tab3j.cess ,          
        tab3j.suptype ,      
        tab3j.rfndelg,
        tab3j.flag ,
        tab3j.status,
        null,
        tab3j.errcd || null,
        tab3j.errmsg || null,    
        tab3j.docid
        ] , gstindb)
           /** update Item details */
     let updateRecordCount = await updateItemsTxn(updateItems, gstindb) || 0
      /** Insert the new Items provided as input */

      let insertRecordCount = 0
      if(insertItems.length > 0)
     
      insertRecordCount = await db.saveTxn(anx1aQueries.itemDetails.saveItemDetailsBatch + prepareItems3j(insertItems),[], gstindb)  
      if(items.length !== (insertRecordCount + updateRecordCount)) { 
        throw new Error(message = "Error in updating Item Details") 
      } 
  
     await save3JASummaryTxn(gstin , tab3j.fp , tab3j.taxPeriod,gstindb)
     if(flag &&  (flag=="F" || flag == "N")){
       if(actionFlag && actionFlag!=="E"){
        await save3JAErrorSummaryTxn(gstin , tab3j.fp , tab3j.taxPeriod,gstindb,flag,actionFlag)
       }
     }  
     db.dbCommit(gstindb)
     logger.log("info","Ending editTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
     return { message: "Document updated successfully", statusCd: STATUS_CD_ONE}
     
      } 
      catch (err) {
        logger.log("info","Error editTab3jTxn : %s  ::  %s",new Date().toString(),err);
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


async function updateItemsTxn(items = [], gstindb) {
  let updatedRecordsCount = await items.map( async (item) => {
    await db.saveTxn(anx1aQueries.itemDetails.updateItemDetails, [
      item.hsn, item.apptaxrate, item.taxable_value,
      item.igst, item.cgst || null, item.sgst || null,
      item.cess, item.itemref, item.itemid], gstindb)
  }) 

  return updatedRecordsCount.length
}


/**
 * To delete the 3j Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function deleteTab3jaBydocidsTxn(docIds, gstin, fp, rtnprd , flag , actionFlag) {
  logger.log("info","Starting deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    try {
    
    gstindb.exec('BEGIN TRANSACTION;');   

    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllByIdInTransaction(anx1aQueries.table3ja.getTab3jByDocIds, docIds, gstindb, true);

    if (docIdsResult.length === 0) {
      logger.log("info","End of deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      throw new Error(message = `No Document(s) found to delete`);
    } 
    else {
      logger.log("debug", "docIds : %s", JSON.stringify(docIdsResult));

      // input docIds and Db output docIdsResult are being compared to check all records are found in DB 
      //if any differnce found error will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docid"), _.isEqual);

      if (diffRec.length === 0) {
        // Delete the items for the corresponding docrefs
        let deleteItemsBydocref = await db.deleteBySqlInClauseTxn(anx1aQueries.itemDetails.deleteItemsByitemRef,_.map(docIdsResult, "docref"), gstindb);
      
        logger.log("debug", "deleteItemsBydocref : %s", deleteItemsBydocref);
        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClauseTxn(anx1aQueries.table3ja.deleteTab3jByDocIds,docIds, gstindb);

        await save3JASummaryTxn(gstin, fp, rtnprd,gstindb);
        if(flag && (flag=="F" || flag == "N")){
          if(actionFlag && (actionFlag!=="E" && actionFlag!=="N")){
            await save3JAErrorSummaryTxn(gstin, fp, rtnprd,gstindb,flag,actionFlag);
          }
        }
        db.dbCommit(gstindb)
      
       logger.log("info","End of deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString()); 
       return deleteRecords || 0;
        
      } else {
        logger.log("info","End of deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
        throw new Error(message = `record(s) not found for the given docId(s) ${diffRec}`);
      }
    }
    } catch (error) {
      logger.log("info","End of deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      throw new Error(error);
    }finally{
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
async function deleteTab3jaByItemIdTxn(itemIds = [], gstin, fp, taxperiod,flag,status) {
  logger.log("info","Starting deleteTab3jByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
    gstindb.exec('BEGIN TRANSACTION;'); 
   
    let item = await db.fetchAllByIdTxn( anx1aQueries.itemDetails.getItemRefByItemId, itemIds, gstindb,true);
    if (item.length === 0) {
      throw new Error((message = "No Records found for delete Item"));
    }
    // fetch all items based on docRef
    let listOfItems = await db.fetchAllByIdTxn(anx1aQueries.itemDetails.getItemsByRefId,[item[0].ITEMREF],gstindb);

    if (listOfItems.length > 1) {
      // delete the record from item table only if it has more than one records
      let deleteRecords = await db.deleteBySqlInClauseTxn(anx1aQueries.itemDetails.deleteItemsByItemIds,itemIds,gstindb);

    } else if (listOfItems.length === 1) {
      throw new Error( (message = "Kindly delete the document level before deleting the last item"));
    } else {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch row from 3j table based on docRef
    let row3j = await db.fetchAllByIdTxn(anx1aQueries.table3ja.get3jDetailsByDocRef,[item[0].ITEMREF],gstindb);

    // Prepare object to update in table3cd after calcualtion
    let updateItem = {
      TAXVAL: row3j[0].TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3j[0].IGST - item[0].IGST || 0,
      CESS: row3j[0].CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };

    // update record DB call
    let recordsUpdated = await db.updateOrDeleteTxn(
      anx1aQueries.table3ja.update3jDetailsByDocRef,[updateItem.TAXVAL, updateItem.IGST, updateItem.CESS, updateItem.DOCREF],gstindb
    );
    if(status && status=="F"){
       await db.updateOrDeleteTxn(anx1aQueries.table3ja.update3jFlagByDocRef,[updateItem.DOCREF],gstindb);
    }
    if(flag && (flag=="F")){
      await save3JAErrorSummaryTxn(gstin, fp, taxperiod,gstindb,flag);
    }
    await save3JASummaryTxn(gstin, fp, taxperiod,gstindb);
    db.dbCommit(gstindb)
    logger.log("info","Ending deleteTab3jByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    return "Item deleted successfully";

  } catch (error) {
    throw new Error(error);
  }finally{
    db.closeDBConn(gstindb)
  }
}
  

module.exports={
    getTab3jadetails:getTab3jadetails,
    get3JAjSON : get3JAjSON,
    saveTab3jaTxn:saveTab3jaTxn,
    editTab3jaTxn:editTab3jaTxn,
    deleteTab3jaBydocidsTxn:deleteTab3jaBydocidsTxn,
    deleteTab3jaByItemIdTxn:deleteTab3jaByItemIdTxn,
    save3JASummaryTxn :save3JASummaryTxn
}

