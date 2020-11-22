const { anx1Queries } = require("../../db/Queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const _ = require("lodash");
const anx1Dao = require("../anx1Dao");
const anx1SummaryDao = require("../../dao/anx1SummaryDao");
const sqlite3 = require('sqlite3').verbose();
const log = require('../../utility/logger');
const logger = log.logger;
const {DB_PATH, DB_EXT} = require('../../utility/constants');

/**
 * This method will save the Document level and item details of table saveB2baoDAO
 * @param {*} headerList 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function saveB2baoDAO(headerList, fullItemList, gstin, fp, taxperiod, gstindb) {
    logger.log("info", "Entering saveB2baoDAO : %s  ::  %s", new Date().getTime(), new Date().toString());

    console.log("headr", headerList)
    await db.saveRow(anx1Queries.tableB2BAO.saveb2bao,
        [headerList.docref,
        headerList.rev_docref,
        headerList.ctin,
        headerList.lgl_trdname,
        headerList.doctype,
        headerList.doc_num,
        headerList.doc_date,
        headerList.doc_year,
        headerList.ctin_type,
        headerList.upload_dt,
        headerList.flag,
        headerList.revctin,
        headerList.rev_lgl_trdname,
        headerList.rev_doctype,
        headerList.rev_doc_num,
        headerList.rev_doc_date,
        headerList.rev_doc_year,
        headerList.rev_doc_val,
        headerList.rev_pos,
        headerList.rev_diffprcnt,
        headerList.rev_sec7act,
        headerList.rev_tax_value,
        headerList.rev_ctin_type,
        headerList.rev_igst,
        headerList.rev_cgst,
        headerList.rev_sgst,
        headerList.rev_cess,
        headerList.rev_suptype,
        headerList.status,
        headerList.fp,
        headerList.taxperiod,
        headerList.errorcode,
        headerList.error_detail],
        gstindb);

    logger.log("info", "Document saved successfully for REV_DOCREF: %s", headerList.rev_docref);

    await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
    logger.log("info", "Items saved successfully for REV_DOCREF: %s", headerList.rev_docref);

    await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod,headerList.revctin, headerList.rev_doctype, gstindb, '3BAO');

    logger.log("info","Exiting saveB2baoDAO : %s  ::  %s", new Date().getTime(), new Date().toString());
}


/**
 * This method will be called during edit of Table 3B2BAO Document.
 * This method will update the document level details and then update the item details and insert the newly added items.
 * @param {*} headerList 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function edit3BAO(headerList, fullItemList, gstin, fp, taxperiod, gstindb, flag) {

    logger.log("info", "Entering Anx1b2baoDao.edit3BAO : %s  ::  %s", new Date().getTime(), new Date().toString());
    
    await db.saveRow(anx1Queries.tableB2BAO.UpdateB2BAO,
        [
        headerList.docref,
        headerList.rev_docref,
        headerList.ctin,
        headerList.lgl_trdname,
        headerList.doctype,
        headerList.doc_num,
        headerList.doc_date,
        headerList.doc_year,
        headerList.upload_dt,
        headerList.flag,
        headerList.revctin,
        headerList.rev_lgl_trdname,
        headerList.rev_doctype,
        headerList.rev_doc_num,
        headerList.rev_doc_date,
        headerList.rev_doc_year,
        headerList.rev_doc_val,
        headerList.rev_pos,
        headerList.rev_diffprcnt,
        headerList.rev_sec7act,
        headerList.rev_tax_value,
        headerList.rev_igst,
        headerList.rev_cgst,
        headerList.rev_sgst,
        headerList.rev_cess,
        headerList.rev_suptype,
        headerList.rev_status,
        null,
        null,
        headerList.docid
    ],gstindb);
    
    logger.log("info", "Document updated successfully for DOCREF: %s", headerList.rev_docref);

    await anx1Dao.updateItemsBatch(fullItemList, gstindb);
    logger.log("info", "Items updated successfully for DOCREF: %s", headerList.rev_docref);

    await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, headerList.revctin, headerList.rev_doctype ,gstindb, '3BAO');
  if (headerList.revctin != headerList.orgCtin || headerList.rev_doctype != headerList.orgDocTyp) {
        await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, headerList.orgCtin, headerList.orgDocTyp, gstindb, '3BAO');
  }

  if((flag && flag == "F") || headerList.flag == "C"){
    await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, headerList.revctin, headerList.rev_doctype,gstindb, '3BAO', "F");
    if (headerList.revctin != headerList.orgCtin || headerList.rev_doctype != headerList.orgDocTyp) {
      await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, headerList.orgCtin, headerList.orgDocTyp, gstindb, '3BAO', "F");
    }
  }
  logger.log("info","Exiting Anx1b2baoDao.edit3BAO : %s  ::  %s", new Date().getTime(), new Date().toString()); 
}

/**
 * This method will fetch all the 3bao documents
 * This method will be called during get3bao API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3baoDetails(gstin, rtnprd, flag) {

    logger.log("info", "Inside get3baoDetails for : %s, %s", gstin, rtnprd);
    return new Promise(function (resolve, reject) {
        let sql = anx1Queries.tableB2BAO.get3baoDocs
        if (flag == "F")
            sql = anx1Queries.tableB2BAO.get3baoDocsErr
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
 * To delete the 3BAO Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3baodocdao(docIds, dbName, fp, rtnprd, flag) {
  logger.log("info","Entering delete3baodocdao : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;
    try {

    gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');   

    let docIdParams = `${docIds.join(',')}`;  
    console.log("docIdParams",docIdParams);
    // Delete Item details
    await db.deleteData(anx1Queries.tableB2BAO.delete3baoItemsByDocId + docIdParams + ") )", [], gstindb);

    /* Before deleting the documents, get the CTINS & docType for Summary Calculation. As 3K Summary will be calculated for the modified record only.
    Each time, we are not calculating the whole summary. Hence fetching CTIN at this poit is required */
    let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.tableB2BAO.getDistinctCtinForDocIds, docIds, gstindb, true);
    let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.tableB2BAO.getDistinctDocTypForDocIds, docIds, gstindb, true);

    // Delete 3BAO Docs call and get the number of records been deleted 
    let deleteRecords = await db.deleteData(anx1Queries.tableB2BAO.delete3baoByDocIds + docIdParams + ")", [], gstindb);

    console.log("Delete existing summary data for :" + dbName + "," + fp + "," + rtnprd + "," + ctinList);

    let ctinParams = `${_.map(ctinList, "REV_CTIN").join('","')}`;
    let docTypParams = `${_.map(docTypList, "REV_DOCTYPE").join('","')}`;

    // Delete the existing summary data for the fetched CTIN and DOC_TYPE
    await db.deleteData('DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BAO" and CTIN IN ("' + ctinParams + '") or DOC_TYPE IN ("N","' + docTypParams + '");', [fp, rtnprd], gstindb);
    await db.deleteData('DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BAO" and CTIN IN ("' + ctinParams + '") or DOC_TYPE IN ("N","' + docTypParams + '");', [fp, rtnprd], gstindb);

    for (let i = 0; i < ctinList.length; i++) {
      await anx1SummaryDao.save3BSummaryByType(dbName, fp, rtnprd, gstindb, ctinList[i].CTIN, "", "3BAO", "CTIN");
      await anx1SummaryDao.save3BErrorSummaryByType(dbName, fp, rtnprd, gstindb, ctinList[i].CTIN, "", "3BAO", "CTIN");
    }
    logger.log("debug", "CTIN Summary Calculated");

    for (let j = 0; j < docTypList.length; j++) {
      await anx1SummaryDao.save3BSummaryByType(dbName, fp, rtnprd, gstindb, "", docTypList[j].DOCTYPE, "3BAO", "DOC");
      await anx1SummaryDao.save3BErrorSummaryByType(dbName, fp, rtnprd, gstindb, "", docTypList[j].DOCTYPE, "3BAO", "DOC");
    }
    logger.log("debug", "DOC Summary Calculated");

    db.commitAndCloseDBConn(gstindb);
    return deleteRecords || 0;

  } catch (error) {
    db.rollBackAndCloseDBConn(gstindb);
    throw new Error(error);
  }

};
  /** Delete by item 
 * @param {*} itemIds
 * @param {*} dbName
 * @param {*} fp
 * @param {*} taxperiod
*/
async function delete3BAOItemsByItemId(itemIds = [], dbName, fp, taxperiod, flag , status) {
  // try catch block to handle error scenario
  let gstindb;
  try {
    logger.log("info","Entering delete3BAOItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
      /* DB call to check number of items available for the given itemids
      slight modification to the fetchAllById method which passing a last argumrnt
      */

     gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
     gstindb.exec('BEGIN TRANSACTION;'); 

      let deleteRecords = 0;

      let item = await db.fetchAllByIdInTransaction(
          anx1Queries.itemDetails.getItemRefByItemId,
          itemIds,
          gstindb,
          true
      );

      if (item.length === 0) {
          throw new Error((message = "No Document(s) found for delete Item"));
      }

      // fetch all items based on docRef
      let listOfItems = await db.fetchAllByIdInTransaction(
          anx1Queries.itemDetails.getItemsByRefId,
          [item[0].ITEMREF],
          gstindb
      );

      if (listOfItems.length > 1) {

          // delete the record from item table only if it has more than one records
          deleteRecords = await db.deleteBySqlInClause(
              anx1Queries.itemDetails.deleteItemsByItemIds,
              itemIds,
              dbName, gstindb
          );
      } else if (listOfItems.length === 1) {
          throw new Error((message = "Kindly delete the document level before deleting the last item")
          );
      } else {
         throw new Error((message = "No Document(s) found for delete Item"));
      }
    
      // fetch row from 3BAO table based on docRef
      let row3BAO = await db.fetchAllByIdInTransaction(
          anx1Queries.tableB2BAO.get3baoDetailsByDocRef,
          [item[0].ITEMREF],
          gstindb
      );
      logger.log("debug", "row3B : %s", JSON.stringify(row3BAO));
    
      let u = {
          TAXVAL: row3BAO[0].REV_TAX_VALUE - item[0].TAXVAL || 0,
          IGST: row3BAO[0].REV_IGST - item[0].IGST || 0,
          CGST: row3BAO[0].REV_CGST - item[0].CGST || 0,
          SGST: row3BAO[0].REV_SGST - item[0].SGST || 0,
          CESS: row3BAO[0].REV_CESS - item[0].CESS || 0,
          DOCREF: item[0].ITEMREF
    };
    logger.log("debug", "updated row3BAO : %s", JSON.stringify(u));
      
      // update record DB call
      await db.updateRow(anx1Queries.tableB2BAO.update3baoDetailsByDocRef,
          [u.TAXVAL, u.IGST, u.CGST, u.SGST, u.CESS, u.DOCREF],
          gstindb
      );
      // To update the status flag
      if(status && status === "F"){
        await db.updateRow(anx1Queries.tableB2BAO.update3baoFlagByDocRef, [u.DOCREF], gstindb);  // to update flag as corrected
      } 
      //For Summary Calculation
      logger.log("debug","Calling summary for DOC_REF : %s , %s", row3BAO[0].REV_CTIN, row3BAO[0].REV_DOCTYPE);
      await anx1SummaryDao.save3BSummary(dbName, fp, taxperiod, row3BAO[0].REV_CTIN, row3BAO[0].REV_DOCTYPE, gstindb, '3BAO');
      logger.log("debug", "Summary Calculated for  : %s , %s", row3BAO[0].REV_CTIN, row3BAO[0].REV_DOCTYPE);

      if(flag && flag == "F"){
      await anx1SummaryDao.save3BSummary(dbName, fp, taxperiod, row3BAO[0].REV_CTIN, row3BAO[0].REV_DOCTYPE, gstindb, '3BAO', flag);
        logger.log("debug", "Error Summary Calculated for  : %s , %s", row3BAO[0].REV_CTIN, row3BAO[0].REV_DOCTYPE);
      }
      await db.commitAndCloseDBConn(gstindb);

      return "Item deleted successfully";

  } catch (error) {
    db.rollBackAndCloseDBConn(gstindb);
    throw new Error(error);
  }
};



  //generate json for dao layer for 3B2BAO

  function get3BAOjSON(gstin, rtnprd,flag){
    return new Promise(function (resolve, reject) {
      logger.log("info", "Inside get3BAOjSON, Flag : %s",flag)
      let sql = anx1Queries.tableB2BAO.get3BAOjSON;
      if (flag == "F")
        sql = anx1Queries.tableB2BAO.get3BAOErrJson;
      db.fetchAllById(sql, [rtnprd], gstin)
        .then(resultSet => resolve(resultSet))
        .catch(err => reject(err));
    })
  }

   module.exports = {
     saveB2baoDAO : saveB2baoDAO,
     get3baoDetails:get3baoDetails,
     delete3BAOItemsByItemId:delete3BAOItemsByItemId,
     edit3BAO: edit3BAO,
     delete3baodocdao:delete3baodocdao,
     get3BAOjSON : get3BAOjSON
  };