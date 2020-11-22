const anx1Dao = require("../dao/anx1Dao");
const log  = require('../utility/logger');
const logger = log.logger;
const { sendResponse } = require("../utility/common");
const _ = require("lodash");
const { STATUS_CD_ZERO, STATUS_CD_ONE} = require("../utility/constants");
const { validateAnx1Save3A, validateHeaders} = require("../utility/validate");
const anx1Const = require('../utility/anx1Constants');
const db = require("../db/dbUtil");
var http = require('http');
var fs = require('fs');
const path = require('path');


//********TO Save 3A Table details ***************************
function save3atable(req, res) {
  logger.log("info","Entering anx1Service | save3atable : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;

  try{
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;
  
    if (!validateAnx1Save3A(req, res)) {
      return;
    } else if (
      req.body.b2c === "null" || req.body.b2c === undefined || req.body.b2c === "") {
      sendResponse(res, 500, { message: "request body is missing", statusCd: STATUS_CD_ZERO });
    } else {
      logger.log("debug", "Inside save 3A Service");
      let docObj3A = [];
      let itemList = [];
      let fullItemList = [];
      let total_taxable_value =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
  
        for (var i = 0; i < req.body.b2c[0].items.length; i++) {
          
          let item = req.body.b2c[0].items[i];
  
          total_taxable_value += parseFloat((item.txval == "" || item.txval == null) ? 0 : item.txval);
          total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 :item.sgst);
          total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
          total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
          total_cess += parseFloat((item.cess=="" || item.cess==null) ? 0 : item.cess);
  
          itemList = {
              taxable_value: item.txval || null,
              apptaxrate : item.rate,
              igst : item.igst || null,
              cgst : item.cgst || null,
              sgst : item.sgst || null,
              cess : item.cess || null,
              itemref : req.body.b2c[0].docref,
              hsn:item.hsn || null,
          };
          fullItemList.push(itemList);  
        }
        
        logger.log("info", "3A Items List : %s",fullItemList );
  
        docObj3A = {
          docref :req.body.b2c[0].docref,
          pos: req.body.b2c[0].pos,
          diff_percentage:  req.body.b2c[0].diffprcnt,
          doc_type: req.body.b2c[0].doctyp|| null,
          sec7: req.body.b2c[0].sec7act,
          upload_date: req.body.b2c[0].upld_dt || null,
          supply_type: req.body.b2c[0].suptyp,
          fp: req.headers["fp"] ,  
          taxperiod: req.body.rtnprd ,
          status: "",
          flag:  req.body.b2c[0].rst|| null ,
          taxable_value : total_taxable_value ,
          cgst : total_cgst ,
          sgst: total_sgst  ,
          igst: total_igst,
          cess: total_cess ,
          errorcode: null,
          error_detail: null,
  
        };
        logger.log("info", "3A Doc Obj : %s", docObj3A);
    
        gstindb = db.getConnection(gstin);          
        gstindb.serialize(() => {
              gstindb.run("BEGIN TRANSACTION;");
              
              anx1Dao.save3atable(docObj3A ,fullItemList , gstin, fp, rtnprd, gstindb)
              .then(() => {
                  db.commitAndCloseDBConn(gstindb);
                  res.status(200).send({"b2c": { message: `${anx1Const.DOC_SAVE_SUCCESS}`, statusCd: STATUS_CD_ONE}});
                  logger.log("info","Exiting anx1Service | save3atable : %s  ::  %s", new Date().getTime(), new Date().toString());
              }).catch((err) => {
                logger.log("error","Error in anx1Service | save3atable : %s", JSON.stringify(err));
                db.rollBackAndCloseDBConn(gstindb);  
                if (err.message && err.message.includes("UNIQUE constraint failed")) {
                      res.status(500).send({"err":{ message: `${anx1Const.DOC_ALREADY_EXISTS}`, statusCd: STATUS_CD_ZERO}});
                  } else {
                    res.status(500).send({"err" :{ message: `${anx1Const.DOC_SAVE_ERROR}`, statusCd: STATUS_CD_ZERO}});
                  }
              });
        });
   }
  } catch(err) {
      db.rollBackAndCloseDBConn(gstindb); 
     logger.log("error","Error in anx1Service | save 3A : %s" , err);
  }
  
}

//********TO GET 3A Table details  by passing Gstin ***************************

/* To check and update the taxperiod and fy in user profile during login   */
/**
 *
 * @param {*} req
 * @param {*} res
 */
function getTable3a(req, res) {
  
  console.log(" headers " + req.headers["gstin"]);
  if (req.headers["gstin"] === undefined || req.headers["gstin"] === "" || req.headers["gstin"] === null) {
    sendResponse(res, 500, {message: "Missing GSTIN in the header",statusCd: STATUS_CD_ZERO });
  }
  
  if (req.headers["rtnprd"] === undefined || req.headers["rtnprd"] === "" || req.headers["rtnprd"] === null) {
    sendResponse(res, 500, {message: "Missing rtnprd in the header", statusCd: STATUS_CD_ZERO });
  }

  anx1Dao.getTable3aDao(req.headers["gstin"] , req.headers["rtnprd"] , req.headers["flag"])
    .then(function (data) {
      //declaring an array B2C
      let B2C = [];
      if (!Array.isArray(data) || data === null) {
        reject({ message: "No Data found", statusCd: STATUS_CD_ZERO});
      }

      /* 
        data base will return an array of object ,grouping it by POS
        pos  contains groupedObject of element e 
        Object.keys(groupedObject).map - iterate the arrays inside B2c
        pos.map - iterates arrays inside items  
        */
      let groupedObject = _.groupBy(data, "DOC_ID");
      Object.keys(groupedObject).map(e => {
        let itemDetails = {};
        let pos = groupedObject[e];
        let items = pos.map(element => {
          return (item = {
           // docref:element.DOC_REF,
            ival: element.TOTAL_TAXABLE_VALUE,
            rate: element.APP_TAX_RATE,
            igst: element.IGST ,
            sgst: element.SGST,
            cgst: element.CGST ,
            cess: element.CESS 
          });
        });
        //forming an itemDetails object by extracting the values from groupedObject[e] which is pos
        (itemDetails.pos = groupedObject[e][0].PLACE_OF_SUPPLY),
        (itemDetails.docid = groupedObject[e][0].DOC_ID),
          (itemDetails.docref = groupedObject[e][0].DOCREF),
          (itemDetails.action = groupedObject[e][0].FLAG),
          (itemDetails.status = groupedObject[e][0].STATUS),
          (itemDetails.diff_percent = groupedObject[e][0].DIFF_PERCENTAGE),
          (itemDetails.sec7_act = groupedObject[e][0].SEC7_ACT),
          (itemDetails.doc_typ = groupedObject[e][0].DOC_TYPE),
          (itemDetails.upld_dt = groupedObject[e][0].UPLOAD_DATE),
          (itemDetails.sup_type = groupedObject[e][0].SUPPLY_TYPE),
          (itemDetails.err_msg = groupedObject[e][0].ERROR_DETAIL),
          (itemDetails.items = items)
    
        // B2C - pushing itemdetails into B2C array
        B2C.push(itemDetails);
        console.log("Got the dtaaa" + JSON.stringify(B2C))
      });
      return { B2C: B2C, statusCd: STATUS_CD_ONE };
    })
    .then(data => {
      res.status(200).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

/**
 * This method will be called during edit of Table 3A Document.
 * @param {*} req 
 * @param {*} res 
 */
function editTable3a(req, res) {
  logger.log("info","Entering anx1Service | editTable3a : %s  ::  %s", new Date().getTime(), new Date().toString());
  try {
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;
   
    if (!validateAnx1Save3A(req, res)) {
      return;
    } 
    else if ( req.body.b2c === "null" || req.body.b2c === undefined || req.body.b2c === "") {
      sendResponse(res, 500, { message: "request body is missing", statusCd: STATUS_CD_ZERO});
      return;
    } 
    else {
      console.log("Inside Service");
      let docObj3A = [];
      let itemList = [];
      let fullItemList = [];
      let total_taxable_value =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
  
        for (var i = 0; i < req.body.b2c[0].items.length; i++){ 

          let item = req.body.b2c[0].items[i];
  
          total_taxable_value += parseFloat((item.txval == "" || item.txval == null) ? 0 : item.txval);
          total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 :item.sgst);
          total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
          total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
          total_cess += parseFloat((item.cess=="" || item.cess==null) ? 0 : item.cess);

             itemList = {
                hsn:item.hsn || null,
                taxable_value: item.txval || null,
                apptaxrate: item.rate,
                igst:item.igst || null,
                cgst: item.cgst || null,
                sgst: item.sgst || null,
                cess: item.cess || null,
                itemref : req.body.b2c[0].docref,
                itemid : item.itemid,
              };
              fullItemList.push(itemList);
        }
        console.log("fullItemList :" + JSON.stringify(fullItemList));
        
        docObj3A = {
          docref :req.body.b2c[0].docref,
          pos: req.body.b2c[0].pos,
          diff_percentage:  req.body.b2c[0].diffprcnt,
          sec7: req.body.b2c[0].sec7act,
          supply_type: req.body.b2c[0].suptyp,  
          status: "",
          flag:  req.body.b2c[0].rst|| null ,
          taxable_value : total_taxable_value ,
          cgst : total_cgst ,
          sgst: total_sgst  ,
          igst: total_igst,
          cess: total_cess ,
          docid: req.body.b2c[0].docid
        };
       console.log("docObj3A :" + docObj3A)

        let gstindb = db.getConnection(gstin);          
        gstindb.serialize(() => {
              gstindb.run("BEGIN TRANSACTION;");
              anx1Dao.editTable3a(docObj3A ,fullItemList , gstin, fp, rtnprd, gstindb, req.headers["flag"])
              .then((result) => {
                  db.commitAndCloseDBConn(gstindb);
                  res.status(200).send({"b2c": { message: `${anx1Const.DOC_UPDATE_SUCCESS}`, statusCd: STATUS_CD_ONE}});
                  logger.log("info","Exiting anx1Service | editTable3a : %s  ::  %s", new Date().getTime(), new Date().toString());
              }).catch((err) => {
                  logger.log("error","Error in edit -> anx1Service | editTable3a : %s", JSON.stringify(err));
                  db.rollBackAndCloseDBConn(gstindb);
                  if (err.message && err.message.includes("UNIQUE constraint failed")) {
                    res.status(500).send({"err":{ message: `${anx1Const.DOC_ALREADY_EXISTS}`, statusCd: STATUS_CD_ZERO}});
                  } else {
                    res.status(500).send({"err" :{ message: `${anx1Const.DOC_UPDATE_ERROR}`, statusCd: STATUS_CD_ZERO}});
                  }
              });
        });
   }
  } catch(err){
    logger.log("error","Error in anx1Service | editTable3a : %s", JSON.stringify(err));
    db.rollBackAndCloseDBConn(gstindb);
  }
  
}

 //function to mark records for delete
  function markforDeleteTable(req, res) {
    var gstin = req.headers["gstin"] || null;
    var itemList2 = []
          if(req.body.doc_ref_list === "null" ||  req.body.doc_ref_list === undefined || 
          req.body.doc_ref_list === ""){
            sendResponse(res, 500, {
              message: "Document reference id is missing",
              statusCd: 0
            });
          }
    else{
      itemList2 = req.body.doc_ref_list;
    anx1Dao.markforDeleteTable(itemList2 ,gstin)
    .then((data) =>{
      res.status(200).send(data);
    })
    .catch((err)=>{
      res.status(500).send(err);
    });
  }
  }

// funtion to get item details for a particular document using docref
  function getItemDetails(req,res){
    if (req.headers["gstin"] === undefined ||
     req.headers["gstin"] === '' || req.headers["gstin"] === null) {
      sendResponse(res, 500, {
        message: "Missing GSTIN in the header",
        statusCd: 0
      });
      return 0
    }
    let docref = req.params.docref;
      let gstin = req.headers["gstin"]
      anx1Dao.getItemDetails(docref,gstin)
      .then((data) =>{
        res.status(200).send(data)
      })
      .catch((err)=>{
        res.status(500).send(err)
      })
    }




/**
 * Delete the ANX1_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
function delete3HItemsByItemId(req, res) {
  if (validateHeaders(req, res)) {

    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
      sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
    } else {
      anx1Dao
        .delete3HItemsByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"], req.body.status)
        .then(data => {
          sendResponse(res, 200, { message: data, statusCd: 1 });
        })
        .catch(err => {
          sendResponse(res, 500, { message: err.message , statusCd: 0 });
        });
    }
  }
};

/**
 *  Delete the ANX1_3A table records based on array of docId in request body
 * @param {*} req
 * @param {*} res
 */
function delete3ABydocIds(req, res) {
  logger.log("info","Entering anx1Service | delete3ABydocIds : %s  ::  %s", new Date().getTime(), new Date().toString());
  if (validateHeaders) {
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;
    if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
      sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
    } else {
      anx1Dao
        .delete3ABydocIds(req.body.docids, req.headers["gstin"], fp, rtnprd, req.headers["flag"],req.body.action)
        .then(data => {
          sendResponse(res, 200, { message: `${anx1Const.DOC_DELETE_SUCCESS}`, statusCd: STATUS_CD_ONE });
          logger.log("info","Exiting anx1Service | delete3ABydocIds : %s  ::  %s", new Date().getTime(), new Date().toString());
        })
        .catch(err => {
          logger.log("error","Error in anx1Service | delete3ABydocIds : %s", JSON.stringify(err));
          sendResponse(res, 500, { message: err.message , statusCd: STATUS_CD_ZERO });
        });
    }
  }
};
     
/**
 * To delete data from all ANX1 tables for the specified financial year and taxperiod
 * @param {*} req 
 * @param {*} res 
 */
function removeDataFromAllTables(req, res) {
  logger.log("info","Entering anx1Service | removeDataFromAllTables : %s  ::  %s", new Date().getTime(), new Date().toString());
  if(validateHeaders){
       // if request body sent Null
      if (req.body === undefined || req.body === null) {
        res.status(500).send('{ message: "Request Body is Empty",statusCd: "0"}');
      
      }  else {

        let gstin = req.headers["gstin"] || null;
        let rtnprd = req.headers["rtnprd"] || null;
        let profile = req.headers["profile"] || null;
        let fp = req.headers["fp"] || null;
        let flag = req.headers["flag"] ||  null;
        
        let tableTyp = req.body.tableTyp;
        
        if(tableTyp === undefined || tableTyp === null){
          res.status(500).send('{ message: "Table Type is required",statusCd: "0"}');
        } else {
          
          if(tableTyp != 'All' && !(anx1Const.ALL_ANX1_TABLES.includes(tableTyp))){
            sendResponse(res, 500, { message: "Table " + tableTyp + " is not relevant to ANX1", statusCd: STATUS_CD_ZERO });
          } else {
            anx1Dao.removeDataFromAllTables(gstin, fp, rtnprd, tableTyp, profile,flag)
            .then(data => {
              if((JSON.stringify(data)).indexOf("err") > 0){
                sendResponse(res, 500, { message: data.err, statusCd: STATUS_CD_ZERO });
              } else {
                sendResponse(res, 200, { message: data, statusCd: STATUS_CD_ONE });
              }
              logger.log("info","Exiting anx1Service | removeDataFromAllTables : %s  ::  %s", new Date().getTime(), new Date().toString());
          })
          .catch(err => {
            console.log(err);
            sendResponse(res, 500, { message: "Documents cannot be removed", statusCd: STATUS_CD_ZERO });
          });
        }
        
      }
    }
  };
}

//DELETE 3A BY ITEMS
function delete3AItemsByItemId(req, res) {
  if (validateHeaders(req, res)) {

    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    
    if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
      sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
    } else {
      anx1Dao
        .delete3AItemsByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"], req.body.status)
        .then(data => {
          sendResponse(res, 200, { message: data, statusCd: 1 });
        })
        .catch(err => {
          sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message) , statusCd: 0 });
        });
    }
  }
};
function historyfiles(req,res){
  let gstin = req.query.gstin;
  let rtnprd = req.query.rtnprd;
  let taxperiod = req.query.taxperiod;
  anx1Dao.getHistoryFiles(gstin,rtnprd,taxperiod).then((result) => {
      res.status(200).send(result);
  }).catch((err) => {
      //console.log("error",err);
      res.status(500).send("Error in fetching count");
  });
}
function downloadHistory(req,res){
  let gstin = req.query.gstin;
  let rtnprd = req.query.rtnprd;
  let fileName = req.query.fileName;
  let fType = (req.query.fType === 'X' ? 'excel' : 'csv');
  url = 'uploads/anx1/'+ gstin + '/'+ rtnprd + '/'+ fType + '/'+ fileName;
  console.log(" comes to downloadhistory" + url);
  fName = 'uploads/anx1/32SSSKL8363S1ZG/072019/excel/ANX1_Excel_Workbook_Template_v0_11_13_2019 11_46_8.xlsx';
  console.log(fName)
  res.download(path.resolve(url));
}
module.exports = {
  save3atable:save3atable,
  getTable3a: getTable3a,
  editTable3a :editTable3a , 
  markforDeleteTable:markforDeleteTable ,
  getItemDetails :getItemDetails , 
  delete3HItemsByItemId: delete3HItemsByItemId,
  delete3ABydocIds : delete3ABydocIds,
  removeDataFromAllTables : removeDataFromAllTables,
  delete3AItemsByItemId: delete3AItemsByItemId,
  historyfiles : historyfiles,
  downloadHistory : downloadHistory
}