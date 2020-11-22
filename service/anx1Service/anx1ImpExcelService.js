/**
 *  @author:   Prakash Kaphle
 *  @created:   July 2019
 *  @description: Anx1 Offline utility
 *  @copyright: (c) Copyright by Infosys technologies
 *  version GST1.00
 *  Last Updated:  Prakash Kaphle, July 23 2019
 **/
const fs = require('fs');
const { sendResponse } = require("../../utility/common");
const logger = require('../../utility/logger').logger;
const errorConstant = require('../../utility/errorconstants');
const XLSX = require('xlsx');
const csv = require('csvtojson');
const multer = require('multer');
const parentFiledir = './uploads/';
const ReturnStructure = require('../../utility/returnStructure');
const Promise = require("bluebird");
const _ = require("lodash");
const anx1Imp = require('../../service/anx1Service/anx1ImpExcelJsonService');
const omitEmpty = require('omit-empty');
const groupJsonService = require('../../utility/groupJsonService');
const randomNumGenerator = require('csprng');
const impconst = require('../../utility/impConstants');
const db = require("../../db/dbUtil");
const { anx1Queries } = require("../../db/Queries");
const mkdirp = require('mkdirp');
//this is used to upload the excel file and store it.
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var fileExt = file.originalname.split('.').pop();
        if (fileExt.toLocaleUpperCase() == 'XLSX') {
            var uploadedFiledir = parentFiledir + "anx1/" + req.headers.gstin + "/" + req.headers.taxperiod + "/excel/";
        }
        else if (fileExt.toLocaleUpperCase() == 'CSV') {
            var uploadedFiledir = parentFiledir + "anx1/" + req.headers.gstin + "/" + req.headers.taxperiod + "/csv/";
        }
        if (!fs.existsSync(uploadedFiledir)) {
            mkdirp.sync(uploadedFiledir, (err) => {
                if (err)
                    logger.log("error", "error while creating the directory :: %s ", err.message);
            });
        }
        cb(null, uploadedFiledir)
    },
    filename: function (req, file, cb) {
        //var datetimestamp = Date.now();
        var d = new Date();
        var appendDate = [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('_') + '_' + [d.getHours(), d.getMinutes(), d.getSeconds()].join('_');
        var fileExt = file.originalname.split('.').pop();
        //cb(null, datetimestamp + '_' + file.originalname)
        if (file.originalname.includes('error_')) {
            cb(null, file.originalname.split('.', 1) + '.' + fileExt)
        }
        else {
            cb(null, file.originalname.split('.', 1) + '_' + appendDate + '.' + fileExt)
        }

        //cb(null, extdata + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
function saveExcelData(req, res) {
    let errorObject = null;
    logger.log("info", "Entering Anx1ImpExcelService.js:: saveExcelData ");

    try {
        let upload = multer({ storage: storage }).single('file');
        upload(req, res, function (err) {
            if (err || req.file === undefined) {

                sendResponse(res, 500, { message: "Unable to get thefile/ no file provided", statusCd: 0 });
                return;
            }
            createExcelData(req.file.path, req.file.filename, req, res);
        });
    }
    catch (err) {
        errorObject = {
            statusCd: errorConstant.STATUS_500,
            errorCd: errorConstant.STATUS_500,
            errorMsg: 'Unable to upload the file'
        };

        logger.log("error", "Unexpected Error while importing the xls file :: %s", err.message)

    } finally {
        errorObject = null;
    }
    logger.log("info", "Exiting Anx1ImpExcelService:: saveExcelData");
}

function addFileHistory(upFilename, upFileType, uploadStatus, headers) {
    logger.log("info", "Entering Anx1ImpExcelService:: addFileHistory");
    let fileType = (upFileType.toUpperCase()).substring(0, 1);
    let tax_period = headers.taxperiod;
    let filename = upFilename;
    let errFileName = "";
    //var d = new Date();
    //var appendDate = [d.getMonth()+1,d.getDate(),d.getFullYear()].join('_')+'_'+[d.getHours(),d.getMinutes(),d.getSeconds()].join('_');
    //filename = fileName+"_"+appendDate+"."+(fileType=='X'?'xlsx':'.csv');
    if (uploadStatus == 'E' || uploadStatus == 'P') {
        errFileName = 'error_' + filename;
    }
    else {
        errFileName = 'NA'
    }
    let fileHistoryParams = [tax_period, filename, fileType, uploadStatus, errFileName];
    let dbObj = db.getConnection(headers.gstin);
    try {
        db.runQuery("BEGIN", [], dbObj);
        db.saveRow(anx1Queries.fileHistory.saveFileHistory, fileHistoryParams, dbObj)
        db.runQuery("COMMIT", [], dbObj);
        logger.log("info", "Exiting Anx1ImpExcelService:: addFileHistory");
    } catch (err) {
        db.runQuery("ROLLBACK", [], dbObj);
        logger.log("error", "Anx1ImpExcelService.addFileHistory|error|rollback|err:%s|", err);
        if (err.message && err.message.includes("UNIQUE constraint failed")) {
            sendResponse(res, 500, { message: "Duplicate File Uploaded. Please choose another file and upload", statusCd: 0 });
        } else {
            sendResponse(res, 500, { message: err.toString(), statusCd: 0 });
        }
        return 0;
    } finally {
        db.dbClose(dbObj);
        return errFileName;
    }
}
function getFileHistory(req, res) {
    let getParamArr = [req.headers.rtnprd];
    return new Promise(function (resolve, reject) {
        let sql = anx1Queries.fileHistory.getFileHistory;
        db.fetchAllById(sql, getParamArr, req.headers.gstin)
            .then(resultSet => {
                resolve(resultSet);
            })
            .catch(err => {
                reject(err);
            });
    }).then(function (data) {
        sendResponse(res, 201, data);
    }).catch(function (err) {
        sendResponse(res, 500, err);

    });

}
function saveBlobService(req, res) {
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        if (err || req.file === undefined) {

            sendResponse(res, 500, { message: "Unable to get thefile/ no file provided", statusCd: 0 });
            return;
        }
        sendResponse(res, 200, { message: "File Saved !", statusCd: 1 })
    });
}


function parseCsv(file_path) {
    //console.log("Inside parseCsv");
    return new Promise((resolve, reject) => {

        csv({ noheader: false, delimiter: [","] })
            .fromFile(file_path)
            .then((jsonObj) => {
                resolve(jsonObj);
            });
    });
}

async function readXML(file_path, retFile, filetype, profile) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: readXML ");
    let retData = [];

    //let filetype = retFile.filename.split('.').pop();
    if (filetype == "XLSX") {
        logger.log("info", "filtype is of type : %s", filetype);
        let workbook = XLSX.readFile(file_path, {
            type: 'binary',
        });

        let sheetArry = workbook.SheetNames;

        if (workbook.SheetNames[0] === "Read Me") {
            sheetArry.splice(0, 1);
        }

        sheetArry.forEach(function (name_key) {
            console.log('name_key', name_key);
            if (profile == impconst.sahaz) {   // for Sahaj profile, read only 3A, 3H, 3L and 3BAO sheets
                if (name_key != "B2C" && name_key != "REV" && name_key != "MIS" && name_key != 'B2BAO' && name_key != 'B2CA' && name_key != 'REVA') {
                    return true;
                }
            }
            else if (profile == impconst.sugam) { // for Sugam profile, read only 3A, 3B, 3H, 3L and 3BAO sheets
                if (name_key != "B2C" && name_key != "REV" && name_key != "B2B" && name_key != "MIS" && name_key != 'B2BAO' && name_key != 'B2CA' && name_key != 'REVA') {
                    return true;
                }
            }

            // IGNORE FIRST  row of each sheet
            let range = XLSX.utils.decode_range(workbook.Sheets[name_key]['!ref']);
            range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
            if (name_key === 'B2BAO' || name_key === 'EXPA' || name_key === 'IMPGA' || name_key === 'IMPGSEZA') {
                range.s.r = 2;
            }

            workbook.Sheets[name_key]['!ref'] = XLSX.utils.encode_range(range);
            let data = XLSX.utils.sheet_to_json(workbook.Sheets[name_key], { raw: false }
            );
            let shtnm = name_key;
            logger.log('debug', 'Data from the excel sheet is :: %s', data);

            retData.push({
                section: shtnm,
                data: data
            });
        });
    }
    else {
        logger.log("info", "filtype is of type : %s", filetype);
        let sheetName = retFile.originalname.split('_').reverse().pop();

        let csvjson = await parseCsv(file_path);
        // console.log("csvjson", csvjson);
        retData.push({
            section: sheetName,
            data: csvjson
        });
    }
    logger.log("info", "Exiting Anx1ImpExcelService.js:: readXML ");
    return retData;
}


async function createExcelData(file_path, file_name, req, res) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: createExcelData ");
    let errorObject = null;
    try {
        let myCache = req.app.get('myCache');
        let shareData = req.headers;
        let filetype = req.file.filename.split('.').pop().toUpperCase();
        let retData = await readXML(file_path, req.file, filetype, req.headers.profile);
        let excelData = [];
        let isValid = true;
        let upFilename = file_name //req.file.originalname.split('.',1).pop();

        let form = 'ANX1';
        if (retData.length > 0) {
            retData.forEach(function (section) {
                let secNm = section.section,

                    invStructure = ReturnStructure.getInv(secNm, form, shareData),
                    invItmStructure = ReturnStructure.getItm(secNm, form, shareData),
                    invNodeFormatter = ReturnStructure.formateNodePayload(secNm, form);

                if (!invStructure) {
                    return false;
                }
                let preparedExcelPayload = ReturnStructure.preparePayloadFromExcel(section.data, invStructure, invItmStructure, secNm, form, shareData),
                    invAry = preparedExcelPayload.inv;

                let newInvAry = [];

                if (preparedExcelPayload.isValid === true) {   // Check whether all mandatory fields are filled
                    if (invAry.length > 0) {
                        invAry.forEach(function (sInv, i) {
                            newInvAry.push(invNodeFormatter(sInv));
                        });
                    }
                } else {
                    isValid = false;
                }

                excelData.push({
                    cd: secNm,
                    dt: newInvAry,
                    err: section.data,  // to hold the original data to be added in error excel incase if any mandatory field is missed
                    valid: preparedExcelPayload.isValid
                });
            });
        }
        workbook = null;
        retData = null;

        let randomNum = randomNumGenerator(80, 36);// first param is the bits & second is the radix
        logger.log("info", "Exiting Anx1ImpExcelService.js:: createExcelData ");
        sendResponse(res, 200, JSON.stringify({
            cache_key: "CACHE_" + randomNum,
            isvalid_cache_key: "CACHE_ISVALID_" + randomNum,
            file_type: "FILE_TYPE_" + randomNum,
            upFilename: "FILE_NAME_" + randomNum
        }));

        myCache.set("CACHE_" + randomNum, excelData);
        myCache.set("CACHE_ISVALID_" + randomNum, isValid);
        myCache.set("FILE_TYPE_" + randomNum, filetype);
        myCache.set("FILE_NAME_" + randomNum, upFilename);
    } catch (err) {
        errorObject = {
            statusCd: errorConstant.STATUS_500,
            message: 'The Excel or CSV file is invalid !! Please check if sheet(s) are empty.'
        };
        logger.log("error", "Unexpected error while adding the invoice:: %s", err.message);
        sendResponse(res, 500, errorObject);
        return 0;
    } finally {
        errorObject = null;
    }
}

function gettblData(obj, myCache) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: gettblData ");
    return new Promise(function (resolve, reject) {

        if (obj.cache_key != undefined) {
            myCache.get(obj.cache_key, function (err, value) {
                if (!err) {
                    if (value == undefined) {
                        logger.log("debug", "cache key found, but not the data, something wrong, abort");
                        reject(err);
                    } else {
                        obj = value;
                        resolve(obj);
                    }
                } else {
                    logger.log("warning", "cache key found, but unable to get the data, something wrong, abort");
                    reject(err);
                }
            });

        }
    });
}

function getExcelValidStatus(obj, myCache) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: getExcelValidStatus ");

    return new Promise(function (resolve, reject) {

        if (obj.isvalid_cache_key != undefined) {
            myCache.get(obj.isvalid_cache_key, function (err, value) {
                if (!err) {
                    if (value == undefined) {
                        logger.log("debug", "cache key found, but not the data, something wrong, abort");
                        reject(err);
                    } else {
                        obj = value;
                        resolve(obj);
                    }
                } else {
                    logger.log("warning", "cache key found, but unable to get the data, something wrong, abort");
                    reject(err);
                }
            });

        }
    });
}


function getFileType(obj, myCache) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: getFileType ");

    return new Promise(function (resolve, reject) {

        if (obj.file_type != undefined) {
            myCache.get(obj.file_type, function (err, value) {
                if (!err) {
                    if (value == undefined) {
                        logger.log("debug", "cache key found, but not the data, something wrong, abort");
                        reject(err);
                    } else {
                        obj = value;
                        resolve(obj);
                    }
                } else {
                    logger.log("warning", "cache key found, but unable to get the data, something wrong, abort");
                    reject(err);
                }
            });

        }
    });
}
function getFileName(obj, myCache) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: getFileName ");

    return new Promise(function (resolve, reject) {

        if (obj.upFilename != undefined) {
            myCache.get(obj.upFilename, function (err, value) {
                if (!err) {
                    if (value == undefined) {
                        logger.log("debug", "cache key found, but not the data, something wrong, abort");
                        reject(err);
                    } else {
                        obj = value;
                        resolve(obj);
                    }
                } else {
                    logger.log("warning", "cache key found, but unable to get the data, something wrong, abort");
                    reject(err);
                }
            });

        }
    });
}

async function createJsonObject(req, res) {
    let myCache = req.app.get('myCache');
    logger.log("info", "Entering Anx1ImpExcelService:: createJsonObject ");
    let errorObject = null;

    try {

        let dataObj = req.body;
        let jsonObj = {};

        jsonObj['gstin'] = req.headers.gstin;
        jsonObj['rtnprd'] = req.headers.rtnprd;
        jsonObj['profile'] = req.headers.profile;
        jsonObj['issez'] = req.headers.issez;
        jsonObj['frq'] = req.headers.frq;

        let table_data = await gettblData(dataObj, myCache);
        let isValid = await getExcelValidStatus(dataObj, myCache);
        let upFilename = await getFileName(dataObj, myCache);
        let upFileType = await getFileType(dataObj, myCache);


        if (isValid === true) {
            let createdObject = await Promise.map(table_data, (row) => {
                return new Promise((resolve, reject) => {

                    if (row !== undefined && row !== null && row !== {}) {
                        //console.log("row ",row)
                        switch (row.cd) {
                            case 'REV':
                                let revarry = []
                                row.dt.forEach((value) => {
                                    revarry.push(value);
                                }
                                );
                                jsonObj['rev'] = revarry;
                                break;
                            case 'B2C':
                                let b2carry = []
                                row.dt.forEach((value) => {
                                    b2carry.push(value);
                                }
                                );
                                jsonObj['b2c'] = b2carry;
                                break;
                            case 'B2B':
                                let b2barry = []
                                row.dt.forEach((value) => {
                                    b2barry.push(value);

                                }
                                );
                                jsonObj['b2b'] = b2barry;
                                break;
                            case 'EXP':
                                let expWarry = [];
                                let expWoarry = [];
                                row.dt.forEach((value) => {
                                    if (value['exptype'] == 'WPAY') {
                                        expWarry.push(value);
                                        delete value.exptype;
                                    }
                                    else {
                                        expWoarry.push(value);
                                        delete value.exptype;
                                    }
                                }
                                );
                                jsonObj['expwp'] = expWarry;
                                jsonObj['expwop'] = expWoarry;
                                break;
                            case 'SEZ':
                                let sezWarry = [];
                                let sezWoarry = [];
                                row.dt.forEach((value) => {
                                    if (value['seztype'] == 'WPAY') {
                                        sezWarry.push(value);
                                        delete value.seztype;
                                    }
                                    else {
                                        sezWoarry.push(value);
                                        delete value.seztype;
                                    }
                                }
                                );
                                jsonObj['sezwp'] = sezWarry;
                                jsonObj['sezwop'] = sezWoarry;
                                break;
                            case 'DE':
                                let deArry = []
                                row.dt.forEach((value) => {
                                    deArry.push(value);
                                }
                                );
                                jsonObj['de'] = deArry;
                                break;
                            case 'IMPS':
                                let impsarry = []
                                row.dt.forEach((value) => {
                                    impsarry.push(value);
                                }
                                );
                                jsonObj['imps'] = impsarry;
                                break;
                            case 'IMPG':
                                let impgarry = []
                                row.dt.forEach((value) => {
                                    impgarry.push(value);
                                }
                                );
                                jsonObj['impg'] = impgarry;
                                break;
                            case 'IMPGSEZ':
                                let impgsezarry = []
                                row.dt.forEach((value) => {
                                    impgsezarry.push(value);
                                }
                                );
                                jsonObj['impgsez'] = impgsezarry;
                                break;
                            case 'MIS':
                                let misarry = []
                                row.dt.forEach((value) => {
                                    misarry.push(value);
                                }
                                );
                                jsonObj['mis'] = misarry;
                                break;
                            case 'ECOM':
                                let ecomarry = []
                                row.dt.forEach((value) => {
                                    ecomarry.push(value);
                                }
                                );
                                jsonObj['ecom'] = ecomarry;
                                break;
                            case 'B2BAO':
                                let baoarray = []
                                row.dt.forEach((value) => {
                                    baoarray.push(value);

                                }
                                );
                                // console.log("baoarray",baoarray)
                                jsonObj['b2ba'] = baoarray;

                                break;
                        }


                     //  console.log("jsonObj['b2ba']", jsonObj)
                        if (jsonObj.profile == impconst.sahaz) {
                            Object.keys(jsonObj).forEach(function (key) {
                                if (key != 'profile' && key != 'gstin' && key != 'issez' && key != 'frq' && key != 'rtnprd' && key != 'b2c' && key != 'rev' && key !== 'mis' && key != 'b2ba') {
                                    delete jsonObj[key];
                                }
                            });
                        }
                        else if (jsonObj.profile == impconst.sugam) {
                            Object.keys(jsonObj).forEach(function (key) {
                                if (key != 'profile' && key != 'gstin' && key != 'issez' && key != 'frq' && key != 'rtnprd' && key != 'b2c' && key != 'rev' && key != 'b2b' && key !== 'mis' && key !== 'b2ba') {
                                    delete jsonObj[key];
                                }
                            });
                        }

                        resolve(jsonObj);
                    }
                    else {
                        reject(new Error('No data is retrieved !!'));
                    }
                }
                );
            }
            );

            
            let finalPayload = await groupJsonService.groupMltplDoc(omitEmpty(createdObject[0]));
           //console.log("finalPayload for b2bao", JSON.stringify(finalPayload.b2ba));
            if ((_.isEmpty(finalPayload.rev)) && (_.isEmpty(finalPayload.b2b)) && (_.isEmpty(finalPayload.b2c)) && (_.isEmpty(finalPayload.expwp)) && (_.isEmpty(finalPayload.expwop)) && (_.isEmpty(finalPayload.sezwp))
                && (_.isEmpty(finalPayload.sezwop)) && (_.isEmpty(finalPayload.imps)) && (_.isEmpty(finalPayload.impg)) && (_.isEmpty(finalPayload.impgsez)) && (_.isEmpty(finalPayload.ecom)) && (_.isEmpty(finalPayload.de)) && (_.isEmpty(finalPayload.mis)) && (_.isEmpty(finalPayload.b2ba))) {
                res.set('Content-Type', 'text/plain');
                res.status(500).send({ message: `No valid data found in excel to import!`, statusCd: 0, mandError: false });
            }
            else {
                logger.log("info", "Entering anx1ImplExcelService.js:: createJsonObject :: Save Json to DB");

                req.body = finalPayload;
            
                let errJson = await anx1Imp.importExcelJson(req, res);
             //  console.log("errJson ::",JSON.stringify(errJson))
                if (errJson.errObj !== undefined && errJson.errObj !== null && errJson.errObj !== {}) {
                    let errorPayload = omitEmpty(errJson.errObj);
                    let writeDir;
                    if (errJson.isSchemaValid) {
                        writeDir = `json/anx1/error_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'error'}.json`;
                    } else {
                        writeDir = `json/anx1/error_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'schema_error'}.json`;
                    }

                    await fs.writeFileSync(writeDir, JSON.stringify(errorPayload), "utf8",
                        function (err) {
                            if (err) {
                                logger.log('error', 'An error occured while writing error json :: %s', err);
                                sendResponse(res, 500, { message: "An error occured while writing error json !", statusCd: 0, mandError: false });
                                return console.log(err);
                            }
                        }
                    );

                    await fs.writeFileSync(`json/anx1/excel_to_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}.json`, JSON.stringify(finalPayload), "utf8",
                        function (err) {
                            if (err) {
                                logger.log('error', 'An error occured while writing json :: %s', err);
                                sendResponse(res, 500, { message: "An error occured while writing json !", statusCd: 0 });
                                return console.log(err);
                            }
                        }
                    );

                    if (errJson.xflag && errJson.xflag === "Duplicate") {
                        let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
                        sendResponse(res, 500, { message: errJson.errObj, statusCd: 0, impError: true, errorFileName: errorFileName });
                    } else if (errJson.xflag && errJson.isSchemaValid == true) {
                        let errorFileName = addFileHistory(upFilename, upFileType, 'P', req.headers);
                        sendResponse(res, 500, { message: "Valid records were processed successfully! Few records were errored out due to data validation. Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "partial", mandError: false, errorFileName: errorFileName });
                    }
                    else if (!(errJson.isSchemaValid)) {
                        let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
                        sendResponse(res, 500, { message: "Processing of imported excel file was not successful. There are one (or) more records where the values added in excel worksheet is not as per expected format (such as text length, date format, number length etc.). Click OK to download excel with error details. Please correct errors and re-import.", statusCd: 0, impError: true, flag: "schema", mandError: false, errorFileName: errorFileName });
                    }
                    else {
                        let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
                        sendResponse(res, 500, { message: "All records have failed data validation ! Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "complete", mandError: false, errorFileName: errorFileName });
                    }
                }
                else {

                    await fs.writeFileSync(`json/anx1/excel_to_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}.json`, JSON.stringify(finalPayload), "utf8",
                        function (err) {
                            if (err) {
                                logger.log('error', 'An error occured while writing json :: %s', err);
                                sendResponse(res, 500, { message: "An error occured while writing json !", statusCd: 0 });
                                return console.log(err);
                            }
                        }
                    );
                    let errorFileName = addFileHistory(upFilename, upFileType, 'S', req.headers);
                    sendResponse(res, 200, { message: "Data has been saved successfully.", statusCd: 1 });
                }
            }

        } else {
            let mandErrorjsonObj = {};
            let errArray = [];
            let inValidSections = [];

            let fileType = await getFileType(dataObj, myCache);

            await Promise.map(table_data, (row) => {
                return new Promise((resolve, reject) => {

                    // console.log("row.cd ::", row.cd);
                    // console.log("row.err : ", JSON.stringify(row));
                    let section = row.cd;
                    errArray = []; 


                    if (row.err && fileType == "XLSX") {
                        row.err.forEach((value) => {
                            value = errorGenerationforExcel(value, section);
                            errArray.push(value);
                        });
                    }
                    else
                        if (row.err && fileType == "CSV") {
                            row.err.forEach((value) => {
                                value = errorGenerationforCSV(value, section);
                                errArray.push(value);
                            });
                        }

                    if (row.valid == false) {
                        inValidSections.push(section);
                        // console.log("Section : ", section);
                        // console.log("Section Data: ", JSON.stringify(row));
                    }

                    if (section == 'B2BAO') {
                        mandErrorjsonObj["b2bao"] = errArray;
                    } else {
                        mandErrorjsonObj[section.toLowerCase()] = errArray;
                    }

                    resolve(mandErrorjsonObj);

                });
            });

            let writeDir = `json/anx1/error_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'mandatory_error'}.json`;

            await fs.writeFileSync(writeDir, JSON.stringify(mandErrorjsonObj), "utf8",
                function (err) {
                    if (err) {
                        logger.log('error', 'An error occured while writing mandatory check error json :: %s', err);
                        sendResponse(res, 500, { message: "An error occured while writing mandatory check error json !", statusCd: 0, flag: 'manderr', mandError: true });
                        return console.log(err);
                    }
                }
            );
            let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
            sendResponse(res, 500, { message: "Mandatory fields are not entered for sheet(s) - " + inValidSections.toString() + ". Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "mandatory", errorFileName: errorFileName });
        }

    } catch (err) {
        errorObject = {
            statusCd: errorConstant.STATUS_500,
            message: 'The Excel or CSV file is invalid !! Please enter a valid Excel or CSV file.'
        };
        logger.log("error", "Unexpected error while adding the invoices:: %s", err.message);
       // console.log("errorObject ::", errorObject)
        sendResponse(res, 500, errorObject);
        return 0;
    } finally {
        errorObject = null;
    }
    logger.log("info", "Exiting anx1ImplExcelService:: createJsonObject");
};

let checkError = false;
function isExceptionKey(key) {
    if (key === '3B (B2B)')
        return true;
    else
        return false;

}


function errorGenerationforExcel(obj, tbname) {
    let ExceptionKey = '';
    let skipHSN = false;
    if (tbname === 'MIS') {
        ExceptionKey = obj[impconst.supply_related_to];
        skipHSN = isExceptionKey(ExceptionKey);
    }
    let finalErrObj = {}
    let keys = Object.keys(obj);

    let error = [];
    if (skipHSN) {

        var columns = getColumnsForMandatoryCheck('MIS_NM');
    }
    else {
        var columns = getColumnsForMandatoryCheck(tbname);
    }
    // console.log("Table keys : ", keys);
    // console.log("columns :", columns);

    for (col of columns) {
        if (!keys.includes(col)) {
            finalErrObj[col] = " ";
            if (col.endsWith('*')) {
                error.push(col + ' should not be blank');
                checkError = true;
            }
        } else {
            finalErrObj[col] = obj[col];
        }
    }

    if (tbname === 'EXP') {
        if (ReturnStructure.validateShippingDetailsCombo(obj[impconst.ship_date], obj[impconst.pcode_opt], obj[impconst.ship_num]) === false) {
            error.push('Enter port code, shipping bill no. and shipping bill date, if you have entered any one');
        }
    }

    finalErrObj['Error Message'] = error.toString();

    return finalErrObj;
}


function errorGenerationforCSV(obj, tbname) {
    let ExceptionKey = '';
    let skipHSN = false;
    if (tbname === 'MIS') {
        ExceptionKey = obj[impconst.supply_related_to];
        skipHSN = isExceptionKey(ExceptionKey);
    }
    let finalErrObj = {}
    let keys = Object.keys(obj);
    let error = [];
    if (skipHSN) {

        var columns = getColumnsForMandatoryCheck('MIS_NM');
    }
    else {
        var columns = getColumnsForMandatoryCheck(tbname);
    }

    for (col of columns) {
        if (!keys.includes(col) || (col.endsWith('*') && obj[col].trim() === "")) {
            finalErrObj[col] = " ";
            if (col.endsWith('*')) {
                error.push(col + ' should not be blank');
                checkError = true;
            }
        } else {
            finalErrObj[col] = obj[col];
        }
    }

    if (tbname === 'EXP') {
        if (ReturnStructure.validateShippingDetailsCombo(obj[impconst.ship_date], obj[impconst.pcode_opt], obj[impconst.ship_num]) === false) {
            error.push('Enter port code, shipping bill no. and shipping bill date, if you have entered any one');
        }
    }

    finalErrObj['Error Message'] = error.toString();

    return finalErrObj;
}

function getColumnsForMandatoryCheck(tbname) {

    switch (tbname) {
        case 'B2C':
            columns = impconst.b2cColumns;
            break;
        case 'B2B':
            columns = impconst.b2bColumns;
            break;
        case 'REV':
            columns = impconst.revColumns;
            break;
        case 'DE':
            columns = impconst.deColumns;
            break;
        case 'EXP':
            columns = impconst.expColumns
            break;
        case 'SEZ':
            columns = impconst.sezColumns
            break;
        case 'IMPS':
            columns = impconst.impsColumns
            break;
        case 'IMPG':
            columns = impconst.impgColumns
            break;
        case 'ECOM':
            columns = impconst.ecomColumns
            break;
        case 'IMPGSEZ':
            columns = impconst.impgsezColumns;
            break;
        case 'B2CA':
            columns = impconst.b2caColumns;
            break;
        case 'EXPA':
            columns = impconst.expaColumns;
            break;
        case 'MIS':
            columns = impconst.misColumns;
            break;
        case 'MIS_NM':
            columns = impconst.misColumnsHSNnonMand;
            break;
        case 'B2BAO':
            columns = impconst.baoColumns;
            break;
    }
    return columns;
}


// *********************************************************************** 
// Ammendment Related Methods
// ***********************************************************************
function saveExcelAData(req, res) {
    let errorObject = null;
    logger.log("info", "Entering Anx1ImpExcelService.js:: saveExcelAData ");

    try {
        let upload = multer({ storage: storage }).single('file');
        upload(req, res, function (err) {
            if (err || req.file === undefined) {

                sendResponse(res, 500, { message: "Unable to get thefile/ no file provided", statusCd: 0 });
                return;
            }
            createExcelAData(req.file.path, req.file.filename, req, res);
        });
    }
    catch (err) {
        errorObject = {
            statusCd: errorConstant.STATUS_500,
            errorCd: errorConstant.STATUS_500,
            errorMsg: 'Unable to upload the file'
        };

        logger.log("error", "Unexpected Error while importing the xls file :: %s", err.message)

    } finally {
        errorObject = null;
    }
    logger.log("info", "Exiting Anx1ImpExcelService:: saveExcelAData");
}

async function createExcelAData(file_path, file_name, req, res) {
    logger.log("info", "Entering Anx1ImpExcelService.js:: createExcelAData ");
    let errorObject = null;
    try {
        let myCache = req.app.get('myCache');
        let shareData = req.headers;
        let filetype = req.file.filename.split('.').pop().toUpperCase();
        let retData = await readXML(file_path, req.file, filetype, req.headers.profile);
        let excelData = [];
        let isValid = true;
        let upFilename = file_name //req.file.originalname.split('.',1).pop();

        console.log('retData  ===> ', retData);
        let form = 'ANX1A';
        if (retData.length > 0) {
            retData.forEach(function (section) {
                let secNm = section.section,
                    invStructure = ReturnStructure.getInv(secNm, form, shareData),
                    invItmStructure = ReturnStructure.getItm(secNm, form, shareData),
                    invNodeFormatter = ReturnStructure.formateNodePayload(secNm, form);
                
                if (!invStructure) {
                    return false;
                }

                let preparedExcelPayload = ReturnStructure.preparePayloadFromExcel(section.data, invStructure, invItmStructure, secNm, form, shareData),
                    invAry = preparedExcelPayload.inv;

                let newInvAry = [];

                if (preparedExcelPayload.isValid === true) {   // Check whether all mandatory fields are filled
                    if (invAry.length > 0) {
                        invAry.forEach(function (sInv, i) {
                            newInvAry.push(invNodeFormatter(sInv));
                        });
                    }
                } else {
                    isValid = false;
                }

                excelData.push({
                    cd: secNm,
                    dt: newInvAry,
                    err: section.data,  // to hold the original data to be added in error excel incase if any mandatory field is missed
                    valid: preparedExcelPayload.isValid
                });
            });
        }
        workbook = null;
        retData = null;

        let randomNum = randomNumGenerator(80, 36);// first param is the bits & second is the radix
        logger.log("info", "Exiting Anx1ImpExcelService.js:: createExcelAData ");
        sendResponse(res, 200, JSON.stringify({
            cache_key: "CACHE_" + randomNum,
            isvalid_cache_key: "CACHE_ISVALID_" + randomNum,
            file_type: "FILE_TYPE_" + randomNum,
            upFilename: "FILE_NAME_" + randomNum
        }));

        myCache.set("CACHE_" + randomNum, excelData);
        myCache.set("CACHE_ISVALID_" + randomNum, isValid);
        myCache.set("FILE_TYPE_" + randomNum, filetype);
        myCache.set("FILE_NAME_" + randomNum, upFilename);
    } catch (err) {
        errorObject = {
            statusCd: errorConstant.STATUS_500,
            message: 'The Excel or CSV file is invalid !! Please check if sheet(s) are empty.'
        };
        logger.log("error", "Unexpected error while adding the invoice:: %s", err.message);
        sendResponse(res, 500, errorObject);
        return 0;
    } finally {
        errorObject = null;
    }
}

async function createJsonObjectA(req, res) {
    let myCache = req.app.get('myCache');
    logger.log("info", "Entering Anx1ImpExcelService:: createJsonObjectA ");
    let errorObject = null;

    try {

        let dataObj = req.body;
        let jsonObj = {};

        jsonObj['gstin'] = req.headers.gstin;
        jsonObj['rtnprd'] = req.headers.rtnprd;
        jsonObj['profile'] = req.headers.profile;
        jsonObj['issez'] = req.headers.issez;
        jsonObj['frq'] = req.headers.frq;

        let table_data = await gettblData(dataObj, myCache);
        let isValid = await getExcelValidStatus(dataObj, myCache);
        let upFilename = await getFileName(dataObj, myCache);
        let upFileType = await getFileType(dataObj, myCache);

        if (isValid === true) {
            let createdObject = await Promise.map(table_data, (row) => {
                return new Promise((resolve, reject) => {

                    if (row !== undefined && row !== null && row !== {}) {
                        switch (row.cd) {
                            case 'B2CA':
                                let b2carry = []
                                row.dt.forEach((value) => {
                                    b2carry.push(value);
                                }
                                );
                                jsonObj['b2ca'] = b2carry;
                                break;
                            case 'EXPA':
                                let expWarry = [];
                                let expWoarry = [];
                                row.dt.forEach((value) => {
                                    if (value['exptype'] == 'WPAY') {
                                        expWarry.push(value);
                                        delete value.exptype;
                                    }
                                    else {
                                        expWoarry.push(value);
                                        delete value.exptype;
                                    }
                                }
                                );
                                jsonObj['expwpa'] = expWarry;
                                jsonObj['expwopa'] = expWoarry;
                                break;
                            case 'REVA':
                                let revarry = []
                                row.dt.forEach((value) => {
                                    revarry.push(value);
                                }
                                );
                                jsonObj['reva'] = revarry;
                                break;
                            case 'IMPSA':
                                let impsarry = []
                                row.dt.forEach((value) => {
                                    impsarry.push(value);
                                }
                                );
                                jsonObj['impsa'] = impsarry;
                                break;
                            case 'ECOMA':
                                let ecomarry = []
                                row.dt.forEach((value) => {
                                    ecomarry.push(value);
                                }
                                );
                                jsonObj['ecoma'] = ecomarry;
                                break;
                            case 'IMPGA':
                                let impgarry = []
                                row.dt.forEach((value) => {
                                    impgarry.push(value);
                                }
                                );
                                jsonObj['impga'] = impgarry;
                                break;
                            case 'IMPGSEZA':
                                let impgsezarry = []
                                row.dt.forEach((value) => {
                                    impgsezarry.push(value);
                                }
                                );
                                jsonObj['impgseza'] = impgsezarry;
                                break;
                        }

                        if (jsonObj.profile == impconst.sahaz) {
                            Object.keys(jsonObj).forEach(function (key) {
                                if (key != 'profile' && key != 'gstin' && key != 'issez' && key != 'frq' && key != 'rtnprd' && key != 'b2ca' && key != 'reva') {
                                    delete jsonObj[key];
                                }
                            });
                        }
                        else if (jsonObj.profile == impconst.sugam) {
                            Object.keys(jsonObj).forEach(function (key) {
                                if (key != 'profile' && key != 'gstin' && key != 'issez' && key != 'frq' && key != 'rtnprd' && key != 'b2ca' && key != 'reva') {
                                    delete jsonObj[key];
                                }
                            });
                        }

                        resolve(jsonObj);
                    }
                    else {
                        reject(new Error('No data is retrieved !!'));
                    }
                }
                );
            }
            );

            let finalPayload = await groupJsonService.groupMltplDoc(omitEmpty(createdObject[0]));
            if ((_.isEmpty(finalPayload.reva)) && (_.isEmpty(finalPayload.b2ca)) && (_.isEmpty(finalPayload.expwpa)) && (_.isEmpty(finalPayload.expwopa)) &&
                (_.isEmpty(finalPayload.impsa)) && (_.isEmpty(finalPayload.impga)) && (_.isEmpty(finalPayload.impgseza)) && (_.isEmpty(finalPayload.ecoma))) {
                res.set('Content-Type', 'text/plain');
                res.status(500).send({ message: `No valid data found in excel to import!`, statusCd: 0, mandError: false });
            }
            else {
                logger.log("info", "Entering anx1ImplExcelService.js:: createJsonObject :: Save Json to DB");

                req.body = finalPayload;
                let errJson = await anx1Imp.importExcelJsonA(req, res);
                if (errJson.errObj !== undefined && errJson.errObj !== null && errJson.errObj !== {}) {
                    let errorPayload = omitEmpty(errJson.errObj);
                    let writeDir;
                    if (errJson.isSchemaValid) {
                        writeDir = `json/error_json_A/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'error'}.json`;
                    } else {
                        writeDir = `json/error_json_A/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'schema_error'}.json`;
                    }

                    await fs.writeFileSync(writeDir, JSON.stringify(errorPayload), "utf8",
                        function (err) {
                            if (err) {
                                logger.log('error', 'An error occured while writing error json :: %s', err);
                                sendResponse(res, 500, { message: "An error occured while writing error json !", statusCd: 0, mandError: false });
                                return console.log(err);
                            }
                        }
                    );
                    if (errJson.xflag && errJson.xflag === "Duplicate") {
                        // let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
                        // sendResponse(res, 500, { message: errJson.errObj, statusCd: 0, impError: true, errorFileName: errorFileName });
                        sendResponse(res, 500, { message: errJson.errObj, statusCd: 0, impError: true });
                    } else if (errJson.xflag && errJson.isSchemaValid == true) {
                        // let errorFileName = addFileHistory(upFilename, upFileType, 'P', req.headers);
                        // sendResponse(res, 500, { message: "Valid records were processed successfully! Few records were errored out due to data validation. Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "partial", mandError: false, errorFileName: errorFileName });
                        sendResponse(res, 500, { message: "Valid records were processed successfully! Few records were errored out due to data validation. Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "partial", mandError: false });
                    }
                    else if (!(errJson.isSchemaValid)) {
                        // let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
                        // sendResponse(res, 500, { message: "Processing of imported excel file was not successful. There are one (or) more records where the values added in excel worksheet is not as per expected format (such as text length, date format, number length etc.). Click OK to download excel with error details. Please correct errors and re-import.", statusCd: 0, impError: true, flag: "schema", mandError: false, errorFileName: errorFileName });
                        sendResponse(res, 500, { message: "Processing of imported excel file was not successful. There are one (or) more records where the values added in excel worksheet is not as per expected format (such as text length, date format, number length etc.). Click OK to download excel with error details. Please correct errors and re-import.", statusCd: 0, impError: true, flag: "schema", mandError: false });
                    }
                    else {
                        // let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
                        // sendResponse(res, 500, { message: "All records have failed data validation ! Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "complete", mandError: false, errorFileName: errorFileName });
                        sendResponse(res, 500, { message: "All records have failed data validation ! Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "complete", mandError: false });
                    }
                }
                else {

                    await fs.writeFileSync(`json/excel_to_json/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}.json`, JSON.stringify(finalPayload), "utf8",
                        function (err) {
                            if (err) {
                                logger.log('error', 'An error occured while writing json :: %s', err);
                                sendResponse(res, 500, { message: "An error occured while writing json !", statusCd: 0 });
                                return console.log(err);
                            }
                        }
                    );
                    // let errorFileName = addFileHistory(upFilename, upFileType, 'S', req.headers);
                    sendResponse(res, 200, { message: "Data has been saved successfully.", statusCd: 1 });
                }
            }

        } else {
            let mandErrorjsonObj = {};
            let errArray = [];
            let inValidSections = [];

            let fileType = await getFileType(dataObj, myCache);

            await Promise.map(table_data, (row) => {
                return new Promise((resolve, reject) => {

                    let section = row.cd;
                    errArray = [];

                    if (row.err && fileType == "XLSX") {
                        row.err.forEach((value) => {
                            value = errorGenerationforExcelA(value, section);
                            errArray.push(value);
                        });
                    }
                    else
                        if (row.err && fileType == "CSV") {
                            row.err.forEach((value) => {
                                value = errorGenerationforCSVA(value, section);
                                errArray.push(value);
                            });
                        }

                    if (row.valid == false) {
                        inValidSections.push(section);
                    }

                    mandErrorjsonObj[section.toLowerCase()] = errArray;

                    resolve(mandErrorjsonObj);

                });
            });

            let writeDir = `json/error_json_A/${req.headers.rtnprd.toUpperCase()}_${req.headers.fp}_${req.headers.gstin}_${'mandatory_error'}.json`;

            await fs.writeFileSync(writeDir, JSON.stringify(mandErrorjsonObj), "utf8",
                function (err) {
                    if (err) {
                        logger.log('error', 'An error occured while writing mandatory check error json :: %s', err);
                        sendResponse(res, 500, { message: "An error occured while writing mandatory check error json !", statusCd: 0, flag: 'manderr', mandError: true });
                        return console.log(err);
                    }
                }
            );
            // let errorFileName = addFileHistory(upFilename, upFileType, 'E', req.headers);
            // sendResponse(res, 500, { message: "Mandatory fields are not entered for sheet(s) - " + inValidSections.toString() + ". Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "mandatory", errorFileName: errorFileName });
            sendResponse(res, 500, { message: "Mandatory fields are not entered for sheet(s) - " + inValidSections.toString() + ". Please click on OK to download the excel with error details and retry after correction.", statusCd: 0, impError: true, flag: "mandatory" });
        }

    } catch (err) {
        errorObject = {
            statusCd: errorConstant.STATUS_500,
            message: 'The Excel or CSV file is invalid !! Please enter a valid Excel or CSV file.'
        };
        logger.log("error", "Unexpected error while adding the invoices:: %s", err.message);
        sendResponse(res, 500, errorObject);
        return 0;
    } finally {
        errorObject = null;
    }
    logger.log("info", "Exiting anx1ImplExcelService:: createJsonObject");
};

function errorGenerationforExcelA(obj, tbname) {
    let finalErrObj = {}
    let keys = Object.keys(obj);
    let error = [];
    let columns = getColumnsForMandatoryCheckXlA(tbname);

    for (col of columns) {
        if (!keys.includes(col)) {
            finalErrObj[col] = " ";
            if (col.endsWith('*')) {
                error.push(col + ' should not be blank');
                checkError = true;
            }
            else if (col.endsWith('*_1')) {
                error.push(col.substring(0, col.indexOf('_1')) + ' should not be blank');
                checkError = true;
            }

        } else {
            finalErrObj[col] = obj[col];
        }
    }

    if(tbname === 'REVA' && obj['GSTIN/PAN of Supplier*'].length === 10 ) {
        if(obj[impconst.sup_typ] && obj[impconst.sup_typ].trim() === "" || !obj[impconst.sup_typ]){
            error.push('Supply Type should not be blank');
        }
    }

    
    if (tbname === 'EXPA') {
        if (ReturnStructure.validateShippingDetailsCombo(obj[impconst.ship_date], obj[impconst.pcode_opt], obj[impconst.ship_num]) === false) {
            error.push('Enter port code, shipping bill no. and shipping bill date, if you have entered any one');
        }
    }

    finalErrObj['Error Message'] = error.toString();

    return finalErrObj;
}


function errorGenerationforCSVA(obj, tbname) {
    let finalErrObj = {}
    let keys = Object.keys(obj);
    let error = [];
    let columns = getColumnsForMandatoryCheckCSVA(tbname);

    for (col of columns) {
        if (!keys.includes(col) || (col.endsWith('*') && obj[col].trim() === "")) {
            finalErrObj[col] = " ";
            if (col.endsWith('*')) {
                if (col === 'ODocument Type*') col = 'Document Type*';
                if (col === 'ODocument Number*') col = 'Document Number*';
                if (col === 'ODocument Date*') col = 'Document Date*';
                error.push(col + ' should not be blank');
                checkError = true;
            }

        } else {
            finalErrObj[col] = obj[col];
        }
    }

    if(tbname === 'REVA' && obj['GSTIN/PAN of Supplier*'].length === 10 ) {
        if(obj[impconst.sup_typ] && obj[impconst.sup_typ].trim() === "" || !obj[impconst.sup_typ]){
            error.push('Supply Type should not be blank');
        }
    }


    if (tbname === 'EXPA') {
        if (ReturnStructure.validateShippingDetailsCombo(obj[impconst.ship_date], obj[impconst.pcode_opt], obj[impconst.ship_num]) === false) {
            error.push('Enter port code, shipping bill no. and shipping bill date, if you have entered any one');
        }
    }

    finalErrObj['Error Message'] = error.toString();

    return finalErrObj;
}

function getColumnsForMandatoryCheckXlA(tbname) {

    switch (tbname) {
        case 'B2CA':
            columns = impconst.b2caColumns;
            break;
        case 'EXPA':
            columns = impconst.expaXlColumns;
            break;
        case 'REVA':
            columns = impconst.revaColumns;
            break;
        case 'IMPSA':
            columns = impconst.impsaColumns;
            break;
        case 'ECOMA':
            columns = impconst.ecomaColumns;
            break;
        case 'IMPGA':
            columns = impconst.impgaColumns;
            break;
        case 'IMPGSEZA':
            columns = impconst.impgsezaColumns;
            break;
    }

    return columns;
}

function getColumnsForMandatoryCheckCSVA(tbname) {

    switch (tbname) {
        case 'B2CA':
            columns = impconst.b2caColumns;
            break;
        case 'EXPA':
            columns = impconst.expaCsvColumns;
            break;
        case 'REVA':
            columns = impconst.revaColumns;
            break;
        case 'IMPSA':
            columns = impconst.impsaColumns;
            break;
        case 'ECOMA':
            columns = impconst.ecomaColumns;
            break;
        case 'IMPGA':
            columns = impconst.impgaCsvColumns;
            break;
        case 'IMPGSEZA':
            columns = impconst.impgsezaCSvColumns;
            break;
    }

    return columns;
}

module.exports = {
    saveExcelData: saveExcelData,
    createJsonObject: createJsonObject,
    getFileHistory: getFileHistory,
    saveBlobService: saveBlobService,
    createJsonObjectA: createJsonObjectA,
    saveExcelAData: saveExcelAData
}