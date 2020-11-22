const fs = require('fs');
const Validator = require('jsonschema').Validator;
const moment = require('moment');
const { sendResponse, calSupTypeFor3A, calSupTypeFor3B, calSupTypeFor3L, calSupTypeFor3G, calSupTypeFor3BA, calSupTypeFor3H } = require("../../utility/common");
const { validateAnx1Imp_Header, validateAnx1Imp_3H, validateAnx1Imp_3A, validateAnx1Imp_3B, validateAnx1Imp_3BA, validateAnx1Imp_3JA, validateAnx1Imp_3KA,
    validate3cd, validateAnx1Imp_3J, validateAnx1Imp_3I, validateAnx1Imp_3AA, validate3cda, validateAnx1Imp_3IA, validateAnx1Imp_3HA, validateAnx1Imp_tab4A,
    validateAnx1Imp_tab4, validate3EFor3G, validateAnx1Imp_3K, setRatesForValidation, setHSNMaster, setDocRefArr, setODocRefArr, setOrgDocRefArr, validateAnx1Imp_3L } = require("../../utility/validators/anx1Validators/anx1ImpExcelValidator");
const anx1ImpJson = require('../../service/anx1Service/anx1ImpService');
const logger = require('../../utility/logger').logger;
const _ = require("lodash");
const { runQuery, dbClose, getConnection } = require("../../db/dbUtil");


function parse3HObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3HObj");
    saveJsonObj.rev = [];
    errJsonObj.rev = [];
    const tableName = "3H";
    if (req.body.rev) {
        setDocRefArr(true);

        req.body.rev.forEach((revArrObj) => {
            let saveRevObj = _.cloneDeep(revArrObj);
            saveRevObj.ctin = saveRevObj.ctin.toUpperCase();
            saveRevObj.docs.forEach((doc) => {
                doc.doctyp = "I";
                doc.legaltradename = saveRevObj.trdnm || "";
                doc.diffpercnt = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
                delete doc.diffprcnt;
                doc.status = "";
                doc.rst = "N";
                doc.upld_dt = "";
                doc.docref = saveRevObj.ctin.concat('|', doc.pos, '|', doc.diffpercnt, '|', doc.sec7act, '|', req.body.rtnprd, '|', tableName);
                doc.sec7act = doc.sec7act || 'N';
                doc.suptype = (saveRevObj.type === "G" || saveRevObj.type === "g") ? calSupTypeFor3H(saveRevObj.ctin, doc.pos, doc.sec7act, saveJsonObj.issez, doc.suptyp) : (doc.suptyp == "inter" ? "Inter-State" : "Intra-State");
            }
            );
            setDocRefArr(false);
            let errObj = validateAnx1Imp_3H(saveRevObj, req.body.gstin);
            if (errObj != "{}") {
                errJsonObj.errFlag = "true";
                errJsonObj.rev.push(errObj);
            }
            if (errObj.errMessage === undefined || (errObj.errMessage && errObj.errMessage.length == 0)) {
                saveJsonObj.rev.push(saveRevObj);
                saveJsonObj.xflag = true;
            }
        }
        );

    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3HObj");
}

function parse3AObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3AObj");
    saveJsonObj.b2c = [];
    errJsonObj.b2c = [];
    const tableName = "3A";
    if (req.body.b2c) {
        setDocRefArr(true);
        req.body.b2c.forEach((b2cObj) => {
            let saveb2cObj = _.cloneDeep(b2cObj);
            saveb2cObj.doctyp = "I";
            saveb2cObj.diffpercnt = saveb2cObj.diffprcnt ? saveb2cObj.diffprcnt * 100 : 100;
            delete saveb2cObj.diffprcnt;
            saveb2cObj.rst = saveb2cObj.flag;
            delete saveb2cObj.flag;

            saveb2cObj.status = "";
            saveb2cObj.rst = "N";

            saveb2cObj.upld_dt = "";
            saveb2cObj.docref = saveb2cObj.pos.concat('|', saveb2cObj.diffpercnt, '|', saveb2cObj.sec7act, '|', req.body.rtnprd, '|', tableName);
            saveb2cObj.sec7act = saveb2cObj.sec7act || 'N';
            saveb2cObj.suptype = calSupTypeFor3A(req.body.gstin, saveb2cObj.pos, saveb2cObj.sec7act, saveJsonObj.issez, saveb2cObj.suptype)
            setDocRefArr(false);
            validateAnx1Imp_3A(saveb2cObj);
            if (saveb2cObj.valid === 1) {
                saveJsonObj.b2c.push(saveb2cObj);
                saveJsonObj.xflag = true;
            } else {
                saveb2cObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.b2c.push(saveb2cObj);
            }
        }
        );
        logger.log("info", "Exiting anx1ImpExcelJsonService.parse3AObj");
    }
}
function parse3LObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3LObj");
    let fp = req.headers["fp"];
    let issez = req.headers["issez"];
    saveJsonObj.mis = [], errJsonObj.mis = [];
    const tableName = "3L";
    if (req.body.mis) {
        setDocRefArr(true);
        req.body.mis.forEach((misObj) => {
            let savemisObjArr = _.cloneDeep(misObj);
            savemisObjArr.docs.forEach((doc) => {
                doc.ctin = savemisObjArr.ctin.toUpperCase();
                doc.tblref = savemisObjArr.tblref;
                doc.doctyp = (doc.doctyp == "C") ? "CR" : ((doc.doctyp == "D") ? "DR" : doc.doctyp);
                doc.legaltradename = savemisObjArr.trdnm || "";
                doc.diffpercnt = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
                delete doc.diffprcnt;
                doc.rst = doc.flag;
                delete doc.flag;

                doc.status = "";
                doc.rst = "N"

                doc.upld_dt = "";
                doc.sec7act = doc.sec7act || 'N';
                doc.suptype = calSupTypeFor3L(req.body.gstin, doc.pos, doc.sec7act, issez, doc.suptype);
                let tmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
                doc.doc_date = doc.doc.dt;
                doc.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.doc.dt = tmpDt.format("DD/MM/YYYY");
                doc.docref = doc.doc.num.toUpperCase().concat('|', doc.doctyp, '|', doc.doc.year, '|', fp, '|', req.body.rtnprd, '|', doc.tblref, '|', tableName);
                setDocRefArr(false);
                validateAnx1Imp_3L(doc, req.body.rtnprd, req.body.gstin, req.body.issez, req.body.profile);
                if (doc.valid === 1) {
                    saveJsonObj.mis.push(doc);
                    saveJsonObj.xflag = true;
                } else {
                    savemisObjArr.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.mis.push(doc);
                }
            }
            );

        }
        );
    }
    logger.log("info", "Entering anx1ImpService.parse3LObj");
}
function parse3BObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3BObj");
    let fp = req.headers["fp"];
    saveJsonObj.b2b = [], errJsonObj.b2b = [];
    const tableName = "3B";
    if (req.body.b2b) {
        setDocRefArr(true);
        req.body.b2b.forEach((b2bObj) => {

            let saveb2bObjArr = _.cloneDeep(b2bObj);
            saveb2bObjArr.docs.forEach((doc) => {
                doc.ctin = saveb2bObjArr.ctin.toUpperCase();
                doc.legaltradename = saveb2bObjArr.trdnm || "";
                doc.doctyp = (doc.doctyp == "C") ? "CR" : ((doc.doctyp == "D") ? "DR" : doc.doctyp);
                doc.diffpercnt = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
                delete doc.diffprcnt;
                doc.rst = doc.flag;
                delete doc.flag;

                doc.status = "";
                doc.rst = "N";
                doc.upld_dt = "";
                doc.sec7act = doc.sec7act || 'N';
                doc.suptype = calSupTypeFor3B(req.body.gstin, doc.pos, doc.sec7act, saveJsonObj.issez, doc.suptype);
                let tmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
                doc.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.doc_date = doc.doc.dt;
                doc.doc.dt = tmpDt.format("DD/MM/YYYY");
                doc.docref = doc.doc.num.toUpperCase().concat('|', doc.doctyp, '|', doc.doc.year, '|', fp, '|', req.body.rtnprd, '|', tableName);
                setDocRefArr(false);
                validateAnx1Imp_3B(doc, req.body.rtnprd, req.body.gstin);
                if (doc.valid === 1) {
                    saveJsonObj.b2b.push(doc);
                    saveJsonObj.xflag = true;
                } else {
                    doc.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.b2b.push(doc);
                }
            }
            );
        }
        );
    }

    logger.log("info", "Entering anx1ImpExcelJsonService.parse3BObj");
}

function parse3CDObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3CDObj");
    saveJsonObj.expwp = [], saveJsonObj.expwop = [];
    errJsonObj.expwp = [], errJsonObj.expwop = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    const tableName = "3CD";
    setDocRefArr(true);
    if (req.body.expwp) {

        req.body.expwp.forEach((expwpObj) => {
            let saveExpwpObj = _.cloneDeep(expwpObj);
            saveExpwpObj.status = "";
            saveExpwpObj.flag = "N";

            saveExpwpObj.doc_date = saveExpwpObj.doc.dt; // required for error excel

            let tmpDt = moment(saveExpwpObj.doc.dt, "DD-MM-YYYY");
            saveExpwpObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveExpwpObj.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveExpwpObj.doctyp = (saveExpwpObj.doctyp == "C") ? "CR" : ((saveExpwpObj.doctyp == "D") ? "DR" : saveExpwpObj.doctyp);
            saveExpwpObj.docref = saveExpwpObj.doctyp.concat('|', saveExpwpObj.doc.num, '|', saveExpwpObj.doc.year, '|', fp, '|', req.body.rtnprd, '|', tableName);
            saveExpwpObj.suptype = "Inter-State";
            saveExpwpObj.exptype = "EXPWP";
            saveExpwpObj.upld_dt = "";
            saveExpwpObj.sb = saveExpwpObj.sb ? saveExpwpObj.sb : {};
            saveExpwpObj.sb_date = saveExpwpObj.sb.dt ? saveExpwpObj.sb.dt : ""; // required for error excel
            saveExpwpObj.sb.dt = saveExpwpObj.sb.dt ? moment(saveExpwpObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwpObj.sb.dt;
            setDocRefArr(false);
            validate3cd(saveExpwpObj, 'expwp', rtnprd);

            if (saveExpwpObj.valid === 1) {
                saveJsonObj.expwp.push(saveExpwpObj);
                saveJsonObj.xflag = true;
            } else {
                saveExpwpObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.expwp.push(saveExpwpObj);
            }

            }                
        );          
    } 
    if(req.body.expwop) {               
        req.body.expwop.forEach((expwopObj) => {
                let saveExpwopObj = _.cloneDeep(expwopObj);
        saveExpwopObj.status = "";        
        saveExpwopObj.flag = "N";
                saveExpwopObj.doc_date = saveExpwopObj.doc.dt; // required for error excelc
                let tmpDt = moment(saveExpwopObj.doc.dt, "DD-MM-YYYY");
                saveExpwopObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                saveExpwopObj.doc.dt = tmpDt.format("DD/MM/YYYY");
                saveExpwopObj.doctyp = (saveExpwopObj.doctyp == "C") ? "CR" : ((saveExpwopObj.doctyp == "D") ? "DR" : saveExpwopObj.doctyp);
                saveExpwopObj.docref = saveExpwopObj.doctyp + "|" + saveExpwopObj.doc.num + "|" + saveExpwopObj.doc.year + "|" + fp +"|"+ req.body.rtnprd + "|" + tableName;
                saveExpwopObj.suptype = "Inter-State";
                saveExpwopObj.exptype = "EXPWOP";
                saveExpwopObj.upld_dt = ""; 
                saveExpwopObj.sb = saveExpwopObj.sb ? saveExpwopObj.sb : {};
                saveExpwopObj.sb_date = saveExpwopObj.sb.dt ? saveExpwopObj.sb.dt : ""; // required for error excel
                saveExpwopObj.sb.dt = saveExpwopObj.sb.dt ? moment(saveExpwopObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwopObj.sb.dt;
                setDocRefArr(false);
                validate3cd(saveExpwopObj, 'expwop', rtnprd);
                
                if(saveExpwopObj.valid === 1){
                    saveJsonObj.expwop.push(saveExpwopObj);
                    saveJsonObj.xflag = true;
                } else {        
                    saveExpwopObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.expwop.push(saveExpwopObj);
                }

            }                
        );          
    }
    logger.log("info","Exiting anx1ImpExcelJsonService.parse3CDObj");
}

function parse3JObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpExcelJsonService.parse3JObj");
    saveJsonObj.impg = [];
    errJsonObj.impg = [];
    let fp = req.headers["fp"];
    const tableName = "3J";    
    if(req.body.impg) {
        setDocRefArr(true);
        req.body.impg.forEach((impgObj) => {
                let saveimpgObj = _.cloneDeep(impgObj);
                saveimpgObj.status = "";
                saveimpgObj.flag = "N";
                
                saveimpgObj.uplddt = ""; 
                saveimpgObj.suptyp = "Inter-State";
                
                saveimpgObj.docs.forEach((doc) => {
                    let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                    doc.boe_dt = doc.boe.dt; //for error excel
                    doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                    doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                doc.docref = doc.boe.num.concat('|', doc.boe.year, '|', fp, '|', req.body.rtnprd, '|', tableName);
                    }
                );
                setDocRefArr(false);
                let errObj = validateAnx1Imp_3J(saveimpgObj, req.body.rtnprd);
                if(errObj != "{}"){
                    errJsonObj.errFlag = "true";
                    errJsonObj.impg.push(errObj);
                } 

                if(errObj.errMessage === undefined || (errObj.errMessage && errObj.errMessage.length == 0)){
                    saveJsonObj.impg.push(saveimpgObj);
                    saveJsonObj.xflag = true;
                }
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpExcelJsonService.parse3JObj");
}

function parse3IObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpExcelJsonService.parse3IObj");
    saveJsonObj.imps = [];
    errJsonObj.imps = [];
    const tableName = "3I";    
    if(req.body.imps) {
        setDocRefArr(true);           
        req.body.imps.forEach((impsObj) => {
                let saveimpsObj = _.cloneDeep(impsObj);
                saveimpsObj.diffpercnt = "100";
                saveimpsObj.flag = "N";
                saveimpsObj.status = "";
                saveimpsObj.upldt = ""; 
            saveimpsObj.docref = saveimpsObj.pos.concat('|', req.body.rtnprd, '|', tableName);
                saveimpsObj.suptype = "Inter-State";
                saveimpsObj.status = (req.headers["flag"] == "F" || req.headers["flag"] == "X" )? "" : "Uploaded";
                setDocRefArr(false);
                validateAnx1Imp_3I(saveimpsObj);
                if(saveimpsObj.valid === 1){
                    saveJsonObj.imps.push(saveimpsObj);
                    saveJsonObj.xflag = true;
                } else {        
                    saveimpsObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.imps.push(saveimpsObj);
                }

            }                
        );          
    }
    logger.log("info","Exiting anx1ImpExcelJsonService.parse3IObj");
}

function parseTab4Obj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpExcelJsonService.parseTab4Obj");
    saveJsonObj.ecom = [];
    errJsonObj.ecom = [];
    const tableName = "4";    
    if(req.body.ecom) {
        setDocRefArr(true);           
        req.body.ecom.forEach((ecomObj) => {
            let saveEcomObj = _.cloneDeep(ecomObj);
            saveEcomObj.etin = saveEcomObj.etin.toUpperCase();
            saveEcomObj.flag = "N";
            saveEcomObj.status = "";

            saveEcomObj.lgltrdname = saveEcomObj.trdnm || null;
            saveEcomObj.upldt = "";
            saveEcomObj.docref = saveEcomObj.etin.concat('|', req.body.rtnprd, '|', tableName);
            saveEcomObj.status = (req.headers["flag"] == "F" || req.headers["flag"] == "X") ? "" : "Uploaded";
            setDocRefArr(false);
            validateAnx1Imp_tab4(saveEcomObj);
            if (saveEcomObj.valid === 1) {
                saveJsonObj.ecom.push(saveEcomObj);
                saveJsonObj.xflag = true;
            } else {
                saveEcomObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.ecom.push(saveEcomObj);
            }

            }                
        );          
    }
    logger.log("info","Exiting anx1ImpExcelJsonService.parseTab4Obj");
}

function parse3EFObj(req, saveJsonObj, errJsonObj, docRefArr3ef) {
    logger.log("info","Entering anx1ImpExcelJsonService.parse3EFObj");
    saveJsonObj.sezwp = [], saveJsonObj.sezwop = [];
    errJsonObj.sezwp = [], errJsonObj.sezwop = [];    
    let fp = req.headers["fp"]; 
    let rtnprd = req.body.rtnprd;
    setDocRefArr(true);
    if(req.body.sezwp) {
        req.body.sezwp.forEach((sezwpObj) => {
            let saveSezwpObj = _.cloneDeep(sezwpObj);
            saveSezwpObj.ctin = saveSezwpObj.ctin.toUpperCase();
            saveSezwpObj.docs.forEach((doc) => {
                set3efDocDetails(doc, 'sezwp', fp, rtnprd, saveSezwpObj.ctin, saveSezwpObj.trdnm, docRefArr3ef, req);
            });

            saveSezwpObj = saveSezwpObj.docs;
            setDocRefArr(false);
            validate3EFor3G(saveSezwpObj, req.body.gstin, 'sezwp', rtnprd);
            
            if(saveSezwpObj.valid === 1){
                saveJsonObj.sezwp.push(...saveSezwpObj);
                saveJsonObj.xflag = true;
            } else {
                saveSezwpObj.every((doc) => {
            
                    if(doc.errMessage){
                        doc.errCd = "E01";
                        errJsonObj.errFlag = "true";
                        errJsonObj.sezwp.push(doc);
                    } else {
                        saveJsonObj.sezwp.push(doc);
                        saveJsonObj.xflag = true;
                    }

                    return true;
                });         
            }

        }                
        );          
    } 
    if(req.body.sezwop) {
        req.body.sezwop.forEach((sezwopObj) => {
                let saveSezwopObj = _.cloneDeep(sezwopObj);
                saveSezwopObj.docs.forEach((doc) => {
                    saveSezwopObj.ctin = saveSezwopObj.ctin.toUpperCase();
                    set3efDocDetails(doc, 'sezwop', fp, rtnprd, saveSezwopObj.ctin, saveSezwopObj.trdnm, docRefArr3ef, req);
                    }
                );
                saveSezwopObj = saveSezwopObj.docs;
                setDocRefArr(false);
				validate3EFor3G(saveSezwopObj, req.body.gstin, 'sezwop', rtnprd);
                if(saveSezwopObj.valid === 1){
                    saveJsonObj.sezwop.push(...saveSezwopObj);
                    saveJsonObj.xflag = true;
                } else {  
                    saveSezwopObj.every((doc) => {
						if(doc.errMessage){
                            doc.errCd = "E01";
                            errJsonObj.errFlag = "true";
                            errJsonObj.sezwop.push(doc);
                        } else {
                            saveJsonObj.sezwop.push(doc);
                            saveJsonObj.xflag = true;
                        }
                        return true;
                    }); 
                }

            }                
        );          
    }
    logger.log("info","Exiting anx1ImpExcelJsonService.parse3EFObj");
}

function set3efDocDetails(doc, type, fp, rtnprd, ctin, trdnm, docRefArr3ef, req) {

    logger.log("info", "Exiting anx1ImpExcelJsonService.set3efDocDetails");
    let total_txval = 0, total_igst = 0, total_cess = 0;

    doc.ctin = ctin;
    doc.legaltradename = trdnm || "";
    doc.diff_percentage = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
    doc.doc_type = doc.doctyp;
    doc.upload_date = "";
    doc.supply_type = "Inter-State";
    doc.fp = fp;
    doc.taxperiod = rtnprd;
    doc.flag = "N";
    doc.status = "";

    doc.doc_num = doc.doc.num;
    doc.doc_val = doc.doc.val;
    let tmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
    doc.doc_year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
    doc.doctyp = (doc.doctyp == "C") ? "CR" : ((doc.doctyp == "D") ? "DR" : doc.doctyp);
    doc.docref = doc.doc.num.concat('|', doc.doctyp, '|', doc.doc_year, '|', fp, '|', rtnprd, '|', '3EF');
    doc.doc_date = tmpDt.format("DD/MM/YYYY");
    docRefArr3ef.push(doc.docref);

    doc.errorcode = doc.errorDetails ? doc.errorDetails.errCd : null;
    doc.error_detail = doc.errorDetails ? doc.errorDetails.errMsg : null;

    doc.items.forEach((item) => {
        total_txval += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
        if (type === 'sezwp') {
            total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
            total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);
        }
    });

    doc.taxable_value = total_txval;

    if (type === 'sezwp') {
        doc.payTyp = "SEZWP";
        doc.clmrfnd = doc.clmrfnd;
        doc.igst = total_igst;
        doc.cess = total_cess;
    }

    if (type === 'sezwop') {
        doc.payTyp = "SEZWOP";
        doc.clmrfnd = null;
        doc.igst = null;
        doc.cess = null;
    }
}

function parse3GObj(req, saveJsonObj, errJsonObj, docRefArr3g) {
    logger.log("info","Entering anx1ImpExcelJsonService.parse3GObj");
    saveJsonObj.de = [];
    errJsonObj.de = [];   
    let fp = req.headers["fp"]; 
    let rtnprd = req.body.rtnprd;
    const tableName = "3G";
    if(req.body.de) {
        setDocRefArr(true);
        req.body.de.forEach((deObj) => {
           
            let saveDEObj = _.cloneDeep(deObj);
         
            saveDEObj.docs.forEach((doc) => {
                let total_txval = 0, total_igst = 0, total_cgst = 0, total_sgst = 0, total_cess = 0;
                doc.ctin = saveDEObj.ctin.toUpperCase();	
                doc.legaltradename = saveDEObj.trdnm || "";
                doc.diff_percentage = doc.diffprcnt?doc.diffprcnt*100:100;
                doc.doc_type = doc.doctyp;
                doc.upload_date =  ""; 
                doc.sec7 = doc.sec7act || 'N';
                doc.supply_type = calSupTypeFor3G(req.body.gstin, doc.pos, doc.sec7act, saveJsonObj.issez, doc.suptype);
                doc.fp = fp;
                doc.taxperiod = rtnprd;
                doc.flag = "N";
                doc.status = "";

                doc.doc_num = doc.doc.num;
                doc.doc_val = doc.doc.val;
                let tmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
                doc.doc_year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.doctyp = (doc.doctyp === "C") ? "CR" : ((doc.doctyp === "D") ? "DR" : doc.doctyp);
                doc.docref = doc.doc.num.concat('|', doc.doctyp, '|', doc.doc_year, '|', fp, '|', rtnprd, '|', '3G');
                docRefArr3g.push(doc.docref);
                doc.doc_date = tmpDt.format("DD/MM/YYYY");

                doc.errorcode = doc.errorDetails ? doc.errorDetails.errCd : null;
                doc.error_detail = doc.errorDetails ? doc.errorDetails.errMsg : null;

                doc.items.forEach((item) => {
                    total_txval += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                    total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                    total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
                    total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 : item.sgst);
                    total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);
                });
            
                doc.taxable_value = total_txval;
                doc.igst = total_igst;
                doc.cgst = total_cgst;
                doc.sgst = total_sgst;
                doc.cess = total_cess;
            });

            saveDEObj = saveDEObj.docs;
            setDocRefArr(false);
            validate3EFor3G(saveDEObj, req.body.gstin, 'de', rtnprd);

            if (saveDEObj.valid === 1) {
                saveJsonObj.de.push(...saveDEObj);
                saveJsonObj.xflag = true;
            } else {
                saveDEObj.every((doc) => {
                    if (doc.errMessage) {
                        doc.errCd = "E01";
                        errJsonObj.errFlag = "true";
                        errJsonObj.de.push(doc);
                    } else {
                        saveJsonObj.de.push(doc);
                        saveJsonObj.xflag = true;
                    }
                    return true;
                }); 
            }

        }                
        );          
    } 
    logger.log("info","Exiting anx1ImpExcelJsonService.parse3GObj");
}

function parse3KObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpExcelJsonService.parse3KObj");
    saveJsonObj.impgsez = [];
    errJsonObj.impgsez = [];
    let fp = req.headers["fp"];
    const tableName = "3K";
    if (req.body.impgsez) {
        setDocRefArr(true);
        req.body.impgsez.forEach((impgsezObj) => {
            let saveimpgsezObj = _.cloneDeep(impgsezObj);
            saveimpgsezObj.ctin = saveimpgsezObj.ctin.toUpperCase();
            saveimpgsezObj.legaltradename = saveimpgsezObj.trdnm || "";
            saveimpgsezObj.docs.forEach((doc) => {
                doc.boe_dt = doc.boe.dt;  // required for error excel
                let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                doc.docref = doc.boe.num.concat('|', doc.doctyp, '|', doc.boe.year, '|', fp, '|', req.body.rtnprd, '|', tableName);
                doc.flag = "N";
                doc.status = "";

                doc.uplddt = "";
                doc.suptyp = "Inter-State";
            }
            );
            setDocRefArr(false);
            let errObj = validateAnx1Imp_3K(req.body.gstin, saveimpgsezObj, req.body.rtnprd);
            if (errObj != "{}") {
                errJsonObj.errFlag = "true";
                errJsonObj.impgsez.push(errObj);
            }
            if (errObj.errMessage === undefined || (errObj.errMessage && errObj.errMessage.length == 0)) {
                saveJsonObj.impgsez.push(saveimpgsezObj);
                saveJsonObj.xflag = true;
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3KObj");
}

/** */

function parse3BAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3BAObj");
    let fp = req.headers["fp"];
    let issez = req.headers.issez;
    saveJsonObj.b2ba = [], errJsonObj.b2ba = [];
    const tableName = "3BAO";
    if (req.body.b2ba) {
        setDocRefArr(true);
        req.body.b2ba.forEach((b2baObj) => {

            let saveb2baObjArr = _.cloneDeep(b2baObj);

           // console.log("saveb2baObjArr ::",saveb2baObjArr)
            saveb2baObjArr.ctin = saveb2baObjArr.octin.toUpperCase();
            saveb2baObjArr.revctin = saveb2baObjArr.ctin.toUpperCase();
            saveb2baObjArr.revdoctyp = (saveb2baObjArr.doctyp == "C") ? "CR" : ((saveb2baObjArr.doctyp == "D") ? "DR" : saveb2baObjArr.doctyp);
            saveb2baObjArr.doctyp = (saveb2baObjArr.odoctyp == "C") ? "CR" : ((saveb2baObjArr.odoctyp == "D") ? "DR" : saveb2baObjArr.odoctyp);
           

           
            saveb2baObjArr.legaltradename = saveb2baObjArr.otrdnm || "";
            saveb2baObjArr.revlegaltradename = saveb2baObjArr.trdnm || "";

            saveb2baObjArr.revdiffpercnt = saveb2baObjArr.diffprcnt ? saveb2baObjArr.diffprcnt * 100 : 100;
            saveb2baObjArr.revsec7act = saveb2baObjArr.sec7act || 'N';
            saveb2baObjArr.suptype = calSupTypeFor3BA(req.body.gstin, saveb2baObjArr.pos, saveb2baObjArr.sec7act, issez, saveb2baObjArr.suptype);

            saveb2baObjArr.status = "";
            saveb2baObjArr.rst = "N";

            saveb2baObjArr.upld_dt = "";

            let otmpDt = moment(saveb2baObjArr.odoc.dt, "DD-MM-YYYY");
            saveb2baObjArr.odoc.year = (otmpDt.format("MM") < 4 ? (otmpDt.format("YYYY") - 1).toString() : otmpDt.format("YYYY"));
            saveb2baObjArr.odoc.dt = otmpDt.format("DD/MM/YYYY");
            saveb2baObjArr.docref = saveb2baObjArr.odoc.num.toUpperCase().concat('|', saveb2baObjArr.odoctyp, '|', saveb2baObjArr.odoc.year, '|', fp, '|', req.body.rtnprd, '|', tableName);

            let tmpDt = moment(saveb2baObjArr.doc.dt, "DD-MM-YYYY");
            saveb2baObjArr.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveb2baObjArr.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveb2baObjArr.revdocref = saveb2baObjArr.doc.num.toUpperCase().concat('|', saveb2baObjArr.doctyp, '|', saveb2baObjArr.doc.year, '|', fp, '|', req.body.rtnprd, '|', tableName);

            setDocRefArr(false);

            //  console.log("saveb2baObjArr1 ::",saveb2baObjArr)

            validateAnx1Imp_3BA(saveb2baObjArr, req.body.rtnprd, req.body.gstin);
            //   console.log('validate',saveb2baObjArr);
            if (saveb2baObjArr.valid === 1) {
                saveJsonObj.b2ba.push(saveb2baObjArr);
                saveJsonObj.xflag = true;
            } else {
                saveb2baObjArr.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.b2ba.push(saveb2baObjArr);
            }

        }
        );
    }

    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3BAObj");
}


async function importExcelJson(req, res, ) {
    logger.log("info", "Entering anx1ImpExcelJsonService.importExcelJson");
    try {
        let dbCache = req.app.get('myCache');
        const schemaPath = process.cwd() + "/json/anx1ImpExcelOnlineSchema.json";
        const anx1ImpSchema = fs.readFileSync(schemaPath, { encoding: 'utf8', flag: 'r' });
        let validatorResult = new Validator().validate(req.body, JSON.parse(anx1ImpSchema));

        if (!validatorResult.valid) {
            logger.log("error", "anx1ImpExcelJsonService.importExcelJson|error|schemaValidation:%s|", validatorResult);
            return { message: "Schema validation failed", errObj: validatorResult.errors, isSchemaValid: false };
        }

        req.body.issez = req.body.issez ? req.body.issez.toUpperCase() : req.body.issez;

        if (dbCache.get("ratesKey") != null && dbCache.get("ratesKey") != undefined && dbCache.get("ratesKey") != "") {
            setRatesForValidation(dbCache.get("ratesKey"));
        } else {
            setRatesForValidation(await anx1ImpJson.getRatesFromDb());
        }
        if (dbCache.get("hsnKey") != null && dbCache.get("hsnKey") != undefined && dbCache.get("hsnKey") != "") {
            setHSNMaster(dbCache.get("hsnKey"));
        } else {
            setHSNMaster(await anx1ImpJson.getHSNCodesFromDb());
        }

        let resMsg = validateAnx1Imp_Header(req);
        if (!resMsg.statusCd) {
            logger.log("error", "anx1ImpExcelJsonService.importExcelJson|error|resMsg:%s|", resMsg);
            sendResponse(res, 500, resMsg);
            return 0;
        }

        let saveJsonObj = {}, errJsonObj = {};
        saveJsonObj.gstin = errJsonObj.gstin = req.body.gstin;
        saveJsonObj.rtnprd = errJsonObj.rtnprd = req.body.rtnprd;
        saveJsonObj.profile = errJsonObj.profile = req.headers["profile"];
        saveJsonObj.issez = errJsonObj.issez = req.headers["issez"];
        saveJsonObj.fp = errJsonObj.fp = req.headers["fp"];
        parse3HObj(req, saveJsonObj, errJsonObj);
        parse3AObj(req, saveJsonObj, errJsonObj);
        parse3BObj(req, saveJsonObj, errJsonObj);
        parse3CDObj(req, saveJsonObj, errJsonObj);
        let docRefArr3ef = [], docRefArr3g = [];
        parse3EFObj(req, saveJsonObj, errJsonObj, docRefArr3ef);
        parse3GObj(req, saveJsonObj, errJsonObj, docRefArr3g);
        parse3JObj(req, saveJsonObj, errJsonObj);
        parse3IObj(req, saveJsonObj, errJsonObj);
        parseTab4Obj(req, saveJsonObj, errJsonObj);
        parse3KObj(req, saveJsonObj, errJsonObj);
        parse3LObj(req, saveJsonObj, errJsonObj);
        parse3BAObj(req, saveJsonObj, errJsonObj);
        req.body = saveJsonObj;

        let dbObj = getConnection(req.body.gstin);
        try {
            await runQuery("BEGIN", [], dbObj);

            await anx1ImpJson.process3A(req, dbObj);
            await anx1ImpJson.process3B(req, dbObj);
            await anx1ImpJson.process3CD(req, dbObj);
            await anx1ImpJson.process3H(req, dbObj);
            await anx1ImpJson.process3I(req, dbObj);
            await anx1ImpJson.process3J(req, dbObj);
            await anx1ImpJson.process3K(req, dbObj);
            await anx1ImpJson.processTab4(req, dbObj);
            await anx1ImpJson.process3EF(req, dbObj, docRefArr3ef);
            await anx1ImpJson.process3G(req, dbObj, docRefArr3g);
            await anx1ImpJson.process3L(req, dbObj, docRefArr3g);
            await anx1ImpJson.process3BA(req, dbObj);
            await runQuery("COMMIT", [], dbObj);

            // console.log("dbObj ::",dbObj)
                          
            return (errJsonObj.errFlag) ? { errObj: errJsonObj,xflag: saveJsonObj.xflag, isSchemaValid: true} : 1;
            logger.log("info","anx1ImpExcelJsonService.importExcelJson|success|");                        
        } catch(err){
            await runQuery("ROLLBACK", [], dbObj);
            logger.log("error","anx1ImpExcelJsonService.importExcelJson|error|rollback|err:%s|", err);                        
            if (err.message && err.message.includes("UNIQUE constraint failed")) {
                return { errObj: "Duplicate documents are present. Please correct and upload", xflag: "Duplicate", isSchemaValid: true};
            } else {
                sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
            }
            return 0;    
        } finally {
            await dbClose(dbObj);
        }                          
    } catch(err){
        logger.log("error","anx1ImpExcelJsonServices.catch|error|err:%s|", err);
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.importExcelJson");
    return 1; 
}

// *********************************************************************** 
// Ammendment Related Methods
// ***********************************************************************
async function parse3AAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3AAObj");
    saveJsonObj.b2ca = [];
    errJsonObj.b2ca = [];
    const tableName = "3AA";
    if (req.body.b2ca) {
        setDocRefArr(true);
        for (const b2cObj of req.body.b2ca) {
            // req.body.b2ca.forEach((b2cObj) => {
            //  console.log('b2cObj : ', b2cObj);
            let saveb2cObj = _.cloneDeep(b2cObj);
            saveb2cObj.doctyp = "I";
            saveb2cObj.diffpercnt = saveb2cObj.diffprcnt ? saveb2cObj.diffprcnt * 100 : 100;
            delete saveb2cObj.diffprcnt;
            saveb2cObj.rst = saveb2cObj.flag;
            delete saveb2cObj.flag;

            saveb2cObj.status = "";
            saveb2cObj.rst = "N";

            saveb2cObj.upld_dt = "";
            saveb2cObj.docref = saveb2cObj.pos + "|" + saveb2cObj.diffpercnt + "|" + saveb2cObj.sec7act + "|" + req.body.rtnprd + "|" + tableName;
            saveb2cObj.sec7act = saveb2cObj.sec7act || 'N';
            saveb2cObj.suptype = calSupTypeFor3A(req.body.gstin, saveb2cObj.pos, saveb2cObj.sec7act, saveJsonObj.issez, saveb2cObj.suptype)
            setDocRefArr(false);
            await validateAnx1Imp_3AA(req.body.gstin, saveb2cObj);
            if (saveb2cObj.valid === 1) {
                saveJsonObj.b2ca.push(saveb2cObj);
                saveJsonObj.xflag = true;
            } else {
                saveb2cObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                //  console.log('error items_@_@_@_@_@_@_@_@@__@_@_:', saveb2cObj);
                errJsonObj.b2ca.push(saveb2cObj);
            }
        }
        // );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3AAObj");
}

async function parse3CDAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3CDAObj");
    saveJsonObj.expwpa = [], saveJsonObj.expwopa = [];
    errJsonObj.expwpa = [], errJsonObj.expwopa = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    const tableName = "3CDA";
    setDocRefArr(true);
    setODocRefArr(true);
    if (req.body.expwpa) {
        for(const expwpObj of req.body.expwpa){
        // req.body.expwpa.forEach((expwpObj) => {
            let saveExpwpObj = _.cloneDeep(expwpObj);
            saveExpwpObj.status = "";
            saveExpwpObj.flag = "N";

            saveExpwpObj.doc_date = saveExpwpObj.doc.dt; // required for error excel
            saveExpwpObj.odoc_date = saveExpwpObj.odoc.dt; // required for error excel

            let tmpDt = moment(saveExpwpObj.doc.dt, "DD-MM-YYYY");
            let tmpoDt = moment(saveExpwpObj.odoc.dt, "DD-MM-YYYY");
            saveExpwpObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveExpwpObj.odoc.year = (tmpoDt.format("MM") < 4 ? (tmpoDt.format("YYYY") - 1).toString() : tmpoDt.format("YYYY"));
            saveExpwpObj.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveExpwpObj.doctyp = (saveExpwpObj.doctyp == "C") ? "CR" : ((saveExpwpObj.doctyp == "D") ? "DR" : saveExpwpObj.doctyp);
            saveExpwpObj.odoc.dt = tmpoDt.format("DD/MM/YYYY");
            saveExpwpObj.odoctyp = (saveExpwpObj.odoctyp == "C") ? "CR" : ((saveExpwpObj.odoctyp == "D") ? "DR" : saveExpwpObj.odoctyp);
            saveExpwpObj.docref = (saveExpwpObj.doctyp + "|" + saveExpwpObj.doc.num + "|" + saveExpwpObj.doc.year + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
            saveExpwpObj.odocref = (saveExpwpObj.odoctyp + "|" + saveExpwpObj.odoc.num + "|" + saveExpwpObj.odoc.year + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
            saveExpwpObj.suptype = "Inter-State";
            saveExpwpObj.exptype = "EXPWP";
            saveExpwpObj.upld_dt = "";
            saveExpwpObj.sb = saveExpwpObj.sb ? saveExpwpObj.sb : {};
            saveExpwpObj.sb_date = saveExpwpObj.sb.dt ? saveExpwpObj.sb.dt : ""; // required for error excel
            saveExpwpObj.sb.dt = saveExpwpObj.sb.dt ? moment(saveExpwpObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwpObj.sb.dt;
            setDocRefArr(false);
            setODocRefArr(false);
            await validate3cda(req.body.gstin,saveExpwpObj, 'expwpa', rtnprd);

            if (saveExpwpObj.valid === 1) {
                saveJsonObj.expwpa.push(saveExpwpObj);
                saveJsonObj.xflag = true;
            } else {
                saveExpwpObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.expwpa.push(saveExpwpObj);
            }

        }
        // );
    }
    if (req.body.expwopa) {
        // setDocRefArr(true);             
        for(const expwopObj of req.body.expwopa){
        // req.body.expwopa.forEach((expwopObj) => {
            let saveExpwopObj = _.cloneDeep(expwopObj);
            saveExpwopObj.status = "";
            saveExpwopObj.flag = "N";
            saveExpwopObj.doc_date = saveExpwopObj.doc.dt; // required for error excelc
            saveExpwopObj.odoc_date = saveExpwopObj.odoc.dt; // required for error excelc
            let tmpDt = moment(saveExpwopObj.doc.dt, "DD-MM-YYYY");
            let tmpoDt = moment(saveExpwopObj.odoc.dt, "DD-MM-YYYY");
            saveExpwopObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveExpwopObj.odoc.year = (tmpoDt.format("MM") < 4 ? (tmpoDt.format("YYYY") - 1).toString() : tmpoDt.format("YYYY"));
            saveExpwopObj.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveExpwopObj.doctyp = (saveExpwopObj.doctyp == "C") ? "CR" : ((saveExpwopObj.doctyp == "D") ? "DR" : saveExpwopObj.doctyp);
            saveExpwopObj.odoc.dt = tmpoDt.format("DD/MM/YYYY");
            saveExpwopObj.odoctyp = (saveExpwopObj.odoctyp == "C") ? "CR" : ((saveExpwopObj.odoctyp == "D") ? "DR" : saveExpwopObj.odoctyp);
            saveExpwopObj.docref = (saveExpwopObj.doctyp + "|" + saveExpwopObj.doc.num + "|" + saveExpwopObj.doc.year + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
            saveExpwopObj.odocref = (saveExpwopObj.odoctyp + "|" + saveExpwopObj.odoc.num + "|" + saveExpwopObj.odoc.year + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
            saveExpwopObj.suptype = "Inter-State";
            saveExpwopObj.exptype = "EXPWOP";
            saveExpwopObj.upld_dt = "";
            saveExpwopObj.sb = saveExpwopObj.sb ? saveExpwopObj.sb : {};
            saveExpwopObj.sb_date = saveExpwopObj.sb.dt ? saveExpwopObj.sb.dt : ""; // required for error excel
            saveExpwopObj.sb.dt = saveExpwopObj.sb.dt ? moment(saveExpwopObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwopObj.sb.dt;
            setDocRefArr(false);
            setODocRefArr(false);
            await validate3cda(req.body.gstin,saveExpwopObj, 'expwopa', rtnprd);

            if (saveExpwopObj.valid === 1) {
                saveJsonObj.expwopa.push(saveExpwopObj);
                saveJsonObj.xflag = true;
            } else {
                saveExpwopObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.expwopa.push(saveExpwopObj);
            }

        }
        // );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3CDAObj");
}

async function importExcelJsonA(req, res, ) {
    logger.log("info", "Entering anx1ImpExcelJsonService.importExcelJsonA");
    try {
        let dbCache = req.app.get('myCache');
        const schemaPath = process.cwd() + "/json/anx1aImpExcelSchema.json";
        const anx1AImpSchema = fs.readFileSync(schemaPath, { encoding: 'utf8', flag: 'r' });
        let validatorResult = new Validator().validate(req.body, JSON.parse(anx1AImpSchema));

        if (!validatorResult.valid) {
            logger.log("error", "anx1ImpExcelAJsonService.importExcelJson|error|schemaValidation:%s|", validatorResult);
            return { message: "Schema validation failed", errObj: validatorResult.errors, isSchemaValid: false };
        }
        // console.log('importExcelJsonA req value', req.body);
        req.body.issez = req.body.issez ? req.body.issez.toUpperCase() : req.body.issez;
        if (dbCache.get("ratesKey") != null && dbCache.get("ratesKey") != undefined && dbCache.get("ratesKey") != "") {
            setRatesForValidation(dbCache.get("ratesKey"));
        } else {
            setRatesForValidation(await anx1ImpJson.getRatesFromDb());
        }
        if (dbCache.get("hsnKey") != null && dbCache.get("hsnKey") != undefined && dbCache.get("hsnKey") != "") {
            setHSNMaster(dbCache.get("hsnKey"));
        } else {
            setHSNMaster(await anx1ImpJson.getHSNCodesFromDb());
        }
        
        let resMsg = validateAnx1Imp_Header(req);
        if (!resMsg.statusCd) {
            logger.log("error", "anx1ImpExcelAJsonService.importExcelJson|error|resMsg:%s|", resMsg);
            sendResponse(res, 500, resMsg);
            return 0;
        }

        let saveJsonObj = {}, errJsonObj = {};
        saveJsonObj.gstin = errJsonObj.gstin = req.body.gstin;
        saveJsonObj.rtnprd = errJsonObj.rtnprd = req.body.rtnprd;
        saveJsonObj.profile = errJsonObj.profile = req.headers["profile"];
        saveJsonObj.issez = errJsonObj.issez = req.headers["issez"];
        saveJsonObj.fp = errJsonObj.fp = req.headers["fp"];
        await parse3AAObj(req, saveJsonObj, errJsonObj);
        await parse3CDAObj(req, saveJsonObj, errJsonObj);
        await parse3HAObj(req, saveJsonObj, errJsonObj);
        await parse3IAObj(req, saveJsonObj, errJsonObj);
        await parseTab4AObj(req, saveJsonObj, errJsonObj);
        await parse3JAObj(req, saveJsonObj, errJsonObj);
        await parse3KAObj(req, saveJsonObj, errJsonObj);
        req.body = saveJsonObj;

        let dbObj = getConnection(req.body.gstin);
        try {
            await runQuery("BEGIN", [], dbObj);

            await anx1ImpJson.process3AA(req, dbObj);
            await anx1ImpJson.process3CDA(req, dbObj);
            await anx1ImpJson.process3HA(req, dbObj);
            await anx1ImpJson.process3IA(req, dbObj);
            await anx1ImpJson.processTab4A(req, dbObj);
            await anx1ImpJson.process3JA(req, dbObj);
            await anx1ImpJson.process3KA(req, dbObj);

            await runQuery("COMMIT", [], dbObj);

            // console.log("dbObj ::",dbObj)

            return (errJsonObj.errFlag) ? { errObj: errJsonObj, xflag: saveJsonObj.xflag, isSchemaValid: true } : 1;
            logger.log("info", "anx1ImpExcelJsonService.importExcelJson|success|");
        } catch (err) {
            await runQuery("ROLLBACK", [], dbObj);
            logger.log("error", "anx1ImpExcelJsonService.importExcelJson|error|rollback|err:%s|", err);
            if (err.message && err.message.includes("UNIQUE constraint failed")) {
                return { errObj: "Duplicate documents are present. Please correct and upload", xflag: "Duplicate", isSchemaValid: true };
            } else {
                sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
            }
            return 0;
        } finally {
            await dbClose(dbObj);
        }
    } catch (err) {
        logger.log("error", "anx1ImpExcelJsonServices.catch|error|err:%s|", err);
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.importExcelJsonA");
    return 1;
}

async function parse3HAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3HAObj");
    saveJsonObj.reva = [];
    errJsonObj.reva = [];
    const tableName = "3HA";
    if (req.body.reva) {
        setDocRefArr(true);
        for(const revArrObj of req.body.reva){
        // req.body.reva.forEach((revArrObj) => {
            let saveRevObj = _.cloneDeep(revArrObj);
            saveRevObj.ctin = saveRevObj.ctin.toUpperCase();
            saveRevObj.docs.forEach((doc) => {
                doc.doctyp = "I";
                doc.legaltradename = saveRevObj.trdnm || "";
                doc.diffpercnt = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
                delete doc.diffprcnt;
                doc.status = "";
                doc.rst = "N";
                doc.upld_dt = "";
                doc.docref = saveRevObj.ctin + "|" + doc.pos + "|" + doc.diffpercnt + "|" + doc.sec7act + "|" + req.body.rtnprd + "|" + tableName;
                doc.sec7act = doc.sec7act || 'N';
                doc.suptype = (saveRevObj.type === "G" || saveRevObj.type === "g") ? calSupTypeFor3H(saveRevObj.ctin, doc.pos, doc.sec7act, saveJsonObj.issez, doc.suptyp) : (doc.suptyp == "inter" ? "Inter-State" : "Intra-State");
            }
            );
            setDocRefArr(false);
            let errObj = await validateAnx1Imp_3HA(saveRevObj, req.body.gstin);
            
            if (errObj != "{}") {
                errJsonObj.errFlag = "true";
                errJsonObj.reva.push(errObj);
            }
            if (errObj.errMessage === undefined || (errObj.errMessage && errObj.errMessage.length == 0)) {
                saveJsonObj.reva.push(saveRevObj);
                saveJsonObj.xflag = true;
            }
            // await validateAnx1Imp_3HA(saveRevObj, req.body.gstin);

            // if (saveRevObj.valid === 1) {
            //     saveJsonObj.reva.push(saveRevObj);
            //     saveJsonObj.xflag = true;
            // } else {
            //     saveRevObj.errCd = "E01";
            //     errJsonObj.errFlag = "true";
            //     errJsonObj.reva.push(saveRevObj);
            // }
        }
        // );

    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3HAObj");
}

async function parse3IAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3IAObj");
    saveJsonObj.impsa = [];
    errJsonObj.impsa = [];
    const tableName = "3IA";
    if (req.body.impsa) {
        setDocRefArr(true);
        for(const impsaObj of req.body.impsa){
        // req.body.impsa.forEach((impsObj) => {
            let saveimpsObj = _.cloneDeep(impsaObj);
            saveimpsObj.diffpercnt = "100";
            saveimpsObj.flag = "N";
            saveimpsObj.status = "";
            saveimpsObj.upldt = "";
            saveimpsObj.docref = saveimpsObj.pos + "|" + req.body.rtnprd + "|" + tableName;
            saveimpsObj.suptype = "Inter-State";
            saveimpsObj.status = (req.headers["flag"] == "F" || req.headers["flag"] == "X") ? "" : "Uploaded";
            setDocRefArr(false);
            await validateAnx1Imp_3IA(req.body.gstin,saveimpsObj);
            if (saveimpsObj.valid === 1) {
                saveJsonObj.impsa.push(saveimpsObj);
                saveJsonObj.xflag = true;
            } else {
                saveimpsObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.impsa.push(saveimpsObj);
            }

        }
        // );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3IAObj");
}

async function parseTab4AObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parseTab4AObj");
    saveJsonObj.ecoma = [];
    errJsonObj.ecoma = [];
    const tableName = "4A";
    if (req.body.ecoma) {
        setDocRefArr(true);
        for(const ecomObj of req.body.ecoma){
        // req.body.ecoma.forEach((ecomObj) => {
            let saveEcomObj = _.cloneDeep(ecomObj);
            saveEcomObj.etin = saveEcomObj.etin.toUpperCase();
            saveEcomObj.flag = "N";
            saveEcomObj.status = "";

            saveEcomObj.lgltrdname = saveEcomObj.trdnm || "";
            saveEcomObj.upldt = "";
            saveEcomObj.docref = saveEcomObj.etin + "|" + req.body.rtnprd + "|" + tableName;
            saveEcomObj.status = (req.headers["flag"] == "F" || req.headers["flag"] == "X") ? "" : "Uploaded";
            setDocRefArr(false);
            await validateAnx1Imp_tab4A(req.body.gstin,saveEcomObj);
            if (saveEcomObj.valid === 1) {
                saveJsonObj.ecoma.push(saveEcomObj);
                saveJsonObj.xflag = true;
            } else {
                saveEcomObj.errCd = "E01";
                errJsonObj.errFlag = "true";
                errJsonObj.ecoma.push(saveEcomObj);
            }

        }
        // );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parseTab4AObj");
}

async function parse3JAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3JAObj");
    saveJsonObj.impga = [];
    errJsonObj.impga = [];
    let fp = req.headers["fp"];
    const tableName = "3JA";
    if (req.body.impga) {

        setOrgDocRefArr(true);
        setDocRefArr(true);
        for(const impgObj of req.body.impga){
        // req.body.impga.forEach((impgObj) => {
            let saveimpgObj = _.cloneDeep(impgObj);
            // saveimpgObj.status = "";
            // saveimpgObj.flag = "N";

            saveimpgObj.uplddt = "";
            saveimpgObj.suptyp = "Inter-State";

            saveimpgObj.docs.forEach((doc) => {
                // console.log('BOE details ', doc);
                let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                let tmpODt = moment(doc.oboe.dt, "DD-MM-YYYY");
                doc.boe_dt = doc.boe.dt; //for error excel
                doc.oboe_dt = doc.oboe.dt; //for error excel
                doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                doc.oboe.year = (tmpODt.format("MM") < 4 ? (tmpODt.format("YYYY") - 1).toString() : tmpODt.format("YYYY"));
                doc.oboe.dt = tmpODt.format("DD/MM/YYYY");
                doc.docref = (doc.boe.num + "|" + doc.boe.year + "|" + doc.boe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                doc.odocref = (doc.oboe.num + "|" + doc.oboe.year + "|" + doc.oboe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                doc.status = "";
                doc.flag = "N";
            }
            );
            setDocRefArr(false);
            setOrgDocRefArr(false);
            let errObj = await validateAnx1Imp_3JA(saveimpgObj, req.body.rtnprd,req.body.gstin);
            console.log('errObj **************************** : ', errObj);
            if (errObj != "{}") {
                errJsonObj.errFlag = "true";
                errJsonObj.impga.push(errObj);
            }

            if (errObj.errMessage === undefined || (errObj.errMessage && errObj.errMessage.length == 0)) {
                saveJsonObj.impga.push(saveimpgObj);
                saveJsonObj.xflag = true;
            }
        }
        // );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3JAObj");
}

async function parse3KAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpExcelJsonService.parse3KAObj");
    saveJsonObj.impgseza = [];
    errJsonObj.impgseza = [];
    let fp = req.headers["fp"];
    const tableName = "3KA";
    if (req.body.impgseza) {
        setOrgDocRefArr(true);
        setDocRefArr(true);
        for(const impgsezObj of req.body.impgseza){
        // req.body.impgseza.forEach((impgsezObj) => {
            let saveimpgsezObj = _.cloneDeep(impgsezObj);
            // console.log('>>> saveimpgsezObj ', saveimpgsezObj);
            saveimpgsezObj.ctin = saveimpgsezObj.ctin.toUpperCase();
            saveimpgsezObj.octin = saveimpgsezObj.octin.toUpperCase();
            saveimpgsezObj.legaltradename = saveimpgsezObj.trdnm || "";
            saveimpgsezObj.olegaltradename = saveimpgsezObj.otrdnm || "";
            saveimpgsezObj.docs.forEach((doc) => {
                doc.boe_dt = doc.boe.dt;  // required for error excel
                let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                doc.oboe_dt = doc.oboe.dt;  // required for error excel
                let tmpODt = moment(doc.oboe.dt, "DD-MM-YYYY");
                doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                doc.oboe.year = (tmpODt.format("MM") < 4 ? (tmpODt.format("YYYY") - 1).toString() : tmpODt.format("YYYY"));
                doc.oboe.dt = tmpODt.format("DD/MM/YYYY");
                doc.docref = (doc.boe.num + "|" + doc.doctyp + "|" + doc.boe.year + "|" + doc.boe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                doc.odocref = (doc.oboe.num + "|" + doc.odoctyp + "|" + doc.oboe.year + "|" + doc.oboe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                doc.flag = "N";
                doc.status = "";

                doc.uplddt = "";
                doc.suptyp = "Inter-State";
            }
            );
            setOrgDocRefArr(false);
            setDocRefArr(false);
            let errObj = await validateAnx1Imp_3KA(req.body.gstin, saveimpgsezObj, req.body.rtnprd);
            if (errObj != "{}") {
                errJsonObj.errFlag = "true";
                errJsonObj.impgseza.push(errObj);
            }
            if (errObj.errMessage === undefined || (errObj.errMessage && errObj.errMessage.length == 0)) {
                saveJsonObj.impgseza.push(saveimpgsezObj);
                saveJsonObj.xflag = true;
            }
        }
        // );
    }
    logger.log("info", "Exiting anx1ImpExcelJsonService.parse3KAObj");
}

module.exports = {
    importExcelJson : importExcelJson,
    importExcelJsonA : importExcelJsonA
}