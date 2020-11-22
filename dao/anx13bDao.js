const {  anx1Queries } = require("../db/Queries");
const db = require("../db/dbUtil");
const Promise = require("bluebird");
const {DB_PATH, DB_EXT} = require('../utility/constants');
const anx1SummaryDao = require("../dao/anx1SummaryDao");
const anx1Dao = require("../dao/anx1Dao");
const _ = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const log  = require('../utility/logger');
const logger = log.logger;

/**
 * This method will save the Document level and item details of table 3B
 * @param {*} docObj3B 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function save3Bdetails(docObj3B, fullItemList, gstin, fp, taxperiod, gstindb) {
  logger.log("info","Entering save3Bdetails : %s  ::  %s", new Date().getTime(), new Date().toString());  
    
  await db.saveRow(anx1Queries.table3b.save3b,
            [docObj3B.docref, docObj3B.ctin, docObj3B.legaltradename, docObj3B.pos, docObj3B.taxable_value, 
                docObj3B.igst, docObj3B.cgst, docObj3B.sgst, docObj3B.cess, docObj3B.diff_percentage, docObj3B.sec7, 
                docObj3B.supply_type, docObj3B.upload_date, docObj3B.flag, docObj3B.status || null, docObj3B.fp, 
                docObj3B.doc_type, docObj3B.taxperiod, docObj3B.errorcode || "NA", docObj3B.error_detail || "NA",
                docObj3B.doc_num, docObj3B.doc_date, docObj3B.doc_val, docObj3B.doc_year, docObj3B.ctinType], 
            gstindb);

  logger.log("info","Document saved successfully for DOCREF: %s", docObj3B.docref);            
  
  await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
  logger.log("info","Items saved successfully for DOCREF: %s", docObj3B.docref);     
    
  await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod,docObj3B.ctin, docObj3B.doc_type, gstindb, '3B');

  logger.log("info","Exiting save3btable : %s  ::  %s", new Date().getTime(), new Date().toString());
          
}

/** Delete by item 
 * @param {*} itemIds
 * @param {*} dbName
 * @param {*} fp
 * @param {*} taxperiod
*/
async function delete3BItemsByItemId(itemIds = [], dbName, fp, taxperiod, flag , status) {
    // try catch block to handle error scenario
    let gstindb;
    try {
      logger.log("info","Entering delete3BItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
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
      
        // fetch row from 3H table based on docRef
        let row3B = await db.fetchAllByIdInTransaction(
            anx1Queries.table3b.get3bDetailsByDocRef,
            [item[0].ITEMREF],
            gstindb
        );
        logger.log("debug", "row3B : %s", JSON.stringify(row3B));
      
        let u = {
            TAXVAL: row3B[0].TAX_VALUE - item[0].TAXVAL || 0,
            IGST: row3B[0].IGST - item[0].IGST || 0,
            CGST: row3B[0].CGST - item[0].CGST || 0,
            SGST: row3B[0].SGST - item[0].SGST || 0,
            CESS: row3B[0].CESS - item[0].CESS || 0,
            DOCREF: item[0].ITEMREF
      };
      logger.log("debug", "updated row3B : %s", JSON.stringify(u));
        
        // update record DB call
        await db.updateRow(anx1Queries.table3b.update3bDetailsByDocRef,
            [u.TAXVAL, u.IGST, u.CGST, u.SGST, u.CESS, u.DOCREF],
            gstindb
        );
        // To update the status flag
        if(status && status === "F"){
          await db.updateRow(anx1Queries.table3b.update3bFlagByDocRef, [u.DOCREF], gstindb);  // to update flag as corrected
        } 
        //For Summary Calculation
        logger.log("debug","Calling summary for DOC_REF : %s , %s", row3B[0].CTIN, row3B[0].DOCTYPE);
        await anx1SummaryDao.save3BSummary(dbName, fp, taxperiod, row3B[0].CTIN, row3B[0].DOCTYPE, gstindb, '3B');
        logger.log("debug", "Summary Calculated for  : %s , %s", row3B[0].CTIN, row3B[0].DOCTYPE);

        if(flag && flag == "F"){
          await anx1SummaryDao.save3BSummary(dbName, fp, taxperiod, row3B[0].CTIN, row3B[0].DOCTYPE, gstindb, '3B', flag);
          logger.log("debug", "Error Summary Calculated for  : %s , %s", row3B[0].CTIN, row3B[0].DOCTYPE);
        }
        await db.commitAndCloseDBConn(gstindb);

        return "Item deleted successfully";

    } catch (error) {
      db.rollBackAndCloseDBConn(gstindb);
      throw new Error(error);
    }
};

/**
 * This method will fetch all the 3b documents
 * This method will be called during get3b API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3bDetails(gstin, rtnprd , flag) {

    logger.log("info", "Inside get3bDetails for : %s, %s",gstin,rtnprd);
    return new Promise(function (resolve, reject) {
      let sql = anx1Queries.table3b.get3bDocs
      if(flag == "F")
       sql = anx1Queries.table3b.get3bDocserr
      db.fetchAllById(sql, [rtnprd], gstin)
        .then(resultSet => {
          resolve(resultSet);
        })
        .catch(err => {
          reject(err);
        });
    });
}

//generate json for dao layer for 3B

function get3bDetailsjSON(gstin, rtnprd,flag){
  return new Promise(function (resolve, reject) {
    logger.log("info", "Inside get3bDetailsjSON, Flag : %s",flag)
    let sql = anx1Queries.table3b.get3bDetailsJson;
    if (flag == "F")
      sql = anx1Queries.table3b.get3bErrJson;
    db.fetchAllById(sql, [rtnprd], gstin)
      .then(resultSet => resolve(resultSet))
      .catch(err => reject(err));
  })
}

/**
 * This method will be called during edit of Table 3A Document.
 * This method will update the document level details and then update the item details and insert the newly added items.
 * @param {*} docObj3B 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function updateb2bdetails (docObj3b, fullItemList, gstin, fp, taxperiod, gstindb, flag) {

  logger.log("info","Entering anx13bDao.updateb2bdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  
  await db.saveRow(anx1Queries.table3b.updateb2b,
              [docObj3b.docref, docObj3b.ctin, docObj3b.legaltradename, docObj3b.doc_type,
            docObj3b.diff_percentage, docObj3b.sec7, docObj3b.flag, docObj3b.pos,
            docObj3b.supply_type, docObj3b.doc_num, docObj3b.doc_date, docObj3b.doc_val,
            docObj3b.doc_year, docObj3b.taxable_value, docObj3b.igst, docObj3b.cgst, docObj3b.sgst,
            docObj3b.cess, null ,null, null,null,docObj3b.docid], gstindb);
  
  logger.log("info","Document updated successfully for DOCREF: %s", docObj3b.docref);  
           
  await anx1Dao.updateItemsBatch(fullItemList, gstindb);
  logger.log("info","Items updated successfully for DOCREF: %s", docObj3b.docref);  

  await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3b.ctin, docObj3b.doc_type ,gstindb, '3B');
  if (docObj3b.ctin != docObj3b.orgCtin || docObj3b.doc_type != docObj3b.orgDocTyp) {
        await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3b.orgCtin, docObj3b.orgDocTyp, gstindb, '3B');
  }

  if((flag && flag == "F") || docObj3b.flag == "C"){
    await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3b.ctin, docObj3b.doc_type ,gstindb, '3B', "F");
    if (docObj3b.ctin != docObj3b.orgCtin || docObj3b.doc_type != docObj3b.orgDocTyp) {
      await anx1SummaryDao.save3BSummary(gstin, fp, taxperiod, docObj3b.orgCtin, docObj3b.orgDocTyp, gstindb, '3B', "F");
    }
  }
  
  logger.log("info","Exiting anx13bDao.updateb2bdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    
}
  
/**
 * To delete the 3B Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3bdocdao(docIds, dbName, fp, rtnprd) {
  logger.log("info","Entering delete3bdocdao : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;
    try {
      
    gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    gstindb.exec('BEGIN TRANSACTION;');   

    let docIdParams = `${docIds.join(',')}`;

    // Delete Item details
    await db.deleteData(anx1Queries.table3b.delete3bItemsByDocId +  docIdParams + ") )", [], gstindb);

    /* Before deleting the documents, get the CTINS & docType for Summary Calculation. As 3K Summary will be calculated for the modified record only.
    Each time, we are not calculating the whole summary. Hence fetching CTIN at this poit is required */
    let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForDocIds, docIds, gstindb, true);
    let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForDocIds, docIds, gstindb, true);

    // Delete 3A Docs call and get the number of records been deleted 
    let deleteRecords = await db.deleteData(anx1Queries.table3b.delete3bByDocIds +  docIdParams + ")", [], gstindb);
      
    console.log("Delete existing summary data for :" + dbName + "," + fp + "," + rtnprd + "," + ctinList);
    
    let ctinParams = `${_.map(ctinList, "CTIN").join('","')}`;
    let docTypParams = `${_.map(docTypList, "DOCTYPE").join('","')}`;

    // Delete the existing summary data for the fetched CTIN and DOC_TYPE
    await db.deleteData('DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and CTIN IN ("' + ctinParams + '") or DOC_TYPE IN ("N","' + docTypParams + '");', [fp, rtnprd], gstindb);
    await db.deleteData('DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and CTIN IN ("' + ctinParams + '") or DOC_TYPE IN ("N","' + docTypParams + '");', [fp, rtnprd], gstindb);

    for(let i=0; i<ctinList.length; i++){
        await anx1SummaryDao.save3BSummaryByType(dbName, fp, rtnprd, gstindb, ctinList[i].CTIN, "","3B", "CTIN");
        await anx1SummaryDao.save3BErrorSummaryByType(dbName, fp, rtnprd, gstindb, ctinList[i].CTIN, "","3B", "CTIN"); 
    }
    logger.log("debug","CTIN Summary Calculated");  

    for(let j=0; j<docTypList.length; j++){
      await anx1SummaryDao.save3BSummaryByType(dbName, fp, rtnprd, gstindb, "", docTypList[j].DOCTYPE,"3B", "DOC");  
      await anx1SummaryDao.save3BErrorSummaryByType(dbName, fp, rtnprd, gstindb, "", docTypList[j].DOCTYPE,"3B", "DOC");  
    }
    logger.log("debug","DOC Summary Calculated");

    db.commitAndCloseDBConn(gstindb);
    return deleteRecords || 0;
        
  } catch (error) {
      db.rollBackAndCloseDBConn(gstindb);
      throw new Error(error);
  }
};

module.exports = {
    
    save3Bdetails: save3Bdetails,
    get3bDetails: get3bDetails,
    delete3BItemsByItemId: delete3BItemsByItemId,
    updateb2bdetails : updateb2bdetails,
    delete3bdocdao : delete3bdocdao,
    get3bDetailsjSON :get3bDetailsjSON
}