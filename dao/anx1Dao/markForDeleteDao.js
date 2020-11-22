const log  = require('../../utility/logger');
const logger = log.logger;
const db = require("../../db/dbUtil");
const summary = require('../../dao/anx1SummaryDao');
const efaSumm = require('../../dao/anx1Dao/anx13efaDao')
const sqlite3 = require('sqlite3').verbose();
const query = require('../../db/anx1Queries/anx1Queries');
const {save3ISummaryTxn} = require('../anx1Dao/anx13iDao');
const {save3JSummaryTxn} = require('../anx1Dao/anx13jDao');
const {save4SummaryTxn} = require('../anx1Dao/anx14Dao');
const {save3HSummaryTxn} = require('../anx1Dao/anx13hDao')
const {summary3cdTxn} = require('../anx13cdDao');
const { DB_PATH, DB_EXT } = require('../../utility/constants');
const anx1Tables = ['ANX1_3A','ANX1_3CD','ANX1_3EF','ANX1_3G','ANX1_3H','ANX1_3I','ANX1_3J','ANX1_4','ANX1_3EFA','ANX1_3GA'];
const {  anx1Queries } = require("../../db/Queries");
const Promise = require("bluebird");

async function isEligible(tablename, rtnprd , gstin) {
    logger.log('info' , 'Entering isEligible',tablename)
    try {   
        tablename = "ANX1_" + tablename;
     
            let sqlU = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and STATUS IN ("Uploaded", "Rejected", "Amended")';
            let sqlD = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and FLAG = "D"'
        
        if(tablename==="ANX1_3BA" || tablename==="ANX1_3EFA" || tablename==="ANX1_3GA" ){
             sqlU = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and STATUS IN ("Amended","Invalid")';
             sqlD = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and FLAG IN ("D","M")'
        }
        else if(tablename==="ANX1_3BAO"){
                sqlU = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and STATUS IN ("Amended","Invalid")';
                sqlD = 'select count(*) as count from ' + tablename + ' where TAX_PERIOD = "' + rtnprd + '" and FLAG = "D"'
        } 
        let countOfU = await db.fetchAllById(sqlU, [], gstin);
        let countOfD = await db.fetchAllById(sqlD, [], gstin);
        if(countOfD[0].count > 0){
            return ({ statusCd: 'U' })
        }
        else if(countOfU[0].count > 0){
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

async function markForDelete(tablename,rtnprd,fp,docid,flag,gstin) {
    logger.log('info' , 'Entering markForDelete')
    let gstindb;
    let flagStatus = {
                D : 'MFR',
                U : 'Amended',
                I : 'MAI',
                IR : 'Invalid',
                M : 'MFR'
    }
    try {
        gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
        gstindb.exec('BEGIN TRANSACTION;');
        let text = "marked for delete" ;
        //let status = "Marked for delete";
        if(flag == "U" || flag == "Am") {
            text = "unmarked from delete";
           // status= "Uploaded";
        }
        tablename = "ANX1_" + tablename;
        let count = 0;
        if(docid == "All"){
            if(tablename ==='ANX1_3BA' || tablename ==='ANX1_3EFA' || tablename == 'ANX1_3GA'){
                var sql = '';
                if(flag == "U"){ // for amendment flow
                    text = "unmarked from reset";
                 sql = 'UPDATE '+ tablename +' SET FLAG = "U", STATUS = (SELECT CASE WHEN up.FLAG = "D" THEN "Amended" ELSE "Invalid" END FROM '+ tablename+' up WHERE up.STATUS = ' +tablename+'.STATUS AND up.STATUS = "MFR") WHERE TAX_PERIOD = '+rtnprd+' AND (STATUS IN ("MFR") OR FLAG IN ("D","M"))';
                }else{
                 text = "marked for reset"; 
                 sql = 'UPDATE '+ tablename +' SET FLAG = (SELECT CASE WHEN up.STATUS = "Amended" THEN "D" ELSE "M" END FROM '+ tablename + ' up WHERE up.STATUS = '+tablename+'.STATUS AND up.STATUS = "Amended" OR up.STATUS = "Invalid") , STATUS = "MFR" WHERE TAX_PERIOD ='+ rtnprd +' AND (STATUS IN ("Amended","Invalid") OR FLAG IN ("D","M"))';
                }  
            }else if (tablename ==='ANX1_3BAO'){
                //var sql = 'update ' + tablename  +' set FLAG = "' + flag + '" where TAX_PERIOD = "' + rtnprd + '" AND (STATUS IN ("Amended") OR FLAG IN ("D"))' ;
                if (flag !== "D") {
                    var sql = 'update ' + tablename + ' set FLAG = "' + flag + '",STATUS = "' + flagStatus[flag] + '"  where TAX_PERIOD = "' + rtnprd + '" AND FLAG = "D" AND (STATUS IN ("Uploaded","MFR","Amended","") AND FLAG <> "M")';
                }
                else {
                    var sql = 'update ' + tablename + ' set FLAG = "' + flag + '",STATUS = "' + flagStatus[flag] + '"  where TAX_PERIOD = "' + rtnprd + '" AND (STATUS IN ("Uploaded","MFR","Amended","") AND FLAG <> "M" OR FLAG IN ("D"))';
                }
            }
            else{
                var sql = 'update ' + tablename  +' set FLAG = "' + flag + '" where TAX_PERIOD = "' + rtnprd + '" AND (STATUS IN ("Uploaded", "Rejected", "Amended") OR FLAG IN ("D"))' ;
            }
            console.log("SQLLL:",sql);
            count= await db.update(sql,[],gstin ,gstindb);
            
            if(count){
                await calculateSummary(tablename, docid, rtnprd, fp, gstin, gstindb, docid);
                gstindb.exec('COMMIT;'); 
                return ({message: count + " records "+ text , statusCd : 1})
            }
            throw new Error(({message: " No records "+text , statusCd : 0}))
        }else{
            let list ="";
            docid.forEach((id)=>{
                list = list + "," +id ; 
            })
            if(tablename ==='ANX1_3BA' || tablename ==='ANX1_3EFA' || tablename == 'ANX1_3GA'){
                if(flag == "U" || flag == 'IR'){ // for amendment flow
                    text = "unmarked from reset";
                   
                }else{
                    if(flag == 'I'){
                        text = "marked for invalid"; 
                    }else{
                        text = "marked for reset"; 
                    }
                }
                let status = flagStatus[flag];
                flag = (flag == 'IR') ? 'U' : flag ;
                var sql = 'update ' + tablename + ' set FLAG = "' + flag + '",STATUS = "' + status + '" where TAX_PERIOD = "' + rtnprd + '" and DOC_ID IN (' +list.substring(1) +') AND (STATUS IN ("Amended","Invalid","MAI","MFR","Rejected","") OR FLAG IN ("D"))' ;
              
            }
            else if(tablename ==='ANX1_3BAO'){
                let status = flagStatus[flag];
                if(flag == 'I'){
                    text = "marked for invalid"; 
                }else if(flag == 'U'){
                    text = "unmarked for delete"; 
                }else if (flag == 'M'){
                    text = "marked for undo invalid";
                }
                else {
                    text = "marked for delete"; 
                }
                flag = (flag == 'IR') ? 'U' : flag ;
                var sql = 'update ' + tablename + ' set FLAG = "' + flag + '" ,STATUS = "' + status + '" where TAX_PERIOD = "' + rtnprd + '" and DOC_ID IN (' +list.substring(1) +') AND (STATUS IN ("Uploaded","Amended","Invalid","MAI","MFR","Rejected","") OR STATUS IS NULL OR FLAG IN ("D"))' ;
              
            }
            else{
                var sql = 'update ' + tablename + ' set FLAG = "' + flag + '" where TAX_PERIOD = "' + rtnprd + '" and DOC_ID IN (' +list.substring(1) +') AND (STATUS IN ("Uploaded", "Rejected", "Amended") OR FLAG IN ("D"))' ;
            }
            count = await db.update(sql,[],gstin , gstindb);
            if(count){
               
                    await calculateSummary(tablename, list.substring(1), rtnprd, fp, gstin, gstindb, docid);            
                gstindb.exec('COMMIT;');
                return ({message: count + " record "+text , statusCd : 1})
            }
             throw new Error(({message: " No record "+text , statusCd : 0}))
        }
    }
   catch(err){
        gstindb.exec('ROLLBACK;');
        
        throw err;
   }
   finally{
        gstindb.close((err) => {
        if (err) {
          console.error(err.message);
        }
          console.log('Close the database connection.');
        }); 
   }
}
async function calculateSummary(tablename,docid,taxperiod,fp,gstin,gstindb,docIdsList){
    logger.log("info", "Inside markForDeleteDao | calculateSummary - %s", tablename);
    if(anx1Tables.includes(tablename)) 
    switch(tablename){
        case "ANX1_3A": 
            await summary.save3ASummary(gstin,fp,taxperiod,gstindb);
        break;
        case "ANX1_3CD":
            await summary3cdTxn(fp,taxperiod,gstindb,true);
        break;
        case "ANX1_3EF" :
            await summary.save3EFSummary(gstindb,fp,taxperiod);
        break;
        case "ANX1_3EFA" :
            await efaSumm.save3EFASummary(gstindb,fp,taxperiod);
        break;
        case "ANX1_3G" : 
            await summary.save3GSummary(gstindb,fp,taxperiod);
        break;
        case "ANX1_3GA" : 
            await summary.save3GASummary(gstindb,fp,taxperiod);
        break;
        case "ANX1_3H" : 
           await save3HSummaryTxn(gstin,fp,taxperiod , gstindb);
        break;
        case "ANX1_3I" : 
           await save3ISummaryTxn(gstin, fp, taxperiod, gstindb);
        break;
        case "ANX1_3J" : 
           await save3JSummaryTxn(gstin, fp, taxperiod, gstindb);
        break;
        case "ANX1_4" : 
           await save4SummaryTxn(gstin, fp, taxperiod, gstindb) 
        break;
        
    }
    else if(docid == "All" && !anx1Tables.includes(tablename)){
        switch(tablename){
        case "ANX1_3B" : 
        //let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForRtnPrd, [flag, status, taxperiod], gstindb);
        //let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForRtnPrd, [flag, status, taxperiod], gstindb);
        
        let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForRtnPrd, [ taxperiod], gstindb);
        let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForRtnPrd, [ taxperiod], gstindb);
    
        await Promise.mapSeries(ctinList, (ctin) => {
                return db.deleteData(anx1Queries.summary.delete3BsummbyCtin, [fp, taxperiod, ctin.CTIN], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.CTIN, "","3B", "CTIN"));
            }
        );

        await Promise.mapSeries(docTypList, (docTyp) => {
            console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.DOCTYPE);
            return db.deleteData(anx1Queries.summary.delete3BsummbyDoc, [fp, taxperiod, docTyp.DOCTYPE], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.DOCTYPE,"3B", "DOC"));
            }
        );
        logger.log("debug","3B Summary Calculated");
        break;       
        case "ANX1_3K" : 
            let ctinArray = await db.fetchAllByIdTxn("SELECT distinct CTIN from ANX1_3K where TAX_PERIOD = ?",[taxperiod],gstindb);
            await Promise.mapSeries(ctinArray, (ctin) => {
                summary.save3KSummaryByType(gstindb, fp, taxperiod, ctin.CTIN, "", "CTIN");
            });
            await summary.save3KSummaryByType(gstindb, fp, taxperiod, "", "B", "DOC");
        break;  
        case "ANX1_3L" : 
        //let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForRtnPrd, [flag, status, taxperiod], gstindb);
        //let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForRtnPrd, [flag, status, taxperiod], gstindb);
        console.log("first 2 queries entering");
        let ctinList1 = await db.fetchAllByIdInTransaction(anx1Queries.table3l.getDistinctCtinForRtnPrd, [ taxperiod], gstindb);
            console.log(ctinList1 , "Ctin list")
        let docTypList1 = await db.fetchAllByIdInTransaction(anx1Queries.table3l.getDistinctDocTypForRtnPrd, [ taxperiod], gstindb);
            console.log("first 2 queries done")
        await Promise.mapSeries(ctinList1, (ctin) => {
                return db.deleteData(anx1Queries.summary.delete3LsummbyCtin, [fp, taxperiod, ctin.CTIN], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.CTIN, "", "3L","CTIN"));
            }
        );

        await Promise.mapSeries(docTypList1, (docTyp) => {
            console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.DOCTYPE);
            return db.deleteData(anx1Queries.summary.delete3LsummbyDoc, [fp, taxperiod, docTyp.DOCTYPE], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.DOCTYPE,"3L", "DOC"));
            }
        );
        logger.log("debug","3L Summary Calculated");
        break;
        case "ANX1_3BA" :         
        let ctinListAmnd = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForRtnPrdAmnd, [ taxperiod], gstindb);
        let docTypListAmnd = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForRtnPrdAmnd, [ taxperiod], gstindb);
    
        await Promise.mapSeries(ctinListAmnd, (ctin) => {
                return db.deleteData(anx1Queries.summary.delete3BAsummbyCtin, [fp, taxperiod,"3BA", ctin.REV_CTIN], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.REV_CTIN, "","3BA", "CTIN"));
            }
        );

        await Promise.mapSeries(docTypListAmnd, (docTyp) => {
            console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.REV_DOCTYPE);
            return db.deleteData(anx1Queries.summary.delete3BAsummbyDoc, [fp, taxperiod,"3BA",docTyp.REV_DOCTYPE], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.REV_DOCTYPE,"3BA", "DOC"));
            }
        );
        logger.log("debug","3BA Summary Calculated");
        break;
        case "ANX1_3BAO" :         
        let ctinList3BAO = await db.fetchAllByIdInTransaction(anx1Queries.tableB2BAO.getDistinctCtinForRtnPrdAmnd, [ taxperiod], gstindb);
        let docTypList3BAO = await db.fetchAllByIdInTransaction(anx1Queries.tableB2BAO.getDistinctDocTypForRtnPrdAmnd, [ taxperiod], gstindb);
    
        await Promise.mapSeries(ctinList3BAO, (ctin) => {
                return db.deleteData(anx1Queries.summary.delete3BAsummbyCtin, [fp, taxperiod,'3BAO', ctin.REV_CTIN], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.REV_CTIN, "","3BAO", "CTIN"));
            }
        );

        await Promise.mapSeries(docTypList3BAO, (docTyp) => {
            console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.REV_DOCTYPE);
            return db.deleteData(anx1Queries.summary.delete3BAsummbyDoc, [fp, taxperiod,'3BAO',docTyp.REV_DOCTYPE], gstindb)
                .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.REV_DOCTYPE,"3BAO", "DOC"));
            }
        );
        logger.log("debug","3BAO Summary Calculated");
        break;    
        }
    }
    else if(docid != "All" && !anx1Tables.includes(tablename)){
        switch(tablename){
            case "ANX1_3B" : 
            let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForDocIds, docIdsList, gstindb, true);
            let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForDocIds, docIdsList, gstindb, true);

            await Promise.mapSeries(ctinList, (ctin) => {
                    return db.deleteData(anx1Queries.summary.delete3BsummbyCtin, [fp, taxperiod, ctin.CTIN], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.CTIN, "","3B", "CTIN"));
                }
            );
    
            await Promise.mapSeries(docTypList, (docTyp) => {
                console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.DOCTYPE);
                return db.deleteData(anx1Queries.summary.delete3BsummbyDoc, [fp, taxperiod, docTyp.DOCTYPE], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.DOCTYPE,"3B", "DOC"));
                }
            );
            logger.log("debug","3B Summary Calculated");

            break;
            case "ANX1_3L" : 
            //let ctinList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForRtnPrd, [flag, status, taxperiod], gstindb);
            //let docTypList = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForRtnPrd, [flag, status, taxperiod], gstindb);
            console.log("first 2 queries not done" + taxperiod)
            let ctinList2 = await db.fetchAllByIdInTransaction(anx1Queries.table3l.getDistinctCtinForDocIds, docIdsList, gstindb, true);
                console.log(ctinList2 , "ctin list ")
            let docTypList2 = await db.fetchAllByIdInTransaction(anx1Queries.table3l.getDistinctDocTypForDocIds, docIdsList, gstindb, true);
            console.log("first 2 queries done")
            await Promise.mapSeries(ctinList2, (ctin) => {
                    return db.deleteData(anx1Queries.summary.delete3LsummbyCtin, [fp, taxperiod, ctin.CTIN], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.CTIN, "", "3L","CTIN"));
                }
            );
    
            await Promise.mapSeries(docTypList2, (docTyp) => {
                console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.DOCTYPE);
                return db.deleteData(anx1Queries.summary.delete3LsummbyDoc, [fp, taxperiod, docTyp.DOCTYPE], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.DOCTYPE,"3L", "DOC"));
                }
            );
            logger.log("debug","3L Summary Calculated");
            break; 
        case "ANX1_3K" :
            let ctinArray = await db.fetchAllByIdTxn("SELECT distinct CTIN from ANX1_3K where TAX_PERIOD = ?",[taxperiod],gstindb);
            await Promise.mapSeries(ctinArray, (ctin) => {
                summary.save3KSummaryByType(gstindb, fp, taxperiod, ctin.CTIN, "", "CTIN");
            });
            await summary.save3KSummaryByType(gstindb, fp, taxperiod, "", "B", "DOC");
            break;
            case "ANX1_3BA" : 
            let ctinListAmnd = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctCtinForDocIdsAmnd, docIdsList, gstindb, true);
            let docTypListAmnd = await db.fetchAllByIdInTransaction(anx1Queries.table3b.getDistinctDocTypForDocIdsAmnd, docIdsList, gstindb, true);
            console.log('doctype',docTypListAmnd)
            await Promise.mapSeries(ctinListAmnd, (ctin) => {
                    return db.deleteData(anx1Queries.summary.delete3BAsummbyCtin, [fp, taxperiod,"3BA", ctin.CTIN], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.CTIN, "","3BA", "CTIN"));
                }
            );
    
            await Promise.mapSeries(docTypListAmnd, (docTyp) => {
                console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.REV_DOCTYPE);
                return db.deleteData(anx1Queries.summary.delete3BAsummbyDoc, [fp, taxperiod, "3BA",docTyp.REV_DOCTYPE], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.REV_DOCTYPE,"3BA", "DOC"));
                }
            );
            logger.log("debug","3BA Summary Calculated");

            break;
            case "ANX1_3BAO" : 
            let ctinList3BAO = await db.fetchAllByIdInTransaction(anx1Queries.tableB2BAO.getDistinctCtinForDocIdsAmnd, docIdsList, gstindb, true);
            let docTypList3BAO = await db.fetchAllByIdInTransaction(anx1Queries.tableB2BAO.getDistinctDocTypForDocIdsAmnd, docIdsList, gstindb, true);
            await Promise.mapSeries(ctinList3BAO, (ctin) => {
                    return db.deleteData(anx1Queries.summary.delete3BAsummbyCtin, [fp, taxperiod, '3BAO',ctin.CTIN], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, ctin.CTIN, "","3BAO", "CTIN"));
                }
            );
    
            await Promise.mapSeries(docTypList3BAO, (docTyp) => {
                console.log("Delete existing summary data for :" + fp + "," + taxperiod + "," + docTyp.REV_DOCTYPE);
                return db.deleteData(anx1Queries.summary.delete3BAsummbyDoc, [fp, taxperiod,'3BAO', docTyp.REV_DOCTYPE], gstindb)
                    .then(() => summary.save3BSummaryByType(gstin, fp, taxperiod, gstindb, "", docTyp.REV_DOCTYPE,"3BAO", "DOC"));
                }
            );
            logger.log("debug","3BAO Summary Calculated");

            break;       
        }
    }
}
function updateMFR(table,docIds, rtnprd, gstin,fp) {
    let tablename = "ANX1_"+ table;
    gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    return new Promise.map(docIds, (docIds) => {
        return new Promise((resolve, reject) => {
            let que = "UPDATE "+tablename+" SET FLAG ='" +docIds.flag+"', STATUS='"+ docIds.status+"' WHERE DOC_ID = '"+docIds.docid+"' AND STATUS IN('Amended','Invalid','MFR') AND TAX_PERIOD='"+rtnprd+"'";
            console.log("update Records::",que);
            if(tablename === 'ANX1_3BA'){
                docIds.docid = 'All';
            }
            db.saveRow(que, [], gstindb).then(
                () => {
                    calculateSummary(tablename, docIds.docid, rtnprd, fp, gstin, gstindb, docIds).then((result) => {
                    return resolve(result);
                })
                }, (error) => {
                    return reject(error);
                }).catch((error) => {
                    return reject(error);
                });
        });
    }, { concurrency: 1 }).then(() => {
        return true;
    }).catch(err => {
        return err;
    })
}
module.exports={
    isEligible:isEligible ,
    markForDelete:markForDelete,
    updateMFR:updateMFR  
}