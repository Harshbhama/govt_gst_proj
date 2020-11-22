const db = require("../../db/dbUtil");
const { anx1Queries } = require("../../db/Queries");
const logger  = require('../../utility/logger').logger;
const Promise = require("bluebird");
const  anx13efDao = require("../../dao/anx1Dao/anx13efDao");
const  anx13gDao = require("../../dao/anx1Dao/anx13gDao");
const anx13gaDao = require("../anx1Dao/anx13gaDao")
const anx1SummaryDao = require("../../dao/anx1SummaryDao");
const  anx13cdDao = require("../../dao/anx13cdDao");
const anx1BASummaryDao = require("../../dao/anx1Dao/Anx1b2baDao");
const anx13efaDao = require('../anx1Dao/anx13efaDao');
const anxkadao = require('../anx1ADao/anx13KADao');

function chunkArray(array, chunkSize){
    logger.log("info","Entering anx1ImpDao.chunkArray");
    var finalArr = [];    
    while (array.length) {
        finalArr.push(array.splice(0, chunkSize));
    }
    logger.log("info","Exiting anx1ImpDao.chunkArray");    
    //console.log("finalArr",finalArr)
    return finalArr;
}

function removeData_Imp(DocRefArr, impQuery, dbObj){
    logger.log("info","Inside anx1ImpDao.removeData_Imp");
 // console.log("impQuery",impQuery)
    return Promise.map(chunkArray(DocRefArr, 999), (docRef) => {
      return db.deleteData(impQuery.removeItemDetails.replace('?', docRef.map(()=> '?' )), docRef, dbObj)
            .then(() => db.deleteData(impQuery.removeDetails.replace('?', docRef.map(()=> '?' )), docRef, dbObj));

            }
    );        
}

async function save3Hor3A_Imp(docRefArr, anx13Hor3AParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3Hor3A_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13Hor3AParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3Hor3ASumm_Imp(fp, rtnprd, tableTyp, impQuery, dbObj, flag);
    logger.log("info","Exiting anx1ImpDao.save3Hor3A_Imp");    
}

async function save3cd_Imp(docRefArr, anx13cdParamArr, itemListParamArr, exptypeObj, fp, taxperiod, tableTyp, impQuery, dbObj , flag){
    logger.log("info","Entering anx1ImpDao.save3cd_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13cdParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await anx13cdDao.summary3cdTxn(fp, taxperiod, dbObj);  // main summary
    await anx13cdDao.summary3cdTxnError(fp, taxperiod, dbObj, "F", "");  // error summary
    
    logger.log("info","Exiting anx1ImpDao.save3cd_Imp");
}

async function save3g(docRefArr, deObj, efQuery, dbObj, gstin, flag){
    logger.log("info","Entering anx1ImpDao.save3g");
    await removeData_Imp(docRefArr, efQuery, dbObj);

    let fp;
    let taxperiod;
    if(deObj) {
        if((Array.isArray(deObj) && deObj.length)){

            fp = deObj[0].fp;
            taxperiod = deObj[0].taxperiod;

            await Promise.map(deObj, (obj3g) => {
                let fullItemList = [];
                obj3g.items.forEach((item) => {
                    itemList = {
                        hsn: item.hsn,
                        taxable_value: (item.txval || item.txval == 0) ? item.txval : null,
                        apptaxrate: item.rate,
                        igst: (item.igst || item.igst == 0)? item.igst : null,
                        cess: (item.cess || item.cess == 0) ? item.cess : null,
                        cgst: (item.cgst || item.cgst == 0) ? item.cgst : null,
                        sgst: (item.sgst || item.sgst == 0) ? item.sgst : null,
                        itemref: obj3g.docref
                    };
                    fullItemList.push(itemList);
                });
                return anx13gDao.save3Gdetails(obj3g, fullItemList, gstin, obj3g.fp, obj3g.taxperiod, dbObj, true);                     
            });

            await anx1SummaryDao.save3GSummary(dbObj, fp, taxperiod);
            await anx1SummaryDao.save3GSummaryError(dbObj, fp, taxperiod, flag);
        }        
    }
    logger.log("info","Exiting anx1ImpDao.save3g");
}

async function save3ga(docRefArr, deaObj, efQuery, dbObj, gstin, flag){
    logger.log("info","Entering anx1ImpDao.save3ga");
    await removeData_Imp(docRefArr, efQuery, dbObj);

    let fp;
    let taxperiod;
    if(deaObj) {
        if((Array.isArray(deaObj) && deaObj.length)){

            fp = deaObj[0].fp;
            taxperiod = deaObj[0].taxperiod;

            await Promise.map(deaObj, (obj3ga) => {
                let fullItemList = [];
                obj3ga.items.forEach((item) => {
                    itemList = {
                        hsn: item.hsn,
                        taxable_value: (item.txval || item.txval == 0) ? item.txval : null,
                        apptaxrate: item.rate,
                        igst: (item.igst || item.igst == 0)? item.igst : null,
                        cess: (item.cess || item.cess == 0) ? item.cess : null,
                        cgst: (item.cgst || item.cgst == 0) ? item.cgst : null,
                        sgst: (item.sgst || item.sgst == 0) ? item.sgst : null,
                        itemref: obj3ga.docref
                    };
                    fullItemList.push(itemList);
                });
                return anx13gaDao.save3GAdetails(obj3ga, fullItemList, gstin, obj3ga.fp, obj3ga.taxperiod, dbObj, true);                     
            });

            await anx1SummaryDao.save3GASummary(dbObj, fp, taxperiod);
            await anx1SummaryDao.save3GASummaryError(dbObj, fp, taxperiod, flag);
        }        
    }
    logger.log("info","Exiting anx1ImpDao.save3ga");
}

async function save3ef(docRefArr, sezWp, sezWop, efQuery, dbObj, gstin , flag){
    logger.log("info","Entering anx1ImpDao.save3ef");
    let fp;
    let taxperiod;
    await removeData_Imp(docRefArr, efQuery, dbObj);

    if(sezWp) {
        if((Array.isArray(sezWp) && sezWp.length)){
            await Promise.map(sezWp, (obj3ef) => {
                fp = obj3ef.fp;
                taxperiod = obj3ef.taxperiod;
                let fullItemList = getItemDetailsFor3EF(obj3ef.items, obj3ef.docref);
                return anx13efDao.save3EFdetails(obj3ef, fullItemList, obj3ef.fp, obj3ef.taxperiod, dbObj, true);                     
            });
        }        
    }
    
    if(sezWop) {
        if((Array.isArray(sezWop) && sezWop.length)){
            await Promise.map(sezWop, (obj3ef) => {
                fp = obj3ef.fp;
                taxperiod = obj3ef.taxperiod;
                let fullItemList = getItemDetailsFor3EF(obj3ef.items, obj3ef.docref);
                return anx13efDao.save3EFdetails(obj3ef, fullItemList, obj3ef.fp, obj3ef.taxperiod, dbObj, true);                     
            });
        }        
    }

    await anx1SummaryDao.save3EFSummary(dbObj, fp, taxperiod);
    await anx1SummaryDao.save3EFSummaryError(dbObj, fp, taxperiod,flag);

    logger.log("info","Exiting anx1ImpDao.save3ef");
}
async function save3efa(docRefArr, sezWpa, sezWopa, efQuery, dbObj, gstin , flag){
    logger.log("info","Entering anx1ImpDao.save3efa");
   // console.log("Entering dao.process3EFA");
    let fp;
    let taxperiod;
    await removeData_Imp(docRefArr, efQuery, dbObj);

    if(sezWpa) {
        if((Array.isArray(sezWpa) && sezWpa.length)){
            await Promise.map(sezWpa, (obj3ef) => {
                fp = obj3ef.fp;
                taxperiod = obj3ef.taxperiod;
                let fullItemList = getItemDetailsFor3EF(obj3ef.items, obj3ef.docref);
                return anx13efDao.save3EFAdetails(obj3ef, fullItemList, obj3ef.fp, obj3ef.taxperiod, dbObj, true);                     
            });
        }        
    }
    
    if(sezWopa) {
        if((Array.isArray(sezWopa) && sezWopa.length)){
            await Promise.map(sezWopa, (obj3ef) => {
                fp = obj3ef.fp;
                taxperiod = obj3ef.taxperiod;
                let fullItemList = getItemDetailsFor3EF(obj3ef.items, obj3ef.docref);
                return anx13efDao.save3EFAdetails(obj3ef, fullItemList, obj3ef.fp, obj3ef.taxperiod, dbObj, true);                     
            });
        }        
    }

    await anx13efaDao.save3EFASummary(dbObj, fp, taxperiod);
    await anx13efaDao.save3EFASummary(dbObj, fp, taxperiod,flag);

    logger.log("info","Exiting anx1ImpDao.save3efa");
}

function getItemDetailsFor3EF(itemsArr, docref){
    let itemList = [];
    let fullItemList = [];

    itemsArr.forEach((item) => {
        itemList = {
            hsn: item.hsn,
            taxable_value: (item.txval || item.txval == 0) ? item.txval : null,
            apptaxrate: item.rate,
            igst: (item.igst || item.igst == 0) ? item.igst: null,
            cess: (item.cess || item.cess == 0) ? item.cess : null,
            cgst: null,
            sgst: null,
            itemref: docref
        };
        fullItemList.push(itemList);
    });
    return fullItemList;

}

async function save3BSummary_Imp(fp, taxperiod, ctinArr, doctypArr, dbObj, flag){
    logger.log("info","Entering anx1ImpDao.save3BSummary_Imp");
    
    let uniqueCtinArr = [...new Set(ctinArr)].filter(Boolean);
    let uniqueDoctypArr = [...new Set(doctypArr)].filter(Boolean);
    
    if(flag && flag == "F"){
        await Promise.mapSeries(uniqueCtinArr, (ctin) => {
            return db.deleteData(anx1Queries.errorSummary.delete3BErrsummbyCtin, [fp, taxperiod, ctin], dbObj)            
                    .then(() => anx1SummaryDao.save3BErrorSummaryByType('', fp, taxperiod, dbObj, ctin, "","3B", "CTIN"));
        }
        );
        await Promise.mapSeries(uniqueDoctypArr, (docType) => {
            return db.deleteData(anx1Queries.errorSummary.delete3BErrsummbyDoc, [fp, taxperiod, docType], dbObj)
                    .then(() => anx1SummaryDao.save3BErrorSummaryByType('', fp, taxperiod, dbObj, "", docType,"3B", "DOC"));  
        }
        );
    } else {
        await Promise.mapSeries(uniqueCtinArr, (ctin) => {
            return db.deleteData(anx1Queries.summary.delete3BsummbyCtin, [fp, taxperiod, ctin], dbObj)            
                    .then(() => anx1SummaryDao.save3BSummaryByType('', fp, taxperiod, dbObj, ctin, "","3B", "CTIN"));
        }
        );
        await Promise.mapSeries(uniqueDoctypArr, (docType) => {
            return db.deleteData(anx1Queries.summary.delete3BsummbyDoc, [fp, taxperiod, docType], dbObj)
                    .then(() => anx1SummaryDao.save3BSummaryByType('', fp, taxperiod, dbObj, "", docType,"3B", "DOC"));  
        }
        );
    }
    
    logger.log("info","Exiting anx1ImpDao.save3BSummary_Imp");
}


async function save3BASummary_Imp(fp, taxperiod, b2baCtinArr, b2baDoctypArr, dbObj, flag,tableType){
    logger.log("info","Entering anx1ImpDao.save3BASummary_Imp");

    
    let uniqueCtinArr = [...new Set(b2baCtinArr)].filter(Boolean);
    let uniqueDoctypArr = [...new Set(b2baDoctypArr)].filter(Boolean);
    

    if(flag && flag == "F"){
        await Promise.mapSeries(uniqueCtinArr, (ctin) => {
            return db.deleteData(anx1Queries.errorSummary.delete3BAErrsummbyCtin, [fp, taxperiod, tableType,ctin], dbObj)            
                    .then(() => anx1SummaryDao.save3BErrorSummaryByType('', fp, taxperiod, dbObj, ctin,'', tableType, "CTIN"));
        }                                                               
        );
        await Promise.mapSeries(uniqueDoctypArr, (docType) => {
            return db.deleteData(anx1Queries.errorSummary.delete3BAErrsummbyDoc, [fp, taxperiod,tableType, docType], dbObj)
                    .then(() => anx1SummaryDao.save3BErrorSummaryByType('', fp, taxperiod, dbObj, '',docType,tableType, "DOC"));  
        }
        );
    } else {
        await Promise.mapSeries(uniqueCtinArr, (ctin) => {
            return db.deleteData(anx1Queries.summary.delete3BAsummbyCtin, [fp, taxperiod, tableType,ctin], dbObj)            
                    .then(() => anx1SummaryDao.save3BSummaryByType('', fp, taxperiod, dbObj, ctin,'',tableType, "CTIN"));
        }
        );
        await Promise.mapSeries(uniqueDoctypArr, (docType) => {
            return db.deleteData(anx1Queries.summary.delete3BAsummbyDoc, [fp, taxperiod, tableType,docType], dbObj)
                    .then(() => anx1SummaryDao.save3BSummaryByType('', fp, taxperiod, dbObj, '',docType,tableType, "DOC"));  
        }
        );
    }
    
    logger.log("info","Exiting anx1ImpDao.save3BASummary_Imp");
}
async function save3LSummary_Imp(fp, taxperiod, ctinArr, doctypArr, dbObj, flag){
    logger.log("info","Entering anx1ImpDao.save3LSummary_Imp");
    
    let uniqueCtinArr = [...new Set(ctinArr)].filter(Boolean);
    let uniqueDoctypArr = [...new Set(doctypArr)].filter(Boolean);
    
    if(flag && flag == "F"){
        await Promise.mapSeries(uniqueCtinArr, (ctin) => {
            return db.deleteData(anx1Queries.errorSummary.delete3LErrsummbyCtin, [fp, taxperiod, ctin], dbObj)            
                    .then(() => anx1SummaryDao.save3BErrorSummaryByType('', fp, taxperiod, dbObj, ctin, "","3L", "CTIN"));
        }
        );
        await Promise.mapSeries(uniqueDoctypArr, (docType) => {
            return db.deleteData(anx1Queries.errorSummary.delete3LErrsummbyDoc, [fp, taxperiod, docType], dbObj)
                    .then(() => anx1SummaryDao.save3BErrorSummaryByType('', fp, taxperiod, dbObj, "", docType,"3L", "DOC"));  
        }
        );
    } else {
        await Promise.mapSeries(uniqueCtinArr, (ctin) => {
            return db.deleteData(anx1Queries.summary.delete3LsummbyCtin, [fp, taxperiod, ctin], dbObj)            
                    .then(() => anx1SummaryDao.save3BSummaryByType('', fp, taxperiod, dbObj, ctin, "","3L", "CTIN"));
        }
        );
        await Promise.mapSeries(uniqueDoctypArr, (docType) => {
            return db.deleteData(anx1Queries.summary.delete3LsummbyDoc, [fp, taxperiod, docType], dbObj)
                    .then(() => anx1SummaryDao.save3BSummaryByType('', fp, taxperiod, dbObj, "", docType,"3L", "DOC"));  
        }
        );
    }
    
    logger.log("info","Exiting anx1ImpDao.save3LSummary_Imp");
}

async function save3B_Imp(docRefArr, anx13bParamArr, itemListParamArr, ctinArr, doctypArr, fp, taxperiod, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3B_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13bParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    
    await save3BSummary_Imp(fp, taxperiod, ctinArr, doctypArr, dbObj);
    await save3BSummary_Imp(fp, taxperiod, ctinArr, doctypArr, dbObj, "F");

    logger.log("info","Exiting anx1ImpDao.save3B_Imp");      
}
async function save3L_Imp(docRefArr, anx13LParamArr, itemListParamArr, ctinArr, doctypArr, fp, taxperiod, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3L_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13LParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    
    await save3LSummary_Imp(fp, taxperiod, ctinArr, doctypArr, dbObj);
    await save3LSummary_Imp(fp, taxperiod, ctinArr, doctypArr, dbObj, "F");

    logger.log("info","Exiting anx1ImpDao.save3L_Imp");      
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
 
async function save3J_Imp(docRefArr, anx13JParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj,flag) {
    logger.log("info","Entering anx1ImpDao.save3J_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13JParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3Hor3ASumm_Imp(fp, rtnprd, tableTyp, impQuery, dbObj,flag);
    logger.log("info","Exiting anx1ImpDao.save3J_Imp");    
}

async function save3I_Imp(docRefArr, anx13IParamArr, itemListParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, flag) {
    logger.log("info","Entering anx1ImpDao.save3I_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13IParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3Hor3ASumm_Imp(fp, rtnprd, tableTyp, impQuery, dbObj, flag);
    logger.log("info","Exiting anx1ImpDao.save3I_Imp");
}

async function save4Summ_Imp(fp, taxperiod, tableTyp, impQuery, dbObj) {
    logger.log("info","Entering anx1ImpDao.save4Summ_Imp");

    // Error Summary
    var errSummObj = await db.getRow(impQuery.calcErrSumm, [fp, taxperiod], dbObj);
    if(errSummObj){
        let row = await db.getRow(impQuery.getCountYetToCorrectForDelfor4, [fp, taxperiod], dbObj);
        let mfd = row.count;
        await Promise.mapSeries(["I","CR","DR","N"], (docType) => {
                return db.saveRow(impQuery.saveErrSumm, [tableTyp, errSummObj.noRec, docType, fp, taxperiod, errSummObj.netVal, errSummObj.igst, errSummObj.cgst, errSummObj.sgst, errSummObj.cess, mfd, errSummObj.supVal, errSummObj.suprVal], dbObj);
            }
        );
    }

    // Main Summary
    var summObj = await db.getRow(impQuery.calcSumm, [fp, taxperiod], dbObj);
    if(summObj){
        let row = await db.getRow(impQuery.getCountMarkForDel, [fp, taxperiod], dbObj);
        let mfd = row.count;
        await Promise.mapSeries(["I","CR","DR","N"], (docType) => {
                return db.saveRow(impQuery.saveSumm, [tableTyp, summObj.noRec, docType, fp, taxperiod, summObj.netVal, summObj.igst, summObj.cgst, summObj.sgst, summObj.cess, mfd, summObj.supVal, summObj.suprVal], dbObj);
            }
        );
    }
    logger.log("info","Exiting anx1ImpDao.save4Summ_Imp");
}
               
async function saveTab4_Imp(docRefArr, anx14ParamArr, fp, rtnprd, tableTyp, impQuery, dbObj, flag) {
    logger.log("info", "Entering anx1ImpDao.saveTab4_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.deleteData(impQuery.removeErrorSummary, [fp, rtnprd, tableTyp], dbObj);
    await db.deleteData(impQuery.removeSummary, [fp, rtnprd, tableTyp], dbObj);
    await db.saveRows(impQuery.saveDetails, anx14ParamArr, dbObj);
    await save4Summ_Imp(fp, rtnprd, tableTyp, impQuery, dbObj);
    logger.log("info", "Exiting anx1ImpDao.saveTab4_Imp");    
}

async function save3KSummary_Imp(fp, taxperiod, ctinArr, dbObj){
    logger.log("info", "Entering anx1ImpDao.save3KSummary_Imp");

    await anx1SummaryDao.save3KSummaryByType(dbObj, fp, taxperiod, "", "B", "DOC");

    let uniqueCtinArr = [...new Set(ctinArr)].filter(Boolean);
    await Promise.mapSeries(uniqueCtinArr, (ctin) => {
        return anx1SummaryDao.save3KSummaryByType(dbObj, fp, taxperiod, ctin, "", "CTIN");
     }
    );
    logger.log("info", "Exiting anx1ImpDao.save3KSummary_Imp");
}
async function save3KErrorSummary_Imp(fp, taxperiod, ctinArr, dbObj){
    logger.log("info", "Entering anx1ImpDao.save3KErrorSummary_Imp");

    await anx1SummaryDao.save3KErrorSummaryByType(dbObj, fp, taxperiod, "", "B", "DOC");

    let uniqueCtinArr = [...new Set(ctinArr)].filter(Boolean);
    await Promise.mapSeries(uniqueCtinArr, (ctin) => {
        return anx1SummaryDao.save3KErrorSummaryByType(dbObj, fp, taxperiod, ctin, "", "CTIN");
     }
    );
    logger.log("info", "Exiting anx1ImpDao.save3KErrorSummary_Imp");
}
         
async function save3K_Imp(docRefArr, anx13KParamArr, itemListParamArr, ctinArr, fp, taxperiod, impQuery, dbObj) {
    logger.log("info","Entering anx1ImpDao.save3K_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
    await db.saveRows(impQuery.saveDetails, anx13KParamArr, dbObj);
    await db.saveRows(impQuery.saveItemDetails, itemListParamArr, dbObj);
    await save3KSummary_Imp(fp, taxperiod, ctinArr, dbObj);
    await save3KErrorSummary_Imp(fp, taxperiod, ctinArr, dbObj);
    logger.log("info","Exiting anx1ImpDao.save3K_Imp");      
}


async function save3BA_Imp(b2baDocRefArr,b2baoDocRefArr, anx13baParamArr,anx13baoParamArr, itemListParamArr, b2baCtinArr,b2baoCtinArr, b2baDoctypArr,b2baoDoctypArr, fp, taxperiod, impQuery, dbObj, flag,tableTyp) {
    logger.log("info","Entering anx1ImpDao.save3BA_Imp", tableTyp);

    if(b2baDocRefArr.length > 0){
        await removeData_Imp(b2baDocRefArr, impQuery, dbObj);
        await db.saveRows(impQuery.saveDetails, anx13baParamArr,dbObj);
        await db.saveRows(impQuery.saveItemDetails,itemListParamArr, dbObj);

        await save3BASummary_Imp(fp, taxperiod, b2baCtinArr, b2baDoctypArr, dbObj, flag,tableTyp);
      //  await save3BASummary_Imp(fp, taxperiod, b2baCtinArr,b2baDoctypArr, dbObj, "F",tableTyp);
    }
    if(b2baoDocRefArr.length > 0){
        await removeData_Imp(b2baoDocRefArr, impQuery, dbObj);
        await db.saveRows(impQuery.saveDetails, anx13baoParamArr,dbObj);
        await db.saveRows(impQuery.saveItemDetails,itemListParamArr, dbObj);

        await save3BASummary_Imp(fp, taxperiod, b2baoCtinArr, b2baoDoctypArr, dbObj,flag,tableTyp);
      //  await save3BASummary_Imp(fp, taxperiod, b2baoCtinArr,b2baoDoctypArr, dbObj, "F",tableTyp);
    }
    
    
  

    logger.log("info","Exiting anx1ImpDao.save3BA_Imp");      
}

async function save3KA_Imp(docRefArr, anx13KParamArr, itemListParamArr, ctinArr, fp, taxperiod, impQuery, dbObj) {
    logger.log("info","Entering anx1ImpDao.save3KA_Imp");
    await removeData_Imp(docRefArr, impQuery, dbObj);
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

module.exports = {
    save3Hor3A_Imp: save3Hor3A_Imp,
    save3B_Imp: save3B_Imp,
    save3cd_Imp: save3cd_Imp,
    save3J_Imp: save3J_Imp,
    save3I_Imp: save3I_Imp,
    saveTab4_Imp: saveTab4_Imp,
    save3ef : save3ef,
    save3g : save3g,
    save3K_Imp: save3K_Imp,
    save3L_Imp:save3L_Imp,
    save3BA_Imp: save3BA_Imp,
    save3efa:save3efa,
    save3ga:save3ga,
    save3KA_Imp: save3KA_Imp
}