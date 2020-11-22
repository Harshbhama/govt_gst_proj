const jsonsize=require('json-size');
const fs = require('fs');
const path=require('path');
const archiver = require('archiver');
var taxperiod,fyear,rtnprd,gstin;
const log  = require('../../utility/logger.js');
const logger = log.logger;
var constant = require('../../utility/constants.js');
var anx2const = require('../../utility/anx2Constant.js');


/* This method will return an array of arrays consisting of elements divided based on the chunksize*/
Object.defineProperty(Array.prototype, anx2const.CHUNK, {
    value: function(noofChunks){
        var temporal = [];
        let chunkSize=Math.ceil(this.length/noofChunks);
        for (var i = 0; i < this.length; i+= chunkSize){
            temporal.push(this.slice(i,i+chunkSize));
        }
        logger.log("debug",'Entered chunkService.js :: defineProperty :: temporal :: %s' ,temporal);        
        return temporal;
    }
  });

/**
 *the method to chunk the gen obj
 * @param {*} dtfromgenJson
 */
  function chunkJson(dtfromgenJson){
       logger.log("info","Entering anx2Chunk.js :: chunkJson");
        taxperiod=dtfromgenJson[anx2const.TAX_PERIOD];
        fyear=dtfromgenJson[anx2const.FIN_YEAR];
        rtnprd=dtfromgenJson[anx2const.RTN_PERIOD];
        gstin=dtfromgenJson[anx2const.GSTIN];
        res=dtfromgenJson[anx2const.RES];
        let sizeofJson=dtfromgenJson[anx2const.JSON_SIZE];
        let max_size=dtfromgenJson[anx2const.MAX_SIZE];
        let noOfFiles=Math.ceil((sizeofJson/max_size));//calc no of files
        logger.log("debug","Number of files :: %s",noOfFiles);
        let genJsonObj={};
        let jsonkeys=[anx2const.TABLE_B2B,anx2const.TABLE_SEZWP,anx2const.TABLE_SEZWOP,anx2const.TABLE_DE];
        let cummArr=[];//create an array of the table data received
        cummArr.push(dtfromgenJson[anx2const.TABLE_B2B]);cummArr.push(dtfromgenJson[anx2const.TABLE_SEZWP
        ]);cummArr.push(dtfromgenJson[anx2const.TABLE_SEZWOP]);cummArr.push(dtfromgenJson[anx2const.TABLE_DE]);
        return new Promise(function(resolve,reject){
            for(let key of cummArr){
                let retarr=key.chunk(noOfFiles);//chunk the arr based on no of files
                for(let i=0;i<retarr.length;i++){
                    //initialize the object if undefined
                    if(!genJsonObj[i+1]){
                        genJsonObj[i+1]={};
                    }
                    //for each chunk get the formatted array and store
                    genJsonObj[i+1][jsonkeys[0]]=[]; 
                    genJsonObj[i+1][jsonkeys[0]]=eval('format' +jsonkeys[0])(retarr[i]);
                }
                jsonkeys.shift();
            }
            logger.log("info","Exiting anx2Chunk.js :: chunkJson");
            resolve();
        }).then(()=>createfiles(genJsonObj,res)) 
}


/**
 *to get the data for all the tables and return in req format
 * @param {*} data
 */
function formatb2b(data){
    logger.log("info","Entering anx2Chunk.js :: formatB2b");
            let rtnarr=[];
            let docgrp={};
            let gstinKeys={};
            //groupby gstin;
    for (let row of data) {

        docgrp[row.DOCREF] = row;

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
               logger.log("info","Exiting anx2Chunk.js :: formatB2b");
               return rtnarr;
    
}
/**
 *to get the data for all the tables and return in req format
 * @param {*} data
 */
function formatsezwp(data){
    logger.log("info","Entering anx2Chunk.js :: formatsezwp");
            let rtnarr=[];
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
               logger.log("info","Exiting anx2Chunk.js :: formatsezwp");
               return rtnarr//return grouped arr and org data from table  
     
}
/**
 *to get the data for all the tables and return in req format
 * @param {*} data
 */
function formatsezwop(data){
    logger.log("info","Entering anx2Chunk.js :: formatsezwop");
    let rtnarr=[];
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
               logger.log("info","Exiting anx2Chunk.js :: formatsezwop");
               return rtnarr;//return grouped arr and org data from table  
   
}
/**
 *to get the data for all the tables and return in req format
 * @param {*} data
 */
function formatde(data){
    logger.log("info","Entering anx2Chunk.js :: formatDE");
    let rtnarr=[];

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
               logger.log("info","EXITINH anx2Chunk.js :: formatDE");
               return rtnarr//return grouped arr and org data from table  
}
/**
 *function to write files
 * @param {*} genJsonObj
 * @param {*} res
 */
    function createfiles(genJsonObj,res){
        logger.log("info","Entering anx2Chunk.js :: createfilesat : %s  ::  %s", new Date().getTime(), new Date().toString());
        var filenamelist=[];
        let filelength=Object.keys(genJsonObj).length;
        let start=1;
        Object.keys(genJsonObj).forEach(
            key=>{
                genJsonObj[key] ={"gstin":gstin,"rtnprd":rtnprd,'chunknum':`${start}`,'islastchunk':start==filelength?'Y':'N',...genJsonObj[key]};
                logger.log("debug","before stringify :: %s",jsonsize(genJsonObj[key]));
                let strinObj=JSON.stringify(genJsonObj[key],null,4);
                logger.log("debug","after stringify :: %s",jsonsize(strinObj));
                try{
                    let filename=`json/anx2Jsons/${taxperiod.toUpperCase()}_${fyear}_${gstin}_${key}_ANX2.json`;
                    let filepath=path.resolve(filename); 
                    fs.writeFileSync(filepath,strinObj);
                    filenamelist.push(filename)
                }
                catch(error){
                    logger.log("error","anx2Chunk.js :: createfiles :: error in creating files ::%s",error);
                    res.set(500).send('Unable to generate Json');
                    return;
                }
                start++;
            }
        )
        let zipath;
        createzip(`json/anx2Jsons/${taxperiod.toUpperCase()}_${fyear}_${gstin}_ANX2.zip`,filenamelist).then(
            zippath=>{res.status(201).download(zippath),zipath=zippath}
        ).catch(()=>res.status(500).send('Unable to generate Json'))
    }
/**
 *creates zip and sends back the path
 * @param {*} zippath
 * @param {*} filenamelist
 */
    function createzip(zippath,filenamelist){
        logger.log("info","Entering anx2Chunk.js :: createzip");
        return new Promise((resolve, reject) => {
            var outputStream=fs.createWriteStream(zippath)
            var archive=archiver(anx2const.ZIP,{zlib:{level:9}});
            for(let file of filenamelist){
                archive.file(file,{name:file.substring(15)});
            }
            archive
                .on('error', err => reject(err))
                .pipe(outputStream);
                archive.finalize()
                .then(()=>outputStream.on(anx2const.CLOSE,() => { logger.log("info","Exiting anx2Chunk.js :: createzip"),resolve(zippath)}))
                .catch(()=>reject());
          });  
    }

    module.exports={
        chunkJson:chunkJson
    }