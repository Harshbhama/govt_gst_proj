const _ = require("lodash");
const path = require("path");
const ExpExcelDao = require("../../dao/anx1Dao/Anx1expDao");
const fs = require('fs');
const impConstants = require('../../utility/impConstants');


async function exportXls(req, res) {

    logger.log("info", "Entering anx1ExpExcelcsvservice.js :: exportXls");
    try {
        let result = await ExpExcelDao.exportXlsDao(req, res)
        logger.log("info", "Exiting anx1ExpExcelcsvservice.js :: exportXls");
        res.status(201).send(result);
    }
    catch (err) {
        logger.log("error", "anx1ExpExcelcsvservice.js :: exportXls :: Error in catch block :: %s", err);
        res.status(500).send(err)
    }
}

async function exportCsv(req, res) {
    try {
        let result = await ExpExcelDao.exportCsvDao(req, res)
        logger.log("info", "Exiting anx1excelcsvService :: exportCsv");

        res.status(201).send(result)

    }
    catch (err) {
        logger.log("error", "anx1excelcsvService :: exportCsv :: Error in catch block :: %s", err);
        res.status(500).send(err)
    }
}

async function DownloaderrJson(req, res) {

    logger.log("info", "Entering anx1ExpExcelcsvService.ErrorJson");
    let flag;
    let mandatoryErrFilePath;
    let mandatoryErrJson;

    try {
        flag = req.body.flag;
        mandatoryErr = req.body.isMandatoryErrAvailable;

        if (flag && flag === "schema") {
            let schemaErrPath, schemaErrJson, jsonPayloadPath, jsonPayload;
            schemaErrPath = process.cwd() + `/json/anx1/error_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'schema_error'}.json`;
            schemaErrJson = fs.readFileSync(schemaErrPath, { encoding: 'utf8', flag: 'r' });

            jsonPayloadPath = process.cwd() + `/json/anx1/excel_to_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}.json`;
            jsonPayload = fs.readFileSync(jsonPayloadPath, { encoding: 'utf8', flag: 'r' });

            if (schemaErrJson) {
                schemaErrJson = await convertSchemaJson(JSON.parse(schemaErrJson), JSON.parse(jsonPayload));
                res.status(201).send(schemaErrJson);
            } else {
                res.status(500).send("No Data Found!!");
            }
        } else if (flag && flag === "mandatory") {
            mandatoryErrFilePath = process.cwd() + `/json/anx1/error_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'mandatory_error'}.json`;
            mandatoryErrJson = fs.readFileSync(mandatoryErrFilePath, { encoding: 'utf8', flag: 'r' });

            res.status(201).send(await convertMandatoryErrJsontoExcelObj(mandatoryErrJson));

        }
        else {

            let errorJsonPath, errJson;
            errorJsonPath = process.cwd() + `/json/anx1/error_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'error'}.json`;
            errJson = fs.readFileSync(errorJsonPath, { encoding: 'utf8', flag: 'r' });

            if (errJson && JSON.parse(errJson)) {
                errJson = await convertErrorJson(req, res, JSON.parse(errJson));
                res.status(201).send(errJson);

            } else {
                res.status(500).send("No Data Found!!");
            }
        }
    }
    catch (err) {
        logger.log("error", "anx1ExpExcelcsvService.catch|error|err:%s|", err);
        res.status(500).send(err)
    }
}



function getErrorMessage(fieldName, instance, jsonPayload, Data) {

    let errormsg, sectionName, jsonObj, docObj, itemsObj;
    let ctinIndex, docIndex, itemIndex;
    if (!Data) {
        errormsg = "Please fill valid " + fieldName;
    }
    else if (Data == "") {
        errormsg = fieldName + " should not be blank";
    }
    else {
        errormsg = "Invalid " + fieldName;
    }

    if(instance){
        sectionName = instance[1].substring(0, instance[1].indexOf("["));

        if(sectionName){
            jsonObj = jsonPayload[sectionName];
            ctinIndex = instance[1].substring(instance[1].indexOf("[") + 1, instance[1].length -1);

        if(sectionName === "b2b" || sectionName === "sezwp" || sectionName === "sezwop" || sectionName === "de" || sectionName === "rev" || sectionName === "impgsez" || sectionName === "mis" || sectionName === "impg"){
            
            if(sectionName === "impg") {
                errormsg = errormsg + " corresponding to row where Place of Supply : " +  jsonObj[ctinIndex].pos;
            } else if(sectionName === "mis"){
                errormsg = errormsg + " corresponding to row where Supply relates to Table : " + jsonObj[ctinIndex].tblref + ", GSTIN/UIN of Recipient : " +  jsonObj[ctinIndex].ctin;
            } 
            else {
                errormsg = errormsg + " corresponding to row where GSTIN/UIN of Recipient : " +  jsonObj[ctinIndex].ctin;
            }
                
            if(instance[2] && instance[2].startsWith("doc")){
                docIndex = instance[2].substring(instance[2].indexOf("[") + 1, instance[2].length -1);
                docObj = jsonObj[ctinIndex].docs[docIndex];

                if(sectionName === "rev"){
                    errormsg = errormsg + ", Place of Supply :" + docObj.pos;
                }
                else if(sectionName === "impgsez" || sectionName === "impg"){
                    errormsg = errormsg + ", Bill of Entry number :" + docObj.boe.num + ", Document Type : " + getDocType(docObj.doctyp) + ", Bill of Entry date : " + docObj.boe.dt + ", portCode :" + docObj.boe.pcode ;
                } else {
                    errormsg = errormsg + ", Document Number :" + docObj.doc.num + ", Document Type : " + getDocType(docObj.doctyp) + ", Document Date : " + docObj.doc.dt;
                }           
            }

            if(instance[3] && instance[3].startsWith("items")){
                itemIndex = instance[3].substring(instance[3].indexOf("[") + 1, instance[3].length -1);
                itemsObj = docObj.items[itemIndex];
                errormsg = errormsg + ", Taxable Value :" + itemsObj.txval + ", Rate : " + itemsObj.rate;
            }
        }
        else {
            docObj = jsonObj[ctinIndex];
            if(sectionName === "ecom"){
                errormsg = errormsg + " corresponding to row where GSTIN/UIN of Recipient : " +  docObj.etin + ", Value of supplies made :" + docObj.sup;
            }
            else {
                if(sectionName === "expwp" || sectionName === "expwop"){
                    errormsg = errormsg + " corresponding to row where Document Number :" + docObj.doc.num + ", Document Type : " + getDocType(docObj.doctyp) + ", Document Date : " + docObj.doc.dt;
                }
                else if(sectionName === "imps" || sectionName === "b2c"){
                    errormsg = errormsg + " corresponding to row where Place of Supply :" + docObj.pos;
                }
                if(instance[2] && instance[2].startsWith("items")){
                    itemIndex = instance[2].substring(instance[2].indexOf("[") + 1, instance[2].length -1);
                    itemsObj = docObj.items[itemIndex];
                    errormsg = errormsg + ", Taxable Value :" + itemsObj.txval + ", Rate : " + itemsObj.rate;
                }
            }
        } 
        } 
        
    }
    return errormsg;
}

function getDocType(doctyp){

    if(doctyp){
        switch(doctyp){
            case "I":
                return "Invoice";
            case "C":
                return "Credit Note";
            case "D":
                return "Debit Note";
            case "B":
                return "Bill of Entry";
            default:
                return "";        
        }
    } else {
        return "";
    }
}

async function convertSchemaJson(schemaErrJson, jsonPayload) {

    let initializedConst = impConstants;
    let jsonXcelresponse = [];
    let schemaObj, schPropertyArr;
    let fieldName;
    let errObj;

    let b2b = [], b2c = [], expwp = [], expwop = [], sezwp = [], sezwop = [],
        de = [], rev = [], imps = [], impg = [], impgsez = [], ecom = [], mis = [],
        b2ba = [];



    for (let i = 0; i < schemaErrJson.length; i++) {
        schemaObj = schemaErrJson[i];
        schPropertyArr = schemaObj.property.split(".");
        fieldName = schPropertyArr[schPropertyArr.length - 1];
        if (fieldName === "dt" || fieldName === "num" || fieldName === "val") {
            fieldName = schPropertyArr[schPropertyArr.length - 2] + "." + schPropertyArr[schPropertyArr.length - 1];
        }

        if (schPropertyArr[1].indexOf('rev') == 0 && schemaObj.schema.type == "object") {

            fieldName = Object.keys(schemaObj.instance)[0];

            errObj = {
                FieldName: (initializedConst.schemaObject[fieldName] != undefined && initializedConst.schemaObject[fieldName] != null) ? initializedConst.schemaObject[fieldName] : "",
                //  Data: schemaObj.instance[fieldName] || '0',
                Data: schemaObj.instance[fieldName] || "",

                Error: (schemaObj.message.indexOf("subschema") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                    || (schemaObj.message.indexOf("pattern") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                        || (schemaObj.message.indexOf("value") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                            || (schemaObj.message.indexOf("txval") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                                || (schemaObj.message.indexOf("string") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message

            }

        } else {

            errObj = {
                FieldName: (initializedConst.schemaObject[fieldName] != undefined && initializedConst.schemaObject[fieldName] != null) ? initializedConst.schemaObject[fieldName] : "",
                //Data: schemaObj.instance || '0',
                Data: schemaObj.instance || "",
                Error: (schemaObj.message.indexOf("subschema") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                    || (schemaObj.message.indexOf("pattern") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                        || (schemaObj.message.indexOf("value") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                            || (schemaObj.message.indexOf("txval") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
                                || (schemaObj.message.indexOf("string") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName], schPropertyArr, jsonPayload) : schemaObj.message
            }
            //console.log("Else Data",errObj)
        }
        //console.log("Error Object s", errObj)
        if (schPropertyArr[1].indexOf('b2ba') == 0) {
            b2ba.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('b2b') == 0) {
            b2b.push(errObj);
        } else if (schPropertyArr[1].indexOf('b2c') == 0) {
            b2c.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('expwp') == 0) {
            expwp.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('expwop') == 0) {
            expwop.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('sezwp') == 0) {
            sezwp.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('sezwop') == 0) {
            sezwop.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('de') == 0) {
            de.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('rev') == 0) {
            rev.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('imps') == 0) {
            imps.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('impgsez') == 0) {
            impgsez.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('impg') == 0) {
            impg.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('ecom') == 0) {
            ecom.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('mis') == 0) {
            mis.push(errObj);
        }
    }
    expwp = expwp.concat(expwop);
    sezwp = sezwp.concat(sezwop)
    jsonXcelresponse.push({ b2c: b2c })
    jsonXcelresponse.push({ b2b: b2b })
    jsonXcelresponse.push({ expwp: expwp })
    jsonXcelresponse.push({ ecom: ecom })
    jsonXcelresponse.push({ sezwp: sezwp })
    jsonXcelresponse.push({ de: de })
    jsonXcelresponse.push({ rev: rev })
    jsonXcelresponse.push({ imps: imps })
    jsonXcelresponse.push({ impgsez: impgsez })
    jsonXcelresponse.push({ impg: impg })
    jsonXcelresponse.push({ mis: mis })
    jsonXcelresponse.push({ b2ba: b2ba })
    return jsonXcelresponse;

}

async function convertErrorJson(req, res, errJson) {
    console.log("errJson", JSON.stringify(errJson))
    let b2cOutput = [];
    let statemap = await ExpExcelDao.getStateMap(req, res);

    if (errJson.b2c) {

        let b2cInput = errJson.b2c;

        for (let i = 0; i < b2cInput.length; i++) {
            for (let j = 0; j < b2cInput[i].items.length; j++) {
                let B2cRow = {};
                B2cRow[impConstants.pos] = statemap.get(Number(b2cInput[i].pos));
                B2cRow[impConstants.diff_prcnt] = (b2cInput[i].diffpercnt != undefined && b2cInput[i].diffpercnt != null) ? b2cInput[i].diffpercnt : "";
                B2cRow[impConstants.sup_cov_sec7] = b2cInput[i].sec7act == "Y" ? "Yes" : b2cInput[i].sec7act == "N" ? "No" : b2cInput[i].sec7act;
                B2cRow[impConstants.rate] = (b2cInput[i].items[j].rate != null && b2cInput[i].items[j].rate != undefined) ? b2cInput[i].items[j].rate : "";
                B2cRow[impConstants.taxable_value] = (b2cInput[i].items[j].txval != null && b2cInput[i].items[j].txval != undefined) ? b2cInput[i].items[j].txval : "";
                B2cRow[impConstants.igst] = (b2cInput[i].items[j].igst != null && b2cInput[i].items[j].igst != undefined) ? b2cInput[i].items[j].igst : "";
                B2cRow[impConstants.cgst] = (b2cInput[i].items[j].cgst != null && b2cInput[i].items[j].cgst != undefined) ? b2cInput[i].items[j].cgst : "";
                B2cRow[impConstants.sgst] = (b2cInput[i].items[j].sgst != null && b2cInput[i].items[j].sgst != undefined) ? b2cInput[i].items[j].sgst : "";
                B2cRow[impConstants.cess] = (b2cInput[i].items[j].cess != null && b2cInput[i].items[j].cess != undefined) ? b2cInput[i].items[j].cess : "";

                B2cRow[impConstants.ErrorMessage] = b2cInput[i].errMessage ? b2cInput[i].errMessage.join() : '';

                // if (b2cInput[i].errMessage)
                //   B2cRow[impConstants.ErrorMessage] = b2cInput[i].errMessage.join();

                b2cOutput.push(B2cRow);
            }
        }
    }

    let b2bOutput = [];
    if (errJson.b2b) {

        let b2bInput = errJson.b2b;
        for (let i = 0; i < b2bInput.length; i++) {

            for (let j = 0; j < b2bInput[i].items.length; j++) {
                let B2bRow = {};
                B2bRow[impConstants.ctin_uin_rec] = (b2bInput[i].ctin != undefined && b2bInput[i].ctin != null) ? b2bInput[i].ctin : "";
                B2bRow[impConstants.trade_name] = (b2bInput[i].legaltradename != undefined && b2bInput[i].legaltradename != null) ? b2bInput[i].legaltradename : "";
                B2bRow[impConstants.doc_type] = b2bInput[i].doctyp == "I" ? "Invoice" : b2bInput[i].doctyp == "DR" ? "Debit Note" : b2bInput[i].doctyp == "CR" ? "Credit Note" : b2bInput[i].doctyp;
                B2bRow[impConstants.doc_num] = (b2bInput[i].doc.num != undefined && b2bInput[i].doc.num != null) ? b2bInput[i].doc.num : "";
                B2bRow[impConstants.doc_date] = b2bInput[i].doc_date;
                B2bRow[impConstants.doc_val] = (b2bInput[i].doc.val != undefined && b2bInput[i].doc.val != null) ? b2bInput[i].doc.val : "";
                B2bRow[impConstants.pos] = statemap.get(Number(b2bInput[i].pos));
                B2bRow[impConstants.diff_prcnt] = (b2bInput[i].diffpercnt != undefined && b2bInput[i].diffpercnt != null) ? b2bInput[i].diffpercnt : "";
                B2bRow[impConstants.sup_cov_sec7] = b2bInput[i].sec7act == "Y" ? "Yes" : b2bInput[i].sec7act == "N" ? "No" : b2bInput[i].sec7act;
                B2bRow[impConstants.sup_typ] = (b2bInput[i].suptype != undefined && b2bInput[i].suptype != null) ? b2bInput[i].suptype : "";

                B2bRow[impConstants.hsn_opt] = (b2bInput[i].items[j].hsn != null && b2bInput[i].items[j].hsn != undefined) ? b2bInput[i].items[j].hsn : "";
                B2bRow[impConstants.rate] = (b2bInput[i].items[j].rate != null && b2bInput[i].items[j].rate != undefined) ? b2bInput[i].items[j].rate : "";
                B2bRow[impConstants.taxable_value] = (b2bInput[i].items[j].txval != null && b2bInput[i].items[j].txval != undefined) ? b2bInput[i].items[j].txval : "";
                B2bRow[impConstants.igst] = (b2bInput[i].items[j].igst != null && b2bInput[i].items[j].igst != undefined) ? b2bInput[i].items[j].igst : "";
                B2bRow[impConstants.cgst] = (b2bInput[i].items[j].cgst != null && b2bInput[i].items[j].cgst != undefined) ? b2bInput[i].items[j].cgst : "";
                B2bRow[impConstants.sgst] = (b2bInput[i].items[j].sgst != null && b2bInput[i].items[j].sgst != undefined) ? b2bInput[i].items[j].sgst : "";
                B2bRow[impConstants.cess] = (b2bInput[i].items[j].cess != null && b2bInput[i].items[j].cess != undefined) ? b2bInput[i].items[j].cess : "";

                B2bRow[impConstants.ErrorMessage] = b2bInput[i].errMessage ? b2bInput[i].errMessage.join() : '';

                //    if (b2bInput[i].errMessage)
                //        B2bRow[impConstants.ErrorMessage] = b2bInput[i].errMessage.join();

                b2bOutput.push(B2bRow);
            }
        }
    }

    let expwpOutput = [];
    if (errJson.expwp) {

        let expwpInput = errJson.expwp;
        for (let i = 0; i < expwpInput.length; i++) {
            for (let j = 0; j < expwpInput[i].items.length; j++) {
                let expwpRow = {};
                expwpRow[impConstants.doc_type] = expwpInput[i].doctyp == "I" ? "Invoice" : expwpInput[i].doctyp == "DR" ? "Debit Note" : expwpInput[i].doctyp == "CR" ? "Credit Note" : expwpInput[i].doctyp;
                //expwpRow[impConstants.exp_typ] = (expwpInput[i].exptype != undefined && expwpInput[i].exptype != null) ? expwpInput[i].exptype : "";
                expwpRow[impConstants.exp_typ] = (expwpInput[i].exptype != undefined && expwpInput[i].exptype != null) ? (expwpInput[i].exptype == "EXPWP" ? "WPAY" : (expwpInput[i].exptype == "EXPWOP" ? "WOPAY" :  expwpInput[i].exptype)) : "";
                expwpRow[impConstants.doc_num] = (expwpInput[i].doc.num != undefined && expwpInput[i].doc.num != null) ? expwpInput[i].doc.num : "";
                expwpRow[impConstants.doc_date] = expwpInput[i].doc_date;
                expwpRow[impConstants.doc_val] = (expwpInput[i].doc.val != undefined && expwpInput[i].doc.val != null) ? expwpInput[i].doc.val : "";
                expwpRow[impConstants.pcode_opt] = expwpInput[i].sb ? expwpInput[i].sb.pcode : '';
                expwpRow[impConstants.ship_num] = expwpInput[i].sb ? expwpInput[i].sb.num : '';
                expwpRow[impConstants.ship_date] = expwpInput[i].sb_date;
                expwpRow[impConstants.sup_typ] = (expwpInput[i].suptype != undefined && expwpInput[i].suptype != null) ? expwpInput[i].suptype : "";
                expwpRow[impConstants.hsn_mand] = (expwpInput[i].items[j].hsn != null && expwpInput[i].items[j].hsn != undefined) ? expwpInput[i].items[j].hsn : "";
                expwpRow[impConstants.rate] = (expwpInput[i].items[j].rate != null && expwpInput[i].items[j].rate != undefined) ? expwpInput[i].items[j].rate : "";
                expwpRow[impConstants.taxable_value] = (expwpInput[i].items[j].txval != null && expwpInput[i].items[j].txval != undefined) ? expwpInput[i].items[j].txval : "";
                expwpRow[impConstants.igst] = (expwpInput[i].items[j].igst != null && expwpInput[i].items[j].igst != undefined) ? expwpInput[i].items[j].igst : "";
                expwpRow[impConstants.cgst] = (expwpInput[i].items[j].cgst != null && expwpInput[i].items[j].cgst != undefined) ? expwpInput[i].items[j].cgst : "";
                expwpRow[impConstants.sgst] = (expwpInput[i].items[j].sgst != null && expwpInput[i].items[j].sgst != undefined) ? expwpInput[i].items[j].sgst : "";
                expwpRow[impConstants.cess] = (expwpInput[i].items[j].cess != null && expwpInput[i].items[j].cess != undefined) ? expwpInput[i].items[j].cess : "";

                expwpRow[impConstants.ErrorMessage] = expwpInput[i].errMessage ? expwpInput[i].errMessage.join() : '';
                //   if (expwpInput[i].errMessage)
                //  expwpRow[impConstants.ErrorMessage] = expwpInput[i].errMessage.join();

                expwpOutput.push(expwpRow);
            }
        }
    }

    let expwopOutput = [];
    if (errJson.expwop) {

        let expwopInput = errJson.expwop;
        for (let i = 0; i < expwopInput.length; i++) {
            for (let j = 0; j < expwopInput[i].items.length; j++) {
                let expwopRow = {};
                expwopRow[impConstants.doc_type] = expwopInput[i].doctyp == "I" ? "Invoice" : expwopInput[i].doctyp == "DR" ? "Debit Note" : expwopInput[i].doctyp == "CR" ? "Credit Note" : expwopInput[i].doctyp;
                //expwopRow[impConstants.exp_typ] = (expwopInput[i].exptype != undefined && expwopInput[i].exptype != null) ? expwopInput[i].exptype : "";
                expwopRow[impConstants.exp_typ] = (expwopInput[i].exptype != undefined && expwopInput[i].exptype != null) ? (expwopInput[i].exptype == "EXPWP" ? "WPAY" : (expwopInput[i].exptype == "EXPWOP" ? "WOPAY" :  expwopInput[i].exptype)) : "";
                expwopRow[impConstants.doc_num] = (expwopInput[i].doc.num != undefined && expwopInput[i].doc.num != null) ? expwopInput[i].doc.num : "";
                expwopRow[impConstants.doc_date] = expwopInput[i].doc_date;
                expwopRow[impConstants.doc_val] = (expwopInput[i].doc.val != undefined && expwopInput[i].doc.val != null) ? expwopInput[i].doc.val : "";
                expwopRow[impConstants.pcode_opt] = expwopInput[i].sb ? expwopInput[i].sb.pcode : '';
                expwopRow[impConstants.ship_num] = expwopInput[i].sb ? expwopInput[i].sb.num : '';
                expwopRow[impConstants.ship_date] = expwopInput[i].sb_date;
                expwopRow[impConstants.sup_typ] = (expwopInput[i].suptype != undefined && expwopInput[i].suptype != null) ? expwopInput[i].suptype : "";

                expwopRow[impConstants.hsn_mand] = (expwopInput[i].items[j].hsn != null && expwopInput[i].items[j].hsn != undefined) ? expwopInput[i].items[j].hsn : "";
                expwopRow[impConstants.rate] = (expwopInput[i].items[j].rate != null && expwopInput[i].items[j].rate != undefined) ? expwopInput[i].items[j].rate : "";
                expwopRow[impConstants.taxable_value] = (expwopInput[i].items[j].txval != null && expwopInput[i].items[j].txval != undefined) ? expwopInput[i].items[j].txval : "";
                expwopRow[impConstants.igst] = (expwopInput[i].items[j].igst != null && expwopInput[i].items[j].igst != undefined) ? expwopInput[i].items[j].igst : "";
                expwopRow[impConstants.cgst] = (expwopInput[i].items[j].cgst != null && expwopInput[i].items[j].cgst != undefined) ? expwopInput[i].items[j].cgst : "";
                expwopRow[impConstants.sgst] = (expwopInput[i].items[j].sgst != null && expwopInput[i].items[j].sgst != undefined) ? expwopInput[i].items[j].sgst : "";
                expwopRow[impConstants.cess] = (expwopInput[i].items[j].cess != null && expwopInput[i].items[j].cess != undefined) ? expwopInput[i].items[j].cess : "";

                expwopRow[impConstants.ErrorMessage] = expwopInput[i].errMessage ? expwopInput[i].errMessage.join() : '';

                //  if (expwopInput[i].errMessage)
                //    expwopRow[impConstants.ErrorMessage] = expwopInput[i].errMessage.join();

                expwopOutput.push(expwopRow);
            }
        }
    }

    let ecomOutput = [];
    if (errJson.ecom) {

        let ecomInput = errJson.ecom;
        for (let i = 0; i < ecomInput.length; i++) {
            let ecomRow = {};
            ecomRow[impConstants.ctin_ecom] = (ecomInput[i].etin != undefined && ecomInput[i].etin != null) ? ecomInput[i].etin : "";
            ecomRow[impConstants.trade_name] = (ecomInput[i].trdnm != undefined && ecomInput[i].trdnm != null) ? ecomInput[i].trdnm : "";
            ecomRow[impConstants.val_of_sup] = (ecomInput[i].sup != undefined && ecomInput[i].sup != null) ? ecomInput[i].sup : "";
            ecomRow[impConstants.val_of_ret] = (ecomInput[i].supr != undefined && ecomInput[i].supr != null) ? ecomInput[i].supr : "";
            ecomRow[impConstants.net_val_sup] = (ecomInput[i].nsup != undefined && ecomInput[i].nsup != null) ? ecomInput[i].nsup : "";
            ecomRow[impConstants.igst] = (ecomInput[i].igst != null && ecomInput[i].igst != undefined) ? ecomInput[i].igst : "";
            ecomRow[impConstants.cgst] = (ecomInput[i].cgst != null && ecomInput[i].cgst != undefined) ? ecomInput[i].cgst : "";
            ecomRow[impConstants.sgst] = (ecomInput[i].sgst != null && ecomInput[i].sgst != undefined) ? ecomInput[i].sgst : "";
            ecomRow[impConstants.cess] = (ecomInput[i].cess != null && ecomInput[i].cess != undefined) ? ecomInput[i].cess : "";


            ecomRow[impConstants.ErrorMessage] = ecomInput[i].errMessage ? ecomInput[i].errMessage.join() : '';

            //  if (ecomInput[i].errMessage)
            //    ecomRow[impConstants.ErrorMessage] = ecomInput[i].errMessage.join();

            ecomOutput.push(ecomRow);
        }
    }

    let sezwpOutput = [];
    if (errJson.sezwp) {
        let sezwpInput = errJson.sezwp;

        for (let i = 0; i < sezwpInput.length; i++) {
            for (let j = 0; j < sezwpInput[i].items.length; j++) {
                let sezwpRow = {};

                sezwpRow[impConstants.ctin_rec] = (sezwpInput[i].ctin != undefined && sezwpInput[i].ctin != null) ? sezwpInput[i].ctin : "";
                sezwpRow[impConstants.trade_name] = (sezwpInput[i].legaltradename != undefined && sezwpInput[i].legaltradename != null) ? sezwpInput[i].legaltradename : '';
                sezwpRow[impConstants.doc_type] = sezwpInput[i].doctyp == "I" ? "Invoice" : sezwpInput[i].doctyp == "DR" ? "Debit Note" : sezwpInput[i].doctyp == "CR" ? "Credit Note" : sezwpInput[i].doctyp;
                sezwpRow[impConstants.doc_num] = (sezwpInput[i].doc.num != undefined && sezwpInput[i].doc.num != null) ? sezwpInput[i].doc.num : "";
                sezwpRow[impConstants.doc_date] = (sezwpInput[i].doc.dt != undefined && sezwpInput[i].doc.dt != null) ? sezwpInput[i].doc.dt : "";
                sezwpRow[impConstants.doc_val] = (sezwpInput[i].doc.val != undefined && sezwpInput[i].doc.val != null) ? sezwpInput[i].doc.val : "";
                sezwpRow[impConstants.pos] = statemap.get(Number(sezwpInput[i].pos));
                sezwpRow[impConstants.gst_pay_typ] = (sezwpInput[i].payTyp != undefined && sezwpInput[i].payTyp != null) ? (sezwpInput[i].payTyp == "SEZWP" ? "WPAY" : (sezwpInput[i].payTyp == "SEZWOP" ? "WOPAY" :  sezwpInput[i].payTyp)) : "";
                sezwpRow[impConstants.diff_prcnt] = (sezwpInput[i].diff_percentage != undefined && sezwpInput[i].diff_percentage != null) ? sezwpInput[i].diff_percentage : "";
                sezwpRow[impConstants.clm_rfnd] = sezwpInput[i].clmrfnd == "Y" ? "Yes" : sezwpInput[i].clmrfnd == "N" ? "No" : sezwpInput[i].clmrfnd;
                sezwpRow[impConstants.sup_typ] = (sezwpInput[i].supply_type != undefined && sezwpInput[i].supply_type != null) ? sezwpInput[i].supply_type : "";

                sezwpRow[impConstants.hsn_mand] = (sezwpInput[i].items[j].hsn != null && sezwpInput[i].items[j].hsn != undefined) ? sezwpInput[i].items[j].hsn : "";
                sezwpRow[impConstants.rate] = (sezwpInput[i].items[j].rate != null && sezwpInput[i].items[j].rate != undefined) ? sezwpInput[i].items[j].rate : "";
                sezwpRow[impConstants.taxable_value] = (sezwpInput[i].items[j].txval != null && sezwpInput[i].items[j].txval != undefined) ? sezwpInput[i].items[j].txval : "";
                sezwpRow[impConstants.igst] = (sezwpInput[i].items[j].igst != null && sezwpInput[i].items[j].igst != undefined) ? sezwpInput[i].items[j].igst : "";
                sezwpRow[impConstants.cgst] = (sezwpInput[i].items[j].cgst != null && sezwpInput[i].items[j].cgst != undefined) ? sezwpInput[i].items[j].cgst : "";
                sezwpRow[impConstants.sgst] = (sezwpInput[i].items[j].sgst != null && sezwpInput[i].items[j].sgst != undefined) ? sezwpInput[i].items[j].sgst : "";
                sezwpRow[impConstants.cess] = (sezwpInput[i].items[j].cess != null && sezwpInput[i].items[j].cess != undefined) ? sezwpInput[i].items[j].cess : "";

                sezwpRow[impConstants.ErrorMessage] = sezwpInput[i].errMessage ? sezwpInput[i].errMessage.join() : '';

                // if (sezwpInput[i].errMessage)
                //   sezwpRow[impConstants.ErrorMessage] = sezwpInput[i].errMessage.join();

                sezwpOutput.push(sezwpRow);

            }
        }

    }


    let sezwopOutput = [];
    if (errJson.sezwop) {
        let sezwopInput = errJson.sezwop;
        for (let i = 0; i < sezwopInput.length; i++) {
            for (let j = 0; j < sezwopInput[i].items.length; j++) {
                let sezwopRow = {};
                sezwopRow[impConstants.ctin_rec] = (sezwopInput[i].ctin != undefined && sezwopInput[i].ctin != null) ? sezwopInput[i].ctin : "";
                sezwopRow[impConstants.trade_name] = (sezwopInput[i].legaltradename != null && sezwopInput[i].legaltradename != undefined) ? sezwopInput[i].legaltradename : "";
                sezwopRow[impConstants.doc_type] = sezwopInput[i].doctyp == "I" ? "Invoice" : sezwopInput[i].doctyp == "DR" ? "Debit Note" : sezwopInput[i].doctyp == "CR" ? "Credit Note" : sezwopInput[i].doctyp;
                sezwopRow[impConstants.doc_num] = (sezwopInput[i].doc.num != undefined && sezwopInput[i].doc.num != null) ? sezwopInput[i].doc.num : "";
                sezwopRow[impConstants.doc_date] = (sezwopInput[i].doc.dt != undefined && sezwopInput[i].doc.dt != null) ? sezwopInput[i].doc.dt : "";
                sezwopRow[impConstants.doc_val] = (sezwopInput[i].doc.val != undefined && sezwopInput[i].doc.val != null) ? sezwopInput[i].doc.val : "";
                sezwopRow[impConstants.pos] = statemap.get(Number(sezwopInput[i].pos));
                //sezwopRow[impConstants.gst_pay_typ] = (sezwopInput[i].payTyp != undefined && sezwopInput[i].payTyp != null) ? sezwopInput[i].payTyp : "";
                sezwopRow[impConstants.gst_pay_typ] = (sezwopInput[i].payTyp != undefined && sezwopInput[i].payTyp != null) ? (sezwopInput[i].payTyp == "SEZWP" ? "WPAY" : (sezwopInput[i].payTyp == "SEZWOP" ? "WOPAY" :  sezwopInput[i].payTyp)) : "";
                sezwopRow[impConstants.diff_prcnt] = (sezwopInput[i].diff_percentage != undefined && sezwopInput[i].diff_percentage != null) ? sezwopInput[i].diff_percentage : "";
                sezwopRow[impConstants.clm_rfnd] = (sezwopInput[i].clmrfnd != null && sezwopInput[i].clmrfnd != undefined && sezwopInput[i].clmrfnd != "") ? sezwopInput[i].clmrfnd : "";
                sezwopRow[impConstants.sup_typ] = (sezwopInput[i].supply_type != undefined && sezwopInput[i].supply_type != null) ? sezwopInput[i].supply_type : "";
                sezwopRow[impConstants.hsn_mand] = (sezwopInput[i].items[j].hsn != null && sezwopInput[i].items[j].hsn != undefined) ? sezwopInput[i].items[j].hsn : "";
                sezwopRow[impConstants.rate] = (sezwopInput[i].items[j].rate != null && sezwopInput[i].items[j].rate != undefined) ? sezwopInput[i].items[j].rate : "";
                sezwopRow[impConstants.taxable_value] = (sezwopInput[i].items[j].txval != null && sezwopInput[i].items[j].txval != undefined) ? sezwopInput[i].items[j].txval : "";
                sezwopRow[impConstants.igst] = (sezwopInput[i].items[j].igst != null && sezwopInput[i].items[j].igst != undefined) ? sezwopInput[i].items[j].igst : "";
                sezwopRow[impConstants.cgst] = (sezwopInput[i].items[j].cgst != null && sezwopInput[i].items[j].cgst != undefined) ? sezwopInput[i].items[j].cgst : "";
                sezwopRow[impConstants.sgst] = (sezwopInput[i].items[j].sgst != null && sezwopInput[i].items[j].sgst != undefined) ? sezwopInput[i].items[j].sgst : "";
                sezwopRow[impConstants.cess] = (sezwopInput[i].items[j].cess != null && sezwopInput[i].items[j].cess != undefined) ? sezwopInput[i].items[j].cess : "";

                sezwopRow[impConstants.ErrorMessage] = sezwopInput[i].errMessage ? sezwopInput[i].errMessage.join() : '';

                //  if (sezwopInput[i].errMessage)
                //    sezwopRow[impConstants.ErrorMessage] = sezwopInput[i].errMessage.join();

                sezwopOutput.push(sezwopRow);
            }
        }
    }

    let deOutput = [];
    if (errJson.de) {
        let deInput = errJson.de;
        for (let i = 0; i < deInput.length; i++) {

            for (let j = 0; j < deInput[i].items.length; j++) {

                let deRow = {}
                deRow[impConstants.ctin_uin_rec] = (deInput[i].ctin != undefined && deInput[i].ctin != null) ? deInput[i].ctin : "";
                deRow[impConstants.trade_name] = (deInput[i].legaltradename != undefined && deInput[i].legaltradename != null) ? deInput[i].legaltradename : "";
                deRow[impConstants.doc_type] = deInput[i].doctyp == "I" ? "Invoice" : deInput[i].doctyp == "DR" ? "Debit Note" : deInput[i].doctyp == "CR" ? "Credit Note" : deInput[i].doctyp;
                deRow[impConstants.doc_num] = (deInput[i].doc.num != undefined && deInput[i].doc.num != null) ? deInput[i].doc.num : "";
                deRow[impConstants.doc_date] = (deInput[i].doc.dt != undefined && deInput[i].doc.dt != null) ? deInput[i].doc.dt : "";
                deRow[impConstants.doc_val] = (deInput[i].doc.val != undefined && deInput[i].doc.val != null) ? deInput[i].doc.val : "";
                deRow[impConstants.pos] = statemap.get(Number(deInput[i].pos));
                deRow[impConstants.diff_prcnt] = (deInput[i].diff_percentage != undefined && deInput[i].diff_percentage != null) ? deInput[i].diff_percentage : "";
                deRow[impConstants.sup_cov_sec7] = deInput[i].sec7act == "Y" ? "Yes" : deInput[i].sec7act == "N" ? "No" : deInput[i].sec7act;
                deRow[impConstants.clm_rfnd] = deInput[i].clmrfnd == "Y" ? "Yes" : deInput[i].clmrfnd == "N" ? "No" : deInput[i].clmrfnd;
                deRow[impConstants.sup_typ] = (deInput[i].supply_type != undefined && deInput[i].supply_type != null) ? deInput[i].supply_type : "";

                deRow[impConstants.hsn_mand] = (deInput[i].items[j].hsn != null && deInput[i].items[j].hsn != undefined) ? deInput[i].items[j].hsn : "";
                deRow[impConstants.rate] = (deInput[i].items[j].rate != null && deInput[i].items[j].rate != undefined) ? deInput[i].items[j].rate : "";
                deRow[impConstants.taxable_value] = (deInput[i].items[j].txval != null && deInput[i].items[j].txval != undefined) ? deInput[i].items[j].txval : "";
                deRow[impConstants.igst] = (deInput[i].items[j].igst != null && deInput[i].items[j].igst != undefined) ? deInput[i].items[j].igst : "";
                deRow[impConstants.cgst] = (deInput[i].items[j].cgst != null && deInput[i].items[j].cgst != undefined) ? deInput[i].items[j].cgst : "";
                deRow[impConstants.sgst] = (deInput[i].items[j].sgst != null && deInput[i].items[j].sgst != undefined) ? deInput[i].items[j].sgst : "";
                deRow[impConstants.cess] = (deInput[i].items[j].cess != null && deInput[i].items[j].cess != undefined) ? deInput[i].items[j].cess : "";

                deRow[impConstants.ErrorMessage] = deInput[i].errMessage ? deInput[i].errMessage.join() : '';
                // if (deInput[i].errMessage)
                //   deRow[impConstants.ErrorMessage] = deInput[i].errMessage.join();

                deOutput.push(deRow);
            }
        }
    }

    let revOutput = [];
    if (errJson.rev) {
        let revInput = errJson.rev;

        for (let i = 0; i < revInput.length; i++) {
            for (let x = 0; x < revInput[i].docs.length; x++) {
                let document = revInput[i].docs[x];
                for (let j = 0; j < document.items.length; j++) {
                    let revRow = {};
                    let err = "";
                    revRow[impConstants.ctin_pan_sup] = (revInput[i].ctin != undefined && revInput[i].ctin != null) ? revInput[i].ctin : "";
                    revRow[impConstants.trade_name] = (revInput[i].trdnm != undefined && revInput[i].trdnm != null) ? revInput[i].trdnm : "";
                    revRow[impConstants.pos] = statemap.get(Number(document.pos));
                    revRow[impConstants.diff_prcnt] = (document.diffpercnt != undefined && document.diffpercnt != null) ? document.diffpercnt : "";
                    revRow[impConstants.sup_cov_sec7] = document.sec7act == "Y" ? "Yes" : document.sec7act == "N" ? "No" : document.sec7act;
                    revRow[impConstants.sup_typ] = (document.suptype != undefined && document.suptype != null) ? document.suptype : "";


                    revRow[impConstants.hsn_opt] = (document.items[j].hsn != null && document.items[j].hsn != undefined) ? document.items[j].hsn : "";
                    revRow[impConstants.rate] = (document.items[j].rate != null && document.items[j].rate != undefined) ? document.items[j].rate : "";
                    revRow[impConstants.taxable_value] = (document.items[j].txval != null && document.items[j].txval != undefined) ? document.items[j].txval : "";
                    revRow[impConstants.igst] = (document.items[j].igst != null && document.items[j].igst != undefined) ? document.items[j].igst : "";
                    revRow[impConstants.cgst] = (document.items[j].cgst != null && document.items[j].cgst != undefined) ? document.items[j].cgst : "";
                    revRow[impConstants.sgst] = (document.items[j].sgst != null && document.items[j].sgst != undefined) ? document.items[j].sgst : "";
                    revRow[impConstants.cess] = (document.items[j].cess != null && document.items[j].cess != undefined) ? document.items[j].cess : "";

                    if (document.errMessage)
                        err = document.errMessage.join();

                    if (revInput[i].errMessage)
                        err = err + "," + revInput[i].errMessage.join();

                    if (err.length > 1) {
                        revRow[impConstants.ErrorMessage] = err;
                    } else
                        revRow[impConstants.ErrorMessage] = "";

                    revOutput.push(revRow);
                }
            }
        }
    }

    let impsOutput = [];
    if (errJson.imps) {
        let impsInput = errJson.imps;
        for (let i = 0; i < impsInput.length; i++) {
            for (let j = 0; j < impsInput[i].items.length; j++) {
                let impsRow = {};
                impsRow[impConstants.pos] = statemap.get(Number(impsInput[i].pos));
                impsRow[impConstants.hsn_mand] = (impsInput[i].items[j].hsn != null && impsInput[i].items[j].hsn != undefined) ? impsInput[i].items[j].hsn : "";
                impsRow[impConstants.rate] = (impsInput[i].items[j].rate != null && impsInput[i].items[j].rate != undefined) ? impsInput[i].items[j].rate : "";
                impsRow[impConstants.taxable_value] = (impsInput[i].items[j].txval != null && impsInput[i].items[j].txval != undefined) ? impsInput[i].items[j].txval : "";
                impsRow[impConstants.igst] = (impsInput[i].items[j].igst != null && impsInput[i].items[j].igst != undefined) ? impsInput[i].items[j].igst : "";
                impsRow[impConstants.cgst] = (impsInput[i].items[j].cgst != null && impsInput[i].items[j].cgst != undefined) ? impsInput[i].items[j].cgst : "";
                impsRow[impConstants.sgst] = (impsInput[i].items[j].sgst != null && impsInput[i].items[j].sgst != undefined) ? impsInput[i].items[j].sgst : "";
                impsRow[impConstants.cess] = (impsInput[i].items[j].cess != null && impsInput[i].items[j].cess != undefined) ? impsInput[i].items[j].cess : "";

                impsRow[impConstants.ErrorMessage] = impsInput[i].errMessage ? impsInput[i].errMessage.join() : '';
                //   if (impsInput[i].errMessage)
                //     impsRow[impConstants.ErrorMessage] = impsInput[i].errMessage.join();

                impsOutput.push(impsRow);
            }
        }
    }

    let impgOutput = [];
    if (errJson.impg) {
        let impgInput = errJson.impg;
        for (let i = 0; i < impgInput.length; i++) {
            for (let x = 0; x < impgInput[i].docs.length; x++) {
                let document = impgInput[i].docs[x];

                for (let j = 0; j < document.items.length; j++) {

                let impgRow = {};
                impgRow[impConstants.doc_type] = document.doctyp == "B" ? "Bill of Entry" : document.doctyp;
                impgRow[impConstants.pcode_mand] = document.boe.pcode ? document.boe.pcode : '';
                impgRow[impConstants.boe_num] = document.boe ? document.boe.num : '';
                impgRow[impConstants.boe_date] = document.boe_dt;
                impgRow[impConstants.boe_val] = document.boe ? document.boe.val : '';
                impgRow[impConstants.pos] = statemap.get(Number(impgInput[i].pos));
                impgRow[impConstants.sup_typ] = impgInput[i].suptyp;
                
                impgRow[impConstants.hsn_mand] = (document.items[j].hsn != null && document.items[j].hsn != undefined) ? document.items[j].hsn : "";
                impgRow[impConstants.rate] = (document.items[j].rate != null && document.items[j].rate != undefined) ? document.items[j].rate : "";
                impgRow[impConstants.taxable_value] = (document.items[j].txval != null && document.items[j].txval != undefined) ? document.items[j].txval : "";
                impgRow[impConstants.igst_paid] = (document.items[j].igst != null && document.items[j].igst != undefined) ? document.items[j].igst : "";
                impgRow[impConstants.cgst] = (document.items[j].cgst != null && document.items[j].cgst != undefined) ? document.items[j].cgst : "";
                impgRow[impConstants.sgst] = (document.items[j].sgst != null && document.items[j].sgst != undefined) ? document.items[j].sgst : "";
                impgRow[impConstants.cess_paid] = (document.items[j].cess != null && document.items[j].cess != undefined) ? document.items[j].cess : "";

                impgRow[impConstants.ErrorMessage] = document.errMessage ? document.errMessage.join() : '';
                // if (document.errMessage)
                //   impgRow[impConstants.ErrorMessage] = document.errMessage.join();

                impgOutput.push(impgRow);
                }
            }
        }
    }


    let impgsezOutput = [];
    if (errJson.impgsez) {
        let impgsezInput = errJson.impgsez;

        for (let i = 0; i < impgsezInput.length; i++) {

            for (let x = 0; x < impgsezInput[i].docs.length; x++) {

                let document = impgsezInput[i].docs[x];

                for (let j = 0; j < document.items.length; j++) {
                    let err = "";
                    let impgsezRow = {};

                    impgsezRow[impConstants.ctin_sup] = (impgsezInput[i].ctin !=null && impgsezInput[i].ctin != undefined) ? impgsezInput[i].ctin :"";
                    impgsezRow[impConstants.trade_name] = (impgsezInput[i].legaltradename !=null && impgsezInput[i].legaltradename !=undefined) ? impgsezInput[i].legaltradename:"";

                    impgsezRow[impConstants.doc_type] = document.doctyp == "B" ? "Bill of Entry" : document.doctyp;
                    impgsezRow[impConstants.pcode_mand] = document.boe.pcode ? document.boe.pcode : '';
                    impgsezRow[impConstants.boe_num] = document.boe.num ? document.boe.num : '';
                    impgsezRow[impConstants.boe_date] = document.boe_dt;
                    impgsezRow[impConstants.boe_val] = document.boe.val ? document.boe.val : '';
                    impgsezRow[impConstants.pos] = statemap.get(Number(document.pos));
                    impgsezRow[impConstants.sup_typ] = (document.suptyp !=undefined && document.suptyp !=null) ? document.suptyp:"";

                    impgsezRow[impConstants.hsn_mand] = (document.items[j].hsn != null && document.items[j].hsn != undefined) ? document.items[j].hsn : "";
                    impgsezRow[impConstants.rate] = (document.items[j].rate != null && document.items[j].rate != undefined) ? document.items[j].rate : "";
                    impgsezRow[impConstants.taxable_value] = (document.items[j].txval != null && document.items[j].txval != undefined) ? document.items[j].txval : "";
                    impgsezRow[impConstants.igst_paid] = (document.items[j].igst != null && document.items[j].igst != undefined) ? document.items[j].igst : "";
                    impgsezRow[impConstants.cgst] = (document.items[j].cgst != null && document.items[j].cgst != undefined) ? document.items[j].cgst : "";
                    impgsezRow[impConstants.sgst] = (document.items[j].sgst != null && document.items[j].sgst != undefined) ? document.items[j].sgst : "";
                    impgsezRow[impConstants.cess_paid] = (document.items[j].cess != null && document.items[j].cess != undefined) ? document.items[j].cess : "";

                    if (document.errMessage)
                        err = document.errMessage.join();

                    if (impgsezInput[i].errMessage)
                        err = err + "," + impgsezInput[i].errMessage.join();

                    if (err.length > 1) {
                        impgsezRow[impConstants.ErrorMessage] = err;
                    } else
                        impgsezRow[impConstants.ErrorMessage] = "";

                    impgsezOutput.push(impgsezRow);
                }
            }
        }
    }
    let misOutput = [];
    if (errJson.mis) {

        let misInput = errJson.mis;
        for (let i = 0; i < misInput.length; i++) {

            for (let j = 0; j < misInput[i].items.length; j++) {
                let misRow = {};
                misRow[impConstants.supply_related_to] = misInput[i].tblref == "3B" ? "3B (B2B)" : misInput[i].tblref == "3E" ? "3E (SEZWP)" : misInput[i].tblref == "3G" ? "3G (DE)" : misInput[i].tblref;
                misRow[impConstants.ctin_sup] = (misInput[i].ctin != undefined && misInput[i].ctin != null) ? misInput[i].ctin : "";
                misRow[impConstants.trade_name] = (misInput[i].legaltradename != undefined && misInput[i].legaltradename != null) ? misInput[i].legaltradename : "";
                misRow[impConstants.doc_type] = misInput[i].doctyp == "I" ? "Invoice" : misInput[i].doctyp == "DR" ? "Debit Note" : misInput[i].doctyp == "CR" ? "Credit Note" : misInput[i].doctyp;
                misRow[impConstants.doc_num] = (misInput[i].doc.num != undefined && misInput[i].doc.num != null) ? misInput[i].doc.num : "";
                misRow[impConstants.doc_date] = misInput[i].doc_date;
                misRow[impConstants.doc_val] = (misInput[i].doc.val != undefined && misInput[i].doc.val != null) ? misInput[i].doc.val : "";
                misRow[impConstants.pos] = statemap.get(Number(misInput[i].pos));
                misRow[impConstants.diff_prcnt] = (misInput[i].diffpercnt != undefined && misInput[i].diffpercnt != null) ? misInput[i].diffpercnt : "";
                misRow[impConstants.sup_cov_sec7] = misInput[i].sec7act == "Y" ? "Yes" : misInput[i].sec7act == "N" ? "No" : misInput[i].sec7act;
                misRow[impConstants.sup_eligible_clm_rfnd] = misInput[i].clmrfnd == "Y" ? "Yes" : misInput[i].clmrfnd == "N" ? "No" : misInput[i].clmrfnd;
                //misRow[impConstants.sup_typ] = (misInput[i].suptype != undefined && misInput[i].suptype != null) ? misInput[i].suptype : "";

                misRow[impConstants.hsn_mand] = (misInput[i].items[j].hsn != null && misInput[i].items[j].hsn != undefined) ? misInput[i].items[j].hsn : "";
                misRow[impConstants.rate] = (misInput[i].items[j].rate != null && misInput[i].items[j].rate != undefined) ? misInput[i].items[j].rate : "";
                misRow[impConstants.taxable_value] = (misInput[i].items[j].txval != null && misInput[i].items[j].txval != undefined) ? misInput[i].items[j].txval : "";
                misRow[impConstants.igst] = (misInput[i].items[j].igst != null && misInput[i].items[j].igst != undefined) ? misInput[i].items[j].igst : "";
                misRow[impConstants.cgst] = (misInput[i].items[j].cgst != null && misInput[i].items[j].cgst != undefined) ? misInput[i].items[j].cgst : "";
                misRow[impConstants.sgst] = (misInput[i].items[j].sgst != null && misInput[i].items[j].sgst != undefined) ? misInput[i].items[j].sgst : "";
                misRow[impConstants.cess] = (misInput[i].items[j].cess != null && misInput[i].items[j].cess != undefined) ? misInput[i].items[j].cess : "";

                misRow[impConstants.ErrorMessage] = misInput[i].errMessage ? misInput[i].errMessage.join() : '';

                //    if (b2bInput[i].errMessage)
                //        B2bRow[impConstants.ErrorMessage] = b2bInput[i].errMessage.join();

                misOutput.push(misRow);
            }
        }
    }
    // console.log("impgsezOutput",impgsezOutput)


    let b2baOutput = [];
    if (errJson.b2ba) {
        let b2baInput = errJson.b2ba;
        for (let i = 0; i < b2baInput.length; i++) {

            for (let j = 0; j < b2baInput[i].items.length; j++) {
                let B2baRow = {};

                B2baRow[impConstants.org_ctin_uin_rec] = (b2baInput[i].octin != undefined && b2baInput[i].octin != null) ? b2baInput[i].octin : "";
                B2baRow[impConstants.org_trade_name] = (b2baInput[i].otrdnm != undefined && b2baInput[i].otrdnm != null) ? b2baInput[i].otrdnm : "";
                B2baRow[impConstants.org_doc_type] = b2baInput[i].doctyp == "I" ? "Invoice" : b2baInput[i].doctyp == "DR" ? "Debit Note" : b2baInput[i].doctyp == "CR" ? "Credit Note" : b2baInput[i].doctyp;
                B2baRow[impConstants.org_doc_num] = (b2baInput[i].odoc.num != undefined && b2baInput[i].odoc.num != null) ? b2baInput[i].odoc.num : "";
                B2baRow[impConstants.org_doc_date] = b2baInput[i].odoc.dt;
                B2baRow[impConstants.rev_ctin_uin_rec] = (b2baInput[i].ctin != undefined && b2baInput[i].ctin != null) ? b2baInput[i].ctin : "";
                B2baRow[impConstants.rev_trade_name] = (b2baInput[i].revlegaltradename != undefined && b2baInput[i].revlegaltradename != null) ? b2baInput[i].revlegaltradename : "";
                B2baRow[impConstants.rev_doc_type] = b2baInput[i].revdoctyp == "I" ? "Invoice" : b2baInput[i].revdoctyp == "DR" ? "Debit Note" : b2baInput[i].revdoctyp == "CR" ? "Credit Note" : b2baInput[i].revdoctyp;
                B2baRow[impConstants.rev_doc_num] = (b2baInput[i].doc.num != undefined && b2baInput[i].doc.num != null) ? b2baInput[i].doc.num : "";
                B2baRow[impConstants.rev_doc_date] = b2baInput[i].doc.dt;
                B2baRow[impConstants.doc_val] = (b2baInput[i].doc.val != undefined && b2baInput[i].doc.val != null) ? b2baInput[i].doc.val : "";
                B2baRow[impConstants.pos] = statemap.get(Number(b2baInput[i].pos));
                B2baRow[impConstants.diff_prcnt] = (b2baInput[i].revdiffpercnt != undefined && b2baInput[i].revdiffpercnt != null) ? b2baInput[i].revdiffpercnt : "";
                B2baRow[impConstants.sup_cov_sec7] = b2baInput[i].revsec7act == "Y" ? "Yes" : b2baInput[i].revsec7act == "N" ? "No" : b2baInput[i].revsec7act;
                B2baRow[impConstants.sup_typ] = (b2baInput[i].suptype != undefined && b2baInput[i].suptype != null) ? b2baInput[i].suptype : "";
                B2baRow[impConstants.hsn_opt] = (b2baInput[i].items[j].hsn != null && b2baInput[i].items[j].hsn != undefined) ? b2baInput[i].items[j].hsn : "";
                B2baRow[impConstants.rate] = (b2baInput[i].items[j].rate != null && b2baInput[i].items[j].rate != undefined) ? b2baInput[i].items[j].rate : "";
                B2baRow[impConstants.taxable_value] = (b2baInput[i].items[j].txval != null && b2baInput[i].items[j].txval != undefined) ? b2baInput[i].items[j].txval : "";
                B2baRow[impConstants.igst] = (b2baInput[i].items[j].igst != null && b2baInput[i].items[j].igst != undefined) ? b2baInput[i].items[j].igst : "";
                B2baRow[impConstants.cgst] = (b2baInput[i].items[j].cgst != null && b2baInput[i].items[j].cgst != undefined) ? b2baInput[i].items[j].cgst : "";
                B2baRow[impConstants.sgst] = (b2baInput[i].items[j].sgst != null && b2baInput[i].items[j].sgst != undefined) ? b2baInput[i].items[j].sgst : "";
                B2baRow[impConstants.cess] = (b2baInput[i].items[j].cess != null && b2baInput[i].items[j].cess != undefined) ? b2baInput[i].items[j].cess : "";

                B2baRow[impConstants.ErrorMessage] = b2baInput[i].errMessage ? b2baInput[i].errMessage.join() : '';

                //    if (b2baInput[i].errMessage)
                //        B2baRow[impConstants.ErrorMessage] = b2baInput[i].errMessage.join();

                //console.log("B2baRow ::",B2baRow)
                b2baOutput.push(B2baRow);
            }
        }
    }

    let jsonResponse = [];

    jsonResponse.push({ b2c: b2cOutput })
    jsonResponse.push({ b2b: b2bOutput })
    jsonResponse.push({ expwp: expwpOutput.concat(expwopOutput) })
    jsonResponse.push({ ecom: ecomOutput })
    jsonResponse.push({ sezwp: sezwpOutput.concat(sezwopOutput) })
    jsonResponse.push({ de: deOutput })
    jsonResponse.push({ rev: revOutput })
    jsonResponse.push({ imps: impsOutput })
    jsonResponse.push({ impg: impgOutput })
    jsonResponse.push({ impgsez: impgsezOutput })
    jsonResponse.push({ mis: misOutput })
    jsonResponse.push({ b2ba: b2baOutput })

    return jsonResponse;
    //console.log("Error Excel ::",jsonResponse)

}

async function convertMandatoryErrJsontoExcelObj(mandatoryErrJson) {


    let mandErrObj = JSON.parse(mandatoryErrJson);
  //  console.log("mandErrObj.b2bao ::",mandErrObj.b2bao)

    let jsonmandResponse = [];
    jsonmandResponse.push({ b2c: mandErrObj.b2c })
    jsonmandResponse.push({ b2b: mandErrObj.b2b })
    jsonmandResponse.push({ expwp: mandErrObj.exp })
    jsonmandResponse.push({ ecom: mandErrObj.ecom })
    jsonmandResponse.push({ sezwp: mandErrObj.sez })
    jsonmandResponse.push({ de: mandErrObj.de })
    jsonmandResponse.push({ rev: mandErrObj.rev })
    jsonmandResponse.push({ imps: mandErrObj.imps })
    jsonmandResponse.push({ impg: mandErrObj.impg })
    jsonmandResponse.push({ impgsez: mandErrObj.impgsez })
    jsonmandResponse.push({ mis: mandErrObj.mis })
    jsonmandResponse.push({ b2ba: mandErrObj.b2bao })
   // console.log("jsonmandResponse ::",jsonmandResponse)
    return jsonmandResponse;

}

// *********************************************************************** 
// Ammendment Related Methods
// ***********************************************************************

async function exportXlsA(req, res) {

    logger.log("info", "Entering anx1ExpExcelcsvservice.js :: exportXlsA");
    try {
        let result = await ExpExcelDao.exportXlsADao(req, res)//3AA
        logger.log("info", "Exiting anx1ExpExcelcsvservice.js :: exportXls");
        res.status(201).send(result);
    }
    catch (err) {
        logger.log("error", "anx1ExpExcelcsvservice.js :: exportXlsA :: Error in catch block :: %s", err);
        res.status(500).send(err)
    }
}

async function exportCsvA(req, res) {
    try {
        let result = await ExpExcelDao.exportCsvADao(req, res)
        logger.log("info", "Exiting anx1excelcsvService :: exportCsvA");

        res.status(201).send(result)

    }
    catch (err) {
        logger.log("error", "anx1excelcsvService :: exportCsvA :: Error in catch block :: %s", err);
        res.status(500).send(err)
    }
}

async function DownloaderrJsonA(req, res) {

    logger.log("info", "Entering anx1ExpExcelcsvService.ErrorJsonA");
    let flag;
    let mandatoryErrFilePath;
    let mandatoryErrJson;

    try {
        flag = req.body.flag;
        mandatoryErr = req.body.isMandatoryErrAvailable;

        if (flag && flag === "schema") {
            let schemaerrPath, schemaErrJson;
            schemaerrPath = process.cwd() + `/json/error_json_A/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'schema_error'}.json`;
            schemaErrJson = fs.readFileSync(schemaerrPath, { encoding: 'utf8', flag: 'r' });

            if (schemaErrJson) {
                schemaErrJson = await convertSchemaJsonA(req, res, JSON.parse(schemaErrJson));
                // if(schemaErrJson!=null && schemaErrJson !=undefined){
                //     fs.unlink(schemaerrPath, function (err) {if (err) {console.log("Error while unlinking");        } 
                //       })
                // }
                res.status(201).send(schemaErrJson);
                // console.log("schemaErrJson ::",schemaErrJson)
            } else {
                res.status(500).send("No Data Found!!");
            }
        } else if (flag && flag === "mandatory") {
            mandatoryErrFilePath = process.cwd() + `/json/error_json_A/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'mandatory_error'}.json`;
            mandatoryErrJson = fs.readFileSync(mandatoryErrFilePath, { encoding: 'utf8', flag: 'r' });

            res.status(201).send(await convertMandatoryErrJsontoExcelObjA(mandatoryErrJson));

        }
        else {

            let errorJsonPath, errJson;
            errorJsonPath = process.cwd() + `/json/error_json_A/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'error'}.json`;
            errJson = fs.readFileSync(errorJsonPath, { encoding: 'utf8', flag: 'r' });

            if (errJson && JSON.parse(errJson)) {
                errJson = await convertErrorJsonA(req, res, JSON.parse(errJson));
                //   console.log("Check data ::",errJson)
                // if(errJson!=null && errJson !=undefined){
                //     fs.unlink(errorJsonPath, function (err) {if (err) {console.log("Error while unlinking");} 
                //       })
                // }

                res.status(201).send(errJson);

            } else {
                res.status(500).send("No Data Found!!");
            }
        }
    }
    catch (err) {
        logger.log("error", "anx1ExpExcelcsvService.catch|error|err:%s|", err);
        res.status(500).send(err)
    }
}

async function convertSchemaJsonA(req, res, schemaErrJson) {

    let initializedConst = impConstants;
    let jsonXcelresponse = [];
    let schemaObj, schPropertyArr;
    let fieldName;
    let errObj;

    let b2ca = [], expwpa = [], expwopa = []; reva = []; impsa = []; ecoma = []; impga = []; impgseza = [];

    for (let i = 0; i < schemaErrJson.length; i++) {
        schemaObj = schemaErrJson[i];
        schPropertyArr = schemaObj.property.split(".");
        fieldName = schPropertyArr[schPropertyArr.length - 1];
        if (fieldName === "dt" || fieldName === "num" || fieldName === "val" || fieldName === 'pcode') {
            fieldName = schPropertyArr[schPropertyArr.length - 2] + "." + schPropertyArr[schPropertyArr.length - 1];
        }
        if (fieldName.indexOf('reva') == 0) {
            continue;
        }
        if (schPropertyArr[1].indexOf('reva') == 0 && schemaObj.schema.type == "object") {
            // console.log('reva');
            // if (schPropertyArr[1].indexOf('reva') == 0) {
            fieldName = Object.keys(schemaObj.instance)[0];
            fieldNamev = Object.keys(schemaObj.instance)[0];

            if (fieldName === 'ctin') {
                fieldName = 'pan'
            }

            errObj = {
                FieldName: (initializedConst.schemaObject[fieldName] != undefined && initializedConst.schemaObject[fieldName] != null) ? initializedConst.schemaObject[fieldName] : "",
                //  Data: schemaObj.instance[fieldName] || '0',
                Data: schemaObj.instance[fieldNamev] || "",

                Error: (schemaObj.message.indexOf("subschema") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                    && (schemaObj.message.indexOf("pattern") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                        && (schemaObj.message.indexOf("value") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                            && (schemaObj.message.indexOf("txval") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                                && (schemaObj.message.indexOf("string") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message

            }

        } else {
            // console.log('fieldName', fieldName);
            if (schPropertyArr[1].indexOf('reva') == 0 && fieldName === 'ctin') {
                fieldName = 'pan';
            }
            if (schPropertyArr[1].indexOf('impgseza') == 0 && fieldName === 'boe.dt' || schPropertyArr[1].indexOf('impga') == 0 && fieldName === 'boe.dt') {
                fieldName = 'rev_boe_date';
            }
            if (schPropertyArr[1].indexOf('impgseza') == 0 && fieldName === 'oboe.dt' || schPropertyArr[1].indexOf('impga') == 0 && fieldName === 'oboe.dt') {
                fieldName = 'org_boe_date';
            }
            if(schPropertyArr[1].indexOf('impgseza') == 0 && fieldName === 'boe.pcode' || schPropertyArr[1].indexOf('impga') == 0 && fieldName === 'boe.pcode' ) {
                fieldName = 'rev_pcode';
            }
            if(schPropertyArr[1].indexOf('impgseza') == 0 && fieldName === 'oboe.pcode' || schPropertyArr[1].indexOf('impga') == 0 && fieldName === 'oboe.pcode') {
                fieldName = 'org_pcode';
            }
            if(schPropertyArr[1].indexOf('impgseza') == 0 && fieldName === 'oboe.num' || schPropertyArr[1].indexOf('impga') == 0 && fieldName === 'oboe.num') {
                fieldName = 'org_num';
            }
            if(schPropertyArr[1].indexOf('expwpa') == 0 && fieldName === 'odoc.dt'|| schPropertyArr[1].indexOf('expwopa') == 0 && fieldName === 'odoc.dt') {
                fieldName = 'org_doc_dt';
            }
            if(schPropertyArr[1].indexOf('expwpa') == 0 && fieldName === 'odoc.num'|| schPropertyArr[1].indexOf('expwopa') == 0 && fieldName === 'odoc.num') {
                fieldName = 'org_doc_num';
            }
            if(schPropertyArr[1].indexOf('expwpa') == 0 && fieldName === 'doc.dt'|| schPropertyArr[1].indexOf('expwopa') == 0 && fieldName === 'doc.dt') {
                fieldName = 'rev_doc_dt';
            }
            if(schPropertyArr[1].indexOf('expwpa') == 0 && fieldName === 'doc.num'|| schPropertyArr[1].indexOf('expwopa') == 0 && fieldName === 'doc.num') {
                fieldName = 'rev_doc_num';
            }
            errObj = {
                FieldName: (initializedConst.schemaObject[fieldName] != undefined && initializedConst.schemaObject[fieldName] != null) ? initializedConst.schemaObject[fieldName] : "",
                //Data: schemaObj.instance || '0',
                Data: schemaObj.instance || "",
                Error: (schemaObj.message.indexOf("subschema") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                    && (schemaObj.message.indexOf("pattern") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                        && (schemaObj.message.indexOf("value") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                            && (schemaObj.message.indexOf("txval") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
                                && (schemaObj.message.indexOf("string") > -1) ? getErrorMessage(initializedConst.schemaObject[fieldName]) : schemaObj.message
            }
            // console.log("Else Data",errObj)
        } if (schPropertyArr[1].indexOf('b2ca') == 0) {
            b2ca.push(errObj);
        } else if (schPropertyArr[1].indexOf('expwpa') == 0) {
            expwpa.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('expwopa') == 0) {
            expwopa.push(errObj);
        } else if (schPropertyArr[1].indexOf('reva') == 0) {
            reva.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('impsa') == 0) {
            impsa.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('ecoma') == 0) {
            ecoma.push(errObj);
        } else if (schPropertyArr[1].indexOf('impgseza') == 0) {
            impgseza.push(errObj);
        }
        else if (schPropertyArr[1].indexOf('impga') == 0) {
            impga.push(errObj);
        }
    }
    expwpa = expwpa.concat(expwopa);

    jsonXcelresponse.push({ b2ca: b2ca })
    jsonXcelresponse.push({ expwpa: expwpa })
    jsonXcelresponse.push({ ecoma: ecoma })
    jsonXcelresponse.push({ reva: reva })
    jsonXcelresponse.push({ impsa: impsa })
    jsonXcelresponse.push({ impgseza: impgseza })
    jsonXcelresponse.push({ impga: impga })

    return jsonXcelresponse;
}

async function convertErrorJsonA(req, res, errJson) {

    let b2caOutput = [];
    let statemap = null;
    let dbCache = req.app.get('myCache');
    if (dbCache.get("statemap") != null && dbCache.get("statemap") != undefined && dbCache.get("statemap") != "") {
        statemap = dbCache.get("statemap");
    } else {
        statemap = await ExpExcelDao.getStateMap(req, res);
        
    }

    if (errJson.b2ca) {

        let b2cInput = errJson.b2ca;

        for (let i = 0; i < b2cInput.length; i++) {
            for (let j = 0; j < b2cInput[i].items.length; j++) {
                let B2caRow = {};
                let err = "";
                B2caRow[impConstants.pos] = statemap.get(Number(b2cInput[i].pos));
                B2caRow[impConstants.diff_prcnt] = (b2cInput[i].diffpercnt != undefined && b2cInput[i].diffpercnt != null) ? b2cInput[i].diffpercnt : "";
                B2caRow[impConstants.sup_cov_sec7] = b2cInput[i].sec7act == "Y" ? "Yes" : b2cInput[i].sec7act == "N" ? "No" : b2cInput[i].sec7act;
                B2caRow[impConstants.rate] = (b2cInput[i].items[j].rate != null && b2cInput[i].items[j].rate != undefined) ? b2cInput[i].items[j].rate : "";
                B2caRow[impConstants.taxable_value] = (b2cInput[i].items[j].txval != null && b2cInput[i].items[j].txval != undefined) ? b2cInput[i].items[j].txval : "";
                B2caRow[impConstants.igst] = (b2cInput[i].items[j].igst != null && b2cInput[i].items[j].igst != undefined) ? b2cInput[i].items[j].igst : "";
                B2caRow[impConstants.cgst] = (b2cInput[i].items[j].cgst != null && b2cInput[i].items[j].cgst != undefined) ? b2cInput[i].items[j].cgst : "";
                B2caRow[impConstants.sgst] = (b2cInput[i].items[j].sgst != null && b2cInput[i].items[j].sgst != undefined) ? b2cInput[i].items[j].sgst : "";
                B2caRow[impConstants.cess] = (b2cInput[i].items[j].cess != null && b2cInput[i].items[j].cess != undefined) ? b2cInput[i].items[j].cess : "";

                // B2caRow[impConstants.ErrorMessage] = b2cInput[i].errMessage ? b2cInput[i].errMessage.join() : '';
                if (b2cInput[i].items[j].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + b2cInput[i].items[j].errMessage.join();
                    } else {
                        err = b2cInput[i].items[j].errMessage.join();
                    }
                }

                if (b2cInput[i].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + b2cInput[i].errMessage.join();
                    } else {
                        err = b2cInput[i].errMessage.join();
                    }
                }

                if (err.length > 1) {
                    B2caRow[impConstants.ErrorMessage] = err;
                } else
                    B2caRow[impConstants.ErrorMessage] = "";
                b2caOutput.push(B2caRow);
            }
        }
    }
    let expwpaOutput = [];
    if (errJson.expwpa) {

        let expwpInput = errJson.expwpa;
        for (let i = 0; i < expwpInput.length; i++) {
            for (let j = 0; j < expwpInput[i].items.length; j++) {
                let expwpRow = {};
                let err = "";
                // expwpRow[impConstants.doc_type] = expwpInput[i].doctyp == "I" ? "Invoice" : expwpInput[i].doctyp == "DR" ? "Debit Note" : expwpInput[i].doctyp == "CR" ? "Credit Note" : expwpInput[i].doctyp;
                // expwpRow[impConstants.exp_typ] = (expwpInput[i].exptype != undefined && expwpInput[i].exptype != null) ? expwpInput[i].exptype : "";
                // expwpRow[impConstants.doc_num] = (expwpInput[i].doc.num != undefined && expwpInput[i].doc.num != null) ? expwpInput[i].doc.num : "";
                // expwpRow[impConstants.doc_date] = expwpInput[i].doc_date;
                // expwpRow[impConstants.odoc_type] = expwpInput[i].odoctyp == "I" ? "Invoice" : expwpInput[i].odoctyp == "DR" ? "Debit Note" : expwpInput[i].odoctyp == "CR" ? "Credit Note" : expwpInput[i].odoctyp;
                // expwpRow[impConstants.odoc_num] = (expwpInput[i].odoc.num != undefined && expwpInput[i].odoc.num != null) ? expwpInput[i].odoc.num : "";
                // expwpRow[impConstants.odoc_date] = expwpInput[i].odoc_date;
                // expwpRow[impConstants.doc_val] = (expwpInput[i].doc.val != undefined && expwpInput[i].doc.val != null) ? expwpInput[i].doc.val : "";
                expwpRow[impConstants.odoc_type] = expwpInput[i].odoctyp == "I" ? "Invoice" : expwpInput[i].odoctyp == "DR" ? "Debit Note" : expwpInput[i].odoctyp == "CR" ? "Credit Note" : expwpInput[i].odoctyp;
                expwpRow[impConstants.odoc_num] = (expwpInput[i].odoc.num != undefined && expwpInput[i].odoc.num != null) ? expwpInput[i].odoc.num : "";
                expwpRow[impConstants.odoc_date] = expwpInput[i].odoc_date;
                expwpRow[impConstants.doc_type] = expwpInput[i].doctyp == "I" ? "Invoice" : expwpInput[i].doctyp == "DR" ? "Debit Note" : expwpInput[i].doctyp == "CR" ? "Credit Note" : expwpInput[i].doctyp;
                expwpRow[impConstants.doc_num] = (expwpInput[i].doc.num != undefined && expwpInput[i].doc.num != null) ? expwpInput[i].doc.num : "";
                expwpRow[impConstants.doc_date] = expwpInput[i].doc_date;
                expwpRow[impConstants.doc_val] = (expwpInput[i].doc.val != undefined && expwpInput[i].doc.val != null) ? expwpInput[i].doc.val : "";
                expwpRow[impConstants.exp_typ] = (expwpInput[i].exptype != undefined && expwpInput[i].exptype != null) ? expwpInput[i].exptype : "";
                expwpRow[impConstants.pcode_opt] = expwpInput[i].sb ? expwpInput[i].sb.pcode : '';
                expwpRow[impConstants.ship_num] = expwpInput[i].sb ? expwpInput[i].sb.num : '';
                expwpRow[impConstants.ship_date] = expwpInput[i].sb_date ? expwpInput[i].sb_date : '';
                expwpRow[impConstants.sup_typ] = (expwpInput[i].suptype != undefined && expwpInput[i].suptype != null) ? expwpInput[i].suptype : "";
                expwpRow[impConstants.hsn_mand] = (expwpInput[i].items[j].hsn != null && expwpInput[i].items[j].hsn != undefined) ? expwpInput[i].items[j].hsn : "";
                expwpRow[impConstants.rate] = (expwpInput[i].items[j].rate != null && expwpInput[i].items[j].rate != undefined) ? expwpInput[i].items[j].rate : "";
                expwpRow[impConstants.taxable_value] = (expwpInput[i].items[j].txval != null && expwpInput[i].items[j].txval != undefined) ? expwpInput[i].items[j].txval : "";
                expwpRow[impConstants.igst] = (expwpInput[i].items[j].igst != null && expwpInput[i].items[j].igst != undefined) ? expwpInput[i].items[j].igst : "";
                expwpRow[impConstants.cgst] = (expwpInput[i].items[j].cgst != null && expwpInput[i].items[j].cgst != undefined) ? expwpInput[i].items[j].cgst : "";
                expwpRow[impConstants.sgst] = (expwpInput[i].items[j].sgst != null && expwpInput[i].items[j].sgst != undefined) ? expwpInput[i].items[j].sgst : "";
                expwpRow[impConstants.cess] = (expwpInput[i].items[j].cess != null && expwpInput[i].items[j].cess != undefined) ? expwpInput[i].items[j].cess : "";

                //expwpRow[impConstants.ErrorMessage] = expwpInput[i].errMessage ? expwpInput[i].errMessage.join() : '';
                if (expwpInput[i].items[j].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + expwpInput[i].items[j].errMessage.join();
                    } else {
                        err = expwpInput[i].items[j].errMessage.join();
                    }
                }
                if (expwpInput[i].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + expwpInput[i].errMessage.join();
                    } else {
                        err = expwpInput[i].errMessage.join();
                    }
                }
                if (err.length > 1) {
                    expwpRow[impConstants.ErrorMessage] = err;
                } else
                    expwpRow[impConstants.ErrorMessage] = "";

                //   if (expwpInput[i].errMessage)
                //  expwpRow[impConstants.ErrorMessage] = expwpInput[i].errMessage.join();

                expwpaOutput.push(expwpRow);
            }
        }
    }

    let expwopaOutput = [];
    if (errJson.expwopa) {

        let expwopInput = errJson.expwopa;
        for (let i = 0; i < expwopInput.length; i++) {
            for (let j = 0; j < expwopInput[i].items.length; j++) {
                let expwopRow = {};
                let err = "";
                // expwopRow[impConstants.doc_type] = expwopInput[i].doctyp == "I" ? "Invoice" : expwopInput[i].doctyp == "DR" ? "Debit Note" : expwopInput[i].doctyp == "CR" ? "Credit Note" : expwopInput[i].doctyp;
                // expwopRow[impConstants.exp_typ] = (expwopInput[i].exptype != undefined && expwopInput[i].exptype != null) ? expwopInput[i].exptype : "";
                // expwopRow[impConstants.doc_num] = (expwopInput[i].doc.num != undefined && expwopInput[i].doc.num != null) ? expwopInput[i].doc.num : "";
                // expwopRow[impConstants.doc_date] = expwopInput[i].doc_date;
                // expwopRow[impConstants.odoc_type] = expwopInput[i].odoctyp == "I" ? "Invoice" : expwopInput[i].odoctyp == "DR" ? "Debit Note" : expwopInput[i].odoctyp == "CR" ? "Credit Note" : expwopInput[i].odoctyp;
                // expwopRow[impConstants.odoc_num] = (expwopInput[i].odoc.num != undefined && expwopInput[i].odoc.num != null) ? expwopInput[i].odoc.num : "";
                // expwopRow[impConstants.odoc_date] = expwopInput[i].odoc_date;
                // expwopRow[impConstants.doc_val] = (expwopInput[i].doc.val != undefined && expwopInput[i].doc.val != null) ? expwopInput[i].doc.val : "";
                expwopRow[impConstants.odoc_type] = expwopInput[i].odoctyp == "I" ? "Invoice" : expwopInput[i].odoctyp == "DR" ? "Debit Note" : expwopInput[i].odoctyp == "CR" ? "Credit Note" : expwopInput[i].odoctyp;
                expwopRow[impConstants.odoc_num] = (expwopInput[i].odoc.num != undefined && expwopInput[i].odoc.num != null) ? expwopInput[i].odoc.num : "";
                expwopRow[impConstants.odoc_date] = expwopInput[i].odoc_date;
                expwopRow[impConstants.doc_type] = expwopInput[i].doctyp == "I" ? "Invoice" : expwopInput[i].doctyp == "DR" ? "Debit Note" : expwopInput[i].doctyp == "CR" ? "Credit Note" : expwopInput[i].doctyp;
                expwopRow[impConstants.doc_num] = (expwopInput[i].doc.num != undefined && expwopInput[i].doc.num != null) ? expwopInput[i].doc.num : "";
                expwopRow[impConstants.doc_date] = expwopInput[i].doc_date;
                expwopRow[impConstants.doc_val] = (expwopInput[i].doc.val != undefined && expwopInput[i].doc.val != null) ? expwopInput[i].doc.val : "";
                expwopRow[impConstants.exp_typ] = (expwopInput[i].exptype != undefined && expwopInput[i].exptype != null) ? expwopInput[i].exptype : "";
                expwopRow[impConstants.pcode_opt] = expwopInput[i].sb ? expwopInput[i].sb.pcode : "";
                expwopRow[impConstants.ship_num] = expwopInput[i].sb ? expwopInput[i].sb.num : "";
                expwopRow[impConstants.ship_date] = expwopInput[i].sb_date ? expwopInput[i].sb_date : "";
                expwopRow[impConstants.sup_typ] = (expwopInput[i].suptype != undefined && expwopInput[i].suptype != null) ? expwopInput[i].suptype : "";

                expwopRow[impConstants.hsn_mand] = (expwopInput[i].items[j].hsn != null && expwopInput[i].items[j].hsn != undefined) ? expwopInput[i].items[j].hsn : "";
                expwopRow[impConstants.rate] = (expwopInput[i].items[j].rate != null && expwopInput[i].items[j].rate != undefined) ? expwopInput[i].items[j].rate : "";
                expwopRow[impConstants.taxable_value] = (expwopInput[i].items[j].txval != null && expwopInput[i].items[j].txval != undefined) ? expwopInput[i].items[j].txval : "";
                expwopRow[impConstants.igst] = (expwopInput[i].items[j].igst != null && expwopInput[i].items[j].igst != undefined) ? expwopInput[i].items[j].igst : "";
                expwopRow[impConstants.cgst] = (expwopInput[i].items[j].cgst != null && expwopInput[i].items[j].cgst != undefined) ? expwopInput[i].items[j].cgst : "";
                expwopRow[impConstants.sgst] = (expwopInput[i].items[j].sgst != null && expwopInput[i].items[j].sgst != undefined) ? expwopInput[i].items[j].sgst : "";
                expwopRow[impConstants.cess] = (expwopInput[i].items[j].cess != null && expwopInput[i].items[j].cess != undefined) ? expwopInput[i].items[j].cess : "";

                // expwopRow[impConstants.ErrorMessage] = expwopInput[i].errMessage ? expwopInput[i].errMessage.join() : '';
                if (expwopInput[i].items[j].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + expwopInput[i].items[j].errMessage.join();
                    } else {
                        err = expwopInput[i].items[j].errMessage.join();
                    }
                }
                if (expwopInput[i].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + expwopInput[i].errMessage.join();
                    } else {
                        err = expwopInput[i].errMessage.join();
                    }
                }
                if (err.length > 1) {
                    expwopRow[impConstants.ErrorMessage] = err;
                } else
                    expwopRow[impConstants.ErrorMessage] = "";

                //  if (expwopInput[i].errMessage)
                //    expwopRow[impConstants.ErrorMessage] = expwopInput[i].errMessage.join();

                expwopaOutput.push(expwopRow);
            }
        }
    }

    let ecomaOutput = [];
    if (errJson.ecoma) {

        let ecomInput = errJson.ecoma;
        for (let i = 0; i < ecomInput.length; i++) {
            let ecomRow = {};
            ecomRow[impConstants.ctin_ecom] = (ecomInput[i].etin != undefined && ecomInput[i].etin != null) ? ecomInput[i].etin : "";
            ecomRow[impConstants.trade_name] = (ecomInput[i].trdnm != undefined && ecomInput[i].trdnm != null) ? ecomInput[i].trdnm : "";
            ecomRow[impConstants.val_of_sup] = (ecomInput[i].sup != undefined && ecomInput[i].sup != null) ? ecomInput[i].sup : "";
            ecomRow[impConstants.val_of_ret] = (ecomInput[i].supr != undefined && ecomInput[i].supr != null) ? ecomInput[i].supr : "";
            ecomRow[impConstants.net_val_sup] = (ecomInput[i].nsup != undefined && ecomInput[i].nsup != null) ? ecomInput[i].nsup : "";
            ecomRow[impConstants.igst] = (ecomInput[i].igst != null && ecomInput[i].igst != undefined) ? ecomInput[i].igst : "";
            ecomRow[impConstants.cgst] = (ecomInput[i].cgst != null && ecomInput[i].cgst != undefined) ? ecomInput[i].cgst : "";
            ecomRow[impConstants.sgst] = (ecomInput[i].sgst != null && ecomInput[i].sgst != undefined) ? ecomInput[i].sgst : "";
            ecomRow[impConstants.cess] = (ecomInput[i].cess != null && ecomInput[i].cess != undefined) ? ecomInput[i].cess : "";


            ecomRow[impConstants.ErrorMessage] = ecomInput[i].errMessage ? ecomInput[i].errMessage.join() : '';

            //  if (ecomInput[i].errMessage)
            //    ecomRow[impConstants.ErrorMessage] = ecomInput[i].errMessage.join();

            ecomaOutput.push(ecomRow);
        }
    }

    let revaOutput = [];
    if (errJson.reva) {
        let revInput = errJson.reva;

        for (let i = 0; i < revInput.length; i++) {
            for (let x = 0; x < revInput[i].docs.length; x++) {
                let document = revInput[i].docs[x];
                for (let j = 0; j < document.items.length; j++) {
                    let revRow = {};
                    let err = "";
                    revRow[impConstants.ctin_pan_sup] = (revInput[i].ctin != undefined && revInput[i].ctin != null) ? revInput[i].ctin : "";
                    revRow[impConstants.trade_name] = (revInput[i].trdnm != undefined && revInput[i].trdnm != null) ? revInput[i].trdnm : "";
                    revRow[impConstants.pos] = statemap.get(Number(document.pos));
                    revRow[impConstants.diff_prcnt] = (document.diffpercnt != undefined && document.diffpercnt != null) ? document.diffpercnt : "";
                    revRow[impConstants.sup_cov_sec7] = document.sec7act == "Y" ? "Yes" : document.sec7act == "N" ? "No" : document.sec7act;
                    revRow[impConstants.sup_typ] = (document.suptype != undefined && document.suptype != null) ? document.suptype : "";


                    revRow[impConstants.hsn_opt] = (document.items[j].hsn != null && document.items[j].hsn != undefined) ? document.items[j].hsn : "";
                    revRow[impConstants.rate] = (document.items[j].rate != null && document.items[j].rate != undefined) ? document.items[j].rate : "";
                    revRow[impConstants.taxable_value] = (document.items[j].txval != null && document.items[j].txval != undefined) ? document.items[j].txval : "";
                    revRow[impConstants.igst] = (document.items[j].igst != null && document.items[j].igst != undefined) ? document.items[j].igst : "";
                    revRow[impConstants.cgst] = (document.items[j].cgst != null && document.items[j].cgst != undefined) ? document.items[j].cgst : "";
                    revRow[impConstants.sgst] = (document.items[j].sgst != null && document.items[j].sgst != undefined) ? document.items[j].sgst : "";
                    revRow[impConstants.cess] = (document.items[j].cess != null && document.items[j].cess != undefined) ? document.items[j].cess : "";

                    if (document.errMessage)
                        err = document.errMessage.join();
                    if (document.items[j].errMessage) {
                        if (err.length > 0) {
                            err = err + "," + document.items[j].errMessage.join();
                        } else {
                            err = document.items[j].errMessage.join();
                        }
                    }
                    if (revInput[i].errMessage) {
                        if (err.length > 0) {
                            err = err + "," + revInput[i].errMessage.join();
                        } else {
                            err = revInput[i].errMessage.join();
                        }
                    }

                    // if (document.errMessage)
                    //     err = document.errMessage.join();

                    // if (revInput[i].errMessage)
                    //     err = err + "," + revInput[i].errMessage.join();

                    if (err.length > 1) {
                        revRow[impConstants.ErrorMessage] = err;
                    } else
                        revRow[impConstants.ErrorMessage] = "";

                    revaOutput.push(revRow);
                }
            }
        }
    }

    let impsaOutput = [];
    if (errJson.impsa) {
        let impsInput = errJson.impsa;
        for (let i = 0; i < impsInput.length; i++) {
            for (let j = 0; j < impsInput[i].items.length; j++) {
                let impsRow = {};
                let err = "";
                impsRow[impConstants.pos] = statemap.get(Number(impsInput[i].pos));
                impsRow[impConstants.hsn_mand] = (impsInput[i].items[j].hsn != null && impsInput[i].items[j].hsn != undefined) ? impsInput[i].items[j].hsn : "";
                impsRow[impConstants.rate] = (impsInput[i].items[j].rate != null && impsInput[i].items[j].rate != undefined) ? impsInput[i].items[j].rate : "";
                impsRow[impConstants.taxable_value] = (impsInput[i].items[j].txval != null && impsInput[i].items[j].txval != undefined) ? impsInput[i].items[j].txval : "";
                impsRow[impConstants.igst] = (impsInput[i].items[j].igst != null && impsInput[i].items[j].igst != undefined) ? impsInput[i].items[j].igst : "";
                impsRow[impConstants.cgst] = (impsInput[i].items[j].cgst != null && impsInput[i].items[j].cgst != undefined) ? impsInput[i].items[j].cgst : "";
                impsRow[impConstants.sgst] = (impsInput[i].items[j].sgst != null && impsInput[i].items[j].sgst != undefined) ? impsInput[i].items[j].sgst : "";
                impsRow[impConstants.cess] = (impsInput[i].items[j].cess != null && impsInput[i].items[j].cess != undefined) ? impsInput[i].items[j].cess : "";

                // impsRow[impConstants.ErrorMessage] = impsInput[i].errMessage ? impsInput[i].errMessage.join() : '';
                //   if (impsInput[i].errMessage)
                //     impsRow[impConstants.ErrorMessage] = impsInput[i].errMessage.join();
                if (impsInput[i].items[j].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + impsInput[i].items[j].errMessage.join();
                    } else {
                        err = impsInput[i].items[j].errMessage.join();
                    }
                }
                if (impsInput[i].errMessage) {
                    if (err.length > 0) {
                        err = err + "," + impsInput[i].errMessage.join();
                    } else {
                        err = impsInput[i].errMessage.join();
                    }
                }
                if (err.length > 1) {
                    impsRow[impConstants.ErrorMessage] = err;
                } else
                    impsRow[impConstants.ErrorMessage] = "";

                impsaOutput.push(impsRow);
            }
        }
    }

    let impgaOutput = [];
    if (errJson.impga) {
        let impgInput = errJson.impga;
        for (let i = 0; i < impgInput.length; i++) {
            for (let x = 0; x < impgInput[i].docs.length; x++) {
                let document = impgInput[i].docs[x];
                console.log('impga!!!!!!!!*!*!*!*!*!*!**', document)
                for (let j = 0; j < document.items.length; j++) {

                    let impgRow = {};
                    let err = "";
                    impgRow[impConstants.odoc_type] = document.odoctyp == "B" ? "Bill of Entry" : document.odoctyp;
                    impgRow[impConstants.opcode_mand] = document.oboe.pcode ? document.oboe.pcode : '';
                    impgRow[impConstants.oboe_num] = document.oboe ? document.oboe.num : '';
                    impgRow[impConstants.oboe_date] = document.oboe_dt;
                    impgRow[impConstants.doc_type] = document.doctyp == "B" ? "Bill of Entry" : document.doctyp;
                    impgRow[impConstants.pcode_mand] = document.boe.pcode ? document.boe.pcode : '';
                    impgRow[impConstants.boe_num] = document.boe ? document.boe.num : '';
                    impgRow[impConstants.boe_date] = document.boe_dt;
                    impgRow[impConstants.boe_val] = document.boe ? document.boe.val : '';
                    impgRow[impConstants.pos] = statemap.get(Number(impgInput[i].pos));
                    impgRow[impConstants.sup_typ] = impgInput[i].suptyp;

                    impgRow[impConstants.hsn_mand] = (document.items[j].hsn != null && document.items[j].hsn != undefined) ? document.items[j].hsn : "";
                    impgRow[impConstants.rate] = (document.items[j].rate != null && document.items[j].rate != undefined) ? document.items[j].rate : "";
                    impgRow[impConstants.taxable_value] = (document.items[j].txval != null && document.items[j].txval != undefined) ? document.items[j].txval : "";
                    impgRow[impConstants.igst_paid] = (document.items[j].igst != null && document.items[j].igst != undefined) ? document.items[j].igst : "";
                    impgRow[impConstants.cgst] = (document.items[j].cgst != null && document.items[j].cgst != undefined) ? document.items[j].cgst : "";
                    impgRow[impConstants.sgst] = (document.items[j].sgst != null && document.items[j].sgst != undefined) ? document.items[j].sgst : "";
                    impgRow[impConstants.cess_paid] = (document.items[j].cess != null && document.items[j].cess != undefined) ? document.items[j].cess : "";
                    // impgRow[impConstants.ErrorMessage] = document.errMessage ? document.errMessage.join() : '';
                    // if (document.errMessage)
                    //   impgRow[impConstants.ErrorMessage] = document.errMessage.join();
                    if (document.errMessage)
                        err = document.errMessage.join();
                    if (document.items[j].errMessage) {
                        if (err.length > 0) {
                            err = err + "," + document.items[j].errMessage.join();
                        } else {
                            err = document.items[j].errMessage.join();
                        }
                    }
                    if (impgInput[i].errMessage) {
                        if (err.length > 0) {
                            err = err + "," + impgInput[i].errMessage.join();
                        } else {
                            err = impgInput[i].errMessage.join();
                        }
                    }
                    if (err.length > 1) {
                        impgRow[impConstants.ErrorMessage] = err;
                    } else
                        impgRow[impConstants.ErrorMessage] = "";
                    impgaOutput.push(impgRow);
                }

                // impgaOutput.push(impgRow);
            }
        }
    }

    let impgsezaOutput = [];
    if (errJson.impgseza) {
        let impgsezInput = errJson.impgseza;

        for (let i = 0; i < impgsezInput.length; i++) {

            for (let x = 0; x < impgsezInput[i].docs.length; x++) {

                let document = impgsezInput[i].docs[x];
                console.log('impgseza!!!!!!!!*!*!*!*!*!*!**', document)

                for (let j = 0; j < document.items.length; j++) {
                    let err = "";
                    let impgsezRow = {};
                    impgsezRow[impConstants.octin_sup] = (impgsezInput[i].octin != null && impgsezInput[i].octin != undefined) ? impgsezInput[i].octin : "";
                    impgsezRow[impConstants.otrade_name] = (impgsezInput[i].olegaltradename != null && impgsezInput[i].olegaltradename != undefined) ? impgsezInput[i].olegaltradename : "";

                    impgsezRow[impConstants.odoc_type] = document.odoctyp == "B" ? "Bill of Entry" : document.odoctyp;
                    impgsezRow[impConstants.opcode_mand] = document.oboe.pcode ? document.boe.pcode : '';
                    impgsezRow[impConstants.oboe_num] = document.oboe.num ? document.oboe.num : '';
                    impgsezRow[impConstants.oboe_date] = document.oboe_dt;
                    impgsezRow[impConstants.ctin_sup] = (impgsezInput[i].ctin != null && impgsezInput[i].ctin != undefined) ? impgsezInput[i].ctin : "";
                    impgsezRow[impConstants.trade_name] = (impgsezInput[i].legaltradename != null && impgsezInput[i].legaltradename != undefined) ? impgsezInput[i].legaltradename : "";

                    impgsezRow[impConstants.doc_type] = document.doctyp == "B" ? "Bill of Entry" : document.doctyp;
                    impgsezRow[impConstants.pcode_mand] = document.boe.pcode ? document.boe.pcode : '';
                    impgsezRow[impConstants.boe_num] = document.boe.num ? document.boe.num : '';
                    impgsezRow[impConstants.boe_date] = document.boe_dt;
                    impgsezRow[impConstants.boe_val] = document.boe.val ? document.boe.val : '';
                    impgsezRow[impConstants.pos] = statemap.get(Number(document.pos));
                    impgsezRow[impConstants.sup_typ] = (document.suptyp != undefined && document.suptyp != null) ? document.suptyp : "";

                    impgsezRow[impConstants.hsn_mand] = (document.items[j].hsn != null && document.items[j].hsn != undefined) ? document.items[j].hsn : "";
                    impgsezRow[impConstants.rate] = (document.items[j].rate != null && document.items[j].rate != undefined) ? document.items[j].rate : "";
                    impgsezRow[impConstants.taxable_value] = (document.items[j].txval != null && document.items[j].txval != undefined) ? document.items[j].txval : "";
                    impgsezRow[impConstants.igst_paid] = (document.items[j].igst != null && document.items[j].igst != undefined) ? document.items[j].igst : "";
                    impgsezRow[impConstants.cgst] = (document.items[j].cgst != null && document.items[j].cgst != undefined) ? document.items[j].cgst : "";
                    impgsezRow[impConstants.sgst] = (document.items[j].sgst != null && document.items[j].sgst != undefined) ? document.items[j].sgst : "";
                    impgsezRow[impConstants.cess_paid] = (document.items[j].cess != null && document.items[j].cess != undefined) ? document.items[j].cess : "";

                    if (document.errMessage)
                        err = document.errMessage.join();

                    if (document.items[j].errMessage) {
                        if (err.length > 0) {
                            err = err + "," + document.items[j].errMessage.join();
                        } else {
                            err = document.items[j].errMessage.join();
                        }
                    }
                    if (impgsezInput[i].errMessage) {
                        if (err.length > 0) {
                            err = err + "," + impgsezInput[i].errMessage.join();
                        } else {
                            err = impgsezInput[i].errMessage.join();
                        }
                    }

                    // if (impgsezInput[i].errMessage)
                    //     err = err + "," + impgsezInput[i].errMessage.join();

                    if (err.length > 1) {
                        impgsezRow[impConstants.ErrorMessage] = err;
                    } else
                        impgsezRow[impConstants.ErrorMessage] = "";

                    impgsezaOutput.push(impgsezRow);
                }
            }
        }
    }

    let jsonResponse = [];
    jsonResponse.push({ b2ca: b2caOutput })
    jsonResponse.push({ expwpa: expwpaOutput.concat(expwopaOutput) })
    jsonResponse.push({ ecoma: ecomaOutput })
    jsonResponse.push({ reva: revaOutput })
    jsonResponse.push({ impsa: impsaOutput })
    jsonResponse.push({ impga: impgaOutput })
    jsonResponse.push({ impgseza: impgsezaOutput })
    return jsonResponse;
    //console.log("Error Excel ::",jsonResponse)

}

async function convertMandatoryErrJsontoExcelObjA(mandatoryErrJson) {

    let mandErrObj = JSON.parse(mandatoryErrJson);

    let jsonmandResponse = [];
    jsonmandResponse.push({ b2ca: mandErrObj.b2ca })
    jsonmandResponse.push({ expwpa: mandErrObj.expa })
    jsonmandResponse.push({ ecoma: mandErrObj.ecoma })
    jsonmandResponse.push({ reva: mandErrObj.reva })
    jsonmandResponse.push({ impsa: mandErrObj.impsa })
    jsonmandResponse.push({ impga: mandErrObj.impga })
    jsonmandResponse.push({ impgseza: mandErrObj.impgseza })
    return jsonmandResponse;

}


module.exports = {
    exportXls: exportXls,
    exportCsv: exportCsv,
    DownloaderrJson: DownloaderrJson,
    exportXlsA: exportXlsA,
    exportCsvA: exportCsvA,
    DownloaderrJsonA: DownloaderrJsonA
}