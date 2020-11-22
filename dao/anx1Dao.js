const {anx1Queries } = require("../db/Queries");
const db = require("../db/dbUtil");
const Promise = require("bluebird");
const { STATUS_CD_ZERO, STATUS_CD_ONE, DB_PATH, DB_EXT } = require('../utility/constants');
const _ = require("lodash");
const anx1Const = require('../utility/anx1Constants');
const anx1SummaryDao = require("../dao/anx1SummaryDao");
const log  = require('../utility/logger');
const logger = log.logger;
const sqlite3 = require('sqlite3').verbose();

/**
 * Get table3a
 * @param {*} gstin 
 * @param {*} rtnprd 
 * @param {*} flag 
 */
function getTable3aDao(gstin, rtnprd, flag) {
  logger.log("info","Entering anx1Dao.getTable3aDao : %s  ::  %s", new Date().getTime(), new Date().toString());
  return new Promise(function (resolve, reject) {
    logger.log("info","Inside getTable3aDao: %s" , flag);
    let sql = anx1Queries.table3a.get3aDetails;
    if (flag == "F") {
      sql = anx1Queries.table3a.get3aDetailsErr;
    }
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet =>{
        resolve(resultSet)
      })
      .catch(err => reject(err));
  });
  logger.log("info","Exiting anx1Dao.getTable3aDao : %s  ::  %s", new Date().getTime(), new Date().toString());
}


/**
 * This method will save the Document level and item details of table 3A
 * @param {*} docObj3A 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} rtnprd 
 * @param {*} gstindb 
 */
async function save3atable(docObj3A ,fullItemList , gstin, fp, rtnprd, gstindb) {
  logger.log("info","Entering anx1Dao.save3atable : %s  ::  %s", new Date().getTime(), new Date().toString());

    await db.saveRow(
      anx1Queries.table3a.save3a,
      [ docObj3A.docref,  docObj3A.pos, docObj3A.diff_percentage, docObj3A.doc_type, docObj3A.sec7, docObj3A.upload_date,
        docObj3A.supply_type, docObj3A.fp, docObj3A.taxperiod, docObj3A.taxable_value, docObj3A.cgst, docObj3A.igst, docObj3A.sgst,
        docObj3A.cess, docObj3A.status || null, docObj3A.flag, docObj3A.errorcode || "NA", docObj3A.error_detail || "NA"],
      gstindb);
    
    logger.log("info","Document saved successfully for DOCREF: %s", docObj3A.docref);  
    
    await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
    logger.log("info","Items saved successfully for DOCREF: %s", docObj3A.docref);     
    
    await anx1SummaryDao.save3ASummary(gstin, fp, rtnprd, gstindb);

    logger.log("info","Exiting anx1Dao.save3atable : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
}

/**
 * method to edit data for table 3A into the database
 * @param {*} docObj3A 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} rtnprd 
 * @param {*} gstindb 
 */
async function editTable3a (docObj3A ,fullItemList , gstin, fp, rtnprd, gstindb, flag){
    
  logger.log("info","Entering anx1Dao.editTable3a : %s  ::  %s", new Date().getTime(), new Date().toString()); 
      
  await db.saveRow(anx1Queries.table3a.update3a, [docObj3A.docref, docObj3A.pos, docObj3A.diff_percentage,
        docObj3A.sec7, docObj3A.supply_type, docObj3A.taxable_value, docObj3A.cgst, docObj3A.igst, docObj3A.sgst,
        docObj3A.cess, docObj3A.status || null, docObj3A.flag, null ,null, null, docObj3A.docid], gstindb);

  logger.log("info","Document updated successfully for DOCREF: %s", docObj3A.docref);  

  await updateItemsBatch(fullItemList, gstindb);
  logger.log("info","Items updated successfully for DOCREF: %s", docObj3A.docref);  

  await anx1SummaryDao.save3ASummary(gstin, fp, rtnprd, gstindb);

  if((flag && flag == "F") || docObj3A.flag == "C"){ // Summary to be calculated for error flow - corrected records
    await anx1SummaryDao.save3ASummary(gstin, fp, rtnprd, gstindb, "F");
  }

  logger.log("info","Exiting anx1Dao.editTable3a : %s  ::  %s", new Date().getTime(), new Date().toString());
     
}


/**
 * To edit the existing item details and/or add the newly added items to DB
 * @param {*} fullItemList 
 * @param {*} gstindb 
 */
async function updateItemsBatch(fullItemList, gstindb) {
  logger.log("info","Entering updateItemsBatch : %s  ::  %s", new Date().getTime(), new Date().toString());

    await db.deleteData(anx1Queries.itemDetails.deleteAllItemsByItemRef, fullItemList[0].itemref, gstindb);

    await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
    logger.log("info","Items saved successfully");     

    logger.log("info","Exiting updateItemsBatch : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(1);
}

 /**
   * This function will form the sql query to save the the item level details in DB
   * @param {*} fullItemList 
   */
  function getValuesToSaveItemDetailsBatch(fullItemList){
     
    logger.log("info","Entering getValuesToSaveItemDetailsBatch : %s  ::  %s", new Date().getTime(), new Date().toString());     
     
    let sql = "";
     
    for(let i=0; i<= fullItemList.length -1; i++){
       if(i > 0){ sql = sql + ",";}
       
       sql = sql + "('" + fullItemList[i].hsn + "'," + fullItemList[i].apptaxrate + "," + fullItemList[i].taxable_value + "," + fullItemList[i].igst + "," + fullItemList[i].cgst + "," + fullItemList[i].sgst + "," + fullItemList[i].cess + ",'" + fullItemList[i].itemref + "')";
       
     }
     logger.log("debug", "SQL is : %s", sql);
     logger.log("info","Exiting getValuesToSaveItemDetailsBatch : %s  ::  %s", new Date().getTime(), new Date().toString());     
     return sql;
   }


/**
 * This method will fetch the items for the given docref
 * @param {*} docref 
 * @param {*} gstin 
 */
function getItemDetails(docref, gstin) {
  
  logger.log("info","Entering anx1Dao.getItemDetails : %s  ::  %s", new Date().getTime(), new Date().toString());     
  
  return new Promise((resolve, reject) => {

    db.fetchAllById(anx1Queries.itemDetails.getItemTableDetails, [docref], gstin)
      .then((result) => {
        resolve({ itemDetails: result, statusCd: STATUS_CD_ONE });
      })
      .catch((err) => {
        reject({ message: err.message, statusCd: STATUS_CD_ZERO })
      });
      logger.log("info","Exiting anx1Dao.getItemDetails : %s  ::  %s", new Date().getTime(), new Date().toString());     
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
async function delete3HItemsByItemId(itemIds = [], dbName, fp, taxperiod, flag, status) {
  // try catch block to handle error scenario
  try {
    /* DB call to check number of items available for the given itemids
    slight modification to the fetchAllById method which passing a last argumrnt
    */
   let deleteRecords = 0
    let item = await db.fetchAllById(
      anx1Queries.itemDetails.getItemRefByItemId,
      itemIds,
      dbName,
      true
    );

    if(item.length === 0){
      throw new Error((message = "No Document(s) found for delete Item"));
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
          "kindly delete the document level before deleting the last item")
      );

    } else {
      throw new Error((message = "No Document(s) found for delete Item"));
    }

    // fetch row from 3H table based on docRef
    let row3H = await db.fetchAllById(
      anx1Queries.table3h.get3hDetailsByDocRef,
      [item[0].ITEMREF],
      dbName
    );
    
    // Prepare object to update in table3h after calcualtion
    let u = {
      TAXVAL: row3H[0].TAX_VALUE - item[0].TAXVAL || 0,
      IGST: row3H[0].IGST - item[0].IGST || 0,
      CGST: row3H[0].CGST - item[0].CGST || 0,
      SGST: row3H[0].SGST - item[0].SGST || 0,
      CESS: row3H[0].CESS - item[0].CESS || 0,
      DOCREF: item[0].ITEMREF
    };

    // update record DB call
    let recordsUpdated = await db.update(
      anx1Queries.table3h.update3hDetailsByDocRef,
      [u.TAXVAL, u.IGST, u.CGST, u.SGST, u.CESS, u.DOCREF],
      dbName
    );

    if(status && status === "F"){
      await db.update(anx1Queries.table3h.update3hFlagByDocRef, [u.DOCREF], dbName);  // to update flag as corrected
    } 

    await anx1SummaryDao.save3HSummary(dbName, fp, taxperiod);

    if(flag && flag == "F"){
      await anx1SummaryDao.save3HSummary(dbName, fp, taxperiod, flag);
    }
    return anx1Const.ITEM_DELETE_SUCCESS;

  } catch (error) {
    throw new Error(error);
  }
};


/**
 * Delete 3A documents
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 * @param {*} flag 
 */
async function delete3ABydocIds(docIds, dbName, fp, rtnprd, flag ,actionFlag) {

  logger.log("info","Entering delete3ABydocIds : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;
  try {
    
    gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');   

    // Async db call to check number of items available
    let docIdsResult = await db.fetchAllByIdInTransaction(anx1Queries.table3a.get3aDetailsByDocId ,
      docIds,
      gstindb,
      true
    );

    if (docIdsResult.length === 0) {
      throw new Error(message = `No Document(s) found to delete`);
    } else {
      // input docIds and Db output docIdsResult are being compared to check all records are found in DB if any differnce found error 
      // will be thrown
      let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual)
      
      if (diffRec.length === 0) {
            // Delete the items for the corresponding docrefs
      let deleteItemsBydocref = await db.deleteBySqlInClause(
        anx1Queries.itemDetails.deleteItemsByitemRef,
        _.map(docIdsResult, "DOCREF"),
        dbName, gstindb
      );
      
      logger.log("debug", "deleteItemsBydocref::3g:: %s", deleteItemsBydocref);
        
      // Delete DB call and get the number of records been deleted 
        let deleteRecords = await db.deleteBySqlInClause(
          anx1Queries.table3a.delete3aByDocIds,
          docIds,
          dbName, gstindb
        );

       // await anx1SummaryDao.save3ASummary(dbName, fp, rtnprd, gstindb);

        //if(flag && flag == "F"){
          await anx1SummaryDao.save3ASummary(dbName, fp, rtnprd, gstindb, flag, actionFlag);
       // }

        db.commitAndCloseDBConn(gstindb);
        logger.log("debug", "Summary Calculated - del document 3A : ");

        logger.log("info","Exiting delete3ABydocIds : %s  ::  %s", new Date().getTime(), new Date().toString());

        return deleteRecords || 0;

      } else {
        throw new Error(
          message = `Document(s) not found for the given docId(s) ${diffRec}`
        );
      }
    }
  } catch (error) {
    rollBackAndCloseDBConn(gstindb);
    throw new Error(error);
  }
};

/**
 * This method will remove data from the selected table for the given rtnperiod.
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} rtnprd 
 * @param {*} tableTyp 
 * @param {*} profile 
 * @param {*} flag 
 */
async function removeDataFromAllTables(gstin, fp, rtnprd, tableTyp, profile, flag) {

  logger.log("info","Entering removeDataFromAllTables : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;

  try {
    gstindb = db.getConnection(gstin);    
    
      gstindb.run("BEGIN TRANSACTION;");

      let result = 0;
      if(flag !== 'F'){ // flag = N - Main flow
        if(tableTyp === "All" ){
            logger.log("info", "Delete records from ANX1_SUMMARY");
            await db.deleteData(anx1Queries.removeData.removeSummaryforAll, [fp, rtnprd], gstindb);
            /**
             * When we do remove data in main flow, corected records from error flow will also get deleted. 
             * Hence error summary has to be updated accordingly. 
             * Instead of re-calculating the error summary for all tables, update the existing summary values as 0 for corrected records.
             */
            await db.updateRow(anx1Queries.errorSummary.updateSummaryOnRemoveDataForAllTables, [rtnprd], gstindb); 
        }
        else {
          logger.log("info", "Delete records from ANX1_SUMMARY for table %s", tableTyp);
          await db.deleteData(anx1Queries.removeData.removeSummaryforTable, [tableTyp, fp, rtnprd], gstindb);
          /**
             * When we do remove data in main flow, corected records from error flow will also get deleted. 
             * Hence error summary has to be updated accordingly. 
             * Instead of re-calculating the error summary for all tables, update the existing summary values as 0 for corrected records.
             */
            await db.updateRow(anx1Queries.errorSummary.updateSummaryOnRemoveDataForSelectedTable, [rtnprd, tableTyp], gstindb); 
        }
      } else { // Error Flow
        if(tableTyp === "All" ){
            logger.log("info", "Update records from ANX1_ERR_SUMMARY");
            //await db.deleteData(anx1Queries.removeData.removeErrSummaryforAll, [fp, rtnprd], gstindb);

            /**
             * When we do remove data in error flow, only the error records will get deleted. 
             * This will have an impact in the count of "Records yet to be corrected".
             * Instead of re-calculating the error summary for all tables, update the yet to be corrected value as 0
             */
            await db.updateRow(anx1Queries.errorSummary.updateYetToBeCorrectedOnRemoveDataForAllTables, [rtnprd], gstindb); 
        }
        else {
          logger.log("info", "Update records from ANX1_ERR_SUMMARY for table %s", tableTyp);
          //await db.deleteData(anx1Queries.removeData.removeErrSummaryforTable, [tableTyp, fp, rtnprd], gstindb);

          /**
             * When we do remove data in error flow, only the error records will get deleted. 
             * This will have an impact in the count of "Records yet to be corrected".
             * Instead of re-calculating the error summary for all tables, update the yet to be corrected value as 0
             */
            await db.updateRow(anx1Queries.errorSummary.updateYetToBeCorrectedOnRemoveDataForSelectedTable, [rtnprd, tableTyp], gstindb); 
        }
      }

      // to remove summary from ANX1_SUMM and ANX1_ERR_SUMM where both no.of records and no.of mfd are zero
      await db.deleteData(anx1Queries.removeData.removeSummaryForZeroValues, [fp, rtnprd], gstindb);
      await db.deleteData(anx1Queries.removeData.removeErrSummaryForZeroValues, [fp, rtnprd], gstindb);

      if(tableTyp === 'All'){
        logger.log("debug", "Delete values from all Tables");

        let tablesForProfile;
    
        if(profile === 'SJ'){ tablesForProfile = anx1Const.SJ_TABLES; } else
        if(profile === 'SM'){ tablesForProfile = anx1Const.SM_TABLES; } else 
        if(profile === 'QN' || profile === 'MN'){ tablesForProfile = anx1Const.ALL_ANX1_TABLES; } 
    
        for(let table of tablesForProfile)
        {
          logger.log("info", "Deleting data for table : %s", table); 
          result += await removeDataForTable(gstindb, fp, rtnprd, table , flag);
        }
        db.commitAndCloseDBConn(gstindb);
        logger.log("info","Exiting removeDataFromAllTables : %s  ::  %s", new Date().getTime(), new Date().toString());
        if(result === 0){
          return ("No Document(s) available for Taxperiod " + rtnprd);
        } else {
          return "Document(s) deleted successfully for Profile : " + profile + " for Taxperiod - " + rtnprd;
        }

      } else {
          logger.log("info", "Delete values from Table : %s", tableTyp);

          if(anx1Const.ALL_ANX1_TABLES.includes(tableTyp)){
              result = await removeDataForTable(gstindb, fp, rtnprd, tableTyp , flag);

              if((JSON.stringify(result)).indexOf("err") > 0){
                  db.rollBackAndCloseDBConn(gstindb);
                  return ({"err" :err});
              }
          }
          else {
              db.rollBackAndCloseDBConn(gstindb); 
              return ({"err" :"Table " + tableTyp + " is not relevant to ANX1"}); 
          }

          db.commitAndCloseDBConn(gstindb);
          if(result === 0){
            return ("No Document(s) available in Table " + tableTyp + " for Taxperiod " + rtnprd);
          } else {
            return "Document(s) deleted successfully from " + tableTyp + " for Taxperiod - " + rtnprd;
          }
          logger.log("info","Exiting anx1Dao.removeDataFromAllTables : %s  ::  %s", new Date().getTime(), new Date().toString());
      }

  } catch(err){
    db.rollBackAndCloseDBConn(gstindb);
    logger.log("error", "Error in removeData : %s", err);
    throw new Error(err);
  }
  
}

/**
 * This method will remove data from the given table for the selected rtnperiod
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} rtnprd 
 * @param {*} tableTyp 
 * @param {*} flag 
 */
async function removeDataForTable(gstindb, fp, rtnprd, tableTyp, flag) {
  logger.log("info","Entering removeDataForTable : %s  ::  %s", new Date().getTime(), new Date().toString());
  // console.log("Flag in remove Data", flag);
  try{
    let tableName = "ANX1_" + tableTyp;
    let itemRef = "%" + rtnprd + "|" + tableTyp;
      
      if(flag === "F"){  
        await db.deleteData("DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT ITEMREF from ANX1_ITEMDTLS INNER JOIN "+tableName+" ON ITEMREF = DOCREF WHERE ITEMREF LIKE '%" + itemRef + "' AND FLAG = 'F')", [], gstindb);      // item details blocker
      } else {
        await db.deleteData("DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT ITEMREF from ANX1_ITEMDTLS INNER JOIN "+tableName+" ON ITEMREF = DOCREF WHERE ITEMREF LIKE '%" + itemRef + "' AND FLAG != 'F')", [], gstindb);      // item details blocker
      }
  
      let sql = "delete from " + tableName + " where FP= ? and TAX_PERIOD = ? and FLAG != 'F'";
      if(flag === "F"){
        sql = "delete from " + tableName + " where FP= ? and TAX_PERIOD = ? and FLAG in ('F')";
      }
      
      let delcnt = await db.update(sql, [fp, rtnprd], '', gstindb);

      logger.log("info","Exiting removeDataForTable : %s  ::  %s", new Date().getTime(), new Date().toString());
      return delcnt;
  
  } catch(err){
    logger.log("error", "Error in anx1Dao.removeDataForTable : %s", err);
    throw new Error(err);
  }  
}

/**
 * DELETE 3A BY ITEMS 
 * @param {*} itemIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3AItemsByItemId(itemIds = [], dbName, fp, rtnprd, flag, status) {
  logger.log("info","Entering anx1Dao.delete3AItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());

  let gstindb;
  try {
      gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
      gstindb.exec('BEGIN TRANSACTION;'); 

      /* DB call to check number of items available for the given itemids */

      let item = await db.fetchAllByIdInTransaction( anx1Queries.itemDetails.getItemRefByItemId,
        itemIds, gstindb, true );

      if(item.length === 0){
        throw new Error((message = "No Document(s) found for delete Item"));
      }

      // fetch all items based on docRef
      let listOfItems = await db.fetchAllByIdInTransaction(anx1Queries.itemDetails.getItemsByRefId,
        [item[0].ITEMREF], gstindb);

      if (listOfItems.length > 1) {
        // delete the record from item table only if it has more than one records
        await db.deleteBySqlInClause(anx1Queries.itemDetails.deleteItemsByItemIds,
          itemIds, dbName, gstindb);

      } else if (listOfItems.length === 1) {
        throw new Error((message ="Kindly delete the document level before deleting the last item"));
      } else {
        throw new Error((message = "No Document(s) found for delete Item"));
      }

      // fetch row from 3H table based on docRef
      let row3A = await db.fetchAllByIdInTransaction(anx1Queries.table3a.get3aDetailsByDocRef,
          [item[0].ITEMREF], gstindb);
      
      logger.log("debug", "row3A : %s", JSON.stringify(row3A));

      // Prepare object to update in table3A after calcualtion
      let u = {
        TAXVAL: row3A[0].TOTAL_TAXABLE_VALUE - item[0].TAXVAL || 0,
        IGST: row3A[0].IGST - item[0].IGST || 0,
        CGST: row3A[0].CGST - item[0].CGST || 0,
        SGST: row3A[0].SGST - item[0].SGST || 0,
        CESS: row3A[0].CESS - item[0].CESS || 0,
        DOCREF: item[0].ITEMREF
      };

      logger.log("debug", "Updated Row : %s", JSON.stringify(u));

      // update record DB call
      await db.updateRow(anx1Queries.table3a.update3aDetailsByDocRef,
          [u.TAXVAL, u.IGST, u.CGST, u.SGST, u.CESS, u.DOCREF], gstindb);
      
      if(status && status === "F"){
        await db.updateRow(anx1Queries.table3a.update3aFlagByDocRef, [u.DOCREF], gstindb);  // to update flag as corrected
      } 

      if(flag && flag === "F"){
        await anx1SummaryDao.save3ASummary(dbName, fp, rtnprd, gstindb, flag);   // generate error summary on item delete 
      }
      
      await anx1SummaryDao.save3ASummary(dbName, fp, rtnprd, gstindb);
      
      db.commitAndCloseDBConn(gstindb);
      logger.log("info","Exiting anx1Dao.delete3AItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());

      return anx1Const.ITEM_DELETE_SUCCESS;
  } catch (error) {
    logger.log("error", "Error in anxDao.delete3AItemsByItemId : %s", error);
    db.rollBackAndCloseDBConn(gstindb);
    throw new Error(error);
  }
};


/**
 * generate json for dao layer for B2C
 * @param {*} gstin 
 * @param {*} rtnprd 
 * @param {*} flag 
 */
function get3B2cjSON(gstin, rtnprd, flag) {
  logger.log("info","Entering get3B2cjSON : %s  ::  %s", new Date().getTime(), new Date().toString());
  return new Promise(function (resolve, reject) {
    // console.log("Inside get3B2cjSON" + flag)
    let sql = anx1Queries.table3a.get3AjSON;
    if (flag == "F")
      sql = anx1Queries.table3a.get3aErrJson;

    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

/**
 * generate json for dao layer for 3H
 * @param {*} gstin 
 * @param {*} rtnprd 
 * @param {*} flag 
 */
function get3HjSON(gstin, rtnprd, flag) {
  logger.log("info","Entering get3HjSON : %s  ::  %s", new Date().getTime(), new Date().toString());
  return new Promise(function (resolve, reject) {
    logger.log("info","Inside get3HjSON : %s" , flag);
    let sql = anx1Queries.table3h.get3HjSON;
    if (flag == "F")
      sql = anx1Queries.table3h.get3hErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

module.exports = {
  save3atable: save3atable,
  getTable3aDao: getTable3aDao,
  editTable3a: editTable3a,
  getItemDetails: getItemDetails,
  delete3ABydocIds:delete3ABydocIds,
  removeDataFromAllTables : removeDataFromAllTables,
  delete3HItemsByItemId : delete3HItemsByItemId,
  delete3AItemsByItemId:delete3AItemsByItemId,
  updateItemsBatch : updateItemsBatch,
  getValuesToSaveItemDetailsBatch:getValuesToSaveItemDetailsBatch,
  get3B2cjSON : get3B2cjSON,
  get3HjSON :  get3HjSON

}