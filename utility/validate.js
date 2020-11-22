const { sendResponse } = require("../utility/common");
const anx1Const = require('../utility/anx1Constants');

// function tom validate the data from table 3A before saving
function validateAnx1Save3A(req, res) {
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
    if (req.headers["fp"] === undefined || req.headers["fp"] === '' || req.headers["fp"] === null) {
      sendResponse(res, 500, {
        message: "Missing Financial period in the header",
        statusCd: 0
      });
      return 0
    }
    if (req.headers["issez"] === undefined || req.headers["issez"] === '' || req.headers["issez"] === null) {
      sendResponse(res, 500, {
        message: "Missing Is -Sez period in the header",
        statusCd: 0
      });
      return 0
    }
    if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "") {
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
    
      if (req.body.b2c[0].docref === "null" || req.body.b2c[0].docref === undefined ||
       req.body.b2c[0].docref === "") {
        sendResponse(res, 500, {
          message: "Docref is mandatory in request body",
          statusCd: 0
        });
        return 0
      }
      if (req.body.b2c[0].pos === "null" || req.body.b2c[0].pos === undefined ||
       req.body.b2c[0].pos === "") {
        sendResponse(res, 500, {
          message: "Place of Supply is mandatory in request body",
          statusCd: 0
        });
        return 0
      }
             
      if(req.body.b2c[0].rst == null ||req.body.b2c[0].rst == undefined
        || req.body.b2c[0].rst === '' ){
       sendResponse(res, 500, {
         message: "Rst should not be null or empty",
         statusCd: 0
       });
       return 0
     }
     
     if(req.body.b2c[0].sec7act == null ||req.body.b2c[0].sec7act == undefined
      || req.body.b2c[0].sec7act === '' ){
     sendResponse(res, 500, {
       message: "SEC 7 Act should not be null or empty",
       statusCd: 0
     });
     return 0
   }
   
   if(req.body.b2c[0].diffprcnt == null ||req.body.b2c[0].diffprcnt == undefined
    || req.body.b2c[0].diffprcnt === '' ){
   sendResponse(res, 500, {
     message: "Differential percentage should not be null or empty",
     statusCd: 0
   });
   return 0
 } 
 if(req.body.b2c[0].suptyp === null ||req.body.b2c[0].suptyp === undefined
  || req.body.b2c[0].suptyp === '' ){
 sendResponse(res, 500, {
   message: "Supply type should not be null or empty",
   statusCd: 0
 });
 return 0
} 
for (var i =0; i< req.body.b2c[0].items.length ; i++){
  if(req.body.b2c[0].items[i].txval == null ||req.body.b2c[0].items[i].txval == undefined
    || req.body.b2c[0].items[i].txval === '' ){
   sendResponse(res, 500, {
     message: "Tax value should not be null or empty",
     statusCd: 0
   });
   return 0
  } 
  if(req.body.b2c[0].items[i].rate === null ||req.body.b2c[0].items[i].rate === undefined
    || req.body.b2c[0].items[i].rate === '' ){
   sendResponse(res, 500, {
     message: "Rate should not be null or empty",
     statusCd: 0
   });
   return 0
  } 
  for(var j=i+1 ; j< req.body.b2c[0].items.length ; j++ ){
    if((req.body.b2c[0].items[i].rate==req.body.b2c[0].items[j].rate )){

      sendResponse(res, 500, {
        message: "Rate should not be repeated",
        statusCd: 0
      });
      return 0
    }
  }
}
  return 1;
}
// function tom validate the data from table 3H before saving
function validateAnx1Save3H(req, res){
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


// generic function to validate headers  
function validateHeaders(req, res) {
  if ( req.headers["gstin"] === undefined || req.headers["gstin"] === "" || req.headers["gstin"] === null) {
    sendResponse(res, 400, {
      message: "Missing GSTIN in the header",
      statusCd: 0
    });
    return 0;
  }
  if (
    req.headers["rtnprd"] === undefined ||
    req.headers["rtnprd"] === "" ||
    req.headers["rtnprd"] === null
  ) {
    sendResponse(res, 400, {
      message: "Missing return-period in the header",
      statusCd: 0
    });
    return 0;
  }
  if (
    req.headers["profile"] === undefined ||
    req.headers["profile"] === "" ||
    req.headers["profile"] === null
  ) {
    sendResponse(res, 400, {
      message: "Missing profile in the header",
      statusCd: 0
    });
    return 0;
  }
  if (
    req.headers["issez"] === undefined ||
    req.headers["issez"] === "" ||
    req.headers["issez"] === null
  ) {
    sendResponse(res, 400, {
      message: "Missing issez in the header",
      statusCd: 0
    });
    return 0;
  }
  if (
    req.headers["fp"] === undefined ||
    req.headers["fp"] === "" ||
    req.headers["fp"] === null
  ) {
    sendResponse(res, 400, {
      message: "Missing fp in the header",
      statusCd: 0
    });
    return 0;
  }

  return 1
 };

function validate3cdExpwp(req,res){
  let rtnprd = req.headers["rtnprd"];
for(i =0 ; i<req.body.expwp[0].docs.length ; i++){
  if (req.body.expwp[0].docs[i].docref ==="null" || req.body.expwp[0].docs[i].docref  === undefined 
  ||req.body.expwp[0].docs[i].docref === ''){
    sendResponse(res, 500, {
      message: "No docref present",
      statusCd: 0
    });
    return 0;
  }
  if (req.body.expwp[0].docs[i].doc.num ==="null" || req.body.expwp[0].docs[i].doc.num  === undefined
   ||req.body.expwp[0].docs[i].doc.num  === ''){
    sendResponse(res, 500, {
      message: "Document number can't be empty or null",
      statusCd: 0
    });
    return 0;
  }
  else{
    //let doc=/^[A-Za-z0-9/-]+$/; 
    let doc=anx1Const.DOC_NUM_SHIP_BILL_REGEX;
    if(!((req.body.expwp[0].docs[i].doc.num).match(doc))){
      sendResponse(res, 500, {
        message: "Document number format is incorrect",
        statusCd: 0
      });
      return 0;
    }
    if (req.body.expwp[0].docs[i].sb.num !="null" && req.body.expwp[0].docs[i].sb.num  != undefined
   &&req.body.expwp[0].docs[i].sb.num  != ''){
    //let doc=/^[A-Za-z0-9/-]+$/; 
    let doc=anx1Const.DOC_NUM_SHIP_BILL_REGEX;
    if(!((req.body.expwp[0].docs[i].sb.num).match(doc))){
      sendResponse(res, 500, {
        message: "Shipping bill format is incorrect",
        statusCd: 0
      });
      return 0;
    }
  }
  if (req.body.expwp[0].docs[i].sb.pcode !="null" && req.body.expwp[0].docs[i].sb.pcode  != undefined
  &&req.body.expwp[0].docs[i].sb.pcode  != ''){
   if((req.body.expwp[0].docs[i].sb.pcode).length>6){
     sendResponse(res, 500, {
       message: "Port code format is incorrect",
       statusCd: 0
     });
     return 0;
   }
 }
  }
  if (req.body.expwp[0].docs[i].exptype ==="null" || req.body.expwp[0].docs[i].exptype  === undefined
   ||req.body.expwp[0].docs[i].exptype  === ''){
    sendResponse(res, 500, {
      message: "Export type can't be empty or null",
      statusCd: 0
    });
    return 0;
  }
  if (req.body.expwp[0].docs[i].doctyp ==="null" || req.body.expwp[0].docs[i].doctyp  === undefined
  ||req.body.expwp[0].docs[i].doctyp  === ''){
   sendResponse(res, 500, {
     message: "Document type can't be empty or null",
     statusCd: 0
   });
   return 0;
 }
 if (req.body.expwp[0].docs[i].doc.val ==="null" || req.body.expwp[0].docs[i].doc.val  === undefined
  ||req.body.expwp[0].docs[i].doc.val  === ''){
   sendResponse(res, 500, {
     message: "Document value can't be empty or null",
     statusCd: 0
   });
   return 0;
 }
 for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
  if (req.body.expwp[0].docs[i].items[j].txval ==="null" || req.body.expwp[0].docs[i].items[j].txval === undefined
  ||req.body.expwp[0].docs[i].items[j].txval  === ''){
   sendResponse(res, 500, {
     message: "Taxable value can't be empty",
     statusCd: 0
   });
   return 0;
 }
 if (req.body.expwp[0].docs[i].items[j].hsn ==="null" || req.body.expwp[0].docs[i].items[j].hsn === undefined
  ||req.body.expwp[0].docs[i].items[j].hsn  === ''){
   sendResponse(res, 500, {
     message: "HSN value can't be empty",
     statusCd: 0
   });
   return 0;
 }
 if(req.body.expwp[0].docs[i].doctyp == 'CR' || req.body.expwp[0].docs[i].doctyp == 'I') {
  if(checkPriorMonths(req.body.expwp[0].docs[i].doc.dt, rtnprd)) {
    sendResponse(res, 500, {
      message: "Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd,
      statusCd: 0
    });
    return 0;
  }
}
if(req.body.expwp[0].docs[i].odoctyp == 'CR' || req.body.expwp[0].docs[i].odoctyp == 'I') {
  if(checkPriorMonths(req.body.expwp[0].docs[i].odoc.dt, rtnprd)) {
    sendResponse(res, 500, {
      message: "Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd,
      statusCd: 0
    });
    return 0;
  }
}
 }
}
  return 1;
}

function validate3cdExpwop(req,res){
  let rtnprd = req.headers["rtnprd"];
  for(i =0 ; i<req.body.expwop[0].docs.length ; i++){
    if (req.body.expwop[0].docs[i].docref ==="null" || req.body.expwop[0].docs[i].docref  === undefined 
    ||req.body.expwop[0].docs[i].docref === ''){
      sendResponse(res, 500, {
        message: "No docref present",
        statusCd: 0
      });
      return 0;
    }
    if (req.body.expwop[0].docs[i].exptype ==="null" || req.body.expwop[0].docs[i].exptype  === undefined
     ||req.body.expwop[0].docs[i].exptype  === ''){
      sendResponse(res, 500, {
        message: "Export type can't be empty or null",
        statusCd: 0
      });
      return 0;
    }
    if (req.body.expwop[0].docs[i].doctyp ==="null" || req.body.expwop[0].docs[i].doctyp  === undefined
    ||req.body.expwop[0].docs[i].doctyp  === ''){
     sendResponse(res, 500, {
       message: "Document type can't be empty or null",
       statusCd: 0
     });
     return 0;
   }
   
   if (req.body.expwop[0].docs[i].doc.val ==="null" || req.body.expwop[0].docs[i].doc.val  === undefined
    ||req.body.expwop[0].docs[i].doc.val  === ''){
     sendResponse(res, 500, {
       message: "Document value can't be empty or null",
       statusCd: 0
     });
     return 0;
   }
   if (req.body.expwop[0].docs[i].doc.num ==="null" || req.body.expwop[0].docs[i].doc.num  === undefined
   ||req.body.expwop[0].docs[i].doc.num  === ''){
    sendResponse(res, 500, {
      message: "Document number can't be empty or null",
      statusCd: 0
    });
    return 0;
  }
  else{
    //let doc=/^[A-Za-z0-9/-]+$/;
    let doc=anx1Const.DOC_NUM_SHIP_BILL_REGEX; 
    if(!((req.body.expwop[0].docs[i].doc.num).match(doc))){
      sendResponse(res, 500, {
        message: "Document number format is incorrect",
        statusCd: 0
      });
      return 0;
    }

  }
  if (req.body.expwop[0].docs[i].sb.num !="null" && req.body.expwop[0].docs[i].sb.num  != undefined
  &&req.body.expwop[0].docs[i].sb.num  != ''){
    //let doc=/^[A-Za-z0-9/-]+$/; 
    let doc=anx1Const.DOC_NUM_SHIP_BILL_REGEX;
    if(!((req.body.expwop[0].docs[i].sb.num).match(doc))){
      sendResponse(res, 500, {
        message: "Shipping number format is incorrect",
        statusCd: 0
      });
      return 0;
   }
 }
 if (req.body.expwop[0].docs[i].sb.pcode !="null" && req.body.expwop[0].docs[i].sb.pcode  != undefined
 &&req.body.expwop[0].docs[i].sb.pcode  != ''){
  if((req.body.expwop[0].docs[i].sb.pcode).length>6){
    sendResponse(res, 500, {
      message: "Port code format is incorrect",
      statusCd: 0
    });
    return 0;
  }
}
   for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {
    if (req.body.expwop[0].docs[i].items[j].txval ==="null" || req.body.expwop[0].docs[i].items[j].txval === undefined
    ||req.body.expwop[0].docs[i].items[j].txval  === ''){
     sendResponse(res, 500, {
       message: "Taxable value can't be empty",
       statusCd: 0
     });
     return 0;
   }
   if (req.body.expwop[0].docs[i].items[j].hsn ==="null" || req.body.expwop[0].docs[i].items[j].hsn === undefined
    ||req.body.expwop[0].docs[i].items[j].hsn  === ''){
     sendResponse(res, 500, {
       message: "HSN value can't be empty",
       statusCd: 0
     });
     return 0;
   }
   if(req.body.expwop[0].docs[i].doctyp == 'CR' || req.body.expwop[0].docs[i].doctyp == 'I') {
    if(checkPriorMonths(req.body.expwop[0].docs[i].doc.dt, rtnprd)) {
      sendResponse(res, 500, {
        message: "Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd,
        statusCd: 0
      });
      return 0;
    }
  }
  if(req.body.expwop[0].docs[i].odoctyp == 'CR' || req.body.expwop[0].docs[i].odoctyp == 'I') {
    if(checkPriorMonths(req.body.expwop[0].docs[i].odoc.dt, rtnprd)) {
      sendResponse(res, 500, {
        message: "Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd,
        statusCd: 0
      });
      return 0;
    }
  }

   }
  }
    return 1;
  }
/** validateAnx1Save3B - validates 3B payload from UI */
function validateAnx1Save3B(req, res) {
  if (validateHeaders(req, res)) {
    if (req.body.gstin === "null" || req.body.gstin === undefined || req.body.gstin === "") {
      console.log(req.body)
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
    if (req.body.b2b[0].ctin === null || req.body.b2b[0].ctin === undefined
      || req.body.b2b[0].ctin === '') {
      sendResponse(res, 500, {
        message: "Ctin should not be null or empty",
        statusCd: 0
      });
      return 0
    }
   

      if (req.body.b2b[0].pos === null || req.body.b2b[0].pos === undefined
        || req.body.b2b[0].pos === '') {
        sendResponse(res, 500, {
          message: "Place of supply should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      /** need to check */
      if (req.body.b2b[0].docref === null || req.body.b2b[0].docref === undefined
        || req.body.b2b[0].docref === '') {
        sendResponse(res, 500, {
          message: "Docref should not be null or empty",
          statusCd: 0
        });
        return 0
      }

      // if (req.body.b2b[0].docs[i].rst === null || req.body.b2b[0].docs[i].rst === undefined
      //   || req.body.b2b[0].docs[i].rst === '') {
      //   sendResponse(res, 500, {
      //     message: "Rst should not be null or empty",
      //     statusCd: 0
      //   });
      //   return 0
      // }

      if (req.body.b2b[0].sec7act === null || req.body.b2b[0].sec7act == undefined
        || req.body.b2b[0].sec7act === '') {
          sendResponse(res, 500, {
          message: "SEC 7 Act should not be null or empty",
          statusCd: 0
        });
        return 0
      }

      if (req.body.b2b[0].diffprcnt === null || req.body.b2b[0].diffprcnt === undefined
        || req.body.b2b[0].diffprcnt === '') {
        sendResponse(res, 500, {
          message: "Differential percentage should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      if (req.body.b2b[0].doctyp == null || req.body.b2b[0].doctyp == undefined
        || req.body.b2b[0].doctyp === '') {
        sendResponse(res, 500, {
          message: "Document type should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      /** need to check */
      if (req.body.b2b[0].suptype == null || req.body.b2b[0].suptype == undefined
        || req.body.b2b[0].suptype === '') {
        sendResponse(res, 500, {
          message: "Supply type should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      if (req.body.b2b[0].doc.num == null || req.body.b2b[0].doc.num == undefined
        || req.body.b2b[0].doc.num === '') {
        sendResponse(res, 500, {
          message: "Document number should not be null or empty",
          statusCd: 0
        });
        return 0
      }

      if (req.body.b2b[0].doc.dt == null || req.body.b2b[0].doc.dt == undefined
        || req.body.b2b[0].doc.dt === '') {
        sendResponse(res, 500, {
          message: "Document date should not be null or empty",
          statusCd: 0
        });
        return 0
      }

      
      let isDocDateValid = validateDocumentDate(req.body.b2b[0].doc.dt, req.body.rtnprd, "Document");
      if(isDocDateValid != true){
        sendResponse(res, 500, {
          message: isDocDateValid, statusCd: 0
        });
        return 0 
      } 
      
      if (req.body.b2b[0].doc.val == null || req.body.b2b[0].doc.val == undefined
        || req.body.b2b[0].doc.val === '') {
        sendResponse(res, 500, {
          message: "Document value should not be null or empty",
          statusCd: 0
        });
        return 0
      }
      for (var j = 0; j < req.body.b2b[0].items.length; j++) {
        if (req.body.b2b[0].items[j].txval == null || req.body.b2b[0].items[j].txval == undefined
          || req.body.b2b[0].items[j].txval === '') {
          sendResponse(res, 500, {
            message: "Taxable should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        if (req.body.b2b[0].items[j].rate == null || req.body.b2b[0].items[j].rate == undefined
          || req.body.b2b[0].items[j].rate === '') {
          sendResponse(res, 500, {
            message: "Rate should not be null or empty",
            statusCd: 0
          });
          return 0
        }
        
        for (let k = 1; k < req.body.b2b[0].items.length; k++) {
          if ((req.body.b2b[0].items[j].hsn == null || req.body.b2b[0].items[j].hsn == undefined || req.body.b2b[0].items[j].hsn === '') 
          && (req.body.b2b[0].items[k].hsn == null || req.body.b2b[0].items[k].hsn == undefined || req.body.b2b[0].items[k].hsn === '') 
          && (req.body.b2b[0].items[j].rate == req.body.b2b[0].items[k].rate) && j != k) {
            console.log(req.body.b2b[0].items[j].rate + " - " + req.body.b2b[0].items[k].rate)
            sendResponse(res, 500, {
              message: "Rate should not be repeated as no HSN value is entered",
              statusCd: 0
            });
            return 0
          }

          if (((req.body.b2b[0].items[j].hsn == null || req.body.b2b[0].items[j].hsn == undefined
            || req.body.b2b[0].items[j].hsn === '') && 
            (req.body.b2b[0].items[k].hsn != null && req.body.b2b[0].items[k].hsn != undefined
            && req.body.b2b[0].items[k].hsn != ''))  || 
            ((req.body.b2b[0].items[k].hsn == null || req.body.b2b[0].items[k].hsn == undefined
            || req.body.b2b[0].items[k].hsn === '') && (req.body.b2b[0].items[j].hsn != null 
            && req.body.b2b[0].items[j].hsn != undefined  && req.body.b2b[0].items[j].hsn != ''))) {
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

/**
 * 
 * @param docDate document Date to be checked
 * @param rtnprd Return Period
 */
function validateDocumentDate(docDate, rtnprd, fieldName,ret_typ) {
  let maxDate = new Date();
  let startDate = new Date(anx1Const.MINIMUM_DOCUMENT_DATE);
  let taxperiod = Number(rtnprd.substr(0, 2));
  let taxperioderror = false;
  if(ret_typ!==undefined && ret_typ!==null && ret_typ!==''){
    if(ret_typ=="QN" || ret_typ=="SM" || ret_typ=="SJ")
    taxperiod = taxperiod-3;
    else
    taxperiod = taxperiod-2;
    if(taxperiod<1)
        year = (Number(Number(rtnprd.substr(2)))-1);
  }
  if (!docDate || docDate === "" || docDate == null) {
    return fieldName + " date can't be left blank";
  } else {
      //From UI docDate is sent in DD/MM/YYYY format. inorder to check the date difference, we need to convert the date to MM/DD/YYYY format
      let docDtArr = [];
      if(docDate.indexOf("/") > 0){
        docDtArr = docDate.split("/");
      } else if(docDate.indexOf("-") > 0){
        docDtArr = docDate.split("-");
      } else {
        return fieldName + " date is invalid";
      }
      
      let docdate = new Date(docDtArr[1] + "/" + docDtArr[0] + "/" + docDtArr[2]);

      if (docdate < startDate) {
          return fieldName + anx1Const.MINIMUM_DOCUMENT_DATE_ERROR;
      }
      
      // if ((taxperiod < maxDate.getMonth() + 1) && maxDate.getFullYear() >= Number(rtnprd.substr(2))) {
      //     let newDay = new Date()
      //     newDay.setMonth(taxperiod, 0);
      //     newDay.setFullYear(Number(rtnprd.substr(2)))
      //     maxDate = newDay;
      //     taxperioderror = true;
      // }
      // maxDate.setHours(5, 30, 0, 0);
      if ((taxperiod > maxDate.getMonth() + 1) && maxDate.getFullYear() > Number(rtnprd.substr(2))) {
        let newDay = new Date()
        newDay.setMonth(taxperiod, 0);
        newDay.setFullYear(Number(rtnprd.substr(2)))
        maxDate = newDay;
        taxperioderror = true;
      }
       else if ((taxperiod > maxDate.getMonth() + 1) && maxDate.getFullYear() == Number(rtnprd.substr(2))) {
        let newDay = new Date();
        maxDate = newDay;
        taxperioderror = true
      }
      maxDate.setHours(5, 30, 0, 0);
      
      if (docdate > maxDate) {
          if (taxperioderror)
              return fieldName + " date cannot be more than " + maxDate.toLocaleDateString("en-GB") + " for the chosen taxperiod."
          else
              return fieldName + " date cannot be a future date"
      }
  }
  
  return true;

}


function checkFutureDate(docDate) {
  let maxDate = new Date();

  let docDtArr = [];
      if(docDate.indexOf("/") > 0){
        docDtArr = docDate.split("/");
      } else if(docDate.indexOf("-") > 0){
        docDtArr = docDate.split("-");
      }
  let docdate = new Date(docDtArr[1] + "/" + docDtArr[0] + "/" + docDtArr[2]);

  if (docdate > maxDate) {
        return true;
  } else {
    return false;
  }
}

function checkPriorMonths(docDate, rtnprd) {
  let month = Number(rtnprd.substr(0, 2)) - 1;
  let year = Number(rtnprd.substr(2,4));
  let date = new Date(year, month + 1, 0);
  date.setMonth(date.getMonth() - 18);
  let limDocDate = new Date(date.getFullYear(), date.getMonth(), 1);

  let docDtArr = [];
  if(docDate.indexOf("/") > 0){
    docDtArr = docDate.split("/");
  } else if(docDate.indexOf("-") > 0){
    docDtArr = docDate.split("-");
  }
let docdate = new Date(docDtArr[1] + "/" + docDtArr[0] + "/" + docDtArr[2]);

  if(docdate <= limDocDate) {
    return true;
  } else {
    return false;
  }
}

  module.exports = {
    validateAnx1Save3A: validateAnx1Save3A,
    validateAnx1Save3H : validateAnx1Save3H,
    validateHeaders: validateHeaders,
    validate3cdExpwp : validate3cdExpwp,
    validate3cdExpwop : validate3cdExpwop,
    validateAnx1Save3B: validateAnx1Save3B,
    validateDocumentDate : validateDocumentDate,
    checkFutureDate : checkFutureDate,
    checkPriorMonths : checkPriorMonths
 }
