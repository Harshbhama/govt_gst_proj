const db = require("../../db/dbUtil");
const { anx1Queries } = require("../../db/Queries");
const logger  = require('../../utility/logger').logger;
const Promise = require("bluebird");
const anx1SummaryDao = require("../anx1SummaryDao");
const  anx13cdaDao = require("../anx1ADao/anx13CDADao");
const {anx1aQueries } = require("../../db/queriesanx1a");
const anxkadao = require('../anx1ADao/anx13KADao');

function chunkArray(array, chunkSize){
    logger.log("info","Entering anx1ImpDao.chunkArray");
    var finalArr = [];    
    while (array.length) {
        finalArr.push(array.splice(0, chunkSize));
    }
    logger.log("info","Exiting anx1ImpDao.chunkArray");    
    return finalArr;
}

function removeData_Imp(docRefArr, impQuery, dbObj){
    logger.log("info","Inside anx1ImpDao.removeData_Imp");
    return Promise.map(chunkArray(docRefArr, 999), (docRef) => {
        return db.deleteData(impQuery.removeItemDetails.replace('?', docRef.map(()=> '?' )), docRef, dbObj)
            .then(() => db.deleteData(impQuery.removeDetails.replace('?', docRef.map(()=> '?' )), docRef, dbObj));        
        }
    );        
}

function removeDataO_Imp(docRefArr, impQuery, dbObj){
    logger.log("info","Inside anx1ImpDao.removeData_Imp");
    return Promise.map(chunkArray(docRefArr, 999), (docRef) => {
        return db.deleteData(impQuery.removeODetails.replace('?', docRef.map(()=> '?' )), docRef, dbObj);        
        }
    );        
}

async function save3Hor3AA_Imp(docRefArr, anx13Hor3AParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3Hor3A_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13Hor3AParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3Hor3AASumm_Imp(fp, rtnprd, tableTyp, impQuery, dbObj, flag);
    logger.log("info","Exiting anx1ImpDao.save3Hor3A_Imp");    
}

async function save3cda_Imp(oDocRefArr, docRefArr, anx13cdParamArr, itemListParamArr, exptypeObj, fp, taxperiod, tableTyp, impQuery, dbObj , flag){
    logger.log("info","Entering anx1AImpDao.save3cda_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await removeDataO_Imp(oDocRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13cdParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await anx13cdaDao.summary3cdTxn(fp, taxperiod, dbObj);  // main summary
    await anx13cdaDao.summary3cdTxnError(fp, taxperiod, dbObj);  // error summary
    
    logger.log("info","Exiting anx1ImpDao.save3cd_Imp");
}


async function save3Hor3AASumm_Imp(fp, taxperiod, tableTyp, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3Hor3ASumm_Imp");
    
    //call main summary
    await db.deleteData(impQuery.removeSummary, [fp, taxperiod, tableTyp], dbObj);
    let summObj = await db.getRow(impQuery.calcSumm, [fp, taxperiod], dbObj);
    let row = await db.getRow(impQuery.getCountMarkForDel, [fp, taxperiod], dbObj);
    let mfd = row.count;
    await anx1SummaryDao.save3Aor3HSummary('', fp, taxperiod, mfd, summObj, tableTyp, dbObj);

    // call error summary
    await db.deleteData(impQuery.removeErrSummary, [fp, taxperiod, tableTyp], dbObj);
    summObj = await db.getRow(impQuery.calcErrSumm, [fp, taxperiod], dbObj);
    row = await db.getRow(impQuery.getCountOfYetTobeCorrected, [fp, taxperiod], dbObj);
    mfd = row.count;
    await anx1SummaryDao.save3Aor3HSummary('', fp, taxperiod, mfd, summObj, tableTyp, dbObj, "F");    
    
    logger.log("info","Exiting anx1ImpDao.save3Hor3ASumm_Imp");
}

async function saveamdno(amdno, fp, rtnprd, rtype, gstindb) {
    logger.log("info","Entering anx1ADao.save3aatable : %s  ::  %s", new Date().getTime(), new Date().toString());
    await db.deleteData(anx1aQueries.tableamdno.deleteamdno, [fp, rtnprd, rtype], gstindb);
    await db.saveRow(
        anx1aQueries.tableamdno.saveamdno,
        [ fp, rtnprd, rtype, amdno],
        gstindb);
      logger.log("info","Exiting anx1ADao.save3aatable : %s  ::  %s", new Date().getTime(), new Date().toString());
      return Promise.resolve(true);
  }

  async function getamdno(fp, rtnprd, rtype, gstindb) {
    logger.log("info","Entering getamdno : %s  ::  %s", new Date().getTime(), new Date().toString());
    return await db.getRow(anx1aQueries.tableamdno.getamdno, [fp, rtnprd, rtype], gstindb);
  }

  async function save3KA_Imp(oDocRefArr, docRefArr, anx13KParamArr, itemListParamArr, ctinArr, fp, taxperiod, impQuery, dbObj) {
    logger.log("info","Entering anx1ImpDao.save3K_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await removeDataO_Imp(oDocRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13KParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3KASummary_Imp(fp, taxperiod, ctinArr, dbObj);
    await save3KAErrorSummary_Imp(fp, taxperiod, ctinArr, dbObj);
    logger.log("info","Exiting anx1ImpDao.save3K_Imp");      
}

async function save3KASummary_Imp(fp, taxperiod, ctinArr, dbObj){
    logger.log("info", "Entering anx1ImpDao.save3KASummary_Imp");

    await anxkadao.save3KASummaryByType(dbObj, fp, taxperiod, "", "B", "DOC");

    let uniqueCtinArr = [...new Set(ctinArr)].filter(Boolean);
    await Promise.mapSeries(uniqueCtinArr, (ctin) => {
        return anxkadao.save3KASummaryByType(dbObj, fp, taxperiod, ctin, "", "CTIN");
     }
    );
    logger.log("info", "Exiting anx1ImpDao.save3KASummary_Imp");
}
async function save3KAErrorSummary_Imp(fp, taxperiod, ctinArr, dbObj){
    logger.log("info", "Entering anx1ImpDao.save3KAErrorSummary_Imp");

    await anxkadao.save3KAErrorSummaryByType(dbObj, fp, taxperiod, "", "B", "DOC");

    let uniqueCtinArr = [...new Set(ctinArr)].filter(Boolean);
    await Promise.mapSeries(uniqueCtinArr, (ctin) => {
        return anxkadao.save3KAErrorSummaryByType(dbObj, fp, taxperiod, ctin, "", "CTIN");
     }
    );
    logger.log("info", "Exiting anx1ImpDao.save3KAErrorSummary_Imp");
}

async function save3JA_Imp(oDocRefArr, docRefArr, anx13JParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj,flag) {
    logger.log("info","Entering anx1ImpDao.save3J_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await removeDataO_Imp(oDocRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13JParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3Hor3ASumm_Imp(fp, rtnprd, tableTyp, impQuery, dbObj,flag);
    logger.log("info","Exiting anx1ImpDao.save3J_Imp");    
}

async function save3Hor3ASumm_Imp(fp, taxperiod, tableTyp, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3Hor3ASumm_Imp");
    
    //call main summary
    await db.deleteData(impQuery.removeSummary, [fp, taxperiod, tableTyp], dbObj);
    let summObj = await db.getRow(impQuery.calcSumm, [fp, taxperiod], dbObj);
    let row = await db.getRow(impQuery.getCountMarkForDel, [fp, taxperiod], dbObj);
    let mfd = row.count;
    await anx1SummaryDao.save3Aor3HSummary('', fp, taxperiod, mfd, summObj, tableTyp, dbObj);

    // call error summary
    await db.deleteData(impQuery.removeErrSummary, [fp, taxperiod, tableTyp], dbObj);
    summObj = await db.getRow(impQuery.calcErrSumm, [fp, taxperiod], dbObj);
    row = await db.getRow(impQuery.getCountOfYetTobeCorrected, [fp, taxperiod], dbObj);
    mfd = row.count;
    await anx1SummaryDao.save3Aor3HSummary('', fp, taxperiod, mfd, summObj, tableTyp, dbObj, "F");    
    
    logger.log("info","Exiting anx1ImpDao.save3Hor3ASumm_Imp");
}
 

module.exports = {
    save3Hor3AA_Imp: save3Hor3AA_Imp,
    save3cda_Imp: save3cda_Imp,
    saveamdno: saveamdno,
    getamdno: getamdno,
    save3KA_Imp:save3KA_Imp,
    save3JA_Imp:save3JA_Imp
}