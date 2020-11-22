const { sendResponse } = require("../../../utility/common");
const { validateHeaders, validateDocumentDate } = require("../../../utility/validate");


/** validateAnx1Save3dea - validates 3dea payload from UI */
function validateAnx1Savedea(req, res) {
    if (validateHeaders(req, res)) {
      if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "") {
        console.log("val check",req.body)
        sendResponse(res, 500, {
          message: "Gstin is mandatory in request body",
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
      if (req.body.dea[0].ctin === null || req.body.dea[0].ctin === undefined
        || req.body.dea[0].ctin === '') {
        sendResponse(res, 500, {
          message: "Ctin should not be null or empty",
          statusCd: 0
        });
        return 0
      }

      if (req.body.dea[0].revctin === null || req.body.dea[0].revctin === undefined
        || req.body.dea[0].revctin === '') {
        sendResponse(res, 500, {
          message: "Revised Ctin should not be null or empty",
          statusCd: 0
        });
        return 0
      }
    
  
      if (req.body.dea[0].rev_pos === null || req.body.dea[0].rev_pos === undefined
          || req.body.dea[0].rev_pos === '') {
          sendResponse(res, 500, {
            message: "Place of supply should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        
        if (req.body.dea[0].docref === null || req.body.dea[0].docref === undefined
          || req.body.dea[0].docref === '') {
          sendResponse(res, 500, {
            message: "Docref should not be null or empty",
            statusCd: 0
          });
          return 0
        }
    
  
        if (req.body.dea[0].revdocref === null || req.body.dea[0].revdocref === undefined
          || req.body.dea[0].revdocref === '') {
          sendResponse(res, 500, {
            message: "Revised Docref should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.dea[0].rev_sec7act === null || req.body.dea[0].rev_sec7act == undefined
          || req.body.dea[0].rev_sec7act === '') {
            sendResponse(res, 500, {
            message: "SEC 7 Act should not be null or empty",
            statusCd: 0
          });
          return 0
        }
  
        if (req.body.dea[0].rev_diffprcnt === null || req.body.dea[0].rev_diffprcnt === undefined
          || req.body.dea[0].rev_diffprcnt === '') {
          sendResponse(res, 500, {
            message: "Differential percentage should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        if (req.body.dea[0].doctyp == null || req.body.dea[0].doctyp == undefined
          || req.body.dea[0].doctyp === '') {
          sendResponse(res, 500, {
            message: "Document type should not be null or empty",
            statusCd: 0
          });
          return 0
        }
       
        if (req.body.dea[0].rev_doctyp == null || req.body.dea[0].rev_doctyp == undefined
          || req.body.dea[0].rev_doctyp === '') {
          sendResponse(res, 500, {
            message: "Revised Document type should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.dea[0].rev_suptype == null || req.body.dea[0].rev_suptype == undefined
          || req.body.dea[0].rev_suptype === '') {
          sendResponse(res, 500, {
            message: "Supply type should not be null or empty",
            statusCd: 0
          });
          return 0
        }


        if (req.body.dea[0].doc.num == null || req.body.dea[0].doc.num == undefined
          || req.body.dea[0].doc.num === '') {
          sendResponse(res, 500, {
            message: "Document number should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        
        if (req.body.dea[0].revdoc.num == null || req.body.dea[0].revdoc.num == undefined
          || req.body.dea[0].revdoc.num === '') {
          sendResponse(res, 500, {
            message: "Revised Document number should not be null or empty",
            statusCd: 0
          });
          return 0
        }
  
        if (req.body.dea[0].doc.dt == null || req.body.dea[0].doc.dt == undefined
          || req.body.dea[0].doc.dt === '') {
          sendResponse(res, 500, {
            message: "Document date should not be null or empty",
            statusCd: 0
          });
          return 0
        }
  

        if (req.body.dea[0].revdoc.dt== null || req.body.dea[0].revdoc.dt == undefined
          || req.body.dea[0].revdoc.dt === '') {
          sendResponse(res, 500, {
            message: "Revised Document date should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        
        let isDocDateValid = validateDocumentDate(req.body.dea[0].doc.dt, req.body.rtnprd, "Document");
        if(isDocDateValid != true){
          sendResponse(res, 500, {
            message: isDocDateValid, statusCd: 0
          });
          return 0 
        } 
        
        if (req.body.dea[0].revdoc.val == null || req.body.dea[0].revdoc.val == undefined
          || req.body.dea[0].revdoc.val === '') {
          sendResponse(res, 500, {
            message: "Document value should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        for (var j = 0; j < req.body.dea[0].items.length; j++) {
          if (req.body.dea[0].items[j].txval == null || req.body.dea[0].items[j].txval == undefined
            || req.body.dea[0].items[j].txval === '') {
            sendResponse(res, 500, {
              message: "Taxable should not be null or empty",
              statusCd: 0
            });
            return 0
          }
          if (req.body.dea[0].items[j].rate == null || req.body.dea[0].items[j].rate == undefined
            || req.body.dea[0].items[j].rate === '') {
            sendResponse(res, 500, {
              message: "Rate should not be null or empty",
              statusCd: 0
            });
            return 0
          }
          
          for (let k = 1; k < req.body.dea[0].items.length; k++) {
            if ((req.body.dea[0].items[j].hsn == null || req.body.dea[0].items[j].hsn == undefined || req.body.dea[0].items[j].hsn === '') 
            && (req.body.dea[0].items[k].hsn == null || req.body.dea[0].items[k].hsn == undefined || req.body.dea[0].items[k].hsn === '') 
            && (req.body.dea[0].items[j].rate == req.body.dea[0].items[k].rate) && j != k) {
              console.log(req.body.dea[0].items[j].rate + " - " + req.body.dea[0].items[k].rate)
              sendResponse(res, 500, {
                message: "Rate should not be repeated as no HSN value is entered",
                statusCd: 0
              });
              return 0
            }
  
            if (((req.body.dea[0].items[j].hsn == null || req.body.dea[0].items[j].hsn == undefined
              || req.body.dea[0].items[j].hsn === '') && 
              (req.body.dea[0].items[k].hsn != null && req.body.dea[0].items[k].hsn != undefined
              && req.body.dea[0].items[k].hsn != ''))  || 
              ((req.body.dea[0].items[k].hsn == null || req.body.dea[0].items[k].hsn == undefined
              || req.body.dea[0].items[k].hsn === '') && (req.body.dea[0].items[j].hsn != null 
              && req.body.dea[0].items[j].hsn != undefined  && req.body.dea[0].items[j].hsn != ''))) {
              sendResponse(res, 500, {
                message: "HSN should be entered for all the items",
                statusCd: 0
              });
              return 0
            }
          }
        }
      
      return 1;
    }
    else { 
      return 0;
    }
  }

  module.exports = {
    validateAnx1Savedea : validateAnx1Savedea
  }