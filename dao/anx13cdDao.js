const { anx1Queries, summary3cdInTxn } = require("../db/Queries");
const db = require("../db/dbUtil");
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH, DB_EXT} = require('../utility/constants');
const { ProfileConstants } = require("../utility/errorconstants");
const Promise = require("bluebird");
const {saveItemDetails3H , updateItemDetails, updateItemDetails3H} = require('../dao/anx1Dao')
const _ = require("lodash");
const {save3CDSummary,save3CDSummaryTxn} = require('../dao/anx1SummaryDao');
const {sendResponse} = require('../utility/common');
const logger = require('../utility/logger').logger;


function save3cd(headerList ,fullItemList , gstin){
    return new Promise((resolve, reject) => {
        let docref  = headerList.docref;
        db.save(
          anx1Queries.table3cd.save3cd,
          [ headerList.doctyp,
            gstin,
            headerList.docref,
            headerList.num,
            headerList.dt,
            headerList.val,
            headerList.year,
            headerList.exptype,
            headerList.sbnum,
            headerList.sbdt,
            headerList.sbpcode,
            headerList.taxable_value,
            headerList.igst,
            headerList.cess,
            headerList.suptype,
            headerList.upldt || null,
            headerList.flag,
            headerList.status || null,
            headerList.fp,
            headerList.taxperiod,
            headerList.errorcode || "NA",
            headerList.error_detail || "NA"
          ],
          gstin
        ).then(result => { 
          return saveItemDetails3H(fullItemList , gstin) ;
        })  .then((response) => {
          return save3CDSummary(gstin, headerList.fp, headerList.taxperiod , headerList.exptype , headerList.doctyp);
        }).then((response) => {
          resolve({ message: "Document added successfully", docref : docref ,statusCd: "1"})
        })
        .catch(err => {
          if (err.message.includes("UNIQUE constraint failed"))
             return reject({ message: `Document already exists`, docref : docref ,
             statusCd: "0"});
          else
             return reject({ message: err.message, docref : docref ,
                statusCd: "0" });
        });
      }).then((result) => {
          return result;
      })
    }

      
    async function edit3cd(headerList ,fullItemList , gstin , fp , taxperiod) {
      let docref  = headerList.docref;
      try {
        
        let update3cd = await db.update(
          anx1Queries.table3cd.update3cd,
          [ 
            headerList.doctyp,
            headerList.docref,
            headerList.num,
            headerList.dt,
            headerList.val,
            headerList.year,
            headerList.exptype,
            headerList.sbnum,
            headerList.sbdt,
            headerList.sbpcode,
            headerList.taxable_value,
            headerList.igst,
            headerList.cess,
            headerList.flag,
            headerList.status || null,
            "",
            null,
            null,
            headerList.docid
          ],
          gstin)
          logger.log("info","Row edited succssfully");
            // Inserted the new records : method name is wrong

           let insertItems =  fullItemList.filter( item => item.itemid === undefined) 
           let updateItems =  fullItemList.filter( item => item.itemid !== undefined) 

            let insertItemsDetails = await saveItemDetails3H(insertItems , gstin)  // saveItemDetails3H
            let updateItemsDetails = await updateItemDetails(updateItems , gstin)  
  
            if(updateItemsDetails || insertItemsDetails){
             if(headerList.oldexptyp !== headerList.exptype){
               logger.log("info","change in exportype");
               let summaryForChangeInExportType =  
               await save3CDSummary(gstin,fp,taxperiod,headerList.oldexptyp,headerList.doctyp);
                  }
             if(headerList.olddoctyp !== headerList.doctyp){
              logger.log("info","change in doctype");
               let summaryForChangeInDocType = await save3CDSummary(gstin,fp,taxperiod,headerList.exptype,headerList.olddoctyp);
                 } 
             if((headerList.olddoctyp !== headerList.doctyp) && (headerList.oldexptyp !== headerList.exptype)){
                 logger.log("info","change in doctype and export type");
             let summaryForChangeInBoth = await save3CDSummary(gstin,fp,taxperiod,headerList.oldexptyp,headerList.olddoctyp);
                 }  
             let summary = await   save3CDSummary(gstin,fp,taxperiod,headerList.exptype,headerList.doctyp);
             return ({ message: "Document updated successfully", statusCd: "1" , docref: docref})
             
            }
          return ({ message: `Document already exists`, statusCd: "0" , docref: docref })
      }
    
      catch (err) {
        throw err;
       
    }
    
  
   }
  

   async function edit3cdTxn(edit3cd, items, gstin, fp, taxperiod , flag) {
    let docref  = edit3cd.docref;
    logger.log("info","Starting save3cd : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    try {
             gstindb.exec('BEGIN TRANSACTION;'); 
      
      
    let insertItems = [];
    let updateItems = [];
  
  // Segregate Insert and Update Items  based on ItemId undefined
    items.forEach((item) => ( _.isUndefined(item.itemid) ? insertItems : updateItems).push(item));

      let update3cd = await db.update(
        anx1Queries.table3cd.update3cd,
        [ 
          edit3cd.doctyp,
          edit3cd.docref,
          edit3cd.num,
          edit3cd.dt,
          edit3cd.val,
          edit3cd.year,
          edit3cd.exptype,
          edit3cd.sbnum,
          edit3cd.sbdt,
          edit3cd.sbpcode,
          edit3cd.taxable_value,
          edit3cd.igst,
          edit3cd.cess,
          edit3cd.flag,
          edit3cd.status || null,
          null,
          null,
          null,
          edit3cd.docid
        ],
        gstin)
        
        let updateRecordCount = await updateItemsTxn(updateItems, gstindb) || 0
        /** Insert the new Items provided as input */
  
        let insertRecordCount = 0
        if(insertItems.length > 0)
        insertRecordCount = await db.saveTxn(anx1Queries.itemDetails.saveItemDetailsBatch + prepareItems3cd(insertItems),[], gstindb)  
    
        if(items.length !== (insertRecordCount + updateRecordCount)) { 
          throw new Error(message = "Error in updating Item Details") 
        }         
           let summary = await summary3cdTxn(fp,taxperiod,gstindb);
           if(flag && (flag=='F' || flag == 'N')){
            let summary = await summary3cdTxnError(fp,taxperiod,gstindb ,flag);
           }
          db.dbCommit(gstindb)
           return ({ message: "Document updated successfully", statusCd: "1" , docref: docref})
           
    }
  
    catch (err) {
      throw new Error(message = err.message);
     
  }finally{
    db.closeDBConn(gstindb)
  }
  

 }
  
async function get3CDDetailsDao(rtnprd, dbName, flag) {
  // try catch block to handle error scenario
  try {
    /* DB call to check number of items available for the given itemids
    slight modification to the fetchAllById method which passing a last argumrnt
    */
   let sql = anx1Queries.table3cd.get3cdByReturnPeriod
   if(flag == "F") sql  = anx1Queries.table3cd.get3cdByReturnPeriodErr
    let get3cdDetails = await db.fetchAllById(
      sql,
      rtnprd,
      dbName
    );

    if(get3cdDetails.length === 0){
      throw new Error((message = "No Records found"));
    }
    return get3cdDetails   
  } catch (error) {
    throw new Error(error);
  }
};


/**
 * Common header pameters for utlizing in function
 * @param {*} req 
 */
function itemsArray(itemsArray) {
  
  new Promise ((resolve, reject) =>{
    let itemsArr = []
  
    itemsArray.itemDetails.map((item) =>{
    let items = {
      itemref: ITEMREF,
      itemid: item.ITEM_ID, 
      hsn: item.HSN,
      taxval: item.TAXVAL,
      rate: item.TAXRATE,
      igst: item.IGST,
      sgst: item.SGST,
      cgst: item.CGST,
      cess: item.CESS
    };
    return itemsArr.push(items);
   })
   resolve(itemsArr)
  })
  
  // return Promise.resolve(itemsArr)
}



// Deleteall 3hdetails
async function delete3cdBydocIds(docIds, dbName, fp, rtnprd) {
  try {
    
    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllById(
      anx1Queries.table3cd.get3cdByDocIds,
      docIds,
      dbName,
      true
    );

    if (docIdsResult.length === 0) {
      throw new Error(
        message = `No records found to delete`
      );
    } else {
     
      let exptypList =[];
      let doctypList =[];
      for(i=0 ; i<docIdsResult.length ; i++){
      let exptyp = _.map(docIdsResult, "EXPORT_TYPE")[i]
      let doctyp = _.map(docIdsResult, "DOC_TYPE")[i]
      exptypList.push(exptyp);
      doctypList.push(doctyp); 
      }
     

      // input docIds and Db output docIdsResult are being compared to check all records are found in DB if any differnce found error 
      // will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);

      if (diffRec.length === 0) {
         
          // Delete the items for the corresponding docrefs
        let deleteItemsBydocref = await db.deleteBySqlInClause(
          anx1Queries.itemDetails.deleteItemsByitemRef,
          _.map(docIdsResult, "DOCREF"),
          dbName
        );
      
     
        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClause(
          anx1Queries.table3cd.delete3cdByDocIds,
          docIds,
          dbName
        );
        
          for(i=0;i<exptypList.length ; i++){
            await save3CDSummary(dbName, fp, rtnprd , exptypList[i], doctypList[i]);
          } 
        
        return deleteRecords || 0;
        
      } else {
        throw new Error(
          message = `record(s) not found for the given docId(s) ${diffRec}`
        );
      }
    }
  } catch (error) {
    throw new Error(error);
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
async function delete3cdItemsByItemId(itemIds = [], dbName, fp, taxperiod) {
  // try catch block to handle error scenario
  try {
    /* DB call to check number of items available for the given itemids
    slight modification to the fetchAllById method which passing a last argumrnt
    */
   let exptyp;
   let doctyp;
   let deleteRecords = 0
    let item = await db.fetchAllById(
      anx1Queries.itemDetails.getItemRefByItemId,
      itemIds,
      dbName,
      true
    );

    if(item.length === 0){
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch all items based on docRef
    let listOfItems = await db.fetchAllById(
      anx1Queries.itemDetails.getItemsByRefId,
      [item[0].ITEMREF],
      dbName
    );

    if (listOfItems.length > 1) {

      // delete the record from item table only if it has more than one records
      deleteRecords = await db.deleteBySqlInClause(
        anx1Queries.itemDetails.deleteItemsByItemIds,
        itemIds,
        dbName 
      );

    } else if (listOfItems.length === 1) {
      
      throw new Error(
        (message =
          "Kindly delete the document level before deleting the last item")
      );

    } else {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch row from 3CD table based on docRef
    let row3CD = await db.fetchAllById(
      anx1Queries.table3cd.get3cdDetailsByDocRef,
      [item[0].ITEMREF],
      dbName
    );
    
    // Prepare object to update in table3cd after calcualtion
    let u = {
      TAXVAL: row3CD[0].TOTAL_TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3CD[0].TOTAL_IGST - item[0].IGST || 0,     
      CESS: row3CD[0].TOTAL_CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };
   
    // update record DB call
    let recordsUpdated = await db.update(
      anx1Queries.table3cd.update3cdDetailsByDocRef,
      [u.TAXVAL, u.IGST, u.CESS, u.DOCREF],
      dbName
    );
    
  db.fetchById(anx1Queries.table3cd.get3cdDetailsByDocRef , [u.DOCREF] , dbName)
  .then(data =>{
   
   
    exptyp = data.EXPORT_TYPE
    doctyp = data.DOC_TYPE
     return save3CDSummary(dbName, fp, taxperiod , exptyp , doctyp);
  })
 

    return "Item deleted successfully";

  } catch (error) {
    throw new Error(error);
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
async function delete3cdItemsByItemIdTxn(itemIds = [], gstin, fp, taxperiod , flag , status) {
  logger.log("info", "Starting delete3cdItemsByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
    gstindb.exec('BEGIN TRANSACTION;');

    let item = await db.fetchAllByIdTxn(anx1Queries.itemDetails.getItemRefByItemId, itemIds, gstindb, true);

    if (item.length === 0) {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch all items based on docRef
    let listOfItems = await db.fetchAllByIdTxn(anx1Queries.itemDetails.getItemsByRefId, [item[0].ITEMREF], gstindb);

    if (listOfItems.length > 1) {
      // delete the record from item table only if it has more than one records
      deleteRecords = await db.deleteBySqlInClauseTxn( anx1Queries.itemDetails.deleteItemsByItemIds,
        itemIds,gstindb);

    } else if (listOfItems.length === 1) {

      throw new Error(
        (message =
          "Kindly delete the document level before deleting the last item")
      );

    } else {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch row from 3CD table based on docRef
    let row3CD = await db.fetchAllByIdTxn(anx1Queries.table3cd.get3cdDetailsByDocRef, [item[0].ITEMREF], gstindb);

    // Prepare object to update in table3cd after calcualtion
    let u = {
      TAXVAL: row3CD[0].TOTAL_TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3CD[0].TOTAL_IGST - item[0].IGST || 0,
      CESS: row3CD[0].TOTAL_CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };

    // update record DB call
    let recordsUpdated = await db.updateOrDeleteTxn(anx1Queries.table3cd.update3cdDetailsByDocRef
      , [u.TAXVAL, u.IGST, u.CESS, u.DOCREF]
      , gstindb
    );
    if(status && status === "F"){
      await db.updateRow(anx1Queries.table3cd.update3cdFlagByDocRef, [u.DOCREF], gstindb);  // to update flag as corrected
    } 
    var summaryResponse = await summary3cdTxn(fp, taxperiod, gstindb);
    if(flag && (flag=="F" || flag == "N")){
      var summaryResponse = await summary3cdTxnError(fp, taxperiod, gstindb , flag); 
    }
    db.dbCommit(gstindb)
    return "Item deleted successfully";

  } catch (error) {
    throw new Error(error);
  } finally {
    db.closeDBConn(gstindb)
  }
};

function getDetailsByExportType(rtnprd ,exptyp ,gstin) {

  return new Promise(function (resolve, reject) {

    db.fetchAllById(anx1Queries.table3cd.getDetailsByExpTyp,
          [rtnprd ,  exptyp],   gstin)
      .then(resultSet => {
       
      resolve(resultSet)})
      .catch(err => {
    reject(err)});
  });
}

function get3CDjSON(rtnprd ,exptyp ,gstin,flag){
  return new Promise(function (resolve, reject) {
    logger.log("info","Inside get3CDjSON : %s" , flag);
    let sql = anx1Queries.table3cd.get3CDjSON;
    if (flag == "F")
      sql = anx1Queries.table3cd.get3cdErrJson;
    db.fetchAllById(sql, [rtnprd,exptyp], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

// with transactions


async function save3cdTxn(tab3cd ,items , gstin) {
  logger.log("info","Starting save3cd : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
           gstindb.exec('BEGIN TRANSACTION;'); 

           await db.saveTxn(anx1Queries.table3cd.save3cd,
            [ tab3cd.doctyp,
              gstin,
              tab3cd.docref,
              tab3cd.num,
              tab3cd.dt,
              tab3cd.val,
              tab3cd.year,
              tab3cd.exptype,
              tab3cd.sbnum,
              tab3cd.sbdt,
              tab3cd.sbpcode,
              tab3cd.taxable_value,
              tab3cd.igst,
              tab3cd.cess,
              tab3cd.suptype,
              tab3cd.upldt || null,
              tab3cd.flag,
              tab3cd.status || null,
              tab3cd.fp,
              tab3cd.taxperiod,
              tab3cd.errorcode || "NA",
              tab3cd.error_detail || "NA"
            ] , gstindb)
           await db.saveTxn(anx1Queries.itemDetails.saveItemDetailsBatch + prepareItems3cd(items),[], gstindb)       
           
           // await save3CDSummaryTxn(gstin, tab3cd.fp, tab3cd.taxperiod , tab3cd.exptype , tab3cd.doctyp,gstindb);
           // let markForDelete3cdCount = await db.getCountTxn(anx1Queries.summary.getCountMarkForDelfor3CD ,[tab3cd.fp , tab3cd.taxperiod , tab3cd.exptype , tab3cd.doctyp] , gstindb)
          //  let response = await db.saveTxn(summary3cdInTxn(tab3cd.taxperiod,tab3cd.fp,1),[], gstin) 
          await summary3cdTxn(tab3cd.fp, tab3cd.taxperiod, gstindb);

          db.dbCommit(gstindb)             
          logger.log("info","Ending saveTab3cd : %s  ::  %s", new Date().getTime(), new Date().toString());
          return ({ message: "Document added successfully", statusCd: "1"})   

    } catch (err) {
           logger.log("info","Error in  saveTab3cdTxn : %s  ::  %s", new Date().toString(),err);
          if (err.message.includes("UNIQUE constraint failed"))
          throw new Error(message = `Document already exists`);
       else
      throw new Error( message = err.message);
            
      } finally{
        db.closeDBConn(gstindb)
      }
    }


   
/**
* This function will save the item level details of 3J Table in DB
* @param {*} items 
*/
function prepareItems3cd(items) {
  let insertRow =  _.reduce(items, (accumulaterRow, row) =>{
    return accumulaterRow + `,` + `( "${row.hsn}", ${row.apptaxrate},${row.taxable_value},${row.igst}, 
    ${row.cgst || null},${row.sgst || null},${row.cess}, "${row.itemref}" )` 
  },[]).substring(1)
  return insertRow ;
}

async function updateItemsTxn(items = [], gstindb) {
  let updatedRecordsCount = await items.map( async (item) => {
    await db.saveTxn(anx1Queries.itemDetails.updateItemDetails, [
      item.hsn, item.apptaxrate, item.taxable_value,
      item.igst, item.cgst || null, item.sgst || null,
      item.cess, item.itemref, item.itemid], gstindb)
  }) 

  return updatedRecordsCount.length
}

async function delete3cdBydocIdsTxn(docIds, gstin, fp, rtnprd , flag , actionFlag) {
  logger.log("info","Starting save3cd : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    try {
             gstindb.exec('BEGIN TRANSACTION;'); 
    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllByIdTxn(
      anx1Queries.table3cd.get3cdByDocIds,
      docIds,
      gstindb,
      true
    );

    if (docIdsResult.length === 0) {
      throw new Error(
        message = `No records found to delete`
      );
    } else {

      // input docIds and Db output docIdsResult are being compared to check all records are found in DB if any differnce found error 
      // will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);

      if (diffRec.length === 0) {
         
          // Delete the items for the corresponding docrefs
        let deleteItemsBydocref = await db.deleteBySqlInClauseTxn(
          anx1Queries.itemDetails.deleteItemsByitemRef,
          _.map(docIdsResult, "DOCREF"),
          gstindb
        );
      
      
        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClauseTxn(
          anx1Queries.table3cd.delete3cdByDocIds,
          docIds,
          gstindb 
               );

       await summary3cdTxn(fp, rtnprd ,gstindb);
       if(flag && (flag=="F" || flag == "N")){
        await summary3cdTxnError(fp, rtnprd ,gstindb,flag,actionFlag);
       }
        db.dbCommit(gstindb)
    
        logger.log("info","Entering summary3cdTxn calculated");
        return deleteRecords || 0;
        
      } else {
        throw new Error(
          message = `record(s) not found for the given docId(s) ${diffRec}`
        )
      }
    }
  } catch (error) {
    throw new Error(error);
  }finally{
    db.closeDBConn(gstindb)
  }
}

/**
 * 3cd summary api DB calls
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function summary3cdTxn(fp, taxperiod, gstindb, isMFD = false) {
  try {
    let returnValue = 1
    await db.saveTxn(anx1Queries.summary.delete3Aor3Hsumm, [fp, taxperiod, "3CD"], gstindb);
    let mfd = await db.fetchAllByIdTxn(anx1Queries.summary.checkMarkForDelete3cd, [fp, taxperiod], gstindb)
    await db.saveTxn(anx1Queries.summary.docTypeValuesInsertionFor3cd, [fp, taxperiod], gstindb);
    if (mfd.length === 0 && isMFD) {
      returnValue
    } else {
      
      await db.saveTxn(anx1Queries.summary.tableSummarywpAndwopNet, [fp, taxperiod, fp, taxperiod], gstindb);
      await db.saveTxn(anx1Queries.summary.consolidateNetForDocTypes, [fp, taxperiod], gstindb);
      let row = await db.fetchByIdTxn(anx1Queries.table3cd.get3cdByFPAndTaxperiod, [fp, taxperiod], gstindb);
      if (row) {
        await db.saveTxn(anx1Queries.summary.consolidateNet, [fp, taxperiod, fp, taxperiod], gstindb)
      }
    }
    return returnValue
  } catch (error) {
    throw new Error(message = error.message)
  }

}
/**
 * 3cd Error summary api DB calls
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function summary3cdTxnError(fp, taxperiod, gstindb,flag,actionFlag, isMFD = false) {
  try {
    let returnValue = 1
    
    if(flag && flag =="N"){ // To update summary when corrected record is deleted in main flow
      if(actionFlag && actionFlag =="C"){
        await db.saveTxn(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3CD"], gstindb);
        var mfd = await db.fetchAllByIdTxn(anx1Queries.errorSummary.getYetToBeCorrectedCount3cd, [fp, taxperiod], gstindb)
        await db.saveTxn(anx1Queries.errorSummary.docTypeValuesInsertionFor3cd, [fp, taxperiod], gstindb);
        if (mfd.length === 0 && isMFD) {
          returnValue
        } else {
          
          await db.saveTxn(anx1Queries.errorSummary.tableSummarywpAndwopNet, [fp, taxperiod, fp, taxperiod], gstindb);
          //await db.saveTxn(anx1Queries.errorSummary.consolidateNetForDocTypes, [fp, taxperiod], gstindb);
          let row = await db.fetchByIdTxn(anx1Queries.table3cd.get3cdByFPAndTaxperiod, [fp, taxperiod], gstindb);
          if (row) {
            await db.saveTxn(anx1Queries.errorSummary.consolidateNet, [fp, taxperiod, fp, taxperiod], gstindb)
          }
        }
      }
    }
    else if(flag && flag == "F"){
      await db.saveTxn(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3CD"], gstindb);
      var mfd = await db.fetchAllByIdTxn(anx1Queries.errorSummary.getYetToBeCorrectedCount3cd, [fp, taxperiod], gstindb) 
      await db.saveTxn(anx1Queries.errorSummary.docTypeValuesInsertionFor3cd, [fp, taxperiod], gstindb);
      if (mfd.length === 0 && isMFD) {
        returnValue
      } else {
        
        await db.saveTxn(anx1Queries.errorSummary.tableSummarywpAndwopNet, [fp, taxperiod, fp, taxperiod], gstindb);
        //await db.saveTxn(anx1Queries.errorSummary.consolidateNetForDocTypes, [fp, taxperiod], gstindb);
        let row = await db.fetchByIdTxn(anx1Queries.table3cd.get3cdByFPAndTaxperiod, [fp, taxperiod], gstindb);
        if (row) {
          await db.saveTxn(anx1Queries.errorSummary.consolidateNet, [fp, taxperiod, fp, taxperiod], gstindb)
        }
      }
    }
    return returnValue
  } catch (error) {
    throw new Error(message = error.message)
  }

}
/* async function updateMarkforDeleteCount(mfd,gstindb) {
  try {
    return Promise.all( await mfd.map(async (row) => {
      logger.log("info","updateMarkforDeleteCount : %s" , JSON.stringify(row));
      let recordsUpdated = await db.updateOrDeleteTxn(anx1Queries.summary.updateMarkForDeleteFor3cd
        , [row.MFD,row.TABLE_TYP,row.DOC_TYPE,row.PAYMT_WITH_TAX,row.FP,row.TAX_PERIOD]
        , gstindb
      );
      logger.log("info","recordsUpdated");
      
      return recordsUpdated
    }))
  } catch (error) {
    throw new Error(message = error.message)
  }
  
} */
module.exports={
    save3cd : save3cd , 
    edit3cd:edit3cd,
    get3CDDetailsDao: get3CDDetailsDao,
    delete3cdBydocIds: delete3cdBydocIds,
    delete3cdItemsByItemId: delete3cdItemsByItemId,
    getDetailsByExportType : getDetailsByExportType,
    get3CDjSON : get3CDjSON,
    save3cdTxn:save3cdTxn,
    edit3cdTxn:edit3cdTxn,
    delete3cdBydocIdsTxn:delete3cdBydocIdsTxn,
    delete3cdItemsByItemIdTxn: delete3cdItemsByItemIdTxn,
    summary3cdTxn : summary3cdTxn,
    summary3cdTxnError:summary3cdTxnError
}
