/**
 *  @author:   Prakash Kaphle
 *  @created:   July 2019
 *  @description: Anx1 Offline utility
 *  @copyright: (c) Copyright by Infosys technologies
 *  @version (Beta)V1.0
 *  Last Updated:  Prakash Kaphle, Aug 07 2019
 **/
const fs = require("fs-extra");
const _ = require("lodash");
const path = require("path");
const Promise = require("bluebird");
const archiver = require('archiver');
const log = require('../utility/logger');
const logger = log.logger;
const constants = require('../utility/constants');
const omitEmpty = require('omit-empty');
const mkDirectory = require('mkdirp');
const jsonsize = require('json-size');
/* This method will return an array of arrays consisting of elements divided based on the chunksize*/
Object.defineProperty(Array.prototype, 'anx1_chunk', {
  value: function (chunkSize, key) {
    logger.log('info', 'Entered chunkService.js :: defineProperty');
    var temporal = [];
    for (var i = 0; i < this.length; i += chunkSize) {
      temporal.push(this.slice(i, i + chunkSize));
    }
    logger.log('debug', 'Entered chunkService.js :: defineProperty :: temporal :: %s', temporal);
    return temporal;
  }
});

/*this function clones the payload based on the number of files to be created */
function cloneObj(parentObj, noOfFiles) {
  logger.log('info', 'Entered chunkService.js :: cloneObj', new Date().getTime(), new Date().toString());
  let filGenArray = [];
  for (let index = 0; index < noOfFiles; index++) {
    if (null == parentObj || "object" != typeof parentObj) return obj;
    var childObj = parentObj.constructor();
    for (var attr in parentObj) {
      if (parentObj.hasOwnProperty(attr)) childObj[attr] = parentObj[attr];
    }
    filGenArray[index] = childObj;
  }
  logger.log('info', 'Exiting chunkService.js :: cloneObj', new Date().getTime(), new Date().toString());
  return filGenArray;

}
function splitDocLvl(inputArr,max_size,tableType){
let outputArr = [];
let resultantDoc=[];
let docArrSize=0;
let resultant_size=0;
inputArr.forEach(function(element){
  if(jsonsize(element)>max_size){
    let cnt=0;
    //get the count of the objects in doc level
    element.docs.forEach(function(itm){
      if(!itm.__proto__.__proto__){
       cnt++;
      }
     });
      docArrSize = Math.ceil(jsonsize(element)/max_size);
      resultant_size = Math.ceil(cnt/docArrSize);
        if(tableType.toLowerCase()!=='expwp' || tableType.toLowerCase()!=='expwop' || tableType.toLowerCase()!=='b2c' || tableType.toLowerCase()!=='imps'){
            resultantDoc = element.docs.anx1_chunk(resultant_size);
          }
    // else{
      //resultantDoc = element.items.anx1_chunk(docArrSize);
    // }
    for(var i = 0 ; i < docArrSize; i++){
      let clonedEle = _.cloneDeep(element)
        if(tableType.toLowerCase()!=='expwp' || tableType.toLowerCase()!=='expwop' || tableType.toLowerCase()!=='b2c' || tableType.toLowerCase()!=='imps'){
          clonedEle.docs = resultantDoc[0];
        }
       //else{
        //clonedEle.items = resultantDoc[0];
      //}
        outputArr.push(clonedEle);
        resultantDoc.shift();
    }
  }else{
    outputArr.push(element); 
  }
});
return outputArr;

}
/* The below function is used to chunk the final payload if the size greater than 5mb */
async function getChunkedData(input) {

  logger.log('info', 'Entered chunkService.js :: getChunkedData', new Date().getTime(), new Date().toString());
  let payloadObject = input.data;
  let targetObject = {};
  let tempArry = [];
  let arraySize = 0;
  let resultantArray = [];
  let sizeofJson = input.sizeofJson;
  let max_size = input.max_size;
  let number_of_files = Math.ceil((sizeofJson) / max_size);
  Object.keys(payloadObject).forEach(function (key) {
    logger.log('info', 'Entered chunkService.js :: getChunkedData :: cloning the json payload into a target object ', new Date().getTime(), new Date().toString());

    if (typeof payloadObject[key] !== 'object')
      targetObject[key] = payloadObject[key];

    else
      targetObject[key] = [];

  });

  let parentObj = await cloneObj(targetObject, number_of_files);
  return new Promise(function (resolve, reject) {


    Object.keys(payloadObject).forEach(function (key) {
      logger.log('info', 'Entered chunkService.js :: getChunkedData :: splitting the table data between payload object and target object', new Date().getTime(), new Date().toString());
      if (typeof payloadObject[key] == 'object') {
        let tableType = key;
        if (payloadObject[key] !== null && payloadObject[key] !== undefined && payloadObject[key] !== "") {
          tempArry = payloadObject[key];
          //console.log('tempArray',jsonsize(tempArry));
          // checking byte size for each section.
          if(jsonsize(tempArry)>max_size){
            tempArry = splitDocLvl(tempArry,max_size,tableType);
          }
          arraySize = Math.ceil((tempArry.length) / number_of_files);
          resultantArray = tempArry.anx1_chunk(arraySize, key);
          pushChunkData(resultantArray, parentObj, tableType);

        }
      }
    });
    resolve(parentObj);
    logger.log('info', 'Exiting chunkService.js :: getChunkedData', new Date().getTime(), new Date().toString());
  })
}
/*This function is used to push table wise chunked data */
function pushChunkData(resultantArray, filGenArray, secKey) {
  logger.log('info', 'Entered pushChunkData :: cloneObj', new Date().getTime(), new Date().toString());
  let secArry = [];
  Object.keys(filGenArray).forEach(function (key) {
    secArry = resultantArray[0];
    if (resultantArray[0] != undefined && resultantArray[0] != null && !_.isEmpty(resultantArray[0])) {
      switch (secKey) {
        case 'b2c':
          filGenArray[key].b2c = secArry;
          break;
        case 'b2b':
          filGenArray[key].b2b = secArry;
          break;
        case 'expwp':
          filGenArray[key].expwp = secArry;
          break;
        case 'expwop':
          filGenArray[key].expwop = secArry;
          break;
        case 'de':
          filGenArray[key].de = secArry;
          break;
        case 'sezwp':
          filGenArray[key].sezwp = secArry;
          break;
        case 'sezwop':
          filGenArray[key].sezwop = secArry;
          break;
        case 'rev':
          filGenArray[key].rev = secArry;
          break;
        case 'imps':
          filGenArray[key].imps = secArry;
          break;
        case 'impg':
          filGenArray[key].impg = secArry;
          break;
        case 'impgsez':
          filGenArray[key].impgsez = secArry;
          break;
        case 'ecom':
          filGenArray[key].ecom = secArry;
          break;
        case 'mis':
          filGenArray[key].mis = secArry;
          break;
        case 'b2ba':
          filGenArray[key].b2ba = secArry;
          break;
        case 'b2bao':
          filGenArray[key].b2bao = secArry;
          break;
        case 'dea':
          filGenArray[key].dea = secArry;
          break;
        case 'sezwpa':
          filGenArray[key].sezwpa = secArry;
          break;
        case 'sezwopa':
          filGenArray[key].sezwpa = secArry;
          break;
      }
      resultantArray.shift();
      logger.log('info', 'Exiting pushChunkData :: cloneObj', new Date().getTime(), new Date().toString());
    }
  });

}
/* This functionn will compress the chunk directory*/
function zipDirectory(zippath) {

  logger.log('info', 'Entered chunkService.js :: zipDirectory', new Date().getTime(), new Date().toString());
  let outputStream = fs.createWriteStream(zippath);
  let archive = archiver('zip', { zlib: { level: 9 } });
  let downloadFlag = false;
  return new Promise((resolve, reject) => {
    outputStream.on('end', () => {
      logger.log('info', 'Data has been drained');
    });
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        logger.log('warn', err);
      } else {
        throw err;
      }
    });
    archive.on('error', err => {
      logger.log('err', err);
      reject(err);
    })
    archive.pipe(outputStream)

    //archive.glob('chunk_payload/**/*.json');

    archive.directory('./json/anx1/chunk_payload/', false)

    archive.finalize()
      .then(() => {
        outputStream.on('close', () => {

          logger.log('info', 'Entering chunkService.js :: zipDirectory', new Date().getTime(), new Date().toString());
          let x = archive.pointer();
          logger.log('info', ' total bytes %s : ', x);
          logger.log('info', 'archiver has been finalized and the output file descriptor has closed.', new Date().getTime(), new Date().toString());
          downloadFlag = true;
          logger.log('info', 'Exiting chunkService.js :: zipDirectory', new Date().getTime(), new Date().toString());
          resolve(zippath);
          fs.remove('./json/anx1/chunk_payload/', err => {
            console.error(err)
          });
        })

      }, error => { console.log(error) })
  });

}
/*This function will write the chunked jsons into the chunk_payload directory*/
function createChunks(input) {
  logger.log('info', 'Entering chunkService.createChunks.', new Date().getTime(), new Date().toString());
  return new Promise(function (resolve, reject) {
    let fyear = Buffer.from(input.headers.query.fp);
    let finyr = fyear.slice(0, 4) + "-" + fyear.slice(7, 9);
    let chunk_dir = input.headers.query.taxperiod + '_' + finyr + '_' + input.headers.query.gstin + '_' + 'ANX1';
    //console.log("GSTIN:", input.headers.query.gstin);
    //console.log('chunk dir', chunk_dir);
    if (!fs.existsSync('json/anx1/chunk_payload/' + chunk_dir)) {
      mkDirectory.sync('json/anx1/chunk_payload/' + chunk_dir);
    }


    let filelength = Object.keys(input.final_data).length;
    let start = 0;
    Object.keys(input.final_data).forEach(function (key) {
      logger.log('info', 'Entered chunkService.js :: getChunkedData :: creating chunked json(s)');

      input.final_data[key] = { 'chunknum': `${start}`, 'islastchunk': (start + 1) == filelength ? 'Y' : 'N', ...input.final_data[key] };
      let writeData = JSON.stringify(omitEmpty(input.final_data[key]));


      fs.access(`json/anx1/chunk_payload/${chunk_dir}/${input.headers.query.taxperiod}_${finyr}_${input.headers.query.gstin}_ANX1_${key}.json`, fs.F_OK, (err) => {
        if (err) {
          fs.writeFileSync(`json/anx1/chunk_payload/${chunk_dir}/${input.headers.query.taxperiod}_${finyr}_${input.headers.query.gstin}_ANX1_${key}.json`, writeData, "utf8",

            function (err) {
              if (err) {
                logger.log('error', 'An error occured while writing json :: %s', err)
                return console.log(err);
              }
            }

          )
        }

        else {

          fs.unlink(`json/anx1/chunk_payload/${chunk_dir}/${input.headers.query.taxperiod}_${finyr}_${input.headers.query.gstin}_ANX1_${key}.json`, function (err) {
            if (err) {
              logger.log('error', 'An error occured while unlinking :: %s', err)
            } else {
              fs.writeFileSync(`json/anx1/chunk_payload/${chunk_dir}/${input.headers.query.taxperiod}_${finyr}_${input.headers.query.gstin}_ANX1_${key}.json`, writeData, "utf8",
                function (err) {
                  if (err) {
                    logger.log('error', 'An error occured while writing json :: %s', err)
                    return console.log(err);
                  }
                }

              );

            }
          })

        }

      })
      start++;
    });

    logger.log('info', 'Exiting chunkService.createChunks.', new Date().getTime(), new Date().toString());
    resolve();
  });

}
module.exports = {
  getChunkedData: getChunkedData,
  zipDirectory: zipDirectory,
  createChunks: createChunks
}