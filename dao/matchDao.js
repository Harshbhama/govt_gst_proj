var express = require('express');
var router = express.Router();
const Promise = require("bluebird");
const { DB_PATH, DB_EXT } = require('../utility/constants');
var error = require('../utility/errorconstants.js');
//var logger = require('../utility/logger.js');
var dbcon = require('../db/dbUtil');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { table, query } = require('../db/queries');
var db;
const log  = require('../utility/logger.js');
const logger = log.logger;
function connectDb(gstin) {
    db = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
}
//------------------------********To Get All matching tool db ----------------------
function getData(req) {
    let tablename = req.query.tblnm;
    return new Promise(function (resolve, reject) {
        let que = '';
        let parm = [];
        //console.log("Inside Data for table::::",tablename);
        //console.log(query.matchingTables.prDetails.getData,req.query.rtnprd)
        switch (tablename) {
            case 'PROGRESS_SUMM':
                que = query.matchingTables.progressSum.getData;
                parm = [req.query.rtnprd];
                break;
            case 'PR_DETL':
                que = query.matchingTables.prDetails.getData;
                parm = [req.query.rtnprd];
                break;
        }
        console.log(que, parm)
        dbcon.fetchById(que, parm, req.query.gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        })
    });
}
function getRecordsByIds(req) {
    let tablename = req.query.tblnm;
    return new Promise(function (resolve, reject) {
        let que = '';
        let parm = [];
        //console.log("Inside Data for table::::",tablename);
        //console.log(req.query);
        switch (tablename) {
            case 'PR_DETL':
                que = query.matchingTables.prDetails.getDataByGstin;
                parm = [req.query.gstin, req.query.Supplier, req.query.rtnprd];
                break;
        }
        dbcon.fetchAllById(que, parm, req.query.dbgstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        })
    });
}
function saveData(data, gstin) {
    logger.log("info","Starting PRSAVE : %s  ::  %s", new Date().getTime(), new Date().toString());
    let tablename = data.tblnm;
    return new Promise(function (resolve, reject) {
        let que;
        let params = [];
        //console.log("Inside Data for table::::",tablename);
        //console.log(data.prStatus,data.rtnprd,'')
        if (tablename === 'PROGRESS_SUMM') {
            if (data.type === 'I') {
                que = query.matchingTables.progressSum.insertItemData;
                params = [data.prStatus, data.rtnprd, null];
                sQue = query.matchingTables.progressSum.getData;
            } else {
                que = query.matchingTables.progressSum.updateData;
                params = [data.prStatus, data.rtnprd];
                console.log(params);
            }

        } else if (tablename === 'PR_DETL') {
            que = query.matchingTables.prDetails.getData;
            params = [data.rtnprd];
        }
        if (data.type === 'U') {
            dbcon.update(que, params, gstin).then(
                (result) => {
                    logger.log("info","Ending PRUpdate : %s  ::  %s", new Date().getTime(), new Date().toString());
                    resolve(true);
                }, (err) => {
                    //console.error("Error while saving data : ", err);
                    reject(err);
                }).catch((err) => {
                    //console.error("Catch Error in saving data : ", err);
                    reject(err);
                });
        } else {
            dbcon.save(que, params, gstin).then(
                (result) => {
                    logger.log("info","Ending PRSAVE : %s  ::  %s", new Date().getTime(), new Date().toString());
                    resolve(true);
                }, (err) => {
                    //console.error("Error while saving data : ", err);
                    reject(err);
                }).catch((err) => {
                    //console.error("Catch Error in saving data : ", err);
                    reject(err);
                });
        }
    });
}
function deleteData(gstin) {
    let tablename = data.tblnm;
    return new Promise(function (resolve, reject) {
        let que;
        let params = [];
        //console.log("Inside Data for table::::",tablename);
        //console.log(data.prStatus,data.rtnprd,'')
        if (tablename === 'PROGRESS_SUMM') {
            que = query.matchingTables.progressSum.deleteAll;
            params = [data.prStatus, data.rtnprd];
        }
        ////console.log(que)
        dbcon.save(que, params, gstin).then(
            (result) => {
                resolve(true);
            }, (err) => {
                //console.error("Error while deleting data : ", err);
                reject(err);
            }).catch((err) => {
                //console.error("Catch Error in deleting data : ", err);
                reject(err);
            });

    });
}

function getDocRecords(req) {
    let tablename = req.query.tblnm;
    return new Promise(function (resolve, reject) {
        let que = '';
        let parm = [];
        //console.log("Inside Data for table::::",tablename);
        //console.log(query.matchingTables.prDetails.getDocRecords,req.query.rtnprd)
        switch (tablename) {
            case 'PR_DETL':
                que = query.matchingTables.prDetails.getPrDocRecords;
                parm = [req.query.rtnprd];
                break;
        }
        dbcon.fetchAllById(que, parm, req.query.gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        })
    });
}

function saveSummary(summary, returnPrd, returnYr, dbObj) {
    return new Promise.map(summary, (summary) => {
        return new Promise((resolve, reject) => {
            let que = query.matchingTables.prDetailSummary.insertItemData;
            ////console.log(que);
            dbcon.saveRow(que, [
                summary.desc,
                summary.noOfDoc,
                summary.taxableValue,
                summary.taxAmount,
                returnPrd,
                returnYr
            ], dbObj).then(
                (result) => {
                    //console.log("Successfully saved");
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                    //console.log("error in save");
                }).catch((error) => {
                    return reject(error);
                    //console.log("error in save");
                });
        });
    }, { concurrency: 1 }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}

function saveProgress(status, returnPrd, returnYr, dbObj) {
    return new Promise((resolve, reject) => {
        if(status === 'P'){
        let que = query.matchingTables.progressSum.insertItemData;
        dbcon.saveRow(que, [
            status,
            returnPrd,
            returnYr
        ], dbObj).then(
            (result) => {
                console.log("Successfully saved");
                return resolve(true);
            }, (error) => {
                return reject(error);
                console.log("error in save");
            }).catch((error) => {
                return reject(error);
                console.log("error in save");
            });
        }else if(status === 'M'){
            let que = query.matchingTables.progressSum.updateData;
            dbcon.saveRow(que, [
                status,
                returnPrd
            ], dbObj).then(
                (result) => {
                    console.log("Successfully saved");
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                    console.log("error in save");
                }).catch((error) => {
                    return reject(error);
                    console.log("error in save");
                });
        }
        ////console.log(que);
        
    });
}

function deletePRSummary(returnPrd, dbObj) {
    console.log("deletePRSummary - matchDao");
    return new Promise((resolve, reject) => {
        console.log(typeof returnPrd, returnPrd);
        let que = query.matchingTables.prDetailSummary.deleteAll;
        //console.log(que);
        dbcon.deleteData(que, returnPrd, dbObj).then(
            (result) => {
                console.log("Deleted successfully");
                resolve(true);
            }, (error) => {
                reject(error);
                console.log("error in delete");
            }).catch((error) => {
                reject(error);
                console.log("error in delete");
            });
    });
}

function deletePRDetails(returnPrd, dbObj) {
    console.log("deletePRSummary - matchDao");
    return new Promise((resolve, reject) => {
        console.log(typeof returnPrd, returnPrd);
        let que = query.matchingTables.prDetails.deleteAll;
        //console.log(que);
        dbcon.deleteData(que, returnPrd, dbObj).then(
            (result) => {
                console.log("Deleted successfully");
                resolve(true);
            }, (error) => {
                reject(error);
                console.log("error in delete");
            }).catch((error) => {
                reject(error);
                console.log("error in delete");
            });
    });
}

function deletePRStatus(returnPrd, dbObj) {
    console.log("Inside delete PRStatus");
    return new Promise((resolve, reject) => {
        let que = query.matchingTables.progressSum.deleteAll;
        console.log("Query : ", que);
        return dbcon.deleteData(que, returnPrd, dbObj).then(
            (result) => {
                console.log("Data deleted from PRStatus Table");
                resolve("true");
            }, (error) => {
                reject(error);
                console.log("Error in PRStatus delete");
            }).catch((error) => {
                reject(error);
                console.log("Error in PRStatus delete");
            });
    });
}


function savePRDetails(prDetails, returnPrd, returnYr, dbObj) {
    return new Promise.map(prDetails, (prDetails) => {
        return new Promise((resolve, reject) => {
            let que = query.matchingTables.prDetails.insertItemData;
            ////console.log(que);
            dbcon.saveRow(que, [
                prDetails.GSTIN + "|" + prDetails.DNUM + "|" + prDetails.DTYPE + "|" + returnPrd,
                prDetails.GSTIN,
                prDetails.TNAME,
                prDetails.INWARD,
                prDetails.DTYPE,
                prDetails.DNUM,
                prDetails.DDATE,
                prDetails.TVALUE,
                prDetails.TTAX,
                prDetails.IGST,
                prDetails.CGST,
                prDetails.SGST,
                prDetails.CESS,
                returnPrd,
                returnYr
            ], dbObj).then(
                (result) => {
                    //console.log("Successfully saved");
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                    //console.log("error in save - 1");
                }).catch((error) => {
                    return reject(error);
                    //console.log("error in save - 2");
                });
        });
    }, { concurrency: 1 }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}

function getPRSummary(returnPrd, gstin) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.prDetailSummary.getData;

        dbcon.fetchAllById(que, [returnPrd], gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}
function getMatchResults(gstin, rtnprd) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.matchResult.getDataAnx2;
        console.log(que)
        console.log(rtnprd)
        dbcon.fetchAllById(que, [rtnprd,rtnprd], gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}
function getDataByFyPrd(returnPrd, gstin) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.prDetails.getData;
        dbcon.fetchByFyPrd(que, returnPrd, gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}
function saveMatchSummary(summary, returnPrd, returnYr, apprx, tolerance, dbObj) {
    return new Promise.map(summary, (summary) => {
        return new Promise((resolve, reject) => {
            let que = '';
            let params = [];
            if (summary.tblnm == 'MR_SUMM') {
                que = query.matchingTables.mrSummary.insertItemData;
                params = [
                    summary.matchType,
                    (summary.matchType != 'INPR' ? summary.numRec : 0),
                    (summary.matchType != 'INANX2' ? summary.numRec : 0),
                    summary.TotalTaxbleValue,
                    summary.TotalTax,
                    apprx,
                    tolerance,
                    returnPrd,
                    returnYr
                ]
            } else if (summary.tblnm == 'MR_B2B_SUMM' || summary.tblnm == 'MR_DE_SUMM'
                || summary.tblnm == 'MR_SEZWOP_SUMM' || summary.tblnm == 'MR_SEZWP_SUMM') {
                que = query.matchingTables.mrSummary.insertTableWisedata;
                que = que.replace(/tblnm/g, summary.tblnm);
                params = [
                    summary.match,
                    summary.matchType,
                    summary.numRec,
                    summary.TotalTaxbleValue,
                    summary.TotalTax,
                    apprx,
                    tolerance,
                    returnPrd,
                    returnYr
                ]
            }
            dbcon.saveRow(que, params, dbObj).then(
                (result) => {
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                }).catch((error) => {
                    return reject(error);
                });

        });
    }, { concurrency: 1 }).then(result => {
        if (result) {
            return true;
        }
    })
        .catch(err => {
            console.log(err)
            return err;
        })
}
function getMatchSummary(rtnprd, gstin) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.mrSummary.getData;
        //console.log(que);
        dbcon.fetchAllById(que, [rtnprd], gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}
function getApprxTolerance(rtnprd, gstin) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.mrSummary.checkApprxTolerance;
        dbcon.fetchById(que, [rtnprd], gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}

function deleteMRDetails(returnPrd, dbObj) {
    console.log("deleteMRDetails - matchDao");
    return new Promise((resolve, reject) => {
        console.log(typeof returnPrd, returnPrd);
        let que = query.matchingTables.mrSummary.deleteMrDetails;
        //console.log(que);
        dbcon.deleteData(que, returnPrd, dbObj).then(
            (result) => {
                console.log("Deleted successfully");
                resolve(true);
            }, (error) => {
                reject(error);
                console.log("error in delete");
            }).catch((error) => {
                reject(error);
                console.log("error in delete");
            });
    });
}

function deleteMRSummary(returnPrd, dbObj) {
    console.log("deleteMRSummary - matchDao");
    data = [
        query.matchingTables.mrSummary.deleteMrSumm,
        query.matchingTables.mrSummary.deleteB2bSumm,
        query.matchingTables.mrSummary.deleteSezwpSumm,
        query.matchingTables.mrSummary.deleteSezwopSumm,
        query.matchingTables.mrSummary.deleteDeSumm
    ]
    return new Promise.map(data, (data) => {
        return new Promise((resolve, reject) => {
            console.log(typeof returnPrd, returnPrd);
            //let que = query.matchingTables.mrSummary.deleteMrDetails;
            console.log(data);
            dbcon.deleteData(data, returnPrd, dbObj).then(
                (result) => {
                    console.log("Deleted successfully");
                    resolve(true);
                }, (error) => {
                    reject(error);
                    console.log("error in delete");
                }).catch((error) => {
                    reject(error);
                    console.log("error in delete");
                });
        });
    }, { concurrency: 1 }).then(result => {
        console.log(result)
        return result;
    })
        .catch(err => {
            console.log(err)
            return err;
        })
}
function saveMrDetails(data, returnYr, dbObj) {
    return new Promise.map(data, (data) => {
        return new Promise((resolve, reject) => {
            let que = query.matchingTables.mrSummary.insertMrDetails;
            let action = '';
            if(data.ACTION_TAKEN === 'A'){
                action = 'Accepted';
            }else if(data.ACTION_TAKEN === 'P'){
                action = 'Pending';
            }else if(data.ACTION_TAKEN === 'R'){
                action = 'Rejected';
            }
            dbcon.saveRow(que, [
                data.DOCREF,
                data.GSTIN,
                data.LGL_TRDNAME,
                data.DOC_TYPE,
                data.DOC_NUM,
                data.DOC_DATE,
                data.TAXABLE_VALUE,
                data.TAX_AMOUNT,
                data.CGST,
                data.IGST,
                data.SGST,
                data.CESS,
                data.IS_ITC_ENTL,
                action,
                data.ACTION_TAKEN,
                data.REASON,
                data.FIN_PRD,
                returnYr,
                data.SUPPLY_TYPE,
                data.MatchType,
                data.RecordType,
                data.FIELD_MATCH,
                data.PORTAL_STAT,
                data.S_RETURN_STAT,
                data.MATCH_NUMBER
            ], dbObj).then(
                (result) => {
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                }).catch((error) => {
                    return reject(error);
                });
        });
    }, { concurrency: 1 }).then(result => {
        return result;
    }).catch(err => {
        return err;
    })
}
function getMatchWiseResult(matchtype, sType, returnPrd, gstin) {
    console.log("starting matchdao time of matching result: "+ new Date())
    return new Promise(function (resolve, reject) {
        let que = '';
        let params = [];
        if (matchtype === 'mall' || matchtype === 'uall') {
            que = query.matchingTables.getMatchResult.matchall;
            if (matchtype === 'mall') {
                que = que.replace(/matchall/g, "MATCH_TYPE IN('EM','PM','PRM','MWTT','MWAD','PMWTT','PMWAD','PRMWTT','PRMWAD')");
                que = que.replace(/orderby/g, `ORDER BY
                CASE  WHEN (MATCH_TYPE = 'PM'  OR MATCH_TYPE = 'PMWTT'  OR MATCH_TYPE  = 'PMWAD') THEN GSTIN END,
                CASE  WHEN (MATCH_TYPE = 'PM'  OR MATCH_TYPE = 'PMWTT'  OR MATCH_TYPE  = 'PMWAD') THEN DOC_TYPE END,
                CASE  WHEN (MATCH_TYPE = 'PM'  OR MATCH_TYPE = 'PMWTT'  OR MATCH_TYPE  = 'PMWAD') THEN MATCH_NUMBER END,
                CASE  WHEN (MATCH_TYPE = 'PM'  OR MATCH_TYPE = 'PMWTT'  OR MATCH_TYPE  = 'PMWAD') THEN RECORD_TYPE END,
                CASE  WHEN (MATCH_TYPE = 'PRM' OR MATCH_TYPE = 'PRMWTT' OR MATCH_TYPE  = 'PRMWAD') THEN DOC_NUM END,
                CASE  WHEN (MATCH_TYPE = 'PRM' OR MATCH_TYPE = 'PRMWTT' OR MATCH_TYPE  = 'PRMWAD') THEN DOC_DATE END,
                CASE  WHEN (MATCH_TYPE = 'PRM' OR MATCH_TYPE = 'PRMWTT' OR MATCH_TYPE  = 'PRMWAD') THEN RECORD_TYPE END,
                CASE  WHEN (MATCH_TYPE = 'EM' OR MATCH_TYPE  = 'MWTT'   OR MATCH_TYPE  = 'MWAD')  THEN UPPER(DOCREF)  END,
                CASE  WHEN (MATCH_TYPE = 'EM' OR MATCH_TYPE  = 'MWTT'   OR MATCH_TYPE  = 'MWAD')  THEN MATCH_NUMBER  END,
                CASE  WHEN (MATCH_TYPE = 'EM' OR MATCH_TYPE  = 'MWTT'   OR MATCH_TYPE  = 'MWAD')  THEN RECORD_TYPE  END`);
            } else {
                que = que.replace(/matchall/g, "MATCH_TYPE IN('MM','INANX2','INPR')");
                que = que.replace(/orderby/g, "ORDER BY UPPER(DOCREF),RECORD_TYPE")
            }
            params = [sType, returnPrd];
        } else {
            que = query.matchingTables.getMatchResult.mrGetData;
            if (matchtype === 'PM' || matchtype === 'PMWTT' || matchtype === 'PMWAD') {
                que = que.replace(/orderby/g, "ORDER BY GSTIN,DOC_TYPE,MATCH_NUMBER,RECORD_TYPE");
            } else if (matchtype === 'PRM' || matchtype === 'PRMWTT' || matchtype === 'PRMWAD') {
                que = que.replace(/orderby/g, " ORDER BY MATCH_NUMBER,RECORD_TYPE");
            } else {
                que = que.replace(/orderby/g, " ORDER BY DOCREF,RECORD_TYPE");
            }
            params = [matchtype, sType, returnPrd];
        }
        console.log(que)
        console.log(params);
        dbcon.fetchAllById(que, params, gstin).then((result) => {
            resolve(result);
            console.log("End matchdao time of matching result: "+ new Date())
        }).catch((err) => {
            reject(err);
        });
    })
}
function deleteAllTableData(rtnprd, gstin) {
    connectDb(gstin);
    console.log('connecting db')
    return new Promise(function (resolve, reject) {
        deleteTableData(db, rtnprd).then(() => resolve()).catch(() => reject())
    });

}
function deleteTableData(db, rtnprd) {
    console.log("Inside delete data");
    console.log(rtnprd);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            resolve(db.run(query.matchingTables.prDetails.deleteAll, [rtnprd]).run(query.matchingTables.prDetailSummary.deleteAll, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteProgressSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteMrSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteB2bSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteSezwpSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteSezwopSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteDeSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteMrDetails, [rtnprd])
            );
        })

    })
}

function saveActionsInANX2(actionsList, returnPrd, gstin) {
    return new Promise.map(actionsList, (actionList) => {
        return new Promise((resolve, reject) => {
            let que;
            if (actionList.table.toUpperCase() == "B2B") {
                que = query.matchingTables.takeAction.saveAction3AB;
            } else if (actionList.table.toUpperCase() == "DE") {
                que = query.matchingTables.takeAction.saveAction3AG;
            } else if (actionList.table.toUpperCase() == "SEZWP") {
                que = query.matchingTables.takeAction.saveAction3AE;
            } else if (actionList.table.toUpperCase() == "SEZWOP") {
                que = query.matchingTables.takeAction.saveAction3AF;
            }
            //console.log(que);
            if (actionList.table.toUpperCase() == "SEZWOP") {
                dbcon.save(que, [
                    actionList.matchType,
                    actionList.reason,
                    actionList.action,
                    actionList.DOCREF,
                    returnPrd
                ], gstin).then(
                    (result) => {
                        console.log("Successfully updated");
                        return resolve(true);
                    }, (error) => {
                        return reject(error);
                        console.log("error in update");
                    }).catch((error) => {
                        return reject(error);
                        console.log("error in update");
                    });
            } else {
                dbcon.save(que, [
                    actionList.matchType,
                    actionList.reason,
                    actionList.action,
                    actionList.itc,
                    actionList.DOCREF,
                    returnPrd
                ], gstin).then(
                    (result) => {
                        console.log("Successfully updated");
                        return resolve(true);
                    }, (error) => {
                        return reject(error);
                        console.log("error in update");
                    }).catch((error) => {
                        return reject(error);
                        console.log("error in update");
                    });
            }
        });
    }, { concurrency: 1 }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}

function saveActionsInMR(actionsList, returnPrd, gstin) {
    return new Promise.map(actionsList, (actionList) => {
        return new Promise((resolve, reject) => {
            let que = query.matchingTables.takeAction.saveActionMR;
            //console.log(que);
            dbcon.save(que, [
                actionList.action,
                actionList.actionTaken,
                actionList.itc,
                actionList.DOCREF,
                returnPrd
            ], gstin).then(
                (result) => {
                    console.log("Successfully updated");
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                    console.log("error in update");
                }).catch((error) => {
                    return reject(error);
                    console.log("error in update");
                });
        });
    }, { concurrency: 1 }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}

function getRefineData(returnPrd, gstin) {
    console.log("enter into getRefineData dao")
    return new Promise(function (resolve, reject) {
        que = query.matchingTables.getMatchResult.refineData;
        //console.log(que)
        dbcon.fetchAllById(que, [returnPrd], gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}
function updateMrDetails(data, rtnprd, dbObj) {
    return new Promise.map(data, (data) => {
        return new Promise((resolve, reject) => {
            que = query.matchingTables.mrSummary.updateMrDetails;
            params = [
                data.REASON,
                data.MatchType,
                data.MATCH_TYPE,
                data.MATCH_NUMBER,
                data.FIELD_MATCH,
                data.FIELD_REFINE_MATCH,
                data.DOCREF,
                data.TABLE_NAME,
                data.RECORD_TYPE,
                data.MATCH_TYPE
            ];
            dbcon.saveRow(que, params, dbObj).then(
                (result) => {
                    return resolve(true);
                }, (error) => {
                    return reject(error);
                }).catch((error) => {
                    return reject(error);
                });
        });
    }, { concurrency: 1 }).then(result => {
        return result;
    }).catch(err => {
        return err;
    })
}
function updatePrmRecords(rtnprd,gstin){
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.mrSummary.resetPrmToInPr;
        let params = [rtnprd,rtnprd];
        dbcon.save(que, params, gstin).then(
            (result) => {
                logger.log("info","Ending update prm records : %s  ::  %s", new Date().getTime(), new Date().toString());
                resolve(true);
            }, (err) => {
                reject(err);
            }).catch((err) => {
                reject(err);
            });
    });
}
function getRefineMatchSummary(gstin, rtnprd) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.mrSummary.refineMatchSummary;
        dbcon.fetchAllById(que, [rtnprd], gstin).then((result) => {
            resolve(result);
        }).catch((err) => {
            reject(err);
        });
    }).then(result => {
        return result;
    })
        .catch(err => {
            return err;
        })
}
function deleteMatchSummaryTables(rtnprd, gstin) {
    return new Promise(function (resolve, reject) {
        connectDb(gstin);
        console.log('connecting db')
        db.exec('BEGIN TRANSACTION;');
        deleteMatchSummaryTableData(db, rtnprd).then(() => {
            db.exec('COMMIT;');
            //db.close();
            resolve();
        }).catch(() => {
            db.exec('ROLLBACK');
            //db.close();
            reject();
        })
    });

}
function deleteMatchSummaryTableData(db, rtnprd) {
    console.log("Inside delete data");
    console.log(rtnprd);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            resolve(db.run(query.matchingTables.mrSummary.deleteMrSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteB2bSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteSezwpSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteSezwopSumm, [rtnprd])
                .run(query.matchingTables.mrSummary.deleteDeSumm, [rtnprd])
            );
        })

    })
}
function updateMatchingSummary(data, rtnprd, gstin) {
    console.log('enter into updateMatchingSummary DAO')
    connectDb(gstin);
    return new Promise.map(data, (data) => {
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                console.log(data)
                que = query.matchingTables.getMatchResult.getMatchSummaryData;
                que = que.replace(/tblnm/g, data.tblnm);
                params = [data.match, data.matchType, rtnprd];
                resolve(db.get(que, params, function (err, row) {
                    if (err) throw err;
                    console.log(row)
                    if (typeof row == "undefined") {
                        mQuery = query.matchingTables.mrSummary.insertTableWisedata;
                        mQuery = mQuery.replace(/tblnm/g, data.tblnm);
                        mParams = [
                            data.match,
                            data.matchType,
                            data.numRec,
                            data.TotalTaxbleValue,
                            data.TotalTax,
                            '',
                            '',
                            rtnprd,
                            ''
                        ];
                        console.log(mQuery);
                        console.log(mParams)
                        db.run(mQuery, mParams)
                    } else {
                        mQuery = query.matchingTables.getMatchResult.updateMatchResult;
                        mQuery = mQuery.replace(/tblnm/g, data.tblnm);
                        mParams = [
                            data.numRec,
                            data.TotalTaxbleValue,
                            data.TotalTax,
                            data.match,
                            data.matchType,
                            rtnprd
                        ];
                        console.log(mQuery);
                        console.log(mParams)
                        db.run(mQuery, mParams);
                    }
                }));
            })

        })
    }, { concurrency: 10 }).then(result => {
        return result;
    })
        .catch(err => {
            console.log(err)
            return err;
        })
}
function updateAnx2Tables(rtnprd, gstin) {
    return new Promise(function (resolve, reject) {
        connectDb(gstin);
        console.log('connecting db')
        db.exec('BEGIN TRANSACTION;');
        updateTableData(db, rtnprd).then(() => {
            db.exec('COMMIT;');
            //db.close();
            resolve();
        }).catch(() => {
            db.exec('ROLLBACK');
            //db.close();
            reject();
        })
    });

}
function updateTableData(db, rtnprd) {
    console.log("Inside update data");
    console.log(rtnprd);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            resolve(db.run(query.matchingTables.mrSummary.anx2B2bUpdate)
                .run(query.matchingTables.mrSummary.anx2DeUpdate)
                .run(query.matchingTables.mrSummary.anx2SezwopUpdate)
                .run(query.matchingTables.mrSummary.anx2SezwpUpdate)
                .run(query.matchingTables.mrSummary.anx2B2bRSNUpdate)
                .run(query.matchingTables.mrSummary.anx2DeRSNUpdate)
                .run(query.matchingTables.mrSummary.anx2SezwpRSNUpdate)
                .run(query.matchingTables.mrSummary.anx2SezwopRSNUpdate)
            );
        })

    })
}

function resetRefineData(rtnprd, gstin) {
    return new Promise(function (resolve, reject) {
        connectDb(gstin);
        console.log('connecting db')
        db.exec('BEGIN TRANSACTION;');
        resetRefineMrData(db, rtnprd).then(() => {
            db.exec('COMMIT;');
            //db.close();
            resolve(true);
        }).catch(() => {
            db.exec('ROLLBACK');
            //db.close();
            reject();
        })
    });
}

function resetRefineMrData(db, rtnprd) {
    console.log("Inside MR_DETL update data");
    console.log(query.matchingTables.mrSummary.resetReasonsPrmRecords);
    console.log(rtnprd);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            resolve(db.run(query.matchingTables.mrSummary.resetExistMatchType, [rtnprd])
                .run(query.matchingTables.mrSummary.restExistFieldMatch, [rtnprd])
                .run(query.matchingTables.mrSummary.resetReasonsPrmRecords,[rtnprd])
                .run(query.matchingTables.mrSummary.resetFieldMatchOfInax2AndInpr,[rtnprd])
                .run(query.matchingTables.mrSummary.resetExistRefineMatchType, [rtnprd])
               
            );
        })

    })
}
function removeMatchReasult(returnPrd, dbObj) {
    console.log("matchDao - removeMatchReasult");
    var que = [
        query.matchingTables.matchResult.updateANX2OnPRDelete3AB,
        query.matchingTables.matchResult.updateANX2OnPRDelete3AE,
        query.matchingTables.matchResult.updateANX2OnPRDelete3AF,
        query.matchingTables.matchResult.updateANX2OnPRDelete3AG
    ]
    return new Promise.map(que, (que) => {
        return new Promise((resolve, reject) => {
            //console.log(que);
            dbcon.updateRow(que, [returnPrd], dbObj).then(
                (result) => {
                    console.log("matchDao - removeMatchReasult - Deleted successfully");
                    resolve(true);
                }, (error) => {
                    reject(error);
                    console.log("matchDao - removeMatchReasult - error in delete");
                }).catch((error) => {
                    reject(error);
                    console.log("matchDao - removeMatchReasult - error in delete");
                });
        });
    }, { concurrency: 1 }).then(result => {
        console.log(result)
        return result;
    }).catch(err => {
        console.log(err)
        return err;
    })
}

function updateMatchStatusInProfile(gstin, fp, taxprd, matchStatus, dbObj) {

    return new Promise((resolve, reject) => {
        let que = query.profile.updateMatchStatus;
         console.log(que,taxprd);
        dbcon.updateRow(que, [matchStatus, gstin, fp, taxprd], dbObj).then(
            (result) => {
                console.log("updateMatchStatusInProfile - Successfully updated");
                return resolve(true);
            }, (error) => {
                console.log("updateMatchStatusInProfile - error in update");
                return reject(error);
            }).catch((error) => {
                console.log("updateMatchStatusInProfile - error in update");
                return reject(error);
            });
    });
}

function saveErrorFileInDB(data, rtnprd, dbObj) {
    return new Promise((resolve, reject) => {
        let que = query.matchingTables.errorFile.saveErrorFile;
        //console.log(que);
        dbcon.updateRow(que, [data.data, rtnprd], dbObj).then(
            (result) => {
                console.log("saveErrorFileInDB - Successfully updated");
                return resolve(true);
            }, (error) => {
                console.log("saveErrorFileInDB - error in update");
                return reject(error);
            }).catch((error) => {
                console.log("saveErrorFileInDB - error in update");
                return reject(error);
            });
    });
}
function getErrorFileInDB(rtnprd, dbObj) {
    return new Promise((resolve, reject) => {
        let que = query.matchingTables.errorFile.getErrorFile;
        //console.log(que);
        dbcon.getRow(que, [rtnprd], dbObj).then(
            (result) => {
                console.log("getErrorFileInDB - Successfully fetched");
                return resolve(result);
            }, (error) => {
                console.log("getErrorFileInDB - error in fetch");
                return reject(error);
            }).catch((error) => {
                console.log("getErrorFileInDB - error in fetch");
                return reject(error);
            });
    });
}
function getMaxMatchNumber(gstin, rtnprd) {
    return new Promise(function (resolve, reject) {
        let que = query.matchingTables.mrSummary.getMaxMatchNumber;
        console.log('get match number');
        console.log(que,rtnprd);
        dbcon.fetchById(que, [rtnprd], gstin).then((result) => {
            console.log(result)
            resolve(result);
        }).catch((err) => {
            console.log(err)
            reject(err);
        })
    }).then(result => {
        console.log(result)
        return result;
    }).catch(err => {
            console.log(err)
            return err;
   })
}
module.exports = {
    getData: getData,
    getRecordsByIds: getRecordsByIds,
    saveData: saveData,
    deleteData: deleteData,
    getDocRecords: getDocRecords,
    saveSummary: saveSummary,
    deletePRSummary: deletePRSummary,
    savePRDetails: savePRDetails,
    getPRSummary: getPRSummary,
    deletePRDetails: deletePRDetails,
    getDataByFyPrd: getDataByFyPrd,
    getMatchResults: getMatchResults,
    deletePRStatus: deletePRStatus,
    saveMatchSummary: saveMatchSummary,
    getMatchSummary: getMatchSummary,
    deleteMRSummary: deleteMRSummary,
    deleteMRDetails: deleteMRDetails,
    saveMrDetails: saveMrDetails,
    getMatchWiseResult: getMatchWiseResult,
    deleteAllTableData: deleteAllTableData,
    saveActionsInANX2: saveActionsInANX2,
    saveActionsInMR: saveActionsInMR,
    getRefineData: getRefineData,
    updateMrDetails: updateMrDetails,
    getRefineMatchSummary: getRefineMatchSummary,
    deleteMatchSummaryTables: deleteMatchSummaryTables,
    updateMatchingSummary: updateMatchingSummary,
    updateAnx2Tables: updateAnx2Tables,
    saveProgress: saveProgress,
    getApprxTolerance: getApprxTolerance,
    removeMatchReasult: removeMatchReasult,
    resetRefineData: resetRefineData,
    updateMatchStatusInProfile: updateMatchStatusInProfile,
    saveErrorFileInDB: saveErrorFileInDB,
    getErrorFileInDB: getErrorFileInDB,
    updatePrmRecords : updatePrmRecords,
    getMaxMatchNumber:getMaxMatchNumber
}; 