const { sendResponse } = require("../../../utility/common");
const { validateHeaders, validateDocumentDate } = require("../../../utility/validate");
const anx1Const = require('../../../utility/anx1Constants');
/** validates 3G payload from UI */
  function validate3g(req, res) {
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

      if (req.body.de[0].ctin === null || req.body.de[0].ctin === undefined
        || req.body.de[0].ctin === '') {
        sendResponse(res, 500, {
          message: "CTIN should not be null or empty",
          statusCd: 0
        });
        return 0
      } else if(req.body.gstin === req.body.de[0].ctin){
        sendResponse(res, 500, {
            message: "CTIN should not be the same as logged in GSTIN",
            statusCd: 0
          });
          return 0
      }
     
      if (req.body.de[0].pos === null || req.body.de[0].pos === undefined
        || req.body.de[0].pos === '') {
        sendResponse(res, 500, {
          message: "Place of supply should not be null or empty",
          statusCd: 0
        });
        return 0
      }
     
      if (req.body.de[0].docref === null || req.body.de[0].docref === undefined
        || req.body.de[0].docref === '') {
        sendResponse(res, 500, {
          message: "Docref should not be null or empty",
          statusCd: 0
        });
        return 0
      }
    
        if (req.body.de[0].diffprcnt === null || req.body.de[0].diffprcnt === undefined
          || req.body.de[0].diffprcnt === '') {
          sendResponse(res, 500, {
            message: "Differential percentage should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if(req.body.de[0].sec7act === null ||req.body.de[0].sec7act == undefined
          || req.body.de[0].sec7act === '' ){
         sendResponse(res, 500, {
           message: "Supply covered under sec 7 of IGST Act should not be null or empty",
           statusCd: 0
         });
         return 0
       }

        if (req.body.de[0].doctyp == null || req.body.de[0].doctyp == undefined
          || req.body.de[0].doctyp === '') {
          sendResponse(res, 500, {
            message: "Document type should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        
        if (req.body.de[0].suptype == null || req.body.de[0].suptype == undefined
          || req.body.de[0].suptype === '') {
          sendResponse(res, 500, {
            message: "Supply type should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.de[0].doc.num == null || req.body.de[0].doc.num == undefined
          || req.body.de[0].doc.num === '') {
          sendResponse(res, 500, {
            message: "Document number should not be null or empty",
            statusCd: 0
          });
          return 0
        } else{
          //let doc=/^[A-Za-z0-9/-]+$/; 
          let doc = anx1Const.DOC_NUM_SHIP_BILL_REGEX; 
          if(!((req.body.de[0].doc.num).match(doc))){
            sendResponse(res, 500, {
              message: "Document number format is incorrect",
              statusCd: 0
            });
            return 0;
          }
        }

        let isDocDateValid = validateDocumentDate(req.body.de[0].doc.dt, req.body.rtnprd, "Document");
        if(isDocDateValid != true){
          sendResponse(res, 500, {
            message: isDocDateValid, statusCd: 0
          });
          return 0; 
        } 

        if (req.body.de[0].doc.val == null || req.body.de[0].doc.val == undefined
          || req.body.de[0].doc.val === '') {
          sendResponse(res, 500, {
            message: "Document value should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.de[0].clmrfnd == null || req.body.de[0].clmrfnd == undefined
          || req.body.de[0].clmrfnd === '') {
          sendResponse(res, 500, {
            message: "Claim Refund should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        for (var j = 0; j < req.body.de[0].items.length; j++) {
          if (req.body.de[0].items[j].txval == null || req.body.de[0].items[j].txval == undefined
            || req.body.de[0].items[j].txval === '') {
            sendResponse(res, 500, {
              message: "Taxable Value should not be null or empty",
              statusCd: 0
            });
            return 0
          }
          if (req.body.de[0].items[j].rate == null || req.body.de[0].items[j].rate == undefined
            || req.body.de[0].items[j].rate === '') {
            sendResponse(res, 500, {
              message: "Rate should not be null or empty",
              statusCd: 0
            });
            return 0
          }

          if (req.body.de[0].items[j].hsn == null || req.body.de[0].items[j].hsn == undefined
            || req.body.de[0].items[j].hsn === '') {
            sendResponse(res, 500, {
              message: "HSN Code should not be null or empty",
              statusCd: 0
            });
            return 0
          } else if((req.body.de[0].items[j].hsn.indexOf("99") == 0) 
              && (req.body.de[0].items[j].hsn.length != 6)){
              sendResponse(res, 500, {
                message: "HSN code starting with 99 should contain 6 digits",
                statusCd: 0
              });
              return 0
          } else if(!((req.body.de[0].items[j].hsn).match(/^\d{4}$/)) && 
                    !((req.body.de[0].items[j].hsn).match(/^\d{6}$/)) &&
                    !((req.body.de[0].items[j].hsn).match(/^\d{8}$/))){
                sendResponse(res, 500, {
                    message: "Invalid HSN. HSN should be of 4,6 or 8 digits only",
                    statusCd: 0
                    });
                    return 0
          }
          
        }


        // for (let p = 0; p < req.body.de[0].items.length-1; p++) {
        //   for (let q = 1; q < req.body.de[0].items.length; q++) {
        //     if ((req.body.de[0].items[p].hsn == null || req.body.de[0].items[p].hsn == undefined || req.body.de[0].items[p].hsn === '') 
        //     && (req.body.de[0].items[q].hsn == null || req.body.de[0].items[q].hsn == undefined || req.body.de[0].items[q].hsn === '') 
        //     && (req.body.de[0].items[p].rate == req.body.de[0].items[q].rate)) {
        //       console.log(req.body.de[0].items[p].rate + " - " + req.body.de[0].items[q].rate)
        //       sendResponse(res, 500, {
        //         message: "Rate should not be repeated as no HSN value is entered",
        //         statusCd: 0
        //       });
        //       return 0
        //     }

        //     if (((req.body.de[0].items[p].hsn == null || req.body.de[0].items[p].hsn == undefined
        //       || req.body.de[0].items[p].hsn === '') && 
        //       (req.body.de[0].items[q].hsn != null && req.body.de[0].items[q].hsn != undefined
        //       && req.body.de[0].items[q].hsn != ''))  || 
        //       ((req.body.de[0].items[q].hsn == null || req.body.de[0].items[q].hsn == undefined
        //       || req.body.de[0].items[q].hsn === '') && (req.body.de[0].items[p].hsn != null 
        //       && req.body.de[0].items[p].hsn != undefined  && req.body.de[0].items[p].hsn != ''))) {
        //       sendResponse(res, 500, {
        //         message: "HSN should be entered for all the items",
        //         statusCd: 0
        //       });
        //       return 0
        //     }
        //   }
        // }
      
      return 1;
    }
    else { 
      return 0;
    }
  }
  
module.exports = {
  validate3g : validate3g
}