const { validateHeaders} = require("../../utility/validate");
const { sendResponse } = require("../../utility/common");
const  anx13efDao = require("../../dao/anx1Dao/anx13efDao");
const { validate3ef } = require("../../utility/validators/anx1Validators/3efValidator");
const { STATUS_CD_ZERO, STATUS_CD_ONE} = require('../../utility/constants');
const _ = require("lodash");
const log  = require('../../utility/logger');
const logger = log.logger;
const anx1Const = require('../../utility/anx1Constants');
const db = require("../../db/dbUtil");


/** Edit details of 3EF table
 * @param {*} req
 * @param {*} res
*/
function edit3eftable(req, res) {

    logger.log("info","Entering anx13efService | edit3eftable : %s  ::  %s", new Date().getTime(), new Date().toString());
    let gstindb;
    try{
    if (req.body.sez === "null" || req.body.sez === undefined || req.body.sez === "") {
        sendResponse(res, 500, {
            message: "SEZ is missing in Request body",
            statusCd: 0
        });
        return 0;
    } 
    else if (!validate3ef(req, res)) {
        return;
    } 
    else {
        //console.log("Inside Service " + JSON.stringify(req.body));
        let docObj3EF = [];
        let gstin = req.headers["gstin"];
        let itemList = [];
        let fullItemList = [];
        let total_taxable_value = 0, total_igst = 0, total_cess = 0;
        
        for (var j = 0; j < req.body.sez[0].items.length; j++) {
            total_taxable_value += parseFloat((req.body.sez[0].items[j].txval == "" || req.body.sez[0].items[j].txval == null) ? 0 : req.body.sez[0].items[j].txval)
            total_igst += parseFloat((req.body.sez[0].items[j].igst == "" || req.body.sez[0].items[j].igst == null) ? 0 : req.body.sez[0].items[j].igst)
            total_cess += parseFloat((req.body.sez[0].items[j].cess == "" || req.body.sez[0].items[j].cess == null) ? 0 : req.body.sez[0].items[j].cess);

            itemList = {
                hsn: req.body.sez[0].items[j].hsn,
                taxable_value: req.body.sez[0].items[j].txval || null,
                apptaxrate: req.body.sez[0].items[j].rate,
                igst: req.body.sez[0].items[j].igst || null,
                cess: req.body.sez[0].items[j].cess || null,
                cgst: null,
                sgst: null,
                itemref: req.body.sez[0].docref,
                itemid: req.body.sez[0].items[j].itemid
            };

            fullItemList.push(itemList);
        }
        //console.log("fullItemList :" + fullItemList);
            
        docObj3EF = {
            docid: req.body.sez[0].docid,
            doctyp: req.body.sez[0].doctyp,
            ctin: req.body.sez[0].ctin,
            legalname: req.body.sez[0].lglNm,
            payTyp: req.body.sez[0].payTyp,
            docref: req.body.sez[0].docref,
            flag: req.body.sez[0].flag || null,
            num: req.body.sez[0].doc.num,
            dt: req.body.sez[0].doc.dt,
            doc_year: req.body.sez[0].doc.year,
            val: req.body.sez[0].doc.val,
            pos: req.body.sez[0].pos,
            clmrfnd: req.body.sez[0].clmrfnd,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null,
            diff_percentage: req.body.sez[0].diffprcnt,
            
        };
         
        //console.log("docObj3EF :" + docObj3EF);
            
        console.log("calling dao")
        gstindb = db.getConnection(gstin);          
        gstindb.serialize(() => {
        gstindb.run("BEGIN TRANSACTION;");  
        anx13efDao.edit3ef(docObj3EF, fullItemList, gstin, docObj3EF.fp, docObj3EF.taxperiod, gstindb,req.headers['flag'],req.body.sez[0].flag)
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

        logger.log("info","Exiting anx13efService | edit3eftable : %s  ::  %s", new Date().getTime(), new Date().toString());
    });
    }
}catch(err){
    db.rollBackAndCloseDBConn(gstindb);
    logger.log("error", "edit 3ef :err: %s", err);
}
}

/**
*  Delete the ANX1_3EF table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/

function delete3efBydocIds(req, res) {
    logger.log("info","Entering anx13efService | delete3efBydocIds : %s  ::  %s", new Date().getTime(), new Date().toString());  
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {             
        anx13efDao
          .delete3efdocIdsDao(req.body.docids, req.headers["gstin"], fp, rtnprd , req.headers['flag'],req.body.action)
          .then(data => {
            //console.log("dataaa",data)
            sendResponse(res, 200, { message: `${anx1Const.DOC_DELETE_SUCCESS}`, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: err.message , statusCd: 0 });
          });
          logger.log("info","Exiting anx13efService | delete3efBydocIds : %s  ::  %s", new Date().getTime(), new Date().toString());    
      }
    }
  };


  /**
 * Delete the ANX1_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
  function delete3efItemsByItemId(req, res) {
    logger.log("info","Entering anx13efService | delete3efItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());    
    if (validateHeaders(req, res)) {
  
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
        sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
      } else {
        anx13efDao
          .delete3efItemsByItemId(req.body.itemids, req.headers["gstin"], fp, rtnprd , req.headers['flag'] , req.body.status)
          .then(data => {
            sendResponse(res, 200, { message: data, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message) , statusCd: 0 });
          });
          logger.log("info","Exiting anx13efService | delete3efItemsByItemId : %s  ::  %s", new Date().getTime(), new Date().toString());      
      }
    }
  };

/**Save 3EF - save details of 3EF table
 * @param {*} req
 * @param {*} res
*/
function save3EFdetails(req, res) {

  logger.log("info","Entering anx13efService | save3EFdetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  let gstindb;
  try{
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if (!validate3ef(req, res)) {
        return;
    } else if (
        req.body.sez === "null" || req.body.sez === undefined || req.body.sez === "") {
        sendResponse(res, 500, {
            message: "SEZ is missing in Request body",
            statusCd: STATUS_CD_ZERO
        });
    } else {
        //console.log("Inside Service")
        let docObj3EF = [];
        let itemList = [];
        let fullItemList = [];
        let total_taxable_value = 0, total_igst = 0, total_cess = 0;
            
            for (var j = 0; j < req.body.sez[0].items.length; j++) {

                let item = req.body.sez[0].items[j];

                total_taxable_value += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);

                itemList = {
                    hsn: item.hsn || '',
                    taxable_value: item.txval || null,
                    apptaxrate: item.rate,
                    igst: item.igst || null,
                    cess: item.cess || null,
                    cgst: null,
                    sgst: null,
                    itemref: req.body.sez[0].docref
                };

            fullItemList.push(itemList);
            }
                
            logger.log("info", "3EF Items List : %s",fullItemList );
        
            docObj3EF = {
                docref: req.body.sez[0].docref,
                ctin: req.body.sez[0].ctin,
                legaltradename: req.body.sez[0].lglNm,
                pos: req.body.sez[0].pos,
                diff_percentage: req.body.sez[0].diffprcnt,
                doctyp : req.body.sez[0].doctyp || null,
                upload_date: req.body.sez[0].upld_dt || null,
                supply_type: (req.body.sez[0].suptype == "" || req.body.sez[0].suptype == null) ? "Inter-State" : req.body.sez[0].suptype,
                fp: req.headers["fp"],
                taxperiod: req.body.rtnprd,
                status: "",
                flag: req.body.sez[0].flag || null,
                taxable_value: total_taxable_value,
                igst: total_igst,
                cess: total_cess,
                errorcode: null,
                error_detail: null,
                doc_num: req.body.sez[0].doc.num,
                doc_val: req.body.sez[0].doc.val,
                doc_date: req.body.sez[0].doc.dt,
                doc_year: req.body.sez[0].doc.year,
                payTyp : req.body.sez[0].payTyp,
                clmrfnd : req.body.sez[0].clmrfnd
            };
            
            logger.log("info", "3EF Doc Obj : %s", docObj3EF);

            gstindb = db.getConnection(gstin);          
            gstindb.serialize(() => {
                gstindb.run("BEGIN TRANSACTION;");
                anx13efDao.save3EFdetails(docObj3EF, fullItemList, fp, rtnprd, gstindb, false)
                .then(() => {
                    db.commitAndCloseDBConn(gstindb);
                    res.status(200).send({ message: `${anx1Const.DOC_SAVE_SUCCESS}`, statusCd: STATUS_CD_ONE});
                    logger.log("info","Exiting anx13efService | save3ef : %s  ::  %s", new Date().getTime(), new Date().toString());
                }).catch((err) => {
                    logger.log("error","Error in anx13efService | save3ef : %s", JSON.stringify(err));
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
    logger.log("error","Error in anx13efService | save3EFdetails : %s" , err);
  }  
}


/**
 * To get the 3EF Document level details for displaying in UI
 * @param {*} req 
 * @param {*} res 
 */
function get3efDetails(req, res) {

 logger.log("info","Entering anx13efService | get3efDetails : %s  ::  %s", new Date().getTime(), new Date().toString());

  let gstin = req.headers["gstin"]; 
  let rtnprd = req.headers["rtnprd"];
  let flag = req.headers["flag"];
  
  //console.log("GSTIN : " + gstin + "  RtnPrd : " + rtnprd) ;
  if (gstin === undefined || gstin === "" || gstin === null) {
    sendResponse(res, 500, {message: "Missing GSTIN in the header", statusCd: STATUS_CD_ZERO });
  }
  
  if (rtnprd === undefined || rtnprd === "" || rtnprd === null) {
      sendResponse(res, 500, {message: "Missing rtnprd in the header", statusCd: STATUS_CD_ZERO});
  }
  
    anx13efDao.get3efDetails(gstin, rtnprd , flag).
    then(function (data) {
        res.status(201).send(data);
    }).catch(function (err) {
        sendResponse(res, 500, { message: err.message , statusCd: 0 });
    });
    logger.log("info","Exiting anx13efService | get3efDetails : %s  ::  %s", new Date().getTime(), new Date().toString());
  }

module.exports = {
    edit3eftable : edit3eftable,
    delete3efBydocIds : delete3efBydocIds,
    delete3efItemsByItemId : delete3efItemsByItemId,
    save3EFdetails : save3EFdetails,
    get3efDetails : get3efDetails

}




