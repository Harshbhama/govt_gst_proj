const fs = require('fs');
const path=require('path');
const dbCon=require('../../db/dbUtil');
const {query}=require('../../db/queries');
const jsonsize=require('json-size');
const chunkService=require('./anx2Chunks');
const log = require('../../utility/logger.js');
const logger = log.logger;
var constant = require('../../utility/constants.js');
var anx2const = require('../../utility/anx2Constant.js');

/**
 *function to generate Json
 * @param {*} req
 * @param {*} res
 */
function generateJson(req,res){
    logger.log("info","Entering generateanx2json.js :: generateJson");
    let genJsonObj={}
    let gstin=req.query.gstin || null;
    let rtnprd = req.query.rtnprd || null;
    let fp = req.query.fp || null;
    let taxperiod = req.query.taxperiod || null;
    let iserr=req.query.iserractn;
    let promiseArray=[];
    let max_size=5138030; // set the max size of chunk as 4.9MB
    let sizeofJson,b2b,sezwop,sezwp,de;
    promiseArray.push(getB2BData(rtnprd,gstin,iserr))
    promiseArray.push(getSEZWPData(rtnprd,gstin,iserr))
    promiseArray.push(getSEZWOPData(rtnprd,gstin,iserr))
    promiseArray.push(getDEData(rtnprd,gstin,iserr))
    Promise.all(promiseArray).then(
       (arr)=>{ genJsonObj.gstin=gstin,
        genJsonObj.rtnprd=rtnprd,
        (arr[0][0].length>0?genJsonObj.b2b=arr[0][0]:''),b2b=arr[0][1],//store ret data for curr use and chunk use
        (arr[1][0].length>0?genJsonObj.sezwp=arr[1][0]:''),sezwp=arr[1][1],
        (arr[2][0].length>0?genJsonObj.sezwop=arr[2][0]:''),sezwop=arr[2][1],
        (arr[3][0].length>0?genJsonObj.de=arr[3][0]:''),de=arr[3][1]
       }
    ).catch((err)=>{err==='errnotcrctd'?res.status(500).send('There are some error(s) in few table(s). Please correct the errors before generating JSON file.')
                    :res.status(500).send('JSON cannot be generated as no change has been made in the JSON file downloaded from the portal and imported into the offline tool.')})
    .then(
        fulfilled=>{ 
            if ((genJsonObj.b2b ==undefined || genJsonObj.b2b.length==0) && (genJsonObj.sezwop ==undefined || genJsonObj.sezwop.length==0) && (genJsonObj.sezwp ==undefined || genJsonObj.sezwp.length==0) && (genJsonObj.de ==undefined || genJsonObj.de.length==0)  ){
            res.status(500).send('JSON cannot be generated as no change has been made in the JSON file downloaded from the portal and imported into the offline tool.');
            }
        else    {
                    let fyear=fp.substring(0,4)+'-'+fp.substring(7);
                    let stringifiedObj=JSON.stringify(genJsonObj,null,4);
                    sizeofJson=jsonsize(stringifiedObj);
                    logger.log("debug","size with stringify before chunk :: %s",sizeofJson);
                    if(sizeofJson<=max_size){//check if stringified obj exceeds max size
                        try{
                            logger.log("debug","size without stringify before chunk :: %s",jsonsize(genJsonObj))
                            let filepath=path.resolve(`json/anx2jsons/${taxperiod.toUpperCase()}_${fyear}_${gstin}_ANX2.json`)
                            fs.writeFileSync(filepath,stringifiedObj);//write the stringified obj into the path
                            logger.log("info","Exiting generateanx2json.js :: generateJson");
                            res.status(200).download(filepath)
                        }
                        catch(error){
                            logger.log("error","generateanx2json.js :: generateJson :: error is ::%s",error)
                            res.set('Content-Type', 'text/plain');
                            res.status(500).send('Unable to generate Json');
                        }
                    }
                    else{
                        try{
                            let toChunk={'res':res,'tp':taxperiod,'fy':fyear,'rp':rtnprd,'gst':gstin,'ms':max_size,'sj':sizeofJson,'b2b':b2b,'sezwop':sezwop,'sezwp':sezwp,'de':de}
                            chunkService.chunkJson(toChunk);//create obj and send to chunk func  to create chunks
                            logger.log("info","Exiting generateanx2json.js :: generateJson");
                        }
                        catch(error){
                            logger.log("error"," generateanx2json.js :: generateJson :: error is ::%s",error)
                            res.set('Content-Type', 'text/plain');
                            res.status(500).send('Unable to generate Json');
                        }
                        }
                }
            })
        }

/**
 *to get the data for all the tables and return in req format
 * @param {*} rtnprd
 * @param {*} gstin
 */
function getB2BData(rtnprd,gstin,iserr){
    logger.log("info","Entering generateanx2json.js :: getB2BData");
    let sql=iserr=='Y'?query.anx2.b2b.getCrcErrData:query.anx2.b2b.getDataforJson;
    let rtnarr=[];
    return new Promise(function(resolve,reject){
    dbCon.fetchAllById(sql,[rtnprd],gstin).
        then(function(data){
            let docgrp={};
            let gstinKeys={};
            //groupby gstin;
            for(let row of data){
                docgrp[row.DOCREF]=row;
            }
            for(let doc of Object.keys(docgrp)){
                if(gstinKeys[docgrp[doc].STIN]){
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
                else{
                    gstinKeys[docgrp[doc].STIN]=[];
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
            }
            //create an array format to be returned
           Object.keys(gstinKeys).forEach(
               gstin=>{
                    let gstinobject={};
                    gstinobject.ctin=gstinKeys[gstin][0].STIN,
                    gstinobject.docs=[];
                    gstinKeys[gstin].forEach(doc=>{
                                        let tempdoc={};
                                        tempdoc.doctyp=doc.DOCTYPE===anx2const.DOCTYP_CN?anx2const.DOCTYP_C
                                        :(doc.DOCTYPE===anx2const.DOCTYP_DN?anx2const.DOCTYP_D:doc.DOCTYPE);
                                        tempdoc.action=doc.ACTION_TAKEN===anx2const.ACTN_RESET?anx2const.FLAG_N:doc.ACTION_TAKEN;
                                        tempdoc.chksum=doc.CHCKSUM;
                                        tempdoc.itcent=doc.IS_ITC_ENTL==anx2const.FLAG_N || doc.IS_ITC_ENTL==anx2const.FLAG_NY?anx2const.FLAG_N:doc.IS_ITC_ENTL==anx2const.FLAG_YN?anx2const.FLAG_Y:anx2const.FLAG_Y;
                                        tempdoc.doc={num:doc.DOCNUM,dt:doc.DOCDATE};
                                        gstinobject.docs.push(tempdoc);
                                        
                    })
                    rtnarr.push(gstinobject);
               })
               logger.log("info","Exiting generateanx2json.js :: getB2BData");
               resolve([rtnarr,data])//return grouped arr and org data from table  
        })})
}
/**
 *to get the data for all the tables and return in req format
 * @param {*} rtnprd
 * @param {*} gstin
 */
function getSEZWPData(rtnprd,gstin,iserr){
    logger.log("info","Entering generateanx2json.js :: getSEZWPData");
    let sql=iserr=='Y'?query.anx2.sezwp.getCrcErrData:query.anx2.sezwp.getDataforJson;
    let rtnarr=[];
    return new Promise(function(resolve,reject){
    dbCon.fetchAllById(sql,[rtnprd],gstin).
        then(function(data){
            let docgrp={};
            let gstinKeys={};
            //groupby gstin;
            for(let row of data){
                docgrp[row.DOCREF]=row; 
            };

            for(let doc of Object.keys(docgrp)){
                if(gstinKeys[docgrp[doc].STIN]){
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
                else{
                    gstinKeys[docgrp[doc].STIN]=[];
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
            }
            //create an array format to be returned
           Object.keys(gstinKeys).forEach(
               gstin=>{
                    let gstinobject={};
                    gstinobject.ctin=gstinKeys[gstin][0].STIN;
                    gstinobject.docs=[];
                    gstinKeys[gstin].forEach(doc=>{
                                        let tempdoc={};
                                        tempdoc.doctyp=doc.DOCTYPE===anx2const.DOCTYP_CN?anx2const.DOCTYP_C
                                        :(doc.DOCTYPE===anx2const.DOCTYP_DN?anx2const.DOCTYP_D:doc.DOCTYPE);
                                        tempdoc.action=doc.ACTION_TAKEN===anx2const.ACTN_RESET?anx2const.FLAG_N:doc.ACTION_TAKEN;
                                        tempdoc.chksum=doc.CHCKSUM;
                                        tempdoc.itcent=doc.IS_ITC_ENTL==anx2const.FLAG_N || doc.IS_ITC_ENTL==anx2const.FLAG_NY?anx2const.FLAG_N:doc.IS_ITC_ENTL==anx2const.FLAG_YN?anx2const.FLAG_Y:anx2const.FLAG_Y;
                                        tempdoc.doc={num:doc.DOCNUM,dt:doc.DOCDATE};
                                        gstinobject.docs.push(tempdoc);
                    })
                    rtnarr.push(gstinobject);
               })
               logger.log("info","Exiting generateanx2json.js :: getSEZWPData");
               resolve([rtnarr,data])//return grouped arr and org data from table  
        })})
}
/**
 *to get the data for all the tables and return in req format
 * @param {*} rtnprd
 * @param {*} gstin
 */
function getSEZWOPData(rtnprd,gstin,iserr){
    logger.log("info","Entering generateanx2json.js :: getSEZWOPData");
    let sql=iserr=='Y'?query.anx2.sezwop.getCrcErrData:query.anx2.sezwop.getDataforJson;
    let rtnarr=[];
    return new Promise(function(resolve,reject){
    dbCon.fetchAllById(sql,[rtnprd],gstin).
        then(function(data){
            let docgrp={};
            let gstinKeys={};
            //groupby gstin;
            for(let row of data){
                    docgrp[row.DOCREF]=row;
            };
            for(let doc of Object.keys(docgrp)){
                if(gstinKeys[docgrp[doc].STIN]){
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
                else{
                    gstinKeys[docgrp[doc].STIN]=[];
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
            }
            //create an array format to be returned
           Object.keys(gstinKeys).forEach(
               gstin=>{
                    let gstinobject={};
                    gstinobject.ctin=gstinKeys[gstin][0].STIN,
                    gstinobject.docs=[];
                    gstinKeys[gstin].forEach(doc=>{
                                        let tempdoc={};
                                        tempdoc.doctyp=doc.DOCTYPE===anx2const.DOCTYP_CN?anx2const.DOCTYP_C
                                        :(doc.DOCTYPE===anx2const.DOCTYP_DN?anx2const.DOCTYP_D:doc.DOCTYPE);
                                        tempdoc.action=doc.ACTION_TAKEN===anx2const.ACTN_RESET?anx2const.FLAG_N:doc.ACTION_TAKEN;
                                        tempdoc.chksum=doc.CHCKSUM;
                                        tempdoc.doc={num:doc.DOCNUM,dt:doc.DOCDATE};
                                        gstinobject.docs.push(tempdoc);
                    })
                    rtnarr.push(gstinobject);
               })
               logger.log("info","Exiting generateanx2json.js :: getSEZWPData");
               resolve([rtnarr,data])//return grouped arr and org data from table  
        })})
}
/**
 *to get the data for all the tables and return in req format
 * @param {*} rtnprd
 * @param {*} gstin
 */
function getDEData(rtnprd,gstin,iserr){
    logger.log("info","Entering generateanx2json.js :: getDEData");
    let sql=iserr=='Y'?query.anx2.de.getCrcErrData:query.anx2.de.getDataforJson;
    let rtnarr=[];
    return new Promise(function(resolve,reject){
    dbCon.fetchAllById(sql,[rtnprd],gstin).
        then(function(data){
            let docgrp={};
            let gstinKeys={};
            //groupby gstin;
            for(let row of data){
            docgrp[row.DOCREF]=row;
            };

            for(let doc of Object.keys(docgrp)){
                if(gstinKeys[docgrp[doc].STIN]){
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
                else{
                    gstinKeys[docgrp[doc].STIN]=[];
                    gstinKeys[docgrp[doc].STIN].push(docgrp[doc]);
                }
            }
            //create an array format to be returned
           Object.keys(gstinKeys).forEach(
               gstin=>{
                    let gstinobject={};
                    gstinobject.ctin=gstinKeys[gstin][0].STIN,
                    gstinobject.docs=[];
                    gstinKeys[gstin].forEach(doc=>{
                                        let tempdoc={};
                                        tempdoc.doctyp=doc.DOCTYPE===anx2const.DOCTYP_CN?anx2const.DOCTYP_C
                                        :(doc.DOCTYPE===anx2const.DOCTYP_DN?anx2const.DOCTYP_D:doc.DOCTYPE);
                                        tempdoc.action=doc.ACTION_TAKEN===anx2const.ACTN_RESET?anx2const.FLAG_N:doc.ACTION_TAKEN;
                                        tempdoc.chksum=doc.CHCKSUM;
                                        tempdoc.itcent=doc.IS_ITC_ENTL==anx2const.FLAG_N || doc.IS_ITC_ENTL==anx2const.FLAG_NY?anx2const.FLAG_N:doc.IS_ITC_ENTL==anx2const.FLAG_YN?anx2const.FLAG_Y:anx2const.FLAG_Y;
                                        tempdoc.doc={num:doc.DOCNUM,dt:doc.DOCDATE};
                                        gstinobject.docs.push(tempdoc);
                    })
                    rtnarr.push(gstinobject);
               })
               logger.log("info","Exiting generateanx2json.js :: getDEData");
               resolve([rtnarr,data])//return grouped arr and org data from table  
        })})
}

module.exports = {
    generateJson:generateJson,
}