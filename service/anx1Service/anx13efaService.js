const { STATUS_CD_ZERO, STATUS_CD_ONE } = require('../../utility/constants');
const log = require('../../utility/logger');
const logger = log.logger;
const db = require("../../db/dbUtil");
const anx1Const = require('../../utility/anx1Constants');
const { validateHeaders } = require("../../utility/validate");
const { sendResponse } = require("../../utility/common");
const _ = require("lodash");
const anx13efaDao = require("../../dao/anx1Dao/anx13efaDao");
// const { validate3ef } = require("../../utility/validators/anx1Validators/3efValidator");
const { validateAnx1Saveseza } = require("../../utility/validators/anx1Validators/3efaValidator");


/**
 * To get the 3EF Document level details for displaying in UI
 * @param {*} req 
 * @param {*} res 
 */
function get3efaDetails(req, res) {

    logger.log("info", "Entering anx13efService | get3efaDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstin = req.headers["gstin"];
    let rtnprd = req.headers["rtnprd"];
    let flag = req.headers["flag"];

    //console.log("GSTIN : " + gstin + "  RtnPrd : " + rtnprd) ;
    if (gstin === undefined || gstin === "" || gstin === null) {
        sendResponse(res, 500, { message: "Missing GSTIN in the header", statusCd: STATUS_CD_ZERO });
    }

    if (rtnprd === undefined || rtnprd === "" || rtnprd === null) {
        sendResponse(res, 500, { message: "Missing rtnprd in the header", statusCd: STATUS_CD_ZERO });
    }

    anx13efaDao.get3efaDetails(gstin, rtnprd, flag).
        then(function (data) {
            res.status(201).send(data);
        }).catch(function (err) {
            sendResponse(res, 500, { message: err.message, statusCd: 0 });
        });
    logger.log("info", "Exiting anx13efService | get3efaDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
}


/**
*  Delete the ANX1_3SEZA table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
function delete3EFAdoc(req, res) {
    if (validateHeaders(req, res)) {
        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;
        if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
            sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
        } else {

            anx13efaDao.delete3EFAdao(req.body.docids, req.headers["gstin"], fp, rtnprd).then(data => {
                sendResponse(res, 200, { message: `${anx1Const.DOC_DELETE_SUCCESS}`, statusCd: 1 });
            })
                .catch(err => {
                  //  console.log("Doc delete check ::",err)
                    sendResponse(res, 500, { message: err.message, statusCd: 0 });
                });
        }
    }
};


/** Delete by Item ID
 * @param {*} req
 * @param {*} res
 */
function delete3EFAItem(req, res) {
    if (validateHeaders(req, res)) {

        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;

        if (!req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids)) {
            sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
        } else {
            anx13efaDao.delete3EFAItem(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"], req.body.status)
                .then(data => {
                    sendResponse(res, 200, { message: data, statusCd: 1 });
                })
                .catch(err => {
                    sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message), statusCd: 0 });
                });
        }
    }
};
/**Edit 3EFA - Edit details of 3I table
 * @param {*} req
 * @param {*} res
 */

function edit3efatable(req, res) {
    logger.log("info", "Entering edit3seza | editedit3seza : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
    try {
        let gstin = req.headers["gstin"] || null;
        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;

        if (!validateAnx1Saveseza(req, res)) {
            return;
        } else if (
            req.body.seza === "null" || req.body.seza === undefined || req.body.seza === "") {
            sendResponse(res, 500, {
                message: "request body is missing the data to be saved", statusCd: STATUS_CD_ZERO
            });
        }
        else {
            console.log("Inside Service : " + JSON.stringify(req.body.seza));
            let headerList = [];
            let itemList = [];
            let fullItemList = [];
            let total_taxable_value = 0, total_igst = 0, total_cess = 0;

            for (var j = 0; j < req.body.seza[0].items.length; j++) {

                let item = req.body.seza[0].items[j];

                total_taxable_value += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                //total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 : item.sgst);
                //total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
                total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);

                itemList = {
                    hsn: req.body.seza[0].items[j].hsn,
                    taxable_value: req.body.seza[0].items[j].txval || null,
                    apptaxrate: req.body.seza[0].items[j].rate,
                    igst: req.body.seza[0].items[j].igst || null,
                    cess: req.body.seza[0].items[j].cess || null,
                    cgst: null,
                    sgst: null,
                    itemref: req.body.seza[0].docref,
                    itemid: req.body.seza[0].items[j].itemid
                };
                fullItemList.push(itemList);
            }

            if(req.body.seza[0].pay_typ === 'SEZWOPA'){
                total_igst = null;
                total_cess = null;
            }
            headerList = {
                docref: req.body.seza[0].docref,
                docid: req.body.seza[0].docid,
                ctin: req.body.seza[0].ctin,
                lgl_trdname: req.body.seza[0].lgl_trdname,
                doctype: req.body.seza[0].doctyp || null,
                doc_num: req.body.seza[0].doc.num,
                doc_date: req.body.seza[0].doc.dt,
                doc_year: req.body.seza[0].doc.year,
                upload_dt: req.body.seza[0].upld_dt || null,
                flag: req.body.seza[0].flag || null,
                revctin: req.body.seza[0].revctin,
                rev_lgl_trdname: req.body.seza[0].rev_lgl_trdname,
                rev_doctype: req.body.seza[0].rev_doctyp || null,
                rev_doc_num: req.body.seza[0].revdoc.num,
                rev_doc_date: req.body.seza[0].revdoc.dt,
                rev_doc_year: req.body.seza[0].revdoc.year,
                rev_doc_val: req.body.seza[0].revdoc.val,
                rev_pos: req.body.seza[0].rev_pos,
                rev_diffprcnt: req.body.seza[0].rev_diffprcnt,
                rev_tax_value: total_taxable_value,
                rev_igst: total_igst,
                rev_cess: total_cess,
                rev_suptype: req.body.seza[0].rev_suptype,
                pay_typ: req.body.seza[0].pay_typ,
                clmrfnd: req.body.seza[0].  clmrfnd,
                status: "",
                errorcode: null,
                error_detail: null,
                fp: req.headers["fp"],
                taxperiod: req.body.rtnprd,
                orgDocTyp: req.body.orgDocTyp,
                orgCtin: req.body.orgCtin
            };
            gstindb = db.getConnection(gstin);
            gstindb.serialize(() => {
                gstindb.run("BEGIN TRANSACTION;");
                anx13efaDao.edit3EFADao(headerList, fullItemList, gstin, fp, rtnprd, gstindb, req.headers["flag"])
                    .then((result) => {
                        db.commitAndCloseDBConn(gstindb);
                        res.status(200).send({ message: `${anx1Const.DOC_UPDATE_SUCCESS}`, statusCd: STATUS_CD_ONE });
                    }).catch((err) => {
                        db.rollBackAndCloseDBConn(gstindb);
                        if (err.message && err.message.includes("UNIQUE constraint failed")) {
                            res.status(500).send({ message: `${anx1Const.DOC_ALREADY_EXISTS}`, statusCd: STATUS_CD_ZERO });
                        } else {
                            res.status(500).send({ message: `${anx1Const.DOC_UPDATE_ERROR}`, statusCd: STATUS_CD_ZERO });
                        }
                    });
            });
        }
    } catch (err) {
        db.rollBackAndCloseDBConn(gstindb);
        logger.log("error", "edit 3seza :err: %s", err)
    }
}

module.exports = {
    get3efaDetails: get3efaDetails,
    delete3EFAdoc: delete3EFAdoc,
    delete3EFAItem: delete3EFAItem,
    edit3efatable: edit3efatable
}  