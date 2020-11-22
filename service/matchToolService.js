var express = require('express');
var constants = require('../utility/constants.js');
var error = require('../utility/errorconstants.js');
var log = require('../utility/logger.js');
var matchDao = require('../dao/matchDao');
var fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH, OFFLINE_TOOL_DB } = require('../utility/constants');
const { runQuery, dbClose } = require("../db/dbUtil");
const { sendResponse } = require("../utility/common");
logger = log.logger;

// To get db connection
function getConnection(gstin) {
    let db = gstin.toUpperCase();
    const dbObj = new sqlite3.Database(`${DB_PATH}/${db}.db`);
    return dbObj;
}

// To get the data from db table 
function getData(req, res) {
    matchDao.getData(req).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

// To get PR detail (supplier wise)
function getPRSupplierWise(req, res) {
    let returnPd = req.query.rtnprd;
    let gstin = req.query.gstin;
    matchDao.getDataByFyPrd(returnPd, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

function getRecordsByIds(req, res) {
    matchDao.getRecordsByIds(req).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

function saveData(req, res) {
    //console.log(req.body);
    let data = req.body;
    matchDao.saveData(data, req.query.gstin).then(
        (result) => {
            console.log("saved action pr staus successfully")
            res.status(200).send(result);
        }).catch(
            (error) => {
                console.log("error occured in service class", error);
                res.status(500).send("error occured while saving action")
            })
}

function deleteData(req, res) {
    //console.log("delted query" + req.body);
    let data = req.body;
    matchDao.deleteData(data, req.query.gstin)
        .then(
            (result) => {
                res.status(200).send("delete succesfully")
                //console.log("delete successfully")
            }
        ).catch(
            (error) => {
                console.log("error occured in service class", error);
                res.status(500).send("error occured while saving action")
            })
}

function getDocRecords(req, res) {
    matchDao.getDocRecords(req).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

function saveSummary(req, res) {
    let summary = req.body.summary;
    let gstin = req.query.gstin;
    //console.log("WE are here ------- " );
    //console.log(req.query);
    let returnPd = req.body.rtnprd
    let returnYr = req.body.rtnprd.substring(2);
    matchDao.saveSummary(summary, returnPd, returnYr, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });

}
async function saveMatchSummary(req, res) {
    logger.log("info","Entering matchToolService.js ::saveMatchSummary at : %s :: %s", new Date().getTime(), new Date().toString());
    let summary = req.body.summary;
    let apprx  = req.body.apprx;
    let tolerance = req.body.tolerance;
    let gstin = req.query.gstin;
    let returnPd = req.body.rtnprd
    let returnYr = req.body.rtnprd.substring(2);
    console.log(gstin);
    let dbObj = getConnection(gstin);
    try{
        await runQuery("BEGIN", [], dbObj);
        await Promise.all([saveMrSumm(summary, returnPd, returnYr,apprx,tolerance,dbObj, res)])
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.saveMatchSummary|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        logger.log("info","Exiting matchToolService.js ::saveMatchSummary at : %s :: %s", new Date().getTime(), new Date().toString());
        await dbClose(dbObj);
    }       
}
async function saveMrSumm(summary, returnPd, returnYr,apprx,tolerance,dbObj, res){
    await matchDao.saveMatchSummary(summary, returnPd, returnYr,apprx,tolerance,dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        res.status(500).send("Error in fetching count");
    })
}

function getMatchSummary(req, res) {
    let gstin = req.query.gstin;
    let returnPrd = req.query.rtnprd
    console.log('enter into getMatchSummary data')
    matchDao.getMatchSummary(returnPrd, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });

}


function getApprxTolerance(req,res){
    let gstin = req.query.gstin;
    let rtnprd = req.query.rtnprd
    console.log('enter into getApprxTolerance data')
    matchDao.getApprxTolerance(rtnprd, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

async function savePRDetails(req, res) {
    logger.log("info","Entering matchToolService.js ::savePRDetails at : %s :: %s", new Date().getTime(), new Date().toString());
    let prDetails = req.body.prDetail;
    let summaryList = req.body.summaryList;
    let gstin = req.query.gstin;
    let returnPrd = req.body.rtnprd
    let returnYr = req.body.rtnprd.substring(2);
    let prStatus = "P";

    let dbObj = getConnection(gstin);
    try{
        await runQuery("BEGIN", [], dbObj);
        await Promise.all([savePR(prDetails, returnPrd, returnYr, dbObj, res), saveRPSummary(summaryList, returnPrd, returnYr, dbObj, res),saveProgress(prStatus, returnPrd, returnYr, dbObj, res)])
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.savePRDetails|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        logger.log("info","Exiting matchToolService.js ::savePRDetails at : %s :: %s", new Date().getTime(), new Date().toString());
        await dbClose(dbObj);
    }       
}

async function savePR(prDetails, returnPrd, returnYr, dbObj, res){
    await matchDao.savePRDetails(prDetails, returnPrd, returnYr, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    })
}

async function saveRPSummary(summary, returnPrd, returnYr, dbObj, res){
    await matchDao.saveSummary(summary, returnPrd, returnYr, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

async function saveProgress(status, returnPrd, returnYr, dbObj, res){
    console.log("saving progress");
    await matchDao.saveProgress(status, returnPrd, returnYr, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

function getPRSummary(req, res) {
    let gstin = req.query.gstin;

    let returnPrd = req.query.rtnprd

    matchDao.getPRSummary(returnPrd, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}
function getMatchResults(req, res) {
    let gstin = req.query.gstin;
    let rtnprd = req.query.rtnprd
    matchDao.getMatchResults(gstin, rtnprd).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}
async function deleteAllPRDetails(req, res) {

    logger.log("info","Entering matchToolService.js ::deleteAllPRDetails at : %s :: %s", new Date().getTime(), new Date().toString()); 
    let gstin = req.query.gstin;
    let returnPrd = req.body.rtnprd;

    let dbObj = getConnection(gstin);
    try{
        await runQuery("BEGIN", [], dbObj);
        await Promise.all([deletePRDetails(returnPrd, dbObj, res),deletePRSummary(returnPrd, dbObj, res),deletePRStatus(returnPrd, dbObj, res),deleteMRSummary(returnPrd, dbObj, res),deleteMRDetails(returnPrd, dbObj, res), removeMatchReasult(returnPrd, dbObj, res)])
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.deleteAllPRDetails|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        await dbClose(dbObj);
        logger.log("info","Exiting matchToolService.js ::deleteAllPRDetails at : %s :: %s", new Date().getTime(), new Date().toString()); 
    }
}

async function deletePRDetails(returnPrd, dbObj, res) {
    await matchDao.deletePRDetails(returnPrd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("deletePRDetails - Error in deleting");
    });
}
async function deletePRSummary(returnPrd, dbObj, res) {
    await matchDao.deletePRSummary(returnPrd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("deletePRSummary - Error in deleting");
    });
}
async function deletePRStatus(returnPrd, dbObj, res) {
    await matchDao.deletePRStatus(returnPrd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("deletePRStatus - Error in deleting");
    });
}
async function deleteMRSummary(returnPrd, dbObj, res) {
    await matchDao.deleteMRSummary(returnPrd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("deleteMRSummary - Error in deleting");
    });
}
async function deleteMRDetails(returnPrd, dbObj, res) {
    await matchDao.deleteMRDetails(returnPrd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("deleteMRDetails - Error in deleting");
    });
}

async function removeMatchReasult(returnPrd, dbObj, res) {
    await matchDao.removeMatchReasult(returnPrd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("removeMatchReasult - Error in deleting");
    });
}

async function updateMatchStatusInProfile(gstin, fp, taxprd, matchStatus, dbObj, res) {
    await matchDao.updateMatchStatusInProfile(gstin, fp, taxprd, matchStatus, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("updateMatchStatusInProfile - Error in updateing profile");
    });
}
async function saveMrDetails(req, res) {
    logger.log("info","Entering matchToolService.js ::saveMrDetails at : %s :: %s", new Date().getTime(), new Date().toString());
    let data = req.body.saveRecords;
    let gstin = req.query.gstin;
    console.log(gstin);
    let returnPd = req.body.rtnprd
    let returnYr = req.body.rtnprd.substring(2);
    let prStatus = 'M';
    let dbObj = getConnection(gstin);
    try{
        await runQuery("BEGIN", [], dbObj);
        await Promise.all([saveMr(data, returnYr,dbObj, res),saveProgress(prStatus, returnPd, returnYr, dbObj, res)])
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.saveMrDetails|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        logger.log("info","Exiting matchToolService.js ::saveMrDetails at : %s :: %s", new Date().getTime(), new Date().toString());
        await dbClose(dbObj);
    }       
}

async function saveMr(data, returnYr,dbObj, res){
    await matchDao.saveMrDetails(data, returnYr,dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        res.status(500).send("Error in fetching count");
    })
}

function getMatchWiseResult(req, res) {
    let gstin = req.query.gstin;
    let returnPrd = req.query.rtnprd;
    let matchtype = req.query.mType;
    let sType = req.query.sType;
    console.log('enter into getMatchWiseResult data')
    matchDao.getMatchWiseResult(matchtype, sType, returnPrd, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}

function saveActions(req, res) {
    let gstin = req.body.params.gstin;
    let returnPrd = req.body.params.rtnprd;
    let ListOfActions = req.body.params.actionList;
    matchDao.saveActionsInANX2(ListOfActions, returnPrd, gstin).then((result) => {
        matchDao.saveActionsInMR(ListOfActions, returnPrd, gstin).then((result) => {
            res.status(200).send(result);
        }).catch((err) => {
            //console.log("error",err);
            res.status(500).send("Error in fetching count");
        });
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}
async function getRefineData(req, res) {
    let gstin = req.query.gstin;
    let returnPrd = req.query.rtnprd;
    console.log('enter into getRefineData data')
    await matchDao.getRefineData(returnPrd, gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}
async function updateMrDetails(req, res) {
    logger.log("info","Entering matchToolService.js ::updateMrDetails at : %s :: %s", new Date().getTime(), new Date().toString());
    let updateRecords = req.body.updateRecords;
    let gstin = req.query.gstin;
    let rtnprd = req.body.rtnprd
    let dbObj = getConnection(gstin);
    try{
        await runQuery("BEGIN", [], dbObj);
        await Promise.all([updateMr(updateRecords, rtnprd,dbObj, res)])
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Updating sucessfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.updateMrDetails|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        logger.log("info","Exiting matchToolService.js ::updateMrDetails at : %s :: %s", new Date().getTime(), new Date().toString());
        await dbClose(dbObj);
    }       
}

async function updateMr(updateRecords, rtnprd,dbObj, res){
    await matchDao.updateMrDetails(updateRecords, rtnprd,dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        res.status(500).send("Error in fetching count");
    })
}
function updatePrmRecords(req, res){
    console.log('comes to prm updating records');
    let gstin = req.query.gstin;
    let rtnprd = req.body.rtnprd;
    matchDao.updatePrmRecords(rtnprd, gstin).then(
        (result) => {
            console.log("updated sucessfully")
            res.status(200).send(result);
        }).catch(
            (error) => {
                console.log("error occured in service class", error);
                res.status(500).send("error occured while saving action")
            })
}
function getRefineMatchSummary(req,res){
    let gstin = req.query.gstin;
    let rtnprd = req.query.rtnprd;
    matchDao.getRefineMatchSummary(gstin,rtnprd).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}
function deleteMatchSummaryTables(req, res) {
         console.log("Inside deleteMatchSummaryTables service");
         let gstin = req.query.gstin;
         let rtnprd= req.body.rtnprd;
         matchDao.deleteMatchSummaryTables(rtnprd,gstin).then((result)=>{
             res.status(200).send(result);
         }).catch((err)=>{
             console.log("error",err);
             res.status(500).send("Error occurred while deleting");
         });
 }
 function updateMatchingSummary(req,res){
    let refineSummary = req.body.refineSummary;
    let gstin = req.query.gstin;
    let rtnprd = req.body.rtnprd
    console.log('enter into updateMatchingSummary Service')
    matchDao.updateMatchingSummary(refineSummary, rtnprd,gstin).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        res.status(500).send("Error in fetching count");
    });
 }
 function updateAnx2Tables(req,res){
    console.log("Inside updateAnx2Tables service");
    let gstin = req.query.gstin;
    let rtnprd= req.body.rtnprd;
    matchDao.updateAnx2Tables(rtnprd,gstin).then((result)=>{
        res.status(200).send(result);
    }).catch((err)=>{
        console.log("error",err);
        res.status(500).send("Error occurred while deleting");
    });
 }
 function resetRefineData(req,res){
    console.log("Inside updateAnx2Tables service");
    let gstin = req.query.gstin;
    let rtnprd= req.body.rtnprd;
    matchDao.resetRefineData(rtnprd,gstin).then((result)=>{
        res.status(200).send(result);
    }).catch((err)=>{
        console.log("error",err);
        res.status(500).send("Error occurred while deleting");
    });
 }

 async function getErrorFile(req,res){
    console.log("Inside getErrorFile service");
    let gstin  = req.query.gstin;
    let rtnprd = req.query.rtnprd;

    let dbObj = getConnection(gstin);
    
    await matchDao.getErrorFileInDB(rtnprd, dbObj).then((result) => {
        if(result && result.ERR_FILE && (result.ERR_FILE != null))
            res.status(200).send({"error": true, "data": result});
        else 
        res.status(200).send({"error": false, "data": null});
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("saveErrorFileInDB - Error in saving");
    });
 }

 async function saveErrorFile(req,res){
    console.log("Inside saveErrorFile service");
    let gstin  = req.query.gstin;
    let rtnprd = req.query.rtnprd;
    let data = req.body;
    
    let dbObj = getConnection(gstin);
    try{
        await runQuery("BEGIN", [], dbObj);
        await saveErrorFileInDB(data, rtnprd, dbObj, res);
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.saveErrorFile|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        await dbClose(dbObj);
        logger.log("info","Exiting matchToolService.js ::saveErrorFile at : %s :: %s", new Date().getTime(), new Date().toString()); 
    } 
 }

 async function saveErrorFileInDB(data, rtnprd, dbObj, res){
    await matchDao.saveErrorFileInDB(data, rtnprd, dbObj).then((result) => {
        return Promise.resolve();
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("saveErrorFileInDB - Error in saving");
    });
 }

 async function updateMatchStatus(req,res){
    logger.log("info","Entering matchToolService.js ::updateMatchStatus at : %s :: %s", new Date().getTime(), new Date().toString()); 
    let gstin = req.query.gstin;
    let matchStatus = req.query.matchStatus;
    let fp = req.query.fp;
    let taxprd = req.query.taxprd;

    let dbObj = getConnection(OFFLINE_TOOL_DB);
    try{
        await runQuery("BEGIN", [], dbObj);
        await updateMatchStatusInProfile(gstin, fp, taxprd, matchStatus, dbObj, res);
        await runQuery("COMMIT", [], dbObj);
        sendResponse(res, 200, { message: "Error json imported successfully", statusCd: 1 });
    } catch(err) {
        await runQuery("ROLLBACK", [], dbObj);
        logger.log("error","matchToolService.updateMatchStatus|rollbacked|err:%s|", err);                        
        sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        return 0;
    } finally {
        await dbClose(dbObj);
        logger.log("info","Exiting matchToolService.js ::updateMatchStatus at : %s :: %s", new Date().getTime(), new Date().toString()); 
    }
 }
 function getMaxMatchNumber(req,res){
    let gstin = req.query.gstin;
    let rtnprd = req.query.rtnprd;
    matchDao.getMaxMatchNumber(gstin,rtnprd).then((result) => {
        res.status(200).send(result);
    }).catch((err) => {
        //console.log("error",err);
        res.status(500).send("Error in fetching count");
    });
}
module.exports = {
    getData: getData,
    getRecordsByIds: getRecordsByIds,
    saveData: saveData,
    deleteData: deleteData,
    getDocRecords: getDocRecords,
    saveSummary: saveSummary,
    getPRSummary: getPRSummary,
    getMatchResults: getMatchResults,
    savePRDetails: savePRDetails,
    getPRSupplierWise: getPRSupplierWise,
    deletePrDetails: deleteAllPRDetails,
    saveMatchSummary: saveMatchSummary,
    getMatchSummary: getMatchSummary,
    saveMrDetails: saveMrDetails,
    getMatchWiseResult: getMatchWiseResult,
    saveActions: saveActions,
    getRefineData:getRefineData,
    updateMrDetails:updateMrDetails,
    getRefineMatchSummary:getRefineMatchSummary,
    deleteMatchSummaryTables:deleteMatchSummaryTables,
    updateMatchingSummary:updateMatchingSummary,
    updateAnx2Tables:updateAnx2Tables,
    getApprxTolerance:getApprxTolerance,
    resetRefineData:resetRefineData,
    getErrorFile: getErrorFile,
    saveErrorFile: saveErrorFile,
    updateMatchStatus: updateMatchStatus,
    updatePrmRecords:updatePrmRecords,
    getMaxMatchNumber:getMaxMatchNumber
}