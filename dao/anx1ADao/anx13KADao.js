const { anx1aQueries } = require("../../db/queriesanx1a");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const { STATUS_CD_ZERO, STATUS_CD_ONE, DB_PATH, DB_EXT } = require('../../utility/constants');
const _ = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const log = require('../../utility/logger');
const logger = log.logger;
const anx1Dao = require("../anx1Dao");

/**
 * To edit the 3K Documents and item details
 * @param {*} headerList 
 * @param {*} fullItemList 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 * @param {*} flag 
 * @param {*} actionFlag 
 */
async function edit3KA(headerList, fullItemList, fp, taxperiod, gstindb, flag, actionFlag) {

  logger.log("info", "Entering anx13kDao.edit3K : %s  ::  %s", new Date().getTime(), new Date().toString());

  await db.saveRow(anx1aQueries.table3KA.update3K, [
    headerList.odocref,
    headerList.octin,
    headerList.olegalname,
    headerList.odoctyp,
    headerList.onum,
    headerList.odt,
    headerList.opcode,
    headerList.odoc_year,
    headerList.docref,
    headerList.ctin, headerList.legalname, headerList.doctyp, headerList.pcode,
    headerList.num, headerList.dt, headerList.doc_year, headerList.val,
    headerList.pos, headerList.taxable_value, headerList.igst, headerList.cess,
    headerList.flag, headerList.status || null, null, headerList.errde || null,
    headerList.errmsg || null, headerList.docid], gstindb);

  logger.log("info", "Document updated successfully for DOCREF: %s", headerList.docref);

  await anx1Dao.updateItemsBatch(fullItemList, gstindb);
  logger.log("info", "Items updated successfully for DOCREF: %s", headerList.docref);

  await save3KASummary(gstindb, fp, taxperiod, headerList.doctyp, headerList.ctin, flag, actionFlag);

  if (headerList.ctin != headerList.orgCtin) {
    await save3KASummary(gstindb, fp, taxperiod, headerList.doctyp, headerList.orgCtin, flag, actionFlag);
  }

  logger.log("info", "Exiting anx13kDao.edit3K : %s  ::  %s", new Date().getTime(), new Date().toString());
}

/**
 * To delete the 3G Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3KAdocIdsDao(docIds, dbName, fp, rtnprd, flag, actionFlag) {
  let gstindb;
  try {

    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllById(anx1aQueries.table3KA.get3kByDocIds, docIds, dbName, true);

    if (docIdsResult.length === 0) {
      throw new Error(message = `No Document(s) found to delete`);
    }
    else {
      console.log(JSON.stringify(docIdsResult));

      // input docIds and Db output docIdsResult are being compared to check all records are found in DB 
      //if any differnce found error will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);

      if (diffRec.length === 0) {

        /* Before deleting the documents, get the CTINS for Summary Calculation. As 3K Summary will be calculated for the modified record only.
         Each time, we are not calculating the whole summary. Hence fetching CTIN at this poit is required */
        let ctinList = await db.fetchAllById(anx1aQueries.table3KA.getDistinctCtinForDocIds, docIds, dbName, true);


        // Delete the items for the corresponding docrefs
        let deleteItemsBydocref = await db.deleteBySqlInClause(anx1aQueries.itemDetails.deleteItemsByitemRef,
          _.map(docIdsResult, "DOCREF"), dbName);


        // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClause(anx1aQueries.table3KA.delete3kByDocIds,
          docIds, dbName);

        gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
        gstindb.exec('BEGIN TRANSACTION;');

        await save3KASummaryByType(gstindb, fp, rtnprd, "", "B", "DOC");
        if (flag && flag == "F") {
          await save3KAErrorSummaryByType(gstindb, fp, rtnprd, "", "B", "DOC");
        } else if (flag && flag == "N") {
          if (actionFlag && actionFlag == "C") {
            await save3KAErrorSummaryByType(gstindb, fp, rtnprd, "", "B", "DOC");
          }
        }
        for (let i = 0; i < ctinList.length; i++) {
          console.log("In delete " + JSON.stringify(ctinList[i]));
          await save3KASummaryByType(gstindb, fp, rtnprd, ctinList[i].CTIN, "", "CTIN");
          if (flag && flag == "F") {
            await save3KAErrorSummaryByType(gstindb, fp, rtnprd, ctinList[i].CTIN, "", "CTIN");
          } else if (flag && flag == "N") {
            if (actionFlag && actionFlag == "C") {
              await save3KAErrorSummaryByType(gstindb, fp, rtnprd, ctinList[i].CTIN, "", "CTIN");
            }
          }

          if (i == ctinList.length - 1) {
            console.log("Summary Calculated");
            gstindb.exec('COMMIT;');
            return deleteRecords || 0;
          }
        }

      } else {
        throw new Error(message = `record(s) not found for the given docId(s) ${diffRec}`);
      }
    }
  } catch (error) {
    gstindb.exec('ROLLBACK;');
    throw new Error(error);
  } finally {
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
async function delete3kaByItemId(itemIds = [], dbName, fp, rtnprd, flag, status) {
  try {
    /* DB call to check number of items available for the given itemids
    slight modification to the fetchAllById method which passing a last argumrnt
    */

    let deleteRecords = 0
    let item = await db.fetchAllById(anx1aQueries.itemDetails.getItemRefByItemId,
      itemIds, dbName, true);

    if (item.length === 0) {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch all items based on docRef
    let listOfItems = await db.fetchAllById(anx1aQueries.itemDetails.getItemsByRefId,
      [item[0].ITEMREF], dbName);

    if (listOfItems.length > 1) {

      // delete the record from item table only if it has more than one records
      deleteRecords = await db.deleteBySqlInClause(anx1aQueries.itemDetails.deleteItemsByItemIds,
        itemIds, dbName);
    }
    else if (listOfItems.length === 1) {

      throw new Error((message = "Kindly delete the document level before deleting the last item"));

    } else {
      throw new Error((message = "No Records found for delete Item"));
    }

    // fetch row from 3EF table based on docRef
    let row3K = await db.fetchAllById(anx1aQueries.table3KA.get3kDetailsByDocRef,
      [item[0].ITEMREF], dbName);

    console.log("rrru", JSON.stringify(row3K));
    // Prepare object to update in table3ef after calcualtion
    let upd = {
      TAXVAL: row3K[0].TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3K[0].IGST - item[0].IGST || 0,
      CESS: row3K[0].CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };

    // update record DB call
    let recordsUpdated = await db.update(anx1aQueries.table3KA.update3kDetailsByDocRef,
      [upd.TAXVAL, upd.IGST, upd.CESS, upd.DOCREF], dbName);
    if (status && status == "F") {
      let recordsUpdated = await db.update(anx1aQueries.table3KA.update3kFlagByDocRef,
        [upd.DOCREF], dbName);
    }
    console.log("DOCREF  : " + upd.DOCREF);

    let gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');

    let summ = await save3KASummary(gstindb, fp, rtnprd, row3K[0].DOCTYPE, row3K[0].CTIN, flag);
    if (summ === true) {
      console.log("Summary Calculated Successfully");
      gstindb.exec('COMMIT;');
      gstindb.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Close the database connection.');
      });
    } else {
      rollBackAndCloseDBConn(gstindb);
    }

    return "Item deleted successfully";

  } catch (error) {
    throw new Error(error);
  }
};



//generate json for dao layer 3K

function get3KAjSON(gstin, rtnprd, flag) {

  return new Promise(function (resolve, reject) {
    console.log("Inside get3KjSON" + flag)
    let sql = anx1aQueries.table3KA.get3KjSON;
    if (flag == "F")
      sql = anx1aQueries.table3KA.get3KErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

/**
 * This function will save 3k details in DB
 * Once Data is saved in ANX1_3k, data will be stored in ITEM_DEtails and then Summary will be calculated
 * @param {*} headerList 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function save3KA(headerList, fullItemList, fp, taxperiod, gstindb) {

  logger.log("info", "Entering save3K : %s  ::  %s", new Date().getTime(), new Date().toString());

  await db.saveRow(anx1aQueries.table3KA.save,
    [
      headerList.odocref,
      headerList.octin,
      headerList.olegalname,
      headerList.odoctyp,
      headerList.onum,
      headerList.odt,
      headerList.opcode,
      headerList.odoc_year,
      headerList.docref, headerList.ctin, headerList.legaltradename, headerList.doc_type,
      headerList.portCode, headerList.boe_num, headerList.boe_date, headerList.boe_year,
      headerList.boe_val, headerList.pos, headerList.supply_type, headerList.taxable_value,
      headerList.igst, headerList.cess, headerList.upload_date, headerList.flag,
      headerList.status || null, headerList.fp, headerList.taxperiod, headerList.errorcode || "NA", headerList.error_detail || "NA",
    ], gstindb);

  logger.log("info", "Document saved successfully for DOCREF: %s", headerList.docref);

  await db.saveRow((anx1aQueries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
  logger.log("info", "Items saved successfully for DOCREF: %s", headerList.docref);

  await save3KASummary(gstindb, fp, taxperiod, headerList.doc_type, headerList.ctin);
  logger.log("info", "Exiting save3Ktable : %s  ::  %s", new Date().getTime(), new Date().toString());
}

/**
* This function will save the item level details of 3K Table in DB
* @param {*} fullItemList 
* @param {*} gstindb 
*/
function getValuesToSaveItemDetails3KA(fullItemList) {

  logger.log("info", "Inside getValuesToSaveItemDetails3K");
  let sql = " ";
  for (let i = 0; i <= fullItemList.length - 1; i++) {

    if (i > 0) {
      sql = sql + ",";
    }

    sql = sql + "('" + fullItemList[i].hsn + "'," + fullItemList[i].apptaxrate + "," + fullItemList[i].taxable_value + "," + fullItemList[i].igst + ", NULL, NULL, " + fullItemList[i].cess + ",'" + fullItemList[i].itemref + "')";
    //    console.log(sql);
    if (i == fullItemList.length - 1) {
      return sql;
    }
  }
}

/**
 * This method will fetch all the 3G documents
 * This method will be called during get3G API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3KA(gstin, rtnprd, flag) {

  logger.log("info", "Inside get3KDetails for : %s , %s", gstin, rtnprd);

  return new Promise(function (resolve, reject) {
    let sql = anx1aQueries.table3KA.getDocs;
    if (flag == "F")
      sql = anx1aQueries.table3KA.getDocsErr
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
   * This method will rollback the transaction and close the DB connection
   * @param {*} gstindb 
   */
function rollBackAndCloseDBConn(gstindb) {
  console.log("Inside rollBackAndCloseDBConn");
  gstindb.exec('ROLLBACK;');
  gstindb.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
}

/**
 * To calculate and save 3K Summary 
 * This method has to be called on save, edit, delete of 3K
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} docType 
 * @param {*} ctin 
 */
async function save3KASummary(gstindb, fp, taxperiod, docType, ctin, flag, actionFlag) {
  console.log("Inside save3KSummary", flag);
  await save3KASummaryByType(gstindb, fp, taxperiod, ctin, "", "CTIN");
  await save3KASummaryByType(gstindb, fp, taxperiod, "", docType, "DOC");
  if (flag && flag == "F") {
    await save3KAErrorSummaryByType(gstindb, fp, taxperiod, ctin, "", "CTIN");
    await save3KAErrorSummaryByType(gstindb, fp, taxperiod, "", docType, "DOC");
  }
  if (flag && flag == "N") {
    if (actionFlag && actionFlag == "C") {
      await save3KAErrorSummaryByType(gstindb, fp, taxperiod, ctin, "", "CTIN");
      await save3KAErrorSummaryByType(gstindb, fp, taxperiod, "", docType, "DOC");
    }
  }
  return Promise.resolve(true);
}

/**
* To calculate 3K summary
* @param {*} gstin 
* @param {*} fp 
* @param {*} taxperiod 
* @param {*} gstindb 
* @param {*} ctin 
* @param {*} docType 
* @param {*} type 
*/
async function save3KASummaryByType(gstindb, fp, taxperiod, ctin, docType, type) {

  console.log("Inside save3KSummaryByType for :" + fp + "," + taxperiod + ", " + type);

  let summSql;
  let mfdSql;
  let deleteSummSql;
  let deleteParams = [];

  let summObj;
  let mfdCount;

  let summBy;  // to store CTIN or DOC_TYPE, which is required to be passed to the query
  let valuesToInsert = '';
  let noOfRecords = 0, totalVal = 0, igst = 0, cess = 0, lglNm = '';

  if (type === "DOC") {
    deleteSummSql = anx1aQueries.summary.delete3KsummbyDoc;
    deleteParams.push(fp);
    deleteParams.push(taxperiod);
    summSql = anx1aQueries.summary.calculate3KSummaryDocWise;
    mfdSql = anx1aQueries.summary.getCountMarkForDelfor3KDocWise;
    summBy = docType;
  }
  else if (type === "CTIN") {
    deleteSummSql = anx1aQueries.summary.delete3KsummbyCtin;
    deleteParams.push(fp);
    deleteParams.push(taxperiod);
    deleteParams.push(ctin);
    summSql = anx1aQueries.summary.calculate3KSummaryCtinWise;
    mfdSql = anx1aQueries.summary.getCountMarkForDelfor3KCtinWise;
    summBy = ctin;
  }

  console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docType + "," + ctin);
  // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
  await db.deleteData(deleteSummSql, deleteParams, gstindb);

  mfdCount = await db.getRow(mfdSql, [fp, taxperiod, summBy], gstindb);
  console.log("MFD : " + JSON.stringify(mfdCount));

  summObj = await db.getRow(summSql, [fp, taxperiod, summBy], gstindb);
  console.log("Summary for " + summBy + " : " + JSON.stringify(summObj));

  if (summObj != undefined) {
    noOfRecords = summObj.noRec;
    totalVal = summObj.totVal.toFixed(2);
    igst = summObj.igst.toFixed(2);
    cess = summObj.cess.toFixed(2);
  }

  if (noOfRecords > 0 || (mfdCount && mfdCount.count > 0)) {
    if (type === 'DOC') {
      valuesToInsert += "('3KA'," + noOfRecords + ",'" + docType + "',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'I',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'CR',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'DR',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'N',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC');"
    } else if (type === 'CTIN') {
      lglNm = mfdCount.count === 0 ? (summObj ? summObj.lglName : mfdCount.lglName) : mfdCount.lglName;
      valuesToInsert += "('3KA'," + noOfRecords + ", NULL,'" + ctin + "','" + lglNm + "','" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'CTIN'),"
    }

    valuesToInsert = valuesToInsert.substring(0, valuesToInsert.length - 1)
    await db.saveRow(anx1aQueries.summary.save3KSumm + valuesToInsert, [], gstindb);
  }
  new Promise.resolve(true);
}
/**
* To calculate 3K Error summary
* @param {*} gstin 
* @param {*} fp 
* @param {*} taxperiod 
* @param {*} gstindb 
* @param {*} ctin 
* @param {*} docType 
* @param {*} type 
*/
async function save3KAErrorSummaryByType(gstindb, fp, taxperiod, ctin, docType, type) {

  console.log("Inside save3KErrorSummaryByType for :" + fp + "," + taxperiod + ", " + type + "," + ctin);

  let summSql;
  let mfdSql;
  let deleteSummSql;
  let deleteParams = [];

  let summObj;
  let mfdCount;

  let summBy;  // to store CTIN or DOC_TYPE, which is required to be passed to the query
  let valuesToInsert = '';
  let noOfRecords = 0, totalVal = 0, igst = 0, cess = 0, lglNm = '';

  if (type === "DOC") {
    deleteSummSql = anx1aQueries.errorSummary.delete3KsummbyDoc;
    deleteParams.push(fp);
    deleteParams.push(taxperiod);
    summSql = anx1aQueries.errorSummary.calculate3KSummaryDocWise;
    mfdSql = anx1aQueries.errorSummary.getCountMarkForDelfor3KDocWise;
    summBy = docType;
  }
  else if (type === "CTIN") {
    deleteSummSql = anx1aQueries.errorSummary.delete3KsummbyCtin;
    deleteParams.push(fp);
    deleteParams.push(taxperiod);
    deleteParams.push(ctin);
    summSql = anx1aQueries.errorSummary.calculate3KSummaryCtinWise;
    mfdSql = anx1aQueries.errorSummary.getCountMarkForDelfor3KCtinWise;
    summBy = ctin;
  }

  console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docType + "," + ctin);
  // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
  await db.deleteData(deleteSummSql, deleteParams, gstindb);

  mfdCount = await db.getRow(mfdSql, [fp, taxperiod, summBy], gstindb);
  console.log("MFD : " + JSON.stringify(mfdCount));

  summObj = await db.getRow(summSql, [fp, taxperiod, summBy], gstindb);
  console.log("Summary for " + summBy + " : " + JSON.stringify(summObj));

  if (summObj != undefined) {
    noOfRecords = summObj.noRec;
    totalVal = summObj.totVal.toFixed(2);
    igst = summObj.igst.toFixed(2);
    cess = summObj.cess.toFixed(2);
  }


  if (noOfRecords > 0 || (mfdCount && mfdCount.count > 0)) {
    if (type === 'DOC') {
      valuesToInsert += "('3KA'," + noOfRecords + ",'" + docType + "',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'I',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'CR',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'DR',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC'),"
      valuesToInsert += "('3KA'," + noOfRecords + ",'N',NULL,NULL,'" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'DOC');"
    } else if (type === 'CTIN') {
      lglNm = mfdCount.count === 0 ? (summObj ? summObj.lglName : mfdCount.lglName) : mfdCount.lglName;
      valuesToInsert += "('3KA'," + noOfRecords + ", NULL,'" + ctin + "','" + lglNm + "','" + fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," + mfdCount.count + ", NULL, NULL,'CTIN'),"
    }

    valuesToInsert = valuesToInsert.substring(0, valuesToInsert.length - 1)
    await db.saveRow(anx1aQueries.errorSummary.save3KSumm + valuesToInsert, [], gstindb);
  }
  new Promise.resolve(true);
}

module.exports = {
  get3KAjSON: get3KAjSON,
  delete3KAdocIdsDao: delete3KAdocIdsDao,
  delete3kaByItemId: delete3kaByItemId,
  edit3KA: edit3KA,
  save3KA: save3KA,
  get3KA: get3KA,
  save3KASummaryByType: save3KASummaryByType,
  save3KAErrorSummaryByType: save3KAErrorSummaryByType

}