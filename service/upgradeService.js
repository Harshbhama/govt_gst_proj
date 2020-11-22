/**
 * @file This module helps us to migrated the exisitng data in the sqlite database to the new version when installed.
 * @author Jagadeesh Rajendran.
 * @since 2019-08-08.
 */

const rootPath = "../";
const Promise = require("bluebird");
const fs = require('fs');
const fse = require('fs-extra');
const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
const mv = Promise.promisify(fs.rename);
const exec = require('child_process').exec;
const logger  = require(rootPath + '/utility/verLogger').logger;
const { getRow, getRows, saveRow, runQuery, dbClose } = require(rootPath + "/db/dbUtil");
const { CURRENT_VERSION, OFFLINE_TOOL_DB, DB_EXT } = require(rootPath + '/utility/constants');
const { VERSION_HISTORY, RESTORE_GRAPH } = require(rootPath + '/utility/versionUtil');


const userProfileJson = "userprofile.json";
const gstinMasterJson = "gstinmaster.json";
const appRootDir = "./";
const dbRootDir = appRootDir + "dbfiles" + "/";
const offlineTooldb = "OFFLINE_TOOL.db";
const selectUserProfile = "SELECT * FROM USER_PROFILE WHERE ISACTIVE = ?";
const selectGstinMaster = "SELECT * FROM GSTIN_MASTER";
const profileCount = "SELECT count(1) as count FROM USER_PROFILE WHERE ISACTIVE = ?";

/**
 * creates database connection object and returns the same.
 * @param {string} dbFileName absolute path of database file.
 * @return {object} database connection object.
 */
async function getConnection(dbFileName) {
    logger.log("info", "Entering getConnection");
    logger.log("info", "dbFileName:", dbFileName);    
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

 /**
 * queries offline tool db for gstin database file names and returns the same.
 * @param {object} dbObj database connection object.
 * @return {object} returns array of string containing gstin database file names.
 */
async function getDbNames(dbObj){
    logger.log("info", "inside getDbNames");    
    let rows = await getRows(selectUserProfile, ["Y"], dbObj);
    return rows.map(row => row["GSTIN"] + ".db");      
}

 /**
 * calls core backup api to do backup functionality.
 * @param {string} dbFileNameSrc absolute path of source database file name.
 * @param {string} dbFileNameDest absolute path of destination database file name.
 */
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

 /**
 * queries userprofile table to get the active profiles available.
 * @param {object} dbObj database connection object.
 * @return {object} database resultset object containing active userprofiles from offline tool db.
 */
async function getProfiles(dbObj){
    logger.log("info", "inside getProfiles");
    let rows = await getRows(selectUserProfile, ["Y"], dbObj);
    return rows;
}

 /**
 * queries gstinmaster table to get the gstin available.
 * @param {object} dbObj database connection object.
 * @return {object} database resultset object containing gstin data from offline tool db.
 */
async function getGstinMaster(dbObj){
    logger.log("info", "inside getGstinMaster");
    let rows = await getRows(selectGstinMaster, [], dbObj);
    return rows;
}

 /**
 * takes backup of userprofile and gstinmaster data from installed version of offlinetool db and stores those contents 
 * in json files. it does this job by calling getConnection(), getDbNames(), getProfiles(), getGstinMaster(), writeFile()
 * functions in sequence.
 * @param {string} dbPath absolute path of database directory.
 * @return {number} method returns number 0 for failure and 1 for success.
 */
async function backupDb(dbPath){
    logger.log("info", "Entering backupDb");
    let dbObj = null;
    try{
        dbObj = await getConnection(dbPath + OFFLINE_TOOL_DB + DB_EXT);
        let dbNames = await getDbNames(dbObj);
        dbNames.length ? await Promise.resolve() : await Promise.reject("No userprofile found in the database to backup!");
        let profileJsonObj = await getProfiles(dbObj);
        let gstinMastersJson = await getGstinMaster(dbObj);        
        await writeFile(dbPath + userProfileJson, JSON.stringify(profileJsonObj));
        await writeFile(dbPath + gstinMasterJson, JSON.stringify(gstinMastersJson));       
        logger.log("info","backup of " + dbPath  + userProfileJson + " is done!");
        logger.log("info","backup of " + dbPath  + gstinMasterJson + " is done!");    
    } catch(err){
        logger.log("error","backupService.bkupDb|error|err:%s|", err);                        
        return 0;
    } finally{
        await dbClose(dbObj);
    }
    logger.log("info", "Exiting backupDb");
    return 1;
}

 /**
 * writes the contents to a files.
 * @param {string} fileName absolute path of file.
 * @param {string} data data to write to file.
 * @return {object} promise.
 */
function writeFile(fileName, data){
    logger.log("info", "inside writeFile");
    return new Promise((resolve, reject) => {
            fs.writeFile(fileName, data, (err) => {
                    return err ? reject(err): resolve();
                }
            );
        }
    );
}

 /**
 * reads UserProfileJson and GstinMasterJson file converts to javascript object and saves the data in current version
 * database offline db.
 * @param {string} oldDbPath absolute database dir path of installed version.
 * @param {object} sqlScripts appropriate DDL and/or DML scripts to execute.
 * @param {object} dbObj database connection object.
 */
async function restoreProfile(oldDbPath, sqlScripts, dbObj){
    logger.log("info", "inside restoreProfile");
    let backupUserProfileJson = userProfileJson;
    let backupGstinMasterJson = gstinMasterJson;    
    let profileJsonStr = fs.readFileSync(oldDbPath + backupUserProfileJson, {encoding: 'utf8', flag: 'r'});
    let masterJsonStr = fs.readFileSync(oldDbPath + backupGstinMasterJson, {encoding: 'utf8', flag: 'r'});    
    JSON.parse(profileJsonStr).length ? await Promise.resolve() : await Promise.reject("userprofile backup file is empty");
    JSON.parse(masterJsonStr).length ? await Promise.resolve() : await Promise.reject("gstinmaster backup file is empty");
    let row = await getRow(profileCount, ["Y"], dbObj);
    if(!row.count){
        await Promise.mapSeries(JSON.parse(profileJsonStr), (profileObj) => {
                let param = sqlScripts.userProfile[0].param.map( (column) => {
                        return profileObj[column]
                    }
                );
                return saveRow(sqlScripts.userProfile[0].query, param, dbObj);
            } 
        );
        await Promise.mapSeries(JSON.parse(masterJsonStr), (masterObj) => {
                let param = sqlScripts.userProfile[1].param.map( (column) => {
                        return masterObj[column]
                    }
                );
                return saveRow(sqlScripts.userProfile[1].query, param, dbObj);
            } 
        );        
    } else {
        return Promise.reject("profile already exists in USER_PROFILE table")
    }     
}

 /**
 * checks whether given gstin databases exists in a current version database directory.
 * @param {string} path database directory path.
 * @param {string} dbNames array of gstin database file names.
 */
async function isDbFileExists(path, dbNames){
    logger.log("info", "inside isDbFileExists");
    await Promise.mapSeries(dbNames, (dbName) => {
            return fs.existsSync(path + dbName) ? Promise.reject(dbName + " file already exists in the destination") : Promise.resolve();
        }
    );
}

 /**
 * restores gstin databases by calling backupApi() function. it gets gstin database names from the function getDbNames().
 * @param {string} oldDbPath absolute path of existing version database directory.
 * @param {string} newDbPath absolute path of current version database directory.
 * @param {object} dbObj database connection object.
 */
async function restoreSqliteDb(oldDbPath, newDbPath, dbObj){    
    logger.log("info", "Entering restoreSqliteDb");
    let gstinDbNames = await getDbNames(dbObj);
    await isDbFileExists(newDbPath, gstinDbNames);    
    await Promise.mapSeries(gstinDbNames, (backupDbName) => {
            let destDbName = backupDbName;           
            return backupApi(oldDbPath + backupDbName, newDbPath + destDbName);
        }
    );
    logger.log("info", "Exiting restoreSqliteDb");
    return gstinDbNames;
}

 /**
 * removes database files that is migrated if the upgrade failes due to error. this is done by comparing preList with
 * postList objects.
 * @param {string} oldDbPath absolute database dir path of installed version.
 * @param {string} newDbPath absolute database dir path of current version.
 * @param {object} preList object containing filenames of existing version and current version.
 */
async function rollbackFiles(oldDbPath, newDbPath, preList){
    logger.log("info", "Entering rollbackFiles");
    let postList =   { 
        "versionToBkup" : getFileNames(oldDbPath),
        "upgradeToVersion" : getFileNames(newDbPath)
    };
    let arr1 = postList["upgradeToVersion"];
    let arr2 = preList["upgradeToVersion"];
    logger.log("info", "rollbackFiles|arr1:", arr1, "|arr2:", arr2, "|");
    let diff = arr1.filter(x => !arr2.includes(x));
    await Promise.mapSeries(diff, (fileName) => {
        return fse.unlink(newDbPath + fileName)
    });
    logger.log("info", "Exiting rollbackFiles");
}

 /**
 * cleans up existing version database directory by comparing preList with postList objects.
 * @param {string} oldDbPath absolute database dir path of installed version.
 * @param {string} newDbPath absolute database dir path of current version.
 * @param {object} preList object containing filenames of existing version and current version.
 */
async function cleanupFiles(oldDbPath, newDbPath, preList){
    logger.log("info", "Entering cleanupFiles");
    let postList =   { 
        "versionToBkup" : getFileNames(oldDbPath),
        "upgradeToVersion" : getFileNames(newDbPath)
    };
    let arr1 = postList["versionToBkup"];
    let arr2 = preList["versionToBkup"];
    logger.log("info", "cleanupFiles|arr1:", arr1, "|arr2:", arr2, "|");
    let diff = arr1.filter(x => !arr2.includes(x));
    await Promise.mapSeries(diff, (fileName) => {
        return fse.unlink(oldDbPath + fileName)
    });
    logger.log("info", "Exiting cleanupFiles");
}

 /**
 * the status of this upgrade service is logged in a json file versionStatus.json if it is success.
 * @param {string} versionToBkup existing version installed in the system.
 * @param {string} upgradeToVersion current version to upgrade to.
 * @param {string} offlinedbName OFFLINE_TOOL.db name.
 * @param {string} oldDbNames gstin db names.
 * @return {object} database connection object.
 */
async function updateStatus(versionToBkup, upgradeToVersion, offlinedbName, oldDbNames){
    logger.log("info", "Entering updateStatus");
    let statusFile = dbRootDir + "others/" + "versionStatus.json";
    let statusJson = {};
    if(isFileExists(statusFile)){
        statusJson = fs.readFileSync(statusFile, {encoding: 'utf8', flag: 'r'});    
    }
    let statusObj = JSON.parse(statusJson);
    statusObj[versionToBkup] = {
        "upgradedFromVerion" : versionToBkup,
        "updgradedToVersion" : upgradeToVersion,
        "date" : moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        "listOfTablesMigrated" : [offlinedbName, ...oldDbNames]
    }
    await writeFile(statusFile, JSON.stringify(statusObj));
    logger.log("info", "Entering updateStatus");
}

 /**
 * rename existing version database directory with timestamp.
 * @param {string} srcFolder absolute path of existing version database directory.
 * @param {string} destFolder absolute path of new folder name for existing version database directory.
 * @param {oldDbPath} srcFolder absolute path of existing version database directory.
 * @return {string} returns absolute path of existing version database directory.
 */
async function archiveVerToBkupFolder(srcFolder, destFolder, oldDbPath){
    try {
        await mv(srcFolder, destFolder);
        oldDbPath = destFolder + "/";
    } catch (err) {
        logger.log("error", "archiveVerToBkupFolder|err:", err);
    }
    return oldDbPath;
}

 /**
 * creates database connection object and returns the same.
 * @param {string} versionToBkup existing version installed in the system.
 * @param {string} upgradeToVersion current version to upgrade to.
 * @param {object} sqlScripts appropriate DDL and/or DML scripts to execute.
 * @param {object} preList object containing filenames of existing version and current version.
 * @return {number} method returns number 0 for failure and 1 for success.
 */
async function upgradeToCurrentVersion(versionToBkup, upgradeToVersion, sqlScripts, preList){
    logger.log("info", "Entering upgradeToCurrentVersion");
    let dbObj = null;
    let oldDbPath = dbRootDir + versionToBkup + "/";    
    let  newDbPath = dbRootDir + upgradeToVersion + "/";
    let oldDbNames = [];
    logger.log("info", "oldDbPath:", oldDbPath, "|newDbPath:", newDbPath, "|");    
    try{
        dbObj = await getConnection(newDbPath + OFFLINE_TOOL_DB + DB_EXT);
        await runQuery("BEGIN", [], dbObj);
        await restoreProfile(oldDbPath, sqlScripts, dbObj);
        oldDbNames = await restoreSqliteDb(oldDbPath, newDbPath, dbObj);
        await executeOfflinedbScripts(sqlScripts, dbObj);
        await executeGstindbScripts(newDbPath, sqlScripts, dbObj);
        await updateStatus(versionToBkup, upgradeToVersion, OFFLINE_TOOL_DB + DB_EXT, oldDbNames);
        oldDbPath = await archiveVerToBkupFolder(dbRootDir + versionToBkup, dbRootDir + versionToBkup + "_" + moment(new Date()).format("YYYYMMDD"), oldDbPath);
        await runQuery("COMMIT", [], dbObj);
        logger.log("info","Database[s] " + oldDbNames +" restored!");
    } catch(err){
        logger.log("error","backupService.restore|error|rollback|err:%s|", err);                        
        await runQuery("ROLLBACK", [], dbObj);
        await rollbackFiles(oldDbPath, newDbPath, preList);
        return 0;    
    } finally{
        await cleanupFiles(oldDbPath, newDbPath, preList);
        await dbClose(dbObj);        
    }
    logger.log("info", "Exiting upgradeToCurrentVersion");
    return 1;   
}

/**
 * retuns list of directory names under a directory.
 * @param {string} path absolute pathname of a directory
 * @return {object} returns array of string containing directorynames if any
 */
function getDirs(path) {
    logger.log("info", "inside getDirs");
    return fs.readdirSync(path).filter((file) => fs.statSync(path+'/'+file).isDirectory());
}

/**
 * retuns list of filenames under a directory.
 * @param {string} path absolute pathname
 * @return {object} returns array of string containing filenames if any
 */
function getFileNames(path) {
    logger.log("info", "inside getFileNames");
    return fs.readdirSync(path).filter((file) => fs.statSync(path+'/'+file).isFile);
}


/**
 * checks whether given file exists.
 * @param {string} path absolute pathname
 * @return {boolean} returns true or false
 */
function isFileExists(path){
    logger.log("info", "inside isFileExists");
    return fs.existsSync(path);
}

/**
 * checks whether given folder exists.
 * @param {string} path absolute pathname
 * @return {boolean} returns true or false
 */
function isFolderExists(path){
    logger.log("info", "inside isFolderExists");
    return fs.existsSync(path);
}

 /**
 * moves beta_v0.1 version db files to dbRootDir\beta_v0.1 folder. It checks whether db files already exists in the 
 * destination before moving the files. It also deletes the databasefiles/ directory.
 */
async function move_betaFiles(){
    logger.log("info", "Entering move_betaFiles");
    let beta = {
        "OFFLINE_TOOL.db_path" : appRootDir, 
        "gstin.db_path" : appRootDir + "databasefiles/",
        "newPath" : dbRootDir + "beta_v0.1/"
    }         
    if(isFileExists(beta["OFFLINE_TOOL.db_path"] + offlineTooldb) && !isFileExists(beta.newPath + offlineTooldb)){
        await fse.mkdirp(beta.newPath);
        await mv(beta["OFFLINE_TOOL.db_path"] + offlineTooldb, beta.newPath + offlineTooldb);                             
    }
    if(isFolderExists(beta["gstin.db_path"])){
        await fse.mkdirp(beta.newPath);
        await Promise.mapSeries(getFileNames(beta["gstin.db_path"]), (dbFile) => {
                if(!isFileExists(beta.newPath + dbFile)){
                    return mv(beta["gstin.db_path"] + dbFile, beta.newPath + dbFile);
                } else {
                    logger.log("error", "file already exists:", beta.newPath + dbFile);
                }                
            }
        );
        let oldDbfiles = await fse.readdir(beta["gstin.db_path"]);
        if(!oldDbfiles.length){
            await fse.rmdir(beta["gstin.db_path"])
        }
    }
    logger.log("info", "Exiting move_betaFiles");
}

 /**
 * calls getDirs() which retuns list of directory names under a directory.
 * @param {string} dbDir absolute path of database root directory.
 * @return {object} returns array of string containing directorynames if any.
 */
function getInstalledVersions(dbDir){
    logger.log("info", "inside getInstalledVersions");
    return getDirs(dbDir);
}

 /**
 * calls move_betaFiles() function. uses VERSION_HISTORY, CURRENT_VERSION constants and scans user machine to 
 * identify existing version installed in the user machine. it returns existing version, upgrade to version and
 * list of files name in the exisitng version.
 * @return {object} returns array containing versionToBkup, upgradeToVersion, preList.
 */
async function bkupPrevVersion(){
    logger.log("info", "Entering bkupPrevVersion");
    await move_betaFiles();
    let versionToBkup = "", upgradeToVersion = "", preList = {};
    logger.log("info", "VERSION_HISTORY:", JSON.stringify(VERSION_HISTORY));
    let versionHistory = VERSION_HISTORY.slice(0).reverse();    
    versionHistory.shift();
    let installedVersions = getInstalledVersions(dbRootDir);
    logger.log("info", "installedVersions:", JSON.stringify(installedVersions));
    versionHistory.every((version) => {
            if(installedVersions.includes(version)){
                versionToBkup = version;
                return false;
            }
            return true;
        }
    );
    logger.log("info","versionToBkup:", versionToBkup);    
    Object.keys(RESTORE_GRAPH).forEach(function(key) {
            if(key == versionToBkup){
                if(RESTORE_GRAPH[key].upgradableArr.includes(CURRENT_VERSION)){
                    upgradeToVersion = CURRENT_VERSION;
                    return false;
                }                
            }
            return true;
        }
    );
    if(versionToBkup && upgradeToVersion){
        let dbPath = dbRootDir + versionToBkup + "/";
        logger.log("info","dbPath:", dbPath);
        preList =   { 
                        "versionToBkup" : getFileNames(dbRootDir + versionToBkup + "/"),
                        "upgradeToVersion" : getFileNames(dbRootDir + upgradeToVersion + "/")
                    };        
        await backupDb(dbPath);    
    } else {
        logger.log("info", "bkup not done!");
        logger.log("info","versionToBkup:", versionToBkup, "|upgradeToVersion:", upgradeToVersion, "|");
        await Promise.reject("versionToBkup:" + versionToBkup + "|upgradeToVersion:" + upgradeToVersion + "|" + "bkup not done!");
    }
    logger.log("info", "Exiting bkupPrevVersion");
    return [versionToBkup, upgradeToVersion, preList];
}

 /**
 * executes DDL and/or DML scripts associated to offline tool db.
 * @param {object} sqlScripts appropriate DDL and/or DML scripts to execute.
 * @param {object} dbObj database connection object.
 */
async function executeOfflinedbScripts(sqlScripts, dbObj){
    logger.log("info", "Entering executeOfflinedbScripts");
    await Promise.mapSeries(sqlScripts.offlinedb, (sqlScript) => {
            return runQuery(sqlScript, [], dbObj)
        }
    );
    logger.log("info", "Exiting executeOfflinedbScripts");
}

 /**
 * executes DDL and/or DML scripts associated to gstin db. It does this job recursively for all the gstin database
 * available in the userprofile.
 * @param {string} newDbPath absolute path of current version of database directory
 * @param {object} sqlScripts appropriate DDL and/or DML scripts to execute.
 * @param {object} dbObj database connection object.
 */
async function executeGstindbScripts(newDbPath, sqlScripts, dbObj){
    logger.log("info", "Entering executeGstindbScripts");
    let gstinDbNames = await getDbNames(dbObj);
    let getinDbConnArr = [];
    await Promise.mapSeries(gstinDbNames, (gstinDbName) => {
            return getConnection(newDbPath + gstinDbName)
                .then((dbConn) => getinDbConnArr.push(dbConn));            
        }
    );
    try{
        await Promise.mapSeries(getinDbConnArr, (dbObj) => {
                return runQuery("BEGIN", [], dbObj)
                    .then(() => (Promise.mapSeries(sqlScripts.gstindb, (sqlScript) => {
                                return runQuery(sqlScript, [], dbObj);
                            }
                    )));
            }
        );
        await Promise.mapSeries(getinDbConnArr, (dbObj) => {
                return runQuery("COMMIT", [], dbObj);
            }
        );
    } catch(err){
        logger.log("error","restoreDataService.executeGstindbScripts|error|rollback|err:%s|", err);
        await Promise.mapSeries(getinDbConnArr, (dbObj) => {
                return runQuery("ROLLBACK", [], dbObj);
            }
        );                        
        return 0;    
    } finally{
        await Promise.map(getinDbConnArr, (dbObj) => {
                return dbClose(dbObj);
            }
        );        
    }
    logger.log("info", "Exiting executeGstindbScripts");
    return 1;
}

/**
 * wrapps the exec() function with promise and returns the same.
 * @param {string} cmd windows command to execute.
 * @return {object} promise 
 */
function execCmd(cmd){
    return new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => resolve(stdout));
        }
    );
}

 /**
 * logs existing files in the directory and subdirectories with their size and timestamp.
 */
async function logExistingFiles(){
    logger.log("info", "Entering logExistingFiles");

    let listOfDirs = getDirs(appRootDir);
    listOfDirs = listOfDirs.filter((dir) => dir != "node_modules");
    let paramStr = ""
    listOfDirs.forEach((dir) => {
          paramStr = paramStr + ".\\" + dir + " ";
        }
    );
    let dirCmdOutput = await execCmd("dir /O:N /T:W .\\");
    logger.log("debug", "|<<dir /O:N /T:W .\\>>|", Buffer.from(dirCmdOutput).toString('base64'));
    dirCmdOutput = await execCmd("dir /S /O:N /T:W " + paramStr);
    logger.log("debug", "|<<dir /S /O:N /T:W " + paramStr + ">>|",Buffer.from(dirCmdOutput).toString('base64'));

    logger.log("info", "Existing logExistingFiles");
}

 /**
 * calls functions logExistingFiles, bkupPrevVersion, upgradeToCurrentVersion in sequence for doing upgrade functionality.
 */
async function upgrade(){
    logger.log("info", "Entering upgrade");
    try{
        await logExistingFiles();
        logger.log("debug", "|before upgrade|");        
        let [versionToBkup, upgradeToVersion, preList] = await bkupPrevVersion();
        let sqlScripts = RESTORE_GRAPH[versionToBkup][upgradeToVersion];
        await upgradeToCurrentVersion(versionToBkup, upgradeToVersion, sqlScripts, preList);     
        logger.log("info", "upgrade successful!");    
    } catch(err){
        logger.log("info", "upgrade not done|", err);
    }
    await logExistingFiles();
    logger.log("debug", "|after upgrade|");
    logger.log("info", "Exiting upgrade");
}

/**
 * executes stopnode.bat file to stop the server if any running at 2010 port and calls the upgrade function.
 */
function stopNodejsAndUpgrade(){
    logger.log("info", "Entering stopNodejsAndUpgrade");
    let stopnodejs = exec(process.cwd() + "\\winstaller\\stopnode.bat", (err, stdout, stderr) => {           
        logger.log("info", "executed:", process.cwd() + "\\winstaller\\stopnode.bat");  
        }
    );
    stopnodejs.on("close", upgrade);
    logger.log("info", "Exiting stopNodejsAndUpgrade");
}

stopNodejsAndUpgrade();
