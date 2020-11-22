const { validateAnx1Saveb2ba } = require("../../utility/validators/anx1Validators/b2baValidator");
const anx1b2baDao = require("../../dao/anx1Dao/Anx1b2baDao");
const { STATUS_CD_ZERO, STATUS_CD_ONE } = require('../../utility/constants');
const db = require("../../db/dbUtil");
const anx1Const = require('../../utility/anx1Constants');
const { validateHeaders } = require("../../utility/validate");
const { sendResponse } = require("../../utility/common");
const _ = require("lodash");

/**Edit 3B2BA - Edit details of 3I table
 * @param {*} req
 * @param {*} res
*/

function edit3B2BA(req, res) {
    logger.log("info", "Entering edit3B2BA | editedit3B2BA : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
    try {
        let gstin = req.headers["gstin"] || null;
        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;

        if (!validateAnx1Saveb2ba(req, res)) {
            return;
        } else if (
            req.body.b2ba === "null" || req.body.b2ba === undefined || req.body.b2ba === "") {
            sendResponse(res, 500, {
                message: "request body is missing the data to be saved", statusCd: STATUS_CD_ZERO
            });
        }
        else {
            
            let headerList = [];
            let itemList = [];
            let fullItemList = [];
            let total_taxable_value = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;

            for (var j = 0; j < req.body.b2ba[0].items.length; j++) {

                let item = req.body.b2ba[0].items[j];

                total_taxable_value += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 : item.sgst);
                total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
                total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);

                itemList = {
                    itemid: item.itemid,
                    hsn: item.hsn,
                    taxable_value: item.txval || null,
                    apptaxrate: item.rate,
                    igst: item.igst || null,
                    cgst: item.cgst || null,
                    sgst: item.sgst || null,
                    cess: item.cess || null,
                    itemref: req.body.b2ba[0].docref
                };
                fullItemList.push(itemList);
            }

      

            headerList = {
                docid: req.body.b2ba[0].docid,
                docref: req.body.b2ba[0].docref,
                rev_docref: req.body.b2ba[0].revdocref,
                ctin: req.body.b2ba[0].ctin,
                lgl_trdname: req.body.b2ba[0].lgl_trdname,
                doctype: req.body.b2ba[0].doctyp || null,
                doc_num: req.body.b2ba[0].doc.num,
                doc_date: req.body.b2ba[0].doc.dt,
                doc_year: req.body.b2ba[0].doc.year,
                ctin_type: null,
                upload_dt: req.body.b2ba[0].upld_dt || null,
                flag: req.body.b2ba[0].flag || null,
                revctin: req.body.b2ba[0].revctin,
                rev_lgl_trdname: req.body.b2ba[0].rev_lgl_trdname,
                rev_doctype: req.body.b2ba[0].rev_doctyp || null,
                rev_doc_num: req.body.b2ba[0].revdoc.num,
                rev_doc_date: req.body.b2ba[0].revdoc.dt,
                rev_doc_year: req.body.b2ba[0].revdoc.year,
                rev_doc_val: req.body.b2ba[0].revdoc.val,
                rev_tax_value: total_taxable_value,
                rev_igst: total_igst,
                rev_cgst: total_cgst,
                rev_sgst: total_sgst,
                rev_cess: total_cess,
                rev_suptype: req.body.b2ba[0].rev_suptype,
                rev_pos: req.body.b2ba[0].rev_pos,
                rev_diffprcnt: req.body.b2ba[0].rev_diffprcnt,
                rev_sec7act: req.body.b2ba[0].rev_sec7act,
                rev_ctin_type: null,
                status: "",
                fp: req.headers["fp"],
                taxperiod: req.body.rtnprd,
                orgDocTyp: req.body.orgDocTyp,    
                orgCtin: req.body.orgCtin,
                errorcode: null,
                error_detail: null,

            };


            gstindb = db.getConnection(gstin);
            gstindb.serialize(() => {
                gstindb.run("BEGIN TRANSACTION;");
                anx1b2baDao.editB2BADao(headerList, fullItemList, gstin, fp, rtnprd, gstindb, req.headers["flag"])
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
        logger.log("error", "edit 3b2ba :err: %s", err)
    }

}


/**
  * To get the 3bao Document level details for displaying in UI
  * @param {*} req 
  * @param {*} res 
  */
function get3ba(req, res) {

    let gstin = req.headers["gstin"];
    let rtnprd = req.headers["rtnprd"];
    let flag = req.headers["flag"];

    console.log("GSTIN : " + gstin + "  RtnPrd : " + rtnprd);
    if (gstin === undefined || gstin === "" || gstin === null) {
        sendResponse(res, 500, { message: "Missing GSTIN in the header", statusCd: STATUS_CD_ZERO });
    }

    if (rtnprd === undefined || rtnprd === "" || rtnprd === null) {
        sendResponse(res, 500, { message: "Missing rtnprd in the header", statusCd: STATUS_CD_ZERO });
    }

    anx1b2baDao.get3baDetails(gstin, rtnprd, flag).
        then(function (data) {
        res.status(201).send(data);
        }).catch(function (err) {
            res.status(500).send(err)
        });
}


/**
*  Delete the ANX1_3BA table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
function delete3babydocId(req, res) {
    if (validateHeaders(req, res)) {
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
      if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {

        anx1b2baDao.delete3badocdao(req.body.docids, req.headers["gstin"], fp, rtnprd).then(data => {
            sendResponse(res, 200, { message: `${anx1Const.DOC_DELETE_SUCCESS}`, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: err.message , statusCd: 0 });
          });
      }
    }
  };
/** Delete by Item ID
 * @param {*} req
 * @param {*} res
 */
function delete3BAItemsByItemId(req, res) {
    if (validateHeaders(req, res)) {

        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;

        if (!req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids)) {
            sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
        } else {
            anx1b2baDao.delete3BAItemsByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"] ,req.body.status)
                .then(data => {
                    sendResponse(res, 200, { message: data, statusCd: 1 });
                })
                .catch(err => {
                    sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message), statusCd: 0 });
                });
        }
    }
};


module.exports = {

    edit3B2BA: edit3B2BA,
    get3ba: get3ba,
    delete3babydocId:delete3babydocId,
    delete3BAItemsByItemId:delete3BAItemsByItemId,

};