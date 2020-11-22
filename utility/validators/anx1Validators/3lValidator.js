const { sendResponse } = require("../../../utility/common");
const { validateHeaders, validateDocumentDate } = require("../../../utility/validate");

/** validates 3L payload from UI */
function validate3l(req, res) {   
    if (validateHeaders(req, res)) {     
      if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "") {      
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
   
        req.body.mis[0].items.forEach(item => {
            if(req.body.mis[0].tableTyp!="3B" && (item.hsn == null || item.hsn == undefined
                || item.hsn == '')){
                    sendResponse(res, 500, {message: "HSN Code should not be null or empty",
                      statusCd: 0
                    });
                    return 0;
                } 
                else if(!(item.hsn=="" || item.hsn==null) && item.hsn.indexOf("99") == 0
                  && item.hsn.length != 6){
                  sendResponse(res, 500, {
                    message: "HSN code starting with 99 should contain 6 digits",
                    statusCd: 0
                  });
                  return 0
              } else if(!(item.hsn=="" || item.hsn==null) && !((item.hsn).match(/^\d{4}$/)) 
                        && !((item.hsn).match(/^\d{6}$/))
                        && !((item.hsn).match(/^\d{8}$/))){
                    sendResponse(res, 500, {
                        message: "Invalid HSN. HSN should be of 4,6 or 8 digits only",
                        statusCd: 0
                        });
                        return 0
              }
        });          
     
  
  
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
      if (req.body.mis[0].ctin === null || req.body.mis[0].ctin === undefined
        || req.body.mis[0].ctin === '') {
        sendResponse(res, 500, {
          message: "Ctin should not be null or empty",
          statusCd: 0
        });
        return 0
      } else if(req.body.gstin === req.body.mis[0].ctin){
        sendResponse(res, 500, {
            message: "CTIN should not be the same as logged in GSTIN",
            statusCd: 0
          });
          return 0
      }
     
  
      if (req.body.mis[0].pos === null || req.body.mis[0].pos === undefined
        || req.body.mis[0].pos === '') {
        sendResponse(res, 500, {
          message: "Place of supply should not be null or empty",
          statusCd: 0
        });
        return 0
      }

      if (req.body.mis[0].suptype === null || req.body.mis[0].suptype === undefined
        || req.body.mis[0].suptype === '') {
        sendResponse(res, 500, {
          message: "Supply type should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      /** need to check */
      if (req.body.mis[0].docref === null || req.body.mis[0].docref === undefined
        || req.body.mis[0].docref === '') {
        sendResponse(res, 500, {
          message: "Docref should not be null or empty",
          statusCd: 0
        });
        return 0
      }
    
        if (req.body.mis[0].diffprcnt === null || req.body.mis[0].diffprcnt === undefined
          || req.body.mis[0].diffprcnt === '') {
          sendResponse(res, 500, {
            message: "Differential percentage should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.mis[0].doctyp == null || req.body.mis[0].doctyp == undefined
          || req.body.mis[0].doctyp === '') {
          sendResponse(res, 500, {
            message: "Document type should not be null or empty",
            statusCd: 0
          });
          return 0
        }

        if (req.body.mis[0].doc.num == null || req.body.mis[0].doc.num == undefined
          || req.body.mis[0].doc.num === '') {
          sendResponse(res, 500, {
            message: "Document number should not be null or empty",
            statusCd: 0
          });
          return 0
        }     
        else{
          let doc=/^[A-Za-z0-9/-]+$/; 
          if(!((req.body.mis[0].doc.num).match(doc))){
            sendResponse(res, 500, {
              message: "Document number format is incorrect",
              statusCd: 0
            });
            return 0;
          }
        }
        
        let isDocDateValid = validateDocumentDate(req.body.mis[0].doc.dt, req.body.rtnprd, "Document");
        if(isDocDateValid != true){
          sendResponse(res, 500, {
            message: isDocDateValid, statusCd: 0
          });
          return 0 
        } 

        if (req.body.mis[0].doc.val == null || req.body.mis[0].doc.val == undefined
          || req.body.mis[0].doc.val === '') {
          sendResponse(res, 500, {
            message: "Document value should not be null or empty",
            statusCd: 0
          });
          return 0
        }   

     
        req.body.mis[0].items.forEach((item)=>{
          if (item.txval == null || item.txval == undefined || item.txval === '') {
            sendResponse(res, 500, {
              message: "Taxable Value should not be null or empty",
              statusCd: 0
            });
            return 0
          }
          if (item.rate == null || item.rate == undefined || item.rate === '') {
            sendResponse(res, 500, {
              message: "Rate should not be null or empty",
              statusCd: 0
            });
            return 0
          }
        })

    
      return 1;
    }
    else { 
      return 0;
    }
  }
  
module.exports = {
  validate3l : validate3l
}