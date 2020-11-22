const { sendResponse } = require("../../../utility/common");
const { validateHeaders } = require("../../../utility/validate");

function validate3h(req, res){
    if (req.headers["gstin"] === undefined || req.headers["gstin"] === '' || req.headers["gstin"] === null) {
      sendResponse(res, 500, {
        message: "Missing GSTIN in the header",
        statusCd: 0
      });
      return 0
    }
    if (req.headers["rtnprd"] === undefined || req.headers["rtnprd"] === '' || req.headers["rtnprd"] === null) {
      sendResponse(res, 500, {
        message: "Missing return-period in the header",
        statusCd: 0
      });
      return 0
    }
    if (req.headers["profile"] === undefined || req.headers["profile"] === '' || req.headers["profile"] === null) {
      sendResponse(res, 500, {
        message: "Missing Profile in the header",
        statusCd: 0
      });
      return 0
    }
    if (req.headers["issez"] === undefined || req.headers["issez"] === '' || req.headers["issez"] === null) {
      sendResponse(res, 500, {
        message: "Missing Is-Sez in the header",
        statusCd: 0
      });
      return 0
    }
    if (req.headers["fp"] === undefined || req.headers["fp"] === '' || req.headers["fp"] === null) {
      sendResponse(res, 500, {
        message: "Missing Financial Period in the header",
        statusCd: 0
      });
      return 0
    }
        if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "" ) {
          sendResponse(res, 500, {
            message: "Gstin is mandatory in request body",
            statusCd: 0
          });
          return 0
        }
        if (req.body.gstin != req.headers["gstin"]) {
          sendResponse(res, 500, {
            message: "Gstin in header doesn't match with gstin in request body",
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
        if (req.body.issez === "null" || req.body.issez === undefined || req.body.issez === "") {
          sendResponse(res, 500, {
            message: "Is SEZ is mandatory in request body",
            statusCd: 0
          });
          return 0
        }
        if (req.body.profile === "null" || req.body.profile === undefined || req.body.profile === "") {
          sendResponse(res, 500, {
            message: "Profile type is mandatory in request body",
            statusCd: 0
          });
          return 0
        }
        if(req.body.rev[0].ctin === null ||req.body.rev[0].ctin === undefined
          || req.body.rev[0].ctin === '' ){
         sendResponse(res, 500, {
           message: "Ctin should not be null or empty",
           statusCd: 0
         });
         return 0
        }
        for (var i = 0; i < req.body.rev[0].docs.length; i++) {
          
            if(req.body.rev[0].docs[i].pos === null ||req.body.rev[0].docs[i].pos === undefined
              || req.body.rev[0].docs[i].pos === '' ){
             sendResponse(res, 500, {
               message: "Place of supply should not be null or empty",
               statusCd: 0
             });
             return 0
           }
         
           if(req.body.rev[0].docs[i].docref === null ||req.body.rev[0].docs[i].docref === undefined
            || req.body.rev[0].docs[i].docref === '' ){
           sendResponse(res, 500, {
             message: "Docref should not be null or empty",
             statusCd: 0
           });
           return 0
         }
         
         if(req.body.rev[0].docs[i].rst === null ||req.body.rev[0].docs[i].rst === undefined
          || req.body.rev[0].docs[i].rst === '' ){
         sendResponse(res, 500, {
           message: "Rst should not be null or empty",
           statusCd: 0
         });
         return 0
       }
       
       if(req.body.rev[0].docs[i].sec7act === null ||req.body.rev[0].docs[i].sec7act == undefined
        || req.body.rev[0].docs[i].sec7act === '' ){
       sendResponse(res, 500, {
         message: "SEC 7 Act should not be null or empty",
         statusCd: 0
       });
       return 0
     }
     
     if(req.body.rev[0].docs[i].diffpercnt === null ||req.body.rev[0].docs[i].diffpercnt === undefined
      || req.body.rev[0].docs[i].diffpercnt === '' ){
     sendResponse(res, 500, {
       message: "Differential percentage should not be null or empty",
       statusCd: 0
     });
     return 0
   }   
       if(req.body.rev[0].docs[i].doctyp == null ||req.body.rev[0].docs[i].doctyp == undefined
        || req.body.rev[0].docs[i].doctyp === '' ){
       sendResponse(res, 500, {
         message: "Document type should not be null or empty",
         statusCd: 0
       });
       return 0
     }
     if(req.body.rev[0].docs[i].suptype == null ||req.body.rev[0].docs[i].suptype == undefined
      || req.body.rev[0].docs[i].suptype === '' ){
     sendResponse(res, 500, {
       message: "Supply type should not be null or empty",
       statusCd: 0
     });
     return 0
   }
   for (var j = 0; j < req.body.rev[0].docs[i].items.length; j++) {
    if(req.body.rev[0].docs[i].items[j].txval == null ||req.body.rev[0].docs[i].items[j].txval == undefined 
      || req.body.rev[0].docs[i].items[j].txval === '' ){
      sendResponse(res, 500, {message: "Taxable should not be null or empty",
        statusCd: 0
      });
      return 0
    }
      if(req.body.rev[0].docs[i].items[j].rate == null ||req.body.rev[0].docs[i].items[j].rate == undefined 
        || req.body.rev[0].docs[i].items[j].rate === '' ){
        sendResponse(res, 500, {message: "Rate should not be null or empty",
          statusCd: 0
        });
        return 0
      }
    if(req.body.rev[0].docs[i].items[0].hsn=== undefined ||
       req.body.rev[0].docs[i].items[0].hsn=== "" || req.body.rev[0].docs[i].items[0].hsn=== null)
    {  
      for (let p = 0; p < req.body.rev[0].docs[i].items.length; p++) {
        for (let q = p + 1 ; q < req.body.rev[0].docs[i].items.length ; q++) {
          console.log( req.body.rev[0].docs[i].items[p].rate )
          console.log( req.body.rev[0].docs[i].items[q].rate )
             if ((req.body.rev[0].docs[i].items[p].rate == req.body.rev[0].docs[i].items[q].rate)) {
              sendResponse(res, 500, {message: "Rate should not be repeated as no HSN value is entered",
              statusCd: 0
            });
            return 0  
             }
        }
    }
    }    
    else {
      if(req.body.rev[0].docs[i].items[j].hsn == null ||req.body.rev[0].docs[i].items[j].hsn == undefined 
        || req.body.rev[0].docs[i].items[j].hsn === '' ){
        sendResponse(res, 500, {message: "HSN should be entered for all the items",
          statusCd: 0
        });
        return 0
      }
    }
  }
  }
  return 1;
  }

  module.exports = {
    validate3h:validate3h
  }