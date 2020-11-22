
const { validateHeaders } = require("../../utility/validate");
const { validate3ja } = require("../../utility/validators/anx1Validators/3JAValidator");
const anx13jDao = require("../../dao/anx1ADao/anx13JADao");
const { sendResponse } = require("../../utility/common");
const _ = require("lodash")
const logger = require("../../utility/logger").logger;


/**
 *get all table3j details based on returned Period 
 * @param {*} req 
 * @param {*} res 
 */
async function getTab3jadetails(req, res) {
  logger.log("info","Entering anx13jService.getTab3jdetails");
  if (validateHeaders(req, res)) {
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let flag = req.headers["flag"] || null;
    let getAll3j = await anx13jDao.getTab3jadetails(gstin, rtnprd , flag)

    let resp = {
      gstin: gstin,
      rtnprd: rtnprd,
      "impga" : [{"docs": getAll3j}]
    }

    res.status(getAll3j.statusCd === "0" ? 500 : 200).send(getAll3j.statusCd === "0" ? getAll3j : resp);
  }
}

/**Save 3j - save details of 3j table
 * @param {*} req
 * @param {*} res
*/
async function saveTab3jaTxn(req, res) {
  logger.log("info","Entering anx13jService.saveTab3jTxn");
  try{
    if (validateHeaders(req, res) && validate3ja(req,res)) {
      if (_.isEmpty(req.body) || _.isEmpty(req.body.impga[0]) || _.isEmpty(req.body.impga[0].docs)) {
        sendResponse(res, 500, {
          message: "Request body should not be Empty",
          statusCd: 0
        });
      }
      else {
  
        let validateItems = await req.body.impga[0].docs[0].items.map( row => {       
            // check is Empty or not a number then throw error
          return (_.isEmpty(row.hsn) && !_.isNumber(row.hsn)) 
                  ? "hsn"   : (_.isEmpty(row.txval) && !_.isNumber(row.txval)) 
                  ? "txval" : (_.isEmpty(row.rate) && !_.isNumber(row.rate)) 
                  ? "rate"  :1
  
        }) 
  
        if(validateItems[0] === 1){
          let gstin = req.headers["gstin"];
          let doc = req.body.impga[0].docs[0]
            let tab3j = {
              "odocref": doc.odocref,
              "odoctyp":doc.odoctyp,
              "odocnum":doc.oboe.num,
              "odocdt" : doc.oboe.dt,
              "opcode": doc.oboe.pcode,
              "oyear": doc.oboe.year,
              "docnum":doc.boe.num,
              "doctyp":doc.doctyp,
              "pcode": doc.boe.pcode,
              "docdt" : doc.boe.dt,
              "docval" : doc.boe.val,
              "year": doc.boe.year,
              "cess":  0.0,
              "diffpercnt": doc.diffpercnt,
              "docref": doc.docref,
              "flag": doc.flag,
              "fp": req.headers["fp"],
              "igst":  0.0,
              "pos": doc.pos || null,
              "rfndelg": doc.rfndelg || "Y",
              "status": doc.status,
              "suptype": doc.suptyp || "Inter-State",
              "taxPeriod": req.headers["rtnprd"],
              "taxVal": 0.0,
              "upldt": doc.uplddt || null
            }
    
            let items = await req.body.impga[0].docs[0].items.map(row => {
    
              // Total calculation fot 3j table to save
              tab3j.taxVal += parseFloat((row.txval == "")?0:row.txval)
              tab3j.igst += parseFloat((row.igst == "")?0:row.igst)
              tab3j.cess += parseFloat((row.cess == "")?0:row.cess)
    
              return {
                "hsn": row.hsn,
                "apptaxrate": row.rate,
                "taxable_value": row.txval,
                "igst": row.igst || 0,
                "cgst": null,
                "sgst": null,
                "cess": row.cess || 0,
                "itemref": doc.docref
              }
            })
            let save3j = await anx13jDao.saveTab3jaTxn(tab3j, items, gstin)
            res.status(save3j.statusCd === "0" ? 500 : 200).send(save3j);
        }
         else {
          sendResponse(res, 500, {message: `${validateItems[0]} should not be null or empty`,
          statusCd: 0
        });
        }
      }
    }
  }
  catch(error){
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  } 
 }

 /**Edit 3j - Edit details of 3j table
 * @param {*} req
 * @param {*} res
*/
async function editTab3jaTxn(req, res) {
  logger.log("info","Entering anx13jService.editTab3jTxn");
  try
  {


    if (validateHeaders(req, res) && validate3ja(req,res)) {
      if (_.isEmpty(req.body) || _.isEmpty(req.body.impga[0]) || _.isEmpty(req.body.impga[0].docs)) {
        sendResponse(res, 500, {
          message: "Request body should not be Empty",
          statusCd: 0
        });
      }
      else { 
        let gstin = req.headers["gstin"];
        let doc = req.body.impga[0].docs[0]
  
        let lclpos = doc.docref.slice(0, 2)
  
          let tab3j = {
              "odocref": doc.odocref,
              "odoctyp":doc.odoctyp,
              "odocnum":doc.oboe.num,
              "odocdt" : doc.oboe.dt,
              "opcode": doc.oboe.pcode,
              "oyear": doc.oboe.year,
              "docid":doc.docid,
              "docnum":doc.boe.num,
              "doctyp":doc.doctyp,
              "pcode": doc.boe.pcode,
              "docdt" : doc.boe.dt,
              "docval" : doc.boe.val,
              "year": doc.boe.year,
              "cess":  0.0,
              "diffpercnt": doc.diffpercnt,
              "docref": doc.docref,
              "flag": doc.flag,
              "fp": req.headers["fp"],
              "igst":  0.0,
              "pos": doc.pos || null,
              "rfndelg": doc.rfndelg || "Y",
              "status": "",
              "suptype": doc.suptyp || "Inter-State",
              "taxVal": 0.0,
              "taxPeriod": req.headers["rtnprd"]
              
          }
  
          let items = await req.body.impga[0].docs[0].items.map(row => {
  
            // Total calculation fot 3j table to save
            tab3j.taxVal += parseFloat(row.txval?row.txval:0)
            tab3j.igst += parseFloat(row.igst?row.igst : 0)
            tab3j.cess += parseFloat(row.cess?row.cess: 0)
  
            return {
              "itemid": row.itemid,
              "hsn": row.hsn, 
              "apptaxrate": row.rate,
              "taxable_value": row.txval,
              "igst": row.igst,
              "cgst": null,
              "sgst": null,
              "cess": row.cess || null,
              "itemref": doc.docref
            }
          })
          let edit3j = await anx13jDao.editTab3jaTxn(tab3j, items, gstin,req.headers["flag"],doc.flag)
          res.status(edit3j.statusCd === "0" ? 500 : 200).send(edit3j);
        }
      }
  }
  catch(error){
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }


  }


  /**
*  Delete the ANX1_3J table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
async function deleteTab3jaBydocidsTxn(req, res) {
  logger.log("info","Entering anx13jService.deleteTab3jBydocidsTxn");
  try {
    if (validateHeaders(req, res)) {

      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
      let gstin = req.headers["gstin"];
  
      if (_.isEmpty(req.body) || _.isEmpty(req.body.docids)) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {
        let delete3jData = await anx13jDao.deleteTab3jaBydocidsTxn(req.body.docids, gstin, fp, rtnprd , req.headers["flag"], req.body.action)          
            sendResponse(res, 200, { message: `number of records:  ${delete3jData} deleted successfully`, statusCd: 1 });
         }
    }
  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
 
}

/**
 * Delete the ANX1_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
function deleteTab3jaByItemIdTxn(req, res) {
  logger.log("info","Entering anx13jService.deleteTab3jByItemIdTxn");
  try {
    if (validateHeaders(req, res)) {

      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
        sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
      } else {
        anx13jDao.deleteTab3jaByItemIdTxn(req.body.itemids, req.headers["gstin"], fp, rtnprd,req.headers['flag'] , req.body.status)
          .then(data => {
            sendResponse(res, 200, { message: data, statusCd: 1 });
          })
          .catch(err => {
            sendResponse(res, 500, { message: (err.message.indexOf("Error:") > -1 ? ((err.message.split(":"))[1]).trim() : err.message) , statusCd: 0 });
          });
      }
    }
  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
 
}



module.exports = {
  getTab3jadetails: getTab3jadetails,
  saveTab3jaTxn:saveTab3jaTxn,
  editTab3jaTxn:editTab3jaTxn,
  deleteTab3jaBydocidsTxn:deleteTab3jaBydocidsTxn,
  deleteTab3jaByItemIdTxn:deleteTab3jaByItemIdTxn
  }
