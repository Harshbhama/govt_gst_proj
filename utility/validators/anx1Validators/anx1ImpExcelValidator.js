const _ = require("lodash");
const validate = require("../../../utility/validate");
let dbRates = [];
const docTypeArr = ['I', 'CR', 'DR', 'B'];
const tblrefArr = ['3B', '3E', '3G'];
let hsnCodeMstr = [];
let docRefArr = [];
let odocRefArr = [];
let orgdocRefArr = [];
const anx1Const = require('../../../utility/anx1Constants');
let anx1aDao = require('../../../dao/anx1ADao/anx1ADao');
function setRatesForValidation(rates) {
    dbRates = rates;
}

function setHSNMaster(hsnMaster) {
    hsnCodeMstr = hsnMaster;
}

function validateAnx1Imp_Header(req) {
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
    } else if (!(req.headers["rtnprd"] === req.body.rtnprd)) {
        resMsg.message.push("rtnprd in the import file is not matched with the current profile");
    }
    if (!req.body.issez) {
        resMsg.message.push("Is SEZ is mandatory in request body");
    } else if (req.headers["issez"] != req.body.issez) {
        resMsg.message.push("Is SEZ is not matching");
    }
    if (!req.body.profile) {
        resMsg.message.push("Profile type is mandatory in request body");
    } else if (req.headers["profile"] != req.body.profile) {
        resMsg.message.push("Profile is not matching");
    }

    resMsg.statusCd = resMsg.message[0] ? resMsg.statusCd : 1;
    return resMsg;
}

function checkIsNullorEmpty(value, fieldName, messageArr) {
    if (!value) {
        messageArr.push(fieldName + " should not be null or empty");
    }
}

function validateAnx1Imp_3H(revObj, gstin) {
    let resMsg = [];
    let errDocs = [];

    let revErrObj = _.cloneDeep(revObj);

    if (revObj.type && revObj.type != 'P') {
        validateCTIN(revObj.ctin, gstin, resMsg);
    }

    for (let i = 0; i < revObj.docs.length; i++) {
        let doc = revObj.docs[i];
        let errors = [];
        checkIsNullorEmpty(doc.pos, "Place of supply", errors);

        checkIsNullorEmpty(doc.docref, "Docref", errors);

        checkDuplicateDocRef(doc.docref, docRefArr, errors);

        checkIsNullorEmpty(doc.rst, "Rst", errors);

        checkIsNullorEmpty(doc.suptype, "Supply type", errors);

        validateItems(doc.items, doc.suptype, errors, "rev", '');

        if (errors.length > 0) {
            doc.errMessage = errors;
            errDocs.push(doc);
            delete revObj.docs[i];
        }
    }

    if (errDocs.length == 0 && resMsg.length == 0) {
        return "{}";
    } else {
        if (resMsg.length > 0) {
            revErrObj.errMessage = resMsg;
        }
        if (errDocs.length > 0) {
            revErrObj.docs = errDocs;
        }
        return revErrObj;
    }
}
function setDocRefArr(flag) {
    if (flag) {
        docRefArr = [];
    }
}

function setODocRefArr(flag) {
    if (flag) {
        odocRefArr = [];
    }
}

function validateAnx1Imp_3A(b2cObj) {
    let errors = [], statusCd = 1;
    checkIsNullorEmpty(b2cObj.pos, "Place of supply", errors);

    checkIsNullorEmpty(b2cObj.docref, "Docref", errors);

    checkIsNullorEmpty(b2cObj.rst, "Rst", errors);

    checkIsNullorEmpty(b2cObj.suptype, "Supply Type", errors);

    validateItems(b2cObj.items, b2cObj.suptype, errors, 'b2c', '');

    checkDuplicateDocRef(b2cObj.docref, docRefArr, errors);

    if (errors.length > 0) {
        statusCd = 0;
        b2cObj.errMessage = errors;
    }

    b2cObj.valid = statusCd;
}

function validateAnx1Imp_3B(b2bObj, rtnprd, gstin) {

    let statusCd = 1, errors = [];

    validateCTIN(b2bObj.ctin, gstin, errors);

    checkIsNullorEmpty(b2bObj.pos, "Place of Supply", errors);

    checkIsNullorEmpty(b2bObj.docref, "Docref", errors);

    checkIsNullorEmpty(b2bObj.docref, "Docref", errors);

    checkDuplicateDocRef(b2bObj.docref, docRefArr, errors);

    checkIsNullorEmpty(b2bObj.rst, "Rst", errors);

    checkIsNullorEmpty(b2bObj.suptype, "Supply Type", errors);

    validateDocType(b2bObj.doctyp, errors);

    validateDocumentNumber(b2bObj.doc.num, errors, "Document number");

    let isDocDateValid = validate.validateDocumentDate(b2bObj.doc.dt, rtnprd, "Document");
    if (isDocDateValid != true) {
        errors.push(isDocDateValid);
    }

    validateDocumentVal(b2bObj.doc.val, errors, "Document");

    validateItems(b2bObj.items, b2bObj.suptype, errors, "b2b", b2bObj.doctyp);

    if (errors.length > 0) {
        statusCd = 0;
        b2bObj.errMessage = errors;
    }

    b2bObj.valid = statusCd;
}

function validateAnx1Imp_3BA(saveb2baObjArr, rtnprd, gstin) {

    let statusCd = 1;

    let errors = [];

    validateCTIN(saveb2baObjArr.ctin, gstin, errors, "CTIN");

    validateCTIN(saveb2baObjArr.revctin, gstin, errors, "REVCTIN");

    checkIsNullorEmpty(saveb2baObjArr.pos, "Place of Supply", errors);

    checkIsNullorEmpty(saveb2baObjArr.docref, "Docref", errors);

    checkIsNullorEmpty(saveb2baObjArr.revdocref, "RevDocref", errors);

    checkDuplicateDocRef(saveb2baObjArr.docref, docRefArr, errors);

    checkIsNullorEmpty(saveb2baObjArr.rst, "Rst", errors);

    checkIsNullorEmpty(saveb2baObjArr.suptype, "Supply Type", errors);

    validateDocType(saveb2baObjArr.doctyp, errors);

    validateDocType(saveb2baObjArr.revdoctyp, errors);

    validateDocumentNumber(saveb2baObjArr.doc.num, errors, "Revised Document number");

    validateDocumentNumber(saveb2baObjArr.odoc.num, errors, "Document number");

    let isDocDateValid = validate.validateDocumentDate(saveb2baObjArr.doc.dt, rtnprd, "Revised Document");
    if (isDocDateValid != true) {
        errors.push(isDocDateValid);
    }

    let isRevDocDateValid = validate.validateDocumentDate(saveb2baObjArr.odoc.dt, rtnprd, "Document");
    if (isRevDocDateValid != true) {
        errors.push(isRevDocDateValid);
    }

    validateDocumentVal(saveb2baObjArr.doc.val, errors, "Revised Document");


    validateItems(saveb2baObjArr.items, saveb2baObjArr.suptype, errors, "b2ba", saveb2baObjArr.doctyp);

    if (errors.length > 0) {
        statusCd = 0;
        saveb2baObjArr.errMessage = errors;
    }
   // console.log(statusCd)
    saveb2baObjArr.valid = statusCd;
}

function validate3cd(expObj, type, rtnprd) {

    let errMsg = [], statusCd = 1;

    checkIsNullorEmpty(expObj.docref, "Docref", errMsg);
    checkDuplicateDocRef(expObj.docref, docRefArr, errMsg);
    validateDocumentNumber(expObj.doc.num, errMsg, "Document number");

    let isDocDateValid = validate.validateDocumentDate(expObj.doc.dt, rtnprd, "Document");
    if (isDocDateValid != true) {
        errMsg.push(isDocDateValid);
    }

    if (expObj.sb.num) {
        validateDocumentNumber(expObj.sb.num, errMsg, "Shipping bill number");
    }

    if (expObj.sb.dt) {
        if (validate.checkFutureDate(expObj.sb.dt)) {
            errMsg.push("Shipping bill date cannot be a future date");
        }
    }

    if (expObj.sb.num || expObj.sb.pcode || expObj.sb.dt) {
        if (!expObj.sb.num && expObj.sb.num != 0) {
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");
        }

        if (!expObj.sb.pcode && expObj.sb.pcode != 0) {
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");
        }

        if (!expObj.sb.dt) {
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");
        }
    }

    if (expObj.sb.pcode && expObj.sb.pcode.length > 6) {
        errMsg.push("Port code format is incorrect");
    }

    checkIsNullorEmpty(expObj.exptype, "Export type", errMsg);

    validateDocType(expObj.doctyp, errMsg);

    validateDocumentVal(expObj.doc.val, errMsg, "Document");

    validateItems(expObj.items, expObj.suptype, errMsg, type, expObj.doctyp);

    if (errMsg.length > 0) {
        statusCd = 0;
        expObj.errMessage = errMsg;
    }
    expObj.valid = statusCd;
}

function validateAnx1Imp_3J(impg, rtnprd) {

    let errMsg = [], errDocs = [];

    let impgErrObj = _.cloneDeep(impg);

    checkIsNullorEmpty(impg.pos, "Place of Supply", errMsg);

    for (let i = 0; i < impg.docs.length; i++) {
        let doc = impg.docs[i];
        let message = [];

        validateDocType(doc.doctyp, message);

        if (!doc.docref) {
            resMsg.message.push("Docref is mandatory in request body");
        }
        checkDuplicateDocRef(doc.docref, docRefArr, message);
        validateDocumentNumber(doc.boe.num, message, "Bill of Entry number");

        validateDocumentVal(doc.boe.val, message, "Bill of Entry");

        let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Bill of Entry");
        if (isDocDateValid != true) {
            message.push(isDocDateValid);
        }

        checkIsNullorEmpty(doc.boe.pcode, 'Port Code', message);

        if (doc.boe.pcode && doc.boe.pcode.length > 6) {
            message.push("Port Code can only be a maximum of 6 digits");
        }

        validateItems(doc.items, impg.suptyp, message, 'impg', doc.doctyp);

        if (message.length > 0) {
            doc.errMessage = message;
            errDocs.push(doc);
            delete impg.docs[i];
        }
    }

    if (errDocs.length == 0 && errMsg.length == 0) {
        return "{}";
    } else {
        if (errMsg.length > 0) {
            impgErrObj.errMessage = errMsg;
        }
        if (errDocs.length > 0) {
            impgErrObj.docs = errDocs;
        }
        return impgErrObj;
    }
}

function validateAnx1Imp_3I(imps) {
    let statusCd = 1, message = [];

    validateItems(imps.items, imps.suptype, message, 'imps', '');
    checkDuplicateDocRef(imps.docref, docRefArr, message);
    if (message.length > 0) {
        statusCd = 0;
        imps.errMessage = message;
    }
    imps.valid = statusCd;
}

function validateAnx1Imp_tab4(ecom) {
    let statusCd = 1, message = [];

    checkIsNullorEmpty(ecom.docref, "Docref", message);
    checkDuplicateDocRef(ecom.docref, docRefArr, message);

    checkIsNullorEmpty(ecom.etin, "ETIN", message);

    if (ecom.etin && (ecom.etin.length != 15 || ecom.etin[13] != 'C')) {
        message.push("E-commerce GSTIN is invalid");
    }

    if (!ecom.sup && ecom.sup != 0) {
        message.push("Supplies made is mandatory in request body");
    }
    if (!ecom.supr && ecom.supr != 0) {
        message.push("Supplies returned is mandatory in request body");
    }
    if (!ecom.nsup && ecom.nsup != 0) {
        message.push("Net Supplies is mandatory in request body");
    }
    if (!ecom.igst && !ecom.cgst && !ecom.sgst) {
        message.push("All the tax values cannot be empty. Please enter atleast one from igst, cgst and sgst");
    }

    if ((ecom.cgst && !ecom.sgst) || (!ecom.cgst && ecom.sgst)) {
        message.push("Both CGST and SGST are mandatory");
    }

    if (ecom.cgst && ecom.sgst && ecom.cgst != ecom.sgst) {
        message.push("CGST and SGST value must be equal");
    }

    if (message.length > 0) {
        statusCd = 0;
        ecom.errMessage = message;
    }
    ecom.valid = statusCd;
}

function validateAnx1Imp_3K(gstin, impgsez, rtnprd) {
    let resMsg = [];
    let errDocs = [];

    let impgsezErrObj = _.cloneDeep(impgsez);

    validateCTIN(impgsez.ctin, gstin, resMsg);

    for (let i = 0; i < impgsez.docs.length; i++) {

        let doc = impgsez.docs[i];
        let message = [];

        checkIsNullorEmpty(doc.pos, 'Place of supply', message);

        if (!doc.docref) {
            message.push("Docref should not be null or empty");
        }
        checkDuplicateDocRef(doc.docref, docRefArr, message);
        validateDocType(doc.doctyp, message);

        checkIsNullorEmpty(doc.suptyp, 'Supply type', message);

        if (doc.suptyp.toUpperCase() != 'INTER-STATE') {
            message.push("Supply type should be Inter-State");
        }

        validateDocumentNumber(doc.boe.num, message, "Bill of entry number");

        let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Bill of Entry");

        if (isDocDateValid != true) {
            message.push(isDocDateValid);
        }

        validateDocumentVal(doc.boe.val, message, "Bill of entry");

        if (doc.boe.pcode && (doc.boe.pcode.length > 6 || !doc.boe.pcode.match(/^[A-Za-z0-9]+$/))) {
            message.push("Port Code is invalid");
        }

        validateItems(doc.items, doc.suptyp, message, 'impgsez', doc.doctyp);

        if (message.length > 0) {
            doc.errMessage = message;
            errDocs.push(doc);
            delete impgsez.docs[i];
        }
    }

    if (errDocs.length == 0 && resMsg.length == 0) {
        return "{}";
    } else {
        if (resMsg.length > 0) {
            impgsezErrObj.errMessage = resMsg;
        }
        if (errDocs.length > 0) {
            impgsezErrObj.docs = errDocs;
        }
        return impgsezErrObj;
    }

}

function validate3EFor3G(sezObj, gstin, type, rtnprd) {

    // console.log("Entering validate3EFor3G for type :" + type);
    let statusCd = 1;

    sezObj.every((obj) => {

        let message = [];

        validateCTIN(obj.ctin, gstin, message);

        checkIsNullorEmpty(obj.pos, "Place of Supply", message);

        checkDuplicateDocRef(obj.docref, docRefArr, message);

        validateDocType(obj.doctyp, message);

        validateDocumentNumber(obj.doc_num, message, "Document number");

        let isDocDateValid = validate.validateDocumentDate(obj.doc_date, rtnprd, "Document");
        if (isDocDateValid != true) {
            message.push(isDocDateValid);
        }

        validateDocumentVal(obj.doc_val, message, "Document");

        if (type === 'sezwp' && !obj.clmrfnd) {
            message.push("Claim Refund should not be null or empty when Payment Type is SEZ Supplies with Payment of Tax");
        }
        else if (type === 'sezwp' && obj.clmrfnd != 'Y' && obj.clmrfnd != 'N') {
            message.push("Claim Refund should be Y or N");
        }

        if (type === 'de' && !obj.clmrfnd) {
            message.push("Claim Refund should not be null or empty");
        }

        if (type === 'de' && obj.sec7act != 'Y' && obj.sec7act != 'N') {
            // console.log("obj.sec7act - " + obj.sec7act);
            message.push("Supply covered under sec 7 of IGST Act should be Y or N");
        }

        validateItems(obj.items, obj.supply_type, message, type, obj.doctyp);

        if (message.length > 0) {
            statusCd = 0;
            obj.errMessage = message;
        }
        return true;
    });

    sezObj.valid = statusCd;
    // console.log("Exiting validate3EFor3G");
}

function igstCgstSgstValidation(suptype, item, messageArr, isNegativeAllowed, type) {

    if (type === 'expwop' || type === 'sezwop' || type === 'expwopa') {  // For expwop, sezwop  - igst, cgst, sgst and cess are not applicable

        if (item.igst) {
            messageArr.push("IGST is not applicable for documents without payment");
        }
        if (item.cgst) {
            messageArr.push("CGST is not applicable for documents without payment");
        }
        if (item.sgst) {
            messageArr.push("SGST is not applicable for documents without payment");
        }
        if (item.cess) {
            messageArr.push("CESS is not applicable for documents without payment");
        }
    }
    else {
        if (suptype.toUpperCase() === 'INTER-STATE') {

            if (!item.igst && item.igst != 0) {
                messageArr.push("IGST value should not be empty");
            }
            else if (item.igst < 0 && isNegativeAllowed === false) {
                messageArr.push("IGST value should not be negative");
            }

            if (item.cgst || item.sgst) {
                messageArr.push("CGST & SGST is not applicable");
            }
        }

        if (suptype.toUpperCase() === 'INTRA-STATE') {
            if (!item.cgst && item.cgst != 0) {
                messageArr.push("CGST value should not be empty");
            }
            else if (item.cgst < 0 && isNegativeAllowed === false) {
                messageArr.push("CGST value should not be negative");
            }

            if (!item.sgst && item.sgst != 0) {
                messageArr.push("SGST value should not be empty");
            }
            else if (item.sgst < 0 && isNegativeAllowed === false) {
                messageArr.push("SGST value should not be negative");
            }

            if (item.cgst && item.sgst && item.cgst != item.sgst) {
                messageArr.push("CGST and SGST value must be equal");
            }

            if (item.igst) {
                messageArr.push("IGST is not applicable");
            }
        }

        if (item.cess != null && item.cess != undefined && item.cess != '' && item.cess < 0 && isNegativeAllowed === false) {
            messageArr.push("CESS value should not be negative");
        }
    }
}

function validateItems(items, suptype, messageArr, type, docType, tblref) {
    let cmpRate = [];
    let isHsnAvailable = false;
    let isHsnMandatory = true;

    let isNegativeAllowed = false;

    if (type === 'b2c' || type === 'b2b' || type === 'rev') {
        isHsnMandatory = false;
    }

    if (type === 'b2c' || type === 'imps' || type === 'rev') {
        isNegativeAllowed = true;
    }
    if (tblref === '3B') {
        isHsnMandatory = false;
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

        if (type != 'imps' && item.hsn && !((item.hsn).match(/^\d{4}$/))
            && !((item.hsn).match(/^\d{6}$/)) && !((item.hsn).match(/^\d{8}$/))) {
            messageArr.push("Invalid HSN. HSN should be of 4,6 or 8 digits only");
        }

        if (type === 'imps' && item.hsn && !((item.hsn).match(/^\d{6}$/))) {
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

function validateDocType(docTyp, messageArr) {
    if (!docTyp) {
        messageArr.push("Document type should not be null or empty");
    } else if (!docTypeArr.includes(docTyp)) {
        messageArr.push("Document type is invalid");
    }
}

function validateDocumentNumber(docNum, messageArr, fieldName) {
    if (!docNum) {
        messageArr.push(fieldName + " should not be null or empty");
    } else if (!((docNum).match(anx1Const.DOC_NUM_SHIP_BILL_REGEX))) {
        messageArr.push(fieldName + " format is incorrect");
    }
}

function validateTableRef(tblref, issez, messageArr) {
    if (issez === 'N' && tblref === '3E') {
        messageArr.push("Invalid 'Supply relates to Table' for non SEZ profile");
    } else if (issez === 'Y' && (tblref === '3B' || tblref === '3G')) {
        messageArr.push("Invalid 'Supply relates to Table' for SEZ profile");
    }
    else if (!tblrefArr.includes(tblref)) {
        messageArr.push("Supply relates to Table is invalid");
    }
}

function checkDuplicateDocRef(docRef, docRefArr, messageArr) {
    if (docRefArr.includes(docRef)) {
        messageArr.push("Duplicate documents are not allowed");
    } else {
        docRefArr.push(docRef);
    }
}

function validateCTIN(ctin, gstin, messageArr, fieldName) {
    if (ctin === null || ctin === undefined || ctin === '') {
        messageArr.push(fieldName + "should not be null or empty");
    }
    else if (ctin.length != 15 || ctin.indexOf('99') === 0) {
        messageArr.push("Invalid" + fieldName);
    }
    else if (ctin.toUpperCase() === gstin.toUpperCase()) {
        messageArr.push(fieldName + "should not be the same as GSTIN");
    }
}

function validateDocumentVal(docVal, messageArr, fieldName) {

    if (!docVal && docVal != 0) {
        messageArr.push(fieldName + " value should not be null or empty");
    }
    else if (docVal < 0) {
        messageArr.push(fieldName + " value should not be negative");
    }
}

function validateTradeName(tradeName, messageArr) {
    if (tradeName && tradeName.length > 99) {
        messageArr.push("TradeName should be of 99 charcters");
    }
}

// Ammendment Related Methods
async function validateAnx1Imp_3AA(gstin, b2cObj) {

    let errors = [], statusCd = 1;
    let itemEFlag = 0;

    checkIsNullorEmpty(b2cObj.pos, "Place of supply", errors);
    checkIsNullorEmpty(b2cObj.docref, "Docref", errors);
    checkIsNullorEmpty(b2cObj.rst, "Rst", errors);
    checkIsNullorEmpty(b2cObj.suptype, "Supply Type", errors);
    checkDuplicateDocRef(b2cObj.docref, docRefArr, errors);

    for (let j = 0; j < b2cObj.items.length; j++) {
        let itm = b2cObj.items[j];
        let itemErrors = [];
        validateItemsAItem(itm, b2cObj.suptype, itemErrors, "b2ca", '');
        if (itemErrors.length > 0) {
            itm.errMessage = itemErrors;
            itemEFlag = 1;
        }
    }
    validateItemRates(b2cObj.items, b2cObj.suptype, errors, 'b2ca', '');
    await checkForFiledStatus(b2cObj.docref, gstin, errors, '3AA');
    if (errors.length > 0 || itemEFlag == 1) {
        statusCd = 0;
        b2cObj.errMessage = errors;
    }
    b2cObj.valid = statusCd;
}

function validateAnx1Imp_3L(misObj, rtnprd, gstin, issez, ret_typ) {
    let statusCd = 1;
    let errors = [];
    validateCTIN(misObj.ctin, gstin, errors);

    checkIsNullorEmpty(misObj.pos, "Place of Supply", errors);

    checkIsNullorEmpty(misObj.docref, "Docref", errors);

    checkDuplicateDocRef(misObj.docref, docRefArr, errors);

    checkIsNullorEmpty(misObj.rst, "Rst", errors);

    checkIsNullorEmpty(misObj.suptype, "Supply Type", errors);

    validateDocType(misObj.doctyp, errors);

    validateDocumentNumber(misObj.doc.num, errors, "Document number");

    validateTableRef(misObj.tblref, issez, errors);

    let isDocDateValid = validate.validateDocumentDate(misObj.doc.dt, rtnprd, "Document", ret_typ);
    if (isDocDateValid != true) {
        errors.push(isDocDateValid);
    }

    validateDocumentVal(misObj.doc.val, errors, "Document");

    validateItems(misObj.items, misObj.suptype, errors, "mis", misObj.doctyp, misObj.tblref);

    if (errors.length > 0) {
        statusCd = 0;
        misObj.errMessage = errors;
    }
    misObj.valid = statusCd;
}

async function validate3cda(gstin, expObj, type, rtnprd) {
    console.log("validate EXPA in anx1ImpExcelcValidator");
    let errMsg = [], statusCd = 1;
    let itemEFlag = 0;
    checkIsNullorEmpty(expObj.docref, "Docref", errMsg);
    checkDuplicateDocRef(expObj.docref, docRefArr, errMsg);
    checkDuplicateODocRef(expObj.odocref, odocRefArr, errMsg);
    validateDocumentNumber(expObj.doc.num, errMsg, "Revised Document number");
    validateDocumentNumber(expObj.odoc.num, errMsg, "Original Document number");

    let isDocDateValid = validate.validateDocumentDate(expObj.doc.dt, rtnprd, "Revised Document");
    if (isDocDateValid != true) {
        errMsg.push(isDocDateValid);
    }

    let isODocDateValid = validate.validateDocumentDate(expObj.odoc.dt, rtnprd, "Original Document");
    if (isODocDateValid != true) {
        errMsg.push(isODocDateValid);
    }
    if (expObj.sb.num) {
        validateDocumentNumber(expObj.sb.num, errMsg, "Shipping bill number");
    }
    if (expObj.sb.dt) {
        if (validate.checkFutureDate(expObj.sb.dt)) {
            errMsg.push("Shipping bill date cannot be a future date");
        }
    }
    if (expObj.doctyp == 'CR' || expObj.doctyp == 'I') {
        if (validate.checkPriorMonths(expObj.doc.dt, rtnprd)) {
            errMsg.push("Revised Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd);
        }
    }
    if (expObj.odoctyp == 'CR' || expObj.odoctyp == 'I') {
        if (validate.checkPriorMonths(expObj.odoc.dt, rtnprd)) {
            errMsg.push("Original Document date for Invoice and Credit note cannot be prior to 18 months from selected tax period " + rtnprd);
        }
    }
    if (expObj.sb.num || expObj.sb.pcode || expObj.sb.dt) {
        if (!expObj.sb.num && expObj.sb.num != 0) {
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");
        }
        if (!expObj.sb.pcode && expObj.sb.pcode != 0) {
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");
        }
        if (!expObj.sb.dt) {
            errMsg.push("Either shipping bill number and date and port code should be provided or none of them should be provided");
        }
    }
    if (expObj.sb.pcode && expObj.sb.pcode.length > 6) {
        errMsg.push("Port code format is incorrect");
    }
    checkIsNullorEmpty(expObj.exptype, "Export type", errMsg);
    validateDocType(expObj.doctyp, errMsg);
    validateDocumentVal(expObj.doc.val, errMsg, "Document");

    for (let j = 0; j < expObj.items.length; j++) {
        let itm = expObj.items[j];
        let itemErrors = [];
        validateItemsAItem(itm, expObj.suptype, itemErrors, type, expObj.doctyp);
        if (itemErrors.length > 0) {
            itm.errMessage = itemErrors;
            itemEFlag = 1;
        }
    }
    await checkForFiledStatus(expObj.docref, gstin, errMsg, '3CDA')

    if (errMsg.length > 0 || itemEFlag == 1) {
        statusCd = 0;
        expObj.errMessage = errMsg;
    }
    expObj.valid = statusCd;
}


function checkDuplicateODocRef(odocRef, odocRefArr, messageArr) {
    if (odocRefArr.includes(odocRef)) {
        messageArr.push("Duplicate documents are not allowed");
    } else {
        odocRefArr.push(odocRef);
    }
}

async function validateAnx1Imp_3IA(gstin, imps) {
    let statusCd = 1, message = [];

    let itemEFlag = 0;

    for (let j = 0; j < imps.items.length; j++) {
        let itm = imps.items[j];
        let itemErrors = [];
        validateItemsAItem(itm, imps.suptype, itemErrors, "impsa", '');
        if (itemErrors.length > 0) {
            itm.errMessage = itemErrors;
            itemEFlag = 1;
        }
    }

    checkDuplicateDocRef(imps.docref, docRefArr, message);
    await checkForFiledStatus(imps.docref, gstin, message, '3IA');
    if (message.length > 0 || itemEFlag == 1) {
        statusCd = 0;
        imps.errMessage = message;
    }
    imps.valid = statusCd;

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

async function validateAnx1Imp_3HA(revObj, gstin) {
    let resMsg = [];
    let errDocs = [];
    let itemEFlag = 0;
    let revErrObj = _.cloneDeep(revObj);

    if (revObj.type && revObj.type != 'P') {
        validateCTIN(revObj.ctin, gstin, resMsg, " Supplier GSTIN/PAN");
        validateCtinPattern(revObj.ctin, " Supplier GSTIN/PAN", resMsg)
    }

    for (let i = 0; i < revObj.docs.length; i++) {
        let doc = revObj.docs[i];
        let errors = [];
        validatePosPattern(doc.pos, "Place of supply", errors);
        checkIsNullorEmpty(doc.pos, "Place of supply", errors);

        checkIsNullorEmpty(doc.docref, "Docref", errors);

        checkDuplicateDocRef(doc.docref, docRefArr, errors);

        checkIsNullorEmpty(doc.rst, "Rst", errors);

        checkIsNullorEmpty(doc.suptype, "Supply type", errors);

        for (let j = 0; j < doc.items.length; j++) {
            let itemErrors = [];
            validateItemsAItem(doc.items[j], doc.suptype, itemErrors, "reva", '');
            if (itemErrors.length > 0) {
                doc.items[j].errMessage = itemErrors;
                itemEFlag = 1;
            }
        }
        validateItemRates(doc.items, doc.supply_type, errors, "reva", '');
        await checkForFiledStatus(doc.docref, gstin, errors, '3HA');
        if (errors.length > 0 || itemEFlag == 1) {
            doc.errMessage = errors;
            errDocs.push(doc);
            delete revObj.docs[i];
        }
    }

    if (errDocs.length == 0 && resMsg.length == 0) {
        return "{}";
    } else {
        if (resMsg.length > 0) {
            revErrObj.errMessage = resMsg;
        }
        if (errDocs.length > 0) {
            revErrObj.docs = errDocs;
        }
        return revErrObj;
    }
}

async function validateAnx1Imp_3JA(impg, rtnprd, gstin) {
    let errMsg = [], errDocs = [];
    let impgErrObj = _.cloneDeep(impg);
    let itemEFlag = 0;
    checkIsNullorEmpty(impg.pos, "Place of Supply", errMsg);
    for (let i = 0; i < impg.docs.length; i++) {
        let doc = impg.docs[i];
        let message = [];

        validateDocType(doc.doctyp, message);
        if (!doc.docref) {
            resMsg.message.push("Docref is mandatory in request body");
        }
        checkDuplicateOrgDocRef(doc.odocref, orgdocRefArr, message);
        checkDuplicateDocRef(doc.docref, docRefArr, message);

        validateDocumentNumber(doc.boe.num, message, "Revised Bill of Entry number");
        validateDocumentNumber(doc.oboe.num, message, "Original Bill of Entry number");
        validateDocumentVal(doc.boe.val, message, "Bill of Entry");
        let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Revised Bill of Entry");
        if (isDocDateValid != true) {
            message.push(isDocDateValid);
        }
        let isODocDateValid = validate.validateDocumentDate(doc.oboe.dt, rtnprd, "Original Bill of Entry");
        if (isODocDateValid != true) {
            message.push(isODocDateValid);
        }
        checkIsNullorEmpty(doc.boe.pcode, 'Port Code', message);
        if (doc.boe.pcode && doc.boe.pcode.length > 6) {
            message.push("Port Code can only be a maximum of 6 digits");
        }
        checkIsNullorEmpty(doc.oboe.pcode, 'Original Port Code', message);
        if (doc.boe.opcode && doc.oboe.pcode.length > 6) {
            message.push("Original Port Code can only be a maximum of 6 digits");
        }
        for (let j = 0; j < doc.items.length; j++) {
            let itm = doc.items[j];
            let itemErrors = [];
            validateItemsAItem(itm, impg.suptyp, itemErrors, "impga", doc.doctyp);
            if (itemErrors.length > 0) {
                itm.errMessage = itemErrors;
                itemEFlag = 1;
            }
        }
        await checkForFiledStatus(doc.docref, gstin, message, '3JA');
        if (message.length > 0 || itemEFlag == 1) {
            doc.errMessage = message;
            errDocs.push(doc);
            delete impg.docs[i];
        }
    }
    if (errDocs.length == 0 && errMsg.length == 0 && itemEFlag == 0) {
        return "{}";
    } else {
        if (errMsg.length > 0) {
            impgErrObj.errMessage = errMsg;
        }
        if (errDocs.length > 0) {
            impgErrObj.docs = errDocs;
        }
        return impgErrObj;
    }
}


async function validateAnx1Imp_3KA(gstin, impgsez, rtnprd) {
    let resMsg = [];
    let errDocs = [];

    let impgsezErrObj = _.cloneDeep(impgsez);
    let itemEFlag = 0;
    validateCTIN(impgsez.ctin, gstin, resMsg, "Revised Supplier GSTIN ");
    validateCTIN(impgsez.octin, gstin, resMsg, "Original Supplier GSTIN");

    for (let i = 0; i < impgsez.docs.length; i++) {

        let doc = impgsez.docs[i];
        let message = [];

        checkIsNullorEmpty(doc.pos, 'Place of supply', message);

        if (!doc.docref) {
            message.push("Docref should not be null or empty");
        }
        checkDuplicateDocRef(doc.docref, docRefArr, message);
        checkDuplicateOrgDocRef(doc.odocref, orgdocRefArr, message);
        validateDocType(doc.doctyp, message);
        validateDocType(doc.odoctyp, message);

        checkIsNullorEmpty(doc.suptyp, 'Supply type', message);

        if (doc.suptyp.toUpperCase() != 'INTER-STATE') {
            message.push("Supply type should be Inter-State");
        }

        validateDocumentNumber(doc.boe.num, message, "Revised Bill of entry number");
        validateDocumentNumber(doc.oboe.num, message, "Original Bill of entry number");

        let isDocDateValid = validate.validateDocumentDate(doc.boe.dt, rtnprd, "Revised Bill of Entry");

        if (isDocDateValid != true) {
            message.push(isDocDateValid);
        }

        let isODocDateValid = validate.validateDocumentDate(doc.oboe.dt, rtnprd, "Original Bill of Entry");

        if (isODocDateValid != true) {
            message.push(isODocDateValid);
        }

        validateDocumentVal(doc.boe.val, message, "Bill of entry");

        if (doc.boe.pcode && (doc.boe.pcode.length > 6 || !doc.boe.pcode.match(/^[A-Za-z0-9]+$/))) {
            message.push("Revised Port Code is invalid");
        }
        if (doc.oboe.pcode && (doc.oboe.pcode.length > 6 || !doc.oboe.pcode.match(/^[A-Za-z0-9]+$/))) {
            message.push("Original Port Code is invalid");
        }

        for (let j = 0; j < doc.items.length; j++) {
            let itm = doc.items[j];
            let itemErrors = [];
            validateItemsAItem(itm, doc.suptyp, itemErrors, "impgseza", doc.doctyp);
            if (itemErrors.length > 0) {
                itm.errMessage = itemErrors;
                itemEFlag = 1;
            }
        }
        await checkForFiledStatus(doc.docref, gstin, message, '3KA');
        if (message.length > 0 || itemEFlag == 1) {
            doc.errMessage = message;
            errDocs.push(doc);
            delete impgsez.docs[i];
        }
    }

    if (errDocs.length == 0 && resMsg.length == 0 && itemEFlag == 0) {
        return "{}";
    } else {
        if (resMsg.length > 0) {
            impgsezErrObj.errMessage = resMsg;
        }
        if (errDocs.length > 0) {
            impgsezErrObj.docs = errDocs;
        }
        return impgsezErrObj;
    }

}

async function validateAnx1Imp_tab4A(gstin, ecom) {
    let statusCd = 1, message = [];

    checkIsNullorEmpty(ecom.docref, "Docref", message);
    checkDuplicateDocRef(ecom.docref, docRefArr, message);

    checkIsNullorEmpty(ecom.etin, "ETIN", message);

    if (ecom.etin && (ecom.etin.length != 15 || ecom.etin[13] != 'C')) {
        message.push("E-commerce GSTIN is invalid");
    }

    if (!ecom.sup && ecom.sup != 0) {
        message.push("Supplies made is mandatory in request body");
    }
    if (!ecom.supr && ecom.supr != 0) {
        message.push("Supplies returned is mandatory in request body");
    }
    if (!ecom.nsup && ecom.nsup != 0) {
        message.push("Net Supplies is mandatory in request body");
    }
    if (!ecom.igst && ecom.igst != 0 && !ecom.cgst && ecom.cgst != 0 && !ecom.sgst && ecom.sgst != 0) {
        message.push("All the tax values cannot be empty. Please enter atleast one from igst, cgst and sgst");
    }

    if ((ecom.cgst && !ecom.sgst) || (!ecom.cgst && ecom.sgst)) {
        message.push("Both CGST and SGST are mandatory");
    }

    if (ecom.cgst && ecom.sgst && ecom.cgst != ecom.sgst) {
        message.push("CGST and SGST value must be equal");
    }
    await checkForFiledStatus(ecom.docref,gstin,message,'4A');
    if (message.length > 0) {
        statusCd = 0;
        ecom.errMessage = message;
    }
    ecom.valid = statusCd;
}

function checkDuplicateOrgDocRef(odocRef, orgdocRefArr, messageArr) {
    if (orgdocRefArr.includes(odocRef)) {
        messageArr.push("Duplicate documents are not allowed");
    } else {
        orgdocRefArr.push(odocRef);
    }
}
function setOrgDocRefArr(flag) {
    if (flag) {
        orgdocRefArr = [];
    }
}

function validateItemsAItem(item, suptype, messageArr, type, docType, tblref) {
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

}

function validatePosPattern(value, fieldName, messageArr) {

    let posCode = parseInt(value);

    var pos0to37 = (posCode >= 1 && posCode <= 37 && posCode != 28),  // to allows states from 01 to 37

        pos97 = (posCode >= 97 && posCode <= 99);  // to allow 97, 98 and 99

    if (!pos0to37 && !pos97) {

        messageArr.push('Please fill valid ' + fieldName);

    }

}

function validateCtinPattern(value, fieldName, messageArr) {

    if (value.length == 15) {
        let ctin = value;

        if (value && value.indexOf("-") > 0) {
            ctin = value.split("-")[0];
        }

        let posCode = parseInt(ctin);
        var pos0to37 = (posCode >= 1 && posCode <= 37 && posCode != 28),  // to allows states from 01 to 37
            pos97 = (posCode >= 97 && posCode <= 99);  // to allow 97, 98 and 99

        if (!pos0to37 && !pos97) {
            messageArr.push('Please fill valid ' + fieldName);
        }
    }
}

function validateItemRates(items, suptype, messageArr, type, docType, tblref) {

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
        if (item.hsn) {
            isHsnAvailable = true;
        }
        if (!item.hsn && isHsnAvailable === true && isHsnMandatory === false) {
            messageArr.push("HSN field should be either entered for all items or should be entered for none");
        }
        if (cmpRate.includes(item.rate) && isHsnAvailable === false && isHsnMandatory === false) {
            messageArr.push("Rate should not be repeated as no HSN value is entered");
        }
        cmpRate.push(item.rate);
        return true;
    });
}

async function checkForFiledStatus(docref, gstin, messageArr, tabletyp) {
    let result = await anx1aDao.getStatus(gstin, docref, tabletyp);
    if (result.length > 0) {
        if (result[0].FLAG === 'D') {
            messageArr.push("The record is skipped as it is marked for delete");
        }
        else if (result[0].FLAG === 'I' || result[0].FLAG === '') {
            messageArr.push("The record is skipped as it is Invalid / marked as Invalid / marked as undo invalid");
        }
    }
    return messageArr;
 }



module.exports = {
    validateAnx1Imp_Header: validateAnx1Imp_Header,
    validateAnx1Imp_3H: validateAnx1Imp_3H,
    validateAnx1Imp_3A: validateAnx1Imp_3A,
    validateAnx1Imp_3B: validateAnx1Imp_3B,
    validateAnx1Imp_3BA:validateAnx1Imp_3BA,
    validate3cd: validate3cd,
    validateAnx1Imp_3J: validateAnx1Imp_3J,
    validateAnx1Imp_3I: validateAnx1Imp_3I,
    validateAnx1Imp_tab4: validateAnx1Imp_tab4,
    validate3EFor3G: validate3EFor3G,
    validateAnx1Imp_3K: validateAnx1Imp_3K,
    setRatesForValidation: setRatesForValidation,
    setHSNMaster: setHSNMaster,
    setDocRefArr: setDocRefArr,
    validate3cda: validate3cda,
    validateAnx1Imp_3AA: validateAnx1Imp_3AA,
    validateAnx1Imp_3L: validateAnx1Imp_3L,
    setODocRefArr: setODocRefArr,
    validateAnx1Imp_3IA: validateAnx1Imp_3IA,
    validateAnx1Imp_3HA: validateAnx1Imp_3HA,
    validateAnx1Imp_3JA: validateAnx1Imp_3JA,
    validateAnx1Imp_3KA: validateAnx1Imp_3KA,
    validateAnx1Imp_tab4A: validateAnx1Imp_tab4A,
    setOrgDocRefArr: setOrgDocRefArr
}