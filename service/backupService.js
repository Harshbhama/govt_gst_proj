const rootPath = "../"
const sqlite3 = require('sqlite3').verbose();
const { getRow, getRows, saveRow, runQuery, dbClose } = require(rootPath + "/db/dataBaseConnection");
const Promise = require("bluebird");
const fs = require('fs');
const moment = require('moment');


const offlineTooldb = rootPath + "OFFLINE_TOOL.db";
const gstindb_path = rootPath + "databasefiles/";
const backup_path = rootPath + "databasefiles/backup/";
const seletUserProfile = "SELECT GSTIN as gstin, LGL_TRDNAME as lgl_trdname, ISSEZDEV as issezdev, FILING_FREQUENCY as filing_frequency, RETURN_TYPE as return_type, FP as fp, TAX_PERIOD as tax_period, ISACTIVE as isactive, ANX2_STAT as anx2_stat FROM USER_PROFILE WHERE ISACTIVE = ?";
const insertUserProfile = "INSERT INTO USER_PROFILE (GSTIN, LGL_TRDNAME, ISSEZDEV, FILING_FREQUENCY, RETURN_TYPE, FP, TAX_PERIOD, ISACTIVE, ANX2_STAT) VALUES (?,?,?,?,?,?,?,?,?)";
const userProfileJson = "userprofile.json";
const profileCount = "SELECT count(1) as count FROM USER_PROFILE WHERE ISACTIVE = ?";

logger = {
    log: (...args) => {
        console.log(...args);
    }
}

async function getConnection(dbFileName) {
    logger.log("info", "Entering getConnection");
    let dbObj;
    await new Promise((resolve, reject) => {
        dbObj = new sqlite3.Database(dbFileName, (err) => {
                    return err ? reject(err): resolve();
                }
            );
        }
    );
    logger.log("info", "Exiting getConnection");
    return dbObj;
}

async function getDbNames(dbObj){
    logger.log("info", "inside getDbNames");    
    let rows = await getRows(seletUserProfile, ["Y"], dbObj);
    return rows.map(row => row.gstin + ".db");      
}

async function getBackupDbNames(dbObj, tmstmp){
    logger.log("info", "inside getDbNames");    
    let rows = await getRows(seletUserProfile, ["Y"], dbObj);
    let backupDbNames = null;
    if(tmstmp){
        backupDbNames = rows.map(row => row.gstin + "_" + tmstmp + ".db");
    } else {
        backupDbNames = rows.map(row => row.gstin + ".db");
    }
    return backupDbNames;
}

async function backupApi(dbFileNameSrc, dbFileNameDest){
    logger.log("info", "Entering backupApi");
    let dbObj = null;
    try{
        dbObj = await getConnection(dbFileNameSrc);        
        let backupObj = dbObj.backup(dbFileNameDest);
        backupObj.step(-1);
        backupObj.finish();
    } catch(err){
        logger.log("error","backupService.backupApi|error|err:%s|", err);                        
        throw err;
    } finally {
        await dbClose(dbObj);
    }    
    logger.log("info", "Exiting backupApi");
    return dbFileNameDest;
}

function Profile(gstin, lgl_trdname, issezdev, filing_frequency, return_type, fp, tax_period, isactive, anx2_stat){
    this.gstin = gstin;
    this.lgl_trdname = lgl_trdname;
    this.issezdev = issezdev;
    this.filing_frequency = filing_frequency;
    this.return_type = return_type;
    this.fp = fp;
    this.tax_period = tax_period;
    this.isactive = isactive;
    this.anx2_stat = anx2_stat;
}

async function getProfiles(dbObj){
    logger.log("info", "inside getProfiles");
    let rows = await getRows(seletUserProfile, ["Y"], dbObj);
    let profileObjArr = [];
    rows.forEach(row => {
            let profileObj = new Profile(row.gstin, row.lgl_trdname, row.issezdev, row.filing_frequency, row.return_type, row.fp, row.tax_period, row.isactive, row.anx2_stat);
            profileObjArr.push(profileObj);
        }
    );
    return profileObjArr;
}

async function backupDb(tmstmpFlag){
    logger.log("info", "Entering bkupDb");
    let dbObj = null;
    try{
        dbObj = await getConnection(offlineTooldb);
        let dbNames = await getDbNames(dbObj);
        dbNames.length ? await Promise.resolve() : await Promise.reject("No userprofile found in the database to backup!");
        let profiles = await getProfiles(dbObj);
        let tmstmp = "";
        if(tmstmpFlag){
            tmstmp = moment(new Date()).format("YYYYMMDDHHmmss");
        }
        await bkupProfile(profiles, tmstmp);
        let backupDbNames = await Promise.mapSeries(dbNames, (dbName) => {
                let backupDbName = dbName;
                if(tmstmp){
                    backupDbName = dbName.replace(".db", "_") + tmstmp + ".db";
                }
                return backupApi(gstindb_path + dbName, backup_path + backupDbName);
            }
        );
        logger.log("info","backup of " + backupDbNames.toString() + " Database[s] done!");    
    } catch(err){
        logger.log("error","backupService.bkupDb|error|err:%s|", err);                        
        return 0;
    } finally{
        await dbClose(dbObj);
    }
    logger.log("info", "Exiting bkupDb");
    return 1;
}

function mkdir(dir){
    return new Promise((resolve, reject) => {
            fs.mkdir(dir, { recursive: false }, (err) => {
                    return err && err.code !== "EEXIST" ? reject(err) : resolve();
                }
            );
        }
    );
}

function writeFile(fileName, data){
    return new Promise((resolve, reject) => {
            fs.writeFile(fileName, data, (err) => {
                    return err ? reject(err): resolve();
                }
            );
        }
    );
}

async function bkupProfile(jsonObj, tmstmp){
    logger.log("info", "inside bkupProfile");
    await mkdir(backup_path);
    let backupUserProfileJson = userProfileJson;
    if(tmstmp){
        backupUserProfileJson = userProfileJson.replace(".json", "_") + tmstmp + ".json";                    
    }
    await isFileExists(backup_path + backupUserProfileJson);
    await writeFile(backup_path + backupUserProfileJson, JSON.stringify(jsonObj));   
}

function getLatestBackupTmstmp() {
    let files = fs.readdirSync(backup_path, {encoding: 'utf8', withFileTypes: false});
    let tmstmpArr = [];
    files.forEach((fileName) => {
            var matchStr  = fileName.match("_(.*).json");
            if(matchStr){
                tmstmpArr.push(matchStr[1]);
            }            
        }
    );
    let latestTmstmp = tmstmpArr.sort((a,b)=>a-b)[tmstmpArr.length - 1];
    return latestTmstmp;
}


async function restoreProfile(dbObj, tmstmp){
    logger.log("info", "inside restoreProfile");
    let backupUserProfileJson = userProfileJson;
    if(tmstmp){
        backupUserProfileJson = userProfileJson.replace(".json", "_") + tmstmp + ".json";
    }    
    let jsonStr = fs.readFileSync(backup_path + backupUserProfileJson, {encoding: 'utf8', flag: 'r'});
    let row = await getRow(profileCount, ["Y"], dbObj);
    JSON.parse(jsonStr).length ? await Promise.resolve() : await Promise.reject("userprofile backup file is empty");
    if(!row.count){
        await Promise.mapSeries(JSON.parse(jsonStr), (profileObj) => {
            return saveRow(insertUserProfile, [profileObj.gstin, profileObj.lgl_trdname, profileObj.issezdev, profileObj.filing_frequency, profileObj.return_type, profileObj.fp, profileObj.tax_period, profileObj.isactive, profileObj.anx2_stat], dbObj);
            } 
        );
        
    } else {
        return Promise.reject("profile already exists in USER_PROFILE table")
    }     
}

async function isDbFileExists(path, dbNames){
    logger.log("info", "inside isDbFileExists");
    await Promise.mapSeries(dbNames, (dbName) => {
            return fs.existsSync(path + dbName) ? Promise.reject(dbName + " file already exists in the destination") : Promise.resolve();
        }
    );
}

function isFileExists(fileName){
    logger.log("info", "inside isFileExists");
    return fs.existsSync(fileName) ? Promise.reject(fileName + " file already exists in the destination") : Promise.resolve();      
}

async function restoreSqliteDb(dbObj, tmstmp){
    logger.log("info", "Entering restoreSqliteDb");
    let backupDbNames = await getBackupDbNames(dbObj, tmstmp);
    let destDbNames = await getDbNames(dbObj);
    await isDbFileExists(gstindb_path, destDbNames);    
    await Promise.mapSeries(backupDbNames, (backupDbName) => {
            let destDbName = backupDbName;
            if(tmstmp){
                destDbName = backupDbName.replace("_" + tmstmp, "");
            }
            return backupApi(backup_path + backupDbName, gstindb_path + destDbName);
        }
    );
    logger.log("info", "Exiting restoreDb");
    return backupDbNames;
}

async function restoreDb(tmstmp){
    logger.log("info", "Entering restore");
    let dbObj = null;
    try{
        dbObj = await getConnection(offlineTooldb);
        await runQuery("BEGIN", [], dbObj);
        await restoreProfile(dbObj, tmstmp);
        let backupDbNames = await restoreSqliteDb(dbObj, tmstmp);
        await runQuery("COMMIT", [], dbObj);
        logger.log("info","Database[s] " + backupDbNames +" restored!");    
    } catch(err){
        logger.log("error","backupService.restore|error|rollback|err:%s|", err);                        
        await runQuery("ROLLBACK", [], dbObj);
        return 0;    
    } finally{
        await dbClose(dbObj);
    }
    logger.log("info", "Exiting restore");
    return 1;   
}


function doRestore(){
    let tmstmp = getLatestBackupTmstmp();
    console.log("jaggu:tmstmp:", tmstmp);
    restoreDb(tmstmp);
}


function dobackup(){
    let tmstmpFlag = true;
    backupDb(tmstmpFlag);
}

// dobackup();
// doRestore();
