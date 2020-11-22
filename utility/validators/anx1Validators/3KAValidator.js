const { sendResponse } = require("../../common");
const { validateHeaders, validateDocumentDate } = require("../../validate");
const anx1Const = require('../../anx1Constants');
/** validates 3K payload from UI */
  function validate3KA(req, res) {
    if (validateHeaders(req, res)) {
      if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "") {
        //console.log(req.body)
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

      if (req.body.impgseza[0].ctin === null || req.body.impgseza[0].ctin === undefined
        || req.body.impgseza[0].ctin === '') {
        sendResponse(res, 500, {
          message: "CTIN should not be null or empty",
          statusCd: 0
        });
        return 0
      } else if(req.body.gstin === req.body.impgseza[0].ctin){
        sendResponse(res, 500, {
            message: "CTIN should not be the same as logged in GSTIN",
            statusCd: 0
          });
          return 0
      }
     
      if (req.body.impgseza[0].pos === null || req.body.impgseza[0].pos === undefined
        || req.body.impgseza[0].pos === '') {
        sendResponse(res, 500, {
          message: "Place of supply should not be null or empty",
          statusCd: 0
        });
        return 0
      }
     
      if (req.body.impgseza[0].docref === null || req.body.impgseza[0].docref === undefined
        || req.body.impgseza[0].docref === '') {
        sendResponse(res, 500, {
          message: "Docref should not be null or empty",
          statusCd: 0
        });
        return 0
      }

        if (req.body.impgseza[0].doctyp == null || req.body.impgseza[0].doctyp == undefined
            || req.body.impgseza[0].doctyp === '') {
            sendResponse(res, 500, {
            message: "Document type should not be null or empty",
            statusCd: 0
            });
            return 0
        } else if(req.body.impgseza[0].doctyp != "B"){
            sendResponse(res, 500, {
                message: "Document type should be Bill Of Entry",
                statusCd: 0
                });
                return 0
        }
        
        if (req.body.impgseza[0].suptype == null || req.body.impgseza[0].suptype == undefined
          || req.body.impgseza[0].suptype === '') {
          sendResponse(res, 500, {
            message: "Supply type should not be null or empty",
            statusCd: 0
          });
          return 0
        } else if(req.body.impgseza[0].suptype.toUpperCase() != 'INTER-STATE'){
            sendResponse(res, 500, {
                message: "Supply type should be Inter-State",
                statusCd: 0
              });
              return 0
        }

        if (req.body.impgseza[0].boe.num == null || req.body.impgseza[0].boe.num == undefined
          || req.body.impgseza[0].boe.num === '') {
          sendResponse(res, 500, {
            message: "Bill of entry number should not be null or empty",
            statusCd: 0
          });
          return 0
        } else{
          if(!((req.body.impgseza[0].boe.num).match(anx1Const.DOC_NUM_SHIP_BILL_REGEX))){
            sendResponse(res, 500, {
              message: "Bill of entry number format is incorrect",
              statusCd: 0
            });
            return 0;
          }
        }

        let isDocDateValid = validateDocumentDate(req.body.impgseza[0].boe.dt , req.body.rtnprd, "Bill of Entry");
        if(isDocDateValid != true){
          sendResponse(res, 500, {
            message: isDocDateValid, statusCd: 0
          });
          return 0 
        }; 

        if (req.body.impgseza[0].boe.val == null || req.body.impgseza[0].boe.val == undefined
          || req.body.impgseza[0].boe.val === '') {
          sendResponse(res, 500, {
            message: "Bill of entry value should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if(req.body.impgseza[0].boe.pcode != null && req.body.impgseza[0].boe.pcode != undefined 
            && req.body.impgseza[0].boe.pcode != '' && 
                (req.body.impgseza[0].boe.pcode.length > 6 
                    || !((req.body.impgseza[0].boe.pcode).match(/^[A-Za-z0-9]+$/)))){
            sendResponse(res, 500, {
                message: "Port Code is invalid",
                statusCd: 0
              });
              return 0;
        }


        for (var j = 0; j < req.body.impgseza[0].items.length; j++) {
          if (req.body.impgseza[0].items[j].txval == null || req.body.impgseza[0].items[j].txval == undefined
            || req.body.impgseza[0].items[j].txval === '') {
            sendResponse(res, 500, {
              message: "Taxable Value should not be null or empty",
              statusCd: 0
            });
            return 0
          }
          if (req.body.impgseza[0].items[j].rate == null || req.body.impgseza[0].items[j].rate == undefined
            || req.body.impgseza[0].items[j].rate === '') {
            sendResponse(res, 500, {
              message: "Rate should not be null or empty",
              statusCd: 0
            });
            return 0
          }

          if (req.body.impgseza[0].items[j].hsn === null || req.body.impgseza[0].items[j].hsn === undefined
            || req.body.impgseza[0].items[j].hsn === '') {
            sendResponse(res, 500, {
              message: "HSN Code should not be null or empty",
              statusCd: 0
            });
            return 0
          } else if((req.body.impgseza[0].items[j].hsn.indexOf("99") == 0) 
                    && (req.body.impgseza[0].items[j].hsn.length != 6)){
            sendResponse(res, 500, {
                message: "HSN code starting with 99 should contain 6 digits",
                statusCd: 0
              });
              return 0
          } else if(!((req.body.impgseza[0].items[j].hsn).match(/^\d{4}$/)) && !((req.body.impgseza[0].items[j].hsn).match(/^\d{6}$/))
                    && !((req.body.impgseza[0].items[j].hsn).match(/^\d{8}$/))){
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
  validate3KA : validate3KA
}