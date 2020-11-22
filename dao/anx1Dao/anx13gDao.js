const { anx1Queries } = require("../../db/Queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const {DB_PATH, DB_EXT } = require('../../utility/constants');
const _ = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const anx1SummaryDao = require("../../dao/anx1SummaryDao");
const anx1Const = require('../../utility/anx1Constants');
const anx1Dao = require("../../dao/anx1Dao");
const log  = require('../../utility/logger');
const logger = log.logger;

/**
 * To edit the 3g Documents and item details
 * @param {*} docObj3G 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function edit3G(docObj3G ,fullItemList , gstin, fp, taxperiod, gstindb,flag){
      
  logger.log("info","Entering anx13gDao.edit3G : %s  ::  %s", new Date().getTime(), new Date().toString());

  await db.saveRow(anx1Queries.table3g.update3g, [ 
    docObj3G.docref, docObj3G.ctin, docObj3G.legalname, docObj3G.doctyp,
    docObj3G.num, docObj3G.dt, docObj3G.doc_year, docObj3G.val, docObj3G.diff_percentage,
    docObj3G.sec7, docObj3G.pos, docObj3G.clmrfnd, docObj3G.supply_type,
    docObj3G.taxable_value, docObj3G.igst, docObj3G.cgst, docObj3G.sgst, docObj3G.cess,
    docObj3G.flag, docObj3G.status || null, null, null, null, docObj3G.docid ],
    gstindb);

  logger.log("info","Document updated successfully for DOCREF: %s", docObj3G.docref);  
          
  await anx1Dao.updateItemsBatch(fullItemList, gstindb);
  logger.log("info","Items updated successfully for DOCREF: %s", docObj3G.docref);  
    
  await anx1SummaryDao.save3GSummary(gstindb, fp, taxperiod);
  if((flag && flag == "F") || docObj3G.flag == "C"){
    await anx1SummaryDao.save3GSummaryError(gstindb, fp, taxperiod, flag, docObj3G.flag);
  }

  logger.log("info","Exiting anx13gDao.edit3G : %s  ::  %s", new Date().getTime(), new Date().toString());
  return Promise.resolve(true);

}
  
 /**
 * This function will save 3G details in DB
 * Once Data is saved in ANX1_3G, data will be stored in ITEM_DEtails and then Summary will be calculated
 * 
 * @param {*} docObj3g 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} dbConn   
 */
async function save3Gdetails(docObj3g, fullItemList, gstin, fp, taxperiod, gstindb, isImportJson) {
    
  logger.log("info","Entering anx13gDao.save3Gdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  
  await db.saveRow(anx1Queries.table3g.save, [docObj3g.docref,
              docObj3g.ctin,  docObj3g.legaltradename, docObj3g.doctyp,
              docObj3g.doc_num, docObj3g.doc_date, docObj3g.doc_year, docObj3g.doc_val,
              docObj3g.pos, docObj3g.diff_percentage, docObj3g.sec7, docObj3g.taxable_value,
              docObj3g.igst, docObj3g.cgst, docObj3g.sgst, docObj3g.cess,
              docObj3g.supply_type, docObj3g.clmrfnd, docObj3g.upload_date, docObj3g.flag,
              docObj3g.status || null, docObj3g.fp, docObj3g.taxperiod, docObj3g.errorcode || null,
              docObj3g.error_detail || null] , gstindb);

  logger.log("info","Document saved successfully for DOCREF: %s", docObj3g.docref);      
  
  await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
  logger.log("info","Items saved successfully for DOCREF: %s", docObj3g.docref);     

  if(isImportJson != undefined && isImportJson === false){
    await anx1SummaryDao.save3GSummary(gstindb, fp, taxperiod);
  }
  
  logger.log("info","Exiting anx13gDao.save3Gdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
}

//generate json for dao layer 3G

function get3GjSON(gstin, rtnprd,flag){
  return new Promise(function (resolve, reject) {
 //   console.log("Inside get3GjSON" + flag)
    let sql = anx1Queries.table3g.get3GjSON;
    if (flag == "F")
      sql = anx1Queries.table3g.get3GErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}


/**
 * This method will fetch all the 3G documents
 * This method will be called during get3G API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3GDetails(gstin, rtnprd , flag) {

    //console.log("Inside get3GDetails for :" + gstin + ", " + rtnprd);
    return new Promise(function (resolve, reject) {
    let sql = anx1Queries.table3g.getDocs;
      if(flag == "F") sql = anx1Queries.table3g.getDocsErr;
      db.fetchAllById(sql, [rtnprd], gstin)
        .then(resultSet => {
            resolve(resultSet);
        })
        .catch(err => {
          reject(err);
        });
    });
}

/**
 * To delete the 3G Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3GdocIdsDao(docIds, dbName, fp, rtnprd , flag , actionflag) {
  logger.log("info","Entering anx13gDao.delete3GdocIdsDao : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;
  try {
    
    gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');   

    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllByIdInTransaction(anx1Queries.table3g.get3gByDocIds, docIds, gstindb, true);

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
       
        logger.log("debug", "deleteItemsBydocref::3g:: %s", deleteItemsBydocref);
        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClause(anx1Queries.table3g.delete3gByDocIds,
                                        docIds, dbName, gstindb);
        if(flag && flag == "F"){ //No need to check for flag here as we are doing so in save3GSummary message itself
          await anx1SummaryDao.save3GSummaryError(gstindb, fp, rtnprd,flag,actionflag);
        }else if(flag && flag == "N"){
         // console.log("does it hit here")
          if(actionflag && actionflag == "C"){
            await anx1SummaryDao.save3GSummaryError(gstindb, fp, rtnprd,flag,actionflag);
          }
        }
        await anx1SummaryDao.save3GSummary(gstindb, fp, rtnprd);
          //await anx1SummaryDao.save3GSummary(gstindb, fp, rtnprd);
        db.commitAndCloseDBConn(gstindb);
    
        logger.log("info","Exiting delete3GdocIdsDao : %s  ::  %s", new Date().getTime(), new Date().toString()); 
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
async function delete3gByItemId(itemIds = [], dbName, fp, taxperiod , flag , status) {
//  console.log('status aya',status);
  logger.log("info","Entering anx13gDao.delete3gByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());

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
      deleteRecords = await db.deleteBySqlInClause(anx1Queries.itemDetails.deleteItemsByItemIds,
        itemIds, dbName, gstindb);
   } 
   else if (listOfItems.length === 1) {
      throw new Error((message = "Kindly delete the document level before deleting the last item"));
  } else {
    throw new Error((message = "No Records found for delete Item"));
  }

  // fetch row from 3EF table based on docRef
  let row3G = await db.fetchAllById(anx1Queries.table3g.get3gDetailsByDocRef,
    [item[0].ITEMREF], dbName);
  
  logger.log("debug", "row3G : %s", JSON.stringify(row3G));
  // Prepare object to update in table3ef after calcualtion
  let upd = {
    TAXVAL: row3G[0].TAX_VALUE - item[0].TAXVAL || 0,
    IGST: row3G[0].IGST - item[0].IGST || 0,  
    CGST: row3G[0].CGST - item[0].CGST || 0,
    SGST: row3G[0].SGST - item[0].SGST || 0,             
    CESS: row3G[0].CESS - item[0].CESS || 0,
    DOCREF: item[0].ITEMREF
  };
  
  // update record DB call
  await db.updateRow(anx1Queries.table3g.update3gDetailsByDocRef,
    [upd.TAXVAL, upd.IGST,upd.CGST,upd.SGST, upd.CESS, upd.DOCREF], gstindb);
  if(status && status === "F"){
      await db.updateRow(anx1Queries.table3g.update3gFlagByDocRef, [upd.DOCREF], gstindb);  // to update flag as corrected
  }    
  await anx1SummaryDao.save3GSummary(gstindb, fp, taxperiod);
  if(flag && flag == "F"){
    await anx1SummaryDao.save3GSummary(gstindb, fp, taxperiod, flag);
  }
  db.commitAndCloseDBConn(gstindb);

  logger.log("info","Exiting anx13gDao.delete3gByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
  return anx1Const.ITEM_DELETE_SUCCESS;

} catch (error) {
  db.rollBackAndCloseDBConn(gstindb);
  throw new Error(error);
}
};

 
  module.exports={

    edit3G : edit3G,
    get3GjSON : get3GjSON,
    save3Gdetails : save3Gdetails,
    get3GDetails : get3GDetails,
    delete3GdocIdsDao : delete3GdocIdsDao,
    delete3gByItemId : delete3gByItemId
}