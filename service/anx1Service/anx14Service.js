const {validateHeaders} = require("../../utility/validate");
const {validate4} = require("../../utility/validators/anx1Validators/anx14Validator");
const anx14Dao = require("../../dao/anx1Dao/anx14Dao");
const { sendResponse } = require("../../utility/common");
const _ = require("lodash")
const logger = require("../../utility/logger").logger;


//get all table4  details 
function getTab4details(req, res) {

  logger.log("info","Entering anx14Service.getTab4details");
    var gstin = req.headers["gstin"] || null;
    var rtnprd=req.headers["rtnprd"] ||null;
    var profile=req.headers["profile"] || null;
    var issez=req.headers["issez"] || null;
    var flag=req.headers["flag"] || null;

    if(validateHeaders(req,res)){
    anx14Dao .getTab4details(gstin , rtnprd , flag)
      .then((tab4Details) =>{    
        if (tab4Details.length === 0) {
          return({ message: "No Data found", statusCd: 0 });
        }
      else {
     
    let ecomdetails = tab4Details.map( (row) =>{
        return  {
          etin:row.ETIN,
          docid:row.DOC_ID,
          docref:row.DOC_REF,
          lgltrdname:row.LGL_TRDNAME,
         // suptype:row.SUPPLY_TYPE,
          sup:row.SUPPLY_VAL,
          supr:row.SUPPLY_VAL_RETURNED,
          nsup:row.NET_SUPPLY_VAL,
          igst: (row.IGST == null) ?"":row.IGST ,
          cgst: (row.CGST == null) ? "" : row.CGST,
          sgst: (row.SGST == null) ? "" : row.SGST,
          cess: (row.CESS == null) ? "" : row.CESS,
          upldt:row.UPLOAD_DATE,
          flag:row.FLAG,
          status:row.STATUS,
          fp:row.FP,
          rtnprd:row.TAX_PERIOD,
          errorcode:row.ERROR_CODE,
          errordetail:row.ERROR_DETAIL
        }
     })
    /*   {
    
      ecomdetails.push(docdetails)
    } */
       return {"ecom":ecomdetails}
  }
    })
    .then(data => {
      res.status(200).send(data);
    })
    .catch(function(err) {
      res.status(500).send({"message":err.message,statusCd: 0});
    });
  }
  }  
  
 // with transactions :: table 4

/**Save table 4 - save details of  table 4
 * @param {*} req
 * @param {*} res
*/
async function saveTab4Txn(req, res) {
  logger.log("info","Entering anx14Service.saveTab4Txn");
  try{
    if (validateHeaders(req, res)) {
      if (_.isEmpty(req.body.ecom) || _.isEmpty(req.body.ecom) || _.isEmpty(req.body.ecom)) {
        sendResponse(res, 500, {
          message: "Request body should not be Empty",
          statusCd: 0
        });
      }
      else {
        if(validate4(req,res)){
          let gstin = req.headers["gstin"];
          let itemList=[];
          itemList = req.body.ecom[0].docs.map (row =>{
            return {
              "docref":row.docref,
            "flag": row.flag,
            "etin": row.etin,
            "supplytype" :" ",
            "lgltrdname": row.lgltrdname,
            "sup": row.sup,
            "supr": row.supr,
            "nsup": row.nsup,
            "igst": row.igst ,
            "sgst": row.sgst,
            "cgst": row.cgst ,
            "cess": row.cess ,
            "uplddt" : "",
            "fp": req.headers["fp"],
            "taxperiod": req.headers["rtnprd"],
            "status": "",
            "errcode" : null,
            "errdetail": null
            }
          })
          
            let saveTab4 = await anx14Dao.saveTab4Txn(itemList, gstin, req.headers["fp"], req.headers["rtnprd"])
            res.status(saveTab4.statusCd === "0" ? 500 : 200).send(saveTab4);
        }
         else {
          sendResponse(res, 500, {message: `${validateItems[0]} should not be null or empty`,
          statusCd: 0
        });
        }
      }
    }
}
  catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }  
}


  /**
*  Delete the ANX1_3J table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
async function deleteTab4BydocidsTxn(req, res) {
  logger.log("info","Entering anx14Service.deleteTab4BydocidsTxn");
  try {
    if (validateHeaders(req, res)) {

      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
      let gstin = req.headers["gstin"];
  
      if (_.isEmpty(req.body) || _.isEmpty(req.body.docids)) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {
        let deleteTab4Data = await anx14Dao.deleteTab4BydocidsTxn(req.body.docids, gstin, fp, rtnprd,req.headers["flag"],req.body.action)          
            sendResponse(res, 200, { message: `number of records:  ${deleteTab4Data} deleted successfully`, statusCd: 1 });
         }
    }
  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
 
}

 /**Edit 3j - Edit details of 3j table
 * @param {*} req
 * @param {*} res
*/
async function editTab4Txn(req, res) {
  logger.log("info","Entering anx14Service.editTab4Txn");
  try
  {
    if (validateHeaders(req, res) && validate4(req,res)) {
      if (_.isEmpty(req.body) || _.isEmpty(req.body.ecom[0]) || _.isEmpty(req.body.ecom[0].docs)) {
        sendResponse(res, 500, {
          message: "Request body should not be Empty",
          statusCd: 0
        });
      }
      else { 
        let gstin = req.headers["gstin"];
        let itemList = req.body.ecom[0].docs.map (row =>{
        return {
          "docref":row.docref,
          "flag": row.flag,
          "etin": row.etin,
          "lgltrdname": row.lgltrdname,
          "sup": row.sup,
          "supr": row.supr,
          "nsup": row.nsup,
          "igst": row.igst,
          "sgst":row.sgst,
          "cgst": row.cgst,
          "cess": row.cess,
          "status": "",
          "docid" : row.docid,
      }
    })  
          let editTab4= await anx14Dao.editTab4Txn(itemList, gstin, req.headers["fp"], req.headers["rtnprd"],req.headers["flag"],itemList[0].flag)
          res.status(editTab4.statusCd === "0" ? 500 : 200).send(editTab4);
        }
      }
  }
  catch(error){
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
  }



module.exports ={ 
    getTab4details:getTab4details,
    saveTab4Txn:saveTab4Txn,
    deleteTab4BydocidsTxn:deleteTab4BydocidsTxn,
    editTab4Txn:editTab4Txn
}