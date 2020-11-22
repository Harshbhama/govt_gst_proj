/**
 * @file parses json file, validates, and persists ANX1 bulk data
 * @author Jagadeesh Rajendran.
 * @since 2019-06-14.
 */

const fs = require('fs');
const Validator = require('jsonschema').Validator;
const moment = require('moment');
const { sendResponse, calSupTypeFor3A, calSupTypeFor3B, calSupTypeFor3L, calSupTypeFor3G, calSupTypeFor3H, calSupTypeFor3BA } = require("../../utility/common");
const { validateAnx1Imp_Header, validateAnx1Imp_3H, validateAnx1Imp_3A, validateAnx1Imp_3B, validateAnx1Imp_3BA,
    validate3cd, validateAnx1Imp_3J, validateAnx1Imp_3I, validateAnx1Imp_3AA, validate3cda, validateAnx1Imp_3JA, validateAnx1Imp_3KA, validateAnx1Imp_tab4A,
    validateAnx1Imp_tab4, validate3EFor3G, validateAnx1Imp_3K, setRatesForValidation, setHSNMaster, validateAnx1Imp_3L, validate3EFA_Imp, validate3GA } = require("../../utility/validators/anx1Validators/anx1ImpValidator");
const { anx1Queries } = require("../../db/Queries");
const { anx1aQueries } = require("../../db/queriesanx1a");
const anx1Queries2 = require("../../db/anx1Queries/anx1Queries").anx1Queries;
const anx1ImpDao = require("../../dao/anx1Dao/anx1ImpDao");
const logger = require('../../utility/logger').logger;
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH, OFFLINE_TOOL_DB, DB_EXT } = require('../../utility/constants');
const Promise = require("bluebird");
const _ = require("lodash");
const { getRows, runQuery, dbClose, getConnection } = require("../../db/dbUtil");
const anx1aImpDao = require("../../dao/anx1ADao/anx1AImpDao");


/* function getConnection(gstin) {
    const dbObj = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    return dbObj;
} */

async function getRatesFromDb(){
    let dbObj = new sqlite3.Database(DB_PATH + OFFLINE_TOOL_DB + DB_EXT);
    let rows = await getRows("select RATE as rate from RATE_MASTER", [], dbObj);
    dbClose(dbObj);
    return rows.map((row) => row.rate);
}

async function getHSNCodesFromDb(){
    let dbObj = new sqlite3.Database(DB_PATH + OFFLINE_TOOL_DB + DB_EXT);
    let rows = await getRows("SELECT HSN_CD from HSN_MASTER", [], dbObj);
    dbClose(dbObj);
    return rows.map((row) => row.HSN_CD);
}

function parse3HObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpService.parse3HObj");
    saveJsonObj.rev = [];
    errJsonObj.rev = [];
    //let issez = req.headers["issez"];
    const tableName = "3H";    
    if(req.body.rev) {
        req.body.rev.forEach((revArrObj) => {
          let saveRevObj = _.cloneDeep(revArrObj);
          saveRevObj.ctin = saveRevObj.ctin.toUpperCase();
          saveRevObj.docs.forEach((doc) => {                                    
            doc.doctyp = "I";
            doc.legaltradename = saveRevObj.trdnm || "";
            doc.diffpercnt = doc.diffprcnt?doc.diffprcnt*100:100;
                  delete doc.diffprcnt;
                  
                  doc.rst = doc.flag;
                  delete doc.flag;   

                  doc.status = (req.headers["flag"] === "F") ? "" : getStatus(doc.action);
                  doc.rst = (req.headers["flag"] === "F") ? "F" : "U";
                  doc.upld_dt =(req.headers["flag"] == "F") ? "" : formatUploadDate(doc.uplddt); 
                
                  doc.docref = saveRevObj.ctin + "|" + doc.pos + "|" + doc.diffpercnt + "|" + doc.sec7act + "|" + req.body.rtnprd + "|" + tableName;
				  doc.sec7act = doc.sec7act || 'N';	
                  doc.suptype = (saveRevObj.type === "G" ||saveRevObj.type === "g")?calSupTypeFor3H(saveRevObj.ctin, doc.pos, doc.sec7act, saveJsonObj.issez, doc.suptyp):(doc.suptyp == "inter"?"Inter-State":"Intra-State");              
                }                
          );
          if(req.headers["flag"]== "F"){
            saveJsonObj.rev.push(saveRevObj);
          }
          else{
          validateAnx1Imp_3H(saveRevObj, req.body.gstin);
          if(saveRevObj.valid === 1){
            saveJsonObj.rev.push(saveRevObj);
            saveJsonObj.xflag = true;
          } else {        
            saveRevObj.errCd = "E01";
            errJsonObj.errFlag = "true";
            errJsonObj.rev.push(saveRevObj);
          }
        }
    }
      );   
      
    }
    logger.log("info","Exiting anx1ImpService.parse3HObj");
}

function parse3AObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpService.parse3AObj");
    saveJsonObj.b2c = [];
    errJsonObj.b2c = [];
    let issez = req.headers["issez"];
    let headerFlag = req.headers["flag"];
    const tableName = "3A";    
    if(req.body.b2c) {           
        req.body.b2c.forEach((b2cObj) => {
                let saveb2cObj = _.cloneDeep(b2cObj);
                saveb2cObj.doctyp = "I";
                saveb2cObj.diffpercnt = saveb2cObj.diffprcnt?saveb2cObj.diffprcnt*100 : 100;
                delete saveb2cObj.diffprcnt;
                saveb2cObj.rst = saveb2cObj.flag;
                delete saveb2cObj.flag;      

                saveb2cObj.status = (headerFlag === "F") ? "" : getStatus(saveb2cObj.action);
                saveb2cObj.rst = (headerFlag == "F") ? "F" : "U";
                          
                saveb2cObj.upld_dt =(headerFlag == "F") ? "" : formatUploadDate(saveb2cObj.uplddt);
                saveb2cObj.docref = saveb2cObj.pos + "|" + saveb2cObj.diffpercnt + "|" + saveb2cObj.sec7act + "|" + req.body.rtnprd + "|" + tableName;
                saveb2cObj.sec7act = saveb2cObj.sec7act || 'N';
                saveb2cObj.suptype = calSupTypeFor3A(req.body.gstin, saveb2cObj.pos, saveb2cObj.sec7act, issez, saveb2cObj.suptype)
                if(headerFlag == "F"){
                    saveJsonObj.b2c.push(saveb2cObj);
                  }
                else{  
                validateAnx1Imp_3A(saveb2cObj);
                if(saveb2cObj.valid === 1){
                    saveJsonObj.b2c.push(saveb2cObj);
                    saveJsonObj.xflag = true;
                } else {        
                    saveb2cObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.b2c.push(saveb2cObj);
                }
            }
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpService.parse3AObj");
}

function parse3BObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpService.parse3BObj");
    let fp = req.headers["fp"];
    let issez = req.headers["issez"];
    saveJsonObj.b2b = [], errJsonObj.b2b = [];
    const tableName = "3B";       
    if(req.body.b2b) {
        req.body.b2b.forEach((b2bObj) => {
                let saveb2bObjArr = _.cloneDeep(b2bObj);
                saveb2bObjArr.docs.forEach((doc) => {
                        doc.ctin = saveb2bObjArr.ctin.toUpperCase();
                        doc.doctyp = (doc.doctyp == "C") ? "CR": ((doc.doctyp == "D") ? "DR" : doc.doctyp);                       
                        doc.legaltradename = saveb2bObjArr.trdnm || "";
                        doc.diffpercnt = doc.diffprcnt?doc.diffprcnt*100:100;
                        delete doc.diffprcnt;
                        doc.rst = doc.flag;
                        delete doc.flag;

                        doc.status = (req.headers["flag"] === "F") ? "" : getStatus(doc.action);
			            doc.rst = (req.headers["flag"] == "F") ? "F" : "U";
                        
                        doc.upld_dt = (req.headers["flag"] == "F") ? "" : formatUploadDate(doc.uplddt); 
						doc.sec7act = doc.sec7act || 'N';
                        doc.suptype = calSupTypeFor3B(req.body.gstin, doc.pos, doc.sec7act, issez, doc.suptype);
                        let tmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
                        doc.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                        doc.doc.dt = tmpDt.format("DD/MM/YYYY");
                        doc.docref = doc.doc.num.toUpperCase() + "|" + doc.doctyp + "|" + doc.doc.year + "|" + fp + "|" +  req.body.rtnprd + "|" + tableName;                  
                    }                
                );
                saveb2bObjArr = [...saveb2bObjArr.docs];
                if(req.headers["flag"]== "F"){
                    saveJsonObj.b2b.push(...saveb2bObjArr);
                }
                else{
                validateAnx1Imp_3B(saveb2bObjArr, req.body.rtnprd, req.body.gstin);
                if(saveb2bObjArr.valid === 1){
                    saveJsonObj.b2b.push(...saveb2bObjArr);
                    saveJsonObj.xflag = true;
                } else {        
                    saveb2bObjArr.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.b2b.push(...saveb2bObjArr);
                }
            }
            }
        );      
    }
    logger.log("info","Entering anx1ImpService.parse3BObj");
}
function parse3LObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3LObj");
    let fp = req.headers["fp"];
    let issez = req.headers["issez"];
    saveJsonObj.mis = [], errJsonObj.mis = [];
    const tableName = "3L";
    if (req.body.mis) {
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

                doc.status = (req.headers["flag"] === "F") ? "" : getStatus(doc.action);
                doc.rst = (req.headers["flag"] == "F") ? "F" : "U";

                doc.upld_dt = (req.headers["flag"] == "F") ? "" : formatUploadDate(doc.uplddt);
                doc.sec7act = doc.sec7act || 'N';
                doc.suptype = calSupTypeFor3L(req.body.gstin, doc.pos, doc.sec7act, issez, doc.suptype);
                let tmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
                doc.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.doc.dt = tmpDt.format("DD/MM/YYYY");
                doc.docref = doc.doc.num.toUpperCase() + "|" + doc.doctyp + "|" + doc.doc.year + "|" + fp + "|" + req.body.rtnprd + "|" + doc.tblref + "|" + tableName;
            }
            );
            savemisObjArr = [...savemisObjArr.docs];
            if (req.headers["flag"] == "F") {
                saveJsonObj.mis.push(...savemisObjArr);
            }
            else {
                validateAnx1Imp_3L(savemisObjArr, req.body.rtnprd, req.body.gstin, req.body.issez, req.body.profile);
                if (savemisObjArr.valid === 1) {
                    saveJsonObj.mis.push(...savemisObjArr);
                    saveJsonObj.xflag = true;
                } else {
                    savemisObjArr.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.mis.push(...savemisObjArr);
                }
            }
        }
        );
    }
    logger.log("info", "Entering anx1ImpService.parse3LObj");
}
function parse3CDObj(req, saveJsonObj, errJsonObj) {
    logger.log("info","Entering anx1ImpService.parse3CDObj");
    saveJsonObj.expwp = [], saveJsonObj.expwop = [];
    errJsonObj.expwp = [], errJsonObj.expwop = [];    
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    const tableName = "3CD";    
    if(req.body.expwp) {
        req.body.expwp.forEach((expwpObj) => {
                let saveExpwpObj = _.cloneDeep(expwpObj);
                saveExpwpObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveExpwpObj.action);
                saveExpwpObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
              
                let tmpDt = moment(saveExpwpObj.doc.dt, "DD-MM-YYYY");
                saveExpwpObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                saveExpwpObj.doc.dt = tmpDt.format("DD/MM/YYYY");
                saveExpwpObj.doctyp = (saveExpwpObj.doctyp == "C") ? "CR" : ((saveExpwpObj.doctyp == "D") ? "DR" : saveExpwpObj.doctyp);
                saveExpwpObj.docref = saveExpwpObj.doctyp + "|" + saveExpwpObj.doc.num + "|" + saveExpwpObj.doc.year + "|" + fp +"|"+ req.body.rtnprd + "|" + tableName;
                saveExpwpObj.suptype = "Inter-State";
                saveExpwpObj.exptype = "EXPWP";
                saveExpwpObj.upld_dt = (req.headers["flag"] == "F") ? "" : formatUploadDate(saveExpwpObj.uplddt);
                saveExpwpObj.sb = saveExpwpObj.sb ? saveExpwpObj.sb : {};
                saveExpwpObj.sb.dt = saveExpwpObj.sb.dt ? moment(saveExpwpObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwpObj.sb.dt;
                if(req.headers["flag"]== "F"){
                    saveJsonObj.expwp.push(saveExpwpObj);
                }
                else{
                validate3cd(saveExpwpObj, 'expwp', rtnprd);
                
                if(saveExpwpObj.valid === 1){
                    saveJsonObj.expwp.push(saveExpwpObj);
                    saveJsonObj.xflag = true;
                } else {        
                    saveExpwpObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.expwp.push(saveExpwpObj);
                }
            }
            }                
        );          
    } 
    if(req.body.expwop) {               
        req.body.expwop.forEach((expwopObj) => {
                let saveExpwopObj = _.cloneDeep(expwopObj);
        saveExpwopObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveExpwopObj.action);        
        saveExpwopObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
        
                let tmpDt = moment(saveExpwopObj.doc.dt, "DD-MM-YYYY");
                saveExpwopObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                saveExpwopObj.doc.dt = tmpDt.format("DD/MM/YYYY");
                saveExpwopObj.doctyp = (saveExpwopObj.doctyp == "C") ? "CR" : ((saveExpwopObj.doctyp == "D") ? "DR" : saveExpwopObj.doctyp);
                saveExpwopObj.docref = saveExpwopObj.doctyp + "|" + saveExpwopObj.doc.num + "|" + saveExpwopObj.doc.year + "|" + fp +"|"+ req.body.rtnprd + "|" + tableName;
                saveExpwopObj.suptype = "Inter-State";
                saveExpwopObj.exptype = "EXPWOP";
                saveExpwopObj.upld_dt = (req.headers["flag"] == "F")  ? "" : formatUploadDate(saveExpwopObj.uplddt);
                saveExpwopObj.sb = saveExpwopObj.sb ? saveExpwopObj.sb : {};
                saveExpwopObj.sb.dt = saveExpwopObj.sb.dt ? moment(saveExpwopObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwopObj.sb.dt;
                if(req.headers["flag"]== "F"){
                    saveJsonObj.expwop.push(saveExpwopObj);
                }
                else{
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
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpService.parse3CDObj");
}

function parse3JObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpService.parse3JObj");
    saveJsonObj.impg = [];
    errJsonObj.impg = [];
    let fp = req.headers["fp"];
    const tableName = "3J";    
    if(req.body.impg) {
        req.body.impg.forEach((impgObj) => {
                let saveimpgObj = _.cloneDeep(impgObj);
                saveimpgObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveimpgObj.action);
                saveimpgObj.flag = (req.headers["flag"] == "F")? "F" : "U";
                saveimpgObj.uplddt = (req.headers["flag"] == "F") ? "" : formatUploadDate(saveimpgObj.uplddt); 
                
                saveimpgObj.suptyp = "Inter-State";
                
                saveimpgObj.docs.forEach((doc) => {
                    let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                    doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                    doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                    doc.docref = doc.boe.num + "|" + doc.boe.year + "|" + fp + "|" + req.body.rtnprd + "|" + tableName;
                    }
                );
                
                if(req.headers["flag"]== "F"){
                    saveJsonObj.impg.push(saveimpgObj);
                }
                else{
                validateAnx1Imp_3J(saveimpgObj, req.body.rtnprd);
                
                if(saveimpgObj.valid === 1){
                    saveJsonObj.impg.push(saveimpgObj);
                    saveJsonObj.xflag = true;
                } else {        
                    saveimpgObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.impg.push(saveimpgObj);
                }
            }
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpService.parse3JObj");
}

function parse3IObj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpService.parse3IObj");
    saveJsonObj.imps = [];
    errJsonObj.imps = [];
    const tableName = "3I";    
    if(req.body.imps) {           
        req.body.imps.forEach((impsObj) => {
                let saveimpsObj = _.cloneDeep(impsObj);
                saveimpsObj.diffpercnt = "100";
                saveimpsObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
                saveimpsObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveimpsObj.action);
                saveimpsObj.upldt = (req.headers["flag"] == "F") ? "" : formatUploadDate(saveimpsObj.uplddt);
                
                saveimpsObj.docref = saveimpsObj.pos + "|" + req.body.rtnprd + "|" + tableName;
                saveimpsObj.suptype = "Inter-State";
                
                if(req.headers["flag"]== "F"){
                    saveJsonObj.imps.push(saveimpsObj);
                }
                else{
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
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpService.parse3IObj");
}

function parseTab4Obj(req, saveJsonObj, errJsonObj){
    logger.log("info","Entering anx1ImpService.parseTab4Obj");
    saveJsonObj.ecom = [];
    errJsonObj.ecom = [];
    const tableName = "4";    
    if(req.body.ecom) {           
        req.body.ecom.forEach((ecomObj) => {
                let saveEcomObj = _.cloneDeep(ecomObj);
                saveEcomObj.etin = saveEcomObj.etin.toUpperCase();
                saveEcomObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
                saveEcomObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveEcomObj.action);

                saveEcomObj.lgltrdname = saveEcomObj.trdnm || null;
                saveEcomObj.upldt =  (req.headers["flag"] == "F") ? "" : formatUploadDate(saveEcomObj.uplddt);
                
                saveEcomObj.docref = saveEcomObj.etin + "|" + req.body.rtnprd + "|" + tableName;
                                
                if(req.headers["flag"]== "F"){
                    saveJsonObj.ecom.push(saveEcomObj);
                }
                else{
                validateAnx1Imp_tab4(saveEcomObj);
                if(saveEcomObj.valid === 1){
                    saveJsonObj.ecom.push(saveEcomObj);
                    saveJsonObj.xflag = true;
                } else {        
                    saveEcomObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.ecom.push(saveEcomObj);
                }
            }
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpService.parseTab4Obj");
}

function parse3EFObj(req, saveJsonObj, errJsonObj, docRefArr3ef) {
    logger.log("info", "Entering anx1ImpService.parse3EFObj");
    saveJsonObj.sezwp = [], saveJsonObj.sezwop = [];
    errJsonObj.sezwp = [], errJsonObj.sezwop = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    if (req.body.sezwp) {
        req.body.sezwp.forEach((sezwpObj) => {
            let saveSezwpObj = _.cloneDeep(sezwpObj);
            saveSezwpObj.ctin = saveSezwpObj.ctin.toUpperCase();
            saveSezwpObj.docs.forEach((doc) => {
                set3efDocDetails(doc, 'sezwp', fp, rtnprd, saveSezwpObj.ctin, saveSezwpObj.trdnm, docRefArr3ef, req);
            });

            saveSezwpObj = saveSezwpObj.docs;
            if(req.headers["flag"]== "F"){
                saveJsonObj.sezwp.push(...saveSezwpObj);
            }
            else{
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
                if(req.headers["flag"]== "F"){
                    saveJsonObj.sezwop.push(...saveSezwopObj);
                }
                else{
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
            }                
        );          
    }
    logger.log("info","Exiting anx1ImpService.parse3EFObj");
}

function set3efDocDetails(doc, type, fp, rtnprd, ctin, trdnm, docRefArr3ef, req) {

    logger.log("info", "Exiting anx1ImpService.set3efDocDetails");
    let total_txval = 0, total_igst = 0, total_cess = 0;

    doc.ctin = ctin;
    doc.legaltradename = trdnm || "";
    doc.diff_percentage = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
    doc.doc_type = doc.doctyp;
    doc.supply_type = "Inter-State";
    doc.fp = fp;
    doc.taxperiod = rtnprd;

    if (req.headers["flag"] === "F") {
        doc.status = "";
        doc.flag = "F"
        doc.upload_date = "";
    } else {
        doc.status = getStatus(doc.action);
        doc.flag = "U"
        doc.upload_date = formatUploadDate(doc.uplddt);
    }

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
function set3efaDocDetails(doc, type, fp, rtnprd, docRefArr3efa, req) {

    // console.log("in set3efa")
    logger.log("info", "Entering anx1ImpService.set3efaDocDetails");
    let total_txval = 0, total_igst = 0, total_cess = 0;

    //Revised Details
    doc.rev_ctin = doc.ctin.toUpperCase();
    doc.rev_legaltradename = doc.trdnm || "";
    doc.rev_supply_type = "Inter-State";
    doc.rev_diff_percentage = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
    doc.rev_doc_num = doc.doc.num;
    doc.rev_doc_val = doc.doc.val;
    let revTmpDt = moment(doc.doc.dt, "DD-MM-YYYY");
    doc.rev_doc_year = (revTmpDt.format("MM") < 4 ? (revTmpDt.format("YYYY") - 1).toString() : revTmpDt.format("YYYY"));
    doc.rev_doctyp = (doc.doctyp == "C") ? "CR" : ((doc.doctyp == "D") ? "DR" : doc.doctyp);
    doc.rev_docref = doc.doc.num.concat('|', doc.doctyp, '|', doc.rev_doc_year, '|', fp, '|', rtnprd, '|', '3EFA');
    doc.rev_doc_date = revTmpDt.format("DD/MM/YYYY");

    //Original Details 
    doc.ctin = doc.octin.toUpperCase();
    doc.legaltradename = doc.otrdnm || "";
    //doc.doc_type = doc.odoctyp;
    doc.doctyp = (doc.odoctyp == "C") ? "CR" : ((doc.odoctyp == "D") ? "DR" : doc.odoctyp);
    doc.doc_num = doc.odoc.num;
    let tmpDt = moment(doc.odoc.dt, "DD-MM-YYYY");
    doc.doc_year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
    doc.doc_date = tmpDt.format("DD/MM/YYYY");
    doc.docref = doc.odoc.num + "|" + doc.odoctyp + "|" + doc.doc_year + "|" + fp + "|" + rtnprd + "|3EFA";

    //Common Details
    doc.fp = fp;
    doc.taxperiod = rtnprd;

    if (req.headers["flag"] === "F") {
        doc.status = "";
        doc.flag = "F"
        doc.upload_date = "";
    } else {
        if (doc.doc_status == 'I') {
            doc.status = 'Invalid'
        } else {
            doc.status = getStatus(doc.action);
        }
        doc.flag = 'U';//(doc.invalid.toUpperCase() == 'Y' ? 'D' : 'U');
        doc.upload_date = formatUploadDate(doc.uplddt);
    }

    docRefArr3efa.push(doc.docref);
    //docRefArr3efa.push(doc.rev_docref);


    doc.errorcode = doc.errorDetails ? doc.errorDetails.errCd : null;
    doc.error_detail = doc.errorDetails ? doc.errorDetails.errMsg : null;

    doc.items.forEach((item) => {
        total_txval += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
        if (type === 'sezwpa') {
            total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
            total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);
        }
    });

    doc.rev_taxable_value = total_txval;

    if (type === 'sezwpa') {
        doc.payTyp = "SEZWPA";
        doc.clmrfnd = doc.clmrfnd;
        doc.igst = total_igst;
        doc.cess = total_cess;
    }

    if (type === 'sezwopa') {
        doc.payTyp = "SEZWOPA";
        doc.clmrfnd = null;
        doc.igst = null;
        doc.cess = null;
    }

    logger.log("debug", "Exiting anx1ImpService.set3efaDocDetails");
}

function parse3GObj(req, saveJsonObj, errJsonObj, docRefArr3g) {
    logger.log("info", "Entering anx1ImpService.parse3GObj");
    saveJsonObj.de = [];
    errJsonObj.de = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    let issez = req.headers["issez"];
    if (req.body.de) {
        req.body.de.forEach((deObj) => {
            let saveDEObj = _.cloneDeep(deObj);

            saveDEObj.docs.forEach((doc) => {
                let total_txval = 0, total_igst = 0, total_cgst = 0, total_sgst = 0, total_cess = 0;
                doc.ctin = saveDEObj.ctin.toUpperCase();
                doc.legaltradename = saveDEObj.trdnm || "";
                doc.diff_percentage = doc.diffprcnt ? doc.diffprcnt * 100 : 100;
                doc.doc_type = doc.doctyp;
                doc.sec7 = doc.sec7act || 'N';
                doc.supply_type = calSupTypeFor3G(req.body.gstin, doc.pos, doc.sec7act, issez, doc.suptype);
                doc.fp = fp;
                doc.taxperiod = rtnprd;

                if (req.headers["flag"] === "F") {
                    doc.status = "";
                    doc.flag = "F"
                    doc.upload_date = "";
                } else {
                    doc.status = getStatus(doc.action);
                    doc.flag = "U"
                    doc.upload_date = formatUploadDate(doc.uplddt);
                }

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
            if(req.headers["flag"]=="F"){
                saveJsonObj.de.push(...saveDEObj);  
            }
            else{
            validate3EFor3G(saveDEObj, req.body.gstin, 'de', rtnprd);
            
            if(saveDEObj.valid === 1){
                saveJsonObj.de.push(...saveDEObj);
                saveJsonObj.xflag = true;         
            } else {
                saveDEObj.every((doc) => {
                    if(doc.errMessage){
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
        }                
        );          
    } 
    logger.log("info","Exiting anx1ImpService.parse3GObj");
}
function parse3GAObj(req, saveJsonObj, errJsonObj, docRefArr3ga) {
    logger.log("info", "Entering anx1ImpService.parse3GAObj");
    saveJsonObj.dea = [];
    errJsonObj.dea = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    let issez = req.headers["issez"];
    if (req.body.dea) {
        req.body.dea.forEach((deaObj) => {
            let saveDEAObj = _.cloneDeep(deaObj);

            //  console.log("saveDEAObj ::",saveDEAObj)
            let total_txval = 0, total_igst = 0, total_cgst = 0, total_sgst = 0, total_cess = 0;
            saveDEAObj.ctin = saveDEAObj.octin.toUpperCase();
            saveDEAObj.rev_ctin = saveDEAObj.ctin.toUpperCase();

            saveDEAObj.legaltradename = saveDEAObj.otrdnm || "";
            saveDEAObj.rev_legaltradename = saveDEAObj.trdnm || "";

            saveDEAObj.diff_percentage = saveDEAObj.diffprcnt ? saveDEAObj.diffprcnt * 100 : 100;
            saveDEAObj.rev_doctype = (saveDEAObj.doctyp === "C") ? "CR" : ((saveDEAObj.doctyp === "D") ? "DR" : saveDEAObj.doctyp);
            saveDEAObj.doctype = (saveDEAObj.odoctyp === "C") ? "CR" : ((saveDEAObj.odoctyp === "D") ? "DR" : saveDEAObj.odoctyp);
            saveDEAObj.rev_sec7 = saveDEAObj.sec7act || 'N';
            saveDEAObj.supply_type = calSupTypeFor3G(req.body.gstin, saveDEAObj.pos, saveDEAObj.sec7act, issez, saveDEAObj.suptype);
            saveDEAObj.fp = fp;
            saveDEAObj.taxperiod = rtnprd;

            if (req.headers["flag"] === "F") {
                saveDEAObj.status = "";
                saveDEAObj.flag = "F"
                saveDEAObj.upload_date = "";
            } else {
                if (saveDEAObj.doc_status == 'I') {
                    saveDEAObj.status = 'Invalid'
                } else {
                    saveDEAObj.status = getStatus(saveDEAObj.action);
                }

                saveDEAObj.flag = 'U'//(saveDEAObj.invalid.toUpperCase() == 'Y' ? 'D' : 'U');
                saveDEAObj.upload_date = formatUploadDate(saveDEAObj.uplddt);
            }

            saveDEAObj.doc_num = saveDEAObj.odoc.num;
            saveDEAObj.rev_doc_num = saveDEAObj.doc.num;

            saveDEAObj.rev_doc_val = saveDEAObj.doc.val;
            let tmpDt = moment(saveDEAObj.odoc.dt, "DD-MM-YYYY");
            saveDEAObj.doc_year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            let revTmpDt = moment(saveDEAObj.doc.dt, "DD-MM-YYYY");
            saveDEAObj.rev_doc_year = (revTmpDt.format("MM") < 4 ? (revTmpDt.format("YYYY") - 1).toString() : revTmpDt.format("YYYY"));

            saveDEAObj.docref = saveDEAObj.doc.num.concat('|', saveDEAObj.doctyp, '|', saveDEAObj.doc_year, '|', fp, '|', rtnprd, '|', '3GA');
            docRefArr3ga.push(saveDEAObj.docref);
            saveDEAObj.doc_date = tmpDt.format("DD/MM/YYYY");
            saveDEAObj.rev_doc_date = revTmpDt.format("DD/MM/YYYY");

            saveDEAObj.errorcode = saveDEAObj.errorDetails ? saveDEAObj.errorDetails.errCd : null;
            saveDEAObj.error_detail = saveDEAObj.errorDetails ? saveDEAObj.errorDetails.errMsg : null;


            saveDEAObj.items.forEach((item) => {
                total_txval += parseFloat((item.txval === "" || item.txval == null) ? 0 : item.txval);
                total_igst += parseFloat((item.igst == "" || item.igst == null) ? 0 : item.igst);
                total_cgst += parseFloat((item.cgst == "" || item.cgst == null) ? 0 : item.cgst);
                total_sgst += parseFloat((item.sgst == "" || item.sgst == null) ? 0 : item.sgst);
                total_cess += parseFloat((item.cess == "" || item.cess == null) ? 0 : item.cess);
            });

            saveDEAObj.taxable_value = total_txval;
            saveDEAObj.igst = total_igst;
            saveDEAObj.cgst = total_cgst;
            saveDEAObj.sgst = total_sgst;
            saveDEAObj.cess = total_cess;

            if (req.headers["flag"] == "F") {
                saveJsonObj.dea.push(saveDEAObj);
            }
            else {
                logger.log("info", "before i call validate");
                validate3GA(saveDEAObj, req.body.gstin, 'dea', rtnprd);
                logger.log("info", "after i call validate");
                saveDEAObj.valid = 1;
                if (saveDEAObj.valid === 1) {
                    saveJsonObj.dea.push(saveDEAObj);
                    saveJsonObj.xflag = true;
                    logger.log("info", "after i call if");
                } else {
                    saveDEAObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.dea.push(saveDEAObj);
                    logger.log("info", "after i call else");
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3GAObj");
}

function parse3KObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3KObj");
    saveJsonObj.impgsez = [];
    errJsonObj.impgsez = [];
    let fp = req.headers["fp"];
    const tableName = "3K";
    if (req.body.impgsez) {
        req.body.impgsez.forEach((impgsezObj) => {
            let saveimpgsezObj = _.cloneDeep(impgsezObj);
            saveimpgsezObj.ctin = saveimpgsezObj.ctin.toUpperCase();
            saveimpgsezObj.legaltradename = saveimpgsezObj.trdnm || "";
            saveimpgsezObj.docs.forEach((doc) => {
                let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                doc.docref = doc.boe.num.concat('|', doc.doctyp, '|', doc.boe.year, '|', fp, '|', req.body.rtnprd, '|', tableName);

                if (req.headers["flag"] === "F") {
                    doc.status = "";
                    doc.flag = "F"
                    doc.uplddt = "";
                } else {
                    doc.status = getStatus(doc.action);
                    doc.flag = "U"
                    doc.uplddt = formatUploadDate(doc.uplddt);
                }

                doc.suptyp = "Inter-State";
            }
            );
            if (req.headers["flag"] == "F") {
                saveJsonObj.impgsez.push(saveimpgsezObj);
            } else {
                validateAnx1Imp_3K(req.body.gstin, saveimpgsezObj, req.body.rtnprd);
                if (saveimpgsezObj.valid === 1) {
                    saveJsonObj.impgsez.push(saveimpgsezObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveimpgsezObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.impgsez.push(saveimpgsezObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3KObj");
}


function parse3BAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3BAObj");
    let fp = req.headers["fp"];
    let issez = req.headers["issez"];
    saveJsonObj.b2ba = [], errJsonObj.b2ba = [];
    tableName ="";
 

    if (req.body.b2ba) {
        req.body.b2ba.forEach((b2baObj) => {
            let saveb2baObj = _.cloneDeep(b2baObj);

            if (saveb2baObj.typ === 'O') {
                tableName = "3BAO";
            } else {
                tableName = "3BA";
            }
            saveb2baObj.ctin = saveb2baObj.octin.toUpperCase();
            saveb2baObj.revctin = saveb2baObj.ctin.toUpperCase();

            saveb2baObj.orgdoctyp = (saveb2baObj.odoctyp == "C") ? "CR" : ((saveb2baObj.odoctyp == "D") ? "DR" : saveb2baObj.odoctyp);
            saveb2baObj.revdoctyp = (saveb2baObj.doctyp == "C") ? "CR" : ((saveb2baObj.doctyp == "D") ? "DR" : saveb2baObj.doctyp);

            saveb2baObj.legaltradename = saveb2baObj.otrdnm || "";
            saveb2baObj.revlegaltradename = saveb2baObj.trdnm || "";

            saveb2baObj.revdiffpercnt = saveb2baObj.diffprcnt ? saveb2baObj.diffprcnt * 100 : 100;
            saveb2baObj.revsec7act = saveb2baObj.sec7act || 'N';
            saveb2baObj.suptype = calSupTypeFor3BA(req.body.gstin, saveb2baObj.pos, saveb2baObj.sec7act, issez, saveb2baObj.suptype);

            if (req.headers["flag"] === "F") {
                saveb2baObj.status = "";
                saveb2baObj.rst = "F"
                saveb2baObj.upld_dt = "";
            } else {

                if (saveb2baObj.doc_status == 'I') {
                    saveb2baObj.status = 'Invalid';
                } else {
                    saveb2baObj.status = getStatus(saveb2baObj.action);
                }
                saveb2baObj.rst = 'U';//(saveb2baObj.invalid.toUpperCase() == 'Y' ? 'D' : 'U');
                saveb2baObj.upld_dt = formatUploadDate(saveb2baObj.uplddt);
            }

            let otmpDt = moment(saveb2baObj.odoc.dt, "DD-MM-YYYY");
            saveb2baObj.odoc.year = (otmpDt.format("MM") < 4 ? (otmpDt.format("YYYY") - 1).toString() : otmpDt.format("YYYY"));
            saveb2baObj.odoc.dt = otmpDt.format("DD/MM/YYYY");
            saveb2baObj.docref = saveb2baObj.odoc.num.toUpperCase().concat('|', saveb2baObj.odoctyp, '|', saveb2baObj.odoc.year, '|', fp, '|', req.body.rtnprd, '|', tableName);

            let tmpDt = moment(saveb2baObj.doc.dt, "DD-MM-YYYY");
            saveb2baObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveb2baObj.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveb2baObj.revdocref = saveb2baObj.doc.num.toUpperCase().concat('|', saveb2baObj.doctyp, '|', saveb2baObj.doc.year, '|', fp, '|', req.body.rtnprd, '|', tableName);

            if (req.headers["flag"] == "F") {
                saveJsonObj.b2ba.push(saveb2baObj);
            }
            else {
                validateAnx1Imp_3BA(saveb2baObj, req.body.rtnprd, req.body.gstin);
                if (saveb2baObj.valid === 1) {
                    saveJsonObj.b2ba.push(saveb2baObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveb2baObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.b2ba.push(saveb2baObj);
                }
            }
        }
        );
    }
    logger.log("info", "Entering anx1ImpService.parse3BAObj");
}

function parse3EFAObj(req, saveJsonObj, errJsonObj, docRefArr3efa) {
    logger.log("info", "Entering anx1ImpService.parse3EFAObj");
    saveJsonObj.sezwpa = [], saveJsonObj.sezwopa = [];
    errJsonObj.sezwpa = [], errJsonObj.sezwopa = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    if (req.body.sezwpa) {
        req.body.sezwpa.forEach((sezwpaObj) => {
            let saveSezwpaObj = _.cloneDeep(sezwpaObj);
            set3efaDocDetails(saveSezwpaObj, 'sezwpa', fp, rtnprd, docRefArr3efa, req);

            // saveSezwpaObj = saveSezwpaObj.docs;
            if (req.headers["flag"] == "F") {
                saveJsonObj.sezwpa.push(saveSezwpaObj);
            }
            else {
                validate3EFA_Imp(saveSezwpaObj, req.body.gstin, 'sezwpa', rtnprd);

                if (saveSezwpaObj.valid === 1) {
                    saveJsonObj.sezwpa.push(saveSezwpaObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveSezwpaObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.sezwpa.push(saveSezwpaObj);
                }
            }
        }
        );
    }
    if (req.body.sezwopa) {
        req.body.sezwopa.forEach((sezwopaObj) => {
            let saveSezwopaObj = _.cloneDeep(sezwopaObj);
            set3efaDocDetails(saveSezwopaObj, 'sezwopa', fp, rtnprd, docRefArr3efa, req);

            //    saveSezwopaObj = saveSezwopaObj.docs;
            if (req.headers["flag"] == "F") {
                saveJsonObj.sezwopa.push(saveSezwopaObj);
            }
            else {
                validate3EFA_Imp(saveSezwopaObj, req.body.gstin, 'sezwopa', rtnprd);
                if (saveSezwopaObj.valid === 1) {
                    saveJsonObj.sezwopa.push(saveSezwopaObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveSezwpaObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.sezwopa.push(saveSezwpaObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3EFAObj");
}
async function importJson(req, res) {
    logger.log("info","Entering anx1ImpService.importJson");
    try {                
        const schemaPath = process.cwd() + "/json/anx1ImpOnlineSchema.json";
        const anx1ImpSchema = fs.readFileSync(schemaPath, {encoding: 'utf8', flag: 'r'});
        let validatorResult = new Validator().validate(req.body, JSON.parse(anx1ImpSchema));
       
        if(!validatorResult.valid){
            logger.log("error", "anx1ImpService.importJson|error|schemaValidation:%s|", validatorResult);
            sendResponse(res, 500, { message: "Json is not valid. Kindly generate json from GST portal and try to upload again", errDesc: validatorResult.toString(), statusCd: 0 });
            return 0;
        }

        req.body.issez = req.body.issez ? req.body.issez.toUpperCase() : req.body.issez;
        setRatesForValidation(await getRatesFromDb());
        setHSNMaster(await getHSNCodesFromDb());
        let resMsg = validateAnx1Imp_Header(req);
        if(!resMsg.statusCd){
            logger.log("error", "anx1ImpService.importJson|error|resMsg:%s|", resMsg);
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
        let docRefArr3ef = [], docRefArr3g = []; docRefArr3efa = []; docRefArr3ga = [];
        parse3EFObj(req, saveJsonObj, errJsonObj, docRefArr3ef);
        parse3GObj(req, saveJsonObj, errJsonObj, docRefArr3g);
        parse3GAObj(req, saveJsonObj, errJsonObj, docRefArr3ga);
        parse3JObj(req, saveJsonObj, errJsonObj);
        parse3IObj(req, saveJsonObj, errJsonObj);
        parseTab4Obj(req, saveJsonObj, errJsonObj);
        parse3KObj(req, saveJsonObj, errJsonObj);
        parse3LObj(req, saveJsonObj, errJsonObj);
        parse3BAObj(req, saveJsonObj, errJsonObj);
        parse3EFAObj(req, saveJsonObj, errJsonObj, docRefArr3efa);

        if (errJsonObj.errFlag) {
            logger.log("error", "anx1ImpService.importJson|error|errJson:%s|", JSON.stringify(errJsonObj));
            sendResponse(res, 500, { message: "Imported json is not valid. Please download the json from ANX1 Online and try again!", statusCd: 0 });
            return 0;
        }
        req.body = saveJsonObj;
        // logger.log("info","anx1ImpService.importJson|saveJson:%s|", JSON.stringify(saveJsonObj));
        let dbObj = getConnection(req.body.gstin);
        try {
            await runQuery("BEGIN", [], dbObj);

            await Promise.mapSeries([process3H, process3A, process3B, process3CD, process3J, process3I, processTab4, process3K, process3L, process3BA], (processData) => {
                return processData(req, dbObj);
            }
            );
            await process3EF(req, dbObj, docRefArr3ef);
            await process3EFA(req, dbObj, docRefArr3efa)
            await process3G(req, dbObj, docRefArr3g);
            await process3GA(req, dbObj, docRefArr3ga);
            await runQuery("COMMIT", [], dbObj);
            if (req.headers["flag"] == "F") {
                sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
            } else {
                sendResponse(res, 200, { message: "Json imported successfully", statusCd: 1 });
            }
            logger.log("info", "anx1ImpService.importJson|success|");
        } catch (err) {
            await runQuery("ROLLBACK", [], dbObj);
            logger.log("error", "anx1ImpService.importJson|error|rollback|err:%s|", err);
            if (err.message && err.message.includes("UNIQUE constraint failed")) {
                sendResponse(res, 500, { message: "Duplicate documents are present. Please correct and upload", statusCd: 0 });
            } else {
               // console.log("err check ::", err)
                sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
            }
            return 0;    
        } finally {
            await dbClose(dbObj);
        }
    } catch (err) {
        logger.log("error", "anx1ImpService.catch|error|err:%s|", err);
       // console.log("err check b2bao ::", err)
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    }
    logger.log("info", "Exiting anx1ImpService.importJson");
    return 1; 
}

async function process3H(req, dbObj){
    logger.log("info","Entering anx1ImpService.process3H");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3H";
    let anx13hParamArr = [], itemListParamArr = [], docRefArr = [];
    if(!(Array.isArray(req.body.rev) && req.body.rev.length)){
        logger.log("info","Exiting anx1ImpService.process3H|emptyArray|");
        return Promise.resolve();
    }
    req.body.rev.forEach((revArrObj) => {                         
        revArrObj.docs.forEach((doc) => {
                let total_txval =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
                doc.items.forEach((item) => {
                    total_txval += parseFloat((item.txval) ? item.txval : 0);
                    total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
                    total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
                    total_igst += parseFloat((item.igst) ? item.igst : 0);
                    total_cess += parseFloat((item.cess) ? item.cess : 0);
                    let itemListParam = [item.hsn, item.rate, item.txval, ((item.igst == 0 || item.igst)?item.igst:null), (item.cgst ==0||item.cgst)?item.cgst :null, (item.sgst==0||  item.sgst)?item.sgst : null,  
                                          (item.cess == 0 || item.cess)?item.cess : null, doc.docref];
                        itemListParamArr.push(itemListParam);
                    }
                );                    
                let anx13hParam = [doc.docref, revArrObj.ctin, doc.legaltradename, doc.pos, total_txval, total_igst, total_cgst,
                    total_sgst, total_cess, doc.diffpercnt, doc.sec7act, doc.suptype, doc.upld_dt || null, doc.rst || null,
                    doc.status, fp, doc.doctyp || null, req.body.rtnprd, (doc.errorDetails?doc.errorDetails.errCd:null), (doc.errorDetails?doc.errorDetails.errMsg:null)];
                anx13hParamArr.push(anx13hParam);
                docRefArr.push(doc.docref);
            }
        );
        }
    );

    //console.log("docRefArr", anx13hParamArr)
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3hdetails,
        removeSummary : anx1Queries.importJson.removeSummary,
        removeErrSummary : anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1Queries.table3h.save3h,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1Queries.summary.calculate3HSumm,
        getCountMarkForDel: anx1Queries.summary.getCountMarkForDelfor3H,
        calcErrSumm : anx1Queries.errorSummary.calculate3HErrorSumm,
        getCountOfYetTobeCorrected : anx1Queries.errorSummary.getErrorCountfor3H
    };    
    await anx1ImpDao.save3Hor3A_Imp(docRefArr, anx13hParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.process3H");
}

async function process3A(req, dbObj){
    logger.log("info","Entering anx1ImpService.process3A");
    let gstin = req.body.gstin;
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3A";
    let anx13AParamArr = [],itemListParamArr = [], docRefArr = [];
    if(!(Array.isArray(req.body.b2c) && req.body.b2c.length)){
        logger.log("info","Exiting anx1ImpService.process3A|emptyArray|");
        return Promise.resolve();
    }
    req.body.b2c.forEach((b2cObj) => {                                 
            let total_txval =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
            b2cObj.items.forEach((item) => {
                total_txval += parseFloat((item.txval) ? item.txval : 0);
                total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
                total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
                total_igst += parseFloat((item.igst) ? item.igst : 0);
                total_cess += parseFloat((item.cess) ? item.cess : 0);
                let itemListParam = [item.hsn || null, item.rate, item.txval || 0,  ((item.igst == 0 || item.igst)?item.igst:null), (item.cgst ==0||item.cgst)?item.cgst :null, (item.sgst==0||  item.sgst)?item.sgst : null,  
                    (item.cess == 0 || item.cess)?item.cess : null, b2cObj.docref];
                    itemListParamArr.push(itemListParam);
                }
            );                    
            let anx13AParam = [b2cObj.docref, b2cObj.pos, b2cObj.diffpercnt, b2cObj.doctyp || null, b2cObj.sec7act, b2cObj.upld_dt || null, 
                b2cObj.suptype, fp, req.body.rtnprd, total_txval, total_cgst, total_igst, 
                total_sgst, total_cess, b2cObj.status, b2cObj.rst || null, (b2cObj.errorDetails?b2cObj.errorDetails.errCd:null), (b2cObj.errorDetails?b2cObj.errorDetails.errMsg:null)];
            anx13AParamArr.push(anx13AParam);
            docRefArr.push(b2cObj.docref);
        }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3adetails,
        removeSummary : anx1Queries.importJson.removeSummary,
        removeErrSummary : anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1Queries.table3a.save3a,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1Queries.summary.calculate3ASumm,
        getCountMarkForDel: anx1Queries.summary.getCountMarkForDelfor3A,
        calcErrSumm : anx1Queries.errorSummary.calculate3AErrorSumm,
        getCountOfYetTobeCorrected : anx1Queries.errorSummary.getCountErrorfor3A
    };
    await anx1ImpDao.save3Hor3A_Imp(docRefArr, anx13AParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.process3A");
}

async function process3B(req, dbObj){
    logger.log("info","Entering anx1ImpService.process3B");
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    let anx13bParamArr = [];
    let itemListParamArr = [], docRefArr = [], ctinArr = [], doctypArr = [];
    if(!(Array.isArray(req.body.b2b) && req.body.b2b.length)){
        logger.log("info","Exiting anx1ImpService.process3B|emptyArray|");
        return Promise.resolve();
    }
    req.body.b2b.forEach((b2bObj) => {
        let total_txval =0, total_sgst =0, total_cgst =0, total_igst=0 , total_cess  = 0;
        b2bObj.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
            total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn, item.rate, item.txval || 0,  ((item.igst == 0 || item.igst)?item.igst:null), (item.cgst ==0||item.cgst)?item.cgst :null, (item.sgst==0||  item.sgst)?item.sgst : null,  
                (item.cess == 0 || item.cess)?item.cess : null, b2bObj.docref];
                itemListParamArr.push(itemListParam);
            }
        ); 
        // console.log("B2b status", b2bObj.status);      
        let anx13bParam = [b2bObj.docref, b2bObj.ctin, b2bObj.legaltradename, b2bObj.pos, total_txval, total_igst, total_cgst,
            total_sgst, total_cess, b2bObj.diffpercnt, b2bObj.sec7act, b2bObj.suptype, b2bObj.upld_dt || null, b2bObj.rst || null,
            b2bObj.status, fp, b2bObj.doctyp || null, req.body.rtnprd, (b2bObj.errorDetails?b2bObj.errorDetails.errCd:null),  (b2bObj.errorDetails?b2bObj.errorDetails.errMsg:null), b2bObj.doc.num, b2bObj.doc.dt, b2bObj.doc.val, b2bObj.doc.year, (b2bObj.recipientType ? b2bObj.recipientType : null)];
        anx13bParamArr.push(anx13bParam);
        docRefArr.push(b2bObj.docref);
        ctinArr.push(b2bObj.ctin);
        doctypArr.push(b2bObj.doctyp);           
        }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3bdetails,
        saveDetails: anx1Queries.table3b.save3b,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
    };    
    await anx1ImpDao.save3B_Imp(docRefArr, anx13bParamArr, itemListParamArr, ctinArr, doctypArr, fp, rtnprd, impQuery, dbObj, req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.process3B");
}

async function process3L(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3L");
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    let anx13LParamArr = [];
    let itemListParamArr = [], docRefArr = [], ctinArr = [], doctypArr = [];
    if (!(Array.isArray(req.body.mis) && req.body.mis.length)) {
        logger.log("info", "Exiting anx1ImpService.process3L|emptyArray|");
        return Promise.resolve();
    }
    req.body.mis.forEach((misObj) => {
        let total_txval = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
        misObj.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
            total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn, item.rate, item.txval || 0, ((item.igst == 0 || item.igst) ? item.igst : null), (item.cgst == 0 || item.cgst) ? item.cgst : null, (item.sgst == 0 || item.sgst) ? item.sgst : null,
            (item.cess == 0 || item.cess) ? item.cess : null, misObj.docref];
            itemListParamArr.push(itemListParam);
        }
        );
        let anx13LParam = [misObj.tblref, misObj.docref, misObj.ctin, misObj.legaltradename, misObj.doctyp || null, misObj.doc.num, misObj.doc.dt, misObj.doc.year, misObj.doc.val, misObj.pos, misObj.diffpercnt, misObj.sec7act,
            total_txval, total_igst, total_cgst, total_sgst, total_cess, misObj.suptype, misObj.clmrfnd, misObj.upld_dt || null, misObj.rst || null,
        misObj.status, fp, req.body.rtnprd, (misObj.errorDetails ? misObj.errorDetails.errCd : null), (misObj.errorDetails ? misObj.errorDetails.errMsg : null)];
        anx13LParamArr.push(anx13LParam);
        docRefArr.push(misObj.docref);
        ctinArr.push(misObj.ctin);
        doctypArr.push(misObj.doctyp);
    }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1Queries.importJson.remove3ldetails,
        saveDetails: anx1Queries.table3l.save,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
    };
    await anx1ImpDao.save3L_Imp(docRefArr, anx13LParamArr, itemListParamArr, ctinArr, doctypArr, fp, rtnprd, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3L");
}

function getParmListFor3cd(req, arr3cd, docTypArr) {
    logger.log("info", "Entering anx1ImpService.getParmListFor3cd");
    let fp = req.headers["fp"];
    let anx13cdParamArr = [], itemListParamArr = [], docRefArr = [];
    arr3cd.forEach((obj3cd) => {
        let total_txval = 0, total_igst = 0, total_cess = 0;
        obj3cd.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn, item.rate, item.txval || 0, ((item.igst || item.igst == 0) ? item.igst : null), undefined, undefined,
            ((item.cess || item.cess == 0) ? item.cess : null), obj3cd.docref];
            itemListParamArr.push(itemListParam);
        }
        );
        let anx13cdParam = [obj3cd.doctyp, req.body.gstin, obj3cd.docref, obj3cd.doc.num, obj3cd.doc.dt, obj3cd.doc.val, obj3cd.doc.year, obj3cd.exptype,
        obj3cd.sb.num || null, obj3cd.sb.dt || null, obj3cd.sb.pcode || null, total_txval, total_igst, total_cess,
            obj3cd.suptype, obj3cd.upld_dt || null, obj3cd.flag || null, obj3cd.status || null, fp, req.body.rtnprd,  (obj3cd.errorDetails?obj3cd.errorDetails.errCd:null), (obj3cd.errorDetails?obj3cd.errorDetails.errMsg:null)];
        anx13cdParamArr.push(anx13cdParam);
        docRefArr.push(obj3cd.docref);
        docTypArr.push(obj3cd.doctyp);
    }
    );
    logger.log("info","Exiting anx1ImpService.getParmListFor3cd");    
    return [docRefArr, anx13cdParamArr, itemListParamArr]
}

async function process3CD(req, dbObj) {
    logger.log("info","Entering anx1ImpService.process3CD");
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    let tableTyp = "3CD";
    let processArr = [], wpDocTypArr = [], wopDocTypArr = [];
    if(req.body.expwp) {
        if((Array.isArray(req.body.expwp) && req.body.expwp.length)){
            processArr.push(getParmListFor3cd(req, req.body.expwp, wpDocTypArr));
        }        
    }
    if(req.body.expwop) {
        if((Array.isArray(req.body.expwop) && req.body.expwop.length)){
            processArr.push(getParmListFor3cd(req, req.body.expwop, wopDocTypArr));
        }        
    }
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3cddetails,
        saveDetails: anx1Queries.table3cd.save3cd,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
    };
    let exptypeObj = { 
        expwp: wpDocTypArr,
        expwop: wopDocTypArr
    }    
    await Promise.mapSeries(processArr, (ParamArr) => {
            return anx1ImpDao.save3cd_Imp(ParamArr[0], ParamArr[1], ParamArr[2], exptypeObj, fp, rtnprd, tableTyp, impQuery, dbObj,req.headers['flag']);
        }
    );
    logger.log("info","Exiting anx1ImpService.process3CD");
}

async function process3EF(req, dbObj, docRefArr3ef) {
    logger.log("info","Entering anx1ImpService.process3EF");
    
    if(!(Array.isArray(req.body.sezwp) && req.body.sezwp.length) && !(Array.isArray(req.body.sezwop) && req.body.sezwop.length)){
        logger.log("info","Exiting anx1ImpService.process3EF|emptyArray|");
        return Promise.resolve();
    }

    let efQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3efdetails
    };
    
    await anx1ImpDao.save3ef(docRefArr3ef, req.body.sezwp, req.body.sezwop, efQuery, dbObj, req.body.gstin,req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.process3EF");
}
async function process3EFA(req, dbObj, docRefArr3efa) {
    logger.log("info", "Entering anx1ImpService.process3EFA");
    //  console.log("Entering anx1ImpService.process3EFA");

    if (!(Array.isArray(req.body.sezwpa) && req.body.sezwpa.length) && !(Array.isArray(req.body.sezwopa) && req.body.sezwopa.length)) {
        logger.log("info", "Exiting anx1ImpService.process3EFA|emptyArray|");
        return Promise.resolve();
    }

    let efQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1Queries.importJson.remove3efadetails
    };

    await anx1ImpDao.save3efa(docRefArr3efa, req.body.sezwpa, req.body.sezwopa, efQuery, dbObj, req.body.gstin, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3EFA");
}

async function process3G(req, dbObj, docRefArr3g) {
    logger.log("info","Entering anx1ImpService.process3G");
    
    if(!(Array.isArray(req.body.de) && req.body.de.length)){
        logger.log("info","Exiting anx1ImpService.process3G|emptyArray|");
        return Promise.resolve();
    }

    let query = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3gdetails
    };

    await anx1ImpDao.save3g(docRefArr3g, req.body.de, query, dbObj, req.body.gstin , req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.process3G");
}

async function process3GA(req, dbObj, docRefArr3ga) {
    logger.log("info", "Entering anx1ImpService.process3GA");

    if (!(Array.isArray(req.body.dea) && req.body.dea.length)) {
        logger.log("info", "Exiting anx1ImpService.process3GA|emptyArray|");
        return Promise.resolve();
    }

    let query = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1Queries.importJson.remove3gadetails
    };

    await anx1ImpDao.save3ga(docRefArr3ga, req.body.dea, query, dbObj, req.body.gstin, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3GA");
}
async function process3J(req, dbObj){
    logger.log("info","Entering anx1ImpService.process3J");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3J";
    let anx13JParamArr = [], itemListParamArr = [], docRefArr = [];
    if(!(Array.isArray(req.body.impg) && req.body.impg.length)){
        logger.log("info","Exiting anx1ImpService.process3J|emptyArray|");                          
        return Promise.resolve();
    }
    req.body.impg.forEach((impgObj) => {            
            impgObj.docs.forEach((doc) => {                
                    let total_txval = 0, total_igst = 0, total_cess = 0;
                    doc.items.forEach((item) => {
                        total_txval += parseFloat((item.txval) ? item.txval : 0);
                        total_igst += parseFloat((item.igst) ? item.igst : 0);
                        total_cess += parseFloat((item.cess) ? item.cess : 0);
                        let itemListParam = [item.hsn, item.rate, item.txval, item.igst, null, null,
                            item.cess, doc.docref];
                            itemListParamArr.push(itemListParam);
                        }
                    );
                    let anx13JParam = [doc.docref, doc.doctyp, impgObj.pos || null, doc.boe.num, doc.boe.pcode, doc.boe.dt, 
                        doc.boe.val, doc.boe.year, total_txval, total_igst, 
                        total_cess, impgObj.suptyp, impgObj.uplddt, impgObj.rfndelg || "Y", impgObj.flag, impgObj.status, fp, req.body.rtnprd ,(doc.errorDetails?doc.errorDetails.errCd:null) ,(doc.errorDetails?doc.errorDetails.errMsg:null) ];
                    anx13JParamArr.push(anx13JParam);
                    docRefArr.push(doc.docref);
                }
            );                                        
        }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3jdetails,
        removeSummary : anx1Queries.importJson.removeSummary,
        removeErrSummary : anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1Queries2.table3j.save3j,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1Queries2.table3j.calculate3jSumm,
        getCountMarkForDel: anx1Queries2.table3j.getCountMarkForDelfor3j,
        calcErrSumm : anx1Queries.errorSummary.calculate3jErrSumm,
        getCountOfYetTobeCorrected : anx1Queries.errorSummary.getYetToBeCorrectedCount3j
        
    };
    await anx1ImpDao.save3J_Imp(docRefArr, anx13JParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj,req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.process3J");                          
}

async function process3I(req, dbObj){
    logger.log("info","Entering anx1ImpService.process3I");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3I";
    let anx13iParamArr = [], itemListParamArr = [], docRefArr = [];
    if(!(Array.isArray(req.body.imps) && req.body.imps.length)){
        logger.log("info","Exiting anx1ImpService.process3I|emptyArray|");                          
        return Promise.resolve();
    }
    req.body.imps.forEach((impsObj) => {                                 
            let total_txval = 0, total_igst = 0, total_cess = 0;
            impsObj.items.forEach((item) => {
                total_txval += parseFloat((item.txval) ? item.txval : 0);
                total_igst += parseFloat((item.igst) ? item.igst : 0);
                total_cess += parseFloat((item.cess) ? item.cess : 0);
                let itemListParam = [item.hsn, item.rate, item.txval, item.igst || 0, item.cgst || null, item.sgst || null,
                    item.cess || 0, impsObj.docref];
                    itemListParamArr.push(itemListParam);
                }
            );                    
            let anx13iParam = [impsObj.docref, impsObj.pos, total_txval, total_igst, total_cess, impsObj.suptype, 
                impsObj.upldt, impsObj.diffpercnt, impsObj.rfndelg || "Y", impsObj.flag, impsObj.status, fp, req.body.rtnprd ,
                impsObj.errorDetails? impsObj.errorDetails.errCd :null, impsObj.errorDetails?impsObj.errorDetails.errMsg : null];
            anx13iParamArr.push(anx13iParam);
            docRefArr.push(impsObj.docref);       
        }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3idetails,
        removeSummary : anx1Queries.importJson.removeSummary,
        removeErrSummary : anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1Queries2.table3i.save3i,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1Queries2.table3i.calculate3iSumm,
        getCountMarkForDel: anx1Queries2.table3i.getCountMarkForDelfor3i,
        calcErrSumm : anx1Queries.errorSummary.calculate3iErrSumm,
        getCountOfYetTobeCorrected : anx1Queries.errorSummary.getYetToBeCorrectedCount3i

    };
    await anx1ImpDao.save3I_Imp(docRefArr, anx13iParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3I");
}


async function process3BA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3BA");
    let fp = req.headers["fp"];
    let tableType = "";
    let rtnprd = req.body.rtnprd;
    let anx13baParamArr = [], anx13baoParamArr = [];
    let itemListParamArr = [], b2baDocRefArr = [], b2baCtinArr = [], b2baDoctypArr = [];
    let b2baoDocRefArr = [], b2baoCtinArr = [], b2baoDoctypArr = [];
    if (!(Array.isArray(req.body.b2ba) && req.body.b2ba.length)) {
        logger.log("info", "Exiting anx1ImpService.process3BA|emptyArray|");
        return Promise.resolve();
    }
    req.body.b2ba.forEach((b2baObj) => {
        let total_txval = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
        b2baObj.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
            total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn, item.rate, item.txval || 0, ((item.igst == 0 || item.igst) ? item.igst : null), (item.cgst == 0 || item.cgst) ? item.cgst : null, (item.sgst == 0 || item.sgst) ? item.sgst : null,
            (item.cess == 0 || item.cess) ? item.cess : null, b2baObj.docref];
            itemListParamArr.push(itemListParam);
        }
        );


        
        let anx13bParam = [b2baObj.docref, b2baObj.revdocref, b2baObj.ctin, b2baObj.legaltradename, b2baObj.doctyp, b2baObj.odoc.num, b2baObj.odoc.dt, b2baObj.odoc.year, b2baObj.ctin_type,
        b2baObj.upld_dt || null, b2baObj.rst || null, b2baObj.revctin, b2baObj.revlegaltradename, b2baObj.revdoctyp, b2baObj.doc.num, b2baObj.doc.dt, b2baObj.doc.year, b2baObj.doc.val,
        b2baObj.pos, b2baObj.revdiffpercnt, b2baObj.revsec7act, total_txval, b2baObj.revctin_type, total_igst, total_cgst, total_sgst, total_cess, b2baObj.suptype, b2baObj.status, fp,
        req.body.rtnprd, (b2baObj.errorDetails ? b2baObj.errorDetails.errCd : null), (b2baObj.errorDetails ? b2baObj.errorDetails.errMsg : null)];

      //  console.log("anx13bParam ::",anx13bParam)
        if (b2baObj.typ && b2baObj.typ == "O") {
            tableType ="3BAO"
            anx13baoParamArr.push(anx13bParam);
            b2baoDocRefArr.push(b2baObj.docref);
            b2baoCtinArr.push(b2baObj.revctin);
            b2baoDoctypArr.push(b2baObj.revdoctyp);
        } else {
            tableType ="3BA"
            anx13baParamArr.push(anx13bParam);
            b2baDocRefArr.push(b2baObj.docref);
            b2baCtinArr.push(b2baObj.revctin);
            b2baDoctypArr.push(b2baObj.revdoctyp);
        }
    }
    );
    if (b2baCtinArr.length > 0) {
        impQuery = {
            removeItemDetails: anx1Queries.importJson.removeItemDetails,
            removeDetails: anx1Queries.importJson.remove3badetails,
            saveDetails: anx1Queries.tableB2BA.saveb2ba,
            saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
            
        };
    } else {
        impQuery = {
            removeItemDetails: anx1Queries.importJson.removeItemDetails,
            removeDetails: anx1Queries.importJson.remove3baodetails,
            saveDetails: anx1Queries.tableB2BAO.saveb2bao,
            saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        };
    }



    await anx1ImpDao.save3BA_Imp(b2baDocRefArr, b2baoDocRefArr, anx13baParamArr, anx13baoParamArr, itemListParamArr, b2baCtinArr, b2baoCtinArr, b2baDoctypArr, b2baoDoctypArr, fp, rtnprd, impQuery, dbObj, req.headers["flag"], tableType);
    logger.log("info", "Exiting anx1ImpService.process3BA");
}

async function processTab4(req, dbObj){
    logger.log("info","Entering anx1ImpService.processTab4");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "4";
    let anx14ParamArr = [], docRefArr = [];
    if(!(Array.isArray(req.body.ecom) && req.body.ecom.length)){
        logger.log("info","Exiting anx1ImpService.processTab4|emptyArray|");
        return Promise.resolve();
    }
    req.body.ecom.forEach((ecomObj) => {                                                                 
            let anx14Param = [ecomObj.docref, ecomObj.etin, ecomObj.lgltrdname, 
                ecomObj.sup, ecomObj.supr, ecomObj.nsup, null, ecomObj.cgst, ecomObj.igst, ecomObj.sgst, ecomObj.cess,
                ecomObj.upldt, fp, req.body.rtnprd, ecomObj.status, ecomObj.flag , ecomObj.errorDetails?ecomObj.errorDetails.errCd:null, ecomObj.errorDetails?ecomObj.errorDetails.errMsg:null];
            anx14ParamArr.push(anx14Param);
            docRefArr.push(ecomObj.docref);       
        }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.remove4details,
        removeDetails : anx1Queries.importJson.remove4details,
        removeSummary : anx1Queries.importJson.removeSummary,
        saveDetails: anx1Queries2.table4.save4,
        removeErrorSummary:anx1Queries.importJson.removeErrorSummary,
        calcSumm: anx1Queries2.table4.calculate4Summ,
        calcErrSumm:anx1Queries2.table4.calculate4ErrSumm,
        getCountMarkForDel: anx1Queries2.table4.getCountMarkForDelfor4,
        getCountYetToCorrectForDelfor4:anx1Queries2.table4.getCountYetToCorrectForDelfor4,
        saveSumm: anx1Queries.importJson.save4summ,
        saveErrSumm: anx1Queries.importJson.save4Errsumm
    };
    await anx1ImpDao.saveTab4_Imp(docRefArr, anx14ParamArr, fp, rtnprd, tableTyp, impQuery, dbObj,req.headers["flag"]);
    logger.log("info","Exiting anx1ImpService.processTab4");
}

async function process3K(req, dbObj){
    logger.log("info","Entering anx1ImpService.process3K");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let anx13KParamArr = [], itemListParamArr = [], docRefArr = [], ctinArr = [];
    if(!(Array.isArray(req.body.impgsez) && req.body.impgsez.length)){
        logger.log("info","Exiting anx1ImpService.process3K|emptyArray|");    
        return Promise.resolve();
    }
    req.body.impgsez.forEach((impgsezObj) => {            
            impgsezObj.docs.forEach((doc) => {
                    let total_txval = 0, total_igst = 0, total_cess = 0;                
                    doc.items.forEach((item) => {
                        total_txval += parseFloat((item.txval) ? item.txval : 0);
                        total_igst += parseFloat((item.igst) ? item.igst : 0);
                        total_cess += parseFloat((item.cess) ? item.cess : 0);
                        let itemListParam = [item.hsn, item.rate, item.txval || 0, (item.igst==0|| item.igst)?item.igst : null, null, null,
                            (item.cess==0 || item.cess)?item.cess:null , doc.docref];
                            itemListParamArr.push(itemListParam);
                        }
                    );
                    let anx13KParam = [doc.docref, impgsezObj.ctin, impgsezObj.legaltradename, doc.doctyp || "B", doc.boe.pcode, doc.boe.num, doc.boe.dt, doc.boe.year, doc.boe.val, 
                    doc.pos, doc.suptype || "Inter-State", total_txval, total_igst, total_cess, doc.uplddt, doc.flag || null, doc.status || null, fp, req.body.rtnprd, doc.errorDetails?doc.errorDetails.errCd : null,  doc.errorDetails?doc.errorDetails.errMsg : null];
                    anx13KParamArr.push(anx13KParam);
                    docRefArr.push(doc.docref);
                    ctinArr.push(impgsezObj.ctin);
                }
            );                                        
        }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails : anx1Queries.importJson.remove3kdetails,
        saveDetails: anx1Queries.table3K.save,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails
    };
    await anx1ImpDao.save3K_Imp(docRefArr, anx13KParamArr, itemListParamArr, ctinArr, fp, rtnprd, impQuery, dbObj);
    logger.log("info","Exiting anx1ImpService.process3K");    
}

//Get Status from action attribute
function getStatus(flag) {
    let status = "";
    if (flag != null && flag != undefined) {
        switch (flag) {
            case 'F':
                status = "Filed";
                break;
            case 'A':
                status = "Accepted";
                break;    
            case 'R':
                status = "Rejected";
                break;        
            case 'N': 
                status = "Uploaded"; // Only for Import Json. Incase of data from excel/UI, status should be empty
                break;
            case 'U':
                status = "Uploaded";
                break;  
            case 'P':
                status = "Pending";
                break;
            case '':
                status = "Amended";
                break;
            default:
                status = "";        
        } 
    } else {
        status = "Uploaded";
    }

    return status;
}

function formatUploadDate(uploadDate){
    if(uploadDate != null && uploadDate != undefined){
        let tmpUpDt = moment(uploadDate, "DD-MM-YYYY");
        return tmpUpDt.format("DD/MM/YYYY");
    } else {
        return "";
    }
}


// *********************************************************************** 
// Ammendment Related Methods
// ***********************************************************************
async function importJsonA(req, res) {
    logger.log("info", "Entering anx1ImpService.importJsonA");
    try {
        let dbCache = req.app.get('myCache');
        const schemaPath = process.cwd() + "/json/anx1aImpschema.json";
        const anx1ImpSchema = fs.readFileSync(schemaPath, { encoding: 'utf8', flag: 'r' });
        let validatorResult = new Validator().validate(req.body, JSON.parse(anx1ImpSchema));

        if (!validatorResult.valid) {
            logger.log("error", "anx1ImpService.importJsonA|error|schemaValidation:%s|", validatorResult);
            sendResponse(res, 500, { message: "Please upload valid JSON file", errDesc: validatorResult.toString(), statusCd: 0 });
            return 0;
        }

        // req.body.issez = req.body.issez ? req.body.issez.toUpperCase() : req.body.issez;
        req.body.profile = req.headers["profile"];
        req.body.issez = req.headers["issez"];

        // setRatesForValidation(await getRatesFromDb());
        // setHSNMaster(await getHSNCodesFromDb());
        if (dbCache.get("ratesKey") != null && dbCache.get("ratesKey") != undefined && dbCache.get("ratesKey") != "") {
            setRatesForValidation(dbCache.get("ratesKey"));
        } else {
            setRatesForValidation(await getRatesFromDb());
        }
        if (dbCache.get("hsnKey") != null && dbCache.get("hsnKey") != undefined && dbCache.get("hsnKey") != "") {
            setHSNMaster(dbCache.get("hsnKey"));
        } else {
            setHSNMaster(await getHSNCodesFromDb());
        }

        let resMsg = validateAnx1Imp_Header(req);
        if (!resMsg.statusCd) {
            logger.log("error", "anx1ImpService.importJson|error|resMsg:%s|", resMsg);
            sendResponse(res, 500, resMsg);
            return 0;
        }

        let saveJsonObj = {}, errJsonObj = {};
        saveJsonObj.gstin = errJsonObj.gstin = req.body.gstin;
        saveJsonObj.rtnprd = errJsonObj.rtnprd = req.body.rtnprd;
        saveJsonObj.profile = errJsonObj.profile = req.headers["profile"];
        saveJsonObj.issez = errJsonObj.issez = req.headers["issez"];
        saveJsonObj.fp = errJsonObj.fp = req.headers["fp"];
        saveJsonObj.amdno = errJsonObj.amdno = (req.body.amdno) ? req.body.amdno : 0;
        parse3AAObj(req, saveJsonObj, errJsonObj);
        parse3CDAObj(req, saveJsonObj, errJsonObj);
        parse3HAObj(req, saveJsonObj, errJsonObj);
        parse3IAObj(req, saveJsonObj, errJsonObj);
        parseTab4AObj(req, saveJsonObj, errJsonObj);
        parse3JAObj(req, saveJsonObj, errJsonObj);
        parse3KAObj(req, saveJsonObj, errJsonObj);
        if (errJsonObj.errFlag) {
            logger.log("error", "anx1ImpService.importJson|error|errJson:%s|", JSON.stringify(errJsonObj));
            sendResponse(res, 500, { message: "Imported json is not valid. Please download the json from ANX1A Online and try again!", statusCd: 0 });
            return 0;
        }
        req.body = saveJsonObj;
        // logger.log("info","anx1ImpService.importJson|saveJson:%s|", JSON.stringify(saveJsonObj));
        let dbObj = getConnection(req.body.gstin);
        try {
            await runQuery("BEGIN", [], dbObj);
            await processAmdNo(req, dbObj);
            await Promise.mapSeries([process3HA, process3AA, process3CDA, process3IA, processTab4A, process3JA, process3KA], (processData) => {
                return processData(req, dbObj);
            }
            );
            await runQuery("COMMIT", [], dbObj);
            if (req.headers["flag"] == "F") {
                sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
            } else {
                sendResponse(res, 200, { message: "Json imported successfully", statusCd: 1 });
            }
            logger.log("info", "anx1ImpService.importJson|success|");
        } catch (err) {
            await runQuery("ROLLBACK", [], dbObj);
            logger.log("error", "anx1ImpService.importJson|error|rollback|err:%s|", err);
            if (err.message && err.message.includes("UNIQUE constraint failed")) {
                sendResponse(res, 500, { message: "Duplicate documents are present. Please correct and upload", statusCd: 0 });
            } else {
                sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
            }
            return 0;
        } finally {
            await dbClose(dbObj);
        }
    } catch (err) {
        logger.log("error", "anx1ImpService.catch|error|err:%s|", err);
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    }
    logger.log("info", "Exiting anx1ImpService.importJsonA");
    return 1;
}

function parse3AAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3AAObj");
    let amdno = saveJsonObj.amdno;
    saveJsonObj.b2ca = [];
    errJsonObj.b2ca = [];
    let issez = req.headers["issez"];
    let headerFlag = req.headers["flag"];
    const tableName = "3AA";
    // console.log('parse3AAObj req.body.b2ca',req.body.b2ca); 
    if (req.body.b2ca) {
        req.body.b2ca.forEach((b2cObj) => {
            let saveb2cObj = _.cloneDeep(b2cObj);
            saveb2cObj.doctyp = "I";
            saveb2cObj.diffpercnt = saveb2cObj.diffprcnt ? saveb2cObj.diffprcnt * 100 : 100;
            saveb2cObj.rst = saveb2cObj.flag;
            saveb2cObj.status = "Amended";
            if (headerFlag === "F") {
                saveb2cObj.rst = "F"
                saveb2cObj.upld_dt = "";
            } else {
                saveb2cObj.rst = "Am"
                saveb2cObj.upld_dt = formatUploadDate(saveb2cObj.uplddt);
            }

            saveb2cObj.docref = saveb2cObj.pos.concat('|',saveb2cObj.diffpercnt,'|',saveb2cObj.sec7act,'|',req.body.rtnprd,'|',tableName);
            saveb2cObj.sec7act = saveb2cObj.sec7act || 'N';
            saveb2cObj.suptype = calSupTypeFor3A(req.body.gstin, saveb2cObj.pos, saveb2cObj.sec7act, issez, saveb2cObj.suptype)
            if (headerFlag == "F") {
                saveJsonObj.b2ca.push(saveb2cObj);
            }
            else {
                validateAnx1Imp_3AA(saveb2cObj);
                if (saveb2cObj.valid === 1) {
                    saveJsonObj.b2ca.push(saveb2cObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveb2cObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.b2ca.push(saveb2cObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3AAObj");
}


async function process3AA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3AA");
    // console.log('In Process 3aa b2c', req.body.b2c);
    // console.log('In Process 3aa b2ca', req.body.b2ca);
    let gstin = req.body.gstin;
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3AA";
    let anx13AParamArr = [], itemListParamArr = [], docRefArr = [];
    if (!(Array.isArray(req.body.b2ca) && req.body.b2ca.length)) {
        logger.log("info", "Exiting anx1ImpService.process3AA|emptyArray|");
        return Promise.resolve();
    }
    req.body.b2ca.forEach((b2cObj) => {
        let total_txval = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
        b2cObj.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
            total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn || null, item.rate, item.txval || 0, ((item.igst == 0 || item.igst) ? item.igst : null), (item.cgst == 0 || item.cgst) ? item.cgst : null, (item.sgst == 0 || item.sgst) ? item.sgst : null,
            (item.cess == 0 || item.cess) ? item.cess : null, b2cObj.docref];
            itemListParamArr.push(itemListParam);
        }
        );
        let anx13AParam = [b2cObj.docref, b2cObj.pos, b2cObj.diffpercnt, b2cObj.doctyp || null, b2cObj.sec7act, b2cObj.upld_dt || null,
        b2cObj.suptype, fp, req.body.rtnprd, total_txval, total_cgst, total_igst,
            total_sgst, total_cess, b2cObj.status, b2cObj.rst || null, (b2cObj.errorDetails ? b2cObj.errorDetails.errCd : null), (b2cObj.errorDetails ? b2cObj.errorDetails.errMsg : null)];
        anx13AParamArr.push(anx13AParam);
        docRefArr.push(b2cObj.docref);
    }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1aQueries.importJson.remove3aadetails,
        removeSummary: anx1Queries.importJson.removeSummary,
        removeErrSummary: anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1aQueries.table3aa.save3AA,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1aQueries.summary.calculate3AASumm,
        getCountMarkForDel: anx1aQueries.summary.getCountMarkForDelfor3AA,
        calcErrSumm: anx1aQueries.errorSummary.calculate3AAErrorSumm,
        getCountOfYetTobeCorrected: anx1aQueries.errorSummary.getCountErrorfor3AA
    };
    // console.log('#####################################################');
    // console.log('docRefArr', docRefArr);
    // console.log('anx13AParamArr', anx13AParamArr);
    // console.log('itemListParamArr', itemListParamArr);
    // console.log('tableTyp', tableTyp);
    // console.log('dbObj', dbObj);
    // console.log('#####################################################');
    await anx1aImpDao.save3Hor3AA_Imp(docRefArr, anx13AParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3aA");
}

function parse3CDAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3CDAObj");
    let amdno = saveJsonObj.amdno;
    saveJsonObj.expwpa = [], saveJsonObj.expwopa = [];
    errJsonObj.expwpa = [], errJsonObj.expwopa = [];
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    const tableName = "3CDA";
    if (req.body.expwpa) {
        req.body.expwpa.forEach((expwpObj) => {
            let saveExpwpObj = _.cloneDeep(expwpObj);
            // saveExpwpObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveExpwpObj.action);
            // saveExpwpObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
            // saveExpwpObj.status = (amdno && amdno > 0) ? "Amended" : "Filed";
            // saveExpwpObj.flag = (amdno && amdno > 0) ? "Am" : "F";
            saveExpwpObj.status = "Amended";
            if(req.headers["flag"] === "F"){
                saveExpwpObj.flag = "F"
                saveExpwpObj.upld_dt = "";    
            }else{
                saveExpwpObj.flag = "Am"
                saveExpwpObj.upld_dt = formatUploadDate(saveExpwpObj.uplddt);    
            }
            if (saveExpwpObj.doc_status && saveExpwpObj.doc_status === 'I') {
                saveExpwpObj.status = 'Invalid';
                saveExpwpObj.flag = 'I';
            }
            let tmpDt = moment(saveExpwpObj.doc.dt, "DD-MM-YYYY");
            let tmpoDt = moment(saveExpwpObj.odoc.dt, "DD-MM-YYYY");
            saveExpwpObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveExpwpObj.odoc.year = (tmpoDt.format("MM") < 4 ? (tmpoDt.format("YYYY") - 1).toString() : tmpoDt.format("YYYY"));
            saveExpwpObj.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveExpwpObj.doctyp = (saveExpwpObj.doctyp == "C") ? "CR" : ((saveExpwpObj.doctyp == "D") ? "DR" : saveExpwpObj.doctyp);
            saveExpwpObj.odoc.dt = tmpoDt.format("DD/MM/YYYY");
            saveExpwpObj.odoctyp = (saveExpwpObj.odoctyp == "C") ? "CR" : ((saveExpwpObj.odoctyp == "D") ? "DR" : saveExpwpObj.odoctyp);
            saveExpwpObj.docref = saveExpwpObj.doctyp.concat('|',saveExpwpObj.doc.num,'|',saveExpwpObj.doc.year,'|',fp,'|',req.body.rtnprd,'|',tableName).toUpperCase();
            saveExpwpObj.odocref = saveExpwpObj.odoctyp.concat('|',saveExpwpObj.odoc.num,'|',saveExpwpObj.odoc.year,'|',fp,'|',req.body.rtnprd,'|',tableName).toUpperCase();
            saveExpwpObj.suptype = "Inter-State";
            saveExpwpObj.exptype = "EXPWP";
            saveExpwpObj.sb = saveExpwpObj.sb ? saveExpwpObj.sb : {};
            saveExpwpObj.sb.dt = saveExpwpObj.sb.dt ? moment(saveExpwpObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwpObj.sb.dt;
            if (req.headers["flag"] == "F") {
                saveJsonObj.expwpa.push(saveExpwpObj);
            }
            else {
                validate3cda(saveExpwpObj, 'expwp', rtnprd);

                if (saveExpwpObj.valid === 1) {
                    saveJsonObj.expwpa.push(saveExpwpObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveExpwpObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.expwpa.push(saveExpwpObj);
                }
            }
        }
        );
    }
    if (req.body.expwopa) {
        req.body.expwopa.forEach((expwopObj) => {
            let saveExpwopObj = _.cloneDeep(expwopObj);
            // saveExpwopObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveExpwopObj.action);
            // saveExpwopObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
            // saveExpwopObj.status = (amdno && amdno > 0) ? "Amended" : "Filed";
            // saveExpwopObj.flag = (amdno && amdno > 0) ? "Am" : "F";
            saveExpwopObj.status = "Amended";
            if(req.headers["flag"] === "F"){
                saveExpwopObj.flag = "F"
                saveExpwopObj.upld_dt = "";    
            }else{
                saveExpwopObj.flag = "Am"
                saveExpwopObj.upld_dt = formatUploadDate(saveExpwopObj.uplddt);    
            }
            if (saveExpwopObj.doc_status && saveExpwopObj.doc_status === 'I') {
                saveExpwopObj.status = 'Invalid';
                saveExpwopObj.flag = 'I';
            }
            let tmpDt = moment(saveExpwopObj.doc.dt, "DD-MM-YYYY");
            let tmpoDt = moment(saveExpwopObj.odoc.dt, "DD-MM-YYYY");
            saveExpwopObj.doc.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
            saveExpwopObj.odoc.year = (tmpoDt.format("MM") < 4 ? (tmpoDt.format("YYYY") - 1).toString() : tmpoDt.format("YYYY"));
            saveExpwopObj.doc.dt = tmpDt.format("DD/MM/YYYY");
            saveExpwopObj.doctyp = (saveExpwopObj.doctyp == "C") ? "CR" : ((saveExpwopObj.doctyp == "D") ? "DR" : saveExpwopObj.doctyp);
            saveExpwopObj.odoc.dt = tmpoDt.format("DD/MM/YYYY");
            saveExpwopObj.odoctyp = (saveExpwopObj.odoctyp == "C") ? "CR" : ((saveExpwopObj.odoctyp == "D") ? "DR" : saveExpwopObj.odoctyp);
            saveExpwopObj.docref = saveExpwopObj.doctyp.concat('|',saveExpwopObj.doc.num,'|',saveExpwopObj.doc.year,'|',fp,'|',req.body.rtnprd,'|',tableName).toUpperCase();
            saveExpwopObj.odocref = saveExpwopObj.odoctyp.concat('|',saveExpwopObj.odoc.num,'|',saveExpwopObj.odoc.year,'|',fp,'|',req.body.rtnprd,'|',tableName).toUpperCase();
            saveExpwopObj.suptype = "Inter-State";
            saveExpwopObj.exptype = "EXPWOP";
            saveExpwopObj.sb = saveExpwopObj.sb ? saveExpwopObj.sb : {};
            saveExpwopObj.sb.dt = saveExpwopObj.sb.dt ? moment(saveExpwopObj.sb.dt, "DD-MM-YYYY").format("DD/MM/YYYY") : saveExpwopObj.sb.dt;
            if (req.headers["flag"] == "F") {
                saveJsonObj.expwopa.push(saveExpwopObj);
            }
            else {
                validate3cda(saveExpwopObj, 'expwop', rtnprd);

                if (saveExpwopObj.valid === 1) {
                    saveJsonObj.expwopa.push(saveExpwopObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveExpwopObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.expwopa.push(saveExpwopObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3CDAObj");
}

async function process3CDA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3CDA");
    let fp = req.headers["fp"];
    let rtnprd = req.body.rtnprd;
    let tableTyp = "3CDA";
    let processArr = [], wpDocTypArr = [], wopDocTypArr = [];
    if (req.body.expwpa) {
        if ((Array.isArray(req.body.expwpa) && req.body.expwpa.length)) {
            processArr.push(getParmListFor3cda(req, req.body.expwpa, wpDocTypArr));
        }
    }
    if (req.body.expwopa) {
        if ((Array.isArray(req.body.expwopa) && req.body.expwopa.length)) {
            processArr.push(getParmListFor3cda(req, req.body.expwopa, wopDocTypArr));
        }
    }

    // console.log('processArr --> ', processArr);
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1aQueries.importJson.remove3cddetails,
        saveDetails: anx1aQueries.table3CDA.save3cdA,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        removeODetails: anx1aQueries.importJson.remove3cdodetails
    };
    let exptypeObj = {
        expwp: wpDocTypArr,
        expwop: wopDocTypArr
    }
    await Promise.mapSeries(processArr, (ParamArr) => {
        return anx1aImpDao.save3cda_Imp(ParamArr[0], ParamArr[1], ParamArr[2], ParamArr[3], exptypeObj, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers['flag']);
    }
    );
    logger.log("info", "Exiting anx1ImpService.process3CDA");
}


function getParmListFor3cda(req, arr3cd, docTypArr) {
    logger.log("info", "Entering anx1ImpService.getParmListFor3CDA");
    let fp = req.headers["fp"];
    let anx13cdParamArr = [], itemListParamArr = [], docRefArr = [], oDocRefArr = [];

    arr3cd.forEach((obj3cd) => {

        let total_txval = 0, total_igst = 0, total_cess = 0;
        obj3cd.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn, item.rate, item.txval || 0, ((item.igst || item.igst == 0) ? item.igst : null), undefined, undefined,
            ((item.cess || item.cess == 0) ? item.cess : null), obj3cd.docref];
            itemListParamArr.push(itemListParam);
        }
        );
        let anx13cdParam = [obj3cd.odocref, obj3cd.odoctyp, obj3cd.odoc.num, obj3cd.odoc.dt, obj3cd.odoc.dt.substr(obj3cd.odoc.dt.length - 4), obj3cd.doctyp, req.body.gstin, obj3cd.docref, obj3cd.doc.num, obj3cd.doc.dt, obj3cd.doc.val, obj3cd.doc.year, obj3cd.exptype,
        obj3cd.sb.num || null, obj3cd.sb.dt || null, obj3cd.sb.pcode || null, total_txval, total_igst, total_cess,
        obj3cd.suptype, obj3cd.upld_dt || null, obj3cd.flag || null, obj3cd.status || null, fp, req.body.rtnprd, (obj3cd.errorDetails ? obj3cd.errorDetails.errCd : null), (obj3cd.errorDetails ? obj3cd.errorDetails.errMsg : null)];
        anx13cdParamArr.push(anx13cdParam);
        docRefArr.push(obj3cd.docref);
        oDocRefArr.push(obj3cd.odocref);
        docTypArr.push(obj3cd.doctyp);
    }
    );
    logger.log("info", "Exiting anx1ImpService.getParmListFor3CDA");
    return [oDocRefArr, docRefArr, anx13cdParamArr, itemListParamArr]
}

async function processAmdNo(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.processAmdNo");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let amdno = req.body.amdno;
    await anx1aImpDao.saveamdno(amdno, fp, rtnprd, 'AMD', dbObj);
}

function parse3HAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3HAObj");
    saveJsonObj.reva = [];
    errJsonObj.reva = [];
    //let issez = req.headers["issez"];
    let amdno = saveJsonObj.amdno;
    const tableName = "3HA";
    if (req.body.reva) {
        req.body.reva.forEach((revArrObj) => {
            let saveRevObj = _.cloneDeep(revArrObj);
            saveRevObj.ctin = saveRevObj.ctin.toUpperCase();
            saveRevObj.docs.forEach((doc) => {
                doc.doctyp = "I";
                doc.legaltradename = saveRevObj.trdnm || "";
                doc.diffpercnt = doc.diffprcnt ? doc.diffprcnt * 100 : 100;

                doc.rst = doc.flag;

                doc.status = "Amended";
                if(req.headerFlag === "F"){
                    doc.rst = "F"
                    doc.upld_dt = "";    
                }else{
                    doc.rst = "Am"
                    doc.upld_dt = formatUploadDate(doc.uplddt);    
                }
                doc.docref = saveRevObj.ctin.concat('|',doc.pos,'|',doc.diffpercnt,'|',doc.sec7act,'|',req.body.rtnprd,'|',tableName);
                doc.sec7act = doc.sec7act || 'N';
                doc.suptype = (saveRevObj.type === "G" || saveRevObj.type === "g") ? calSupTypeFor3H(saveRevObj.ctin, doc.pos, doc.sec7act, saveJsonObj.issez, doc.suptyp) : (doc.suptyp == "inter" ? "Inter-State" : "Intra-State");
            }
            );
            if (req.headers["flag"] == "F") {
                saveJsonObj.reva.push(saveRevObj);
            }
            else {
                validateAnx1Imp_3H(saveRevObj, req.body.gstin);
                if (saveRevObj.valid === 1) {
                    saveJsonObj.reva.push(saveRevObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveRevObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.reva.push(saveRevObj);
                }
            }
        }
        );

    }
    logger.log("info", "Exiting anx1ImpService.parse3HAObj");
}

function parse3IAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3IAObj");
    let amdno = saveJsonObj.amdno;
    saveJsonObj.impsa = [];
    errJsonObj.impsa = [];
    const tableName = "3IA";
    if (req.body.impsa) {
        req.body.impsa.forEach((impsObj) => {
            let saveimpsObj = _.cloneDeep(impsObj);
            saveimpsObj.diffpercnt = "100";
            // saveimpsObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
            // saveimpsObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveimpsObj.action);

            // saveimpsObj.flag = (amdno && amdno > 0) ? "Am" : "F";
            // saveimpsObj.status = (amdno && amdno > 0) ? "Amended" : "Filed";
            
            saveimpsObj.status = "Amended";
            if(req.headers["flag"] === "F"){
                saveimpsObj.flag = "F"
                saveimpsObj.upldt = "";    
            }else{
                saveimpsObj.flag = "Am"
                saveimpsObj.upldt = formatUploadDate(saveimpsObj.uplddt);    
            }
            saveimpsObj.docref = saveimpsObj.pos.concat('|',req.body.rtnprd,'|',tableName);
            saveimpsObj.suptype = "Inter-State";

            if (req.headers["flag"] == "F") {
                saveJsonObj.impsa.push(saveimpsObj);
            }
            else {
                validateAnx1Imp_3I(saveimpsObj);
                if (saveimpsObj.valid === 1) {
                    saveJsonObj.impsa.push(saveimpsObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveimpsObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.impsa.push(saveimpsObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3IAObj");
}

function parseTab4AObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parseTab4AObj");
    let amdno = saveJsonObj.amdno;
    saveJsonObj.ecoma = [];
    errJsonObj.ecoma = [];
    const tableName = "4A";
    if (req.body.ecoma) {
        req.body.ecoma.forEach((ecomObj) => {
            let saveEcomObj = _.cloneDeep(ecomObj);
            saveEcomObj.etin = saveEcomObj.etin.toUpperCase();
            // saveEcomObj.flag = (req.headers["flag"] == "F") ? "F" : "U";
            // saveEcomObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveEcomObj.action);

            // saveEcomObj.flag = (amdno && amdno > 0) ? "Am" : "F";
            // saveEcomObj.status = (amdno && amdno > 0) ? "Amended" : "Filed";
            
            saveEcomObj.status = "Amended";
            if(req.headers["flag"] === "F"){
                saveEcomObj.flag = "F"
                saveEcomObj.upldt = "";    
            }else{
                saveEcomObj.flag = "Am"
                saveEcomObj.upldt = formatUploadDate(saveEcomObj.uplddt);    
            }
            saveEcomObj.lgltrdname = saveEcomObj.trdnm || "";
            saveEcomObj.docref = saveEcomObj.etin.concat('|',req.body.rtnprd,'|',tableName);

            if (req.headers["flag"] == "F") {
                saveJsonObj.ecoma.push(saveEcomObj);
            }
            else {
                validateAnx1Imp_tab4A(saveEcomObj);
                if (saveEcomObj.valid === 1) {
                    saveJsonObj.ecoma.push(saveEcomObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveEcomObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.ecoma.push(saveEcomObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parseTab4AObj");
}

async function process3HA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3HA");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3HA";
    let anx13hParamArr = [], itemListParamArr = [], docRefArr = [];
    if (!(Array.isArray(req.body.reva) && req.body.reva.length)) {
        logger.log("info", "Exiting anx1ImpService.process3HA|emptyArray|");
        return Promise.resolve();
    }
    req.body.reva.forEach((revArrObj) => {
        revArrObj.docs.forEach((doc) => {
            let total_txval = 0, total_sgst = 0, total_cgst = 0, total_igst = 0, total_cess = 0;
            doc.items.forEach((item) => {
                total_txval += parseFloat((item.txval) ? item.txval : 0);
                total_sgst += parseFloat((item.sgst) ? item.sgst : 0);
                total_cgst += parseFloat((item.cgst) ? item.cgst : 0);
                total_igst += parseFloat((item.igst) ? item.igst : 0);
                total_cess += parseFloat((item.cess) ? item.cess : 0);
                let itemListParam = [item.hsn, item.rate, item.txval, ((item.igst == 0 || item.igst) ? item.igst : null), (item.cgst == 0 || item.cgst) ? item.cgst : null, (item.sgst == 0 || item.sgst) ? item.sgst : null,
                (item.cess == 0 || item.cess) ? item.cess : null, doc.docref];
                itemListParamArr.push(itemListParam);
            }
            );
            let anx13hParam = [doc.docref, revArrObj.ctin, doc.legaltradename, doc.pos, total_txval, total_igst, total_cgst,
                total_sgst, total_cess, doc.diffpercnt, doc.sec7act, doc.suptype, doc.upld_dt || null, doc.rst || null,
            doc.status, fp, doc.doctyp || null, req.body.rtnprd, (doc.errorDetails ? doc.errorDetails.errCd : null), (doc.errorDetails ? doc.errorDetails.errMsg : null), doc.rfndelg || "Y"];
            anx13hParamArr.push(anx13hParam);
            docRefArr.push(doc.docref);

        }
        );
    }
    );

    //console.log("docRefArr", anx13hParamArr)
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1aQueries.importJson.remove3hdetails,
        removeSummary: anx1Queries.importJson.removeSummary,
        removeErrSummary: anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1aQueries.table3ha.save3h,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1aQueries.summary.calculate3HSumm,
        getCountMarkForDel: anx1aQueries.summary.getCountMarkForDelfor3H,
        calcErrSumm: anx1aQueries.errorSummary.calculate3HErrorSumm,
        getCountOfYetTobeCorrected: anx1aQueries.errorSummary.getErrorCountfor3H
    };
    await anx1ImpDao.save3Hor3A_Imp(docRefArr, anx13hParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3HA");
}

async function process3IA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3IA");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3IA";
    let anx13iParamArr = [], itemListParamArr = [], docRefArr = [];
    if (!(Array.isArray(req.body.impsa) && req.body.impsa.length)) {
        logger.log("info", "Exiting anx1ImpService.process3IA|emptyArray|");
        return Promise.resolve();
    }
    req.body.impsa.forEach((impsObj) => {
        let total_txval = 0, total_igst = 0, total_cess = 0;
        impsObj.items.forEach((item) => {
            total_txval += parseFloat((item.txval) ? item.txval : 0);
            total_igst += parseFloat((item.igst) ? item.igst : 0);
            total_cess += parseFloat((item.cess) ? item.cess : 0);
            let itemListParam = [item.hsn, item.rate, item.txval, item.igst || 0, item.cgst || null, item.sgst || null,
            item.cess || 0, impsObj.docref];
            itemListParamArr.push(itemListParam);
        }
        );
        let anx13iParam = [impsObj.docref, impsObj.pos, total_txval, total_igst, total_cess, impsObj.suptype,
        impsObj.upldt, impsObj.diffpercnt, impsObj.rfndelg || "Y", impsObj.flag, impsObj.status, fp, req.body.rtnprd,
        impsObj.errorDetails ? impsObj.errorDetails.errCd : null, impsObj.errorDetails ? impsObj.errorDetails.errMsg : null];
        anx13iParamArr.push(anx13iParam);
        docRefArr.push(impsObj.docref);
    }
    );
    let impQuery = {
        removeItemDetails: anx1Queries.importJson.removeItemDetails,
        removeDetails: anx1aQueries.importJson.remove3idetails,
        removeSummary: anx1Queries.importJson.removeSummary,
        removeErrSummary: anx1Queries.importJson.removeErrorSummary,
        saveDetails: anx1aQueries.table3ia.save3i,
        saveItemDetails: anx1Queries.itemDetails.saveItemDetails,
        calcSumm: anx1aQueries.table3ia.calculate3iSumm,
        getCountMarkForDel: anx1aQueries.table3ia.getCountMarkForDelfor3i,
        calcErrSumm: anx1aQueries.errorSummary.calculate3iErrSumm,
        getCountOfYetTobeCorrected: anx1aQueries.errorSummary.getYetToBeCorrectedCount3i

    };
    await anx1ImpDao.save3I_Imp(docRefArr, anx13iParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3IA");
}

async function processTab4A(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.processTab4A");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "4A";
    let anx14ParamArr = [], docRefArr = [];
    if (!(Array.isArray(req.body.ecoma) && req.body.ecoma.length)) {
        logger.log("info", "Exiting anx1ImpService.processTab4A|emptyArray|");
        return Promise.resolve();
    }
    req.body.ecoma.forEach((ecomObj) => {
        let anx14Param = [ecomObj.docref, ecomObj.etin, ecomObj.lgltrdname,
        ecomObj.sup, ecomObj.supr, ecomObj.nsup, null, ecomObj.cgst, ecomObj.igst, ecomObj.sgst, ecomObj.cess,
        ecomObj.upldt, fp, req.body.rtnprd, ecomObj.status, ecomObj.flag, ecomObj.errorDetails ? ecomObj.errorDetails.errCd : null, ecomObj.errorDetails ? ecomObj.errorDetails.errMsg : null];
        anx14ParamArr.push(anx14Param);
        docRefArr.push(ecomObj.docref);
    }
    );
    let impQuery = {
        removeItemDetails: anx1aQueries.importJson.remove4details,
        removeDetails: anx1aQueries.importJson.remove4details,
        removeSummary: anx1Queries.importJson.removeSummary,
        saveDetails: anx1aQueries.table4a.save4,
        removeErrorSummary: anx1Queries.importJson.removeErrorSummary,
        calcSumm: anx1aQueries.table4a.calculate4Summ,
        calcErrSumm: anx1aQueries.table4a.calculate4ErrSumm,
        getCountMarkForDel: anx1aQueries.table4a.getCountMarkForDelfor4,
        getCountYetToCorrectForDelfor4: anx1aQueries.table4a.getCountYetToCorrectForDelfor4,
        saveSumm: anx1aQueries.importJson.save4summ,
        saveErrSumm: anx1aQueries.importJson.save4Errsumm
    };
    await anx1ImpDao.saveTab4_Imp(docRefArr, anx14ParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.processTab4A");
}

async function process3JA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3JA");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let tableTyp = "3JA";
    let anx13JParamArr = [], itemListParamArr = [], docRefArr = [], oDocRefArr = [];
    if (!(Array.isArray(req.body.impga) && req.body.impga.length)) {
        logger.log("info", "Exiting anx1ImpService.process3JA|emptyArray|");
        return Promise.resolve();
    }
    req.body.impga.forEach((impgObj) => {
        impgObj.docs.forEach((doc) => {
            let total_txval = 0, total_igst = 0, total_cess = 0;
            doc.items.forEach((item) => {
                total_txval += parseFloat((item.txval) ? item.txval : 0);
                total_igst += parseFloat((item.igst) ? item.igst : 0);
                total_cess += parseFloat((item.cess) ? item.cess : 0);
                let itemListParam = [item.hsn, item.rate, item.txval, item.igst, null, null,
                item.cess, doc.docref];
                itemListParamArr.push(itemListParam);
            }
            );
            let anx13JParam = [doc.odocref, doc.odoctyp, doc.oboe.num, doc.oboe.dt, doc.oboe.pcode, doc.oboe.year,
            doc.docref, doc.doctyp, impgObj.pos || null, doc.boe.num, doc.boe.pcode, doc.boe.dt,
            doc.boe.val, doc.boe.year, total_txval, total_igst,
                total_cess, impgObj.suptyp, impgObj.uplddt, impgObj.rfndelg || "Y", doc.flag, doc.status, fp, req.body.rtnprd, (doc.errorDetails ? doc.errorDetails.errCd : null), (doc.errorDetails ? doc.errorDetails.errMsg : null)];
            anx13JParamArr.push(anx13JParam);
            docRefArr.push(doc.docref);
            oDocRefArr.push(doc.odocref);
        }
        );
    }
    );
    let impQuery = {
        removeItemDetails: anx1aQueries.importJson.removeItemDetails,
        removeDetails: anx1aQueries.importJson.remove3jdetails,
        removeODetails: anx1aQueries.importJson.remove3jodetails,
        removeSummary: anx1aQueries.importJson.removeSummary,
        removeErrSummary: anx1aQueries.importJson.removeErrorSummary,
        saveDetails: anx1aQueries.table3ja.save3j,
        saveItemDetails: anx1aQueries.itemDetails.saveItemDetails,
        calcSumm: anx1aQueries.table3ja.calculate3jSumm,
        getCountMarkForDel: anx1aQueries.table3ja.getCountMarkForDelfor3j,
        calcErrSumm: anx1aQueries.errorSummary.calculate3jErrSumm,
        getCountOfYetTobeCorrected: anx1aQueries.errorSummary.getYetToBeCorrectedCount3j
    };
    await anx1aImpDao.save3JA_Imp(oDocRefArr, docRefArr, anx13JParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, req.headers["flag"]);
    logger.log("info", "Exiting anx1ImpService.process3JA");
}
async function process3KA(req, dbObj) {
    logger.log("info", "Entering anx1ImpService.process3KA");
    let rtnprd = req.body.rtnprd;
    let fp = req.headers["fp"];
    let anx13KParamArr = [], itemListParamArr = [], docRefArr = [], ctinArr = [], oDocRefArr = [];
    if (!(Array.isArray(req.body.impgseza) && req.body.impgseza.length)) {
        logger.log("info", "Exiting anx1ImpService.process3KA|emptyArray|");
        return Promise.resolve();
    }
    req.body.impgseza.forEach((impgsezObj) => {
        impgsezObj.docs.forEach((doc) => {
            let total_txval = 0, total_igst = 0, total_cess = 0;
            doc.items.forEach((item) => {
                total_txval += parseFloat((item.txval) ? item.txval : 0);
                total_igst += parseFloat((item.igst) ? item.igst : 0);
                total_cess += parseFloat((item.cess) ? item.cess : 0);
                let itemListParam = [item.hsn, item.rate, item.txval || 0, (item.igst == 0 || item.igst) ? item.igst : null, null, null,
                (item.cess == 0 || item.cess) ? item.cess : null, doc.docref];
                itemListParamArr.push(itemListParam);
            }
            );
            let anx13KParam = [doc.odocref, impgsezObj.octin, impgsezObj.olegaltradename, doc.odoctyp || "B",
            doc.oboe.num, doc.oboe.dt, doc.oboe.pcode, doc.oboe.year,
            doc.docref, impgsezObj.ctin, impgsezObj.legaltradename, doc.doctyp || "B", doc.boe.pcode, doc.boe.num, doc.boe.dt, doc.boe.year, doc.boe.val,
            doc.pos, doc.suptype || "Inter-State", total_txval, total_igst, total_cess, doc.uplddt, doc.flag || null, doc.status || null, fp, req.body.rtnprd, doc.errorDetails ? doc.errorDetails.errCd : null, doc.errorDetails ? doc.errorDetails.errMsg : null];
            anx13KParamArr.push(anx13KParam);
            docRefArr.push(doc.docref);
            oDocRefArr.push(doc.odocref);
            ctinArr.push(impgsezObj.ctin);
        }
        );
    }
    );
    let impQuery = {
        removeItemDetails: anx1aQueries.importJson.removeItemDetails,
        removeDetails: anx1aQueries.importJson.remove3kdetails,
        removeODetails: anx1aQueries.importJson.remove3kodetails,
        saveDetails: anx1aQueries.table3KA.save,
        saveItemDetails: anx1aQueries.itemDetails.saveItemDetails
    };
    await anx1aImpDao.save3KA_Imp(oDocRefArr, docRefArr, anx13KParamArr, itemListParamArr, ctinArr, fp, rtnprd, impQuery, dbObj);
    logger.log("info", "Exiting anx1ImpService.process3KA");
}


function parse3JAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3JAObj");
    let amdno = saveJsonObj.amdno;
    saveJsonObj.impga = [];
    errJsonObj.impga = [];
    let fp = req.headers["fp"];
    const tableName = "3JA";
   // console.log('req.body.impga', req.body.impga);
    if (req.body.impga) {
        req.body.impga.forEach((impgObj) => {
            let saveimpgObj = _.cloneDeep(impgObj);
            // saveimpgObj.status = (req.headers["flag"] === "F") ? "" : getStatus(saveimpgObj.action);
            // saveimpgObj.flag = (req.headers["flag"] == "F") ? "F" : "U";

            // saveimpgObj.status = (amdno && amdno > 0) ? "Amended" : "Filed";
            // saveimpgObj.flag = (amdno && amdno > 0) ? "Am" : "F";
            saveimpgObj.uplddt = (req.headers["flag"] == "F") ? "" : formatUploadDate(saveimpgObj.uplddt);

            saveimpgObj.suptyp = "Inter-State";

            saveimpgObj.docs.forEach((doc) => {
                console.log('doc', doc);
                let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                let tmpODt = moment(doc.oboe.dt, "DD-MM-YYYY");
                doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                doc.oboe.year = (tmpODt.format("MM") < 4 ? (tmpODt.format("YYYY") - 1).toString() : tmpODt.format("YYYY"));
                doc.oboe.dt = tmpODt.format("DD/MM/YYYY");
                doc.docref = (doc.boe.num + "|" + doc.boe.year + "|" + doc.boe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                doc.odocref = (doc.oboe.num + "|" + doc.oboe.year + "|" + doc.oboe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                // doc.status = (amdno && amdno > 0) ? "Amended" : "Filed";
                // doc.flag = (amdno && amdno > 0) ? "Am" : "F";
                doc.status = "Amended";
                doc.flag = (req.headers["flag"] == "F") ? "F" : "Am";
                if (doc.doc_status && doc.doc_status === 'I') {
                    doc.status = 'Invalid';
                    doc.flag = 'I';
                }
                doc.uplddt = (req.headers["flag"] == "F") ? "" : formatUploadDate(doc.uplddt);
            }
            );

            if (req.headers["flag"] == "F") {
                saveJsonObj.impga.push(saveimpgObj);
            }
            else {
                validateAnx1Imp_3JA(saveimpgObj, req.body.rtnprd);

                if (saveimpgObj.valid === 1) {
                    saveJsonObj.impga.push(saveimpgObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveimpgObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.impga.push(saveimpgObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3JAObj");
}

function parse3KAObj(req, saveJsonObj, errJsonObj) {
    logger.log("info", "Entering anx1ImpService.parse3KAObj");
    saveJsonObj.impgseza = [];
    errJsonObj.impgseza = [];
    let amdno = saveJsonObj.amdno;
    let fp = req.headers["fp"];
    const tableName = "3KA";
    if (req.body.impgseza) {
        req.body.impgseza.forEach((impgsezObj) => {
            let saveimpgsezObj = _.cloneDeep(impgsezObj);
            saveimpgsezObj.ctin = saveimpgsezObj.ctin.toUpperCase();
            saveimpgsezObj.octin = saveimpgsezObj.octin.toUpperCase();
            saveimpgsezObj.legaltradename = saveimpgsezObj.trdnm || "";
            saveimpgsezObj.olegaltradename = saveimpgsezObj.otrdnm || "";
            saveimpgsezObj.docs.forEach((doc) => {
                let tmpDt = moment(doc.boe.dt, "DD-MM-YYYY");
                doc.boe.year = (tmpDt.format("MM") < 4 ? (tmpDt.format("YYYY") - 1).toString() : tmpDt.format("YYYY"));
                doc.boe.dt = tmpDt.format("DD/MM/YYYY");
                let tmpODt = moment(doc.oboe.dt, "DD-MM-YYYY");
                doc.oboe.year = (tmpODt.format("MM") < 4 ? (tmpODt.format("YYYY") - 1).toString() : tmpODt.format("YYYY"));
                doc.oboe.dt = tmpODt.format("DD/MM/YYYY");
                doc.docref = (doc.boe.num + "|" + doc.doctyp + "|" + doc.boe.year + "|" + doc.boe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                doc.odocref = (doc.oboe.num + "|" + doc.odoctyp + "|" + doc.oboe.year + "|" + doc.oboe.pcode + "|" + fp + "|" + req.body.rtnprd + "|" + tableName).toUpperCase();
                // doc.flag = (req.headers["flag"] == "F") ? "F" : "U";
                // doc.status = (req.headers["flag"] === "F") ? "" : getStatus(doc.action);
                // doc.status = (amdno && amdno > 0) ? "Amended" : "Filed";
                // doc.flag = (amdno && amdno > 0) ? "Am" : "F";
                doc.status = "Amended";
                doc.flag = (req.headers["flag"] == "F") ? "F" : "Am";
                if (doc.doc_status && doc.doc_status === 'I') {
                    doc.status = 'Invalid';
                    doc.flag = 'I';
                }
                doc.uplddt = (req.headers["flag"] == "F") ? "" : formatUploadDate(doc.uplddt);
                doc.suptyp = "Inter-State";
            }
            );
            if (req.headers["flag"] == "F") {
                saveJsonObj.impgseza.push(saveimpgsezObj);
            } else {
                validateAnx1Imp_3KA(req.body.gstin, saveimpgsezObj, req.body.rtnprd);
                if (saveimpgsezObj.valid === 1) {
                    saveJsonObj.impgseza.push(saveimpgsezObj);
                    saveJsonObj.xflag = true;
                } else {
                    saveimpgsezObj.errCd = "E01";
                    errJsonObj.errFlag = "true";
                    errJsonObj.impgseza.push(saveimpgsezObj);
                }
            }
        }
        );
    }
    logger.log("info", "Exiting anx1ImpService.parse3KAObj");
}

module.exports = {
    importJson : importJson,
    process3H : process3H,
    process3A : process3A,
    process3B : process3B,
    process3CD : process3CD,
    process3EF : process3EF,
    process3G : process3G,
    process3L : process3L,
    process3J : process3J,
    process3I : process3I,
    processTab4 : processTab4,
    process3K : process3K,
    process3BA: process3BA,
    getConnection : getConnection,
    getRatesFromDb : getRatesFromDb,
    getHSNCodesFromDb: getHSNCodesFromDb,
    process3AA: process3AA,
    parse3AAObj: parse3AAObj,
    importJsonA: importJsonA,
    parse3CDAObj: parse3CDAObj,
    process3CDA: process3CDA,
    process3HA: process3HA,
    process3IA: process3IA,
    processTab4A: processTab4A,
    process3JA: process3JA,
    process3KA: process3KA
}