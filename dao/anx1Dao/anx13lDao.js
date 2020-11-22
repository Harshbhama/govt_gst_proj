const { anx1Queries } = require("../../db/Queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const { DB_PATH, DB_EXT } = require('../../utility/constants');
const anx1SummaryDao = require("../../dao/anx1SummaryDao");
const anx1Const = require('../../utility/anx1Constants');
const anx1Dao = require("../../dao/anx1Dao");
const _ = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const log = require('../../utility/logger');
const logger = log.logger;
var tab3lDao = {};


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
tab3lDao.save3Ldetails = async function (docObj3l, fullItemList, fp, taxperiod, gstindb, isImportJson) {

    logger.log("info", "Entering anx13lDao.save3Ldetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    await db.saveRow(anx1Queries.table3l.save, [
        docObj3l.tableTyp,
        docObj3l.docref,
        docObj3l.ctin,
        docObj3l.legaltradename,
        docObj3l.doctyp,
        docObj3l.doc_num,
        docObj3l.doc_date,
        docObj3l.doc_year,
        docObj3l.doc_val,
        docObj3l.pos,
        docObj3l.diff_percentage,
        docObj3l.sec7act,
        docObj3l.taxable_value,
        docObj3l.igst,
        docObj3l.cgst,
        docObj3l.sgst,
        docObj3l.cess,
        docObj3l.supply_type,
        docObj3l.clmrfnd,
        docObj3l.upload_date,
        docObj3l.flag,
        docObj3l.status || null,
        docObj3l.fp,
        docObj3l.taxperiod,
        docObj3l.errorcode,
        docObj3l.error_detail
    ], gstindb);

   
    logger.log("info", "Document saved successfully for DOCREF: %s", docObj3l.docref);

    await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
    logger.log("info", "Items saved successfully for DOCREF: %s", docObj3l.docref);

    if(isImportJson != undefined && isImportJson === false){
      await anx1SummaryDao.save3BSummary(gstindb, fp, taxperiod,docObj3l.ctin, docObj3l.doctyp, gstindb,'3L');
    }

    logger.log("info", "Exiting anx13lDao.save3Ldetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);


}


/**
 * This method will fetch all the 3G documents
 * This method will be called during get3G API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
tab3lDao.get3LDetails = async function (gstin, rtnprd , flag) {

    console.log("Inside get3LDetails for :" + gstin + ", " + rtnprd);
    return new Promise(function (resolve, reject) {
    let sql = anx1Queries.table3l.getDocs;
      if(flag == "F") sql = anx1Queries.table3l.getDocsErr;
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
   * Async / await method to from DAO layer to DB call
   * 1. check if record exists in table : if yes continue the process of deleting.
   * 2. If any one of the record not found based on Item Id sent in input
   *
   * @param {*} itemIds array of Items Ids and the GSTIN as a DB name
   * @param {*} dbName
   */
  tab3lDao.delete3lByItemId = async function (itemIds = [], dbName, fp, taxperiod) {
    logger.log("info","Entering anx13lDao.delete3lByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
  
    let gstindb;
  
    try {
      /* DB call to check number of items available for the given itemids
      slight modification to the fetchAllById method which passing a last argumrnt
      */
     gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
     gstindb.exec('BEGIN TRANSACTION;'); 
  
      let item = await db.fetchAllByIdInTransaction(anx1Queries.itemDetails.getItemRefByItemId,
        itemIds, gstindb, true);
        console.log("1st::",item)
       if(item.length === 0){
        throw new Error((message = "No Records found for delete Item"));
      }
  
      // fetch all items based on docRef
      let listOfItems = await db.fetchAllByIdInTransaction(anx1Queries.itemDetails.getItemsByRefId,
        [item[0].ITEMREF], gstindb);
        console.log("2st::",listOfItems)
      if (listOfItems.length > 1) {
  
        // delete the record from item table only if it has more than one records
        deleteRecords = await db.deleteBySqlInClause(anx1Queries.itemDetails.deleteItemsByItemIds,
          itemIds, dbName, gstindb);
          console.log("3rd::",deleteRecords)
     } 
    
     else if (listOfItems.length === 1) {
        throw new Error((message = "Kindly delete the document level before deleting the last item"));
    } else {
      throw new Error((message = "No Records found for delete Item"));
    }
  
    // fetch row from 3EF table based on docRef
    let row3L = await db.fetchAllById(anx1Queries.table3l.get3lDetailsByDocRef,
      [item[0].ITEMREF], dbName);
    console.log("4th:::",row3L)
    logger.log("debug", "row3L : %s", JSON.stringify(row3L));
    // Prepare object to update in table3ef after calcualtion
    let upd = {
      TAXVAL: row3L[0].TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3L[0].IGST - item[0].IGST || 0,  
      CGST: row3L[0].CGST - item[0].CGST || 0,
      SGST: row3L[0].SGST - item[0].SGST || 0,             
      CESS: row3L[0].CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };
   
    // update record DB call
    await db.updateRow(anx1Queries.table3l.update3lDetailsByDocRef,
      [upd.TAXVAL, upd.IGST,upd.CGST,upd.SGST, upd.CESS, upd.DOCREF], gstindb);
      
    await anx1SummaryDao.save3BSummary(dbName, fp, taxperiod,row3L[0].CTIN,row3L[0].DOCTYPE,gstindb,"3L");
   

    db.commitAndCloseDBConn(gstindb);
  
    logger.log("info","Exiting anx13lDao.delete3lByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
    return anx1Const.ITEM_DELETE_SUCCESS;
  
  } catch (error) {
    db.rollBackAndCloseDBConn(gstindb);
    throw new Error(error);
  }
  };

/**
 * To edit the 3g Documents and item details
 * @param {*} docObj3G 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
tab3lDao.edit3L = async function (docObj3L ,fullItemList , gstin, fp, taxperiod, gstindb,flag){
      
    logger.log("info","Entering anx13lDao.edit3L : %s  ::  %s", new Date().getTime(), new Date().toString());
  
    await db.saveRow(anx1Queries.table3l.update3l, [ 
        docObj3L.docref,docObj3L.tableTyp, docObj3L.ctin, docObj3L.legalname, docObj3L.doctyp,
        docObj3L.num, docObj3L.dt, docObj3L.doc_year, docObj3L.val, docObj3L.diff_percentage,
        docObj3L.sec7, docObj3L.pos, docObj3L.clmrfnd, docObj3L.supply_type,
        docObj3L.taxable_value, docObj3L.igst, docObj3L.cgst, docObj3L.sgst, docObj3L.cess,
        docObj3L.flag, docObj3L.status || null, null, null, null, docObj3L.docid ],
      gstindb);
  
    logger.log("info","Document updated successfully for DOCREF: %s", docObj3L.docref);  
            
    await anx1Dao.updateItemsBatch(fullItemList, gstindb);
    logger.log("info","Items updated successfully for DOCREF: %s", docObj3L.docref);  
      
    console.log(docObj3L)
    await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3L.ctin, docObj3L.doctyp ,gstindb, '3L');
    if (docObj3L.ctin != docObj3L.orgCtin || docObj3L.doctyp != docObj3L.orgDocTyp) {
          await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3L.orgCtin, docObj3L.orgDocTyp, gstindb, '3L');
    } 
    if((flag && flag == "F") || docObj3L.flag == "C"){
      await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3L.ctin, docObj3L.doctyp ,gstindb, '3L', "F");
      if (docObj3L.ctin != docObj3L.orgCtin || docObj3L.doctyp != docObj3L.orgDocTyp) {
        await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3L.orgCtin, docObj3L.orgDocTyp, gstindb, '3L', "F");
      }
    } 
    logger.log("info","Exiting anx13lDao.edit3L : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
  
  }

   
/**
 * To delete the 3B Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
tab3lDao.delete3ldocdao = async function (docIds, dbName, fp, rtnprd) {
  logger.log("info","Entering delete3ldocdao : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;
    try {
      
    gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');   
      console.log(docIds)
      // Async db call to check number of items available
      let docIdsResult = await db.fetchAllByIdInTransaction(
        anx1Queries.table3l.get3lByDocIds,
        docIds,
        gstindb,
        true
      );
 
      if (docIdsResult.length === 0) {
        throw new Error(
          message = `No Document(s) found to delete`
        );
      } else {
  
      
        // input docIds and Db output docIdsResult are being compared to check all records are found in DB if any differnce found error 
        // will be thrown
        let diffRec = _.difference(docIds, _.map(docIdsResult, "docid"), _.isEqual);
  
        if (diffRec.length === 0) {

          /* Before deleting the documents, get the CTINS & docType for Summary Calculation. As 3K Summary will be calculated for the modified record only.
          Each time, we are not calculating the whole summary. Hence fetching CTIN at this poit is required */
          let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3l.getDistinctCtinForDocIds, docIds, gstindb, true);
          let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3l.getDistinctDocTypForDocIds, docIds, gstindb, true);

           console.log("ctinList && docTypList")
           console.log(ctinList);
           console.log(docTypList)
            // Delete the items for the corresponding docrefs
          let deleteItemsBydocref = await db.deleteBySqlInClause(
            anx1Queries.itemDetails.deleteItemsByitemRef,
            _.map(docIdsResult, "DOCREF"),
            dbName, gstindb
          );
          
          logger.log("debug", "deleteItemsBydocref :: 3L:: %s", deleteItemsBydocref);

          // Delete DB call and get the number of records been deleted 
          let deleteRecords = await db.deleteBySqlInClause(
            anx1Queries.table3l.delete3lByDocIds,
            docIds,
            dbName, gstindb
          );
          let ctinParams = `${_.map(ctinList, "CTIN").join('","')}`;
          let docTypParams = `${_.map(docTypList, "DOCTYPE").join('","')}`;
          await db.deleteData('DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and CTIN IN ("' + ctinParams + '") or DOC_TYPE IN ("N","' + docTypParams + '");', [fp, rtnprd], gstindb);
          for(let i=0; i<ctinList.length; i++){
            console.log("Delete existing summary data for :" + dbName + "," + fp + "," + rtnprd + "," + ctinList[i]);
            // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
            await db.deleteData(anx1Queries.summary.delete3LsummbyCtin, [fp, rtnprd, ctinList[i].CTIN], gstindb);
            await anx1SummaryDao.save3BSummaryByType(dbName, fp, rtnprd, gstindb, ctinList[i].CTIN, "","3L", "CTIN");
            await anx1SummaryDao.save3BErrorSummaryByType(dbName, fp, rtnprd, gstindb, ctinList[i].CTIN, "","3L", "CTIN"); 
          }
          logger.log("debug","CTIN Summary Calculated"); 
          for(let j=0; j<docTypList.length; j++){
            console.log("Delete existing summary data for :" + dbName + "," + fp + "," + rtnprd + "," + docTypList[j]);
            // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
            await db.deleteData(anx1Queries.summary.delete3LsummbyDoc, [fp, rtnprd, docTypList[j].DOCTYPE], gstindb);
            await anx1SummaryDao.save3BSummaryByType(dbName, fp, rtnprd, gstindb, "", docTypList[j].DOCTYPE,"3L", "DOC");  
            await anx1SummaryDao.save3BErrorSummaryByType(dbName, fp, rtnprd, gstindb, "", docTypList[j].DOCTYPE,"3L", "DOC");
          }
          logger.log("debug","DOC Summary Calculated");

          db.commitAndCloseDBConn(gstindb);

          console.log("result",deleteRecords)
          return deleteRecords || 0;
        
        } else {
          throw new Error(
            message = `Document(s) not found for the given docId(s) ${diffRec}`
          );
        }
      }
    } catch (error) {
      db.rollBackAndCloseDBConn(gstindb);
      throw new Error(error);
    }
  };

//generate json for dao layer 3L

tab3lDao.get3LjSON = async function(gstin, rtnprd,flag){
  return new Promise(function (resolve, reject) {
    console.log("Inside get3LjSON" + flag)
    let sql = anx1Queries.table3l.get3LjSON;
    if (flag == "F")
      sql = anx1Queries.table3l.get3LErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

module.exports = tab3lDao;