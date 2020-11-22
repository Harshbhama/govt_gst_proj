var express = require('express');
var anx2const = require('../../utility/anx2Constant.js');
var error = require('../../utility/errorconstants.js');
var dbcon = require('../../db/dbUtil');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {  query }  = require('../../db/queries');
const { OFFLINE_TOOL_DB, DB_PATH, DB_EXT} = require('../../utility/constants');
var db;
const logger  = require('../../utility/logger.js').logger;
//this method is to connect to the database 
   function connectDb(gstin) {
    db = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
}

/**
 * deletes the table data and opens downloaded JSON file
 * @param {*} fileData
 * @param {*} gstin
 * @param {*} rtnprd
 */
function persistData(fileData, gstin,rtnprd) {
    logger.log("info","Entering anx2ErrDao.js :: persistData at : %s  ::  %s", new Date().getTime(), new Date().toString());
    logger.log("debug","Inside open downloaded JSON");
    return new Promise(function (resolve, reject) {
            connectDb(gstin);
            let promarr=[];
            let nestpromarr=[];
            let flgVal = anx2const.FLAG_U;
            let params = [flgVal,rtnprd];
            logger.log("debug","created DB connection");
            db.serialize(()=>{
            return new Promise(function (resolve, reject) {
            db.exec('BEGIN TRANSACTION;');
            promarr.push(dbcon.update(query.anx2.b2b.updateFlagData,params,undefined,db));
            promarr.push(dbcon.update(query.anx2.sezwp.updateFlagData,params,undefined,db))
            promarr.push(dbcon.update(query.anx2.sezwop.updateFlagData,params,undefined,db))
            promarr.push(dbcon.update(query.anx2.de.updateFlagData,params,undefined,db))
            Promise.all(promarr).then(()=>{
                nestpromarr.push(dataloops(fileData,db))
                let anx2stat=fileData[anx2const.ARN]!==undefined && fileData[anx2const.FILING_DATE]!==undefined?anx2const.FLAG_FILED:anx2const.FLAG_NOT_FILED;
                nestpromarr.push(dbcon.update(query.profile.updatefdstat,[anx2stat,gstin],OFFLINE_TOOL_DB,undefined));
            Promise.all(nestpromarr).then(()=>resolve(),(err)=>reject(err));

        })}).then((result) => {
            db.exec('COMMIT;');
            db.close();
            logger.log("debug","Inside commit", result);
            logger.log("info","Exiting anx2ErrDao.js :: persistData at : %s  ::  %s", new Date().getTime(), new Date().toString());
            resolve();
        }).catch((err) => {
            logger.log("error","anx2ErrDao.js :: persistData :: Error occured while processing file data ::%s", err);
            db.exec('ROLLBACK;');
            db.close();
            logger.log("debug","Rollback Done");
            reject(err);
        })})
    });
}
/**
 *updates b2b table with data
 * @param {*} fileData
 */
function createb2b(fileData){
    logger.log("debug","Entering anx2Dao.js :: createb2b at : %s  ::  %s", new Date().getTime(), new Date().toString());
    let dataarr=[];
    for (let i = 0; i < fileData.b2b.length; i++) {
        let currec=fileData.b2b[i];
        let data = {};
        for (let j = 0; j < currec.docs.length; j++) {
            let currdoc=currec.docs[j];
            let doctyp=currdoc.doctyp;
            if(doctyp==anx2const.DOCTYP_C){
               doctyp=anx2const.DOCTYP_CN;
           }else if(doctyp==anx2const.DOCTYP_D){
             doctyp=anx2const.DOCTYP_DN;
           }
            let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;

            data = {
                flg:anx2const.FLAG_X,
                err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg,
                docref: docrf
            };
            dataarr.push(data);
        }
    }
    logger.log("debug","Exiting anx2Dao.js :: createb2b at : %s  ::  %s", new Date().getTime(), new Date().toString());
    return [dataarr];

}

/**
 *updates sezwop table with data
 * @param {*} fileData
 */
function createsezwop(fileData){
    logger.log("debug","Entering anx2Dao.js :: createsezwop at : %s  ::  %s", new Date().getTime(), new Date().toString());
    let dataarr=[];
    for (let i = 0; i < fileData.sezwop.length; i++) {
        let currec=fileData.sezwop[i];
        let data = {};
        for (let j = 0; j < currec.docs.length; j++) {
            let currdoc=currec.docs[j];
            let doctyp=currdoc.doctyp;
            if(doctyp==anx2const.DOCTYP_C){
                doctyp=anx2const.DOCTYP_CN;
            }else if(doctyp==anx2const.DOCTYP_D){
                doctyp=anx2const.DOCTYP_DN;
            }
            let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;

            data = {
                flg:anx2const.FLAG_X,
                err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg,
                docref: docrf
            };
            dataarr.push(data);               
        }
    }
    logger.log("debug","Exiting anx2Dao.js :: createsezwop at : %s  ::  %s", new Date().getTime(), new Date().toString());
    return [dataarr];
    
}
/**
 *updates sezwp table with data
 * @param {*} fileData
 */
function createsezwp(fileData){
    logger.log("debug","Entering anx2Dao.js :: createsezwp at : %s  ::  %s", new Date().getTime(), new Date().toString());
    let dataarr=[];
    for (let i = 0; i < fileData.sezwp.length; i++) {
        let data = {};
        let currec=fileData.sezwp[i];
        for (let j = 0; j < currec.docs.length; j++) {
            let currdoc=currec.docs[j];
            let doctyp=currdoc.doctyp;
            if(doctyp==anx2const.DOCTYP_C){
                doctyp=anx2const.DOCTYP_CN;
            }else if(doctyp==anx2const.DOCTYP_D){
                doctyp=anx2const.DOCTYP_DN;
            }
            let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;
        
            data = {
                flg:anx2const.FLAG_X,
                err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg,
                docref: docrf
            };
            dataarr.push(data);  
        }
    }
    logger.log("debug","Exiting anx2Dao.js :: createsezwp at : %s  ::  %s", new Date().getTime(), new Date().toString());
    return [dataarr];
    
}
/**
 *updates de table with data
 * @param {*} fileData
 */
function createde(fileData){
    logger.log("debug","Entering anx2Dao.js :: createde at : %s  ::  %s", new Date().getTime(), new Date().toString());
    let dataarr=[];
    for (let i = 0; i < fileData.de.length; i++) {
        let data = {};
        let currec=fileData.de[i];
        for (let j = 0; j < currec.docs.length; j++) {
            let currdoc=currec.docs[j];
            let doctyp=currdoc.doctyp;
            if(doctyp==anx2const.DOCTYP_C){
                doctyp=anx2const.DOCTYP_CN;
            }else if(doctyp==anx2const.DOCTYP_D){
                doctyp=anx2const.DOCTYP_DN;
            }
            let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;
            
            data = {
                flg:anx2const.FLAG_X,
                err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg,
                docref: docrf
            };
            dataarr.push(data);
            }                  
        }
        logger.log("debug","Exiting anx2Dao.js :: createde at : %s  ::  %s", new Date().getTime(), new Date().toString());
        return [dataarr];
    }

/**
 * inserts and saves data
 * @param {*} fileData
 * @param {*} db
 */
    function dataloops(fileData,db) {
        logger.log("info","Entering anx2ErrDao.js :: dataloops at : %s  ::  %s", new Date().getTime(), new Date().toString());
        let promiseArr=[];
        logger.log("debug","Inside dataloops ");

        return new Promise(function (resolve, reject) {
            if (fileData.b2b != null && fileData.b2b != undefined) {
                let arr=createb2b(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.b2b.updateFileData,arr[0],db));
            }
            if (fileData.sezwp != null && fileData.sezwp != undefined) {
                let arr=createsezwp(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.sezwp.updateFileData,arr[0],db));
            }
            if (fileData.sezwop != null && fileData.sezwop != undefined) {
                let arr=createsezwop(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.sezwop.updateFileData,arr[0],db));
            }
            if (fileData.de != null && fileData.de != undefined) {
                let arr=createde(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.de.updateFileData,arr[0],db));
            }
            else{
                logger.log("debug","No data for insert");
            }
            Promise.all(promiseArr)
            .then((result)=>{
                resolve("update done"),
                logger.log("info","Exiting anx2ErrDao.js :: dataloops at : %s  ::  %s", new Date().getTime(), new Date().toString())
            })
            .catch((error)=>reject("error occured while saving"))
        })
    }

module.exports={
    persistData:persistData
}