const anx13bDao = require("../dao/anx13bDao");
const { validateAnx1Save3B, validateHeaders } = require("../utility/validate");
const { sendResponse } = require("../utility/common");
const _ = require("lodash");
const { STATUS_CD_ZERO, STATUS_CD_ONE} = require('../utility/constants');
const anx1Const = require('../utility/anx1Constants');
const log  = require('../utility/logger');
const logger = log.logger;
const db = require("../db/dbUtil");

/**Save 3B - save details of 3B table
 * @param {*} req
 * @param {*} res
*/
function save3Bdetails(req, res) {
 logger.log("info","Entering anx13bService | save3Bdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
 let gstindb;
 try{   
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    // console.log(validateAnx1Save3A(req, res))
    if (!validateAnx1Save3B(req, res)) {
        return;
    } else if (
        req.body.b2b === "null" || req.body.b2b === undefined || req.body.b2b === "") {
        sendResponse(res, 500, {
            message: "request body is missing the data to be saved",
            statusCd: STATUS_CD_ZERO
        });
    } else {
        console.log("Inside Service")
        let docObj3B = [];
        let itemList = [];
        let fullItemList = [];
        let total_taxable_value = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
            
            for (var j = 0; j < req.body.b2b[0].items.length; j++) {

                let item = req.body.b2b[0].items[j];

                total_taxable_value += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 : item.sgst);
                total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
                total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);

                itemList = {
                    hsn: item.hsn || "",
                    taxable_value: item.txval || null,
                    apptaxrate: item.rate,
                    igst: item.igst || null,
                    cgst: item.cgst || null,
                    sgst: item.sgst || null,
                    cess: item.cess || null,
                    itemref: req.body.b2b[0].docref
                };

                fullItemList.push(itemList);
            }
            logger.log("info", "3B Items List : %s",fullItemList );

            docObj3B = {
                docref: req.body.b2b[0].docref,
                ctin: req.body.b2b[0].ctin,
                legaltradename: req.body.b2b[0].legaltradename,
                pos: req.body.b2b[0].pos,
                diff_percentage: req.body.b2b[0].diffprcnt,
                doc_type: req.body.b2b[0].doctyp || null,
                sec7: req.body.b2b[0].sec7act,
                upload_date: req.body.b2b[0].upld_dt || null,
                supply_type: req.body.b2b[0].suptype,
                fp: req.headers["fp"],
                taxperiod: req.body.rtnprd,
                status: "",
                flag: req.body.b2b[0].flag || null,
                taxable_value: total_taxable_value,
                cgst: total_cgst,
                sgst: total_sgst,
                igst: total_igst,
                cess: total_cess,
                errorcode: null,
                error_detail: null,
                doc_num: req.body.b2b[0].doc.num,
                doc_val: req.body.b2b[0].doc.val,
                doc_date: req.body.b2b[0].doc.dt,
                doc_year: req.body.b2b[0].doc.year,
                ctinType: null
            };
            logger.log("info", "3B Doc Obj : %s", docObj3B);
            console.log("calling dao")
            
            gstindb = db.getConnection(gstin);          
            gstindb.serialize(() => {
                gstindb.run("BEGIN TRANSACTION;");
                anx13bDao.save3Bdetails(docObj3B, fullItemList, gstin, fp, rtnprd, gstindb)
                .then((result) => {
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
    } catch(err) {
        db.rollBackAndCloseDBConn(gstindb);
        logger.log("error", "Error in save 3B : %s" , err);
    }
}


/** Delete by Item ID
 * @param {*} req
 * @param {*} res
 */
function delete3BItemsByItemId(req, res) {
    if (validateHeaders(req, res)) {

        let rtnprd = req.headers["rtnprd"] || null;
        let fp = req.headers["fp"] || null;

        if (!req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids)) {
            sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
        } else {
            anx13bDao
                .delete3BItemsByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"] ,req.body.status)
                .then(data => {
                    sendResponse(res, 200, { message: data, statusCd: 1 });
                })
                .catch(err => {
                    sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message), statusCd: 0 });
                });
        }
    }
};



/**
 * To get the 3b Document level details for displaying in UI
 * @param {*} req 
 * @param {*} res 
 */
function get3bDetails(req, res) {

    console.log("Inside get3bDetails");

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
  
    anx13bDao.get3bDetails(gstin, rtnprd , flag).
    then(function (data) {
        res.status(201).send(data);
    }).catch(function (err) {
        res.status(500).send(err)
    });
  }

/**Edit 3B - Edit details of 3I table
 * @param {*} req
 * @param {*} res
*/

function edit3btable(req, res) {
logger.log("info","Entering anx13bService | edit3btable : %s  ::  %s", new Date().getTime(), new Date().toString());
let gstindb;
 try {
   let gstin = req.headers["gstin"] || null;
   let rtnprd = req.headers["rtnprd"] || null;
   let fp = req.headers["fp"] || null;
   
   if (!validateAnx1Save3B(req, res)) {
     return;
   } else if (
     req.body.b2b === "null" || req.body.b2b === undefined || req.body.b2b === "") {
     sendResponse(res, 500, {message: "request body is missing the data to be saved", statusCd: STATUS_CD_ZERO
     });
   }
   else {
     console.log("Inside Service : " + JSON.stringify(req.body.b2b));
     let docObj3B = [];
     let itemList = [];
     let fullItemList = [];
     let total_taxable_value = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;

    for (var j = 0; j < req.body.b2b[0].items.length; j++) {
        
        let item = req.body.b2b[0].items[j];

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
            itemref: req.body.b2b[0].docref
        };
        fullItemList.push(itemList);
    }

    docObj3B = {
        docid: req.body.b2b[0].docid,
        docref: req.body.b2b[0].docref,
        ctin: req.body.b2b[0].ctin,
        legaltradename: req.body.b2b[0].legaltradename,
        pos: req.body.b2b[0].pos,
        diff_percentage: req.body.b2b[0].diffprcnt,
        doc_type: req.body.b2b[0].doctyp || null,
        sec7: req.body.b2b[0].sec7act,
        upload_date: req.body.b2b[0].upld_dt || null,
        supply_type: req.body.b2b[0].suptype,
        fp: req.headers["fp"],
        taxperiod: req.body.rtnprd,
        status: "",
        taxable_value: total_taxable_value,
        cgst: total_cgst,
        sgst: total_sgst,
        igst: total_igst,
        cess: total_cess,
        flag: req.body.b2b[0].flag || null,
        errorcode: null,
        error_detail: null,
        doc_num: req.body.b2b[0].doc.num,
        doc_val: req.body.b2b[0].doc.val,
        doc_date: req.body.b2b[0].doc.dt,
        doc_year: req.body.b2b[0].doc.year,
        orgDocTyp: req.body.orgDocTyp,    
        orgCtin: req.body.orgCtin 
      };
    console.log("doc Obj 3B :" + docObj3B)
       
    console.log("fullItemList :" + fullItemList)

    console.log("calling dao");
    gstindb = db.getConnection(gstin);          
    gstindb.serialize(() => {
        gstindb.run("BEGIN TRANSACTION;");
        anx13bDao.updateb2bdetails(docObj3B, fullItemList, gstin, fp, rtnprd, gstindb, req.headers["flag"])
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
    logger.log("error", "edit 3b :err: %s", err)
}

}
   
/**
*  Delete the ANX1_3B table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
   function delete3bbydocId(req, res) {
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
      console.log(req.body);
      if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {

        anx13bDao
          .delete3bdocdao(req.body.docids, req.headers["gstin"], fp, rtnprd)
          .then(data => {
            sendResponse(res, 200, { message: `${anx1Const.DOC_DELETE_SUCCESS}`, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: err.message , statusCd: 0 });
          });
      }
    }
  };
  


   
module.exports={ 
    save3Bdetails: save3Bdetails,
    get3bDetails: get3bDetails,
    delete3BItemsByItemId: delete3BItemsByItemId,
    edit3btable: edit3btable,
    delete3bbydocId : delete3bbydocId
}