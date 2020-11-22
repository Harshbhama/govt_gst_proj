const { sendResponse } = require("../../../utility/common");

function validate4(req,res){
    if (req.body.ecom[0].docs === "null" || req.body.ecom[0].docs === undefined ||
         req.body.ecom[0].docs === "") {
          sendResponse(res, 500, {
            message: "Document array is mandatory in request body",
            statusCd: 0
          });
          return 0
        }
    for(i=0 ; i<req.body.ecom[0].docs.length;i++){
      if (req.body.ecom[0].docs[i].docref === "null" || req.body.ecom[0].docs[i].docref=== undefined ||
      req.body.ecom[0].docs[i].docref === "") {
       sendResponse(res, 500, {
         message: "Docref is mandatory in request body",
         statusCd: 0
       });
       return 0
     }
     if (req.body.ecom[0].docs[i].etin  === "null" || req.body.ecom[0].docs[i].etin === undefined ||
     req.body.ecom[0].docs[i].etin === "") {
      sendResponse(res, 500, {
        message: "Etin is mandatory in request body",
        statusCd: 0
      });
      return 0
    }
    if (req.body.ecom[0].docs[i].sup  === "null" || req.body.ecom[0].docs[i].sup === undefined ||
    req.body.ecom[0].docs[i].sup === "") {
     sendResponse(res, 500, {
       message: "Supplies made is mandatory in request body",
       statusCd: 0
     });
     return 0
   }
   if (req.body.ecom[0].docs[i].supr  === "null" || req.body.ecom[0].docs[i].supr === undefined ||
   req.body.ecom[0].docs[i].supr === "") {
    sendResponse(res, 500, {
      message: "Supplies returned is mandatory in request body",
      statusCd: 0
    });
    return 0
  }
  if (req.body.ecom[0].docs[i].nsup  === "null" || req.body.ecom[0].docs[i].nsup === undefined ||
  req.body.ecom[0].docs[i].nsup === "") {
   sendResponse(res, 500, {
     message: "Net Supplies is mandatory in request body",
     statusCd: 0
   });
   return 0
  }
  if ((req.body.ecom[0].docs[i].igst  === "null" || 
    req.body.ecom[0].docs[i].igst === undefined ||
    req.body.ecom[0].docs[i].igst === "")&&
    (req.body.ecom[0].docs[i].cgst  === "null" || 
    req.body.ecom[0].docs[i].cgst === undefined ||
    req.body.ecom[0].docs[i].cgst === "")
    &&(req.body.ecom[0].docs[i].sgst  === "null" || 
    req.body.ecom[0].docs[i].sgst === undefined ||
    req.body.ecom[0].docs[i].sgst === "")) {
   sendResponse(res, 500, {
     message: "All the tax values can not be empty , please atleast one from igst,cgst and sgst",
     statusCd: 0
   });
   return 0
  }
  if ((req.body.ecom[0].docs[i].cgst != req.body.ecom[0].docs[i].sgst )) {
 sendResponse(res, 500, {
   message: "Sgst should be equal to cgst",
   statusCd: 0
 });
 return 0
}
    }
    return 1;
  }

  module.exports={
      validate4: validate4
  }