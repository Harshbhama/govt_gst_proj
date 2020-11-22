var express = require('express');
var router = express.Router();
var anx2const = require('../utility/anx2Constant.js');
var error = require('../utility/errorconstants.js');
var dbcon = require('../db/dbUtil');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { exportCsvQuery } = require('../db/anx2Queries/exportQueries');
const { table, query }  = require('../db/queries');
const { OFFLINE_TOOL_DB, STATUS_CD_ZERO, STATUS_CD_ONE, DB_PATH, DB_EXT } = require('../utility/constants');
var db;
const log  = require('../utility/logger.js');
const logger = log.logger;

/**
 * TO GET all 3B,3E,3F,3G tables data
 * @param {*} req
 * @param {*} res
 */
function getData (req, res) {
    logger.log("info","Entering anx2Dao.js :: getData ");
    let tablename= req.query.tblnm;
    let iserractn=req.query.iserractn
    return new Promise(function (resolve, reject) {
        let que ='';
        let parm=[];
        let view = req.query.view;
        logger.log("debug","view is :: %s",view);
        logger.log("debug","Inside get Document Data for table:: %s",tablename);

        que=eval('query.anx2.'+tablename+'.getData');
        parm = [req.query.rtnprd];
        iserractn=='Y'?(que=`${que}AND ERROR_CODE IS NOT NULL OR FLG='X'`):(que=`${que} AND FLG<>'X'`) ;
        
        if(view == anx2const.VIEW_CP){
            que = que + " ORDER BY LOWER(TRDNAME),strftime('%s',substr(S_TAXPERIOD,3,4)||'-'||substr(S_TAXPERIOD,1,2)||'-01'), strftime('%s',substr(DOCDATE,7,4)||'-'||substr(DOCDATE,4,2)||'-'||substr(DOCDATE,1,2)), DOCNUM";
        }else if(view == anx2const.VIEW_DOC){
            que = que + " ORDER BY LOWER(TRDNAME), strftime('%s',substr(DOCDATE,7,4)||'-'||substr(DOCDATE,4,2)||'-'||substr(DOCDATE,1,2)), DOCNUM";
        }

        dbcon.fetchAllById(que,parm,req.query.gstin).then((result)=>{
            logger.log("info","Exiting anx2Dao.js :: getData");
            resolve(result);
        }).catch((err)=>{
            reject(err);
        })    
    });
}

/**
 * to get table5(ISDC) data
 * @param {*} req
 * @param {*} res
 */
function gettb5Data(req,res){
    logger.log("info","Entering anx2Dao.js :: gettb5Data");
    let que ='';
    let parm=[];
    return new Promise(function(resolve,reject) { 
        que = query.anx2.isdc.getData;
        parm = [req.query.rtnprd];
        logger.log("debug","fetching table5 data")
    dbcon.fetchAllById(que,parm,req.query.gstin).then((result)=>{
        logger.log("debug","inside dbcon result ");
        logger.log("info","Exiting anx2Dao.js :: gettb5Data");
        resolve(result);
    }).catch((err)=>{
        logger.log("error","anx2Dao.js :: gettb5Data :: inside dbcon error ::%s",err);
        reject(err);
    })
    });  
}
   
    /**
     *this method is to connect to the database 
     * @param {*} gstin
     */
    function connectDb(gstin) {
        db = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    }
    
    /**
     *deletes the table data and opens downloaded JSON file
     * @param {*} fileData
     * @param {*} gstin
     */
    function persistData(fileData, gstin) {
        logger.log("info","Entering anx2Dao.js :: persistData");
        logger.log("debug","Inside open downloaded JSON");
        return new Promise(function (resolve, reject) {
                connectDb(gstin);
                let promarr=[];
                logger.log("debug","created DB connection");
                db.serialize(()=>{
                return new Promise(function (resolve, reject) {
                db.exec('BEGIN TRANSACTION;');
                deleteAllTableData(db,fileData.rtnprd).then((result) => {
                    promarr.push(dataloops(fileData,db))
                    let anx2stat=fileData[anx2const.ARN]!==undefined && fileData[anx2const.FILING_DATE]!==undefined?anx2const.FLAG_FILED:anx2const.FLAG_NOT_FILED;
                    promarr.push(dbcon.update(query.profile.updatefdstat,[anx2stat,gstin],OFFLINE_TOOL_DB,undefined))

                Promise.all(promarr).then(()=>resolve(),(err)=>reject(err))
                }).catch((err) => {
                    reject(err);
                })
            }).then((result) => {
                db.exec('COMMIT;');
                db.close();
                logger.log("info","Exiting anx2Dao.js :: persistData");
                resolve();
            }).catch((err) => {
                logger.log("error","anx2Dao.js :: persistData :: Error occured while processing file data ::%s", err);
                db.exec('ROLLBACK;');
                db.close();
                logger.log("debug","Rollback Done");
                reject(err);
            })})
        });
    }

    /**
     *creates b2b table with data
     * @param {*} fileData
     */
    function createb2b(fileData){
        logger.log("debug","Entering anx2Dao.js :: createb2b");
        let dataarr=[];
        let itemarr=[];
        for (let i = 0; i < fileData.b2b.length; i++) {
            let currec=fileData.b2b[i];
            let data = {};
            for (let j = 0; j < currec.docs.length; j++) {
                let total ={};
                let currdoc=currec.docs[j];
                let doctyp=currdoc.doctyp;
                if(doctyp==anx2const.DOCTYP_C){
                    doctyp=anx2const.DOCTYP_CN;
                }else if(doctyp==anx2const.DOCTYP_D){
                    doctyp=anx2const.DOCTYP_DN;
                }
                let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;
                if(currdoc.items != undefined){
                    let arr=createItem(currdoc.items,docrf,fileData.rtnprd);
                    total=arr[0];
                    itemarr= itemarr.concat(arr[1]);
                }
                data = {
                    stin: currec.ctin,
                    trdnm: currec.trdnm,
                    doc_typ: doctyp,
                    doc_num: currdoc.doc.num,
                    doc_dt: currdoc.doc.dt,
                    doc_val: currdoc.doc.val,
                    pos: currdoc.pos,
                    txval: total.tot_txval==undefined?0:total.tot_txval,
                    igst: total.tot_igst==undefined?0:total.tot_igst,
                    cgst: total.tot_cgst==undefined?0:total.tot_cgst,
                    sgst: total.tot_sgst==undefined?0:total.tot_sgst,
                    cess: total.tot_cess==undefined?0:total.tot_cess,
                    itcent: currdoc.itcent,
                    stxprd: currdoc.splrprd,
                    upld_dt: currdoc.uplddt,
                    cfs: currdoc.cfs,
                    port_sts: currdoc.action==='N'?'':currdoc.action,
                    app_tx_rt: currdoc.diffprcnt==undefined || currdoc.diffprcnt==''?100:currdoc.diffprcnt*100,
                    igst_act: currdoc.sec7act,
                    itc_prd: fileData.rtnprd,
                    rejpstfil: currdoc.rjtpstflng,
                    chksum: currdoc.chksum,
                    flg:anx2const.FLAG_U,
                    docref: docrf,
                    err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                    err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg
                };
                if( currdoc.itcent!=undefined && currdoc.itcent!=''){
                    if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent=anx2const.FLAG_N;
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent='';
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_YN;	
                    else if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_NY;	
                }
                dataarr.push(data);
            }
        }
        logger.log("debug","Exiting anx2Dao.js :: createb2b");
        return [dataarr,itemarr];

    }

    /**
     *creates sezwop table with data
     * @param {*} fileData
     */
    function createsezwop(fileData){
        logger.log("debug","Entering anx2Dao.js :: createsezwop");
        let dataarr=[];
        let itemarr=[];
        for (let i = 0; i < fileData.sezwop.length; i++) {
            let currec=fileData.sezwop[i];
            let data = {};
            for (let j = 0; j < currec.docs.length; j++) {
                let currdoc=currec.docs[j];
                let total ={};
                let doctyp=currdoc.doctyp;
                if(doctyp==anx2const.DOCTYP_C){
                    doctyp=anx2const.DOCTYP_CN;
                }else if(doctyp==anx2const.DOCTYP_D){
                    doctyp=anx2const.DOCTYP_DN;
                }
                let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;
                if(currdoc.items != undefined){
                    let arr=createItem(currdoc.items,docrf,fileData.rtnprd);
                    total=arr[0];
                    itemarr= itemarr.concat(arr[1]);
                }
                data = {
                    stin: currec.ctin,
                    trdnm: currec.trdnm,
                    doc_typ: doctyp,
                    doc_num: currdoc.doc.num,
                    doc_dt: currdoc.doc.dt,
                    doc_val: currdoc.doc.val,
                    pos: currdoc.pos,
                    txval: total.tot_txval==undefined?0:total.tot_txval,
                    stxprd: currdoc.splrprd,
                    upld_dt: currdoc.uplddt,
                    cfs: currdoc.cfs,
                    port_sts: currdoc.action==='N'?'':currdoc.action,
                    app_tx_rt: currdoc.diffprcnt==undefined || currdoc.diffprcnt==''?100:currdoc.diffprcnt*100,
                    itc_prd: fileData.rtnprd,
                    rejpstfil: currdoc.rjtpstflng,
                    chksum: currdoc.chksum,
                    flg:anx2const.FLAG_U,
                    docref: docrf,
                    err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                    err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg
                };
                if( currdoc.itcent!=undefined && currdoc.itcent!=''){
                    if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent=anx2const.FLAG_N;
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent='';
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_YN;	
                    else if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_NY;	
                }
                dataarr.push(data);               
            }
        }
        logger.log("debug","Exiting anx2Dao.js :: createsezwop");
        return [dataarr,itemarr];
        
    }
    /**
     *creates sezwp table with data
     * @param {*} fileData
     */
    function createsezwp(fileData){
        logger.log("debug","Entering anx2Dao.js :: createsezwp");
        let dataarr=[];
        let itemarr=[];
        for (let i = 0; i < fileData.sezwp.length; i++) {
            let data = {};
            let currec=fileData.sezwp[i];
            for (let j = 0; j < currec.docs.length; j++) {
                let total ={};
                let currdoc=currec.docs[j];
                let doctyp=currdoc.doctyp;
                if(doctyp==anx2const.DOCTYP_C){
                    doctyp=anx2const.DOCTYP_CN;
                }else if(doctyp==anx2const.DOCTYP_D){
                    doctyp=anx2const.DOCTYP_DN;
                }
                let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;
                if(currdoc.items != undefined){
                    let arr=createItem(currdoc.items,docrf,fileData.rtnprd);
                    total=arr[0];
                    itemarr= itemarr.concat(arr[1]);
                }
                data = {
                    stin: currec.ctin,
                    trdnm: currec.trdnm,
                    doc_typ: doctyp,
                    doc_num: currdoc.doc.num,
                    doc_dt: currdoc.doc.dt,
                    doc_val: currdoc.doc.val,
                    pos: currdoc.pos,
                    txval: total.tot_txval==undefined?0:total.tot_txval,
                    igst: total.tot_igst==undefined?0:total.tot_igst,
                    cess: total.tot_cess==undefined?0:total.tot_cess,
                    itcent: currdoc.itcent,
                    stxprd: currdoc.splrprd,
                    upld_dt: currdoc.uplddt,
                    cfs: currdoc.cfs,
                    port_sts: currdoc.action==='N'?'':currdoc.action,
                    app_tx_rt: currdoc.diffprcnt==undefined || currdoc.diffprcnt==''?100:currdoc.diffprcnt*100,
                    itc_prd: fileData.rtnprd,
                    rejpstfil: currdoc.rjtpstflng,
                    clmref: currdoc.clmrfnd,
                    chksum: currdoc.chksum,
                    flg:anx2const.FLAG_U,
                    docref: docrf,
                    err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                    err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg
                };
                if( currdoc.itcent!=undefined && currdoc.itcent!=''){
                    if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent=anx2const.FLAG_N;
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent='';
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_YN;	
                    else if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_NY;	
                }
                dataarr.push(data);  
            }
        }
        logger.log("debug","Exiting anx2Dao.js :: createsezwp");
        return [dataarr,itemarr];
        
    }
    /**
     *creates de table with data
     * @param {*} fileData
     */
    function createde(fileData){
        logger.log("debug","Entering anx2Dao.js :: createde");
        let dataarr=[];
        let itemarr=[];
        for (let i = 0; i < fileData.de.length; i++) {
            let data = {};
            let currec=fileData.de[i];
            for (let j = 0; j < currec.docs.length; j++) {
                let total ={};
                let currdoc=currec.docs[j];
                let doctyp=currdoc.doctyp;
                if(doctyp==anx2const.DOCTYP_C){
                    doctyp=anx2const.DOCTYP_CN;
                }else if(doctyp==anx2const.DOCTYP_D){
                    doctyp=anx2const.DOCTYP_DN;
                }
                let docrf = currec.ctin + "|" + currdoc.doc.num + "|" + doctyp + "|" + fileData.rtnprd;
                if(currdoc.items != undefined){
                    let arr=createItem(currdoc.items,docrf,fileData.rtnprd);
                    total=arr[0];
                    itemarr= itemarr.concat(arr[1]);
                }
                data = {
                    stin: currec.ctin,
                    trdnm: currec.trdnm,
                    doc_typ: doctyp,
                    doc_num: currdoc.doc.num,
                    doc_dt: currdoc.doc.dt,
                    doc_val: currdoc.doc.val,
                    pos: currdoc.pos,
                    txval: total.tot_txval==undefined?0:total.tot_txval,
                    igst: total.tot_igst==undefined?0:total.tot_igst,
                    cgst: total.tot_cgst==undefined?0:total.tot_cgst,
                    sgst: total.tot_sgst==undefined?0:total.tot_sgst,
                    cess: total.tot_cess==undefined?0:total.tot_cess,
                    itcent: currdoc.itcent,
                    stxprd: currdoc.splrprd,
                    upld_dt: currdoc.uplddt,
                    cfs: currdoc.cfs,
                    port_sts: currdoc.action==='N'?'':currdoc.action,
                    app_tx_rt: currdoc.diffprcnt==undefined || currdoc.diffprcnt==''?100:currdoc.diffprcnt*100,
                    igst_act: currdoc.sec7act,
                    itc_prd: fileData.rtnprd,
                    rejpstfil: currdoc.rjtpstflng,
                    clmref: currdoc.clmrfnd,
                    chksum: currdoc.chksum,
                    flg:anx2const.FLAG_U,
                    docref: docrf,
                    err_code:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errCd,
                    err_detl:currdoc.errorDetails==undefined?null:currdoc.errorDetails.errMsg
                };
                if( currdoc.itcent!=undefined && currdoc.itcent!=''){
                    if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent=anx2const.FLAG_N;
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_N)
                    data.itcent='';
                    else if(currdoc.itcent==anx2const.FLAG_Y && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_YN;	
                    else if(currdoc.itcent==anx2const.FLAG_N && currdoc.itcentedtbl==anx2const.FLAG_Y)
                    data.itcent=anx2const.FLAG_NY;	
                }
                dataarr.push(data);
                }                  
            }
            logger.log("debug","Exiting anx2Dao.js :: createde");
            return [dataarr,itemarr];
        }
    /**
     *creates isdc table with data
     * @param {*} fileData
     */
    function createisdc(fileData){
        logger.log("debug","Entering anx2Dao.js :: createisdc");
        let dataarr=[];
        for (let i = 0; i < fileData.isdc.length; i++) {
            let isdDoc = fileData.isdc[i].doc;
            let data = {};
            if(isdDoc.isamended == anx2const.FLAG_Y){
                data = {
                    ctin: isdDoc.amd.ctin,
                    trdnm: isdDoc.amd.trdnm,
                    dctyp: isdDoc.amd.doctyp==anx2const.DOCTYP_C?anx2const.DOCTYP_CN:isdDoc.amd.doctyp,
                    dnm: isdDoc.amd.num,
                    dt: isdDoc.amd.dt,
                    igst: isdDoc.amd.igst,
                    cgst: isdDoc.amd.cgst,
                    sgst: isdDoc.amd.sgst,
                    cess: isdDoc.amd.cess,
                    dtaxprd: isdDoc.amd.dtaxprd,
                    actin: isdDoc.ctin,
                    atrdnm: isdDoc.trdnm,
                    adctyp: isdDoc.doctyp==anx2const.DOCTYP_C?anx2const.DOCTYP_CN:isdDoc.doctyp,
                    adnm: isdDoc.num,
                    adt: isdDoc.dt,
                    aigst: isdDoc.igst,
                    acgst: isdDoc.cgst,
                    asgst: isdDoc.sgst,
                    acess: isdDoc.cess,
                    adtaxprd: isdDoc.dtaxprd,
                    isamnd: isdDoc.isamended,
                    amdrsn: isdDoc.rsn,
                    itc_prd: fileData.rtnprd
                };
                
            } else{
                data = {
                    ctin: isdDoc.ctin,
                    trdnm: isdDoc.trdnm,
                    dctyp: isdDoc.doctyp==anx2const.DOCTYP_C?anx2const.DOCTYP_CN:isdDoc.doctyp,
                    dnm: isdDoc.num,
                    dt: isdDoc.dt,
                    igst: isdDoc.igst,
                    cgst: isdDoc.cgst,
                    sgst: isdDoc.sgst,
                    cess: isdDoc.cess,
                    dtaxprd: isdDoc.dtaxprd,
                    isamnd: isdDoc.isamended,
                    itc_prd: fileData.rtnprd
                };
            }
                dataarr.push(data);                                     
        }
        logger.log("debug","Exiting anx2Dao.js :: createisdc");
        return dataarr;

       }

    /**
     *this method saves the data of all tables and stores in promiseArr
     * @param {*} fileData
     * @param {*} db
     */
    function dataloops(fileData,db) {
        logger.log("info","Entering anx2Dao.js :: dataloops");
        let promiseArr=[];
        let itemarr=[];
        logger.log("debug","Inside dataloops ");

        return new Promise(function (resolve, reject) {
            if (fileData.b2b != null && fileData.b2b != undefined) {
                let arr=createb2b(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.b2b.insertFileData,arr[0],db));
                promiseArr.push(dbcon.saveArrays(query.anx2.items.insertItemData,arr[1],db));
            }
            if (fileData.sezwp != null && fileData.sezwp != undefined) {
                let arr=createsezwp(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.sezwp.insertFileData,arr[0],db));
                promiseArr.push(dbcon.saveArrays(query.anx2.items.insertItemData,arr[1],db));
            }
            if (fileData.sezwop != null && fileData.sezwop != undefined) {
                let arr=createsezwop(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.sezwop.insertFileData,arr[0],db));
                promiseArr.push(dbcon.saveArrays(query.anx2.items.insertItemData,arr[1],db));
            }
            if (fileData.de != null && fileData.de != undefined) {
                let arr=createde(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.de.insertFileData,arr[0],db));
                promiseArr.push(dbcon.saveArrays(query.anx2.items.insertItemData,arr[1],db));
            }
            if (fileData.isdc != null && fileData.isdc != undefined) {
                let arr=createisdc(fileData);
                promiseArr.push(dbcon.saveArrays(query.anx2.isdc.insertFileData,arr,db));
            }
            else{
                logger.log("debug","No data for insert");
            }
            Promise.all(promiseArr)
            .then((result)=>{
                resolve("update done"),
                logger.log("info","Exiting anx2Dao.js :: dataloops");
            })
            .catch((error)=>reject("error occured while saving"))
        })
    }  
/**
 *calculates and returns total taxvalue,total igst,total csgst,total sgst,total cess
 * @param {*} items
 * @param {*} docref
 * @param {*} rtnprd
 */
function createItem(items,docref,rtnprd) {
        let itemarr=[];
        logger.log("debug","Entering anx2Dao.js :: createItem");
        let tot_txval = 0;
        let tot_igst = 0;
        let tot_cgst = 0;
        let tot_sgst = 0;
        let tot_cess = 0;
        let itemobj={};
        for (let i = 0; i < items.length; i++) {
            //for item level details array
            itemobj={};
            itemobj.hsn=items[i].hsn?items[i].hsn:null;
            itemobj.rate=items[i].rate?items[i].rate:0;
            itemobj.txval=items[i].txval?items[i].txval:0;
            itemobj.igst=items[i].igst?items[i].igst:null;
            itemobj.cgst=items[i].cgst?items[i].cgst:null;
            itemobj.sgst=items[i].sgst?items[i].sgst:null;
            itemobj.cess=items[i].cess?items[i].cess:null;
            itemobj.itcprd=rtnprd;
            itemobj.docref=docref;
            itemarr.push(itemobj);
            //for calculating total
            tot_txval+=items[i].txval;
            tot_cgst+= items[i].cgst!=undefined ?items[i].cgst:0;
            tot_igst+= items[i].igst!=undefined ?items[i].igst:0;
            tot_sgst+= items[i].sgst!=undefined ?items[i].sgst:0;
            tot_cess+= items[i].cess!=undefined ?items[i].cess:0;
        }
        logger.log("debug","Exiting anx2Dao.js :: createItem");
        return [{ tot_txval, tot_igst, tot_cgst, tot_sgst, tot_cess },itemarr];
    }

/**
 * @param {*} gstin
 * @param {*} rtnprd
 */
function deleteNrmTableData(gstin,rtnprd,fp,taxperiod,matchflg){
    logger.log("info","Entering anx2Dao.js :: deleteNrmTableData");
    let promiseArr=[];
    return new Promise(function(resolve,reject){
    connectDb(gstin);
    db.serialize(()=>{
    db.exec('BEGIN TRANSACTION;');
    if(matchflg=='N'){
        promiseArr.push(dbcon.update(query.profile.updateMatchStatus,[matchflg,gstin,fp,taxperiod],OFFLINE_TOOL_DB,undefined));
    }
        promiseArr.push(dbcon.deleteData(query.anx2.b2b.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.sezwop.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.sezwp.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.de.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.isdc.deleteAll,[rtnprd],db));
        //once all 4 tables deleted , then delete item details
        Promise.all(promiseArr).then(
        ()=>{
                dbcon.deleteData(query.anx2.items.deletenotreq,[rtnprd],db)
                .then(()=>{
                    db.exec('COMMIT;');db.close();
                    logger.log("info","Exiting anx2Dao.js :: deleteNrmTableData");
                    resolve();
                })
                .catch(()=>{
                    db.exec('ROLLBACK;');db.close();reject();})                
        }).catch(()=>reject())
    })})
}
/**
 *deletes Error table data
 * @param {*} gstin
 * @param {*} rtnprd
 */
function deleteErrTableData(gstin,rtnprd){
    logger.log("info","Entering anx2Dao.js :: deleteErrTableData");
    let promiseArr=[];
    return new Promise(function(resolve,reject){
    connectDb(gstin);
    db.serialize(()=>{
    db.exec('BEGIN TRANSACTION;');
        promiseArr.push(dbcon.deleteData(query.anx2.b2b.errdeleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.sezwop.errdeleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.sezwp.errdeleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.de.errdeleteAll,[rtnprd],db));
      
        //once all 4 tables deleted , then delete item details
        Promise.all(promiseArr).then(
        ()=>{
                dbcon.deleteData(query.anx2.items.deletenotreq,[rtnprd],db)
                .then(()=>{
                    db.exec('COMMIT;');db.close();
                    logger.log("info","Exiting anx2Dao.js :: deleteErrTableData");
                    resolve();
                })
                .catch(()=>{
                    db.exec('ROLLBACK;');db.close();reject();})
                }).catch(()=>reject())
    })})
}

/**
 *method to remove records from all the tables
 * @param {*} db
 * @param {*} rtnprd
 */
function deleteAllTableData(db,rtnprd){
    logger.log("info","Entering anx2Dao.js :: deleteAllTableData");
    let promiseArr=[];
    return new Promise(function(resolve,reject){
        promiseArr.push(dbcon.deleteData(query.anx2.items.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.b2b.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.sezwop.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.sezwp.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.de.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.anx2.isdc.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteMrSumm,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteB2bSumm,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteSezwpSumm,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteSezwopSumm,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteDeSumm,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteProgressSumm,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deleteMrDetails,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.mrSummary.deletePrError,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.prDetails.deleteAll,[rtnprd],db));
        promiseArr.push(dbcon.deleteData(query.matchingTables.prDetailSummary.deleteAll,[rtnprd],db));

        logger.log("info","Exiting anx2Dao.js :: deleteAllTableData"); 
        Promise.all(promiseArr).then(
                ()=>resolve())
                .catch((err)=>reject(err))
    })
}

    /**
     *this method creates db connection and gives count of file data
     * @param {*} itcprd
     * @param {*} gstin
     * @param {*} iserractn
     */
    function getDataCount(itcprd,gstin,iserractn){
        logger.log("info","Entering anx2Dao.js :: getDataCount");
        let data = {};
        return new Promise(function (resolve, reject) {
            return new Promise(function (resolve, reject) {
                let queries={};

                if(iserractn=='Y'){
                    queries['b2b']=`${query.anx2.b2b.count} AND ERROR_CODE IS NOT NULL OR FLG='X'`;
                    queries['sezwp']=`${query.anx2.sezwp.count}AND ERROR_CODE IS NOT NULL   OR FLG='X'`;
                    queries['sezwop']=`${query.anx2.sezwop.count}AND ERROR_CODE IS NOT NULL   OR FLG='X'`;
                    queries['de']=`${query.anx2.de.count}AND ERROR_CODE IS NOT NULL   OR FLG='X'`;
                }
                else{
                    queries['b2b']=`${query.anx2.b2b.count}   AND FLG<>'X'`;
                    queries['sezwp']=`${query.anx2.sezwp.count}   AND FLG<>'X'`;
                    queries['sezwop']=`${query.anx2.sezwop.count}   AND FLG<>'X'`;
                    queries['de']=`${query.anx2.de.count}   AND FLG<>'X'`;
                }

                dbcon.getCount(queries.b2b,[itcprd],gstin).then((result)=>{
                    data[anx2const.FLAG_3B] = result == 0 ? false:true;
                    dbcon.getCount(queries.sezwp,[itcprd],gstin).then((result)=>{
                        data[anx2const.FLAG_3E] = result == 0 ? false:true;
                        dbcon.getCount(queries.sezwop,[itcprd],gstin).then((result)=>{
                            data[anx2const.FLAG_3F] = result == 0 ? false:true;
                            dbcon.getCount(queries.de,[itcprd],gstin).then((result)=>{
                                data[anx2const.FLAG_3G] = result == 0 ? false:true;
                                if(iserractn=='N'){
                                dbcon.getCount(query.anx2.isdc.count,[itcprd],gstin).then((result)=>{
                                    data[anx2const.FLAG_5] = result == 0 ? false:true;
                                    resolve(data);
                                }).catch(err=>{reject(err)})
                                }
                                else  resolve(data);
                                }).catch((err)=>{
                                    reject(err);
                                })
                            }).catch((err)=>{
                                reject(err);
                            })
                        }).catch((err)=>{
                            reject(err);
                        })
                    }).catch((err)=>{
                        reject(err);
                    })
            }).then((data) => {
                logger.log("debug","Got File count");
                logger.log("info","Exiting anx2Dao.js :: getDataCount");
                resolve(data);
            }).catch((err) => {
                logger.log("error"," anx2Dao.js :: getDataCount :: Error occured while fetching data :: %s", err);
                reject(err);
            });
        }
    );
    }
    /**
     *this method fetches hsn data
     * @param {*} itemref
     * @param {*} itcperiod
     * @param {*} gstin
     */
    function gethsndata  (itemref,itcperiod,gstin) {
        logger.log("info","Entering anx2Dao.js :: gethsndata");
         return new Promise(function (resolve, reject) {
                 return dbcon.fetchAllById(query.anx2.items.getData,[itemref,itcperiod],gstin)
                 .then((rows,err) => {
                    if(err){
                        logger.log("error ::%s",err);
                        reject({error:err,statusCd: STATUS_CD_ZERO});
                    }
                    else {
                        if (rows === undefined) {
                        logger.log("info","Exiting anx2Dao.js :: gethsndata");
                          resolve("{}");
                        } else {
                        logger.log("info","Exiting anx2Dao.js :: gethsndata");
                          resolve(rows);
                        }
                      }
                    }).catch((err) => {
                      logger.log("error ::%s " , err);
                      reject({ error: err, statusCd: STATUS_CD_ZERO })
                    });
                });
    }  
    /**
     *on clicking confirm button,this method saves the action confirmed to database and updates the actiontaken column
     * @param {*} req
     */
    function saveActionData(req) {
        logger.log("info","Entering anx2Dao.js ::  saveActionData");
        let gstin=req.query.gstin;
        let tablename=req.query.tablename;
        let data=req.body;
        let quer;
        let promarr = [], mrSaveData = [];
        return new Promise(function (resolve, reject) {
            quer=eval('query.anx2.'+tablename+'.saveAction');
            PRSaveQuery = query.matchingTables.takeAction.saveActionMR;
            connectDb(gstin);
            db.serialize(()=>{
            return new Promise(function (resolve, reject) {
                db.exec('BEGIN TRANSACTION;');
                promarr.push(dbcon.saveArrays(quer,data,db));
                for(let obj of data){
                    let mrObject = {
                        "action_taken": obj.actionselected ? obj.actionselected : obj.action,
                        "action": getAction(obj.actionselected ? obj.actionselected : obj.action),
                        "itc": obj.IS_ITC_ENTL ? obj.IS_ITC_ENTL : obj.itcent,
                        "docref": obj.docref ? obj.docref : obj.doc,
                        "rtnprd": obj.docref ? obj.docref.split("|")[3] : obj.doc.split("|")[3]
                    };
                    mrSaveData.push(mrObject);
                }
                promarr.push(dbcon.saveArrays(PRSaveQuery,mrSaveData,db));
                Promise.all(promarr).then(()=>resolve(),(err)=>reject(err))
            }).then((result) => {
                db.exec('COMMIT;');
                db.close();
                logger.log("debug","Inside commit", result);
                logger.log("info","Exiting anx2Dao.js :: saveActionData");
                resolve("done");
            }).catch((err) => {
                logger.log("error"," anx2Dao.js :: saveActionData :: Error occured while processing take action :: %s", err);
                db.exec('ROLLBACK');
                db.close();
                logger.log("debug","Rollback Done");
                reject(err);
            });
        })});
    }

    function getAction(actionCode){
        if(actionCode == "P"){
            return "Pending";
        } else if (actionCode == "R"){
            return "Rejected";
        } else if(actionCode == "A"){
            return "Accepted";
        }
    }
    
 
    /**
     *This method gives table summary based on GSTIN and on the action taken
     * @param {*} req
     * @param {*} res
     */
    function getTabsummary  (req, res) {
        logger.log("info","Entering anx2Dao.js ::getTabsummary");    
       let tab=req.query.tblnm; 
       let gstin=req.query.gstin;
       let rtnprd=req.query.rtnprd;
       let iserractn=req.query.iserractn;
       logger.log("debug","Inside get table summary Data for table:: %s"+tab);
       let data = {};
      return new Promise((resolve,reject)=>{
	  if(iserractn=='Y'){
	  queryA='query.anx2.'+tab+'.acceptErrCount';
	  queryR='query.anx2.'+tab+'.rejectErrCount';
	  queryP='query.anx2.'+tab+'.pendingErrCount';
	  
	  }
	  else{
	  queryA='query.anx2.'+tab+'.acceptCount';
	  queryR='query.anx2.'+tab+'.rejectCount';
	  queryP='query.anx2.'+tab+'.pendingCount';
	  }
	       dbcon.fetchAllById(eval(queryA),[rtnprd],gstin).then((result)=>{
	           data[anx2const.ACTN_ACCEPT] = null!=result && undefined !=result ? result:'';
	           dbcon.fetchAllById(eval(queryR),[rtnprd],gstin).then((result)=>{
		           data[anx2const.ACTN_REJECT] = null!=result && undefined !=result ? result:'';
		           dbcon.fetchAllById(eval(queryP),[rtnprd],gstin).then((result)=>{
			           data[anx2const.ACTN_PENDING] = null!=result && undefined !=result ? result:'';
                           logger.log("debug"," Resolving Table Summary Data");
                           logger.log("info","Exiting anx2Dao.js ::getTabsummary");  
                           console.log("data",data);
                           resolve(data);
	               }).catch((err)=>{
	                   reject(err);
	               })
	           }).catch((err)=>{
	               reject(err);
	           })
	       }).catch((err)=>{
	           logger.log("error"," anx2Dao.js ::getTabsummary :: error occured while fetching Table Summary:: %s",err);
	           reject(err);
	       })
	
	   })
   
    }; 
    /**
     *fetches all the items matching the query and resolves it
     * @param {*} req
     * @param {*} res
     */
    function getProfileData(req, res){
    	logger.log("info","Entering anx2Dao.js ::getProfileData");  
    	let gstin=req.query.gstin;
    	return new Promise(function(resolve,reject){
	    	dbcon.fetchAllById(exportCsvQuery.userProfile,[gstin],OFFLINE_TOOL_DB).then((result)=>{
	    		logger.log("info","Exiting anx2Dao.js ::getProfileData");
	    		resolve(result);
	    	}).catch((err)=>{
	    		logger.log("error"," anx2Dao.js ::exportCsv :: error occured while fetching summary :: %s",err);
	            reject(err);
	        })
    	 })
    }
    /**
     *to export details to Csv file
     * @param {*} req
     * @param {*} res
     * @param {*} type
     */
    function exportCsv(req, res, type) {
        logger.log("info","Entering anx2Dao.js ::exportCsv");   
        let gstin=req.query.gstin;
        let rtnprd=req.query.rtnprd;
        return new Promise(function(resolve,reject){
            let quer;
            logger.log("info","type is :: %s",type)
            if (type == anx2const.TABLE_AOISB2B) {
                quer = exportCsvQuery.b2bData;
            } else if (type == anx2const.TABLE_SEZWP) {
                quer = exportCsvQuery.sezwpData;
            } else if (type == anx2const.TABLE_SEZWOP) {
                quer = exportCsvQuery.sezwopData;
            } else if (type == anx2const.TABLE_DE) {
                quer =exportCsvQuery.deData;
            } else if (type == anx2const.TABLE_ISD) {
             	quer = exportCsvQuery.isdcData;
            }
            dbcon.fetchAllById(quer,[rtnprd],gstin).then((result)=>{
                logger.log("info","Exiting anx2Dao.js ::exportCsv");
                resolve(result);
            }).catch((err)=>{
            	logger.log("error"," anx2Dao.js ::exportCsv :: error occured while fetching summary :: %s",err);
                reject(err);
            })
     
        })
           
    };
    /**
     *This method fetches data for dashboardsummary, table4 and draftreturn options
     * @param {*} req
     * @param {*} tab
     */
    function getSummryData  (req, tab) {
        logger.log("info","Entering anx2Dao.js ::getSummryData");
        let gstin=req.query.gstin;
        let rtnprd=req.query.rtnprd;
        logger.log("debug","Inside get summary Data:"+tab);
        let data = {};
       return new Promise((resolve,reject)=>{
            dbcon.fetchAllById(eval('query.anx2.'+tab+'.dashSummA'),tab=='sezwop'?[rtnprd,rtnprd]:[rtnprd],gstin).then((result)=>{
                if(result!='' && result!=null && result!=undefined)
                    data.accept = result[0];
                dbcon.fetchAllById(eval('query.anx2.'+tab+'.dashSummR'),tab=='sezwop'?[rtnprd,rtnprd]:[rtnprd],gstin).then((result)=>{
                    if(result!='' && result!=null && result!=undefined)
                        data.reject = result[0];
                    dbcon.fetchAllById(eval('query.anx2.'+tab+'.dashSummP'),tab=='sezwop'?[rtnprd,rtnprd]:[rtnprd],gstin).then((result)=>{
                        if(result!='' && result!=null && result!=undefined)
                             data.pending = result[0];
                            logger.log("debug","Resolving Dashboard Summary Data");
                            logger.log("info","Exiting anx2Dao.js ::getSummryData");
                            resolve(data);
                    }).catch((err)=>{
                        reject(err);
                    })
                }).catch((err)=>{
                    reject(err);
                })
            }).catch((err)=>{
                logger.log("error","anx2Dao.js ::getSummryData :: error occured while fetching summary data :: %s",err);
                reject(err);
            })
     
        })
    
           
     };
     /**
      *This method gives the table summary for table5 alone
      * @param {*} req
      * @param {*} res
      */
     function getIsdTabsummary  (req, res) {
         logger.log("info","Entering anx2Dao.js ::getIsdTabsummary");
        let gstin=req.query.gstin;
        let rtnprd=req.query.rtnprd;
        logger.log("debug","Inside get summary Data for table:ISDC");
        let data = {};
       return new Promise((resolve,reject)=>{
            dbcon.fetchAllById(query.anx2.isdc.iCount,[rtnprd],gstin).then((result)=>{
                data = null!=result && undefined !=result ? result:'';
                            logger.log("debug","Resolving Summary Data for table:ISDC");
                            logger.log("info","Exiting anx2Dao.js ::getIsdTabsummary");
                            resolve(data);
                    }).catch((err)=>{
                        logger.log("error"," anx2Dao.js ::getIsdTabsummary :: error occured while fetching summary :: %s",err);
                        reject(err);
                    }) 
                 
        })
    
     }; 
     /**
      *This method fetches the dashboard summary data for table5
      * @param {*} req
      * @param {*} res
      */
     function getIsdDashSummary  (req, res) {
         logger.log("info","Entering anx2Dao.js :: getIsdDashSummary");
         let gstin=req.query.gstin;
         let rtnprd=req.query.rtnprd;
         logger.log("debug","Inside get dashboard summary data for table:ISDC");
         let data = {};
        return new Promise((resolve,reject)=>{
             dbcon.fetchAllById(query.anx2.isdc.dashSumm,[rtnprd,rtnprd],gstin).then((result)=>{
                 data = null!=result && undefined !=result ? result[0]:'';
                             logger.log("debug","Resolving dashboard Summary data for table:ISDC");
                             logger.log("info","Exiting anx2Dao.js :: getIsdDashSummary");
                             resolve(data);
                     }).catch((err)=>{
                         logger.log("error","anx2Dao.js :: getIsdDashSummary :: error occured while fetching summary :: %s",err);
                         reject(err);
                     }) 
                  
         })
     
      }; 
    
      /**
       *This method fetches the data by applying filter on actiontaken and tablename provided
       * @param {*} req
       * @param {*} res
       */
      function getDataWithActn (req, res) {
          logger.log("info","Entering anx2Dao.js :: getDataWithActn");
        return new Promise(function (resolve, reject) {
            let que ='';
            let tablename= req.query.tblnm;
            let actn = req.query.actn;
            let view = req.query.view;
            let retprd = req.query.rtnprd;
            let iserractn=req.query.iserractn;
            let tab = '';
            logger.log("debug","Inside get Document Data with Action for table:: %s",tablename)
            switch(tablename){
                case anx2const.TABLE_B2B:
                    tab = 'ANX2_3AB';
                break;
                case anx2const.TABLE_SEZWP:
                    tab = 'ANX2_3AE';
                break;
                case anx2const.TABLE_SEZWOP:
                    tab = 'ANX2_3AF';
                break;
                case anx2const.TABLE_DE:
                    tab = 'ANX2_3AG';
                break;
            }
            que = "SELECT * from "+tab+" where (ACTION_TAKEN = '"+actn+"' OR ((ACTION_TAKEN IS NULL OR ACTION_TAKEN IN ('','S')) and PORTAL_STAT IN ("+(actn=='A'?"'','A'":"'"+actn+"'")+"))) and ITC_PERIOD='"+retprd+"'"
            iserractn=='Y'?(que=`${que} AND FLG='X'`):(que=`${que} AND FLG<>'X'`) ;
            if(view == anx2const.VIEW_CP){
                que = que + " ORDER BY LOWER(TRDNAME),strftime('%s',substr(S_TAXPERIOD,3,4)||'-'||substr(S_TAXPERIOD,1,2)||'-01'), strftime('%s',substr(DOCDATE,7,4)||'-'||substr(DOCDATE,4,2)||'-'||substr(DOCDATE,1,2)), DOCNUM";
            }else if(view == anx2const.VIEW_DOC){
                que = que + " ORDER BY LOWER(TRDNAME), strftime('%s',substr(DOCDATE,7,4)||'-'||substr(DOCDATE,4,2)||'-'||substr(DOCDATE,1,2)), DOCNUM";
            }
            logger.log("info","Exiting anx2Dao.js :: getDataWithActn");
            dbcon.fetchAll(que,req.query.gstin).then((result)=>{
                resolve(result);
            }).catch((err)=>{
                reject(err);
            })    
        });
    }
    
   
/**
     *this method creates db connection and gives count of table wise data
     * @param {*} docref
     * @param {*} gstin
     * @param {*} itcprd
     * @param {*} tablename
     */
function getRecordCount(docref, gstin, itcprd, tablename,docrefcount) {
    logger.log("info", "Entering anx2Dao.js :: getRecordCount DocRef Count",docref,docrefcount);
    let dataCount = {};
    let formquery;
    return new Promise(function (resolve, reject) {
        formquery=eval('query.anx2.'+tablename+'.getRecordCount');
        formquery=formquery+itcprd+"' AND DOCREF IN ";
        if(docrefcount == 1){
            formquery= formquery+"(?)"
        }else{
            formquery= `${formquery} ( ${docref.map(function(){ return '?' }).join(',')} )`
        }
        
        dbcon.getCount(formquery, docref, gstin).then((result) => {
            if (tablename == 'b2b') {
                dataCount[anx2const.TABLE_B2B] = result;
                logger.log("debug", "Got Record Count",dataCount[anx2const.TABLE_B2B]);
            } else if (tablename == 'sezwp') {
                dataCount[anx2const.TABLE_SEZWP] = result;
                logger.log("debug", "Got Record Count",dataCount[anx2const.TABLE_SEZWP]);
            }
            else if (tablename == 'sezwop') {
                dataCount[anx2const.TABLE_SEZWOP] = result;
                logger.log("debug", "Got Record Count",dataCount[anx2const.TABLE_SEZWOP]);
            }
            else if (tablename == 'de') {
                dataCount[anx2const.TABLE_DE] = result;
                logger.log("debug", "Got Record Count",dataCount[anx2const.TABLE_DE]);
            }
            //logger.log("debug", "Got Record Count");
            resolve(dataCount);
        }).catch((err) => {
            logger.log("error"," anx2Dao.js :: getRecordCount :: Error occured while fetching data :: %s", err);
            reject(err);
        })
        logger.log("info", "Exiting anx2Dao.js :: getRecordCount");
    })
}
function getErrDashSummryData  (req, tab) {
    logger.log("info","Entering anx2Dao.js ::getErrdashSummryData");
    let gstin=req.query.gstin;
    let rtnprd=req.query.rtnprd;
    logger.log("debug","Inside get Errdashsummary Data:"+tab);
    let data = {};
    return new Promise((resolve,reject)=>{
        dbcon.fetchAllById(eval('query.anx2.'+tab+'.dasherrorCount'),[rtnprd],gstin).then((result)=>{
            if(result!='' && result!=null && result!=undefined)
                data.dasherrorCount = result[0];
            dbcon.fetchAllById(eval('query.anx2.'+tab+'.dashcrtrecCount'),[rtnprd],gstin).then((result)=>{
                if(result!='' && result!=null && result!=undefined)
                    data.dashcrtrecCount = result[0];
                        logger.log("debug","Resolving Dashboard Summary Data");
                        logger.log("info","Existing anx2Dao.js ::getErrdashSummryData");
                        console.log(data,"data");
                        resolve(data);
            }).catch((err)=>{
                reject(err);
            })
        }).catch((err)=>{
            logger.log("error","anx2Dao.js ::getErrdashSummryData :: error occured while fetching summary data :: %s",err);
            reject(err);
        })
 
    })
   
};


module.exports = {
    persistData:persistData,
    getData:getData,
    getDataCount:getDataCount,
    gethsndata:gethsndata,
    saveActionData:saveActionData,
    getTabsummary:getTabsummary,
    exportCsv:exportCsv,
    gettb5Data:gettb5Data,
    getSummryData:getSummryData,
    getIsdTabsummary:getIsdTabsummary,
    getIsdDashSummary:getIsdDashSummary,
    getDataWithActn:getDataWithActn,
    getProfileData:getProfileData,
    deleteErrTableData:deleteErrTableData,
    deleteNrmTableData:deleteNrmTableData,
    getRecordCount:getRecordCount,
    getErrDashSummryData:getErrDashSummryData

};