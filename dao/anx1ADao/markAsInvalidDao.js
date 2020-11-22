const log = require('../../utility/logger');
const logger = log.logger;
const db = require("../../db/dbUtil");
const summary = require('../anx1SummaryDao');
const sqlite3 = require('sqlite3').verbose();
const { save3IASummaryTxn } = require('../anx1ADao/anx13IADao');
const { save3JASummaryTxn } = require('../anx1ADao/anx13JADao');
const { save4aSummaryTxn } = require('../anx1ADao/anx14ADao');
const { save3HASummaryTxn } = require('../anx1ADao/anx13HADao');
const { save3KASummaryByType } = require('../anx1ADao/anx13KADao');
const { summary3cdTxn } = require('../anx1ADao/anx13CDADao');
const { DB_PATH, DB_EXT } = require('../../utility/constants');
const anx1Tables = ['ANX1_3AA', 'ANX1_3CDA', 'ANX1_3HA', 'ANX1_3IA', 'ANX1_3JA', 'ANX1_4A'];
const { anx1Queries } = require("../../db/Queries");
const Promise = require("bluebird");

async function markAsInvalid(tablename, rtnprd, fp, docid, flag, gstin, status, docref) {
    logger.log('info', 'Entering markAsInvalidDao')
    let gstindb;
    try {
        gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
        gstindb.exec('BEGIN TRANSACTION;');
        let text = "Marked as Invalid";
        if (flag === "I" && status != "Invalid") {
            text = "marked as invalid";
            status = "Marked as Invalid";
        } else if (status == "Invalid") {
            text = "marked as undo invalid";
            status = "Marked as Undo Invalid";
        } else if (flag == "" && status != "Invalid") {
            text = "unmarked from invalid";
            flag = "N";
            status = "";
        }
        tablename = "ANX1_" + tablename;
        itmTable = "ANX1_ITEMDTLS";
        setToZero = 0;
        let count = 0;
        var recsql;
        switch (tablename) {
            case "ANX1_3CDA":
                recsql = 'update ' + tablename + ' set FLAG = "' + flag + '", STATUS = "' + status + '", DOC_VAL = "' + setToZero + '", TOTAL_TAX_VALUE = "' + setToZero + '", TOTAL_IGST = "' + setToZero + '", TOTAL_CESS = "' + setToZero + '" where TAX_PERIOD = "' + rtnprd + '" AND DOCREF = "' + docref + '"';
                break;
            case "ANX1_3JA":
                recsql = 'update ' + tablename + ' set FLAG = "' + flag + '", STATUS = "' + status + '", BOEVAL = "' + setToZero + '", TAX_VALUE = "' + setToZero + '", IGST = "' + setToZero + '", CESS = "' + setToZero + '" where TAX_PERIOD = "' + rtnprd + '" AND DOCREF = "' + docref + '"';
                break;
            case "ANX1_3KA":
                recsql = 'update ' + tablename + ' set FLAG = "' + flag + '", STATUS = "' + status + '", BOE_VALUE = "' + setToZero + '", TAX_VALUE = "' + setToZero + '", IGST = "' + setToZero + '", CESS = "' + setToZero + '" where TAX_PERIOD = "' + rtnprd + '" AND DOCREF = "' + docref + '"';
                break;
        }
        var itmsql = 'update ' + itmTable + ' set TAXRATE = "' + setToZero + '", TAXVAL = "' + setToZero + '", IGST = "' + setToZero + '", CESS = "' + setToZero + '" where ITEMREF = "' + docref + '"';
        count = await db.update(recsql, [], gstin, gstindb);
        itmcount = await db.update(itmsql, [], gstin, gstindb);
        if (count) {
            await calculateSummaryI(tablename, docid, rtnprd, fp, gstin, gstindb, docid);
            gstindb.exec('COMMIT;');
            return ({ message: count + " records " + text, statusCd: 1 })
        }
        throw new Error(({ message: " No records " + text, statusCd: 0 }))
    }
    catch (err) {
        gstindb.exec('ROLLBACK;');

        throw err;
    }
    finally {
        gstindb.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }
}
async function calculateSummaryI(tablename, docid, taxperiod, fp, gstin, gstindb, docIdsList) {
    logger.log("info", "Inside markForDeleteDao | calculateSummary - %s", tablename);
    switch (tablename) {
        case "ANX1_3CDA":
            await summary3cdTxn(fp, taxperiod, gstindb, false, true);
            break;
        case "ANX1_3JA":
            await save3JASummaryTxn(gstin, fp, taxperiod, gstindb);
            break;
        case "ANX1_3KA":
            let ctinArray = await db.fetchAllByIdTxn("SELECT distinct CTIN from ANX1_3KA where TAX_PERIOD = ?", [taxperiod], gstindb);
            await Promise.mapSeries(ctinArray, (ctin) => {
                save3KASummaryByType(gstindb, fp, taxperiod, ctin.CTIN, "", "CTIN");
            });
            await save3KASummaryByType(gstindb, fp, taxperiod, "", "B", "DOC");
            break;
    }

}

async function markForDeletea(tablename, rtnprd, fp, docid, flag, gstin) {
    logger.log('info', 'Entering markForDeleteA');
    // console.log('Details from frontenc tablename', tablename);
    // console.log('Details from frontenc rtnprd', rtnprd);
    // console.log('Details from frontenc fp', fp);
    // console.log('Details from frontenc docid', docid);
    // console.log('Details from frontenc flag', flag);
    // console.log('Details from frontenc gstin', gstin);
    let gstindb;
    try {
        gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
        gstindb.exec('BEGIN TRANSACTION;');
        let text = "marked for delete";
        //let status = "Marked for delete";
        // if(flag == "U" || flag == "Am"){
        //     text = "unmarked from delete";
        //    // status= "Uploaded";
        // }
        if (flag == "Am") {
            text = "unmarked from delete";
            status = "Amended";
        } else if (flag == "D") {
            text = "Marked for delete";
            status = "Marked for delete";
        }
        tablename = "ANX1_" + tablename;
        let count = 0;
        if (docid == "All") {
            console.log('All loop')
            var sql = 'update ' + tablename + ' set FLAG = "' + flag + '", STATUS = "' + status + '" where TAX_PERIOD = "' + rtnprd + '" AND (STATUS IN ("Amended") OR FLAG IN ("D"))';
            console.log('SQL >> ', sql);
            count = await db.update(sql, [], gstin, gstindb);
            if (count) {
                await calculateSummary(tablename, docid, rtnprd, fp, gstin, gstindb, docid);
                gstindb.exec('COMMIT;');
                return ({ message: count + " records " + text, statusCd: 1 })
            }
            throw new Error(({ message: " No records " + text, statusCd: 0 }))
        }
        else {
            console.log('table type');
            console.log(gstindb);
            let list = "";
            docid.forEach((id) => {
                list = list + "," + id;
            })
            // var sql = 'update ' + tablename + ' set FLAG = "' + flag + '" where TAX_PERIOD = "' + rtnprd + '" and DOC_ID IN (' +list.substring(1) +') AND (STATUS IN (null, "", "Amended") OR FLAG IN ("D"))' ;
            var sql = 'update ' + tablename + ' set FLAG = "' + flag + '", STATUS = "' + status + '" where TAX_PERIOD = "' + rtnprd + '" and DOC_ID IN (' + list.substring(1) + ') AND FLAG IN ("D","N","Am","E","")';
            console.log('SQL >> ', sql);
            count = await db.update(sql, [], gstin, gstindb);
            if (count) {

                await calculateSummary(tablename, list.substring(1), rtnprd, fp, gstin, gstindb, docid);
                gstindb.exec('COMMIT;');
                return ({ message: count + " records " + text, statusCd: 1 })
            }
            throw new Error(({ message: " No records " + text, statusCd: 0 }))
        }
    }
    catch (err) {
        gstindb.exec('ROLLBACK;');

        throw err;
    }
    finally {
        gstindb.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }
}
async function calculateSummary(tablename, docid, taxperiod, fp, gstin, gstindb, docIdsList) {
    logger.log("info", "Inside markForDeleteDao | calculateSummary - %s", tablename);
    if (anx1Tables.includes(tablename))
        switch (tablename) {
            case "ANX1_3AA":
                await summary.save3AASummary(gstin, fp, taxperiod, gstindb);
                break;
            case "ANX1_3CDA":
                await summary3cdTxn(fp, taxperiod, gstindb, true);
                break;
            case "ANX1_3HA":
                await save3HASummaryTxn(gstin, fp, taxperiod, gstindb);
                break;
            case "ANX1_3IA":
                await save3IASummaryTxn(gstin, fp, taxperiod, gstindb);
                break;
            case "ANX1_3JA":
                await save3JASummaryTxn(gstin, fp, taxperiod, gstindb);
                break;
            case "ANX1_4A":
                await save4aSummaryTxn(gstin, fp, taxperiod, gstindb)
                break;

        }
    else if (docid == "All" && !anx1Tables.includes(tablename)) {
        switch (tablename) {
            case "ANX1_3KA":
                let ctinArray = await db.fetchAllByIdTxn("SELECT distinct CTIN from ANX1_3KA where TAX_PERIOD = ?", [taxperiod], gstindb);
                await Promise.mapSeries(ctinArray, (ctin) => {
                    save3KASummaryByType(gstindb, fp, taxperiod, ctin.CTIN, "", "CTIN");
                });
                await save3KASummaryByType(gstindb, fp, taxperiod, "", "B", "DOC");
                break;
        }
    }
    else if (docid != "All" && !anx1Tables.includes(tablename)) {
        switch (tablename) {
            case "ANX1_3KA":
                let ctinArray = await db.fetchAllByIdTxn("SELECT distinct CTIN from ANX1_3KA where TAX_PERIOD = ?", [taxperiod], gstindb);
                await Promise.mapSeries(ctinArray, (ctin) => {
                    save3KASummaryByType(gstindb, fp, taxperiod, ctin.CTIN, "", "CTIN");
                });
                await save3KASummaryByType(gstindb, fp, taxperiod, "", "B", "DOC");
                break;
        }
    }
}

async function isEligible(tablename, rtnprd, gstin) {
    logger.log('info', 'Entering isEligible', tablename)
    try {
        tablename = "ANX1_" + tablename;
        let sqlU = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and STATUS IN ("Amended")';
        let sqlD = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and FLAG = "D"'
        let countOfU = await db.fetchAllById(sqlU, [], gstin);
        let countOfD = await db.fetchAllById(sqlD, [], gstin);
        console.log('sqlU ', sqlU, countOfU);
        console.log('sqlD ', sqlD, countOfD);
        if (countOfD[0].count > 0) {
            return ({ statusCd: 'Am' })
        }
        else if (countOfU[0].count > 0) {
            return ({ statusCd: 'M' })
        }
        else {
            return ({ statusCd: 'D' })
        }
    }
    catch (err) {
        console.log(err)
        throw err;
    }
}
module.exports = {
    isEligible: isEligible,
    markAsInvalid: markAsInvalid,
    markForDeletea: markForDeletea
}