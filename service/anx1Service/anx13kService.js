const { validate3K } = require("../../utility/validators/anx1Validators/3kValidator");
const { sendResponse } = require("../../utility/common");
const  anx13KDao = require("../../dao/anx1Dao/anx13kDao");
const { validateHeaders } = require("../../utility/validate");
const { STATUS_CD_ONE, STATUS_CD_ZERO} = require('../../utility/constants');
const _ = require("lodash");
const anx1Const = require('../../utility/anx1Constants');
const db = require("../../db/dbUtil");

/** Edit details of 3K table
 * @param {*} req
 * @param {*} res
*/
function edit3Ktable(req, res) {

    logger.log("info","Entering anx13bService | edit3btable : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
    try {
        if (req.body.impgsez === "null" || req.body.impgsez === undefined || req.body.impgsez === "") {
            sendResponse(res, 500, {
                message: "impgsez is missing in Request body",
                statusCd: 0
            });
            return 0;
        } 
        else if (!validate3K(req, res)) {
            return;
        } 
        else {
            console.log("Inside Service " + JSON.stringify(req.body));
            let headerList = [];
            let gstin = req.headers["gstin"];
            let itemList = [];
            let fullItemList = [];
            let total_taxable_value = 0, total_igst = 0, total_cess = 0;
    
            for (var j = 0; j < req.body.impgsez[0].items.length; j++) {
                total_taxable_value += parseFloat((req.body.impgsez[0].items[j].txval == "" || req.body.impgsez[0].items[j].txval == null) ? 0 : req.body.impgsez[0].items[j].txval)
                total_igst += parseFloat((req.body.impgsez[0].items[j].igst == "" || req.body.impgsez[0].items[j].igst == null) ? 0 : req.body.impgsez[0].items[j].igst)
                total_cess += parseFloat((req.body.impgsez[0].items[j].cess == "" || req.body.impgsez[0].items[j].cess == null) ? 0 : req.body.impgsez[0].items[j].cess);

                itemList = {
                            itemid: req.body.impgsez[0].items[j].itemid,
                            hsn: req.body.impgsez[0].items[j].hsn,
                            taxable_value: req.body.impgsez[0].items[j].txval || null,
                            apptaxrate: req.body.impgsez[0].items[j].rate,
                            igst: req.body.impgsez[0].items[j].igst || null,
                            cess: req.body.impgsez[0].items[j].cess || null,
                            itemref: req.body.impgsez[0].docref,
                            sgst : null,
                            cgst : null
                };
    
                    fullItemList.push(itemList);
                }
                console.log("fullItemList :" + fullItemList);
                
                console.log(JSON.stringify(req.body.impgsez[0]))
                headerList = {
                                docid: req.body.impgsez[0].docid,
                                ctin: req.body.impgsez[0].ctin,
                                legalname: req.body.impgsez[0].lglNm,
                                doctyp: req.body.impgsez[0].doctyp,
                                pcode: req.body.impgsez[0].boe.pcode,
                                pos: req.body.impgsez[0].pos,
                                docref: req.body.impgsez[0].docref,
                                num: req.body.impgsez[0].boe.num,
                                dt: req.body.impgsez[0].boe.dt,
                                doc_year: req.body.impgsez[0].boe.year,
                                val: req.body.impgsez[0].boe.val,
                                fp: req.headers["fp"],
                                flag : req.body.impgsez[0].flag,
                                taxperiod: req.headers["rtnprd"],
                                status: "",
                                taxable_value: total_taxable_value,
                                igst: total_igst,
                                cess: total_cess,
                                errorcode: null,
                                error_detail: null,
                                orgCtin: req.body.orgCtin 
                };
                console.log("headerList :" + headerList);
                
                console.log("calling dao")
                gstindb = db.getConnection(gstin);          
                gstindb.serialize(() => {
                    gstindb.run("BEGIN TRANSACTION;");       
                    anx13KDao.edit3K(headerList, fullItemList, headerList.fp, headerList.taxperiod , gstindb, req.headers["flag"],headerList.flag)
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
                });
            }
    } catch(err){
        db.rollBackAndCloseDBConn(gstindb);
        logger.log("error", "edit 3k :err: %s", err)
    }     
  
}


/**Save 3K - save details of 3K table
 * @param {*} req
 * @param {*} res
*/
function save3K(req, res) {
  
    logger.log("info","Entering anx13KService | save3K : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
    try{
        let gstin = req.headers["gstin"] || null;
        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;

        if (!validate3K(req, res)) {
            return;
        } else if (
            req.body.impgsez === "null" || req.body.impgsez === undefined || req.body.impgsez === "") {
            sendResponse(res, 500, {
                message: "impgsez is missing in Request body",
                statusCd: 0
            });
        } else {
            console.log("Inside Service")
            let headerList = [];
            let itemList = [];
            let fullItemList = [];
            let total_taxable_value = 0, total_igst = 0, total_cess = 0;
           
            for (var j = 0; j < req.body.impgsez[0].items.length; j++) {
                total_taxable_value += parseFloat((req.body.impgsez[0].items[j].txval === "" || req.body.impgsez[0].items[j].txval == null) ? 0 : req.body.impgsez[0].items[j].txval);
                total_igst += parseFloat((req.body.impgsez[0].items[j].igst == "" || req.body.impgsez[0].items[j].igst == null) ? 0 : req.body.impgsez[0].items[j].igst);
                total_cess += parseFloat((req.body.impgsez[0].items[j].cess == "" || req.body.impgsez[0].items[j].cess == null) ? 0 : req.body.impgsez[0].items[j].cess);
                itemList = {
                    hsn: req.body.impgsez[0].items[j].hsn,
                    taxable_value: req.body.impgsez[0].items[j].txval || null,
                    apptaxrate: req.body.impgsez[0].items[j].rate,
                    igst: req.body.impgsez[0].items[j].igst || null,
                    cess: req.body.impgsez[0].items[j].cess || null,
                    sgst : null,
                    cgst : null,
                    itemref: req.body.impgsez[0].docref
                };
                fullItemList.push(itemList);
            }
                    
            console.log("Making hearderList for 3K save");
            headerList = {
                docref: req.body.impgsez[0].docref,
                ctin: req.body.impgsez[0].ctin,
                legaltradename: req.body.impgsez[0].lglNm,
                pos: req.body.impgsez[0].pos,
                doc_type: req.body.impgsez[0].doctyp || 'B',
                upload_date: req.body.impgsez[0].upld_dt || null,
                supply_type: req.body.impgsez[0].suptype || 'Inter-State',
                fp: req.headers["fp"],
                taxperiod: req.body.rtnprd,
                status: "",
                flag: req.body.impgsez[0].flag || null,
                taxable_value: total_taxable_value,
                igst: total_igst,
                cess: total_cess,
                errorcode: null,
                error_detail: null,
                boe_num: req.body.impgsez[0].boe.num,
                boe_val: req.body.impgsez[0].boe.val,
                boe_date: req.body.impgsez[0].boe.dt,
                boe_year: req.body.impgsez[0].boe.year,
                portCode : req.body.impgsez[0].boe.pcode
            };

            console.log("calling DAO for save 3K")

            gstindb = db.getConnection(gstin);          
            gstindb.serialize(() => {
                gstindb.run("BEGIN TRANSACTION;");
                anx13KDao.save3K(headerList, fullItemList, fp, rtnprd, gstindb)
                    .then((result) => {
                        console.log("doc saved : ", result);
                        db.commitAndCloseDBConn(gstindb);
                        res.status(200).send({ message: `${anx1Const.DOC_SAVE_SUCCESS}`, statusCd: STATUS_CD_ONE});
                    }).catch((err) => {
                        db.rollBackAndCloseDBConn(gstindb);  
                        if (err.message && err.message.includes("UNIQUE constraint failed")) {
                            res.status(500).send({ message: `${anx1Const.DOC_ALREADY_EXISTS}`, statusCd: STATUS_CD_ZERO});
                        } else {
                            res.status(500).send({ message: `${anx1Const.DOC_SAVE_ERROR}`, statusCd: STATUS_CD_ZERO});
                        }
                    });
                });
        }
    }  catch(err) {
        db.rollBackAndCloseDBConn(gstindb);
        logger.log("error", "Error in save 3B : %s" , err);
    }
    
}

/**
*  Delete the ANX1_3K table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
function delete3KBydocIds(req, res) {
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {             
        anx13KDao
          .delete3KdocIdsDao(req.body.docids, req.headers["gstin"], fp, rtnprd,req.headers["flag"],req.body.action)
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
function delete3kByItemId(req, res) {
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
        sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
      } else {
        anx13KDao
          .delete3kByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd,req.headers["flag"],req.body.status)
          .then(data => {
            sendResponse(res, 200, { message: data, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message) , statusCd: 0 });
          });
      }
    }
  };

/**
 * To get the 3K Document level details for displaying in UI
 * @param {*} req 
 * @param {*} res 
 */
function get3K(req, res) {

    console.log("Inside get3KDetails");

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

    anx13KDao.get3K(gstin, rtnprd , flag) .
    then(function (data) {
        res.status(201).send(data);
    }).catch(function (err) {
        sendResponse(res, 500, {message: err.message, statusCd: STATUS_CD_ZERO});
    });
}

module.exports = {
    edit3Ktable : edit3Ktable,
    delete3KBydocIds : delete3KBydocIds,
    delete3kByItemId : delete3kByItemId,
    save3K : save3K,
    get3K : get3K
}
