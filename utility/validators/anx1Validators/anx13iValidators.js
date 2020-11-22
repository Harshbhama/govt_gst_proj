const { sendResponse } = require("../../../utility/common");

function validate3i(req,res){
    if (req.body.imps[0].docs === "null" || req.body.imps[0].docs === undefined ||
         req.body.imps[0].docs === "") {
          sendResponse(res, 500, {
            message: "Document array is mandatory in request body",
            statusCd: 0
          });
          return 0
        }
    for(i=0 ; i<req.body.imps[0].docs.length;i++){
      if (req.body.imps[0].docs[i].docref === "null" || req.body.imps[0].docs[i].docref=== undefined ||
      req.body.imps[0].docs[i].docref === "") {
       sendResponse(res, 500, {
         message: "Docref is mandatory in request body",
         statusCd: 0
       });
       return 0
     }
     if (req.body.imps[0].docs[i].pos  === "null" || req.body.imps[0].docs[i].pos === undefined ||
     req.body.imps[0].docs[i].pos === "") {
      sendResponse(res, 500, {
        message: "Pos is mandatory in request body",
        statusCd: 0
      });
      return 0
    }
 
  for(j=0;j<req.body.imps[0].docs[i].items.length ; j++){
    if (req.body.imps[0].docs[i].items  === "null" || req.body.imps[0].docs[i].items === undefined ||
    req.body.imps[0].docs[i].items === "") {
     sendResponse(res, 500, {
       message: "No items added in request body",
       statusCd: 0
     });
     return 0
   }
   if (req.body.imps[0].docs[i].items[j].txval  === "null" || req.body.imps[0].docs[i].items[j].txval === undefined ||
   req.body.imps[0].docs[i].items[j].txval === "") {
    sendResponse(res, 500, {
      message: "Taxvalue is mandatory in request body",
      statusCd: 0
    });
    return 0
  }
  if (req.body.imps[0].docs[i].items[j].rate  === "null" || req.body.imps[0].docs[i].items[j].rate === undefined ||
  req.body.imps[0].docs[i].items[j].rate === "") {
   sendResponse(res, 500, {
     message: "Rate is mandatory in request body",
     statusCd: 0
   });
   return 0
}
   if (req.body.imps[0].docs[i].items[j].hsn  === "null" || req.body.imps[0].docs[i].items[j].hsn === undefined ||
   req.body.imps[0].docs[i].items[j].hsn === "") {
    sendResponse(res, 500, {
      message: "Hsn is mandatory in request body",
      statusCd: 0
    });
    return 0
  }
    }
}
    return 1;
  }

  module.exports={
      validate3i: validate3i
  }