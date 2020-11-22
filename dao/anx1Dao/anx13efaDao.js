const { anx1Queries } = require("../../db/Queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const { DB_PATH, DB_EXT, STATUS_CD_ZERO } = require('../../utility/constants');
const anx1Dao = require("../../dao/anx1Dao");
const sqlite3 = require('sqlite3').verbose();
const log  = require('../../utility/logger');
const logger = log.logger;
/**
 * This method will fetch all the 3EF documents
 * This method will be called during get3EF API
 * @param {*} gstin 
 * @param {*} rtnprd 
 */
function get3efaDetails(gstin, rtnprd , flag) {

    logger.log("info","Entering get3efaDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    return new Promise(function (resolve, reject) {
      let sql = anx1Queries.tableSEZA.get3efaDocs
      if(flag == "F") 
      sql = anx1Queries.tableSEZA.get3efaDocsErr;
      db.fetchAllById(sql , [rtnprd], gstin)
        .then(resultSet => {
            logger.log("info","Exiting get3efaDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
            resolve(resultSet);
        })
        .catch(err => {
          reject(err);
        });
    });
}

/**
 * To calculate the 3EFA Summary
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3EFASummary (gstindb, fp, taxperiod, flag, actionFlag) {
  logger.log("info","Entering anx1SummaryDao.save3EFASummary : %s  ::  %s", new Date().getTime(), new Date().toString());


  try{
  var mfdMap = new Map();
  var docMfdMap = new Map();
  let mfdMapKeys = [], docMfdMapKeys = [];
  let mfd = 0;

  let rejCount = 0; // Rejected records to be handled

  let wpRecords = 0, wpTotalval = 0, wpIgst = 0, wpCess = 0, wpMfd = 0;
  let wopRecords = 0, wopTotalval = 0, wopMfd = 0;
  
  let iRecords = 0, iTotalval = 0, iIgst = 0, iCess = 0, iMfd = 0;
  let crRecords = 0, crTotalval = 0, crIgst = 0, crCess = 0, crMfd = 0;
  let drRecords = 0, drTotalval = 0, drIgst = 0, drCess = 0, drMfd = 0;
  let nRecords = 0, nTotalval = 0, nIgst = 0, nCess = 0, nMfd = 0;

  var summSql = "";
  let rows;
  let docMfdRows;
  let efSummObj;

  if((flag && flag == "N" && actionFlag && actionFlag == "C") || (flag && flag == 'F')){
    // Delete the existing summary data for 3EF Table for the given fp and taxperiod
    await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3EFA"], gstindb);
    //To get the count of records of Yet to be Corrected  - PayType Summary
    rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrect3EFA, [fp, taxperiod], gstindb);

    efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3EFASumm, [fp, taxperiod], gstindb);
  } else {
      // Delete the existing summary data for 3EF Table for the given fp and taxperiod
    await db.deleteData(anx1Queries.summary.delete3Aor3Hsumm, [fp, taxperiod, "3EFA"], gstindb);
    //To get the count of records of Marked For Delete  - PayType Summary
    rows = await db.getRows(anx1Queries.summary.getCountMarkForDelete3EFA, [fp, taxperiod],gstindb);

    //To get the count of records of Marked For Delete  - DocWise Summary
    docMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3EFAConsolidatedsummary, [fp, taxperiod], gstindb);    

    efSummObj = await db.getRows(anx1Queries.summary.calculate3EFASumm, [fp, taxperiod], gstindb);
  }


if(rows != undefined && rows.length >0) {
    await Promise.mapSeries(rows, (mfdObj) => {
        mfdMap.set(mfdObj.type, mfdObj.count);  // Adding MFD values in a Map with key as "PayTyp-DocType"
        mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
    });   
 
}
 
if(docMfdRows != undefined && docMfdRows.length >0) {
    await Promise.mapSeries(docMfdRows, (mfdObj) => {
        docMfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
        docMfdMapKeys = Array.from(docMfdMap.keys());  // Adding docTypes available in MfdMap in an array
    });   

}

 if(efSummObj != undefined && efSummObj.length > 0){
  
  await Promise.mapSeries(efSummObj, (efObj) =>{
      mfd = 0;
      if(mfdMap.get(efObj.payTyp + "-" + efObj.docTyp) != undefined){
          mfd = mfdMap.get(efObj.payTyp + "-" + efObj.docTyp);
      }

      if( mfdMapKeys.indexOf(efObj.payTyp + "-" + efObj.docTyp) >= 0){
          mfdMapKeys.splice(mfdMapKeys.indexOf(efObj.payTyp + "-" + efObj.docTyp), 1); // Remove the payTyp - docType combo for which mfd is added in summary
      }

      if( docMfdMapKeys.indexOf(efObj.docTyp) >= 0){
          docMfdMapKeys.splice(docMfdMapKeys.indexOf(efObj.docTyp), 1); // Remove the docType for which mfd is added in summary
      }

      if(efObj.docTyp == "CR"){    // For Consolidated Summary
          crRecords += efObj.noRec;
          crTotalval += efObj.totVal;
          crIgst += efObj.igst;
          crCess += efObj.cess;
          
          if(docMfdMap.get(efObj.docTyp) != undefined){
              crMfd = docMfdMap.get(efObj.docTyp);
          }
      }

      if(efObj.docTyp == "DR"){   // For Consolidated Summary
          drRecords += efObj.noRec;
          drTotalval += efObj.totVal;
          drIgst += efObj.igst;
          drCess += efObj.cess;

          if(docMfdMap.get(efObj.docTyp) != undefined){
              drMfd = docMfdMap.get(efObj.docTyp);
          }
      }

      if(efObj.docTyp == "I"){   // For Consolidated Summary
          iRecords += efObj.noRec;
          iTotalval += efObj.totVal;
          iIgst += efObj.igst;
          iCess += efObj.cess;

          if(docMfdMap.get(efObj.docTyp) != undefined){
              irMfd = docMfdMap.get(efObj.docTyp);
          }
      }

      if(efObj.payTyp == "Y"){
          wpRecords += efObj.noRec;
          wpMfd += mfd;

          if(efObj.docTyp == "CR"){    
              wpCess -= parseFloat(efObj.cess);
              wpIgst -= parseFloat(efObj.igst);
              wpTotalval -= parseFloat(efObj.totVal);
          } else {
              wpCess += parseFloat(efObj.cess);
              wpIgst += parseFloat(efObj.igst);
              wpTotalval += parseFloat(efObj.totVal);
          }
          summSql = summSql + "('3EFA'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal.toFixed(2) + "," +  efObj.igst.toFixed(2) + ",NULL, NULL," + efObj.cess.toFixed(2) + ",'" + efObj.payTyp + "'," + rejCount + "," + mfd + ",NULL, NULL, 'PAY_TYP'),";    
      } else 
      if(efObj.payTyp == "N"){
          wopRecords += efObj.noRec;
          wopMfd += mfd;

          if(efObj.docTyp == "CR"){    
              wopTotalval -= parseFloat(efObj.totVal);
          } else {
              wopTotalval += parseFloat(efObj.totVal);
          }

          summSql = summSql + "('3EFA'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal + ",NULL ,NULL, NULL, NULL,'" + efObj.payTyp + "'," + rejCount + "," + mfd + ",NULL, NULL, 'PAY_TYP'),";
      }
      
  });
  } 
      // To add mark for delete for paytyp-docTypes for which no records available for summary other than MFD
      if(mfdMapKeys != undefined && mfdMapKeys.length > 0) {
          await Promise.mapSeries(mfdMapKeys, (docTyp) => {
              let mfdVal = docTyp.split("-");
              if(mfdVal[0] === 'Y'){
                  wpMfd += mfdMap.get(docTyp);
              } 
              else if(mfdVal[0] === 'N'){
                  wopMfd += mfdMap.get(docTyp);
              }
              summSql = summSql + "('3EFA', 0,'" + mfdVal[1] + "', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'" + mfdVal[0] + "'," + rejCount + "," + mfdMap.get(docTyp) + ",NULL, NULL, 'PAY_TYP'),";
          });
      }  

  
  
  //To save the Net Summary for sezwpa and sezwopa
  summSql = summSql + "('3EFA'," + wpRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + wpTotalval.toFixed(2) + "," + wpIgst.toFixed(2) + ",NULL, NULL," + wpCess.toFixed(2) + ",'Y'," + rejCount + "," + wpMfd + ",NULL, NULL, 'PAY_TYP'),";
  summSql = summSql + "('3EFA'," + wopRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + wopTotalval.toFixed(2) + ",NULL, NULL, NULL, NULL, 'N'," + rejCount + "," + wopMfd + ",NULL, NULL, 'PAY_TYP'),";
  //Doc Wise Summary
  summSql = summSql + "('3EFA'," + iRecords + ", 'I', NULL, NULL,'" + fp + "','" + taxperiod + "'," + iTotalval.toFixed(2) + "," + iIgst.toFixed(2) + ", NULL, NULL, " + iCess.toFixed(2) + ", NULL," + rejCount + "," + iMfd + ",NULL, NULL, 'DOC'),";
  summSql = summSql + "('3EFA'," + crRecords + ", 'CR', NULL, NULL,'" + fp + "','" + taxperiod + "'," + crTotalval.toFixed(2) + "," + crIgst.toFixed(2) + ", NULL, NULL, " + crCess.toFixed(2) + ", NULL," + rejCount + "," + crMfd + ",NULL, NULL, 'DOC'),";
  summSql = summSql + "('3EFA'," + drRecords + ", 'DR', NULL, NULL,'" + fp + "','" + taxperiod + "'," + drTotalval.toFixed(2) + "," + drIgst.toFixed(2) + ", NULL, NULL, " + drCess.toFixed(2) + ", NULL," + rejCount + "," + drMfd + ",NULL, NULL, 'DOC'),";

  nRecords = iRecords + crRecords + drRecords;
  nTotalval = iTotalval + drTotalval - crTotalval;
  nIgst = iIgst + drIgst - crIgst;
  nCess = iCess + drCess - crCess;

  summSql = summSql + "('3EFA'," + nRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + nTotalval.toFixed(2) + "," + nIgst.toFixed(2) + ", NULL, NULL, " + nCess.toFixed(2) + ", NULL," + rejCount + "," + nMfd + ",NULL, NULL, 'DOC')";
  

  

  //To get the count of records of Marked For Delete for Rejected Documents - PayType Summary
  let rejMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3EFARejectedDocs, [fp, taxperiod],gstindb);
  let rejSummObj = await db.getRows(anx1Queries.summary.calculate3EFASummForRejectedDocs, [fp, taxperiod], gstindb);
  
  let rejSQL = calculateRejectedDocsSummaryFor3EFA(fp, taxperiod, rejMfdRows, rejSummObj);

  if(rejSQL != ""){
      summSql = summSql + "," + rejSQL;
  } else {
      summSql = summSql + ";"
  }
  
  if((flag && flag == "N" && actionFlag && actionFlag == "C") || (flag && flag == 'F')){
    await db.saveRow(anx1Queries.errorSummary.save3EFSumm + summSql, [], gstindb);
  } else {
    await db.saveRow(anx1Queries.summary.save3EFSumm + summSql, [], gstindb);
  }
  
  logger.log("info","Exiting anx1SummaryDao.save3EFASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
  return Promise.resolve(true);
}catch(err) {
  return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO });
}
  
}

/**
 * THis function will calculate the summary for Rejected Documents and form the SQL
 */
function calculateRejectedDocsSummaryFor3EFA(fp, taxperiod, rejMfdRows, efSummObj){

  var rejMfdMap = new Map(); 
  let rejMfdMapKeys = [], rejMfd = 0;
  let rejWpRecords = 0, rejWpTotalval = 0, rejWpIgst = 0, rejWpCess = 0, rejWpMfd = 0;
  let rejWopRecords = 0, rejWopTotalval = 0, rejWopMfd = 0;
  let rejCount = 0;

  let sql = "";

      //To get the count of records of Marked For Delete for Rejected Documents - PayType Summary
      if(rejMfdRows != undefined && rejMfdRows.length >0) {
          
          rejMfdRows.map((mfdObj) =>{
              rejMfdMap.set(mfdObj.type, mfdObj.count);  // Adding MFD values in a Map with key as "PayTyp-DocType"
              rejMfdMapKeys = Array.from(rejMfdMap.keys());  // Adding docTypes available in MfdMap in an array
          });
      }
  
      if(efSummObj != undefined && efSummObj.length > 0){
          efSummObj.map((efObj) =>{
              rejMfd = 0;
              if(rejMfdMap.get(efObj.payTyp + "-" + efObj.docTyp) != undefined){
                  rejMfd = rejMfdMap.get(efObj.payTyp + "-" + efObj.docTyp);
              }
  
              if(efObj.payTyp == "Y"){
                  rejWpRecords += efObj.noRec;
                  rejWpMfd += rejMfd;
      
                  if(efObj.docTyp == "CR"){    
                      rejWpCess -= parseFloat(efObj.cess);
                      rejWpIgst -= parseFloat(efObj.igst);
                      rejWpTotalval -= parseFloat(efObj.totVal);
                  } else {
                      rejWpCess += parseFloat(efObj.cess);
                      rejWpIgst += parseFloat(efObj.igst);
                      rejWpTotalval += parseFloat(efObj.totVal);
                  }
              } else 
              if(efObj.payTyp == "N"){
                  rejWopRecords += efObj.noRec;
                  rejWopMfd += rejMfd;
      
                  if(efObj.docTyp == "CR"){    
                      rejWopTotalval -= parseFloat(efObj.totVal);
                  } else {
                      rejWopTotalval += parseFloat(efObj.totVal);
                  }
              }
          });

          sql = "('3EFA'," + rejWpRecords + ",'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "'," + rejWpTotalval + "," +  rejWpIgst + ",NULL, NULL," + rejWpCess + ", 'Y'," + rejCount + "," + rejWpMfd + ",NULL, NULL, 'PAY_TYP'),";    
          sql = sql + "('3EFA'," + rejWopRecords + ",'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "'," + rejWopTotalval + ",NULL ,NULL, NULL, NULL, 'N'," + rejCount + "," + rejWopMfd + ",NULL, NULL, 'PAY_TYP');";
      } else {
          // To add mark for delete for Rejected Docs -  paytyp-docTypes for which no records available for summary other than MFD
          if(rejMfdMapKeys != undefined && rejMfdMapKeys.length > 0) {
              rejMfdMapKeys.map((docTyp) =>{
                  let mfdVal = docTyp.split("-");
                   if(mfdVal[0] === 'Y'){
                       rejWpMfd += rejMfdMap.get(docTyp);
                   } 
                   else if(mfdVal[0] === 'N'){
                       rejWopMfd += rejMfdMap.get(docTyp);
                   }
              });
              sql = sql + "('3EFA', 0, 'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'Y', 0," + rejWpMfd + ",NULL, NULL, 'PAY_TYP'),";
              sql = sql + "('3EFA', 0, 'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'N', 0," + rejWopMfd + ",NULL, NULL, 'PAY_TYP');";
          }  
      }
      return sql;
}


/**
 * generate json for dao layer 3EFA
 * @param {*} rtnprd 
 * @param {*} type 
 * @param {*} gstin 
 * @param {*} flag 
 */
function get3EFAjSON(rtnprd ,type ,gstin,flag){
    logger.log("info","Entering get3EFAjSON : %s  ::  %s", new Date().getTime(), new Date().toString());
    return new Promise(function (resolve, reject) {

      let sql = anx1Queries.tableSEZA.get3EFAjSON;
      if (flag == "F")
        sql = anx1Queries.tableSEZA.get3EFAErrJson;
      db.fetchAllById(sql, [rtnprd,type], gstin)
        .then(resultSet => { 
          logger.log("info","Exiting get3EFAjSON : %s  ::  %s", new Date().getTime(), new Date().toString());
          resolve(resultSet)
        })
        .catch(err => reject(err));
    })
  }

/**
 * To delete the 3EFA Documents based on DOC Id
 * @param {*} docIds 
 * @param {*} dbName 
 * @param {*} fp 
 * @param {*} rtnprd 
 */
async function delete3EFAdao(docIds, dbName, fp, taxperiod) {
    logger.log("info","Entering delete3EFAdao : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
      try {
        
      gstindb = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
      gstindb.exec('BEGIN TRANSACTION;');   
  
      let docIdParams = `${docIds.join(',')}`;
  
      // Delete Item details
 

      await db.deleteData(anx1Queries.tableSEZA.delete3EFAItems +  docIdParams + ') )', [], gstindb);
  
      // Delete 3EFA Docs call and get the number of records been deleted 
      let deleteRecords = await db.deleteData(anx1Queries.tableSEZA.delete3efaByDoc +  docIdParams + ")", [], gstindb);

        
      await save3EFASummary(gstindb, fp, taxperiod);

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
async function delete3EFAItem(itemIds = [], dbName, fp, taxperiod, flag , status) {
    // try catch block to handle error scenario
    let gstindb;
    try {
      logger.log("info","Entering delete3EFAItem : %s  ::  %s", new Date().getTime(), new Date().toString());
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
      
        // fetch row from 3EFA table based on docRef
        let row3EFA = await db.fetchAllByIdInTransaction(
            anx1Queries.tableSEZA.get3EFAByDocRef,
            [item[0].ITEMREF],
            gstindb
        );
        logger.log("debug", "row3EFA : %s", JSON.stringify(row3EFA));


      
        let u = {
            TAXVAL: row3EFA[0].REV_TAX_VALUE - item[0].TAXVAL || 0,
            IGST: row3EFA[0].REV_IGST - item[0].IGST || 0,
            CESS: row3EFA[0].REV_CESS - item[0].CESS || 0,
            DOCREF: item[0].ITEMREF
      };
      logger.log("debug", "updated row3EFA : %s", JSON.stringify(u));
       
        // update record DB call
        await db.updateRow(anx1Queries.tableSEZA.update3EFAByDocRef,
            [u.TAXVAL, u.IGST, u.CESS, u.DOCREF],
            gstindb
        );

         // To update the status flag
         if(status && status === "F"){
            await db.updateRow(anx1Queries.tableSEZA.update3EFAFlag, [u.DOCREF], gstindb);  // to update flag as corrected
          } 
       
        await save3EFASummary(gstindb, fp, taxperiod);
        
        await db.commitAndCloseDBConn(gstindb);

        return "Item deleted successfully";

    } catch (error) {
      db.rollBackAndCloseDBConn(gstindb);
      throw new Error(error);
    }
};

  

/**
 * This method will be called during edit of Table 3EFA Document.
 * This method will update the document level details and then update the item details and insert the newly added items.
 * @param {*} headerList 
 * @param {*} fullItemList 
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function edit3EFADao(headerList, fullItemList, gstin, fp, taxperiod, gstindb, flag) {
    logger.log("info", "Entering anx13efaDao.Editefa : %s  ::  %s", new Date().getTime(), new Date().toString());
     

    await db.updateRow(anx1Queries.tableSEZA.Update3EFA,[
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
        headerList.rev_tax_value,
        headerList.rev_igst,
        headerList.rev_cess,
        headerList.rev_suptype,
		headerList.pay_typ,
		headerList.clmrfnd,
        headerList.status,
        null,
        null,
        headerList.docid
    ],gstindb);
    logger.log("info", "Document updated successfully for DOCREF: %s", headerList.rev_docref);
  
    await anx1Dao.updateItemsBatch(fullItemList, gstindb);
    logger.log("info", "Items updated successfully for DOCREF: %s", headerList.rev_docref);
    await save3EFASummary(gstindb, fp, taxperiod);

    if(headerList.flag == "C"){
        await save3EFASummary(gstindb, fp, taxperiod, "F", "C");
    }
    logger.log("info","Exiting Anx1b2baDao.editB2BADao : %s  ::  %s", new Date().getTime(), new Date().toString());
    
}
module.exports={
    get3efaDetails : get3efaDetails,
    save3EFASummary:save3EFASummary,
    get3EFAjSON : get3EFAjSON,
    delete3EFAdao : delete3EFAdao,
    delete3EFAItem :  delete3EFAItem,
    edit3EFADao : edit3EFADao
 }