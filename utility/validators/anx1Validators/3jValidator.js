const { sendResponse } = require("../../../utility/common");
const { validateHeaders } = require("../../../utility/validate");

function validate3j(req, res) {
    if (validateHeaders(req, res)) {
        if(req.body.impg[0].docs[0].docref === undefined || req.body.impg[0].docs[0].docref === "" ||
        req.body.impg[0].docs[0].docref === null){
            sendResponse(res, 500, {
                message: "Docref is mandatory in request body",
                statusCd: 0
              });
              return 0
        }
        if(req.body.impg[0].docs[0].doctyp === undefined || req.body.impg[0].docs[0].doctyp === "" ||
        req.body.impg[0].docs[0].doctyp === null){
            sendResponse(res, 500, {
                message: "Doctyp is mandatory in request body",
                statusCd: 0
              });
              return 0
        }
        if(req.body.impg[0].docs[0].pos === undefined || req.body.impg[0].docs[0].pos === "" ||
        req.body.impg[0].docs[0].pos === null){
            sendResponse(res, 500, {
                message: "Pos is mandatory in request body",
                statusCd: 0
              });
              return 0
        }
        if(req.body.impg[0].docs[0].boe.num === undefined || req.body.impg[0].docs[0].boe.num === "" ||
        req.body.impg[0].docs[0].boe.num === null){
            sendResponse(res, 500, {
                message: "Bill of Entry Number is mandatory in request body",
                statusCd: 0
              });
              return 0
        }
        if(req.body.impg[0].docs[0].boe.val === undefined || req.body.impg[0].docs[0].boe.val === "" ||
        req.body.impg[0].docs[0].boe.val === null){
            sendResponse(res, 500, {
                message: "Bill of Entry Value is mandatory in request body",
                statusCd: 0
              });
              return 0
        }
        if(req.body.impg[0].docs[0].boe.dt === undefined || req.body.impg[0].docs[0].boe.dt === "" ||
        req.body.impg[0].docs[0].boe.dt === null){
            sendResponse(res, 500, {
                message: "Bill of Entry Date is mandatory in request body",
                statusCd: 0
              });
              return 0
        }
        if(req.body.impg[0].docs[0].boe.pcode !== undefined || req.body.impg[0].docs[0].boe.pcode !== "" ||
        req.body.impg[0].docs[0].boe.pcode !== null){
            if((req.body.impg[0].docs[0].boe.pcode).length >6){
                sendResponse(res, 500, {
                    message: "Port Code can only be a maximum of 6 digits",
                    statusCd: 0
                  });
                  return 0
            }
      
        }
        return 1;
    }
return 0;
}


module.exports={
    validate3j:validate3j
}