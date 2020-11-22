const { validateHeaders} = require("../../utility/validate");
const { sendResponse } = require("../../utility/common");
const  anx13lDao = require("../../dao/anx1Dao/anx13lDao");
const { validate3l } = require("../../utility/validators/anx1Validators/3lValidator");
const { STATUS_CD_ZERO, STATUS_CD_ONE} = require('../../utility/constants');
const _ = require("lodash");
const log  = require('../../utility/logger');
const logger = log.logger;
const anx1Const = require('../../utility/anx1Constants');
const db = require("../../db/dbUtil");
var tab3lService = {};
/**Save 3L - save details of 3L table
 * @param {*} req
 * @param {*} res
*/
tab3lService.save3Ldetails = function(req, res) {
    logger.log("info","Entering anx13lService | save3ldetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
    try{
      let gstin = req.headers["gstin"] || null;
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
      gstindb= db.getConnection(gstin);
      if (!validate3l(req, res)) {
          return;
      }
      else if (
          req.body.mis === "null" || req.body.mis === undefined || req.body.mis === "") {
          sendResponse(res, 500, {
              message: "mis is missing in Request body",
              statusCd: STATUS_CD_ZERO
          });
      } else {
          console.log("Inside Service")
          let docObj3L = [];
          let itemList = [];
          let fullItemList = [];
          let total_taxable_value = 0, total_igst = 0, total_cess = 0, total_cgst = 0, total_sgst = 0
                let ref= req.body.mis[0].docref; 
                console.log(ref);        
                req.body.mis[0].items.forEach(item=>{
                  total_taxable_value += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                  total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                  total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
                  total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 : item.sgst);
                  total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);
                  itemList = {
                        hsn: item.hsn || '',
                        taxable_value: item.txval || null,
                        apptaxrate: item.rate,
                        igst: item.igst || null,                       
                        cgst: item.cgst || null,
                        sgst: item.sgst || null,
                        cess: item.cess || null,
                        itemref: ref
                    };

                   fullItemList.push(itemList);
                })
                 
                  
              logger.log("info", "3L Items List : %s",fullItemList );
          
              docObj3L = {
                  tableTyp: req.body.mis[0].tableTyp,
                  docref: req.body.mis[0].docref,
                  ctin: req.body.mis[0].ctin,
                  legaltradename: req.body.mis[0].lglNm,
                  pos: req.body.mis[0].pos,
                  diff_percentage: req.body.mis[0].diffprcnt,
                  doctyp : req.body.mis[0].doctyp || null,
                  upload_date: req.body.mis[0].upld_dt || null,
                  supply_type: req.body.mis[0].suptype,
                  fp: req.headers["fp"],
                  taxperiod: req.body.rtnprd,
                  status: "",
                  sec7act:req.body.mis[0].sec7act,
                  flag: req.body.mis[0].flag || null,
                  taxable_value: total_taxable_value,
                  igst: total_igst,
                  cgst: total_cgst,
                  sgst: total_sgst,
                  cess: total_cess,
                  errorcode: null,
                  error_detail: null,
                  doc_num: req.body.mis[0].doc.num,
                  doc_val: req.body.mis[0].doc.val,
                  doc_date: req.body.mis[0].doc.dt,
                  doc_year: req.body.mis[0].doc.year,               
                  clmrfnd : req.body.mis[0].clmrfnd==""?null:req.body.mis[0].clmrfnd
              };
              
              logger.log("info", "3L Doc Obj : %s", JSON.stringify(docObj3L));                       
              gstindb.serialize(() => {
                  gstindb.run("BEGIN TRANSACTION;");
                  anx13lDao.save3Ldetails(docObj3L, fullItemList, fp, rtnprd, gstindb, false)
                  .then(() => {
                      db.commitAndCloseDBConn(gstindb);
                      res.status(200).send({ message: `${anx1Const.DOC_SAVE_SUCCESS}`, statusCd: STATUS_CD_ONE});
                      logger.log("info","Exiting anx13lService | save3l : %s  ::  %s", new Date().getTime(), new Date().toString());
                  }).catch((err) => {
                      logger.log("error","Error in anx13lService | save3l : %s", JSON.stringify(err));
                      db.rollBackAndCloseDBConn(gstindb);  
                      if (err.message && err.message.includes("UNIQUE constraint failed")) {
                          res.status(500).send({ message: `${anx1Const.DOC_ALREADY_EXISTS}`, statusCd: STATUS_CD_ZERO});
                      } else {
                          res.status(500).send({ message: `${anx1Const.DOC_SAVE_ERROR}`, statusCd: STATUS_CD_ZERO});
                      }
                  });
  
              });
      }
    } catch (err) {
      db.rollBackAndCloseDBConn(gstindb); 
      logger.log("error","Error in anx13lService | save3ldetails : %s" , err);
    }  
  }
  


/**
 * To get the 3G Document level details for displaying in UI
 * @param {*} req 
 * @param {*} res 
 */
tab3lService.get3LDetails = function (req, res) {

    console.log("Inside get3LDetails");

    let gstin = req.headers["gstin"]; 
    let rtnprd = req.headers["rtnprd"];
    let flag = req.headers["flag"];

    console.log("GSTIN : " + gstin + "  RtnPrd : " + rtnprd) ;
    if (gstin === undefined || gstin === "" || gstin === null) {
        sendResponse(res, 500, {message: "Missing GSTIN in the header", statusCd: STATUS_CD_ZERO });
    }

    if (rtnprd === undefined || rtnprd === "" || rtnprd === null) {
        sendResponse(res, 500, {message: "Missing rtnprd in the header", statusCd: STATUS_CD_ZERO});
    }

    anx13lDao.get3LDetails(gstin, rtnprd ,flag).
    then(function (data) {
        res.status(201).send(data);
    }).catch(function (err) {
        res.status(500).send(err)
    });
}


/**
*  Delete the ANX1_3G table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/

tab3lService.delete3LBydocIds = function (req, res) {
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
        sendResponse(res, 500, { message: "Missing docids array in body", statusCd: 0 });
      } else {             
        anx13lDao
          .delete3ldocdao(req.body.docids, req.headers["gstin"], fp, rtnprd)
          .then(data => {
            console.log("dataaa",data)
            sendResponse(res, 200, { message: `Document(s) deleted successfully`, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: err.message , statusCd: 0 });
          });
      }
    }
  };

  /**
 * Delete the ANX1_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
tab3lService.delete3lByItemId = function(req, res) {
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
        sendResponse(res, 500, { message: "Itemids array should not be Empty", statusCd: 0 });
      } else {
        anx13lDao
          .delete3lByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd)
          .then(data => {
            sendResponse(res, 200, { message: data, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message:(err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message) , statusCd: 0 });
          });
      }
    }
  };


/** Edit details of 3G table
 * @param {*} req
 * @param {*} res
*/
tab3lService.edit3Ltable = function(req, res) {
    logger.log("info","Entering anx13lService | edit3Ltable : %s  ::  %s", new Date().getTime(), new Date().toString());
  
    let gstindb;
    try {
     if ((req.body.mis === undefined && req.body.mis === undefined)) {
          sendResponse(res, 500, {message: "No data present",
                  statusCd: STATUS_CD_ZERO });
          return 0;
      }
      else if (req.body.mis != "null" && req.body.mis != '' && req.body.mis != undefined &&
          validate3l(req, res)) {
              console.log("Inside Service");
              let docObj3L = [];
              let gstin = req.headers["gstin"];
              let itemList = [];
              let fullItemList = [];
              let total_taxable_value = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
              
              for (var j = 0; j < req.body.mis[0].items.length; j++) {
                  total_taxable_value += parseFloat((req.body.mis[0].items[j].txval == "" || req.body.mis[0].items[j].txval == null) ? 0 : req.body.mis[0].items[j].txval)
                  total_sgst += parseFloat((req.body.mis[0].items[j].sgst == "" || req.body.mis[0].items[j].sgst == null) ? 0 : req.body.mis[0].items[j].sgst);
                  total_cgst += parseFloat((req.body.mis[0].items[j].cgst == "" || req.body.mis[0].items[j].cgst == null) ? 0 : req.body.mis[0].items[j].cgst);
                  total_igst += parseFloat((req.body.mis[0].items[j].igst == "" || req.body.mis[0].items[j].igst == null) ? 0 : req.body.mis[0].items[j].igst);
                  total_cess += parseFloat((req.body.mis[0].items[j].cess == "" || req.body.mis[0].items[j].cess == null) ? 0 : req.body.mis[0].items[j].cess);
  
                  itemList = {
                      itemid: req.body.mis[0].items[j].itemid,
                      hsn: req.body.mis[0].items[j].hsn,
                      taxable_value: req.body.mis[0].items[j].txval || null,
                      apptaxrate: req.body.mis[0].items[j].rate,
                      igst: req.body.mis[0].items[j].igst || null,
                      cgst: req.body.mis[0].items[j].cgst || null,
                      sgst: req.body.mis[0].items[j].sgst || null,
                      cess: req.body.mis[0].items[j].cess || null,
                      itemref: req.body.mis[0].docref
                  };
  
                  fullItemList.push(itemList);
              }
  
              console.log("fullItemList :" + fullItemList);
                  
              docObj3L = {
                  docid: req.body.mis[0].docid,
                  tableTyp: req.body.mis[0].tableTyp,
                  doctyp: req.body.mis[0].doctyp,
                  ctin: req.body.mis[0].ctin,
                  legalname: req.body.mis[0].lglNm,
                  supply_type: req.body.mis[0].suptype,
                  pos: req.body.mis[0].pos,
                  docref: req.body.mis[0].docref,
                  flag: req.body.mis[0].flag || null,
                  num: req.body.mis[0].doc.num,
                  dt: req.body.mis[0].doc.dt,
                  doc_year: req.body.mis[0].doc.year,
                  val: req.body.mis[0].doc.val,
                  pos: req.body.mis[0].pos,
                  clmrfnd: req.body.mis[0].clmrfnd==""?null:req.body.mis[0].clmrfnd,
                  fp: req.headers["fp"],
                  taxperiod: req.headers["rtnprd"],
                  status: "",
                  taxable_value: total_taxable_value,
                  cgst: total_cgst,
                  sgst: total_sgst,
                  igst: total_igst,
                  cess: total_cess,
                  errorcode: null,
                  error_detail: null,
                  diff_percentage: req.body.mis[0].diffprcnt,
                  sec7: req.body.mis[0].sec7act,
                  orgDocTyp: req.body.orgDocTyp,    
                  orgCtin: req.body.orgCtin
                
              };
              logger.log("debug","docObj3L : %s", docObj3L)              
  
              console.log("calling dao");
              gstindb = db.getConnection(gstin);          
              gstindb.serialize(() => {
              gstindb.run("BEGIN TRANSACTION;");
  
              anx13lDao.edit3L(docObj3L, fullItemList, gstin, docObj3L.fp, docObj3L.taxperiod, gstindb,req.headers["flag"])
              .then((result) => {
                  db.commitAndCloseDBConn(gstindb);
                  res.status(200).send({ message: `${anx1Const.DOC_UPDATE_SUCCESS}`, statusCd: STATUS_CD_ONE});
              }).catch((err) => {
                  db.rollBackAndCloseDBConn(gstindb);
                  if (err.message && err.message.includes("UNIQUE constraint failed")) {
                    res.status(500).send({ message: `${anx1Const.DOC_ALREADY_EXISTS}`, statusCd: STATUS_CD_ZERO});
                  } else {
                    res.status(500).send({ message: `${anx1Const.DOC_UPDATE_ERROR}`, statusCd: STATUS_CD_ZERO});
                  }
              });
  
              logger.log("info","Entering anx13lService | edit3Ltable : %s  ::  %s", new Date().getTime(), new Date().toString());
          });
          }
      }catch(err){
          db.rollBackAndCloseDBConn(gstindb);
          logger.log("error", "anx13lservice | edit 3l :err: %s", err);
      }
  }
  

  module.exports = tab3lService;