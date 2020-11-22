const db = require("../../db/dbUtil");
const logger = require('../../utility/logger').logger;
const { exportExcelQuery, exportErrExcelQuery } = require('../../db/anx1Queries/Anx1ExportQueries');
var userProfileDao = require('../../dao/userProfileDao');
const impConstants = require('../../utility/impConstants');
const { exportExcelAQuery, exportErrExcelAQuery } = require('../../db/anx1Queries/Anx1AExportQueries')
const regex = new RegExp('/', 'g');

async function getStateMap(req, res) {
    var stateMap = new Map();
    let stateCd;

    let statelist = await userProfileDao.getStatMstrList(req, res);
    //console.log("StateList :: ",statelist)
    statelist.forEach(state => {
        stateCd = state.STATE_CD < 10 ? ('0' + state.STATE_CD) : state.STATE_CD;
        stateMap.set(stateCd, stateCd + "-" + state.STATE_NAME);

        if (state.STATE_CD < 10) {
            stateMap.set(state.STATE_CD, stateCd + "-" + state.STATE_NAME);
        }
    });

    //console.log("stateMap :: " + JSON.stringify(stateMap));
    return stateMap;
}

async function exportXlsDao(req, res) {
    logger.log("info", "Entering anx1ExpDao.js ::exportXlsDao");
    let jsobobj = []
    let types = ["B2C", "B2B", "EXP", "SEZ", "DE", "RC", "IMPS", "IMPG", "IMPGSEZ", "ECOM", "MIS", "B2BAO", "B2BA", "SEZA", "DEA"];

    var stateMap = await getStateMap(req, res);
    let flag = req.params.flag;
    if (flag && flag == "F") {
        for (var i = 0; i < types.length; i++) {
            let result = await exportErrorXls(req, types[i].toUpperCase(), stateMap);
            if (result.status == 1) {
                jsobobj.push(result)
            }
        }
    } else {
        for (var i = 0; i < types.length; i++) {
            let result = await exportXls(req, types[i].toUpperCase(), stateMap);
            if (result.status == 1) {
                jsobobj.push(result)
            }
        }
    }

    //console.log("jsobobj check ::",jsobobj)
    return jsobobj;
}

async function exportCsvDao(req, res) {

    logger.log("info", "Entering anx1ExpDao.js ::exportXlsDao");
    let jsobobj = [];
    let flag = req.params.flag;
    var stateMap = await getStateMap(req, res);

    var selectedTable = req.params.selectedTable.toUpperCase();

    if (flag && flag == "F") {
        let result = await exportErrorXls(req, selectedTable, stateMap);
        if (result.status == 1) {
            jsobobj.push(result)
        }
    } else {
        let result = await exportXls(req, selectedTable, stateMap);
        if (result.status == 1) {
            jsobobj.push(result)
        }
    }
    return jsobobj;
}



async function exportXls(req, type, stateMap) {
    logger.log("info", "Entering anx1Dao.js ::exportXls");
    let quer;
    logger.log("info", "type is :: %s", type)

    switch (type) {
        case "B2C":
            quer = exportExcelQuery.B2CData;
            break;
        case "B2B":
            quer = exportExcelQuery.B2BData;
            break;
        case "EXP":
            quer = exportExcelQuery.CData;
            break;
        case "SEZ":
            quer = exportExcelQuery.EFData;
            break;
        case "DE":
            quer = exportExcelQuery.GData;
            break;
        case "RC":
            quer = exportExcelQuery.HData;
            break;
        case "IMPS":
            quer = exportExcelQuery.ImpsData;
            break;
        case "IMPG":
            quer = exportExcelQuery.ImpgData;
            break;
        case "IMPGSEZ":
            quer = exportExcelQuery.KData;
            break;
        case "ECOM":
            quer = exportExcelQuery.EcomData;
            break;
        case "MIS":
            quer = exportExcelQuery.MISData;
            break;
        case "B2BAO":
            quer = exportExcelQuery.B2BAOData;
            break;
        case "B2BA":
            quer = exportExcelQuery.B2BAData;
            break;
        case "SEZA":
            quer = exportExcelQuery.SEZAData;
            break;
        case "DEA":
            quer = exportExcelQuery.DEAData;
            break;
    }

    return await fetchAndPopulateExcelData(req, quer, stateMap, type);
};


async function exportErrorXls(req, type, stateMap) {
    logger.log("info", "Entering anx1Dao.js ::exportXls");
    let quer;
    logger.log("info", "type is :: %s", type)

    switch (type) {
        case "B2C":
            quer = exportErrExcelQuery.B2CData;
            break;
        case "B2B":
            quer = exportErrExcelQuery.B2BData;
            break;
        case "EXP":
            quer = exportErrExcelQuery.CData;
            break;
        case "SEZ":
            quer = exportErrExcelQuery.EFData;
            break;
        case "DE":
            quer = exportErrExcelQuery.GData;
            break;
        case "RC":
            quer = exportErrExcelQuery.HData;
            break;
        case "IMPS":
            quer = exportErrExcelQuery.ImpsData;
            break;
        case "IMPG":
            quer = exportErrExcelQuery.ImpgData;
            break;
        case "IMPGSEZ":
            quer = exportErrExcelQuery.KData;
            break;
        case "ECOM":
            quer = exportErrExcelQuery.EcomData;
            break;
        case "MIS":
            quer = exportErrExcelQuery.MISData;
            break;
        case "B2BAO":
            quer = exportErrExcelQuery.B2BAOData;
            break;
        case "B2BA":
            quer = exportErrExcelQuery.B2BAData;
            break;
        case "SEZA":
            quer = exportErrExcelQuery.SEZAData;
            break;
        case "DEA":
            quer = exportErrExcelQuery.DEAData;
            break;
    }

    return await fetchAndPopulateExcelData(req, quer, stateMap, type);

};

async function fetchAndPopulateExcelData(req, quer, stateMap, type) {
    let dataList = await db.fetchAllById(quer, [req.params.orgrtnprd], req.params.gstin);

    if (dataList.length > 0) {
        dataList.forEach(data => {

            if (stateMap.get(data[impConstants.pos]) === undefined) {
                data[impConstants.pos] = stateMap.get(parseInt(data[impConstants.pos]));
            } else {
                data[impConstants.pos] = stateMap.get(data[impConstants.pos]);
            }

        })
        return ({ type: type, status: 1, dataList });
    }
    else {
        return ({ type: type, status: 0 });
    }
};


async function fetchAndPopulateExcelDataANX1A(req, quer, stateMap, type) {
    let dataList = await db.fetchAllById(quer, [req.params.orgrtnprd], req.params.gstin);

    if (dataList.length > 0) {
        dataList.forEach(data => {

            if (stateMap.get(data[impConstants.pos]) === undefined) {
                data[impConstants.pos] = stateMap.get(parseInt(data[impConstants.pos]));
            } else {
                data[impConstants.pos] = stateMap.get(data[impConstants.pos]);
            }

            // if (data[impConstants.doc_date] != undefined && data[impConstants.doc_date] != null) {
            //     data[impConstants.doc_date] = data[impConstants.doc_date].replace(regex, '-');
            // }

            // if (data[impConstants.ship_date] != undefined && data[impConstants.ship_date] != null) {
            //     data[impConstants.ship_date] = data[impConstants.ship_date].replace(regex, '-');
            // }

            // if (data[impConstants.boe_date] != undefined && data[impConstants.boe_date] != null) {
            //     data[impConstants.boe_date] = data[impConstants.boe_date].replace(regex, '-');
            // }

            // if (data[impConstants.upload_date] != undefined && data[impConstants.upload_date] != null) {
            //     data[impConstants.upload_date] = data[impConstants.upload_date].replace(regex, '-');
            // }
            // if (data[impConstants.odoc_date] != undefined && data[impConstants.odoc_date] != null) {
            //     data[impConstants.odoc_date] = data[impConstants.odoc_date].replace(regex, '-');
            // }

            // if (data[impConstants.rev_doc_date] != undefined && data[impConstants.rev_doc_date] != null) {
            //     data[impConstants.rev_doc_date] = data[impConstants.rev_doc_date].replace(regex, '-');
            // }
            // if (data[impConstants.oboe_date] != undefined && data[impConstants.oboe_date] != null) {
            //     data[impConstants.oboe_date] = data[impConstants.oboe_date].replace(regex, '-');
            // }
            // if (data[impConstants.rev_boe_date] != undefined && data[impConstants.rev_boe_date] != null) {
            //     data[impConstants.rev_boe_date] = data[impConstants.rev_boe_date].replace(regex, '-');
            // }
        })
        return ({ type: type, status: 1, dataList });
    }
    else {
        return ({ type: type, status: 0 });
    }
};

// Ammendment Related Methods
async function exportXlsADao(req, res) {
    logger.log("info", "Entering anx1ExpDao.js ::exportXlsDao");
    let jsobobj = []
    let types = ["B2CA", "EXPA", "REVA", "IMPSA", "ECOMA", "IMPGA", "IMPGSEZA"];

    var stateMap = await getStateMap(req, res);
    let flag = req.params.flag;
    if (flag && flag == "F") {
        for (var i = 0; i < types.length; i++) {
            let result = await exportErrorXlsA(req, types[i].toUpperCase(), stateMap);
            if (result.status == 1) {
                jsobobj.push(result)
            }
        }
    } else {
        for (var i = 0; i < types.length; i++) {
            let result = await exportXlsA(req, types[i].toUpperCase(), stateMap,'xlsx');
            if (result.status == 1) {
                jsobobj.push(result)
            }
        }
    }

    //console.log("jsobobj check ::",jsobobj)
    return jsobobj;
}

async function exportCsvADao(req, res) {

    logger.log("info", "Entering anx1ExpDao.js ::exportCSVADao");
    let jsobobj = []
    var selectedTable = req.params.selectedTable;
//    console.log('selectedTable********************************', selectedTable);
    var stateMap = await getStateMap(req, res);
    // let result = await exportXlsA(req, selectedTable.toUpperCase(), stateMap);
    let result = await exportXlsA(req, selectedTable.toUpperCase(), stateMap,'csv');
    jsobobj.push(result)
    //console.log(jsobobj)
    return jsobobj;
}

async function exportXlsA(req, type, stateMap, fileType) {
    logger.log("info", "Entering anx1ExpDao.js ::exportXlsA");
    let quer;
    logger.log("info", "type is :: %s", type)

    switch (type) {
        case "B2CA":
            quer = exportExcelAQuery.B2CAData;
            break;
        case "EXPA":
            if (fileType == 'csv') {
                quer = exportExcelAQuery.CDAataCSV;
            } else if (fileType == 'xlsx') {
                quer = exportExcelAQuery.CDAata;
            }
            break;
        case "REVA":
            quer = exportExcelAQuery.HAData;
            break;
        case "IMPSA":
            quer = exportExcelAQuery.ImpsAData;
            break;
        case "ECOMA":
            quer = exportExcelAQuery.EcomAData;
            break;
        case "IMPGA":
            if (fileType == 'csv') {
                quer = exportExcelAQuery.ImpgADataCSV;
            } else if (fileType == 'xlsx') {
                quer = exportExcelAQuery.ImpgAData;
            }
            break;
        case "IMPGSEZA":
            if (fileType == 'csv') {
                quer = exportExcelAQuery.KADataCSV;
            } else if (fileType == 'xlsx') {
                quer = exportExcelAQuery.KAData;
            }
            break;
        case "RCA":
            quer = exportExcelAQuery.HAData;
            break;
    }

    return await fetchAndPopulateExcelDataANX1A(req, quer, stateMap, type);
};



async function exportErrorXlsA(req, type, stateMap) {
    logger.log("info", "Entering anx1Dao.js ::exportXls");
    let quer;
    logger.log("info", "type is :: %s", type)

    switch (type) {
        case "B2CA":
            quer = exportErrExcelAQuery.B2CAData;
            break;
        case "EXPA":
            quer = exportErrExcelAQuery.CDAata;
            break;
        case "REVA":
            quer = exportErrExcelAQuery.HAData;
            break;
        case "IMPSA":
            quer = exportErrExcelAQuery.ImpsAData;
            break;
        case "ECOMA":
            quer = exportErrExcelAQuery.EcomAData;
            break;
        case "IMPGA":
            quer = exportErrExcelAQuery.ImpgAData;
            break;
        case "IMPGSEZA":
            quer = exportErrExcelAQuery.KAData;
            break;
    }

    return await fetchAndPopulateExcelDataANX1A(req, quer, stateMap, type);

};

module.exports = {

    exportXlsDao: exportXlsDao,
    exportCsvDao: exportCsvDao,
    getStateMap: getStateMap,
    exportXlsADao: exportXlsADao,
    exportCsvADao: exportCsvADao
}