const { validateHeaders} = require("../../utility/validate");
const { validate3g } = require("../../utility/validators/anx1Validators/3gValidator");
const { sendResponse } = require("../../utility/common");
const  anx13GDao = require("../../dao/anx1Dao/anx13gDao");
const { STATUS_CD_ZERO, STATUS_CD_ONE} = require('../../utility/constants');
const _ = require("lodash");
const log  = require('../../utility/logger');
const logger = log.logger;
const anx1Const = require('../../utility/anx1Constants');
const db = require("../../db/dbUtil");


/** Edit details of 3G table
 * @param {*} req
 * @param {*} res
*/
function edit3Gtable(req, res) {
  logger.log("info","Entering anx13gService | edit3Gtable : %s  ::  %s", new Date().getTime(), new Date().toString());

  let gstindb;
  try {
   if ((req.body.de === undefined && req.body.de === undefined)) {
        sendResponse(res, 500, {message: "No data present",
                statusCd: STATUS_CD_ZERO });
        return 0;
    }
    else if (req.body.de != "null" && req.body.de != '' && req.body.de != undefined &&
        validate3g(req, res)) {
            console.log("Inside Service");
            let docObj3G = [];
            let gstin = req.headers["gstin"];
            let itemList = [];
            let fullItemList = [];
            let total_taxable_value = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
            
            for (var j = 0; j < req.body.de[0].items.length; j++) {
                total_taxable_value += parseFloat((req.body.de[0].items[j].txval == "" || req.body.de[0].items[j].txval == null) ? 0 : req.body.de[0].items[j].txval)
                total_sgst += parseFloat((req.body.de[0].items[j].sgst == "" || req.body.de[0].items[j].sgst == null) ? 0 : req.body.de[0].items[j].sgst);
                total_cgst += parseFloat((req.body.de[0].items[j].cgst == "" || req.body.de[0].items[j].cgst == null) ? 0 : req.body.de[0].items[j].cgst);
                total_igst += parseFloat((req.body.de[0].items[j].igst == "" || req.body.de[0].items[j].igst == null) ? 0 : req.body.de[0].items[j].igst);
                total_cess += parseFloat((req.body.de[0].items[j].cess == "" || req.body.de[0].items[j].cess == null) ? 0 : req.body.de[0].items[j].cess);

                itemList = {
                    itemid: req.body.de[0].items[j].itemid,
                    hsn: req.body.de[0].items[j].hsn,
                    taxable_value: req.body.de[0].items[j].txval || null,
                    apptaxrate: req.body.de[0].items[j].rate,
                    igst: req.body.de[0].items[j].igst || null,
                    cgst: req.body.de[0].items[j].cgst || null,
                    sgst: req.body.de[0].items[j].sgst || null,
                    cess: req.body.de[0].items[j].cess || null,
                    itemref: req.body.de[0].docref
                };

                fullItemList.push(itemList);
            }

            console.log("fullItemList :" + fullItemList);
                
            docObj3G = {
                docid: req.body.de[0].docid,
                doctyp: req.body.de[0].doctyp,
                ctin: req.body.de[0].ctin,
                legalname: req.body.de[0].lglNm,
                supply_type: req.body.de[0].suptype,
                pos: req.body.de[0].pos,
                docref: req.body.de[0].docref,
                flag: req.body.de[0].flag || null,
                num: req.body.de[0].doc.num,
                dt: req.body.de[0].doc.dt,
                doc_year: req.body.de[0].doc.year,
                val: req.body.de[0].doc.val,
                pos: req.body.de[0].pos,
                clmrfnd: req.body.de[0].clmrfnd,
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
                diff_percentage: req.body.de[0].diffprcnt,
                sec7: req.body.de[0].sec7act,
            };
            logger.log("debug","docObj3G : %s", docObj3G)              

            console.log("calling dao");
            gstindb = db.getConnection(gstin);          
            gstindb.serialize(() => {
            gstindb.run("BEGIN TRANSACTION;");

            anx13GDao.edit3G(docObj3G, fullItemList, gstin, docObj3G.fp, docObj3G.taxperiod, gstindb,req.headers["flag"])
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

            logger.log("info","Entering anx13gService | edit3Gtable : %s  ::  %s", new Date().getTime(), new Date().toString());
        });
        }
    }catch(err){
        db.rollBackAndCloseDBConn(gstindb);
        logger.log("error", "anx13gservice | edit 3g :err: %s", err);
    }
}


/**Save 3G - save details of 3G table
 * @param {*} req
 * @param {*} res
*/
function save3Gdetails(req, res) {
  
    logger.log("info","Entering anx13gService | save3Gdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;          
 try{   
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if (!validate3g(req, res)) {
        return;
    } else if (
        req.body.de === "null" || req.body.de === undefined || req.body.de === "") {
        sendResponse(res, 500, {
            message: "DE is missing in Request body",
            statusCd: STATUS_CD_ZERO
        });
    } else {
        console.log("Inside Service");
        let docObj3G = [];
        let itemList = [];
        let fullItemList = [];
        let total_taxable_value = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
            
        for (var j = 0; j < req.body.de[0].items.length; j++) {
            total_taxable_value += parseFloat((req.body.de[0].items[j].txval === "" || req.body.de[0].items[j].txval == null) ? 0 : req.body.de[0].items[j].txval);
            total_igst += parseFloat((req.body.de[0].items[j].igst == "" || req.body.de[0].items[j].igst == null) ? 0 : req.body.de[0].items[j].igst);
            total_sgst += parseFloat((req.body.de[0].items[j].sgst == "" || req.body.de[0].items[j].sgst == null) ? 0 : req.body.de[0].items[j].sgst);
            total_cgst += parseFloat((req.body.de[0].items[j].cgst == "" || req.body.de[0].items[j].cgst == null) ? 0 : req.body.de[0].items[j].cgst);
            total_cess += parseFloat((req.body.de[0].items[j].cess == "" || req.body.de[0].items[j].cess == null) ? 0 : req.body.de[0].items[j].cess);

            itemList = {
                hsn: req.body.de[0].items[j].hsn,
                taxable_value: req.body.de[0].items[j].txval || null,
                apptaxrate: req.body.de[0].items[j].rate,
                igst: req.body.de[0].items[j].igst || null,
                cgst: req.body.de[0].items[j].cgst || null,
                sgst: req.body.de[0].items[j].sgst || null,
                cess: req.body.de[0].items[j].cess || null,
                itemref: req.body.de[0].docref
            };

            fullItemList.push(itemList);
        }
        
        console.log("fullItemList :" + fullItemList)

        console.log("Making hearderList for 3g save");
            docObj3G = {
                docref: req.body.de[0].docref,
                ctin: req.body.de[0].ctin,
                legaltradename: req.body.de[0].lglNm,
                pos: req.body.de[0].pos,
                diff_percentage: req.body.de[0].diffprcnt,
                sec7: req.body.de[0].sec7act,
                doctyp: req.body.de[0].doctyp || null,
                upload_date: req.body.de[0].upld_dt || null,
                supply_type: req.body.de[0].suptype,
                fp: req.headers["fp"],
                taxperiod: req.body.rtnprd,
                status: "",
                flag: req.body.de[0].flag || null,
                taxable_value: total_taxable_value,
                igst: total_igst,
                cgst:total_cgst,
                sgst:total_sgst,
                cess: total_cess,
                errorcode: null,
                error_detail: null,
                doc_num: req.body.de[0].doc.num,
                doc_val: req.body.de[0].doc.val,
                doc_date: req.body.de[0].doc.dt,
                doc_year: req.body.de[0].doc.year,
                clmrfnd : req.body.de[0].clmrfnd
            };

            logger.log("info", "3G Doc Obj : %s", docObj3G);

            console.log("calling DAO for save 3g");
            gstindb = db.getConnection(gstin);  
            gstindb.serialize(() => {
            gstindb.run("BEGIN TRANSACTION;");

            anx13GDao.save3Gdetails(docObj3G, fullItemList, gstin, fp, rtnprd, gstindb, false)
            .then(() => {
                db.commitAndCloseDBConn(gstindb);
                res.status(200).send({ message: `${anx1Const.DOC_SAVE_SUCCESS}`, statusCd: STATUS_CD_ONE});
                logger.log("info","Exiting anx13gService | save3Gdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
            }).catch((err) => {
                logger.log("error","Error in anx13gService | save3Gdetails : %s", JSON.stringify(err));
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
    logger.log("error","Error in anx13GService | save3Gdetails : %s" , err);
}  
}


/**
 * To get the 3G Document level details for displaying in UI
 * @param {*} req 
 * @param {*} res 
 */
function get3GDetails(req, res) {

    console.log("Inside get3GDetails");

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

    anx13GDao.get3GDetails(gstin, rtnprd ,flag).
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

function delete3GBydocIds(req, res) {
    if (validateHeaders(req, res)) {
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {             
        anx13GDao
          .delete3GdocIdsDao(req.body.docids, req.headers["gstin"], fp, rtnprd, req.headers["flag"] , req.body.action)
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
function delete3gByItemId(req, res) {
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
        sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
      } else {
        anx13GDao
          .delete3gByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd,  req.headers["flag"],req.body.status)
          .then(data => {
            sendResponse(res, 200, { message: data, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message:(err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message) , statusCd: 0 });
          });
      }
    }
  };


    
module.exports = {
    edit3Gtable : edit3Gtable,
    save3Gdetails : save3Gdetails,
    get3GDetails : get3GDetails,
    delete3GBydocIds : delete3GBydocIds,
    delete3gByItemId : delete3gByItemId
}