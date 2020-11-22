const { validateHeaders } = require("../../utility/validate");
const { validate3h } = require("../../utility/validators/anx1Validators/3hValidatior");
const anx13hDao= require("../../dao/anx1ADao/anx13HADao");

const { sendResponse } = require("../../utility/common");
const _ = require("lodash")
const logger = require('../../utility/logger').logger;

// function to save data for 3H
async function saveTab3HTxn(req,res) {
  logger.log("info","Entering anx13hService.saveTab3HTxn");
    try {
        let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    // console.log(validateAnx1Save3A(req, res))
    if (!validate3h(req, res)) {
      return;
    } else if (
      req.body.rev === "null" ||
      req.body.rev === undefined ||
      req.body.rev === ""
    ) {
      sendResponse(res, 500, {
        message: "request body is missing the data to be saved",
        statusCd: 0
      });
    } else {
      let headerList = [];
      let item = [];
      let items = [];
      let total_taxable_value =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
    //   return new Promise((resolve, reject) => {

        for (var i = 0; i < req.body.rev[0].docs.length; i++) {
          for (var j = 0; j < req.body.rev[0].docs[i].items.length; j++) {
            total_taxable_value += parseFloat((req.body.rev[0].docs[i].items[j].txval == "" || req.body.rev[0].docs[i].items[j].txval == null) ? 0 : req.body.rev[0].docs[i].items[j].txval)
            total_sgst += parseFloat((req.body.rev[0].docs[i].items[j].sgst == "" || req.body.rev[0].docs[i].items[j].sgst == null) ? 0 : req.body.rev[0].docs[i].items[j].sgst)
            total_cgst += parseFloat((req.body.rev[0].docs[i].items[j].cgst == "" || req.body.rev[0].docs[i].items[j].cgst == null) ? 0 : req.body.rev[0].docs[i].items[j].cgst)
            total_igst += parseFloat((req.body.rev[0].docs[i].items[j].igst == "" || req.body.rev[0].docs[i].items[j].igst == null) ? 0 : req.body.rev[0].docs[i].items[j].igst)
            total_cess += parseFloat((req.body.rev[0].docs[i].items[j].cess == "" || req.body.rev[0].docs[i].items[j].cess == null) ? 0 : req.body.rev[0].docs[i].items[j].cess);
          }
         
        }
       
        for (var i = 0; i <req.body.rev[0].docs.length; i++) {
          for (var j = 0; j < req.body.rev[0].docs[i].items.length; j++) {
            logger.log("info","Header Object");
             headerList = {
              docref :req.body.rev[0].docs[i].docref,
              ctin : req.body.rev[0].ctin,
              legaltradename : req.body.rev[0].docs[i].legaltradename,
              pos: req.body.rev[0].docs[i].pos,
              diff_percentage: req.body.rev[0].docs[i].diffpercnt ,
              doc_type: req.body.rev[0].docs[i].doctyp || null,
              sec7: req.body.rev[0].docs[i].sec7act,
              upload_date: req.body.rev[0].docs[i].upld_dt || null,
              supply_type: req.body.rev[0].docs[i].suptype,
              fp: req.headers["fp"] ,  
              taxperiod: req.body.rtnprd ,
              status: "",
              flag: req.body.rev[0].docs[i].rst || null ,
              taxable_value : total_taxable_value ,
              cgst : total_cgst  ,
              sgst: total_sgst  ,
              igst: total_igst  ,
              cess: total_cess  ,
              errorcode: null,
              error_detail: null,
              rfndelg : "Y"

            };
            logger.log("info","Header Object");
             item = {
              hsn : req.body.rev[0].docs[i].items[j].hsn || "",
              taxable_value: req.body.rev[0].docs[i].items[j].txval || null,
              apptaxrate: req.body.rev[0].docs[i].items[j].rate,
              igst: req.body.rev[0].docs[i].items[j].igst || null,
              cgst: req.body.rev[0].docs[i].items[j].cgst || null,
              sgst: req.body.rev[0].docs[i].items[j].sgst || null,
              cess: req.body.rev[0].docs[i].items[j].cess || null,
              itemref : req.body.rev[0].docs[i].docref
              };

              items.push(item);
          }
        }
        console.log('headerList', headerList);
        let save3h = await anx13hDao.savetab3HATxn(headerList ,items , gstin, fp, rtnprd)
        res.status(save3h.statusCd === "0" ? 500 : 200).send( save3h.statusCd === "0" ? {"err": save3h} : {"rev":save3h});

    }
    } catch (error) {
        sendResponse(res, 500, { message: JSON.parse(error.message)  , statusCd: 0 });
    }
    
  }

// function to edit data in table 3H
async function editTab3HTxn(req,res) {
  logger.log("info","Entering anx13haService.editTab3HTxn");
  try {
    let gstin = req.headers["gstin"] || null;
  let rtnprd = req.headers["rtnprd"] || null;
  let fp = req.headers["fp"] || null;

  // console.log(validateAnx1Save3A(req, res))
  if (!validate3h(req, res)) {
    return;
  } else if (
    req.body.rev === "null" ||
    req.body.rev === undefined ||
    req.body.rev === ""
  ) {
    sendResponse(res, 500, {
      message: "request body is missing the data to be saved",
      statusCd: 0
    });
  } 
  else {
    let editTab3h = [];
    let item = [];
    let items = [];
    let total_taxable_value =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
    // return new Promise((resolve, reject) => {

      for (var i = 0; i < req.body.rev[0].docs.length; i++) {
        for (var j = 0; j < req.body.rev[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat((req.body.rev[0].docs[i].items[j].txval == "" || req.body.rev[0].docs[i].items[j].txval == null) ? 0 : req.body.rev[0].docs[i].items[j].txval)
          total_sgst += parseFloat((req.body.rev[0].docs[i].items[j].sgst == "" || req.body.rev[0].docs[i].items[j].sgst == null) ? 0 : req.body.rev[0].docs[i].items[j].sgst)
          total_cgst += parseFloat((req.body.rev[0].docs[i].items[j].cgst == "" || req.body.rev[0].docs[i].items[j].cgst == null) ? 0 : req.body.rev[0].docs[i].items[j].cgst)
          total_igst += parseFloat((req.body.rev[0].docs[i].items[j].igst == "" || req.body.rev[0].docs[i].items[j].igst == null) ? 0 : req.body.rev[0].docs[i].items[j].igst)
          total_cess += parseFloat((req.body.rev[0].docs[i].items[j].cess == "" || req.body.rev[0].docs[i].items[j].cess == null) ? 0 : req.body.rev[0].docs[i].items[j].cess);
        }
      }
     
      for (var i = 0; i <req.body.rev[0].docs.length; i++) {
        for (var j = 0; j < req.body.rev[0].docs[i].items.length; j++) {
          logger.log("info","Header list");
           editTab3h = {
            docid : req.body.rev[0].docs[i].docid,
            docref :req.body.rev[0].docs[i].docref,
            ctin : req.body.rev[0].ctin,
            legaltradename : req.body.rev[0].docs[i].legaltradename,
            pos: req.body.rev[0].docs[i].pos,
            diff_percentage: req.body.rev[0].docs[i].diffpercnt ,
            doc_type: req.body.rev[0].docs[i].doctyp || null,
            sec7: req.body.rev[0].docs[i].sec7act,
            upload_date: req.body.rev[0].docs[i].upld_dt || null,
            supply_type: req.body.rev[0].docs[i].suptype,
            fp: req.headers["fp"] ,  
            taxperiod: req.body.rtnprd ,
            status: "",
            flag: req.body.rev[0].docs[i].rst || null ,
            taxable_value : total_taxable_value ,
            cgst : total_cgst,
            sgst: total_sgst,
            igst: total_igst,
            cess: total_cess ,
            errorcode: null,
            error_detail: null,
            rfndelg : "Y"
          };
           item = {
            itemid : req.body.rev[0].docs[i].items[j].itemid,
            hsn : req.body.rev[0].docs[i].items[j].hsn || "",
            taxable_value: req.body.rev[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.rev[0].docs[i].items[j].rate,
            igst: req.body.rev[0].docs[i].items[j].igst || null,
            cgst: req.body.rev[0].docs[i].items[j].cgst || null,
            sgst: req.body.rev[0].docs[i].items[j].sgst || null,
            cess: req.body.rev[0].docs[i].items[j].cess || null,
            itemref : req.body.rev[0].docs[i].docref
            };

            items.push(item);
        }
      }

      let edit3h = await anx13hDao.editTab3HATxn(editTab3h, items , gstin, req.headers["flag"])
      res.status(edit3h.statusCd === "0" ? 500 : 200).send({ 'rev' : edit3h});
   
  }
  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
  
}


//get all 3H details 
async function getTab3Hdetails (req, res) {
  logger.log("info","Entering anx13hService.getTab3Hdetails");
try {
  
  var rtnprd=req.headers["rtnprd"] ||null;
  const flag = req.headers["flag"] || null;

if(validateHeaders){
  let getData = await anx13hDao.gettable3HAdetailsTxn(req.headers["gstin"] , rtnprd , flag)
  if(_.isEmpty(getData)){
    throw new Error(message = "No document added")
  } else {
    let responseData =  _.map(getData , row =>{
      return  {
        ctin:row.CTIN,
        docid:row.DOC_ID,
        docref:row.DOCREF,
        trdnm:row.LGL_TRDNAME,
        pos:row.POS,
        txval:row.TAX_VALUE,
        igst:row.IGST,
        cgst:row.CGST,
        sgst:row.SGST,
        cess:row.CESS,
        diffprcnt:row.DIFF_PERCENTAGE,
        sec7act:row.SEC7_ACT,
        suptype:row.SUPPLY_TYPE,
        upldt:row.UPLOAD_DT,
        flag:row.FLAG,
        status:row.STATUS,
        fp:row.FP,
        doctyp:row.DOCTYPE,
        taxprd:row.TAX_PERIOD,
        errorcode:row.ERROR_CODE,
        errordetail:row.ERROR_DETAIL
      }
    })
    res.status(200).send({ 'rev' : responseData});
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
async function delete3HItemsByItemIdTxn(req, res) {
logger.log("info","Entering anx13hService.deleteTab3HByItemIdTxn");
try {
  if (validateHeaders(req, res)) {

    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
      sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
    } else {
     anx13hDao.deleteTab3HAByItemIdTxn(req.body.itemids, req.headers["gstin"], fp, rtnprd)
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

 
};

/**
 *  Delete the ANX1_3H table records based on array of docId in request body
 * @param {*} req
 * @param {*} res
 */
async function delete3HBydocIdsTxn(req, res) {
  logger.log("info","Entering anx13hService.delete3HBydocIdsTxn"+req.headers["actionflag"]);
try {
  if (validateHeaders(req, res)) {
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if (!req.body || !req.body.docids || !Array.isArray(req.body.docids) || req.body.docids === null) {
      sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
    } else {
        let data = await anx13hDao.deleteTab3HABydocidsTxn(req.body.docids, req.headers["gstin"], fp, rtnprd, req.headers["flag"],req.body.action)
        sendResponse(res, 200, { message: `${data} : Document(s) deleted successfully`, statusCd: 1 });
    }
  }
} catch (error) {
  sendResponse(res, 500, { message: error.message, statusCd: 0 });
}

  
};



module.exports = {
    saveTab3HTxn:saveTab3HTxn,
    editTab3HTxn:editTab3HTxn,
    getTab3Hdetails: getTab3Hdetails,
    delete3HBydocIdsTxn: delete3HBydocIdsTxn,
    delete3HItemsByItemIdTxn: delete3HItemsByItemIdTxn
    
  }