const { anx1aQueries } = require("../../db/queriesanx1a");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const { STATUS_CD_ZERO, STATUS_CD_ONE } = require('../../utility/constants');
const _ = require("lodash");
const logger  = require('../../utility/logger').logger;
const anx1Comm = require("../../db/queries");
const sqlite3 = require('sqlite3').verbose();
const {DB_PATH, DB_EXT} = require('../../utility/constants');



function getTab4adetails(gstin , rtnprd , flag) {
  logger.log("info","Starting getTab4details");
    return new Promise(function (resolve, reject) {
  let sql = anx1aQueries.table4a.getTab4details
  if(flag == "F")
    sql = anx1aQueries.table4a.getTab4detailsErr
      db.fetchAllById(sql,[rtnprd], gstin)
        .then(resultSet => {
          logger.log("info","getTab4details : %s" , resultSet);
        resolve(resultSet)})
        .catch(err => {
      reject(err)});
    });
  }
 
function save4aSummary(gstin, fp, taxperiod) {

  
    
    return new Promise(function (resolve, reject) {
    
        let summObj3H;
        return db.fetchById(anx1aQueries.table4a.calculate4Summ, [fp, taxperiod], gstin)
        .then((rows, err) => {
            if (err) {
         
            reject({ error: err, statusCd: STATUS_CD_ZERO });
            }
            else {
            summObj4 = rows;
            return true;
            }
        }).then((isSummaryCalculated) => {
            return db.getCount(anx1aQueries.table4a.getCountMarkForDelfor4, [fp, taxperiod], gstin);
        })
        .then((count) => {
            return save4SummaryIntoTable(gstin, fp, taxperiod, count, summObj4, "4A");
        })
        .then((isSummarySaved) => {
            resolve({ message: "SUCCESS", statusCd: STATUS_CD_ONE });
        })
        .catch((err) => {
          
            reject({ error: err, statusCd: STATUS_CD_ZERO });
        });
    });
    }

function save4aSummaryIntoTable(gstin, fp, taxperiod, mfd, summObj, tableTyp){
        logger.log("info", "inside save4SummaryIntoTable : %s, %s, %s, %s, %s,%s", gstin, fp, taxperiod, mfd,summObj, tableTyp)
        return new Promise(function (resolve, reject) {

        logger.log("info", "Delete existing summary data for: %s, %s, %s", gstin, fp, taxperiod)
        // Delete the existing summary data for the given fp and taxperiod
        return db.update(anx1aQueries.table4a.delete4summ, [fp, taxperiod, tableTyp], gstin)
            .then((data) => {
            return data;
            })
            .then((isSummaryDeleted) => {
              //insert the Summary details for Net
              logger.log("info", "Saving summary data for Table: %s, %s, %s, %s",tableTyp, gstin, fp, taxperiod)
              let sql = anx1aQueries.table4a.save4summ + "('" + tableTyp + "'," + summObj.noRec + ", 'I', NULL, NULL, '" + fp + "','" + taxperiod + "'," +summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," +  summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + ","+ summObj.supVal +","+ summObj.suprVal + ", 'DOC')," + 
              "('" + tableTyp + "'," + summObj.noRec + ", 'CR', NULL, NULL, '" + fp + "','" + taxperiod + "'," +summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," +  summObj.sgst + "," + summObj.cess + ",NULL, NULL," +  mfd + ","+ summObj.supVal +","+ summObj.suprVal + ", 'DOC')," + 
              "('" + tableTyp + "'," + summObj.noRec + ", 'DR', NULL, NULL, '" + fp + "','" + taxperiod + "'," +summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," +  summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + ","+ summObj.supVal +","+ summObj.suprVal + ", 'DOC')," + 
              "('" + tableTyp + "'," + summObj.noRec + ", 'N', NULL, NULL, '" + fp + "','" + taxperiod + "'," +summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," +  summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + ","+ summObj.supVal +","+ summObj.suprVal + ", 'DOC');" 
              return db.save(sql, [], gstin);

            })
            .then((isSummarySaved) => {
                resolve(isSummarySaved);
            })
            .catch((err) => {
            logger.log("info","Error in  save4SummaryIntoTable : %s  ::  %s", new Date().toString(),err);
            reject({ error: err, statusCd: STATUS_CD_ZERO });
            });
        });
    }


async function save4aSummaryIntoTableTxn(gstin, fp, taxperiod, mfd, summObj, tableTyp, gstindb) {
  try {
    logger.log("info", "Delete existing summary data for: %s, %s, %s", gstin, fp, taxperiod)
    // Delete the existing summary data for the given fp and taxperiod
    let deletedSum = await db.updateOrDeleteTxn(anx1aQueries.table4a.delete4summ, [fp, taxperiod, tableTyp], gstindb)

    let sql = anx1aQueries.table4a.save4summ + "('" + tableTyp + "'," + summObj.noRec + ", 'I', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC')," +
      "('" + tableTyp + "'," + summObj.noRec + ", 'CR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC')," +
      "('" + tableTyp + "'," + summObj.noRec + ", 'DR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC')," +
      "('" + tableTyp + "'," + summObj.noRec + ", 'N', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC');"
    let isSummarySaved = await db.saveTxn(sql, [], gstindb);
    return isSummarySaved

  } catch (error) {
    throw new Error(message = error.message)
  }

}
async function save4aErrorSummaryIntoTableTxn(gstin, fp, taxperiod, mfd, summObj, tableTyp, gstindb) {
  try {
    logger.log("info", "Delete existing summary data for: %s, %s, %s", gstin, fp, taxperiod)
    // Delete the existing summary data for the given fp and taxperiod
    console.log(summObj);
    let deletedSum = await db.updateOrDeleteTxn(anx1aQueries.table4a.delete4Errsumm, [fp, taxperiod, tableTyp], gstindb)

    let sql = anx1aQueries.table4a.save4Errsumm + "('" + tableTyp + "'," + summObj.noRec + ", 'I', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC')," +
      "('" + tableTyp + "'," + summObj.noRec + ", 'CR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC')," +
      "('" + tableTyp + "'," + summObj.noRec + ", 'DR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC')," +
      "('" + tableTyp + "'," + summObj.noRec + ", 'N', NULL, NULL, '" + fp + "','" + taxperiod + "'," + summObj.netVal + "," + summObj.igst + "," + summObj.cgst + "," + summObj.sgst + "," + summObj.cess + ",NULL, NULL," + mfd + "," + summObj.supVal + "," + summObj.suprVal + ", 'DOC');"
    let isSummarySaved = await db.saveTxn(sql, [], gstindb);
    return isSummarySaved

  } catch (error) {
    throw new Error(message = error.message)
  }

}

function get4aSummary(gstin, fp, taxperiod , isErrorSum){
    return new Promise(function (resolve, reject) {
    
      return db.fetchAllById((isErrorSum && isErrorSum=='F')?anx1aQueries.table4aErr.get4Summ:anx1aQueries.table4a.get4Summ, [fp, taxperiod, "4A"], gstin)
      .then((rows, err) => {
          if (err) {
          logger.log("info","Error in  save4SummaryIntoTable : %s  ::  %s", new Date().toString(),err);
          reject({ error: err, statusCd: STATUS_CD_ZERO });
          }
          else {
          if (rows === undefined) {
              resolve("{}");
          } else {
            logger.log("info","summary: %s" , rows);
              resolve(rows);
          }
          }
      })
  });
}

function getTab4aJson(gstin, rtnprd,flag){
    return new Promise(function (resolve, reject) {
      logger.log("info","Inside getTab4details: %s" , flag);
      let sql = anx1aQueries.table4a.getTab4json;
      if (flag == "F")
        sql = anx1aQueries.table4a.get4ErrJson;
      db.fetchAllById(sql, [rtnprd], gstin)
        .then(resultSet => resolve(resultSet))
        .catch(err => reject(err));
    })
  } 

 // with transactions :: table 4

/**
 * To save data into 3Jtable
 * @param {*} tab4
 * @param {*} items 
 * @param {*} gstin 
 */
async function saveTab4aTxn(itemList , gstin , fp, taxPeriod) {
    logger.log("info","Starting saveTab4Txn : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    try {
      gstindb.exec('BEGIN TRANSACTION;'); 
    let tab4Details = await Promise.map(itemList, async (tab4) => {
     await db.saveTxn(anx1aQueries.table4a.save4, [
        tab4.docref,
        tab4.etin,
        tab4.lgltrdname,
        tab4.sup,
        tab4.supr,
        tab4.nsup,
        tab4.supplytype,
        tab4.cgst,
        tab4.igst,
        tab4.sgst,
        tab4.cess,
        tab4.uplddt,
        tab4.fp,
        tab4.taxperiod,
        tab4.status,
        tab4.flag,
        tab4.errcode,
        tab4.errdetail
      ], gstindb);
      return {message : `Document(s) added successfully` , statusCd : "1" , etin :tab4.etin  }
    })

     await save4aSummaryTxn(gstin , fp ,taxPeriod, gstindb)  
  
      db.dbCommit(gstindb);
      
        logger.log("info","Ending saveTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());

        return(tab4Details)
        } catch (err) {
            logger.log("info","Error in  saveTab3jTxn : %s  ::  %s", new Date().toString(),err);
            if (err.message.includes("UNIQUE constraint failed"))
           throw new Error(message =  `Document already exists`);
         else
        return({ message: err.message, docref : itemList.docref ,
               statusCd: "0" });
        } finally{
          db.closeDBConn(gstindb)
        }
  }

 /**
 * 
 * @param {*} tab3j 
 * @param {*} items 
 * @param {*} gstin 
 * to edit data into table 3J
 */
async function editTab4aTxn(itemList, gstin, fp, taxperiod,flag,actionFlag) {
  logger.log("info","Starting editTab4Txn : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
      gstindb.exec('BEGIN TRANSACTION;'); 
      let tab4EditDetails = await Promise.map(itemList, async (tab4) => {
      await db.saveTxn(anx1aQueries.table4a.editTab4 , [
          tab4.docref ,
          tab4.etin , 
          tab4.lgltrdname , 
          tab4.sup , 
          tab4.supr ,          
          tab4.nsup , 
          tab4.cgst,
          tab4.igst,
          tab4.sgst,
          tab4.cess,
          tab4.status,
          tab4.flag ,
          null,
          tab4.errcd || null,
          tab4.errmsg || null,
          tab4.docid
        ] , gstindb)
        return {message : `Document updated successfully` , statusCd : "1" , etin :tab4.etin  }
      })
  
     await save4aSummaryTxn(gstin , fp , taxperiod,gstindb,flag,actionFlag)  
     db.dbCommit(gstindb)
   
     logger.log("info","Ending editTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
     return tab4EditDetails
     
      } 
      catch (err) {
        logger.log("info","Error editTab3jTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
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

async function save4aSummaryTxn(gstin, fp, taxperiod, gstindb,flag,actionFlag) {
  try {
    logger.log("info", "save4Summary : %s, %s, %s, %s", gstin, fp, taxperiod,flag)
    if(flag && flag=="F"){
      var summObj4  =await db.fetchByIdTxn(anx1aQueries.table4a.calculate4ErrSumm, [fp, taxperiod], gstindb)
      var count  = await db.getCountTxn(anx1aQueries.table4a.getCountYetToCorrectForDelfor4, [fp, taxperiod], gstindb);
      await save4aErrorSummaryIntoTableTxn(gstin, fp, taxperiod, count, summObj4, "4A",gstindb);
    }else if(flag && flag=="N"){
      if(actionFlag && actionFlag=="C"){
        var summObj4  =await db.fetchByIdTxn(anx1aQueries.table4a.calculate4ErrSumm, [fp, taxperiod], gstindb)
        var count  = await db.getCountTxn(anx1aQueries.table4a.getCountYetToCorrectForDelfor4, [fp, taxperiod], gstindb);
        await save4ErrorSummaryIntoTableTxn(gstin, fp, taxperiod, count, summObj4, "4A",gstindb);
      }
    } 
    var summObj4  =await db.fetchByIdTxn(anx1aQueries.table4a.calculate4Summ, [fp, taxperiod], gstindb)
    var count  = await db.getCountTxn(anx1aQueries.table4a.getCountMarkForDelfor4, [fp, taxperiod], gstindb);
    await save4aSummaryIntoTableTxn(gstin, fp, taxperiod, count, summObj4, "4A",gstindb);
    return ({ message: "SUCCESS", statusCd: STATUS_CD_ONE });
    
  } catch (error) {
    throw new Error(message = error.message)
  }
}


/**
 * To delete the 3j Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function deleteTab4aBydocidsTxn(docIds, gstin, fp, rtnprd,flag,actionFlag) {
    logger.log("info","Starting deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
      try {
      
      gstindb.exec('BEGIN TRANSACTION;');   
  
      // Async db call to check number of items available
      let docIdsResult = await db.fetchAllByIdInTransaction(anx1aQueries.table4a.getTab4ByDocIds, docIds, gstindb, true);
  
      if (docIdsResult.length === 0) {
        logger.log("info","End of deleteTab3jBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
        throw new Error(message = `No Document(s) found to delete`);
      } 
      else {
        logger.log("debug", "docIds : %s", JSON.stringify(docIdsResult));
  
        // input docIds and Db output docIdsResult are being compared to check all records are found in DB 
        //if any differnce found error will be thrown
        let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);
  
        if (diffRec.length === 0) {
          // Delete the items for the corresponding docrefs
        //  let deleteItemsBydocref = await db.deleteBySqlInClauseTxn(queries.anx1aQueries.itemDetails.deleteItemsByitemRef,_.map(docIdsResult, "docref"), gstindb);
        
         // logger.log("debug", "deleteItemsBydocref : %s", deleteItemsBydocref);
          // Delete DB call and get the number of records been deleted 
          let deleteRecords = await db.deleteBySqlInClauseTxn(anx1aQueries.table4a.deleteTab4ByDocIds,docIds, gstindb);
  
          await save4aSummaryTxn(gstin, fp, rtnprd,gstindb,flag,actionFlag);
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
      } finally{
        db.closeDBConn(gstindb)
      }
    };

  

module.exports={
    getTab4adetails: getTab4adetails,
    get4aSummary:get4aSummary,
    getTab4aJson : getTab4aJson,
    saveTab4aTxn:saveTab4aTxn,
    deleteTab4aBydocidsTxn:deleteTab4aBydocidsTxn,
    editTab4aTxn:editTab4aTxn,
    save4aSummaryTxn : save4aSummaryTxn

}
