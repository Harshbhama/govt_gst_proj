const validate = require("../../../utility/validate");
let dbRates = [];
const docTypeArr = ['I', 'CR', 'DR', 'B'];
const tblrefArr = ['3B','3E','3G'];
let hsnCodeMstr = [];
const anx1Const = require('../../../utility/anx1Constants');
function setRatesForValidation(rates){
    dbRates = rates;
}

function setHSNMaster(hsnMaster){
    hsnCodeMstr = hsnMaster;
}

function validateAnx1Imp_Header(req){
    let resMsg = { statusCd: 0, message: [] };
    if (!req.headers["gstin"]) {
      resMsg.message.push("Missing GSTIN in the header");
    } 
	if (!req.headers["rtnprd"]) {    
      resMsg.message.push("Missing return-period in the header");
    } 
	if (!req.headers["profile"]) {    
      resMsg.message.push("Missing Profile in the header");
    } 
	if (!req.headers["issez"]) {
      resMsg.message.push("Missing Is-Sez in the header");
    } 
	if (!req.headers["fp"]) {
      resMsg.message.push("Missing Financial Period in the header");
    } 
	if (!req.body.gstin) {
      resMsg.message.push("Gstin is mandatory in request body");
    } else if (req.body.gstin != req.headers["gstin"]) {
      resMsg.message.push("Gstin in header doesn't match with gstin in request body");
    } 
	if (!req.body.rtnprd) {
      resMsg.message.push("Return period is mandatory in request body");
    } else if(!(req.headers["rtnprd"] === req.body.rtnprd)) {
      resMsg.message.push("rtnprd in the import file is not matched with the current profile");
    }
    if (!req.body.issez) {
       resMsg.message.push("Is SEZ is mandatory in request body");
    } else if(req.headers["issez"] != req.body.issez){
        resMsg.message.push("Is SEZ is not matching");
    } 
    if (!req.body.profile) {
       resMsg.message.push("Profile type is mandatory in request body");
    } else if(req.headers["profile"] != req.body.profile){
        resMsg.message.push("Profile is not matching");
    } 
     
	resMsg.statusCd = resMsg.message[0] ? resMsg.statusCd : 1;
    return resMsg;
}

function checkIsNullorEmpty(value, fieldName, messageArr){
    if(!value){
        messageArr.push(fieldName + " should not be null or empty");
    } 
}

function validateAnx1Imp_3H(revObj, gstin){ 
    let resMsg = [], docRefArr = [], statusCd = 1;
    
    if(revObj.type && revObj.type != 'P'){
        validateCTIN(revObj.ctin, gstin, "CTIN" ,resMsg);
        if(resMsg.length > 0){
            statusCd = 0;
            revObj.errMessage = resMsg;
        }
    } 
    revObj.docs.every((doc) => {
        let errors = [];

        checkIsNullorEmpty(doc.pos, "Place of supply", errors);
        
        checkIsNullorEmpty(doc.docref, "Docref", errors);

        checkDuplicateDocRef(doc.docref, docRefArr, errors);

        checkIsNullorEmpty(doc.rst, "Rst", errors);

        checkIsNullorEmpty(doc.suptype, "Supply type", errors);
             
        validateItems(doc.items, doc.suptype, errors, "rev", '');

        if(errors.length > 0){
            statusCd = 0;
            doc.errMessage = errors;
        }
		return true;			
      }
    );     
   revObj.valid = statusCd;
}

function validateAnx1Imp_3A(b2cObj){
    let errors = [], statusCd = 1;

    checkIsNullorEmpty(b2cObj.pos, "Place of supply", errors);
    
    checkIsNullorEmpty(b2cObj.docref, "Docref", errors);

    checkIsNullorEmpty(b2cObj.rst, "Rst", errors);
    
    checkIsNullorEmpty(b2cObj.suptype, "Supply Type", errors);
	
    validateItems(b2cObj.items, b2cObj.suptype, errors, 'b2c', '');

    if(errors.length > 0){
        statusCd = 0;
        b2cObj.errMessage = errors;
    }
    
    b2cObj.valid = statusCd;
}

function validateAnx1Imp_3B(saveb2bObjArr, rtnprd, gstin){
    
    let statusCd = 1, docRefArr = [];

    saveb2bObjArr.every((saveb2bOb) => {

        let errors = [];

        validateCTIN(saveb2bOb.ctin, gstin, "CTIN" ,errors);

        checkIsNullorEmpty(saveb2bOb.pos, "Place of Supply", errors);

        checkIsNullorEmpty(saveb2bOb.docref, "Docref", errors);
         
        checkIsNullorEmpty(saveb2bOb.docref, "Docref", errors);
        
        checkDuplicateDocRef(saveb2bOb.docref, docRefArr, errors);
        
        checkIsNullorEmpty(saveb2bOb.rst, "Rst", errors);

        checkIsNullorEmpty(saveb2bOb.suptype, "Supply Type", errors);   
        
        validateDocType(saveb2bOb.doctyp, errors);
        
        validateDocumentNumber(saveb2bOb.doc.num, errors, "Document number");

        let isDocDateValid = validate.validateDocumentDate(saveb2bOb.doc.dt, rtnprd, "Document");
        if(isDocDateValid != true){
            errors.push(isDocDateValid);    
        } 

        validateDocumentVal(saveb2bOb.doc.val, errors, "Document");

        validateItems(saveb2bOb.items, saveb2bOb.suptype, errors, "b2b", saveb2bOb.doctyp);
         
        if(errors.length > 0){
            statusCd = 0;
            saveb2bOb.errMessage = errors;
        }
		return true;        
        }
    );      
    saveb2bObjArr.valid = statusCd;
}



function validateAnx1Imp_3L(savemisObjArr, rtnprd, gstin,issez,ret_typ){
    
    let statusCd = 1, docRefArr = [];

    savemisObjArr.every((savemisOb) => {

        let errors = [];

        validateCTIN(savemisOb.ctin, gstin, "CTIN" ,errors);

        checkIsNullorEmpty(savemisOb.pos, "Place of Supply", errors);

        checkIsNullorEmpty(savemisOb.docref, "Docref", errors);
        
        checkDuplicateDocRef(savemisOb.docref, docRefArr, errors);
        
        checkIsNullorEmpty(savemisOb.rst, "Rst", errors);

        checkIsNullorEmpty(savemisOb.suptype, "Supply Type", errors);   
        
        validateDocType(savemisOb.doctyp, errors);
        validateTableRef(savemisOb.tblref,issez,errors);
        
        validateDocumentNumber(savemisOb.doc.num, errors, "Document number");

        let isDocDateValid = validate.validateDocumentDate(savemisOb.doc.dt, rtnprd, "Document",ret_typ);
        if(isDocDateValid != true){
            errors.push(isDocDateValid);    
        } 

        validateDocumentVal(savemisOb.doc.val, errors, "Document");

        validateItems(savemisOb.items, savemisOb.suptype, errors, "mis", savemisOb.doctyp,savemisOb.tblref);
         
        if(errors.length > 0){
            statusCd = 0;
            savemisOb.errMessage = errors;
        }
		return true;        
        }
    );      
    savemisObjArr.valid = statusCd;
}

function validate3cd(expObj, type, rtnprd) {
    
    let errMsg = [], statusCd = 1;

    checkIsNullorEmpty(expObj.docref, "Docref", errMsg);
     
    validateDocumentNumber(expObj.doc.num, errMsg, "Document number");

    let isDocDateValid = validate.validateDocumentDate(expObj.doc.dt, rtnprd, "Document");
    if(isDocDateValid != true){
        errMsg.push(isDocDateValid);    
    } 

    if(expObj.sb.num) {
        validateDocumentNumber(expObj.sb.num, errMsg, "Shipping bill number");
    } 

    if(expObj.sb.dt){
        if(validate.checkFutureDate(expObj.sb.dt)){
            errMsg.push("Shipping bill date cannot be a future date");    
        }
    }

    if(expObj.sb.num || expObj.sb.pcode || expObj.sb.dt) {
        if(!expObj.sb.num && expObj.sb.num != 0){
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");    
        }

        if(!expObj.sb.pcode && expObj.sb.pcode != 0){
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");    
        }

        if(!expObj.sb.dt){
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");    
        }
    }

    if(expObj.sb.pcode && expObj.sb.pcode.length > 6){
        errMsg.push("Port code format is incorrect");
    }

    checkIsNullorEmpty(expObj.exptype, "Export type", errMsg);

    validateDocType(expObj.doctyp, errMsg);

    validateDocumentVal(expObj.doc.val, errMsg, "Document");

    validateItems(expObj.items, expObj.suptype, errMsg, type, expObj.doctyp);
    
    if(errMsg.length > 0){
        statusCd = 0;
        expObj.errMessage = errMsg;
    }
    expObj.valid = statusCd;
}

function validateAnx1Imp_3J(impg, rtnprd) {
    
    let errMsg = [], statusCd = 1;

    checkIsNullorEmpty(impg.pos, "Place of Supply", errMsg);
    if(errMsg.length > 0){
        statusCd = 0;
        impg.errMessage = errMsg;
    }

	impg.docs.every((doc) => {
            let message = [];

            validateDocType(doc.doctyp, message);

			if(!doc.docref){
				resMsg.message.push("Docref is mandatory in request body");
			} 

            validateDocumentNumber(doc.boe.num, message, "Bill of Entry number");

            validateDocumentVal(doc.boe.val, message, "Bill of Entry");

            let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Bill of Entry");
            if(isDocDateValid != true){
                message.push(isDocDateValid);    
            } 

            checkIsNullorEmpty(doc.boe.pcode, 'Port Code', message);

			if(doc.boe.pcode && doc.boe.pcode.length > 6) {
				message.push("Port Code can only be a maximum of 6 digits");            
            } 				
            
            validateItems(doc.items, impg.suptyp, message, 'impg', doc.doctyp);
            
            if(message.length > 0){
                statusCd = 0;
                doc.errMessage = message;
            }
			return true;
		}
	);
    impg.valid = statusCd;
}

function validateAnx1Imp_3I(imps) {
    let statusCd = 1, message = [];
    
    validateItems(imps.items, imps.suptype, message, 'imps', '');
    
    if(message.length > 0){
        statusCd = 0;
        imps.errMessage = message;
    }
    imps.valid = statusCd;
}

function validateAnx1Imp_tab4(ecom) {
    let statusCd = 1, message = [];

    checkIsNullorEmpty(ecom.docref, "Docref", message);

    checkIsNullorEmpty(ecom.etin, "ETIN", message);
    
    if(ecom.etin && (ecom.etin.length != 15 || ecom.etin[13] != 'C')){
        message.push("E-commerce GSTIN is invalid");
    }

	if(!ecom.sup && ecom.sup != 0) {
        message.push("Supplies made is mandatory in request body");
    } 
	if(!ecom.supr && ecom.supr != 0) {
        message.push("Supplies returned is mandatory in request body");
    } 
	if(!ecom.nsup && ecom.nsup != 0) {
        message.push("Net Supplies is mandatory in request body");
    } 
	if(!ecom.igst && !ecom.cgst && !ecom.sgst) {
        message.push("All the tax values cannot be empty. Please enter atleast one from igst, cgst and sgst");
    }

    if((ecom.cgst && !ecom.sgst) || (!ecom.cgst && ecom.sgst)){
        message.push("Both CGST and SGST are mandatory");
    }

    if(ecom.cgst && ecom.sgst && ecom.cgst != ecom.sgst){
        message.push("CGST and SGST value must be equal");
    }

    if(message.length > 0){
        statusCd = 0;
        ecom.errMessage = message;
    }
    ecom.valid = statusCd;
}

function validateAnx1Imp_3K(gstin, impgsez, rtnprd) {
    let resMsg = [], statusCd = 1;
    if(!impgsez.ctin) {
        resMsg.push("CTIN should not be null or empty");
    } else if(impgsez.ctin == gstin) {
        resMsg.push("CTIN should not be the same as the GSTIN");
    } 
        if(resMsg.length > 0){
            statusCd = 0;
            impgsez.errMessage = resMsg;
        }

        impgsez.docs.every((doc) => { 
            let message = [];

            checkIsNullorEmpty(doc.pos, 'Place of supply', message);
            
            if(!doc.docref) {
                message.push("Docref should not be null or empty");
            } 
                
            validateDocType(doc.doctyp, message);

            checkIsNullorEmpty(doc.suptyp, 'Supply type', message);

            if(doc.suptyp.toUpperCase() != 'INTER-STATE') {
                message.push("Supply type should be Inter-State");
            } 
            
            validateDocumentNumber(doc.boe.num, message, "Bill of entry number");
            
            let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Bill of Entry");
            
            if(isDocDateValid != true){
                message.push(isDocDateValid);    
            } 

            validateDocumentVal(doc.boe.val, message, "Bill of entry");

            if(doc.boe.pcode && (doc.boe.pcode.length > 6 || !doc.boe.pcode.match(/^[A-Za-z0-9]+$/))) {
                message.push("Port Code is invalid");            
            } 
            
            validateItems(doc.items, doc.suptyp, message, 'impgsez', doc.doctyp);
            
            if(message.length > 0){
                statusCd = 0;
                doc.errMessage = message;
            }
            return true;
        }
		);
   impgsez.valid = statusCd;
}

function validate3EFor3G(sezObj, gstin, type, rtnprd){

    // console.log("Entering validate3EFor3G for type :" + type);
    let statusCd = 1, docRefArr = [];

    sezObj.every((obj) => {
        let message = [];

        validateCTIN(obj.ctin, gstin,"CTIN" ,message);

        checkIsNullorEmpty(obj.pos, "Place of Supply", message);

        checkDuplicateDocRef(obj.docref, docRefArr, message);
         
        validateDocType(obj.doctyp, message);

        validateDocumentNumber(obj.doc_num, message, "Document number");
        
        let isDocDateValid = validate.validateDocumentDate(obj.doc_date, rtnprd, "Document");
        if(isDocDateValid != true){
            message.push(isDocDateValid);    
        } 

        validateDocumentVal(obj.doc_val, message, "Document");
        
        if(type === 'sezwp' && !obj.clmrfnd){
            message.push("Claim Refund should not be null or empty when Payment Type is SEZ Supplies with Payment of Tax");
        } 
        else if(type === 'sezwp' && obj.clmrfnd != 'Y' && obj.clmrfnd != 'N'){
            message.push("Claim Refund should be Y or N");    
        } 

        if(type === 'de' && !obj.clmrfnd){
            message.push("Claim Refund should not be null or empty");    
        }
        
        if(type === 'de' && obj.sec7act != 'Y' && obj.sec7act != 'N'){
            // console.log("obj.sec7act - " + obj.sec7act);
            message.push("Supply covered under sec 7 of IGST Act should be Y or N"); 
        }

        validateItems(obj.items, obj.supply_type, message, type, obj.doctyp);
        
        if(message.length > 0){
            statusCd = 0;
            obj.errMessage = message;
        }
        return true;
    });     
    
    sezObj.valid = statusCd;
    // console.log("Exiting validate3EFor3G");
}
//3GA Table
function validate3GA(sezObj, gstin, type, rtnprd){

    console.log("Entering validate3EFor3G for type :" + type);
    let statusCd = 1, docRefArr = [];
        let message = [];

        validateCTIN(sezObj.ctin, gstin,"CTIN" ,message);
        validateCTIN(sezObj.rev_ctin, gstin,"REV_CTIN" ,message);

        checkIsNullorEmpty(sezObj.pos, "Place of Supply", message);

        checkDuplicateDocRef(sezObj.docref, docRefArr, message);
         
        validateDocType(sezObj.rev_doctype, message);
        validateDocType(sezObj.doctype, message);

        validateDocumentNumber(sezObj.doc_num, message, "Document number");
        validateDocumentNumber(sezObj.rev_doc_num, message, "Revised Document number");
        
        let isDocDateValid = validate.validateDocumentDate(sezObj.doc_date, rtnprd, "Document");
        if(isDocDateValid != true){
            message.push(isDocDateValid);    
        } 

        validateDocumentVal(sezObj.rev_doc_val, message, "Document");
        
        if(sezObj.rev_sec7 != 'Y' && sezObj.rev_sec7 != 'N'){
           
            message.push("Supply covered under sec 7 of IGST Act should be Y or N"); 
        }

        validateItems(sezObj.items, sezObj.supply_type, message, type, sezObj.rev_doc_type);
        
        if(message.length > 0){
            statusCd = 0;
            sezObj.errMessage = message;
        }
        //return true;
       
    sezObj.valid = statusCd;
    // console.log("Exiting validate3EFor3GA");
}
//SEZA table
function validate3EFA_Imp(obj, gstin, type, rtnprd){

    // console.log("Entering validate3EFor3G for type :" + type);
    let statusCd = 1, docRefArr = [], revDocRefArr = [];

    //sezObj.every((obj) => {
        let message = [];

        validateCTIN(obj.ctin, gstin, "CTIN",message);
        validateCTIN(obj.rev_ctin, gstin, "REVCTIN", message);

        checkIsNullorEmpty(obj.pos, "Place of Supply", message);

        checkDuplicateDocRef(obj.docref, docRefArr, message);
        checkDuplicateDocRef(obj.rev_docref, revDocRefArr, message);
         
        validateDocType(obj.doctyp, message);
        validateDocType(obj.rev_doctyp, message);

        validateDocumentNumber(obj.doc_num, message, "Document number");
        validateDocumentNumber(obj.rev_doc_num, message, "Revised Document number");
        
        var isDocDateValid = validate.validateDocumentDate(obj.doc_date, rtnprd, "Document");
        if(isDocDateValid != true){
            message.push(isDocDateValid);    
        }
        var isDocDateValid = validate.validateDocumentDate(obj.rev_doc_date, rtnprd, " Revised Document");
        if(isDocDateValid != true){
            message.push(isDocDateValid);    
        }  

        validateDocumentVal(obj.rev_doc_val, message, "Document");
        
        if(type === 'sezwpa' && !obj.clmrfnd){
            message.push("Claim Refund should not be null or empty when Payment Type is SEZ Supplies with Payment of Tax");
        } 
        else if(type === 'sezwpa' && obj.clmrfnd != 'Y' && obj.clmrfnd != 'N'){
            message.push("Claim Refund should be Y or N");    
        }

        validateItems(obj.items, obj.rev_supply_type, message, type, obj.rev_doctyp);
        
        if(message.length > 0){
            statusCd = 0;
            obj.errMessage = message;
        }
    //     return true;
    // });     
    
    obj.valid = statusCd;
    // console.log("Exiting validate3EFor3G");
}

/**Amendment table */

function validateAnx1Imp_3BA(saveb2baOb, rtnprd, gstin){
    
    let statusCd = 1, docRefArr = []; revdocRefArr =[];
    
   // saveb2baObjArr.every((saveb2baOb) => {

        let errors = [];

        validateCTIN(saveb2baOb.ctin, gstin,"CTIN", errors);
		
		validateCTIN(saveb2baOb.revctin, gstin,"REVCTIN",errors);

        checkIsNullorEmpty(saveb2baOb.pos, "Place of Supply", errors);

        checkIsNullorEmpty(saveb2baOb.docref, "Docref", errors);
         
        checkIsNullorEmpty(saveb2baOb.revdocref, "RevDocref", errors);
        
        checkDuplicateDocRef(saveb2baOb.docref, docRefArr, errors);
        
        checkIsNullorEmpty(saveb2baOb.rst, "Rst", errors);

        checkIsNullorEmpty(saveb2baOb.suptype, "Supply Type", errors);   
        
        validateDocType(saveb2baOb.doctyp, errors);
		
		validateDocType(saveb2baOb.revdoctyp, errors, true);
        
        validateDocumentNumber(saveb2baOb.doc.num, errors, "Revised Document number");
		
		validateDocumentNumber(saveb2baOb.odoc.num, errors, "Document number");

        let isDocDateValid = validate.validateDocumentDate(saveb2baOb.doc.dt, rtnprd, "Revised Document");
        if(isDocDateValid != true){
            errors.push(isDocDateValid);    
        } 
		
		let isRevDocDateValid = validate.validateDocumentDate(saveb2baOb.odoc.dt, rtnprd, "Document");
        if(isRevDocDateValid != true){
            errors.push(isRevDocDateValid);    
        } 

        validateDocumentVal(saveb2baOb.doc.val, errors, "Revised Document");

     
        validateItems(saveb2baOb.items, saveb2baOb.suptype, errors, "b2ba", saveb2baOb.doctyp);
         
        if(errors.length > 0){
            statusCd = 0;
            saveb2baOb.errMessage = errors;
        }
		//return true;        
        //});      
        saveb2baOb.valid = statusCd;
}


function igstCgstSgstValidation(suptype, item, messageArr, isNegativeAllowed, type){

    if(type === 'expwop' || type === 'sezwop' || type==='sezwopa'){  // For expwop, sezwop  - igst, cgst, sgst and cess are not applicable

        if(item.igst) {
            messageArr.push("IGST is not applicable for documents without payment");
        }
        if(item.cgst){
            messageArr.push("CGST is not applicable for documents without payment");
        }
        if(item.sgst){
            messageArr.push("SGST is not applicable for documents without payment");
        }
        if(item.cess){
            messageArr.push("CESS is not applicable for documents without payment");
        }
    } 
    else {
        if(suptype.toUpperCase() === 'INTER-STATE'){
        
            if(!item.igst && item.igst != 0){
                messageArr.push("IGST value should not be empty");
            } 
            else if(item.igst < 0 && isNegativeAllowed === false){
                messageArr.push("IGST value should not be negative");
            }
    
            if(item.cgst || item.sgst){
                messageArr.push("CGST & SGST is not applicable");
            }
        }
        
        if(suptype.toUpperCase() === 'INTRA-STATE'){
            if(!item.cgst && item.cgst != 0){
                messageArr.push("CGST value should not be empty");
            }
            else if(item.cgst < 0 && isNegativeAllowed === false){
                messageArr.push("CGST value should not be negative");
            }
        
            if(!item.sgst && item.sgst != 0){
                messageArr.push("SGST value should not be empty");
            } 
            else if(item.sgst < 0 && isNegativeAllowed === false){
                messageArr.push("SGST value should not be negative");
            }
    
            if(item.cgst && item.sgst && item.cgst != item.sgst){
                messageArr.push("CGST and SGST value must be equal");
            }

            if(item.igst){
                messageArr.push("IGST is not applicable");
            }
        }

        if(item.cess != null && item.cess != undefined && item.cess != '' && item.cess < 0 && isNegativeAllowed === false){
            messageArr.push("CESS value should not be negative");
        }
    }    
}

function validateItems(items, suptype, messageArr, type, docType,tblref){

    let cmpRate = [];
    let isHsnAvailable = false;
    let isHsnMandatory = true;

    let isNegativeAllowed = false;

    if(type === 'b2c' || type === 'b2b' || type === 'rev' || type === 'b2ca'){
        isHsnMandatory = false;
    }
    if(tblref==='3B'){
        isHsnMandatory = false;
    }
    if(type === 'b2c' || type === 'imps' || type === 'rev' || type === 'b2ca'){
        isNegativeAllowed = true;
    }

    items.every((item) => {
        if(!item.txval && item.txval != 0){
            messageArr.push("Taxable value should not be null or empty");
        } 

        else if(item.txval < 0 && isNegativeAllowed === false){
            messageArr.push("Taxable value should not be negative");
        } 
        
        if(item.txval <= 0 && (docType === 'I' || docType === 'B')){
            messageArr.push("Taxable value should be greater than zero");
        } 

        if(!item.hsn && isHsnAvailable === true && isHsnMandatory === false){
            messageArr.push("HSN field should be either entered for all items or should be entered for none");
        } 
    
        if(!item.hsn && isHsnMandatory === true){
            messageArr.push("HSN field should not be null or empty");
        }

        if(item.hsn && !hsnCodeMstr.includes(item.hsn) && !messageArr.includes("Invalid HSN Code")){
            messageArr.push("Invalid HSN Code");
        }

        if(item.hsn){
            isHsnAvailable = true;
        }
    
        if(type != 'imps' && item.hsn && !((item.hsn).match(/^\d{4}$/)) 
        && !((item.hsn).match(/^\d{6}$/)) && !((item.hsn).match(/^\d{8}$/))){
            messageArr.push("Invalid HSN. HSN should be of 4,6 or 8 digits only");
        }  

        if(type === 'imps' && item.hsn && !((item.hsn).match(/^\d{6}$/))){
            messageArr.push("Invalid HSN. HSN should be of 6 digits only");
        }  

        if(item.hsn && item.hsn.indexOf('99') === 0 && item.hsn.length != 6){
            messageArr.push("HSN code starting with 99 should contain 6 digits");
        } 
    
        if(!item.rate && item.rate != 0){
            messageArr.push("Rate should not be null or empty");
        } else if(!dbRates.includes(item.rate)){
            messageArr.push("Rate should not be other than " + dbRates);
        }
        
        if(cmpRate.includes(item.rate) && isHsnAvailable === false && isHsnMandatory === false){
            messageArr.push("Rate should not be repeated as no HSN value is entered");
        } 
        cmpRate.push(item.rate);

        igstCgstSgstValidation(suptype, item, messageArr, isNegativeAllowed, type);      
        
        return true;
    });
}

function validateDocType(docTyp, messageArr, isRevised){

    let field = "Document type";
    if(isRevised && isRevised == true){
        field = "Revised " + field;
    }
    if(!docTyp){
        messageArr.push(field + " should not be null or empty");    
    } else if(!docTypeArr.includes(docTyp)){
        messageArr.push(field + " is invalid");
    }
}
function validateTableRef(tblref,issez, messageArr){
    if(issez==='N' && tblref === '3E'){
        messageArr.push("Invalid 'Supply relates to Table' for non SEZ profile");    
    } 
    else if(issez==='Y' && (tblref === '3B' || tblref === '3G')){
        messageArr.push("Invalid 'Supply relates to Table' for SEZ profile");    
    }else if(!tblrefArr.includes(tblref)){
        console.log('yaha kyu aya')
        messageArr.push("Supply relates to Table is invalid");
    }
}


function validateDocumentNumber(docNum, messageArr, fieldName){
    if(!docNum){
        messageArr.push(fieldName + " should not be null or empty");    
    } else if(!((docNum).match(anx1Const.DOC_NUM_SHIP_BILL_REGEX))){
        messageArr.push(fieldName + " format is incorrect");    
    } 
}


function checkDuplicateDocRef(docRef, docRefArr, messageArr){
  
    if(docRefArr.includes(docRef)){
        messageArr.push("Duplicate documents are not allowed");
    } else {
        docRefArr.push(docRef);
    }
}

function validateCTIN(ctin, gstin ,fieldName , messageArr){
    if(ctin === null || ctin === undefined || ctin === '') {
        messageArr.push(fieldName + "should not be null or empty");
    } 
    else if(ctin.length != 15 || ctin.indexOf('99') === 0){
        messageArr.push("Invalid" + fieldName);
    } 
    else if(ctin.toUpperCase() === gstin.toUpperCase()){
        messageArr.push(fieldName + "should not be the same as GSTIN");
    } 
}


function validateDocumentVal(docVal, messageArr, fieldName){
    
    if(!docVal && docVal != 0){
        messageArr.push(fieldName + " value should not be null or empty");
    } 
    else if(docVal < 0){
        messageArr.push(fieldName + " value should not be negative");    
    } 
}

function validateTradeName(tradeName, messageArr){
    if(tradeName && tradeName.length > 99){
        messageArr.push("TradeName should be of 99 charcters");    
    }
}

// Ammendment Related Methods
function validateAnx1Imp_3AA(b2cObj){
    let errors = [], statusCd = 1;

    checkIsNullorEmpty(b2cObj.pos, "Place of supply", errors);
    
    checkIsNullorEmpty(b2cObj.docref, "Docref", errors);

    checkIsNullorEmpty(b2cObj.rst, "Rst", errors);
    
    checkIsNullorEmpty(b2cObj.suptype, "Supply Type", errors);
	
    validateItems(b2cObj.items, b2cObj.suptype, errors, 'b2ca', '');

    if(errors.length > 0){
        statusCd = 0;
        b2cObj.errMessage = errors;
    }
    
    b2cObj.valid = statusCd;
}

function validate3cda(expObj, type, rtnprd) {
    
    let errMsg = [], statusCd = 1;
    checkIsNullorEmpty(expObj.docref, "Docref", errMsg);
     
    // validateDocumentNumber(expObj.doc.num, errMsg, "Document number");
    validateDocumentNumber(expObj.doc.num, errMsg, "Revised Document number");
    validateDocumentNumber(expObj.odoc.num, errMsg, "Original Document number");
    let isDocDateValid = validate.validateDocumentDate(expObj.doc.dt, rtnprd, "Revised Document");
    if(isDocDateValid != true){
        errMsg.push(isDocDateValid);    
    }
    
    let isODocDateValid = validate.validateDocumentDate(expObj.odoc.dt, rtnprd, "Oringinal Document");
    if(isODocDateValid != true){
        errMsg.push(isODocDateValid);    
    }
    if(expObj.doctyp == 'CR' || expObj.doctyp == 'I') {
        if(validate.checkPriorMonths(expObj.doc.dt, rtnprd)) {
            console.log('method executed');
            errMsg.push("Revised Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd );
        }
    }
    if(expObj.odoctyp == 'CR' || expObj.odoctyp == 'I') {
        if(validate.checkPriorMonths(expObj.odoc.dt, rtnprd)) {
            console.log('method executed');
            errMsg.push("Original Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd );
        }
    }
    if(expObj.sb.num) {
        validateDocumentNumber(expObj.sb.num, errMsg, "Shipping bill number");
    } 
    if(expObj.sb.dt){
        if(validate.checkFutureDate(expObj.sb.dt)){
            errMsg.push("Shipping bill date cannot be a future date");    
        }
    }
    if(expObj.sb.num || expObj.sb.pcode || expObj.sb.dt) {
        if(!expObj.sb.num && expObj.sb.num != 0){
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");    
        }
        if(!expObj.sb.pcode && expObj.sb.pcode != 0){
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");    
        }
        if(!expObj.sb.dt){
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");    
        }
    }
    if(expObj.sb.pcode && expObj.sb.pcode.length > 6){
        errMsg.push("Port code format is incorrect");
    }
    checkIsNullorEmpty(expObj.exptype, "Export type", errMsg);
    validateDocType(expObj.doctyp, errMsg);
    validateDocumentVal(expObj.doc.val, errMsg, "Document");
    validateItems(expObj.items, expObj.suptype, errMsg, type, expObj.doctyp);
    
    if(errMsg.length > 0){
        statusCd = 0;
        expObj.errMessage = errMsg;
    }
    expObj.valid = statusCd;
}

function validateAnx1Imp_3JA(impg, rtnprd) {
    
    let errMsg = [], statusCd = 1;

    checkIsNullorEmpty(impg.pos, "Place of Supply", errMsg);
    if(errMsg.length > 0){
        statusCd = 0;
        impg.errMessage = errMsg;
    }

	impg.docs.every((doc) => {
            let message = [];

            validateDocType(doc.doctyp, message);

			if(!doc.docref){
				resMsg.message.push("Docref is mandatory in request body");
			} 

            validateDocumentNumber(doc.boe.num, message, "Revised Bill of Entry number");
            validateDocumentNumber(doc.oboe.num, message, "Original Bill of Entry number");

            validateDocumentVal(doc.boe.val, message, "Bill of Entry");

            let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Bill of Entry");
            if(isDocDateValid != true){
                message.push(isDocDateValid);    
            } 

            let isODocDateValid = validate.validateDocumentDate(doc.oboe.dt, rtnprd, "Bill of Entry");
            if(isODocDateValid != true){
                message.push(isODocDateValid);    
            } 

            checkIsNullorEmpty(doc.boe.pcode, 'Revised Port Code', message);

			if(doc.boe.pcode && doc.boe.pcode.length > 6) {
				message.push("Port Code can only be a maximum of 6 digits");            
            } 
            
            checkIsNullorEmpty(doc.oboe.pcode, 'Original Port Code', message);

			if(doc.oboe.pcode && doc.oboe.pcode.length > 6) {
				message.push("Port Code can only be a maximum of 6 digits");            
            } 
            
            validateItemsA(doc.items, impg.suptyp, message, 'impga', doc.doctyp);
            
            if(message.length > 0){
                statusCd = 0;
                doc.errMessage = message;
            }
			return true;
		}
	);
    impg.valid = statusCd;
}

function validateAnx1Imp_3KA(gstin, impgsez, rtnprd) {
    let resMsg = [], statusCd = 1;
    if(!impgsez.ctin) {
        resMsg.push("CTIN should not be null or empty");
    } else if(impgsez.ctin == gstin) {
        resMsg.push("CTIN should not be the same as the GSTIN");
    } 
    if(!impgsez.octin) {
        resMsg.push("Original CTIN should not be null or empty");
    } else if(impgsez.octin == gstin) {
        resMsg.push("Original CTIN should not be the same as the GSTIN");
    } 
        if(resMsg.length > 0){
            statusCd = 0;
            impgsez.errMessage = resMsg;
        }

        impgsez.docs.every((doc) => { 
            let message = [];

            checkIsNullorEmpty(doc.pos, 'Place of supply', message);
            
            if(!doc.docref) {
                message.push("Docref should not be null or empty");
            } 
                
            validateDocType(doc.doctyp, message);
            validateDocType(doc.odoctyp, message);

            checkIsNullorEmpty(doc.suptyp, 'Supply type', message);

            if(doc.suptyp.toUpperCase() != 'INTER-STATE') {
                message.push("Supply type should be Inter-State");
            } 
            
            validateDocumentNumber(doc.boe.num, message, "Revised Bill of entry number");
            validateDocumentNumber(doc.oboe.num, message, "Original Bill of entry number");
            
            let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Bill of Entry");
            
            if(isDocDateValid != true){
                message.push(isDocDateValid);    
            } 

            let isODocDateValid = validate.validateDocumentDate(doc.oboe.dt, rtnprd, "Bill of Entry");
            
            if(isODocDateValid != true){
                message.push(isODocDateValid);    
            } 

            validateDocumentVal(doc.boe.val, message, "Bill of entry");

            if(doc.boe.pcode && (doc.boe.pcode.length > 6 || !doc.boe.pcode.match(/^[A-Za-z0-9]+$/))) {
                message.push("Port Code is invalid");            
            } 

            if(doc.oboe.pcode && (doc.oboe.pcode.length > 6 || !doc.oboe.pcode.match(/^[A-Za-z0-9]+$/))) {
                message.push("Original Port Code is invalid");            
            } 
            
            validateItemsA(doc.items, doc.suptyp, message, 'impgseza', doc.doctyp);
            
            if(message.length > 0){
                statusCd = 0;
                doc.errMessage = message;
            }
            return true;
        }
		);
   impgsez.valid = statusCd;
}

function validateItemsA(items, suptype, messageArr, type, docType, tblref) {
    let cmpRate = [];
    let isHsnAvailable = false;
    let isHsnMandatory = true;

    let isNegativeAllowed = false;

    if (type === 'reva' || type === 'b2ca') {
        isHsnMandatory = false;
    }

    if (type === 'impsa' || type === 'reva' || type === 'b2ca') {
        isNegativeAllowed = true;
    }

    items.every((item) => {
        if (!item.txval && item.txval != 0) {
            messageArr.push("Taxable value should not be null or empty");
        }

        else if (item.txval < 0 && isNegativeAllowed === false) {
            messageArr.push("Taxable value should not be negative");
        }

        if (item.txval <= 0 && (docType === 'I' || docType === 'B')) {
            messageArr.push("Taxable value should be greater than zero");
        }

        if (!item.hsn && isHsnAvailable === true && isHsnMandatory === false) {
            messageArr.push("HSN field should be either entered for all items or should be entered for none");
        }

        if (!item.hsn && isHsnMandatory === true) {
            messageArr.push("HSN field should not be null or empty");
        }

        if (item.hsn && !hsnCodeMstr.includes(item.hsn) && !messageArr.includes("Invalid HSN Code")) {
            messageArr.push("Invalid HSN Code");
        }

        if (item.hsn) {
            isHsnAvailable = true;
        }

        if (type != 'impsa' && item.hsn && !((item.hsn).match(/^\d{4}$/))
            && !((item.hsn).match(/^\d{6}$/)) && !((item.hsn).match(/^\d{8}$/))) {
            messageArr.push("Invalid HSN. HSN should be of 4,6 or 8 digits only");
        }

        if (type === 'impsa' && item.hsn && !((item.hsn).match(/^\d{6}$/))) {
            messageArr.push("Invalid HSN. HSN should be of 6 digits only");
        }

        if (item.hsn && item.hsn.indexOf('99') === 0 && item.hsn.length != 6) {
            messageArr.push("HSN code starting with 99 should contain 6 digits");
        }

        if (!item.rate && item.rate != 0) {
            messageArr.push("Rate should not be null or empty");
        } else if (!dbRates.includes(item.rate)) {
            messageArr.push("Rate should not be other than " + dbRates);
        }

        if (cmpRate.includes(item.rate) && isHsnAvailable === false && isHsnMandatory === false) {
            messageArr.push("Rate should not be repeated as no HSN value is entered");
        }
        cmpRate.push(item.rate);

        igstCgstSgstValidation(suptype, item, messageArr, isNegativeAllowed, type);

        return true;
    });
}

function validateAnx1Imp_tab4A(ecom) {
    let statusCd = 1, message = [];

    checkIsNullorEmpty(ecom.docref, "Docref", message);

    checkIsNullorEmpty(ecom.etin, "ETIN", message);
    
    if(ecom.etin && (ecom.etin.length != 15 || ecom.etin[13] != 'C')){
        message.push("E-commerce GSTIN is invalid");
    }

	if(!ecom.sup && ecom.sup != 0) {
        message.push("Supplies made is mandatory in request body");
    } 
	if(!ecom.supr && ecom.supr != 0) {
        message.push("Supplies returned is mandatory in request body");
    } 
	if(!ecom.nsup && ecom.nsup != 0) {
        message.push("Net Supplies is mandatory in request body");
    } 
	if (!ecom.igst && ecom.igst != 0 && !ecom.cgst && ecom.cgst != 0 && !ecom.sgst && ecom.sgst != 0) {
        message.push("All the tax values cannot be empty. Please enter atleast one from igst, cgst and sgst");
    }

    if((ecom.cgst && !ecom.sgst) || (!ecom.cgst && ecom.sgst)){
        message.push("Both CGST and SGST are mandatory");
    }

    if(ecom.cgst && ecom.sgst && ecom.cgst != ecom.sgst){
        message.push("CGST and SGST value must be equal");
    }

    if(message.length > 0){
        statusCd = 0;
        ecom.errMessage = message;
    }
    ecom.valid = statusCd;
}



module.exports = {
    validateAnx1Imp_Header: validateAnx1Imp_Header,
    validateAnx1Imp_3H: validateAnx1Imp_3H,
    validateAnx1Imp_3A: validateAnx1Imp_3A,
    validateAnx1Imp_3B: validateAnx1Imp_3B,
    validate3cd: validate3cd,
	validateAnx1Imp_3J: validateAnx1Imp_3J,
    validateAnx1Imp_3I: validateAnx1Imp_3I,
    validateAnx1Imp_tab4: validateAnx1Imp_tab4,
    validate3EFor3G: validate3EFor3G,
    validateAnx1Imp_3K: validateAnx1Imp_3K,
    setRatesForValidation: setRatesForValidation,
    setHSNMaster : setHSNMaster,
    validate3cda: validate3cda,
    validateAnx1Imp_3AA:validateAnx1Imp_3AA,
    validateAnx1Imp_3L:validateAnx1Imp_3L,
    validateAnx1Imp_3BA : validateAnx1Imp_3BA,
    validate3EFA_Imp:validate3EFA_Imp,
    validate3GA:validate3GA,
    validateAnx1Imp_3KA: validateAnx1Imp_3KA,
    validateAnx1Imp_3JA: validateAnx1Imp_3JA,
    validateAnx1Imp_tab4A:validateAnx1Imp_tab4A
}