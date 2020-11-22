const { anx1Queries } = require("../db/Queries");
const { anx1aQueries } = require("../db/queriesanx1a");
const db = require("../db/dbUtil");
const Promise = require("bluebird");
const { STATUS_CD_ZERO, STATUS_CD_ONE } = require('../utility/constants');
const logger  = require('../utility/logger').logger;

/**
 * Calculate and save Summary for 3A Table details
 * This method will be called after save3A, edit3A, delete3A and markfordelete3A
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function save3ASummary(gstin, fp, taxperiod, gstindb, flag , actionFlag) {
    logger.log("info","Entering anx1SummaryDao.save3ASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    
    try {        
        let summObj3AErr, countErr;

        if(flag && flag == "N"){
            if(actionFlag && actionFlag == 'C'){
                summObj3AErr = await db.getRow(anx1Queries.errorSummary.calculate3AErrorSumm, [fp, taxperiod], gstindb);
                countErr = await db.getCount(anx1Queries.errorSummary.getCountErrorfor3A, [fp, taxperiod], gstin, gstindb);
            }
        }else if(flag && flag == "F"){
            summObj3AErr = await db.getRow(anx1Queries.errorSummary.calculate3AErrorSumm, [fp, taxperiod], gstindb);
            countErr = await db.getCount(anx1Queries.errorSummary.getCountErrorfor3A, [fp, taxperiod], gstin, gstindb);
        }
        
        var summObj3A = await db.getRow(anx1Queries.summary.calculate3ASumm, [fp, taxperiod], gstindb);   
        var count = await db.getCount(anx1Queries.summary.getCountMarkForDelfor3A, [fp, taxperiod], gstin, gstindb);
        
        await save3Aor3HSummary(gstin, fp, taxperiod, countErr, summObj3AErr, "3A", gstindb, flag ,actionFlag);  //summary for Error Flow
        await save3Aor3HSummary(gstin, fp, taxperiod, count, summObj3A, "3A", gstindb); // Summary for main flow
        
        logger.log("info","Exiting anx1SummaryDao.save3ASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
        return Promise.resolve({ message: "SUCCESS", statusCd: STATUS_CD_ONE });
    } catch(err){
        logger.log("error","anx1SummaryDao.save3ASummary|failure|err:%s|", err);                      
        return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO });
    }
}

/**
 * Calculate and save Summary for 3AA Table details
 * This method will be called after save3AA, edit3AA, delete3AA and markfordelete3AA
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 */
async function save3AASummary(gstin, fp, taxperiod, gstindb, flag , actionFlag) {
    logger.log("info","Entering anx1SummaryDao.save3AASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    
    try {        
        
        if(flag && flag == "N"){
            if(actionFlag && actionFlag == 'C'){
                var summObj3AErr = await db.getRow(anx1aQueries.errorSummary.calculate3AAErrorSumm, [fp, taxperiod], gstindb);
            }
        }else if(flag && flag == "F"){
            var summObj3AErr = await db.getRow(anx1aQueries.errorSummary.calculate3AAErrorSumm, [fp, taxperiod], gstindb);
        }
        
        var summObj3A = await db.getRow(anx1aQueries.summary.calculate3AASumm, [fp, taxperiod], gstindb); 
        
        if(flag && flag == "N"){
            if(actionFlag && actionFlag == 'C'){
                var countErr = await db.getCount(anx1aQueries.errorSummary.getCountErrorfor3AA, [fp, taxperiod], gstin, gstindb);
            }
        }else if(flag && flag == "F"){
            var countErr = await db.getCount(anx1Queries.errorSummary.getCountErrorfor3AA, [fp, taxperiod], gstin, gstindb);
        }
        
        var count = await db.getCount(anx1aQueries.summary.getCountMarkForDelfor3AA, [fp, taxperiod], gstin, gstindb);
        
        await save3Aor3HSummary(gstin, fp, taxperiod, countErr, summObj3AErr, "3AA", gstindb, flag ,actionFlag);
        await save3Aor3HSummary(gstin, fp, taxperiod, count, summObj3A, "3AA", gstindb);
        
        logger.log("info","Exiting anx1SummaryDao.save3AASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
        return Promise.resolve({ message: "SUCCESS", statusCd: STATUS_CD_ONE });
    } catch(err){
        logger.log("error","anx1SummaryDao.save3AASummary|failure|err:%s|", err);                      
        return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO });
    }
}
  
 /**
  * This method will return the summary details of 3A or 3H Table for the gstin for the specified fp and taxperiod 
  * @param {*} gstin 
  * @param {*} fp 
  * @param {*} taxperiod 
  * @param {*} tableTyp 
  */
function get3Aor3HSummary(gstin, fp, taxperiod, tableTyp, isErrorSum) {
//console.log("Inside get3Aor3HSummary for :" + gstin + "," + fp + "," + taxperiod + "," + tableTyp +","+isErrorSum);

return new Promise(function (resolve, reject) {

    return db.fetchAllById((isErrorSum && isErrorSum == 'F')?anx1Queries.errorSummary.get3Aor3HSumm:anx1Queries.summary.get3Aor3HSumm, [fp, taxperiod, tableTyp], gstin)
    .then((rows, err) => {
        if (err) {
        console.log(err);
        reject({ error: err, statusCd: STATUS_CD_ZERO });
        }
        else {
        if (rows === undefined) {
            resolve("{}");
        } else {
           // console.log("Summary resolved:" + JSON.stringify(rows));
            resolve(rows[0]);
        }
        }
    }).catch((err) => {
       // console.log("err : " + err);
        reject({ error: err, statusCd: STATUS_CD_ZERO })
    });
});
}


/**
 * Calculate and save Summary for 3H Table details
 * This method will be called after save3H, edit3H, delete3H and markfordelete3H
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
function save3HSummary(gstin, fp, taxperiod, flag) {

//console.log("Inside save3HSummary for :" + gstin + "," + fp + "," + taxperiod);

return new Promise(function (resolve, reject) {

    let summObj3H;
    return db.fetchById((flag && flag == "F" ? anx1Queries.errorSummary.calculate3HErrorSumm : anx1Queries.summary.calculate3HSumm), [fp, taxperiod], gstin)
    .then((rows, err) => {
        if (err) {
        console.log(err);
        reject({ error: err, statusCd: STATUS_CD_ZERO });
        }
        else {
        summObj3H = rows;
        return true;
        }
    }).then((isSummaryCalculated) => {
        return db.getCount((flag && flag == "F" ? anx1Queries.errorSummary.getErrorCountfor3H : anx1Queries.summary.getCountMarkForDelfor3H), [fp, taxperiod], gstin);
    })
    .then((count) => {
        return save3Aor3HSummary(gstin, fp, taxperiod, count, summObj3H, "3H", undefined, flag);
    })
    .then((isSummarySaved) => {
        resolve({ message: "SUCCESS", statusCd: STATUS_CD_ONE });
    })
    .catch((err) => {
        console.log("err : " + err);
        reject({ error: err, statusCd: STATUS_CD_ZERO });
    });
});
}


/**
 * Calculate and save Summary for 3B Table details
 * This method will be called after save3B, edit3B, delete3B and markfordelete3B
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} ctin 
 * @param {*} docType 
 * @param {*} gstindb 
 */
async function save3BSummary (gstin, fp, taxperiod, ctin, docType, gstindb, tableType, flag) {

    logger.log("info","Entering anx1SummaryDao.save3BSummary : %s  ::  %s", new Date().getTime(), new Date().toString());

    // console.log("Delete existing summary data for :" + gstin + "," + fp + "," + taxperiod + "," + docType + "," + ctin);
    // console.log("Flag in save3BSummary", flag);
    // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
    await db.deleteData((flag && flag == "F" ? anx1Queries.errorSummary.delete3BErrsumm : anx1Queries.summary.delete3Bsumm), [fp, taxperiod,tableType,docType, ctin], gstindb);
    
    if(flag && flag == "F"){
        await save3BErrorSummaryByType(gstin, fp, taxperiod, gstindb, ctin, docType, tableType, "DOC");
      
        await save3BErrorSummaryByType(gstin, fp, taxperiod, gstindb, ctin, docType, tableType, "CTIN");
    } else {
        await save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin, docType, tableType, "DOC");
      
        await save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin, docType, tableType, "CTIN");
    }
    logger.log("info","Exiting anx1SummaryDao.save3BSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
}
    

/**
 * This method will calculate the summary for tables - 3B and 3L
 * 3B summary has to be calculated CTIN wise and DOC wise
 * This method will handle both summary calculation. we need to pass the type of summary we need to generate
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 * @param {*} ctin 
 * @param {*} docType
 * @param {*} tableType
 * @param {*} type   - DOC or CTIN
 */
async function save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin, docType, tableType, type) {

    logger.log("info","Entering anx1SummaryDao.save3BSummaryByType : %s  ::  %s", new Date().getTime(), new Date().toString());
    
    //console.log("Inside save3BSummaryByType for :" + gstin + "," + fp + "," + taxperiod + ", " + type + ", " +tableType) ;
    
    

    let summSql;
    let mfdSql;
    let summParams = [];

    let summObj, rejectedSummObj;
    let mfdCount, rejMfdCount;
    
    let summBy;  // to store CTIN or DOC_TYPE, which is required to be passed to the query

    if(type === "DOC"){
        if(tableType=='3B'){
        summSql = anx1Queries.summary.calculate3BSummaryDocWise;
        mfdSql = anx1Queries.summary.getCountMarkForDelfor3BDocWise;
        }
        else if(tableType=='3L'){
            summSql = anx1Queries.summary.calculate3LSummaryDocWise;
            mfdSql = anx1Queries.summary.getCountMarkForDelfor3LDocWise;
            }
        else if(tableType =='3BAO'){
            summSql = anx1Queries.summary.calculate3BAOSummaryDocWise;
            mfdSql = anx1Queries.summary.getCountMarkForDelfor3BAODocWise;
        } else if (tableType == '3BA') {
            summSql = anx1Queries.summary.calculate3BASummaryDocWise;
            mfdSql = anx1Queries.summary.getCountMarkForDelfor3BADocWise;
        } 


        summBy = docType;
        summParams = [fp, taxperiod, summBy];
    } else if(type === "CTIN"){
        if(tableType=='3B'){
        summSql = anx1Queries.summary.calculate3BSummaryCtinWise;
        mfdSql = anx1Queries.summary.getCountMarkForDelfor3BCtinWise;
        }
        else if(tableType=='3L'){
            summSql = anx1Queries.summary.calculate3LSummaryCtinWise;
            mfdSql = anx1Queries.summary.getCountMarkForDelfor3LCtinWise;
        }
        else if(tableType=='3BAO'){
            summSql = anx1Queries.summary.calculate3BAOSummaryCtinWise;
            mfdSql = anx1Queries.summary.getCountMarkForDelfor3BAOCtinWise;
        }
        else if(tableType=='3BA'){
            summSql = anx1Queries.summary.calculate3BASummaryCtinWise;
            mfdSql = anx1Queries.summary.getCountMarkForDelfor3BACtinWise;    
        }
        summBy = ctin;
        summParams = [fp, taxperiod, summBy, fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy];
    }
   // console.log("Summary for check :: ", summSql);
    summObj = await db.getRow(summSql, summParams, gstindb);


    let mfdObj = await db.getRow(mfdSql, [fp, taxperiod, summBy], gstindb);
  //  console.log("MFD for " + summBy + " : "  + JSON.stringify(mfdObj));

    mfdCount = mfdObj.count;

    if(summObj != undefined){                  
        if(type === "DOC"){
          //  console.log("Saving DOC Summary : " + JSON.stringify(summObj));
            await db.saveRow(anx1Queries.summary.save3BSummDocWise, [tableType,summObj.noRec, summObj.docTyp, fp, taxperiod, summObj.totVal.toFixed(2), summObj.igst.toFixed(2), summObj.cgst.toFixed(2), summObj.sgst.toFixed(2), summObj.cess.toFixed(2), mfdCount], gstindb);            
        }
        if(type === "CTIN"){
            //console.log("Saving CTIN Summary : " + JSON.stringify(summObj));
            await db.saveRow(anx1Queries.summary.save3BSummCtinWise, [tableType,summObj.noRec, summObj.ctin, summObj.lglName, fp, taxperiod, summObj.totVal.toFixed(2), summObj.igst.toFixed(2), summObj.cgst.toFixed(2), summObj.sgst.toFixed(2), summObj.cess.toFixed(2), mfdCount], gstindb);
            logger.log("info","Exiting anx1SummaryDao.save3BSummaryByType : %s  ::  %s", new Date().getTime(), new Date().toString());
            return Promise.resolve(true);
        }
    } else {
        if(mfdCount > 0){
            if(type === "DOC"){
              //  console.log("Saving DOC Summary - MFD : " + JSON.stringify(summObj));
                await db.saveRow(anx1Queries.summary.save3BSummDocWise, [tableType, 0, docType, fp, taxperiod, 0, 0, 0, 0, 0, mfdCount], gstindb);
            }
            if(type === "CTIN"){
                let lglNm = mfdObj ? mfdObj.lglName : '';
              //  console.log("Saving CTIN Summary - MFD : " + JSON.stringify(summObj));
                await db.saveRow(anx1Queries.summary.save3BSummCtinWise, [tableType, 0, ctin, lglNm, fp, taxperiod, 0, 0, 0, 0, 0, mfdCount], gstindb);
            }
        } 
    }

    //Summary for Rejected Documents has to be calculated only for Table-3B, 3BA
    if(type === "DOC" && (tableType =='3B'|| tableType == '3BA')){
        let rejmfdObj = await db.getRow(anx1Queries.summary.getCountMarkForDelfor3BRejectedDocs, [fp, taxperiod], gstindb);
        rejMfdCount = rejmfdObj.count;
       // console.log("Rejected Mfd",JSON.stringify(rejmfdObj));

        await db.deleteData(anx1Queries.summary.deleteSummforRejectedDocs, [fp, taxperiod, tableType], gstindb);
        rejectedSummObj = await db.getRow((tableType == '3B' ? anx1Queries.summary.calculate3BSummaryForRejectedDocs : anx1Queries.summary.calculate3BASummaryForRejectedDocs),  [fp, taxperiod], gstindb);
     //   console.log("Rejected Summ",JSON.stringify(rejectedSummObj));

        if(rejectedSummObj != undefined){
            await db.saveRow(anx1Queries.summary.save3BSummDocWise, [tableType, rejectedSummObj.noRec, rejectedSummObj.docTyp, fp, taxperiod, rejectedSummObj.totVal.toFixed(2), rejectedSummObj.igst.toFixed(2), rejectedSummObj.cgst.toFixed(2), rejectedSummObj.sgst.toFixed(2), rejectedSummObj.cess.toFixed(2), rejMfdCount], gstindb);
        } else {
            await db.saveRow(anx1Queries.summary.save3BSummDocWise, [tableType, 0, "REJ", fp, taxperiod, 0, 0, 0, 0, 0, rejMfdCount], gstindb);
        }
    
        await calculateNetSummaryFor3B(fp, taxperiod, gstindb,tableType);
     
     }
     else if(type === "DOC" && (tableType =='3L' || tableType == '3BAO')){
        await calculateNetSummaryFor3B(fp, taxperiod, gstindb,tableType);
      
     }
    // console.log("Net summary calculated in Else : ");
     logger.log("info","Exiting anx1SummaryDao.save3BSummaryByType : %s  ::  %s", new Date().getTime(), new Date().toString());
}

/**
 * This method will calculate the Net of credit/ Debit summary for 3B/3L Table
 * this method will calculate net summary for normal as well as error flow
 */
async function calculateNetSummaryFor3B(fp, taxperiod, gstindb, tableType, flag){
    logger.log("info","Entering anx1SummaryDao.calculateNetSummaryFor3B : %s  ::  %s", new Date().getTime(), new Date().toString());
    //console.log("Inside calculateNetSummaryFor3B");
    let records = 0, totalval = 0, igst = 0, cgst = 0, sgst = 0, cess = 0, mfd = 0;

        let rows = await db.getRows((flag && flag == 'F' ? anx1Queries.errorSummary.get3Bor3KErrSummDocWise : anx1Queries.summary.get3Bor3KSummDocWise), [fp, taxperiod, tableType], gstindb);

        if (rows === undefined) {
            logger.log("info","Exiting anx1SummaryDao.calculateNetSummaryFor3B : %s  ::  %s", new Date().getTime(), new Date().toString());
            return Promise.resolve(true); 
        } else {
            docSummary = rows;
            docSummary.map((summ) =>{
              //  console.log("Object : " + JSON.stringify(summ))
               
                if(summ.docTyp != "N" && summ.docTyp != "REJ"){
                    records += parseInt(summ.records);
                    mfd += parseInt(summ.mfd);
                    if(summ.docTyp == "CR"){    
                        totalval -= parseFloat(summ.totalval);
                        igst -= parseFloat(summ.igst);
                        cgst -= parseFloat(summ.cgst);
                        sgst -= parseFloat(summ.sgst);
                        cess -= parseFloat(summ.cess);
                    } else {
                        totalval += parseFloat(summ.totalval);
                        igst += parseFloat(summ.igst);
                        cgst += parseFloat(summ.cgst);
                        sgst += parseFloat(summ.sgst);
                        cess += parseFloat(summ.cess);
                    }
                }
            });
            await db.deleteData((flag && flag == "F" ? anx1Queries.errorSummary.delete3BErrsumm : anx1Queries.summary.delete3Bsumm), [fp, taxperiod,tableType, "N", ""], gstindb);
         //   console.log("Saving DOC Summary - Net: " +  records);
            await db.saveRow((flag && flag == "F" ? anx1Queries.errorSummary.save3BErrorSummDocWise : anx1Queries.summary.save3BSummDocWise), [tableType,records, "N", fp, taxperiod, totalval.toFixed(2), igst.toFixed(2), cgst.toFixed(2), sgst.toFixed(2), cess.toFixed(2), mfd], gstindb);   
            logger.log("info","Exiting anx1SummaryDao.calculateNetSummaryFor3B : %s  ::  %s", new Date().getTime(), new Date().toString());

            return Promise.resolve(true); 
        }
}

//TODO for 3L
/**
 * This method will calculate the Error flow summary for tables - 3B and 3L
 * 3B summary has to be calculated CTIN wise and DOC wise
 * This method will handle both summary calculation. we need to pass the type of summary we need to generate
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 * @param {*} ctin 
 * @param {*} docType
 * @param {*} tableType
 * @param {*} type   - DOC or CTIN
 */
async function save3BErrorSummaryByType(gstin, fp, taxperiod, gstindb, ctin, docType, tableType, type) {

    logger.log("info","Entering anx1SummaryDao.save3BErrorSummaryByType : %s  ::  %s", new Date().getTime(), new Date().toString());
    
   // console.log("Inside save3BErrorSummaryByType for :" + gstin + "," + fp + "," + taxperiod + ", " + type + ", " + tableType);
    
    let summSql;
    let errCountSql;
    let summParams = [];

    let summObj, rejectedSummObj;
    let errCount, rejMfdCount;
    
    let summBy;  // to store CTIN or DOC_TYPE, which is required to be passed to the query

    if(type === "DOC"){
        if(tableType=='3B'){
        summSql = anx1Queries.errorSummary.calculate3BErrorSummaryDocWise;
        errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3BDocWise;
        }
        else if(tableType=='3L'){
          //  console.log("comes to error of 3l")
            summSql = anx1Queries.errorSummary.calculate3LErrorSummaryDocWise; 
            errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3LDocWise;
            }
        else if (tableType == '3BAO') {
            summSql = anx1Queries.errorSummary.calculate3BAOErrorSummaryDocWise;
            errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3BAODocWise;
        }
        else if (tableType == '3BA') {
            summSql = anx1Queries.errorSummary.calculate3BAErrorSummaryDocWise;
            errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3BADocWise;
        }
        summBy = docType;
        summParams = [fp, taxperiod, summBy];
        
      //  console.log(summSql,errCountSql)
    } else if(type === "CTIN"){
        if(tableType=='3B'){
        summSql = anx1Queries.errorSummary.calculate3BErrorSummaryCtinWise;
        errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3BCtinWise;
        }
        else if(tableType=='3L'){
            summSql = anx1Queries.errorSummary.calculate3LErrorSummaryCtinWise;
            errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3LCtinWise;
        }
        else if (tableType == '3BAO') {
            summSql = anx1Queries.errorSummary.calculate3BAOErrorSummaryCtinWise;
            errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3BAOCtinWise;
        }
        else if (tableType == '3BA') {
            summSql = anx1Queries.errorSummary.calculate3BAErrorSummaryCtinWise;
            errCountSql = anx1Queries.errorSummary.getCountofErrorRecords3BACtinWise;
        }
        summBy = ctin;
        summParams = [fp, taxperiod, summBy, fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy,fp, taxperiod, summBy];
    }
 
    summObj = await db.getRow(summSql, summParams, gstindb);
   // console.log("Summary for " + summBy + " : "  + JSON.stringify(summObj));

    let errCountObj = await db.getRow(errCountSql, [fp, taxperiod, summBy], gstindb);
  //  console.log("Error for " + summBy + " : "  + JSON.stringify(errCountObj));

    errCount = errCountObj.count;
    if(summObj != undefined){   
        if(type === "DOC"){
            //console.log("Saving DOC Summary : " + JSON.stringify(summObj));
            await db.saveRow(anx1Queries.errorSummary.save3BErrorSummDocWise, [tableType,summObj.noRec, summObj.docTyp, fp, taxperiod, summObj.totVal.toFixed(2), summObj.igst.toFixed(2), summObj.cgst.toFixed(2), summObj.sgst.toFixed(2), summObj.cess.toFixed(2), errCount], gstindb);            
        }
        if(type === "CTIN"){
          //  console.log("Saving CTIN Summary : " + JSON.stringify(summObj));
            await db.saveRow(anx1Queries.errorSummary.save3BErrorSummCtinWise, [tableType,summObj.noRec, summObj.ctin, summObj.lglName, fp, taxperiod, summObj.totVal.toFixed(2), summObj.igst.toFixed(2), summObj.cgst.toFixed(2), summObj.sgst.toFixed(2), summObj.cess.toFixed(2), errCount], gstindb);
            logger.log("info","Exiting anx1SummaryDao.save3BErrorSummaryByType : %s  ::  %s", new Date().getTime(), new Date().toString());
            return Promise.resolve(true);
        }
    } else {
        if(errCount > 0){
            if(type === "DOC"){
             //   console.log("Saving DOC Summary - Error : " + JSON.stringify(summObj));
                await db.saveRow(anx1Queries.errorSummary.save3BErrorSummDocWise, [tableType, 0, docType, fp, taxperiod, 0, 0, 0, 0, 0, errCount], gstindb);
            }
            if(type === "CTIN"){
                let lglNm = errCountObj ? errCountObj.lglName : '';
              //  console.log("Saving CTIN Summary - Error : " + JSON.stringify(summObj));
                await db.saveRow(anx1Queries.errorSummary.save3BErrorSummCtinWise, [tableType, 0, ctin, lglNm, fp, taxperiod, 0, 0, 0, 0, 0, errCount], gstindb);
            }
        } 
    }

  if(type === "DOC"){
        await calculateNetSummaryFor3B(fp, taxperiod, gstindb, tableType, "F");
  }
    // console.log("Net Error summary calculated in Else : ");
     logger.log("info","Exiting anx1SummaryDao.save3BErrorSummaryByType : %s  ::  %s", new Date().getTime(), new Date().toString());
}

/**
 * This method will delete the existing summary for the specified rtnprd and save the 3A/ 3H Summary in DB
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} mfd 
 * @param {*} summObj 
 * @param {*} tableTyp 
 */
async function save3Aor3HSummary(gstin, fp, taxperiod, mfd, summObj, tableTyp, gstindb, flag , actionFlag){
    //console.log("flag :: "+ flag , "actionflag :: " + actionFlag);
    logger.log("info","Entering anx1SummaryDao.save3Aor3HSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    let records = 0, totalval = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;

    let toClose = false;    
    try {

        if(summObj != undefined){
            records = summObj.noRec;
            totalval = summObj.totVal.toFixed(2);
            igst = summObj.igst ?summObj.igst.toFixed(2) : summObj.igst;
            cgst = summObj.cgst ?summObj.cgst.toFixed(2) : summObj.cgst;
            sgst = summObj.sgst ?summObj.sgst.toFixed(2) : summObj.sgst;
            cess = summObj.cess ?summObj.cess.toFixed(2) : summObj.cess;
        }

        toClose = gstindb ? false : true;
        gstindb = gstindb ? gstindb : db.getConnection(gstin);         
        
        if((flag &&  flag == 'N' && actionFlag && actionFlag == 'C') || (flag &&  flag == 'F')){
                await db.deleteData(anx1Queries.errorSummary.delete3Aor3HErrorsumm, [fp, taxperiod, tableTyp], gstindb);
                await Promise.mapSeries(["I","CR","DR","N"], (docType) => {
                    return db.saveRow(anx1Queries.errorSummary.save3Aor3HErrorsumm, [tableTyp, records, docType, fp, taxperiod, totalval, igst, cgst, sgst, cess, mfd], gstindb);
                }
                );
        } else{
            await db.deleteData(anx1Queries.summary.delete3Aor3Hsumm, [fp, taxperiod, tableTyp], gstindb);
            await Promise.mapSeries(["I","CR","DR","N"], (docType) => {
                return db.saveRow(anx1Queries.importJson.save3Aor3Hsumm, [tableTyp, records, docType, fp, taxperiod, totalval, igst, cgst, sgst, cess, mfd], gstindb);
            }
            );
        }
          
        if(toClose){
            db.commitAndCloseDBConn(gstindb);
        }
    } catch(err){
        if(toClose){
            db.rollBackAndCloseDBConn(gstindb);
        }
        return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO });
    }
    logger.log("info","Exiting anx1SummaryDao.save3Aor3HSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
}

/**
 * This method will return the consolidated summary details for the given gstin for the specified fp and taxperiod
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
function getConsolidatedSummary(gstin, fp, taxperiod) {
    
  //  console.log("Inside getConsolidatedSummary for :" + gstin + "," + fp + "," + taxperiod);

    let invoice, credit, debit, net;

    return new Promise(function (resolve, reject) {

    return db.fetchAllById(anx1Queries.summary.getConsolidatedSummaryByType, [fp, taxperiod, 'I'], gstin)
    .then((rows, err) => {
       // console.log(JSON.stringify(rows));
        if (err) {
        console.log(err);
        reject({ error: err, statusCd: STATUS_CD_ZERO });
        }
        else {
        return rows;
        }
    }).then((invoiceSummary) => {
        if(invoiceSummary === undefined){
        invoice = '[]'; 
        } else {
        invoice = invoiceSummary;
        }
        return db.fetchAllById(anx1Queries.summary.getConsolidatedSummaryByType, [fp, taxperiod, 'CR'], gstin);
    })
    .then((creditSummary) => {
        if(creditSummary === undefined){
        credit = '[]'; 
        } else {
        credit = creditSummary;
        }
        return db.fetchAllById(anx1Queries.summary.getConsolidatedSummaryByType, [fp, taxperiod, 'DR'], gstin)
    }).then((debitSummary) => {
        if(debitSummary === undefined){
        debit = '[]'; 
        } else {
        debit = debitSummary;
        }
        return db.fetchAllById(anx1Queries.summary.getConsolidatedSummaryByType, [fp, taxperiod, 'N'], gstin)
    }).then((netSummary) => {
        if(netSummary === undefined){
            net = '[]'; 
        } else {
            net = netSummary;
        }
        return true;  
    })
    .then((isSummaryFetched) => {

        let summary = {
            invoice : invoice,
            credit : credit,
            debit : debit,
            net : net
        }
        resolve(JSON.stringify(summary));
    })
    .catch((err) => {
     //   console.log("err : " + err); 
        reject({ error: err, statusCd: STATUS_CD_ZERO });
    });
    });

}

function get3CDSummary(gstin, fp, taxperiod, tableTyp,isErrorSum) {
  //  console.log("Inside get3CDSummary for :" + gstin + "," + fp + "," + taxperiod + "," + tableTyp+"," + isErrorSum);
    
    return new Promise(function (resolve, reject) {
    
        return db.fetchAllById((isErrorSum && isErrorSum ==='F')?anx1Queries.errorSummary.get3CDSumm:anx1Queries.summary.get3CDSumm, [fp, taxperiod, tableTyp], gstin)
        .then((rows, err) => {
            if (err) {
            console.log(err);
            reject({ error: err, statusCd: STATUS_CD_ZERO });
            }
            else {
            if (rows === undefined) {
                resolve("{}");
            } else {
             //   console.log("summary " + rows)
                resolve(rows);
            }
            }
        })
    });
    }

    function save3CDSummary(gstin, fp, taxperiod , exptype, doctyp){

        console.log("Inside save3CDSummary for :" + gstin + "," + fp + "," + taxperiod + "," + exptype);
      
        return new Promise(function (resolve, reject) {
      
          let summObj3CD;
          return db.fetchById(anx1Queries.summary.calculate3CDSumm, [fp, taxperiod , exptype, doctyp], gstin)
            .then((rows, err) => {
              if (err) {
                console.log(err);
                reject({ error: err, statusCd: STATUS_CD_ZERO });
              }
              else {
                summObj3CD = rows;
                return true;
              }
            }).then((isSummaryCalculated) => {
                return db.getCount(anx1Queries.summary.getCountMarkForDelfor3CD ,
                  [fp , taxperiod , exptype , doctyp] , gstin)
            })
            .then((count) => {
             // console.log(summObj3CD)
              return  save3CDSummaryIntoTable(gstin, fp, taxperiod, summObj3CD, count,  "3CD" , exptype , doctyp)
            })
            .then((isSummarySaved) => {
              resolve({ message: "SUCCESS", statusCd: 1 });
            })
            .catch((err) => {
            //  console.log("err : " + err); 
              reject({ error: err, statusCd: 0 });
            });
        });
      }
      
      function save3CDSummaryIntoTable(gstin, fp, taxperiod, summObj, count, tableTyp , exptype , doctyp){
     //   console.log("Inside save3CDSummaryIntoTable for :" + gstin + "," + fp + "," + taxperiod);
      
        return new Promise(function (resolve, reject) {
      
        //   console.log("Delete existing summary data for :" + gstin + "," + fp + "," + taxperiod + ", " +
        //    exptype);
          // Delete the existing summary data for the given fp and taxperiod
          let pwt = 'N';
          if(exptype == "EXPWP") {   pwt = 'Y'; }
         
            return db.update(anx1Queries.summary.delete3CDsumm, [fp, taxperiod, tableTyp , pwt , doctyp], gstin)
            .then((data) => {
              //  console.log("Records deleted : " + JSON.stringify(data));
             return data;
            })
            .then((isSummaryDeleted) => {
                //console.log("isSummaryDeleted deleted : " + JSON.stringify(isSummaryDeleted));
              //insert the 3H Summary details
         //     console.log("Saving summary data for Table - :" + tableTyp + " - for -"+  gstin + "," + fp + "," + taxperiod + ", PAYEMENT TYPE:" + exptype);
         
              if(summObj != undefined){
                return db.save(anx1Queries.summary.save3CDsumm, [tableTyp, summObj.noRec, doctyp, fp, taxperiod, summObj.totVal.toFixed(2), summObj.igst.toFixed(2), summObj.cess.toFixed(2), pwt , count], gstin);
              } else {
                  return isSummaryDeleted;
              }
              
            })
            .then((isSummarySaved) => {
                console.log(isSummarySaved)
            //  resolve(isSummarySaved);
            })
            .then((isSummarySaved) => {
                db.update(anx1Queries.summary.delete3CDsumm, [fp, taxperiod,"3CD", pwt ,"N"] , gstin);
                calculateNetSummaryFor3CD(fp, taxperiod, pwt , gstin);
                resolve(isSummarySaved);
            })
            .catch((err) => {
             // console.log("err : " + err);
              reject({ error: err, statusCd: 0 });
            });
        });
      }

/**
  * This method will return the summary details of 3B Table for the gstin for the specified fp and taxperiod 
  * @param {*} gstin 
  * @param {*} fp 
  * @param {*} taxperiod 
  */
 function get3Bor3KSummary(gstin, fp, taxperiod, tableTyp , isErrorSum) {
   // console.log("Inside Dao- get3Bor3KSummary for :" + gstin + "," + fp + "," + taxperiod + "," + tableTyp+ "," +isErrorSum);
    
    let docSummary;
    let ctinSummary;
    
    let summObj;

    return new Promise(function (resolve, reject) {
    
        return db.fetchAllById((isErrorSum && isErrorSum=='F')?anx1Queries.errorSummary.get3Bor3KSummDocWise:anx1Queries.summary.get3Bor3KSummDocWise, [fp, taxperiod, tableTyp], gstin)
        .then((rows, err) => {

          //  console.log(JSON.stringify(rows));
            if (err) {
            console.log(err);
            reject({ error: err, statusCd: STATUS_CD_ZERO });
            }
            else {
            if (rows === undefined) {
                docSummary = "{}";
            } else {
                docSummary = rows;
            }
            }
            return true;
        }).then(response => {
            //console.log("Responseeee : " + response);
            return db.fetchAllById((isErrorSum && isErrorSum=='F')?anx1Queries.errorSummary.get3Bor3KSummCtinWise:anx1Queries.summary.get3Bor3KSummCtinWise, [fp, taxperiod, tableTyp], gstin)
            .then((rows,err) => {
         //   console.log(JSON.stringify(rows));
            if (rows === undefined) {
                ctinSummary = "{}";
            } else {
                ctinSummary = rows;
            }
            return true;
           })
        }).then(response => {
            if(response === true){
                summObj ={
                    doctype : docSummary,
                    ctin : ctinSummary
                };
                resolve(summObj);
            } else {
                resolve("{}");
            }
            
        }).catch((err) => {
           // console.log("err : " + err);
            reject({ error: err, statusCd: STATUS_CD_ZERO })
        });
    });
    }

    async function calculateNetSummaryFor3CD(fp, taxperiod, pwt , gstin) {
        try{
     //   console.log("Inside calculateNetSummaryFor3CD");
        let records = 0, totalval = 0, igst = 0, cess = 0, mfd = 0;
        let deleteSumm = await db.update(anx1Queries.summary.deleteconsolidatedCD,[fp,taxperiod] , gstin);
        let getAllByType = await db.fetchAllById(anx1Queries.summary.get3CDSummPWT, [fp, taxperiod , "3CD" , pwt], gstin )
          //  console.log("calculateNetSummaryFor3CD : " + JSON.stringify(getAllByType));
                if (getAllByType === undefined) {
                    docSummary = "{}";
                } else {
                    docSummary = getAllByType;
                    docSummary.map((summ) =>{
                      //  console.log("Object : " + JSON.stringify(summ))
                        records += parseInt(summ.records);
                        mfd += parseInt(summ.mfd);
                        if(summ.doctyp == "CR"){    
                            totalval -= parseFloat(summ.totalval);
                            igst -= parseFloat(summ.igst);
                            cess -= parseFloat(summ.cess);
                        } else {
                            totalval += parseFloat(summ.totalval);
                            igst += parseFloat(summ.igst);
                            cess += parseFloat(summ.cess);
                        }
                    
                    });    
                }				
                   // console.log("Saving DOC Summary - Net: " +  records);
                  let saving = await db.save(anx1Queries.summary.save3CDsumm, ["3CD" ,records, "N", fp, taxperiod, totalval.toFixed(2), igst.toFixed(2), cess.toFixed(2),pwt , mfd] , gstin);    
                    let calculateConsolidated3CD = await db.fetchAllById(anx1Queries.summary.calculateConsolidated3CD , [fp ,taxperiod] , gstin)
                    if (calculateConsolidated3CD === undefined) {
                        docSummary = "{}";
                    } else {
                        docSummary = calculateConsolidated3CD;               
                        let sql = anx1Queries.summary.save3Aor3Hsumm + getValuesToSaveDocDetailsBatch(docSummary , fp ,taxperiod);
                        let savingData = await db.save(sql, [], gstin);  
                        return true;
                        }
                    }
      
                catch(err){
                    return err.message;
                }
    }
               
    
function getValuesToSaveDocDetailsBatch(result , fp ,taxperiod){
     
    logger.log("info","Inside getValuesToSaveItemDetailsBatch");
     let sql = " ";
     for(let i=0; i< result.length ; i++){
   
       if(i > 0){
           sql = sql + ",";
       }
   
       sql = sql + "('" + "3CD" + "'," + result[i].records + ", '"+result[i].doctyp+"', NULL, NULL, '" + fp + "','" + taxperiod + "'," +result[i].totalval.toFixed(2) + "," + result[i].igst.toFixed(2) + "," + "NULL" + "," +  "NULL" + "," + result[i].cess.toFixed(2) + ",NULL, NULL," + result[i].mfd + ", NULL, NULL, 'DOC')" 
   
       if(i == result.length-1){
         //  console.log("Querryyy :: " + sql)
           return sql;
       }
     } 
   }
/**
 * To calculate the 3EF Summary
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3EFSummary (gstindb, fp, taxperiod) {
    logger.log("info","Entering anx1SummaryDao.save3EFSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    //console.log("Inside save3EFSummary for :" + fp +  "," + taxperiod);
  
    try{
    var mfdMap = new Map();
    var docMfdMap = new Map();
    let mfdMapKeys = [], docMfdMapKeys = [];
    let mfd = 0;

    let rejCount = 0; // Rejected records to be handled

    let wpRecords = 0, wpTotalval = 0, wpIgst = 0, wpCess = 0, wpMfd = 0;
    let wopRecords = 0, wopTotalval = 0, wopMfd = 0;
    
    let iRecords = 0, iTotalval = 0, iIgst = 0, iCess = 0, iMfd = 0;
    let crRecords = 0, crTotalval = 0, crIgst = 0, crCess = 0, crMfd = 0;
    let drRecords = 0, drTotalval = 0, drIgst = 0, drCess = 0, drMfd = 0;
    let nRecords = 0, nTotalval = 0, nIgst = 0, nCess = 0, nMfd = 0;

    var summSql = "";

    //console.log("Delete existing summary data for :" + fp + "," + taxperiod);

    // Delete the existing summary data for 3EF Table for the given fp and taxperiod
    await db.deleteData(anx1Queries.summary.delete3Aor3Hsumm, [fp, taxperiod, "3EF"], gstindb);
    
    //To get the count of records of Marked For Delete  - PayType Summary
    let rows = await db.getRows(anx1Queries.summary.getCountMarkForDelete3EF, [fp, taxperiod],gstindb);
    if(rows != undefined && rows.length >0) {
        await Promise.mapSeries(rows, (mfdObj) => {
            mfdMap.set(mfdObj.type, mfdObj.count);  // Adding MFD values in a Map with key as "PayTyp-DocType"
            mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
       // console.log("Mfd Map : " + mfdMap);
    }
    
    //To get the count of records of Marked For Delete  - DocWise Summary
    let docMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3EFConsolidatedsummary, [fp, taxperiod], gstindb);
    
    if(docMfdRows != undefined && docMfdRows.length >0) {
        await Promise.mapSeries(docMfdRows, (mfdObj) => {
            docMfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            docMfdMapKeys = Array.from(docMfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
       // console.log("docMfdMap :" + docMfdMap);
    }

    let efSummObj = await db.getRows(anx1Queries.summary.calculate3EFSumm, [fp, taxperiod], gstindb);
    if(efSummObj != undefined && efSummObj.length > 0){
    
    await Promise.mapSeries(efSummObj, (efObj) =>{
        mfd = 0;
        if(mfdMap.get(efObj.payTyp + "-" + efObj.docTyp) != undefined){
            mfd = mfdMap.get(efObj.payTyp + "-" + efObj.docTyp);
        }

        if( mfdMapKeys.indexOf(efObj.payTyp + "-" + efObj.docTyp) >= 0){
            mfdMapKeys.splice(mfdMapKeys.indexOf(efObj.payTyp + "-" + efObj.docTyp), 1); // Remove the payTyp - docType combo for which mfd is added in summary
        }

        if( docMfdMapKeys.indexOf(efObj.docTyp) >= 0){
            docMfdMapKeys.splice(docMfdMapKeys.indexOf(efObj.docTyp), 1); // Remove the docType for which mfd is added in summary
        }

        if(efObj.docTyp == "CR"){    // For Consolidated Summary
            crRecords += efObj.noRec;
            crTotalval += efObj.totVal;
            crIgst += efObj.igst;
            crCess += efObj.cess;
            
            if(docMfdMap.get(efObj.docTyp) != undefined){
                crMfd = docMfdMap.get(efObj.docTyp);
            }
        }

        if(efObj.docTyp == "DR"){   // For Consolidated Summary
            drRecords += efObj.noRec;
            drTotalval += efObj.totVal;
            drIgst += efObj.igst;
            drCess += efObj.cess;

            if(docMfdMap.get(efObj.docTyp) != undefined){
                drMfd = docMfdMap.get(efObj.docTyp);
            }
        }

        if(efObj.docTyp == "I"){   // For Consolidated Summary
            iRecords += efObj.noRec;
            iTotalval += efObj.totVal;
            iIgst += efObj.igst;
            iCess += efObj.cess;

            if(docMfdMap.get(efObj.docTyp) != undefined){
                irMfd = docMfdMap.get(efObj.docTyp);
            }
        }

        if(efObj.payTyp == "Y"){
            wpRecords += efObj.noRec;
            wpMfd += mfd;

            if(efObj.docTyp == "CR"){    
                wpCess -= parseFloat(efObj.cess);
                wpIgst -= parseFloat(efObj.igst);
                wpTotalval -= parseFloat(efObj.totVal);
            } else {
                wpCess += parseFloat(efObj.cess);
                wpIgst += parseFloat(efObj.igst);
                wpTotalval += parseFloat(efObj.totVal);
            }
            summSql = summSql + "('3EF'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal.toFixed(2) + "," +  efObj.igst.toFixed(2) + ",NULL, NULL," + efObj.cess.toFixed(2) + ",'" + efObj.payTyp + "'," + rejCount + "," + mfd + ",NULL, NULL, 'PAY_TYP'),";    
        } else 
        if(efObj.payTyp == "N"){
            wopRecords += efObj.noRec;
            wopMfd += mfd;

            if(efObj.docTyp == "CR"){    
                wopTotalval -= parseFloat(efObj.totVal);
            } else {
                wopTotalval += parseFloat(efObj.totVal);
            }

            summSql = summSql + "('3EF'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal + ",NULL ,NULL, NULL, NULL,'" + efObj.payTyp + "'," + rejCount + "," + mfd + ",NULL, NULL, 'PAY_TYP'),";
        }
        
    });
    } 
        // To add mark for delete for paytyp-docTypes for which no records available for summary other than MFD
        if(mfdMapKeys != undefined && mfdMapKeys.length > 0) {
            await Promise.mapSeries(mfdMapKeys, (docTyp) => {
                let mfdVal = docTyp.split("-");
                if(mfdVal[0] === 'Y'){
                    wpMfd += mfdMap.get(docTyp);
                } 
                else if(mfdVal[0] === 'N'){
                    wopMfd += mfdMap.get(docTyp);
                }
                summSql = summSql + "('3EF', 0,'" + mfdVal[1] + "', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'" + mfdVal[0] + "'," + rejCount + "," + mfdMap.get(docTyp) + ",NULL, NULL, 'PAY_TYP'),";
            });
        }  

    
    
    //To save the Net Summary for sezwp and sezwop
    summSql = summSql + "('3EF'," + wpRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + wpTotalval.toFixed(2) + "," + wpIgst.toFixed(2) + ",NULL, NULL," + wpCess.toFixed(2) + ",'Y'," + rejCount + "," + wpMfd + ",NULL, NULL, 'PAY_TYP'),";
    summSql = summSql + "('3EF'," + wopRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + wopTotalval.toFixed(2) + ",NULL, NULL, NULL, NULL, 'N'," + rejCount + "," + wopMfd + ",NULL, NULL, 'PAY_TYP'),";
    //Doc Wise Summary
    summSql = summSql + "('3EF'," + iRecords + ", 'I', NULL, NULL,'" + fp + "','" + taxperiod + "'," + iTotalval.toFixed(2) + "," + iIgst.toFixed(2) + ", NULL, NULL, " + iCess.toFixed(2) + ", NULL," + rejCount + "," + iMfd + ",NULL, NULL, 'DOC'),";
    summSql = summSql + "('3EF'," + crRecords + ", 'CR', NULL, NULL,'" + fp + "','" + taxperiod + "'," + crTotalval.toFixed(2) + "," + crIgst.toFixed(2) + ", NULL, NULL, " + crCess.toFixed(2) + ", NULL," + rejCount + "," + crMfd + ",NULL, NULL, 'DOC'),";
    summSql = summSql + "('3EF'," + drRecords + ", 'DR', NULL, NULL,'" + fp + "','" + taxperiod + "'," + drTotalval.toFixed(2) + "," + drIgst.toFixed(2) + ", NULL, NULL, " + drCess.toFixed(2) + ", NULL," + rejCount + "," + drMfd + ",NULL, NULL, 'DOC'),";

    nRecords = iRecords + crRecords + drRecords;
    nTotalval = iTotalval + drTotalval - crTotalval;
    nIgst = iIgst + drIgst - crIgst;
    nCess = iCess + drCess - crCess;

    summSql = summSql + "('3EF'," + nRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + nTotalval.toFixed(2) + "," + nIgst.toFixed(2) + ", NULL, NULL, " + nCess.toFixed(2) + ", NULL," + rejCount + "," + nMfd + ",NULL, NULL, 'DOC')";
    
    //console.log("Net summary Calculated");
    
   // console.log("fp, taxperiod"+fp +":" + taxperiod+":");
    //To get the count of records of Marked For Delete for Rejected Documents - PayType Summary
    let rejMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3EFRejectedDocs, [fp, taxperiod],gstindb);
    let rejSummObj = await db.getRows(anx1Queries.summary.calculate3EFSummForRejectedDocs, [fp, taxperiod], gstindb);
    
    let rejSQL = calculateRejectedDocsSummaryFor3EF(fp, taxperiod, rejMfdRows, rejSummObj);

    if(rejSQL != ""){
        summSql = summSql + "," + rejSQL;
    } else {
        summSql = summSql + ";"
    }
    
   // console.log("SQL : " + summSql);

    await db.saveRow(anx1Queries.summary.save3EFSumm + summSql, [], gstindb);

    logger.log("info","Exiting anx1SummaryDao.save3EFSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
  }catch(err) {
    return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO });
  }
    
}

/**
 * To calculate the 3EF Error Summary
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3EFSummaryError (gstindb, fp, taxperiod , flag ,actionFlag) {
    logger.log("info","Entering anx1SummaryDao.save3EFSummaryError : %s  ::  %s", new Date().getTime(), new Date().toString());
   // console.log("Inside save3EFSummaryError for :" + fp +  "," + taxperiod);
  
    try{
    var mfdMap = new Map();
    var docMfdMap = new Map();
    let mfdMapKeys = [], docMfdMapKeys = [];
    let mfd = 0;

    let rejCount = 0; // Rejected records to be handled

    let wpRecords = 0, wpTotalval = 0, wpIgst = 0, wpCess = 0, wpMfd = 0;
    let wopRecords = 0, wopTotalval = 0, wopMfd = 0;
    
    let iRecords = 0, iTotalval = 0, iIgst = 0, iCess = 0, iMfd = 0;
    let crRecords = 0, crTotalval = 0, crIgst = 0, crCess = 0, crMfd = 0;
    let drRecords = 0, drTotalval = 0, drIgst = 0, drCess = 0, drMfd = 0;
    let nRecords = 0, nTotalval = 0, nIgst = 0, nCess = 0, nMfd = 0;

    var summSql = "";
    var rows = [];
   // console.log("Delete existing summary data for :" + fp + "," + taxperiod);
    if(flag && flag =="N"){ // To update summary when corrected record is deleted in main flow
        if(actionFlag && actionFlag =="C"){
            // Delete the existing summary data for 3EF Table for the given fp and taxperiod
            await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3EF"], gstindb);
            //To get the count of records of Yet to be Corrected  - PayType Summary
            var rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrect3EF, [fp, taxperiod],gstindb);
        }
    }
    else if(flag && (flag == "F")){
        // Delete the existing summary data for 3EF Table for the given fp and taxperiod
            await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3EF"], gstindb);
            //To get the count of records of Yet to be Corrected  - PayType Summary
            var rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrect3EF, [fp, taxperiod],gstindb);
    }
    
    
    
    if(rows != undefined && rows.length >0) {
        await Promise.mapSeries(rows, (mfdObj) => {
            mfdMap.set(mfdObj.type, mfdObj.count);  // Adding MFD values in a Map with key as "PayTyp-DocType"
            mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
       // console.log("Mfd Map : " + mfdMap);
    }
    
    //To get the count of records of Marked For Delete  - DocWise Summary
    //let docMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3EFConsolidatedsummary, [fp, taxperiod], gstindb);
    
    // if(docMfdRows != undefined && docMfdRows.length >0) {
    //     await Promise.mapSeries(docMfdRows, (mfdObj) => {
    //         docMfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
    //         docMfdMapKeys = Array.from(docMfdMap.keys());  // Adding docTypes available in MfdMap in an array
    //     });   
    //     console.log("docMfdMap :" + docMfdMap);
    // }
    var efSummObj ={};
    if(flag && flag =="N"){ 
        if(actionFlag && actionFlag =="C"){
            var efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3EFSumm, [fp, taxperiod], gstindb);
        }
    }
    else if(flag && (flag == "F")){
        var efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3EFSumm, [fp, taxperiod], gstindb);
    }
    
    if(efSummObj != undefined && efSummObj.length > 0){
    
    await Promise.mapSeries(efSummObj, (efObj) =>{
        mfd = 0;
        if(mfdMap.get(efObj.payTyp + "-" + efObj.docTyp) != undefined){
            mfd = mfdMap.get(efObj.payTyp + "-" + efObj.docTyp);
        }

        if( mfdMapKeys.indexOf(efObj.payTyp + "-" + efObj.docTyp) >= 0){
            mfdMapKeys.splice(mfdMapKeys.indexOf(efObj.payTyp + "-" + efObj.docTyp), 1); // Remove the payTyp - docType combo for which mfd is added in summary
        }

        // if( docMfdMapKeys.indexOf(efObj.docTyp) >= 0){
        //     docMfdMapKeys.splice(docMfdMapKeys.indexOf(efObj.docTyp), 1); // Remove the docType for which mfd is added in summary
        // }

        // if(efObj.docTyp == "CR"){    // For Consolidated Summary
        //     crRecords += efObj.noRec;
        //     crTotalval += efObj.totVal;
        //     crIgst += efObj.igst;
        //     crCess += efObj.cess;
            
        //     if(docMfdMap.get(efObj.docTyp) != undefined){
        //         crMfd = docMfdMap.get(efObj.docTyp);
        //     }
        // }

        // if(efObj.docTyp == "DR"){   // For Consolidated Summary
        //     drRecords += efObj.noRec;
        //     drTotalval += efObj.totVal;
        //     drIgst += efObj.igst;
        //     drCess += efObj.cess;

        //     if(docMfdMap.get(efObj.docTyp) != undefined){
        //         drMfd = docMfdMap.get(efObj.docTyp);
        //     }
        // }

        // if(efObj.docTyp == "I"){   // For Consolidated Summary
        //     iRecords += efObj.noRec;
        //     iTotalval += efObj.totVal;
        //     iIgst += efObj.igst;
        //     iCess += efObj.cess;

        //     if(docMfdMap.get(efObj.docTyp) != undefined){
        //         irMfd = docMfdMap.get(efObj.docTyp);
        //     }
        // }

        if(efObj.payTyp == "Y"){
            wpRecords += efObj.noRec;
            wpMfd += mfd;

            if(efObj.docTyp == "CR"){    
                wpCess -= parseFloat(efObj.cess);
                wpIgst -= parseFloat(efObj.igst);
                wpTotalval -= parseFloat(efObj.totVal);
            } else {
                wpCess += parseFloat(efObj.cess);
                wpIgst += parseFloat(efObj.igst);
                wpTotalval += parseFloat(efObj.totVal);
            }
            summSql = summSql + "('3EF'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal.toFixed(2) + "," +  efObj.igst.toFixed(2) + ",NULL, NULL," + efObj.cess.toFixed(2) + ",'" + efObj.payTyp + "'," + rejCount + "," + mfd + ",NULL, NULL, 'PAY_TYP'),";    
        } else 
        if(efObj.payTyp == "N"){
            wopRecords += efObj.noRec;
            wopMfd += mfd;

            if(efObj.docTyp == "CR"){    
                wopTotalval -= parseFloat(efObj.totVal);
            } else {
                wopTotalval += parseFloat(efObj.totVal);
            }

            summSql = summSql + "('3EF'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal + ",NULL ,NULL, NULL, NULL,'" + efObj.payTyp + "'," + rejCount + "," + mfd + ",NULL, NULL, 'PAY_TYP'),";
        }
        
    });
    } 
        // To add mark for delete for paytyp-docTypes for which no records available for summary other than MFD
        if(mfdMapKeys != undefined && mfdMapKeys.length > 0) {
            await Promise.mapSeries(mfdMapKeys, (docTyp) => {
                let mfdVal = docTyp.split("-");
                if(mfdVal[0] === 'Y'){
                    wpMfd += mfdMap.get(docTyp);
                } 
                else if(mfdVal[0] === 'N'){
                    wopMfd += mfdMap.get(docTyp);
                }
                summSql = summSql + "('3EF', 0,'" + mfdVal[1] + "', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'" + mfdVal[0] + "'," + rejCount + "," + mfdMap.get(docTyp) + ",NULL, NULL, 'PAY_TYP'),";
            });
        }  

    
    
    //To save the Net Summary for sezwp and sezwop
    summSql = summSql + "('3EF'," + wpRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + wpTotalval.toFixed(2) + "," + wpIgst.toFixed(2) + ",NULL, NULL," + wpCess.toFixed(2) + ",'Y'," + rejCount + "," + wpMfd + ",NULL, NULL, 'PAY_TYP'),";
    summSql = summSql + "('3EF'," + wopRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + wopTotalval.toFixed(2) + ",NULL, NULL, NULL, NULL, 'N'," + rejCount + "," + wopMfd + ",NULL, NULL, 'PAY_TYP'),";
    //Doc Wise Summary
    summSql = summSql + "('3EF'," + iRecords + ", 'I', NULL, NULL,'" + fp + "','" + taxperiod + "'," + iTotalval.toFixed(2) + "," + iIgst.toFixed(2) + ", NULL, NULL, " + iCess.toFixed(2) + ", NULL," + rejCount + "," + iMfd + ",NULL, NULL, 'DOC'),";
    summSql = summSql + "('3EF'," + crRecords + ", 'CR', NULL, NULL,'" + fp + "','" + taxperiod + "'," + crTotalval.toFixed(2) + "," + crIgst.toFixed(2) + ", NULL, NULL, " + crCess.toFixed(2) + ", NULL," + rejCount + "," + crMfd + ",NULL, NULL, 'DOC'),";
    summSql = summSql + "('3EF'," + drRecords + ", 'DR', NULL, NULL,'" + fp + "','" + taxperiod + "'," + drTotalval.toFixed(2) + "," + drIgst.toFixed(2) + ", NULL, NULL, " + drCess.toFixed(2) + ", NULL," + rejCount + "," + drMfd + ",NULL, NULL, 'DOC'),";

    nRecords = iRecords + crRecords + drRecords;
    nTotalval = iTotalval + drTotalval - crTotalval;
    nIgst = iIgst + drIgst - crIgst;
    nCess = iCess + drCess - crCess;

    summSql = summSql + "('3EF'," + nRecords + ", 'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + nTotalval.toFixed(2) + "," + nIgst.toFixed(2) + ", NULL, NULL, " + nCess.toFixed(2) + ", NULL," + rejCount + "," + nMfd + ",NULL, NULL, 'DOC')";
    
    //console.log("Net summary Calculated");
    
  //  console.log("fp, taxperiod"+fp +":" + taxperiod+":");
    //To get the count of records of Marked For Delete for Rejected Documents - PayType Summary
    // let rejMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3EFRejectedDocs, [fp, taxperiod],gstindb);
    // let rejSummObj = await db.getRows(anx1Queries.summary.calculate3EFSummForRejectedDocs, [fp, taxperiod], gstindb);
    
    // let rejSQL = calculateRejectedDocsSummaryFor3EF(fp, taxperiod, rejMfdRows, rejSummObj);

    // if(rejSQL != ""){
    //     summSql = summSql + ";" + rejSQL;
    // } else {
    //     summSql = summSql + ";"
    // }
    
   // console.log("SQL : " + summSql);

    await db.saveRow(anx1Queries.errorSummary.save3EFSumm + summSql, [], gstindb);

    logger.log("info","Exiting anx1SummaryDao.save3EFSummaryError : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
  }catch(err) {
    return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO });
  }
    
}

/**
 * THis function will calculate the summary for Rejected Documents and form the SQL
 */
function calculateRejectedDocsSummaryFor3EF(fp, taxperiod, rejMfdRows, efSummObj){
  //  console.log("Inside calculateRejectedDocsSummaryFor3EF");
    var rejMfdMap = new Map(); 
    let rejMfdMapKeys = [], rejMfd = 0;
    let rejWpRecords = 0, rejWpTotalval = 0, rejWpIgst = 0, rejWpCess = 0, rejWpMfd = 0;
    let rejWopRecords = 0, rejWopTotalval = 0, rejWopMfd = 0;
    let rejCount = 0;

    let sql = "";

        //To get the count of records of Marked For Delete for Rejected Documents - PayType Summary
        if(rejMfdRows != undefined && rejMfdRows.length >0) {
            
            rejMfdRows.map((mfdObj) =>{
                rejMfdMap.set(mfdObj.type, mfdObj.count);  // Adding MFD values in a Map with key as "PayTyp-DocType"
                rejMfdMapKeys = Array.from(rejMfdMap.keys());  // Adding docTypes available in MfdMap in an array
            });
        }
    
        if(efSummObj != undefined && efSummObj.length > 0){
            efSummObj.map((efObj) =>{
                rejMfd = 0;
                if(rejMfdMap.get(efObj.payTyp + "-" + efObj.docTyp) != undefined){
                    rejMfd = rejMfdMap.get(efObj.payTyp + "-" + efObj.docTyp);
                }
    
                if(efObj.payTyp == "Y"){
                    rejWpRecords += efObj.noRec;
                    rejWpMfd += rejMfd;
        
                    if(efObj.docTyp == "CR"){    
                        rejWpCess -= parseFloat(efObj.cess);
                        rejWpIgst -= parseFloat(efObj.igst);
                        rejWpTotalval -= parseFloat(efObj.totVal);
                    } else {
                        rejWpCess += parseFloat(efObj.cess);
                        rejWpIgst += parseFloat(efObj.igst);
                        rejWpTotalval += parseFloat(efObj.totVal);
                    }
                } else 
                if(efObj.payTyp == "N"){
                    rejWopRecords += efObj.noRec;
                    rejWopMfd += rejMfd;
        
                    if(efObj.docTyp == "CR"){    
                        rejWopTotalval -= parseFloat(efObj.totVal);
                    } else {
                        rejWopTotalval += parseFloat(efObj.totVal);
                    }
                }
            });

            sql = "('3EF'," + rejWpRecords + ",'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "'," + rejWpTotalval + "," +  rejWpIgst + ",NULL, NULL," + rejWpCess + ", 'Y'," + rejCount + "," + rejWpMfd + ",NULL, NULL, 'PAY_TYP'),";    
            sql = sql + "('3EF'," + rejWopRecords + ",'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "'," + rejWopTotalval + ",NULL ,NULL, NULL, NULL, 'N'," + rejCount + "," + rejWopMfd + ",NULL, NULL, 'PAY_TYP');";
        } else {
            // To add mark for delete for Rejected Docs -  paytyp-docTypes for which no records available for summary other than MFD
            if(rejMfdMapKeys != undefined && rejMfdMapKeys.length > 0) {
                rejMfdMapKeys.map((docTyp) =>{
                    let mfdVal = docTyp.split("-");
                     if(mfdVal[0] === 'Y'){
                         rejWpMfd += rejMfdMap.get(docTyp);
                     } 
                     else if(mfdVal[0] === 'N'){
                         rejWopMfd += rejMfdMap.get(docTyp);
                     }
                });
                sql = sql + "('3EF', 0, 'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'Y', 0," + rejWpMfd + ",NULL, NULL, 'PAY_TYP'),";
                sql = sql + "('3EF', 0, 'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, NULL, NULL, 0,'N', 0," + rejWopMfd + ",NULL, NULL, 'PAY_TYP');";
            }  
        }
        return sql;
}
/**
  * This method will return the summary details of 3EF Table for the gstin for the specified fp and taxperiod 
  * Summary will have two different objects - 1. With sez payment (sezwp) and 2. without sez payment (sezwop)
  * @param {*} gstin 
  * @param {*} fp 
  * @param {*} taxperiod 
  */
function get3EFSummary(gstin, fp, taxperiod ,isErrorSum,tableTyp) {
//console.log("Inside get3EFSummary for :" + gstin + "," + fp + "," + taxperiod);

return new Promise(function (resolve, reject) {

    let sezwp = {}, sezwop = {};
    
    let gstindb = db.getConnection(gstin);

    return db.fetchAllByIdInTransaction((isErrorSum && isErrorSum=='F')?anx1Queries.errorSummary.get3EFSummByPayTyp:anx1Queries.summary.get3EFSummByPayTyp, [fp, taxperiod,tableTyp, 'Y'], gstindb)
    .then((rows, err) => {
        if (err) {
            console.log(err);
            reject({ error: err, statusCd: STATUS_CD_ZERO });
        }
        else {
            if (rows === undefined) {
                return "{}";
            } else {
                return rows;
            }
        }
    }).then(result => {
        sezwp = result;
        return db.fetchAllByIdInTransaction((isErrorSum && isErrorSum=='F')?anx1Queries.errorSummary.get3EFSummByPayTyp:anx1Queries.summary.get3EFSummByPayTyp, [fp, taxperiod,tableTyp, 'N'], gstindb);
    }).then(response => {
        if (response === undefined) {
            sezwop = "{}";
        } else {
            sezwop = response;
        }

        let efSumm = {
            sezwp :sezwp,
            sezwop : sezwop
        }

        gstindb.close();
        resolve(efSumm);
    })
    .catch((err) => {
      //  console.log("err : " + err);
        reject({ error: err, statusCd: STATUS_CD_ZERO })
    });
});
}


/**
 * To calculate the 3G Summary
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3GSummary (gstindb, fp, taxperiod) {
    logger.log("info","Entering anx1SummaryDao.save3GSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    //console.log("Inside save3GSummary for :" + fp +  "," + taxperiod);
  try{
    var mfdMap = new Map(); 
    let mfdMapKeys = [], rejMfdMapKeys = [];
    var rejMfdMap = new Map(); 
    
    var summSql = "";

  //  console.log("Delete existing summary data for 3G:" + fp + "," + taxperiod);
    await db.deleteData(anx1Queries.summary.delete3Aor3Hsumm, [fp, taxperiod, "3G"], gstindb);

    var rows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3G, [fp, taxperiod], gstindb); //To get the count of records of Marked For Delete
    if(rows != undefined && rows.length >0) {
        await Promise.mapSeries(rows, (mfdObj) => {
            mfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
    }
        let rejMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3GRejectedDocs, [fp, taxperiod], gstindb); //To get the count of records of Marked For Delete - Rejected Docs
        if(rejMfdRows != undefined && rejMfdRows.length >0) {
        await Promise.mapSeries(rejMfdRows, (mfdObj) => {
            rejMfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            rejMfdMapKeys = Array.from(rejMfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
    }
    var efSummObj = await db.getRows(anx1Queries.summary.calculate3GSummary, [fp, taxperiod], gstindb);
    summSql = summSql + create3GSummarySQL(efSummObj, mfdMapKeys, mfdMap, fp, taxperiod, false);      

    
        let rejSummObj = await db.getRows(anx1Queries.summary.calculate3GSummaryForRejectedDocs, [fp, taxperiod], gstindb);
        summSql = summSql + create3GSummarySQL(rejSummObj, rejMfdMapKeys, rejMfdMap, fp, taxperiod, true);      
    
        summSql = summSql.trim().substring(0, summSql.length-1) + ";";
    
  
    //console.log("SQL : " + summSql);
    await db.saveRow((anx1Queries.summary.save3EFSumm + summSql), [], gstindb);
    

    logger.log("info","Exiting anx1SummaryDao.save3GSummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
}catch(err) {
    return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO});
}
    
}
/**
 * To calculate the 3GA Summary
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3GASummary (gstindb, fp, taxperiod) {
    logger.log("info","Entering anx1SummaryDao.save3GASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
   // console.log("Inside save3GASummary for :" + fp +  "," + taxperiod);
  try{
    var mfdMap = new Map(); 
    let mfdMapKeys = [], rejMfdMapKeys = [];
    var rejMfdMap = new Map(); 
    
    var summSql = "";

   // console.log("Delete existing summary data for 3GA:" + fp + "," + taxperiod);
    await db.deleteData(anx1Queries.summary.delete3Aor3Hsumm, [fp, taxperiod, "3GA"], gstindb);

    var rows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3GA, [fp, taxperiod], gstindb); //To get the count of records of Marked For Delete
    if(rows != undefined && rows.length >0) {
        await Promise.mapSeries(rows, (mfdObj) => {
            mfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
    }
        let rejMfdRows = await db.getRows(anx1Queries.summary.getCountMarkForDelfor3GARejectedDocs, [fp, taxperiod], gstindb); //To get the count of records of Marked For Delete - Rejected Docs
        if(rejMfdRows != undefined && rejMfdRows.length >0) {
        await Promise.mapSeries(rejMfdRows, (mfdObj) => {
            rejMfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            rejMfdMapKeys = Array.from(rejMfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
    }
    var efSummObj = await db.getRows(anx1Queries.summary.calculate3GASummary, [fp, taxperiod], gstindb);
    summSql = summSql + create3GASummarySQL(efSummObj, mfdMapKeys, mfdMap, fp, taxperiod, false);      

    
        let rejSummObj = await db.getRows(anx1Queries.summary.calculate3GASummaryForRejectedDocs, [fp, taxperiod], gstindb);
        summSql = summSql + create3GASummarySQL(rejSummObj, rejMfdMapKeys, rejMfdMap, fp, taxperiod, true);      
    
        summSql = summSql.trim().substring(0, summSql.length-1) + ";";
    
  
   // console.log("SQL : " + summSql);
    await db.saveRow((anx1Queries.summary.save3EFSumm + summSql), [], gstindb);
    

    logger.log("info","Exiting anx1SummaryDao.save3GASummary : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
}catch(err) {
    return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO});
}
    
}
/**
 * To calculate the 3G SummaryError
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3GSummaryError (gstindb, fp, taxperiod , flag ,actionFlag) {
    logger.log("info","Entering anx1SummaryDao.save3GSummaryError : %s  ::  %s", new Date().getTime(), new Date().toString());
   // console.log("Inside save3GSummaryError for :" + fp +  "," + taxperiod);
  try{
    var mfdMap = new Map(); 
    let mfdMapKeys = [], rejMfdMapKeys = [];
    var rejMfdMap = new Map(); 
    
    var summSql = "";

   // console.log("Delete existing summary data for 3G:" + fp + "," + taxperiod);
    if(flag && flag =="N"){ // To update summary when corrected record is deleted in main flow
        if(actionFlag && actionFlag =="C"){
            await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3G"], gstindb);
        }
    }
    else if(flag && flag == "F"){
        await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3G"], gstindb);
    }
    if(flag && flag == "N"){
        if(actionFlag && actionFlag == "C"){
            var rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrectfor3G, [fp, taxperiod], gstindb);//To get the count of records yet to be corrected.
        }
    }else if(flag && flag == "F"){
        var rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrectfor3G, [fp, taxperiod], gstindb);
    }
    if(rows != undefined && rows.length >0) {
        await Promise.mapSeries(rows, (mfdObj) => {
            mfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
    }
    
    if(flag && flag == "N"){
        if(actionFlag && actionFlag == "C"){
            var efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3GSummary, [fp, taxperiod], gstindb);
        }
    }else if(flag && flag == "F"){
        var efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3GSummary, [fp, taxperiod], gstindb);
    }
    summSql = summSql + create3GSummarySQL(efSummObj, mfdMapKeys, mfdMap, fp, taxperiod, false);      

    summSql = summSql.trim().substring(0, summSql.length-1) + ";";
   
    if(flag && flag=="N"){
        if(actionFlag && actionFlag =="C"){
            await db.saveRow((anx1Queries.errorSummary.save3EFSumm + summSql), [], gstindb);
        }
    }else if(flag && flag == "F"){
        await db.saveRow((anx1Queries.errorSummary.save3EFSumm + summSql), [], gstindb);
    }
    

    logger.log("info","Exiting anx1SummaryDao.save3GSummaryError : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
}catch(err) {
    return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO});
}
    
}

/**
 * To calculate the 3GA SummaryError
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 */
async function save3GASummaryError (gstindb, fp, taxperiod , flag ,actionFlag) {
    logger.log("info","Entering anx1SummaryDao.save3GASummaryError : %s  ::  %s", new Date().getTime(), new Date().toString());
    //console.log("Inside save3GASummaryError for :" + fp +  "," + taxperiod);
  try{
    var mfdMap = new Map(); 
    let mfdMapKeys = [], rejMfdMapKeys = [];
    var rejMfdMap = new Map(); 
    
    var summSql = "";

    //console.log("Delete existing summary data for 3GA:" + fp + "," + taxperiod);
    if(flag && flag =="N"){ // To update summary when corrected record is deleted in main flow
        if(actionFlag && actionFlag =="C"){
            await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3GA"], gstindb);
        }
    }
    else if(flag && flag == "F"){
        await db.deleteData(anx1Queries.errorSummary.delete3Aor3Hsumm, [fp, taxperiod, "3GA"], gstindb);
    }
    if(flag && flag == "N"){
        if(actionFlag && actionFlag == "C"){
            var rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrectfor3GA, [fp, taxperiod], gstindb);//To get the count of records yet to be corrected.
        }
    }else if(flag && flag == "F"){
        var rows = await db.getRows(anx1Queries.errorSummary.getCountYetToCorrectfor3GA, [fp, taxperiod], gstindb);
    }
    if(rows != undefined && rows.length >0) {
        await Promise.mapSeries(rows, (mfdObj) => {
            mfdMap.set(mfdObj.docTyp, mfdObj.count);  // Adding MFD values in a Map with key as "DocType"
            mfdMapKeys = Array.from(mfdMap.keys());  // Adding docTypes available in MfdMap in an array
        });   
    }
    
    if(flag && flag == "N"){
        if(actionFlag && actionFlag == "C"){
            var efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3GASummary, [fp, taxperiod], gstindb);
        }
    }else if(flag && flag == "F"){
        var efSummObj = await db.getRows(anx1Queries.errorSummary.calculate3GASummary, [fp, taxperiod], gstindb);
    }
    summSql = summSql + create3GASummarySQL(efSummObj, mfdMapKeys, mfdMap, fp, taxperiod, false);      

    summSql = summSql.trim().substring(0, summSql.length-1) + ";";

    //console.log("save error summary",summSql);
   
    if(flag && flag=="N"){
        if(actionFlag && actionFlag =="C"){
            await db.saveRow((anx1Queries.errorSummary.save3EFSumm + summSql), [], gstindb);
        }
    }else if(flag && flag == "F"){
        await db.saveRow((anx1Queries.errorSummary.save3EFSumm + summSql), [], gstindb);
    }
    

    logger.log("info","Exiting anx1SummaryDao.save3GASummaryError : %s  ::  %s", new Date().getTime(), new Date().toString());
    return Promise.resolve(true);
}catch(err) {
    return Promise.reject({ error: err, statusCd: STATUS_CD_ZERO});
}
    
}

function create3GSummarySQL(efSummObj, mfdMapKeys, mfdMap, fp, taxperiod, isRejected){
 //   console.log("Inside create3GSummarySQL");
    let rejCount = 0; 
    let summSql = '';
    let mfd = 0, netRecords = 0, netTotalval = 0, netIgst = 0, netCgst = 0, netSgst = 0, netCess = 0, netMfd = 0;

    if(efSummObj != undefined && efSummObj.length > 0){  
        efSummObj.map((efObj) =>{
            mfd = 0;
            if( mfdMapKeys.indexOf(efObj.docTyp) >= 0){
                mfdMapKeys.splice( mfdMapKeys.indexOf(efObj.docTyp), 1); // Remove the docType for which mfd is added in summary
            }
            
            if(mfdMap.get(efObj.docTyp) != undefined && mfdMap.get(efObj.docTyp) != null && mfdMap.get(efObj.docTyp) != ""){
                mfd = mfdMap.get(efObj.docTyp);
            }
            netRecords += efObj.noRec;
            netMfd += mfd;

            if(efObj.docTyp == "CR"){    
                netCess -= parseFloat(efObj.cess);
                netIgst -= parseFloat(efObj.igst);
                netSgst -= parseFloat(efObj.sgst);
                netCgst -= parseFloat(efObj.cgst);
                netTotalval -= parseFloat(efObj.totVal);
            } else {
                netCess += parseFloat(efObj.cess);
                netIgst += parseFloat(efObj.igst);
                netSgst += parseFloat(efObj.sgst);
                netCgst += parseFloat(efObj.cgst);
                netTotalval += parseFloat(efObj.totVal);
            }              
            if(isRejected == false){
                summSql = summSql + "('3G'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal.toFixed(2) + "," + efObj.igst.toFixed(2) + "," + efObj.cgst.toFixed(2) + "," + efObj.sgst.toFixed(2) + "," + + efObj.cess.toFixed(2) + ",NULL," + rejCount + "," + mfd + ",NULL, NULL, 'DOC'),";
            }
        });     
    } 
     // To add mark for delete for docTypes for which no records available for summary other than MFD
     if(mfdMapKeys != undefined && mfdMapKeys.length > 0) {
        mfdMapKeys.forEach(docTyp =>{
            netMfd += mfdMap.get(docTyp);
            if(isRejected == false){
                summSql = summSql + "('3G', 0,'" + docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, 0, 0, 0, NULL," + rejCount + "," + mfdMap.get(docTyp) + ",NULL, NULL, 'DOC'),";                        
            }
        });
    }  

    //To save the Net Summary
    if(isRejected == false){
        summSql = summSql + "('3G'," + netRecords + ",'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + netTotalval.toFixed(2) + "," + netIgst.toFixed(2) + "," + netCgst.toFixed(2) + "," + netSgst.toFixed(2) + "," + netCess.toFixed(2) + ",NULL," + rejCount + "," + netMfd + ",NULL, NULL, 'DOC'),";                        
      //  console.log("Net summary Calculated");
    } else {
        summSql = summSql + "('3G'," + netRecords + ",'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "'," + netTotalval.toFixed(2) + "," + netIgst.toFixed(2) + "," + netCgst.toFixed(2) + "," + netSgst.toFixed(2) + "," + netCess.toFixed(2) + ",NULL," + rejCount + "," + netMfd + ",NULL, NULL, 'DOC');";                        
     //   console.log("Rejected Docs summary Calculated");
    }
    return summSql;
}
function create3GASummarySQL(efSummObj, mfdMapKeys, mfdMap, fp, taxperiod, isRejected){
  //  console.log("Inside create3GASummarySQL");
    let rejCount = 0; 
    let summSql = '';
    let mfd = 0, netRecords = 0, netTotalval = 0, netIgst = 0, netCgst = 0, netSgst = 0, netCess = 0, netMfd = 0;
//console.log("Inside Test",efSummObj,mfdMapKeys,mfdMap);
    if(efSummObj != undefined && efSummObj.length > 0){  
        efSummObj.map((efObj) =>{
            mfd = 0;
            if( mfdMapKeys.indexOf(efObj.docTyp) >= 0){
                mfdMapKeys.splice( mfdMapKeys.indexOf(efObj.docTyp), 1); // Remove the docType for which mfd is added in summary
            }
            
            if(mfdMap.get(efObj.docTyp) != undefined && mfdMap.get(efObj.docTyp) != null && mfdMap.get(efObj.docTyp) != ""){
                mfd = mfdMap.get(efObj.docTyp);
            }
            netRecords += efObj.noRec;
            netMfd += mfd;

            if(efObj.docTyp == "CR"){    
                netCess -= parseFloat(efObj.cess);
                netIgst -= parseFloat(efObj.igst);
                netSgst -= parseFloat(efObj.sgst);
                netCgst -= parseFloat(efObj.cgst);
                netTotalval -= parseFloat(efObj.totVal);
            } else {
                netCess += parseFloat(efObj.cess);
                netIgst += parseFloat(efObj.igst);
                netSgst += parseFloat(efObj.sgst);
                netCgst += parseFloat(efObj.cgst);
                netTotalval += parseFloat(efObj.totVal);
            }              
            if(isRejected == false){
                summSql = summSql + "('3GA'," + efObj.noRec + ",'" + efObj.docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "'," + efObj.totVal.toFixed(2) + "," + efObj.igst.toFixed(2) + "," + efObj.cgst.toFixed(2) + "," + efObj.sgst.toFixed(2) + "," + + efObj.cess.toFixed(2) + ",NULL," + rejCount + "," + mfd + ",NULL, NULL, 'DOC'),";
            }
        });     
    } 
     // To add mark for delete for docTypes for which no records available for summary other than MFD
     if(mfdMapKeys != undefined && mfdMapKeys.length > 0) {
        mfdMapKeys.forEach(docTyp =>{
            netMfd += mfdMap.get(docTyp);
            if(isRejected == false){
                summSql = summSql + "('3GA', 0,'" + docTyp + "', NULL, NULL,'" + fp + "','" + taxperiod + "', 0, 0, 0, 0, 0, NULL," + rejCount + "," + mfdMap.get(docTyp) + ",NULL, NULL, 'DOC'),";                        
            }
        });
    }  

    //To save the Net Summary
    if(isRejected == false){
        summSql = summSql + "('3GA'," + netRecords + ",'N', NULL, NULL,'" + fp + "','" + taxperiod + "'," + netTotalval.toFixed(2) + "," + netIgst.toFixed(2) + "," + netCgst.toFixed(2) + "," + netSgst.toFixed(2) + "," + netCess.toFixed(2) + ",NULL," + rejCount + "," + netMfd + ",NULL, NULL, 'DOC'),";                        
       // console.log("Net summary Calculated");
    } else {
        summSql = summSql + "('3GA'," + netRecords + ",'REJ', NULL, NULL,'" + fp + "','" + taxperiod + "'," + netTotalval.toFixed(2) + "," + netIgst.toFixed(2) + "," + netCgst.toFixed(2) + "," + netSgst.toFixed(2) + "," + netCess.toFixed(2) + ",NULL," + rejCount + "," + netMfd + ",NULL, NULL, 'DOC');";                        
       // console.log("Rejected Docs summary Calculated");
    }
    return summSql;
}

/**
  * This method will return the summary details of 3G Table for the gstin for the specified fp and taxperiod 
  * @param {*} gstin 
  * @param {*} fp 
  * @param {*} taxperiod 
  */
function get3GSummary(gstin, fp, taxperiod,isErrorSum,tableTyp) {
   // console.log("Inside get3GSummary for :" + gstin + "," + fp + "," + taxperiod);

    return new Promise(function (resolve, reject) {

    return db.fetchAllById((isErrorSum && isErrorSum == 'F')?anx1Queries.errorSummary.get3GSumm:anx1Queries.summary.get3GSumm, [fp, taxperiod,tableTyp], gstin)
    .then((rows, err) => {
        if (err) {
            console.log(err);
            reject({ error: err, statusCd: STATUS_CD_ZERO });
        }
        else {
            if (rows === undefined) {
                return "{}";
            } else {
                resolve (rows);
            }
        }
    }).catch((err) => {
     //   console.log("err : " + err);
        reject({ error: err, statusCd: STATUS_CD_ZERO })
    });
});
}

/**
 * To calculate and save 3K Summary 
 * This method has to be called on save, edit, delete of 3K
 * @param {*} gstindb 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} docType 
 * @param {*} ctin 
 */
async function save3KSummary(gstindb, fp, taxperiod, docType, ctin,flag,actionFlag) {
   // console.log("Inside save3KSummary",flag);
    await save3KSummaryByType(gstindb, fp, taxperiod, ctin, "", "CTIN");
    await save3KSummaryByType(gstindb, fp, taxperiod, "", docType, "DOC");
    if(flag && flag=="F"){
        await save3KErrorSummaryByType(gstindb, fp, taxperiod, ctin, "", "CTIN");
        await save3KErrorSummaryByType(gstindb, fp, taxperiod, "", docType, "DOC");
    }
    if(flag && flag=="N"){
        if(actionFlag && actionFlag=="C"){
            await save3KErrorSummaryByType(gstindb, fp, taxperiod, ctin, "", "CTIN");
            await save3KErrorSummaryByType(gstindb, fp, taxperiod, "", docType, "DOC");
        }
    }
    return Promise.resolve(true);
}

/**
 * To calculate 3K summary
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 * @param {*} ctin 
 * @param {*} docType 
 * @param {*} type 
 */
async function save3KSummaryByType(gstindb, fp, taxperiod, ctin, docType, type) {

  //  console.log("Inside save3KSummaryByType for :" +  fp + "," + taxperiod + ", " + type);

    let summSql;
    let mfdSql;
    let deleteSummSql;
    let deleteParams = [];

    let summObj;
    let mfdCount;
    
    let summBy;  // to store CTIN or DOC_TYPE, which is required to be passed to the query
    let valuesToInsert = '';
    let noOfRecords = 0, totalVal =0, igst =0, cess =0, lglNm = '';

    if(type === "DOC"){
        deleteSummSql = anx1Queries.summary.delete3KsummbyDoc;
        deleteParams.push(fp);
        deleteParams.push(taxperiod);
        summSql = anx1Queries.summary.calculate3KSummaryDocWise;
        mfdSql = anx1Queries.summary.getCountMarkForDelfor3KDocWise;
        summBy = docType;
    } 
    else if(type === "CTIN"){
        deleteSummSql = anx1Queries.summary.delete3KsummbyCtin;
        deleteParams.push(fp);
        deleteParams.push(taxperiod);
        deleteParams.push(ctin);
        summSql = anx1Queries.summary.calculate3KSummaryCtinWise;
        mfdSql = anx1Queries.summary.getCountMarkForDelfor3KCtinWise;
        summBy = ctin;
    }

    //console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docType + "," + ctin);
    // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
    await db.deleteData(deleteSummSql, deleteParams, gstindb);
    
    mfdCount = await db.getRow(mfdSql, [fp, taxperiod, summBy], gstindb);
  //  console.log("MFD : "  + JSON.stringify(mfdCount));

    summObj = await db.getRow(summSql, [fp, taxperiod, summBy], gstindb);
   // console.log("Summary for " + summBy + " : "  + JSON.stringify(summObj));

    if(summObj != undefined){
        noOfRecords = summObj.noRec;
        totalVal = summObj.totVal.toFixed(2);
        igst = summObj.igst.toFixed(2);
        cess = summObj.cess.toFixed(2);
    }
    
    if(noOfRecords > 0 || (mfdCount && mfdCount.count > 0)) {
        if(type === 'DOC'){
            valuesToInsert += "('3K'," + noOfRecords + ",'" + docType + "',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'I',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'CR',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'DR',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'N',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC');"
        } else if(type === 'CTIN'){
            lglNm = mfdCount.count === 0 ? (summObj ? summObj.lglName : mfdCount.lglName) : mfdCount.lglName;
            valuesToInsert += "('3K'," + noOfRecords + ", NULL,'" + ctin + "','"+ lglNm +"','" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'CTIN'),"
        }
    
        valuesToInsert = valuesToInsert.substring(0,valuesToInsert.length -1)
        await db.saveRow(anx1Queries.summary.save3KSumm + valuesToInsert, [], gstindb);
    }
    new Promise.resolve(true); 
} 
/**
 * To calculate 3K Error summary
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} gstindb 
 * @param {*} ctin 
 * @param {*} docType 
 * @param {*} type 
 */
async function save3KErrorSummaryByType(gstindb, fp, taxperiod, ctin, docType, type) {

   // console.log("Inside save3KErrorSummaryByType for :" +  fp + "," + taxperiod + ", " + type + "," + ctin);

    let summSql;
    let mfdSql;
    let deleteSummSql;
    let deleteParams = [];

    let summObj;
    let mfdCount;
    
    let summBy;  // to store CTIN or DOC_TYPE, which is required to be passed to the query
    let valuesToInsert = '';
    let noOfRecords = 0, totalVal =0, igst =0, cess =0, lglNm = '';

    if(type === "DOC"){
        deleteSummSql = anx1Queries.errorSummary.delete3KsummbyDoc;
        deleteParams.push(fp);
        deleteParams.push(taxperiod);
        summSql = anx1Queries.errorSummary.calculate3KSummaryDocWise;
        mfdSql = anx1Queries.errorSummary.getCountMarkForDelfor3KDocWise;
        summBy = docType;
    } 
    else if(type === "CTIN"){
        deleteSummSql = anx1Queries.errorSummary.delete3KsummbyCtin;
        deleteParams.push(fp);
        deleteParams.push(taxperiod);
        deleteParams.push(ctin);
        summSql = anx1Queries.errorSummary.calculate3KSummaryCtinWise;
        mfdSql = anx1Queries.errorSummary.getCountMarkForDelfor3KCtinWise;
        summBy = ctin;
    }

  //  console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docType + "," + ctin);
    // Delete the existing summary data for the given fp and taxperiod - for the doctype and ctin
    await db.deleteData(deleteSummSql, deleteParams, gstindb);
    
    mfdCount = await db.getRow(mfdSql, [fp, taxperiod, summBy], gstindb);
    //console.log("MFD : "  + JSON.stringify(mfdCount));

    summObj = await db.getRow(summSql, [fp, taxperiod, summBy], gstindb);
    //console.log("Summary for " + summBy + " : "  + JSON.stringify(summObj));

    if(summObj != undefined){
        noOfRecords = summObj.noRec;
        totalVal = summObj.totVal.toFixed(2);
        igst = summObj.igst.toFixed(2);
        cess = summObj.cess.toFixed(2);
    }
    
    
    if(noOfRecords > 0 || (mfdCount && mfdCount.count > 0)) {
        if(type === 'DOC'){
            valuesToInsert += "('3K'," + noOfRecords + ",'" + docType + "',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'I',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'CR',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'DR',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC'),"
            valuesToInsert += "('3K'," + noOfRecords + ",'N',NULL,NULL,'" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'DOC');"
        } else if(type === 'CTIN'){
            lglNm = mfdCount.count === 0 ? (summObj ? summObj.lglName : mfdCount.lglName) : mfdCount.lglName;
            valuesToInsert += "('3K'," + noOfRecords + ", NULL,'" + ctin + "','"+ lglNm +"','" +  fp + "','" + taxperiod + "'," + totalVal + "," + igst + ",NULL, NULL, " + cess + ",NULL,NULL," +  mfdCount.count + ", NULL, NULL,'CTIN'),"
        }

        valuesToInsert = valuesToInsert.substring(0,valuesToInsert.length -1)
        await db.saveRow(anx1Queries.errorSummary.save3KSumm + valuesToInsert, [], gstindb);
    }
    new Promise.resolve(true); 
}

/**
 * This method will delete the existing summary for the specified rtnprd and save the 3A/ 3H Summary in DB
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} mfd 
 * @param {*} summObj 
 * @param {*} tableTyp 
 */
async function save3Aor3HSummaryTxn(gstin, fp, taxperiod, mfd, summObj, tableTyp, gstindb, flag ,actionFlag) {
    try {

        let records = 0, totalval = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
       // console.log("Delete existing summary data for :" + gstin + "," + fp + "," + taxperiod);
        // Delete the existing summary data for the given fp and taxperiod to insert new changes done

        await db.updateOrDeleteTxn((flag && flag == "F" ? anx1Queries.errorSummary.delete3Aor3HErrorsumm : anx1Queries.summary.delete3Aor3Hsumm), [fp, taxperiod, tableTyp], gstindb)
        if(flag && flag=="N"){
            if(actionFlag && actionFlag=="C"){
                await db.updateOrDeleteTxn(anx1Queries.errorSummary.delete3Aor3HErrorsumm, [fp, taxperiod, tableTyp], gstindb)
            }
        }
        if(summObj != undefined){
            records = summObj.noRec;
            totalval = summObj.totVal.toFixed(2);
            igst = summObj.igst ?summObj.igst.toFixed(2) : summObj.igst;
            cgst = summObj.cgst ?summObj.cgst.toFixed(2) : summObj.cgst;
            sgst = summObj.sgst ?summObj.sgst.toFixed(2) : summObj.sgst;
            cess = summObj.cess ?summObj.cess.toFixed(2) : summObj.cess;
        }
        let sql = (flag && flag == "F" ? anx1Queries.errorSummary.save3Aor3HErrsumm : anx1Queries.summary.save3Aor3Hsumm) + "('" + tableTyp + "'," + records + ", 'I', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC')," +
                "('" + tableTyp + "'," + records + ", 'CR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC')," +
                "('" + tableTyp + "'," + records + ", 'DR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC')," +
                "('" + tableTyp + "'," + records + ", 'N', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC');"

            // Insert the new Records in Summary table for the changes applied in Infront end
            return await db.saveTxn(sql, [], gstindb);
    } catch (err) {
        throw new ({ error: err, statusCd: STATUS_CD_ZERO })
    }

}

/**
 * This method will delete the existing error summary for the specified rtnprd and save the Summary in DB
 * @param {*} gstin 
 * @param {*} fp 
 * @param {*} taxperiod 
 * @param {*} mfd 
 * @param {*} summObj 
 * @param {*} tableTyp 
 */
async function save3Aor3HErrorSummaryTxn(gstin, fp, taxperiod, mfd, summObj, tableTyp, gstindb, flag ,actionFlag) {
    try {

        let records = 0, totalval = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
        //console.log("Delete existing summary data for :" + gstin + "," + fp + "," + taxperiod);
        // Delete the existing summary data for the given fp and taxperiod to insert new changes done
        if(flag && flag=="N"){
            if(actionFlag && actionFlag=="C"){
                await db.updateOrDeleteTxn(anx1Queries.errorSummary.delete3Aor3HErrorsumm, [fp, taxperiod, tableTyp], gstindb)
            }
        }
        else if(flag && flag=="F"){
            await db.updateOrDeleteTxn(anx1Queries.errorSummary.delete3Aor3HErrorsumm, [fp, taxperiod, tableTyp], gstindb)
        }
        if(summObj != undefined){
            records = summObj.noRec;
            totalval = summObj.totVal.toFixed(2);
            igst = summObj.igst ?summObj.igst.toFixed(2) : summObj.igst;
            cgst = summObj.cgst ?summObj.cgst.toFixed(2) : summObj.cgst;
            sgst = summObj.sgst ?summObj.sgst.toFixed(2) : summObj.sgst;
            cess = summObj.cess ?summObj.cess.toFixed(2) : summObj.cess;
        }
        let sql = (anx1Queries.errorSummary.save3Aor3HErrsumm) + "('" + tableTyp + "'," + records + ", 'I', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC')," +
                "('" + tableTyp + "'," + records + ", 'CR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC')," +
                "('" + tableTyp + "'," + records + ", 'DR', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC')," +
                "('" + tableTyp + "'," + records + ", 'N', NULL, NULL, '" + fp + "','" + taxperiod + "'," + totalval + "," + igst + "," + cgst + "," + sgst + "," + cess + ",NULL, NULL," + mfd + ", NULL, NULL, 'DOC');"

            // Insert the new Records in Summary table for the changes applied in Infront end
            return await db.saveTxn(sql, [], gstindb);
    } catch (err) {
        throw new ({ error: err, statusCd: STATUS_CD_ZERO })
    }

}


module.exports = {
    save3ASummary : save3ASummary,
    get3Aor3HSummary : get3Aor3HSummary,
    save3HSummary : save3HSummary,
    save3Aor3HSummary : save3Aor3HSummary,
    getConsolidatedSummary : getConsolidatedSummary,
    get3CDSummary : get3CDSummary,
    save3CDSummary : save3CDSummary,
    save3CDSummaryIntoTable : save3CDSummaryIntoTable,
    get3Bor3KSummary : get3Bor3KSummary,
    save3BSummary : save3BSummary,
    save3EFSummary : save3EFSummary,
    get3EFSummary : get3EFSummary,
    save3GSummary : save3GSummary,
    get3GSummary : get3GSummary,
    save3BSummaryByType : save3BSummaryByType,
    save3KSummary : save3KSummary,
    save3KSummaryByType : save3KSummaryByType,
    save3Aor3HSummaryTxn: save3Aor3HSummaryTxn,
    save3BErrorSummaryByType : save3BErrorSummaryByType,
    save3GSummaryError :save3GSummaryError,
    save3EFSummaryError :save3EFSummaryError,
    save3Aor3HErrorSummaryTxn:save3Aor3HErrorSummaryTxn,
    save3KErrorSummaryByType:save3KErrorSummaryByType,
    save3AASummary:save3AASummary,
    save3GASummary:save3GASummary,
    save3GASummaryError:save3GASummaryError
}