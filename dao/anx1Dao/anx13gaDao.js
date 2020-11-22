const { anx1Queries } = require("../../db/Queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const _ = require("lodash");
const {DB_PATH, DB_EXT} = require('../../utility/constants');
const anx1Dao = require("../anx1Dao");
const anx1SummaryDao = require("../../dao/anx1SummaryDao");
const sqlite3 = require('sqlite3').verbose();
const log = require('../../utility/logger');
const logger = log.logger;



/**
 * This method will fetch all the 3bao documents
 * This method will be called during get3bao API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3gaDetails(gstin, rtnprd, flag) {

    logger.log("info", "Inside get3gaDetails for : %s, %s", gstin, rtnprd);
    return new Promise(function (resolve, reject) {
        let sql = anx1Queries.tableDEA.get3gaDocs
    
        if (flag == "F")
            sql = anx1Queries.tableDEA.get3gaDocsErr
        db.fetchAllById(sql, [rtnprd], gstin)
            .then(resultSet => {
                console.log("resultSet",resultSet)
                resolve(resultSet);
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * This method will be called during edit of Table 3GA Document.
 * This method will update the document level details and then update the item details and insert the newly added items.
 * @param {*} headerList 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function editdeaDao(headerList, fullItemList, gstin, fp, taxperiod, gstindb, flag) {

    logger.log("info", "Entering anx13gaDao.editdeaDao : %s  ::  %s", new Date().getTime(), new Date().toString());

    await db.saveRow(anx1Queries.tableDEA.UpdateDEA,
        [
        headerList.docref,
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
        headerList.claim_refund,
        headerList.rev_suptype,
        headerList.status,
        null,
        null,
        headerList.docid
    ],gstindb);
    
    logger.log("info", "Document updated successfully for DOCREF: %s", headerList.rev_docref);

    await anx1Dao.updateItemsBatch(fullItemList, gstindb);
    logger.log("info", "Items updated successfully for DOCREF: %s", headerList.rev_docref);

 await anx1SummaryDao.save3GASummary(gstindb, fp, taxperiod);

  if((flag && flag == "F") || headerList.flag == "C"){
    await anx1SummaryDao.save3GASummaryError(gstindb, fp, taxperiod, flag, headerList.flag);
    
  }
  logger.log("info","Exiting anx13gaDao.editdeaDao : %s  ::  %s", new Date().getTime(), new Date().toString()); 
    
}

 /**
 * This function will save 3GA details in DB
 * Once Data is saved in ANX1_3GA, data will be stored in ITEM_DEtails and then Summary will be calculated
 * 
 * @param {*} docObj3ga
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} dbConn   
 */
async function save3GAdetails(docObj3g, fullItemList, gstin, fp, taxperiod, gstindb, isImportJson) {
    
    logger.log("info","Entering anx13gDao.save3Gdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    
    await db.saveRow(anx1Queries.tableDEA.save, [docObj3g.docref,docObj3g.ctin,docObj3g.legaltradename,docObj3g.doctype,docObj3g.doc_num, docObj3g.doc_date, docObj3g.doc_year, 
        docObj3g.ctinTyp || null, docObj3g.upload_date,docObj3g.flag,docObj3g.rev_ctin,docObj3g.rev_legaltradename,docObj3g.rev_doctype,docObj3g.rev_doc_num,docObj3g.rev_doc_date,
        docObj3g.rev_doc_year,docObj3g.rev_doc_val,docObj3g.pos, docObj3g.diff_percentage, docObj3g.rev_sec7, docObj3g.taxable_value,docObj3g.rev_ctinTyp||null,docObj3g.igst, docObj3g.cgst, 
        docObj3g.sgst, docObj3g.cess, docObj3g.supply_type, docObj3g.clmrfnd,docObj3g.status || null, docObj3g.fp, docObj3g.taxperiod, docObj3g.errorcode || null,
        docObj3g.error_detail || null] , gstindb);
  
    logger.log("info","Document saved successfully for DOCREF: %s", docObj3g.docref);      
    
    await db.saveRow((anx1Queries.itemDetails.saveItemDetailsBatch + anx1Dao.getValuesToSaveItemDetailsBatch(fullItemList)), [], gstindb);
    logger.log("info","Items saved successfully for DOCREF: %s", docObj3g.docref);     
  
    if(isImportJson != undefined && isImportJson === false){
        await anx1SummaryDao.save3GASummary(gstindb, fp, taxperiod);
    }
    
    logger.log("info","Exiting anx13gDao.save3GAdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  }

//generate json for dao layer 3GA

function get3GAjSON(gstin, rtnprd,flag){
    return new Promise(function (resolve, reject) {
      console.log("Inside get3GAjSON" + flag)
      let sql = anx1Queries.tableDEA.get3GAjSON;
      if (flag == "F")
        sql = anx1Queries.tableDEA.get3GAErrJson;
      db.fetchAllById(sql, [rtnprd], gstin)
        .then(resultSet => resolve(resultSet))
        .catch(err => reject(err));
    })
  }

/**
 * To delete the 3B Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3gadocdao(docIds, dbName, fp, rtnprd,flag,actionflag) {
    logger.log("info","Entering delete3gadocdao : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
      try {
        
      gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
      gstindb.exec('BEGIN TRANSACTION;');   
  
      let docIdParams = `${docIds.join(',')}`;
  
      // Delete Item details
      await db.deleteData(anx1Queries.tableDEA.delete3gaItemsByDocId +  docIdParams + ") )", [], gstindb);
  
      /* Before deleting the documents, get the CTINS & docType for Summary Calculation. As 3K Summary will be calculated for the modified record only.
      Each time, we are not calculating the whole summary. Hence fetching CTIN at this poit is required */
      
      let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.tableDEA.getDistinctDocTypForDocIds, docIds, gstindb, true);
      

      if (docTypList.length === 0) {
        throw new Error(message = `No Document(s) found to delete`);
      } 
      else {
        logger.log("debug", "docIds : %s", JSON.stringify(docTypList));
      // Delete 3GA Docs call and get the number of records been deleted 
     let deleteRecords = await db.deleteData(anx1Queries.tableDEA.delete3gaByDocIds +  docIdParams + ")", [], gstindb);
     if(flag && flag == "F"){ //No need to check for flag here as we are doing so in save3GSummary message itself
      await anx1SummaryDao.save3GASummaryError(gstindb, fp, rtnprd,flag,actionflag);
    }else if(flag && flag == "N"){
      if(actionflag && actionflag == "C"){
        await anx1SummaryDao.save3GASummaryError(gstindb, fp, rtnprd,flag,actionflag);
      }
    }
    await anx1SummaryDao.save3GASummary(gstindb, fp, rtnprd);
      db.commitAndCloseDBConn(gstindb);
      return deleteRecords || 0;
  }       
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
async function delete3GAItemsByItemId(itemIds = [], dbName, fp, taxperiod, flag , actionflag) {
    // try catch block to handle error scenario
    let gstindb;
    try {
      logger.log("info","Entering delete3GAItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());
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
      //console.log(item[0].ITEMREF)
        // fetch row from 3BA table based on docRef
        let row3GA = await db.fetchAllByIdInTransaction(
            anx1Queries.tableDEA.get3gaDetailsByDocRef,
            [item[0].ITEMREF],
            gstindb
        );
        logger.log("debug", "row3GA : %s", JSON.stringify(row3GA));

       // console.log("row3GA", JSON.stringify(row3GA))
      
        let u = {
            TAXVAL: row3GA[0].REV_TAX_VALUE - item[0].TAXVAL || 0,
            IGST: row3GA[0].REV_IGST - item[0].IGST || 0,
            CGST: row3GA[0].REV_CGST - item[0].CGST || 0,
            SGST: row3GA[0].REV_SGST - item[0].SGST || 0,
            CESS: row3GA[0].REV_CESS - item[0].CESS || 0,
            DOCREF: item[0].ITEMREF
      };
      logger.log("debug", "updated row3GA : %s", JSON.stringify(u));
       
        // update record DB call
        await db.updateRow(anx1Queries.tableDEA.update3gaDetailsByDocRef,
            [u.TAXVAL, u.IGST, u.CGST, u.SGST, u.CESS, u.DOCREF],
            gstindb
        );
       
        // To update the status flag
       
      if(flag && flag == "F"){ //No need to check for flag here as we are doing so in save3GSummary message itself
      await db.updateRow(anx1Queries.tableDEA.update3gaFlagByDocRef, [u.DOCREF], gstindb);  // to update flag as corrected
      }
      await anx1SummaryDao.save3GASummary(gstindb, fp, taxperiod);

       if(flag && flag == "F"){ 
          await anx1SummaryDao.save3GASummaryError(gstindb, fp, taxperiod,flag,actionflag);
        }else if(flag && flag == "N"){
          if(actionflag && actionflag == "C"){
            await anx1SummaryDao.save3GASummaryError(gstindb, fp, taxperiod,flag,actionflag);
          }
        }    
        await db.commitAndCloseDBConn(gstindb);

        return "Item deleted successfully";

    } catch (error) {
      db.rollBackAndCloseDBConn(gstindb);
      throw new Error(error);
    }
};


module.exports = {

    editdeaDao:editdeaDao,
    get3gaDetails : get3gaDetails,
    get3GAjSON : get3GAjSON,
    delete3gadocdao:delete3gadocdao,
    delete3GAItemsByItemId:delete3GAItemsByItemId,
    save3GAdetails : save3GAdetails
}