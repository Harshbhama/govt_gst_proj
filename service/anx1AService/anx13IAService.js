const { validateHeaders } = require("../../utility/validate");
const { validate3i } = require("../../utility/validators/anx1Validators/anx13iValidators");
const anx13iDao = require("../../dao/anx1ADao/anx13IADao");
const { sendResponse } = require("../../utility/common");
const _ = require("lodash")
const db = require("../../db/dbUtil");
const logger  = require('../../utility/logger').logger;
//const sqlite3 = require('sqlite3').verbose();
//const { DB_PATH} = require('../../utility/constants');


// 
/**
 *get all table3i details based on returned Period 
 * @param {*} req 
 * @param {*} res 
 */
async function getTab3IAdetails(req, res) {
  logger.log('info', 'Entering getTab3idetails:: anx13iservice.js :: /getTab3idetails')
  if (validateHeaders(req, res)) {
    let gstin = req.headers["gstin"] || null;
    let rtnprd = req.headers["rtnprd"] || null;
    let getAll3i = await anx13iDao.getTab3IAdetails(gstin, rtnprd ,req.headers["flag"])
    //logger.log('info', 'getall3iobject:getAll3i');
    res.status(getAll3i.statusCd === "0" ? 500 : 200).send(getAll3i.statusCd === "0" ? getAll3i : {imps : getAll3i});
  }
}

/** Edit details of 3G table
 * @param {*} req
 * @param {*} res
*/
// function editTabtran3IA(req, res) {

//   if (!validateHeaders(req, res)) {
  
//       return;
   
//   }
//   else
//       if ((req.body.imps === undefined)) {
//           sendResponse(res, 500, {
//               message: "No data present",
//               statusCd: 0
//           });
//           return 0;
          
//       }
//       else if (req.body.imps != "null" && req.body.imps != '' && validate3i(req, res)) {
          
//           let headerList = [];
//           let gstin = req.headers["gstin"];
//           let itemList = [];
//           let fullItemList = [];
//           let total_taxable_value = 0,  total_igst = 0, total_cess = 0;
//           return new Promise((resolve, reject) => {
//             let doc = req.body.imps[0].docs[0];
            
//                   for (var j = 0; j < doc.items.length; j++) {
//                       total_taxable_value += parseFloat((doc.items[j].txval)? doc.items[j].txval : 0)
//                       total_igst += parseFloat((doc.items[j].igst)? doc.items[j].igst : 0);
//                       total_cess += parseFloat((doc.items[j].cess)? doc.items[j].cess : 0)
//                   }
//                   for (var j = 0; j < doc.items.length; j++) {
                     
                     
//                       headerList = {
//                         "docid" : doc.docid,
//                         "cess": total_cess || null,
//                         "diffpercnt": doc.diffpercnt,
//                         "docref": doc.docref,
//                         "flag": doc.flag,
//                         "fp": req.headers["fp"],
//                         "igst": total_igst || null,
//                         "pos": doc.pos ,
//                         "rfndelg": doc.rfndelg || "Y",
//                         "status": doc.status,
//                         "suptype": doc.suptype || "Inter-State",
//                         "taxPeriod": req.headers["rtnprd"],
//                         "taxVal": total_taxable_value || null,
//                         "upldt": doc.upldt || null,
//                         "errorcode" : doc.err_cd || null,
//                         "errmsg" : doc.err_msg || null 
//                       };
                     
//                       itemList = {
//                           itemid: doc.items[j].itemid,
//                           hsn: doc.items[j].hsn,
//                           taxable_value: doc.items[j].txval || null,
//                           apptaxrate: doc.items[j].rate,
//                           sgst :  null,
//                           cgst : null,
//                           igst: doc.items[j].igst || null,
//                           cess: doc.items[j].cess || null,
//                           itemref: doc.docref
//                       };

//                       fullItemList.push(itemList);
//                   }
              
             
//               anx13iDao.editTabtran3i(headerList, fullItemList, gstin, headerList.fp, headerList.taxPeriod)
//                   .then((result) => {
//                       resolve(result)
//                   }).catch((err) => {
//                       reject(err)
//                   });
//           }).then(data => {
//               sendResponse(res, 200, data);

//           })
//               .catch(function (err) {
//                   sendResponse(res, 500, err);

//               });
//       }
// }


/**Save 3I - save details of 3I table
 * @param {*} req
 * @param {*} res
*/
async function saveTab3IATxn(req, res) {
  logger.log("info","Entering anx13iService.saveTab3iTxn");
  try {
    if (validateHeaders(req, res)) {
      if (_.isEmpty(req.body) || _.isEmpty(req.body.imps[0]) || _.isEmpty(req.body.imps[0].docs)) {
        sendResponse(res, 500, {
          message: "Request body should not be Empty",
          statusCd: 0
        });
      }
      else {

        let validateItems = await req.body.imps[0].docs[0].items.map(row => {
          // check is Empty or not a number then throw error
          return (_.isEmpty(row.hsn) && !_.isNumber(row.hsn))
            ? "hsn" : (_.isEmpty(row.txval) && !_.isNumber(row.txval))
              ? "txval" : (_.isEmpty(row.rate) && !_.isNumber(row.rate))
                ? "rate" : 1

        })

        if (validateItems[0] === 1) {
          let gstin = req.headers["gstin"];
          let doc = req.body.imps[0].docs[0]

          let lclpos = doc.docref.slice(0, 2)

          if (lclpos !== doc.pos) {
            sendResponse(res, 500, {
              message: "Pos not matching with docref pos",
              docref: doc.docref,
              pos: doc.pos,
              statusCd: 0
            });
          } else {

            let tab3I = {
              "cess": 0.0,
              "diffpercnt": doc.diffpercnt,
              "docref": doc.docref,
              "flag": doc.flag,
              "fp": req.headers["fp"],
              "igst": 0.0,
              "pos": doc.pos || null,
              "rfndelg": doc.rfndelg || "Y",
              "status": doc.status,
              "suptype": doc.suptype || "Inter-State",
              "taxPeriod": req.headers["rtnprd"],
              "taxVal": 0.0,
              "upldt": doc.upldt || null
            }

            let items = await req.body.imps[0].docs[0].items.map(row => {

              // Total calculation fot 3i table to save
              tab3I.taxVal += parseFloat((row.txval == "")?0:row.txval)
              tab3I.igst += parseFloat((row.igst == "")?0:row.igst)
              tab3I.cess += parseFloat((row.cess == "")?0:row.cess)

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

            let save3i = await anx13iDao.saveTab3IATxn(tab3I, items, gstin)
            res.status(save3i.statusCd === "0" ? 500 : 200).send(save3i);
          }

        } else {
          sendResponse(res, 500, {
            message: `${validateItems[0]} should not be null or empty`,
            statusCd: 0
          });
        }
      }

    }
  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
 

}


/** Edit details of 3G table
 * @param {*} req
 * @param {*} res
*/
async function editTab3IATxn(req, res) {
  logger.log("info","Entering anx13iService.editTab3iTxn");
  try {
    if (!validateHeaders(req, res)) {
  
      return;
   
  } else if ((req.body.imps === undefined)) {
          sendResponse(res, 500, {
              message: "No data present",
              statusCd: 0
          });
          return 0;
          
      }
    else if (req.body.imps != "null" && req.body.imps != '' && validate3i(req, res)) {
          let headerList = [];
          let gstin = req.headers["gstin"];
          let itemList = [];
          let fullItemList = [];
          let total_taxable_value = 0,  total_igst = 0, total_cess = 0;
          
            let doc = req.body.imps[0].docs[0];
                  for (var j = 0; j < doc.items.length; j++) {
                      total_taxable_value += parseFloat((doc.items[j].txval)? doc.items[j].txval : 0)
                      total_igst += parseFloat((doc.items[j].igst)? doc.items[j].igst : 0);
                      total_cess += parseFloat((doc.items[j].cess)? doc.items[j].cess : 0)
                  }

                    logger.log("info","Header List");
                      headerList = {
                        "docid" : doc.docid,
                        "cess": total_cess || null,
                        "diffpercnt": doc.diffpercnt,
                        "docref": doc.docref,
                        "flag": doc.flag,
                        "fp": req.headers["fp"],
                        "igst": total_igst || null,
                        "pos": doc.pos ,
                        "rfndelg": doc.rfndelg || "Y",
                        "status": "",
                        "suptype": doc.suptype || "Inter-State",
                        "taxPeriod": req.headers["rtnprd"],
                        "taxVal": total_taxable_value,
                        "upldt": doc.upldt || null,
                        "errorcode" : doc.err_cd || null,
                        "errmsg" : doc.err_msg || null
                      };
                      
                  for (var j = 0; j < doc.items.length; j++) {
                      itemList = {
                          itemid: doc.items[j].itemid,
                          hsn: doc.items[j].hsn,
                          taxable_value: doc.items[j].txval || null,
                          apptaxrate: doc.items[j].rate,
                          sgst :  null,
                          cgst : null,
                          igst: doc.items[j].igst || null,
                          cess: doc.items[j].cess || null,
                          itemref: doc.docref
                      };

                      fullItemList.push(itemList);
                  }
                
              let edit3iData = await anx13iDao.editTab3IATxn(headerList, fullItemList, gstin, headerList.fp, headerList.taxPeriod, req.headers["flag"])
              res.status(edit3iData.statusCd === "0" ? 500 : 200).send(edit3iData); 
      }
  } catch (error) {
    //, statusCd: STATUS_CD_ZERO , docref: docref }
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
   
}
/**
*  Delete the ANX1_3H table records based on array of docId in request body
* @param {*} req
* @param {*} res
*/
async function deleteTab3IABydocidsTxn(req, res) {
  logger.log("info","Entering anx13iService.deleteTab3iBydocidsTxn");
  try {
    if (validateHeaders(req, res)) {

      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
      let gstin = req.headers["gstin"];
  
      if (_.isEmpty(req.body) || _.isEmpty(req.body.docids)) {
        sendResponse(res, 500, { message: "Missing docIds array in body", statusCd: 0 });
      } else {
        let delete3iData = await anx13iDao.deleteTab3IABydocidsTxn(req.body.docids, gstin, fp, rtnprd)          
            sendResponse(res, 200, { message: `number of records:  ${delete3iData} deleted successfully`, statusCd: 1 });
         }
    }
  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }
 
};

/**
 * Delete the ANX1_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
function deleteTab3IAByItemIdTxn(req, res) {
  logger.log("info","Entering anx13iService.deleteTab3iByItemIdTxn");
  try {
    if (validateHeaders(req, res)) {

      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;
  
      if ( !req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids) ) {
        sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
      } else {
        anx13iDao.deleteTab3IAByItemIdTxn(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"], req.body.status)
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
  getTab3IAdetails: getTab3IAdetails,
  saveTab3IATxn: saveTab3IATxn,
  editTab3IATxn:editTab3IATxn,
  deleteTab3IABydocidsTxn:deleteTab3IABydocidsTxn,
  deleteTab3IAByItemIdTxn:deleteTab3IAByItemIdTxn
  
}