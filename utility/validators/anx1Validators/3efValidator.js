const { sendResponse } = require("../../../utility/common");
const { validateHeaders, validateDocumentDate } = require("../../../utility/validate");
const anx1Const = require('../../../utility/anx1Constants');
/** validates 3EF payload from UI */
  function validate3ef(req, res) {
    if (validateHeaders(req, res)) {
      if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "") {
        console.log(req.body)
        sendResponse(res, 500, {
          message: "Gstin is mandatory in request body",
          statusCd: 0
        });
        return 0
      } else if(req.body.gstin.indexOf('99') == 0){
        sendResponse(res, 500, {
            message: "GSTIN should not begin with 99",
            statusCd: 0
          });
          return 0  
      } 
  
      if (req.body.rtnprd === "null" || req.body.rtnprd === undefined || req.body.rtnprd === "") {
        sendResponse(res, 500, {
          message: "Return period is mandatory in request body",
          statusCd: 0
        });
        return 0
      }
      if (req.body.profile === "null" || req.body.profile === undefined || req.body.profile === "") {
        sendResponse(res, 500, {
          message: "Profile is mandatory in request body",
          statusCd: 0
        });
        return 0
      }
      if (req.body.sez[0].ctin === null || req.body.sez[0].ctin === undefined
        || req.body.sez[0].ctin === '') {
        sendResponse(res, 500, {
          message: "Ctin should not be null or empty",
          statusCd: 0
        });
        return 0
      } else if(req.body.gstin === req.body.sez[0].ctin){
        sendResponse(res, 500, {
            message: "CTIN should not be the same as logged in GSTIN",
            statusCd: 0
          });
          return 0
      }
     
  
      if (req.body.sez[0].pos === null || req.body.sez[0].pos === undefined
        || req.body.sez[0].pos === '') {
        sendResponse(res, 500, {
          message: "Place of supply should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      /** need to check */
      if (req.body.sez[0].docref === null || req.body.sez[0].docref === undefined
        || req.body.sez[0].docref === '') {
        sendResponse(res, 500, {
          message: "Docref should not be null or empty",
          statusCd: 0
        });
        return 0
      }
    
        if (req.body.sez[0].diffprcnt === null || req.body.sez[0].diffprcnt === undefined
          || req.body.sez[0].diffprcnt === '') {
          sendResponse(res, 500, {
            message: "Differential percentage should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.sez[0].doctyp == null || req.body.sez[0].doctyp == undefined
          || req.body.sez[0].doctyp === '') {
          sendResponse(res, 500, {
            message: "Document type should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.sez[0].doc.num == null || req.body.sez[0].doc.num == undefined
          || req.body.sez[0].doc.num === '') {
          sendResponse(res, 500, {
            message: "Document number should not be null or empty",
            statusCd: 0
          });
          return 0
        }     
        else{
          //let doc=/^[A-Za-z0-9/-]+$/; 
          let doc = anx1Const.DOC_NUM_SHIP_BILL_REGEX;
          if(!((req.body.sez[0].doc.num).match(doc))){
            sendResponse(res, 500, {
              message: "Document number format is incorrect",
              statusCd: 0
            });
            return 0;
          }
        }
        
        let isDocDateValid = validateDocumentDate(req.body.sez[0].doc.dt, req.body.rtnprd, "Document");
        if(isDocDateValid != true){
          sendResponse(res, 500, {
            message: isDocDateValid, statusCd: 0
          });
          return 0 
        } 

        if (req.body.sez[0].doc.val == null || req.body.sez[0].doc.val == undefined
          || req.body.sez[0].doc.val === '') {
          sendResponse(res, 500, {
            message: "Document value should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.sez[0].payTyp == null || req.body.sez[0].payTyp == undefined
          || req.body.sez[0].payTyp === '') {
          sendResponse(res, 500, {
            message: "GST Payment Type should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.sez[0].payTyp != null && req.body.sez[0].payTyp == "SEZWP" && (req.body.sez[0].clmrfnd == null || req.body.sez[0].clmrfnd == undefined
          || req.body.sez[0].clmrfnd === '')) {
          sendResponse(res, 500, {
            message: "Claim Refund should not be null or empty when Payment Type is SEZ Supplies with Payment of Tax",
            statusCd: 0
          });
          return 0
        }

        for (var j = 0; j < req.body.sez[0].items.length; j++) {
          if (req.body.sez[0].items[j].txval == null || req.body.sez[0].items[j].txval == undefined
            || req.body.sez[0].items[j].txval === '') {
            sendResponse(res, 500, {
              message: "Taxable Value should not be null or empty",
              statusCd: 0
            });
            return 0
          }
          if (req.body.sez[0].items[j].rate == null || req.body.sez[0].items[j].rate == undefined
            || req.body.sez[0].items[j].rate === '') {
            sendResponse(res, 500, {
              message: "Rate should not be null or empty",
              statusCd: 0
            });
            return 0
          }
        }

        for (var j = 0; j < req.body.sez[0].items.length-1; j++) {
          if(req.body.sez[0].items[j].hsn === null || req.body.sez[0].items[j].hsn === undefined
            || req.body.sez[0].items[j].hsn === ''){
                sendResponse(res, 500, {message: "HSN Code should not be null or empty",
                  statusCd: 0
                });
                return 0;
            } 
            else if(req.body.sez[0].items[j].hsn.indexOf("99") == 0
              && req.body.sez[0].items[j].hsn.length != 6){
              sendResponse(res, 500, {
                message: "HSN code starting with 99 should contain 6 digits",
                statusCd: 0
              });
              return 0
          } else if(!((req.body.sez[0].items[j].hsn).match(/^\d{4}$/)) 
                    && !((req.body.sez[0].items[j].hsn).match(/^\d{6}$/))
                    && !((req.body.sez[0].items[j].hsn).match(/^\d{8}$/))){
                sendResponse(res, 500, {
                    message: "Invalid HSN. HSN should be of 4,6 or 8 digits only",
                    statusCd: 0
                    });
                    return 0
          }
      }
      
      return 1;
    }
    else { 
      return 0;
    }
  }
  
module.exports = {
  validate3ef : validate3ef
}