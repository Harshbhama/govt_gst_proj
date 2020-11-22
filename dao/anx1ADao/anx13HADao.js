// const { anx1aQueries } = require("../../db/queriesanx1a");
const queries = require("../../db/queries");
const db = require("../../db/dbUtil");
const Promise = require("bluebird");
const sqlite3 = require("sqlite3").verbose();
const { STATUS_CD_ONE, DB_PATH, DB_EXT} = require("../../utility/constants");
const _ = require("lodash");
const { save3Aor3HSummaryTxn} = require("../anx1SummaryDao");
const logger = require("../../utility/logger").logger;
const anx1Comm = require("../../db/queriesanx1a");

async function savetab3HATxn(tab3h, items, gstin, fp, taxperiod) {
  logger.log(
    "info",
    "Starting saveTab3HTxn : %s  ::  %s",
    new Date().getTime(),
    new Date().toString()
  );
  let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
    gstindb.exec("BEGIN TRANSACTION;");

    await db.saveTxn(
      anx1Comm.anx1aQueries.table3ha.save3h,
      [
        tab3h.docref,
        tab3h.ctin,
        tab3h.legaltradename,
        tab3h.pos,
        tab3h.taxable_value,
        tab3h.igst,
        tab3h.cgst,
        tab3h.sgst,
        tab3h.cess,
        tab3h.diff_percentage,
        tab3h.sec7,
        tab3h.supply_type,
        tab3h.upload_date,
        tab3h.flag,
        tab3h.status || null,
        tab3h.fp,
        tab3h.doc_type,
        tab3h.taxperiod,
        tab3h.errorcode || "NA",
        tab3h.error_detail || "NA",
        tab3h.rfndelg
      ],
      gstindb
    );

    await db.saveTxn(anx1Comm.anx1aQueries.itemDetails.saveItemDetailsBatch +
        prepareItems3H(items), [],gstindb);

    await save3HASummaryTxn(gstin, fp, taxperiod,gstindb);
    db.dbCommit(gstindb)
   // db.closeDBConn(gstindb)

    return {
      message: "Document added successfully",
      statusCd: "1",
      ctin: tab3h.ctin,
      pos: tab3h.pos,
      diff_percentage: tab3h.diff_percentage,
      sec7: tab3h.sec7
    };
  } catch (err) {
    logger.log( "info", "Error in  saveTab3HTxn : %s  ::  %s", new Date().toString(), err);
    if (err.message.includes("UNIQUE constraint failed")){
    return { message: `Document already exists`, statusCd: "0", ctin: tab3h.ctin , pos : tab3h.pos ,
      diff_percentage : tab3h.diff_percentage , sec7 : tab3h.sec7 
    }} else { 
    throw new Error(message = err.message)
  }
  }finally{
    db.closeDBConn(gstindb)
  }

};


// to get  details for a particular document in table 3H
async function gettable3HAdetailsTxn(gstin , rtnprd , flag) {
  logger.log( "info", "Starting gettable3HdetailsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
let sql  = (flag !== "F") ? anx1Comm.anx1aQueries.table3ha.get3hDetails : anx1Comm.anx1aQueries.table3ha.get3hDetailsErr
 
let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  try {
    gstindb.exec("BEGIN TRANSACTION;");
      let getData = await db.fetchAllByIdTxn(sql,[rtnprd], gstindb, false)
      db.dbCommit(gstindb)
      return getData
  }catch (error){
    throw new Error (message = error.message)
}finally{
  db.closeDBConn(gstindb)
}
}


  /**
   * 
   * @param {*} tab3H 
   * @param {*} items 
   * @param {*} gstin 
   * to edit data into table 3H
   */
  async function editTab3HATxn(tab3H ,items, gstin, flag ) {
    logger.log("info","Starting editTab3HTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    let docref  = tab3H.docref;
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    try {
      
        gstindb.exec('BEGIN TRANSACTION;'); 
        let insertItems = [];
        let updateItems = [];
  
        items.forEach((item) => ( _.isUndefined(item.itemid) ? insertItems : updateItems).push(item));
  
         await db.saveTxn(
            anx1Comm.anx1aQueries.table3ha.update3h,
            [tab3H.docref,
            tab3H.ctin,
            tab3H.legaltradename,
            tab3H.pos,
            tab3H.taxable_value,
            tab3H.igst,
            tab3H.cgst,
            tab3H.sgst,
            tab3H.cess,
            tab3H.diff_percentage,
            tab3H.sec7,
            tab3H.supply_type,
            tab3H.flag,
            tab3H.status || null,
            null,
            null ,
            null ,
            tab3H.rfndelg,
            tab3H.docid                   
          ] , gstindb)
             /** update Item details */
       let updateRecordCount = await updateItemsTxn(updateItems, gstindb) || 0
        /** Insert the new Items provided as input */
  
        let insertRecordCount = 0
        if(insertItems.length > 0)
       
        insertRecordCount = await db.saveTxn(anx1Comm.anx1aQueries.itemDetails.saveItemDetailsBatch + prepareItems3H(insertItems),[], gstindb)  
        if(items.length !== (insertRecordCount + updateRecordCount)) { 
          throw new Error(message = "Error in updating Item Details") 
        } 
    
       await save3HASummaryTxn(gstin, tab3H.fp , tab3H.taxperiod, gstindb);  

       if(tab3H.flag == "C" || (flag && flag == "F")){ // Summary to be calculated for error flow - corrected records
          await save3HASummaryTxn(gstin, tab3H.fp , tab3H.taxperiod, gstindb, "F");  
       }

       db.dbCommit(gstindb)
       logger.log("info","Ending editTab3HTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
       return { message: "Document updated successfully", statusCd: STATUS_CD_ONE}
       
        } 
        catch (err) {
          logger.log("info","Error editTab3HTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
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
  
  
  async function updateItemsTxn(items = [], gstindb) {
      let updatedRecordsCount = await items.map( async (item) => {
      await db.saveTxn(anx1Comm.anx1aQueries.itemDetails.updateItemDetails, [
        item.hsn, item.apptaxrate, item.taxable_value,
        item.igst, item.cgst || null, item.sgst || null,
        item.cess, item.itemref, item.itemid], gstindb)
    }) 
  
    return updatedRecordsCount.length
  }
  
  
  /**
   * To delete the 3H Documents based on DOC Id
   * @param {*} docIds 
   * @param {*} dbName 
   * @param {*} fp 
   * @param {*} rtnprd 
   */
  async function deleteTab3HABydocidsTxn(docIds, gstin, fp, rtnprd, flag , actionFlag) {
    logger.log("info","Starting deleteTab3HBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
      try {
      
      gstindb.exec('BEGIN TRANSACTION;');   
  
      // Async db call to check number of items available
      let docIdsResult = await db.fetchAllByIdInTransaction(anx1Comm.anx1aQueries.table3ha.get3hByDocIds, docIds, gstindb, true);
  
      if (docIdsResult.length === 0) {
        logger.log("info","End of deleteTab3HBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
        throw new Error(message = `No Document(s) found to delete`);
      } 
      else {
        logger.log("debug", "docIds : %s", JSON.stringify(docIdsResult));
  
        // input docIds and Db output docIdsResult are being compared to check all records are found in DB 
        //if any differnce found error will be thrown
        let diffRec = _.difference(docIds, _.map(docIdsResult, "docId"), _.isEqual);
  
        if (diffRec.length === 0) {
          // Delete the items for the corresponding docrefs
          let deleteItemsBydocref = await db.deleteBySqlInClauseTxn(queries.anx1Queries.itemDetails.deleteItemsByitemRef,_.map(docIdsResult, "DOCREF"), gstindb);
        
          logger.log("debug", "deleteItemsBydocref : %s", deleteItemsBydocref);
          // Delete DB call and get the number of records been deleted 
          let deleteRecords = await db.deleteBySqlInClauseTxn(anx1Comm.anx1aQueries.table3ha.delete3hByDocIds,docIds, gstindb);
  
          await save3HASummaryTxn(gstin, fp, rtnprd,gstindb);

          if(flag && (flag == "F" || flag=="N")){
            await save3HASummaryTxn(gstin, fp, rtnprd, gstindb, flag ,actionFlag);
          }
          db.dbCommit(gstindb)
        
         logger.log("info","End of deleteTab3HBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString()); 
         return deleteRecords || 0;
          
        } else {
          logger.log("info","End of deleteTab3HBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
          throw new Error(message = `record(s) not found for the given docId(s)  ${diffRec}`);
        }
      }
      } catch (error) {
        logger.log("info","End of deleteTab3HBydocidsTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
        throw new Error(error);
      }finally{
        db.closeDBConn(gstindb)
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
  async function deleteTab3HAByItemIdTxn(itemIds = [], gstin, fp, taxperiod) {
    logger.log("info","Starting deleteTab3HByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
  
    try {
      gstindb.exec('BEGIN TRANSACTION;'); 
     
      let item = await db.fetchAllByIdTxn( queries.anx1Queries.itemDetails.getItemRefByItemId, itemIds, gstindb,true);
      if (item.length === 0) {
        throw new Error((message = "No Records found for delete Item"));
      }
      // fetch all items based on docRef
      let listOfItems = await db.fetchAllByIdTxn(queries.anx1Queries.itemDetails.getItemsByRefId,[item[0].ITEMREF],gstindb);
  
      if (listOfItems.length > 1) {
        // delete the record from item table only if it has more than one records
        let deleteRecords = await db.deleteBySqlInClauseTxn(queries.anx1Queries.itemDetails.deleteItemsByItemIds,itemIds,gstindb);
       
      } else if (listOfItems.length === 1) {
        throw new Error((message = "Kindly delete the document level before deleting the last item"));
      } else {
        throw new Error((message = "No Records found for delete Item"));
      }
  
      // fetch row from 3H table based on docRef
      let row3H = await db.fetchAllByIdTxn(anx1Comm.anx1aQueries.table3ha.get3hDetailsByDocRef,[item[0].ITEMREF],gstindb);

      // Prepare object to update in table3cd after calcualtion
      let updateItem = {
        TAXVAL: row3H[0].TAX_VALUE - item[0].TAXVAL || 0,
        IGST: row3H[0].IGST - item[0].IGST || 0,
        CESS: row3H[0].CESS - item[0].CESS || 0,
        DOCREF: item[0].ITEMREF
      };
  
    let recordsUpdated = await db.updateOrDeleteTxn(
      anx1Comm.anx1aQueries.table3ha.update3hDetailsByDocRef,
      [updateItem.TAXVAL, updateItem.IGST, updateItem.CESS, updateItem.DOCREF],
      gstindb
     );

     await save3HASummaryTxn(gstin, fp, taxperiod,gstindb);
      
      db.dbCommit(gstindb)
      logger.log("info","Ending deleteTab3HByItemIdTxn : %s  ::  %s", new Date().getTime(), new Date().toString());
      return "Item deleted successfully";
  
    } catch (error) {
      throw new Error(error);
    }finally{
      db.closeDBConn(gstindb)
    }
  
  }


  /**
 * Summary for the 3H tables
 * @param {*} gstin
 * @param {*} fp
 * @param {*} taxperiod
 * @param {*} gstindb
 */
async function save3HASummaryTxn(gstin, fp, taxperiod, gstindb, flag , actionFlag) {
    try {
      logger.log("info", "Inside save3HSummaryTxn : %s  ::  %s", gstin, fp);
      /** Calculate Summary object */
     if(flag && flag=="N"){
        if(actionFlag && actionFlag == "C"){
          var summObj3HErr = await db.fetchByIdTxn(anx1Comm.anx1aQueries.errorSummary.calculate3HErrorSumm,
        [fp, taxperiod],
        gstindb
      );
      if(summObj3HErr != undefined && summObj3HErr != null){
        summObj3HErr.igst = summObj3HErr.igst?summObj3HErr.igst:0;
        summObj3HErr.cgst = summObj3HErr.cgst?summObj3HErr.cgst:0;
        summObj3HErr.sgst = summObj3HErr.sgst?summObj3HErr.sgst:0;
        summObj3HErr.cess = summObj3HErr.cess?summObj3HErr.cess:0;
        }
        }
     }else if(flag && flag =="F"){
      var summObj3HErr = await db.fetchByIdTxn(anx1Comm.anx1aQueries.errorSummary.calculate3HErrorSumm,
        [fp, taxperiod],
        gstindb
      );
      if(summObj3HErr != undefined && summObj3HErr != null){
        summObj3HErr.igst = summObj3HErr.igst?summObj3HErr.igst:0;
        summObj3HErr.cgst = summObj3HErr.cgst?summObj3HErr.cgst:0;
        summObj3HErr.sgst = summObj3HErr.sgst?summObj3HErr.sgst:0;
        summObj3HErr.cess = summObj3HErr.cess?summObj3HErr.cess:0;
        }
     }
      let summObj3H = await db.fetchByIdTxn(anx1Comm.anx1aQueries.summary.calculate3HSumm,
        [fp, taxperiod],
        gstindb
      );
      
      if(summObj3H != undefined && summObj3H != null){
      summObj3H.igst = summObj3H.igst?summObj3H.igst:0;
      summObj3H.cgst = summObj3H.cgst?summObj3H.cgst:0;
      summObj3H.sgst = summObj3H.sgst?summObj3H.sgst:0;
      summObj3H.cess = summObj3H.cess?summObj3H.cess:0;
      }
      /** get the count for mark for delete */
      if(flag && flag=="N"){
        if(actionFlag && actionFlag == "C"){
          var MarkForDeleteCountErr = await db.getCountTxn(anx1Comm.anx1aQueries.errorSummary.getErrorCountfor3H,
        [fp, taxperiod],
        gstindb
      );
        }
      }else if(flag && flag=="F"){
        var MarkForDeleteCountErr = await db.getCountTxn(anx1Comm.anx1aQueries.errorSummary.getErrorCountfor3H,
          [fp, taxperiod],
          gstindb
        );
      }
      let MarkForDeleteCount = await db.getCountTxn(anx1Comm.anx1aQueries.summary.getCountMarkForDelfor3H,
        [fp, taxperiod],
        gstindb
      );
  
      /** Save the summary as per new changes done in table */
      
      if(flag && flag=="N"){
        if(actionFlag && actionFlag == "C"){
          let sumarrySaved = await save3Aor3HSummaryTxn(
            gstin,
            fp,
            taxperiod,
            MarkForDeleteCountErr,
            summObj3HErr,
            "3HA" ,
            gstindb, flag ,actionFlag);
        }
      }else if(flag && flag=="F"){
        let sumarrySaved = await save3Aor3HSummaryTxn(
          gstin,
          fp,
          taxperiod,
          MarkForDeleteCountErr,
          summObj3HErr,
          "3HA" ,
          gstindb, flag,actionFlag);
      }
      let sumarrySaved = await save3Aor3HSummaryTxn(
        gstin,
        fp,
        taxperiod,
        MarkForDeleteCount,
        summObj3H,
        "3HA" ,
        gstindb);
  
      return { message: "SUCCESS", statusCd: STATUS_CD_ONE };
    } catch (error) {
      throw new Error(error);
    }
  };
  
  /**
    * This function will save the item level details of 3H Table in DB
    * @param {*} items 
    */
function prepareItems3H(items) { 
      let insertRow =  _.reduce(items, (accumulaterRow, row) =>{
        return accumulaterRow + `,` + `( "${ row.hsn || ""}", ${row.apptaxrate},${row.taxable_value},${row.igst}, 
        ${row.cgst || null},${row.sgst || null},${row.cess || null}, "${row.itemref}" )` 
      },[]).substring(1)
      return insertRow ;
    }

module.exports = {
  savetab3HATxn: savetab3HATxn,
  editTab3HATxn: editTab3HATxn,
  deleteTab3HABydocidsTxn: deleteTab3HABydocidsTxn,
  deleteTab3HAByItemIdTxn:deleteTab3HAByItemIdTxn,
  gettable3HAdetailsTxn:gettable3HAdetailsTxn,
  save3HASummaryTxn : save3HASummaryTxn

};
