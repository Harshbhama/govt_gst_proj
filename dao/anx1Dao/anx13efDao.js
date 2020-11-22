const { anx1Queries } = require("../../db/Queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const { DB_PATH, DB_EXT } = require('../../utility/constants');
const anx1SummaryDao = require("../../dao/anx1SummaryDao");
const anx1Const = require('../../utility/anx1Constants');
const anx1Dao = require("../../dao/anx1Dao");
const _ = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const log  = require('../../utility/logger');
const logger = log.logger;

/**
 * To edit the 3ef Documents and item details
 * @param {*} docObj3ef 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function edit3ef(docObj3ef ,fullItemList , gstin, fp, taxperiod, gstindb , flag , actionFlag){
      
  logger.log("info","Entering anx13efDao.edit3ef : %s  ::  %s", new Date().getTime(), new Date().toString());
  
  await db.saveRow(anx1Queries.table3ef.update3ef, [ 
    docObj3ef.docref, docObj3ef.ctin, docObj3ef.legalname, docObj3ef.doctyp,
    docObj3ef.num, docObj3ef.dt, docObj3ef.doc_year, docObj3ef.val,
    docObj3ef.diff_percentage, docObj3ef.pos, docObj3ef.payTyp, docObj3ef.clmrfnd,
    docObj3ef.taxable_value, docObj3ef.igst, docObj3ef.cess, docObj3ef.flag,
    docObj3ef.status || null, null ,docObj3ef.errcd || null, docObj3ef.errmsg || null, docObj3ef.docid],
    gstindb);

  logger.log("info","Document updated successfully for DOCREF: %s", docObj3ef.docref);  
           
  await anx1Dao.updateItemsBatch(fullItemList, gstindb);
  logger.log("info","Items updated successfully for DOCREF: %s", docObj3ef.docref);  

  await anx1SummaryDao.save3EFSummary(gstindb, fp, taxperiod);
  if(flag && (flag == "F" || flag == "N")){
    if(actionFlag && actionFlag!=="E"){
      await anx1SummaryDao.save3EFSummaryError(gstindb, fp, taxperiod,flag,actionFlag);
    }
  }

  logger.log("info","Exiting anx13efDao.edit3ef : %s  ::  %s", new Date().getTime(), new Date().toString());
  return Promise.resolve(true);
}

/**
 * To delete the 3EF Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3efdocIdsDao(docIds, dbName, fp, rtnprd , flag , actionFlag) {
  logger.log("info","Entering anx13efDao.delete3efdocIdsDao : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb; 
  try {
    
    gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');   

    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllByIdInTransaction(anx1Queries.table3ef.get3efByDocIds, docIds, gstindb, true);

    if (docIdsResult.length === 0) {
      throw new Error(message = `No Document(s) found to delete`);
    } 
    else {
      logger.log("debug", "docIds : %s", JSON.stringify(docIdsResult));

      // input docIds and Db output docIdsResult are being compared to check all records are found in DB 
      //if any differnce found error will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);

      if (diffRec.length === 0) {
        // Delete the items for the corresponding docrefs
        let deleteItemsBydocref = await db.deleteBySqlInClause(anx1Queries.itemDetails.deleteItemsByitemRef,
                                        _.map(docIdsResult, "DOCREF"), dbName, gstindb);
      
        logger.log("debug", "deleteItemsBydocrefeee : %s", deleteItemsBydocref);
        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClause(anx1Queries.table3ef.delete3efByDocIds,
                                        docIds, dbName, gstindb);

        await anx1SummaryDao.save3EFSummary(gstindb, fp, rtnprd);
        if(flag && (flag=="F" || flag=="N")){
          await anx1SummaryDao.save3EFSummaryError(gstindb, fp, rtnprd,flag , actionFlag);
        }
        db.commitAndCloseDBConn(gstindb);
              
       logger.log("info","Exiting delete3efdocIdsDao : %s  ::  %s", new Date().getTime(), new Date().toString()); 
       return deleteRecords || 0;
        
      } else {
        throw new Error(message = `record(s) not found for the given docId(s) ${diffRec}`);
      }
    }
    } catch (error) {
      db.rollBackAndCloseDBConn(gstindb);
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
async function delete3efItemsByItemId(itemIds = [], dbName, fp, taxperiod , flag , status) {
    logger.log("info","Entering anx13efDao.delete3efItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;

    try {
      /* DB call to check number of items available for the given itemids
      slight modification to the fetchAllById method which passing a last argumrnt
      */
     gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
     gstindb.exec('BEGIN TRANSACTION;');

    let item = await db.fetchAllByIdInTransaction(anx1Queries.itemDetails.getItemRefByItemId,
        itemIds, gstindb, true);

      if(item.length === 0){
        throw new Error((message = "No Records found for delete Item"));
      }
  
      // fetch all items based on docRef
      let listOfItems = await db.fetchAllByIdInTransaction(anx1Queries.itemDetails.getItemsByRefId,
        [item[0].ITEMREF], gstindb);
  
      if (listOfItems.length > 1) {
  
        // delete the record from item table only if it has more than one records
        await db.deleteBySqlInClause(anx1Queries.itemDetails.deleteItemsByItemIds,
          itemIds, dbName, gstindb);
     } 
     else if (listOfItems.length === 1) {
       throw new Error((message = "Kindly delete the document level before deleting the last item"));

    } else {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch row from 3EF table based on docRef
    let row3EF = await db.fetchAllByIdInTransaction(anx1Queries.table3ef.get3efDetailsByDocRef,
      [item[0].ITEMREF], gstindb);
    
    logger.log("debug", "row3EF : %s", JSON.stringify(row3EF));
    // Prepare object to update in table3ef after calcualtion
    let upd = {
      TAXVAL: row3EF[0].TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3EF[0].IGST - item[0].IGST || 0,     
      CESS: row3EF[0].CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };
    
    // update record DB call
    await db.updateRow(anx1Queries.table3ef.update3efDetailsByDocRef,
      [upd.TAXVAL, upd.IGST, upd.CESS, upd.DOCREF], gstindb);    
   if(status && status=="F"){
    await db.updateRow(anx1Queries.table3ef.update3efFlagByDocRef,
      [upd.DOCREF], gstindb);
   }
   if(flag && (flag=="F" || flag == "N")){
    await anx1SummaryDao.save3EFSummaryError(gstindb, fp, taxperiod,flag);
    }
    await anx1SummaryDao.save3EFSummary(gstindb, fp, taxperiod);
    
    db.commitAndCloseDBConn(gstindb);

    logger.log("info","Exiting anx13efDao.delete3efItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
    return anx1Const.ITEM_DELETE_SUCCESS;

  } catch (error) {
    db.rollBackAndCloseDBConn(gstindb);
    throw new Error(error);
  }
};



/**
 * This function will save 3EF details in DB
 * Once Data is saved in ANX1_3EF, data will be stored in ITEM_DEtails and then Summary will be calculated
 * @param {*} docObj3ef 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb  - This parameter will be passed from import json save functionality 
 */
async function save3EFdetails(docObj3ef, fullItemList, fp, taxperiod, gstindb, isImportJson) {
  
  logger.log("info","Entering anx13efDao.save3EFdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  
  await db.saveRow(anx1Queries.table3ef.save, [
    docObj3ef.docref, docObj3ef.ctin, docObj3ef.legaltradename,
    docObj3ef.doctyp, docObj3ef.doc_num, docObj3ef.doc_date, docObj3ef.doc_year, docObj3ef.doc_val,
    docObj3ef.pos, docObj3ef.diff_percentage, docObj3ef.taxable_value, docObj3ef.igst, docObj3ef.cess,
    docObj3ef.supply_type, docObj3ef.payTyp, docObj3ef.clmrfnd, docObj3ef.upload_date, docObj3ef.flag,
    docObj3ef.status || null, docObj3ef.fp, docObj3ef.taxperiod, docObj3ef.errorcode , docObj3ef.error_detail
  ], gstindb);

  logger.log("info","Document saved successfully for DOCREF: %s", docObj3ef.docref);            
  
  await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
  logger.log("info","Items saved successfully for DOCREF: %s", docObj3ef.docref);     
    
  if(isImportJson != undefined && isImportJson === false){
    await anx1SummaryDao.save3EFSummary(gstindb, fp, taxperiod);
  }
  
  logger.log("info","Exiting anx13efDao.save3EFdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  return Promise.resolve(true);
}

/**
 * This function will save 3EFA details in DB
 * Once Data is saved in ANX1_3EFA, data will be stored in ITEM_DEtails and then Summary will be calculated
 * @param {*} docObj3ef 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb  - This parameter will be passed from import json save functionality 
 */
async function save3EFAdetails(docObj3ef, fullItemList, fp, taxperiod, gstindb, isImportJson) {
 // console.log("hii");
  logger.log("info","Entering anx13efDao.save3EFAdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  //removed  docObj3ef.rev_docref
  await db.saveRow(anx1Queries.tableSEZA.save, [
    docObj3ef.docref, docObj3ef.ctin, docObj3ef.legaltradename, docObj3ef.doctyp, docObj3ef.doc_num, docObj3ef.doc_date, 
    docObj3ef.doc_year, docObj3ef.rev_ctin, docObj3ef.rev_legaltradename,
    docObj3ef.rev_doctyp, docObj3ef.rev_doc_num, docObj3ef.rev_doc_date, docObj3ef.rev_doc_year,docObj3ef.rev_doc_val,
    docObj3ef.pos, docObj3ef.rev_diff_percentage, docObj3ef.rev_taxable_value, docObj3ef.igst, docObj3ef.cess,
    docObj3ef.rev_supply_type, docObj3ef.payTyp, docObj3ef.clmrfnd, docObj3ef.upload_date, docObj3ef.flag,
    docObj3ef.status || null, docObj3ef.fp, docObj3ef.taxperiod, docObj3ef.errorcode , docObj3ef.error_detail
  ], gstindb);



  logger.log("info","Document saved successfully for DOCREF: %s", docObj3ef.docref);            
  
  await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
  logger.log("info","Items saved successfully for DOCREF: %s", docObj3ef.docref);     
    
  if(isImportJson != undefined && isImportJson === false){
    await anx1SummaryDao.save3EFSummary(gstindb, fp, taxperiod);
  }
  
  logger.log("info","Exiting anx13efDao.save3EFAdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  return Promise.resolve(true);
}

/**
 * This method will fetch all the 3EF documents
 * This method will be called during get3EF API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3efDetails(gstin, rtnprd , flag) {

    logger.log("info","Entering get3efDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    return new Promise(function (resolve, reject) {
      let sql = anx1Queries.table3ef.getDocs
      if(flag == "F") 
      sql = anx1Queries.table3ef.getDocsErr;
      db.fetchAllById(sql , [rtnprd], gstin)
        .then(resultSet => {
            logger.log("info","Exiting get3efDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
            resolve(resultSet);
        })
        .catch(err => {
          reject(err);
        });
    });
}

//generate json for dao layer 3EF


function get3EFjSON(rtnprd ,type ,gstin,flag){
  logger.log("info","Entering get3EFjSON : %s  ::  %s", new Date().getTime(), new Date().toString());
  logger.log("debug", "Inside get3EFjSON for :%s, %s" , gstin, rtnprd);
  return new Promise(function (resolve, reject) {
    //console.log("Inside get3EFjSON:" + flag)
    let sql = anx1Queries.table3ef.get3EFjSON;
    if (flag == "F")
      sql = anx1Queries.table3ef.get3EFErrJson;
    db.fetchAllById(sql, [rtnprd,type], gstin)
      .then(resultSet => { 
        logger.log("info","Exiting get3EFjSON : %s  ::  %s", new Date().getTime(), new Date().toString());
        resolve(resultSet)
      })
      .catch(err => reject(err));
  })
}

  module.exports={

    edit3ef : edit3ef,
    delete3efdocIdsDao : delete3efdocIdsDao,
    delete3efItemsByItemId : delete3efItemsByItemId,
    save3EFdetails: save3EFdetails,
    get3efDetails : get3efDetails,
    get3EFjSON : get3EFjSON,
    save3EFAdetails:save3EFAdetails

  }