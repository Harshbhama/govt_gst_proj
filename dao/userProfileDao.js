const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require("fs");
const _ = require("lodash");
const { query } = require('../db/Queries');
const db = require('../db/dbUtil');
const { ProfileConstants } = require('../utility/errorconstants');
const { OFFLINE_TOOL_DB, STATUS_CD_ZERO, STATUS_CD_ONE, DB_PATH, DB_EXT } = require('../utility/constants');
const log  = require('../utility/logger');
const logger = log.logger;


//------------------------TO GET all GSTINs from GSTIN_MASTER-------------------------------------
function getGstMstrList(req, res) {

	
	logger.log("info", "Entering userProfileDao.js :: getGstMstrList");

	return new Promise(function (resolve, reject) {

		return db.fetchAll(query.gstinMaster.getAllGstin, OFFLINE_TOOL_DB)
			.then((rows, err) => {
				if (err) {
					logger.log("error", "userProfileDao.js :: Error in fetching data :: getGstMstrList :: %s",err);
					reject({ error: err, statusCd: STATUS_CD_ZERO });
				}
				else {
					logger.log("debug", "userProfileDao.js :: getGstMstrList :: Rows fetched are ::%s",rows);
					resolve(rows);
				}
			}).catch((err) => {
				
				logger.log("error", "userProfileDao.js :: Error in catch block :: getGstMstrList :: %s",err);

				reject({ error: err, statusCd: STATUS_CD_ZERO });

			});

	});
}

function getStatMstrList(req, res){
	
	logger.log("info", "Entering userProfileDao.js :: getStatMstrList");
	return new Promise(function (resolve, reject) {

		return db.fetchAll(query.stateMaster.getall, OFFLINE_TOOL_DB)
			.then((rows, err) => {
				if (err) {
					console.log(err);
					logger.log("error","userProfileDao.js :: Error in fetching data :: getStatMstrList :: %s", err);
					reject({ error: err, statusCd: STATUS_CD_ZERO });
				}
				else {
					logger.log("debug", "userProfileDao.js :: getStatMstrList :: Rows fetched are ::%s",rows);
					resolve(rows);
				}
			}).catch((err) => {
				logger.log("error", "userProfileDao.js :: Error in catch block :: getStatMstrList :: %s",err);
				reject({ error: err, statusCd: STATUS_CD_ZERO });
			});

	});
}

//------------------------TO GET active profile detail of the selected GSTIN -------------------------------------
function getActiveUserProfile(gstin) {

	

	logger.log("info", "Entering userProfileDao.js :: getActiveUserProfile for gstin :: %s",gstin);

	return new Promise(function (resolve, reject) {

		return db.fetchById(query.profile.getActiveProfileForGstin, gstin, OFFLINE_TOOL_DB)
			.then((rows, err) => {
				if (err) {
					logger.log("error","userProfileDao.js :: Error in fetching data :: getActiveUserProfile :: %s", err);
					reject({ error: err, statusCd: STATUS_CD_ZERO });
				}
				else {
					if (rows === undefined) {
						logger.log("info", "Entering userProfileDao.js :: getActiveUserProfile :: Rows are undefined !! ");
						resolve("{}");
					} else {
						logger.log("debug", "userProfileDao.js :: getActiveUserProfile :: Rows fetched are ::%s",rows);
						resolve(rows);
						
					}
				}
			}).catch((err) => {
				logger.log("error", "userProfileDao.js :: Error in catch block :: getActiveUserProfile :: %s",err);
				reject({ error: err, statusCd: STATUS_CD_ZERO })
			});
	});
}



//------------------------To update user profile details on login -------------------------------------
function updateProfileOnLogin(profileObj) {

	let gstin = profileObj.gstin.toUpperCase();

	
	logger.log("info", "Entering userProfileDao.js :: updateProfileOnLogin for gstin :: %s",gstin);

	return new Promise(function (resolve, reject) {

		let returnPeriod;

		return db.fetchById(query.profile.getActiveProfileForGstin, gstin, OFFLINE_TOOL_DB)
			.then((rows, err) => {
				if (err) {
					logger.log("error","userProfileDao.js :: Error in fetching data :: updateProfileOnLogin :: %s", err);
				}
				else {
					
					if(rows === undefined){
						logger.log("info", "Entering userProfileDao.js :: updateProfileOnLogin :: Rows are undefined !! ");
						resolve({ message: "Profile is inactive", statusCd: STATUS_CD_ZERO});
					}

					let activeProfile = {
						gstin: rows.gstin,
						lgltrdname: rows.lgltrdname,
						issezdev: rows.issezdev,
						filingfrequency: rows.filingfrequency,
						returntype: rows.returntype,
						fp: rows.fp,
						taxperiod: rows.taxperiod,
						activeFlag: rows.isactive
					}
					logger.log("debug", "userProfileDao.js :: updateProfileOnLogin :: Active Profile :: %s",activeProfile);
					return activeProfile;
				}
			}).then((activeProfile) => {

				returnPeriod = calculateReturnPeriod(profileObj.fp, profileObj.taxperiod);

				if ((activeProfile.fp === 'NA' && activeProfile.taxperiod === 'NA') ||
					(activeProfile.fp === null && activeProfile.taxperiod === null)) {
					logger.log("info", "userProfileDao.js :: updateProfileOnLogin :: First time login for GSTIN :: %s",gstin);
					return db.save(query.profile.updateFYandTP, [profileObj.fp, profileObj.taxperiod, gstin], OFFLINE_TOOL_DB);
				}
				else if (activeProfile.fp === profileObj.fp && activeProfile.taxperiod === profileObj.taxperiod) {
					logger.log("info", "userProfileDao.js :: updateProfileOnLogin :: No change in FY and Taxperiod");
					return true;
				}
				else {

					return new Promise(function (resolve, reject) {

					
						logger.log("info", "userProfileDao.js :: updateProfileOnLogin :: Set Inactive for current profile");
						// Update the existing active record to inactive
						return db.save(query.profile.updateActiveFlag, [gstin], OFFLINE_TOOL_DB)
							.then((rows, err) => {
								if (err) {
									console.log(err);
									logger.log("error","userProfileDao.js :: updateProfileOnLogin :: Error in fetching data :: %s", err);
									reject({ error: err});
								}
								else {
									
									logger.log("info", "userProfileDao.js :: updateProfileOnLogin :: Create new active profile");
									/** Insert a record into User Profile table */
									resolve(db.save(query.profile.insert, [activeProfile.gstin,
									activeProfile.lgltrdname, activeProfile.issezdev,
									activeProfile.filingfrequency, activeProfile.returntype,
									profileObj.fp, profileObj.taxperiod, 'Y'	
									], OFFLINE_TOOL_DB));
								
								}
							}).catch((err) => {
								logger.log("error", "userProfileDao.js :: Error in catch block db save:: updateProfileOnLogin :: %s",err);
								reject({ error: err, statusCd: STATUS_CD_ZERO });
							});
				
					});
				
				}
			}).then((isProfileUpdated) => {
				resolve({ message: "SUCCESS", statusCd: STATUS_CD_ONE, retPeriod: `${returnPeriod}`});
			})
			.catch((err) => {
				logger.log("error", "userProfileDao.js :: Error in catch block :: updateProfileOnLogin :: %s",err);
				reject({ error: err, statusCd: STATUS_CD_ZERO })
			});
	});

}


/**
 * ***************************** Create User Profile  *********************************** 
 */

async function prepareGstinMaster(gstinMaster) {
	let  insertRow = await _.reduce(gstinMaster, (accumulaterRow, row) =>{
		return accumulaterRow + `,` + `( "${row.gstin}", "${row.lgltrdname || null}" )` 
	  },[]).substring(1)
		return insertRow ;
  }


  async function prepareGstinProfile(profile) {
	let  insertRow = await _.reduce(profile, (accumulaterRow, row) =>{
		return accumulaterRow + `,` + `( "${row.gstin}", "${row.lgltrdname}",'${row.issezdev}', "${row.filingfrequency}", 
		"${row.returntype || null}", "${row.fp || ''}" , "${row.taxperiod || ''}", '${row.isactive}', '${row.matchngRsltAvbl}' )`  
	  },[]).substring(1)
	return insertRow ;
  }
async function createProfileDao(profileObjects) {
	logger.log("info","Starting createProfileDao : %s  ::  %s", new Date().getTime(), new Date().toString());
	
	let offlinedb = new sqlite3.Database(DB_PATH + OFFLINE_TOOL_DB + DB_EXT);
	  try {
	  
		  offlinedb.exec('BEGIN TRANSACTION;');   
		  let gstinList = _.map(profileObjects,'gstin')
		  let getGstinMasterList = await db.fetchAllByIdTxn(query.gstinMaster.getByGstinTxn, gstinList, offlinedb, true)
		  
			// take only profile objects which is not present in gstin master table 
		 let profileGstinSave = _.differenceBy(profileObjects, getGstinMasterList, 'gstin');

		 if(profileGstinSave.length > 0)
		 {
		  let gstinMasterTab = await db.saveTxn(query.gstinMaster.insertTxn + await prepareGstinMaster(profileGstinSave), [],offlinedb)
		}
		  let profileActive = await db.fetchAllByIdTxn(query.profile.checkProfileIsActiveTxn,gstinList, offlinedb, true)
				
		  let alreadyExistMessages = await profileAlreadyExistRecords(profileActive)

			let profileSave = await pickProfileToSave(profileObjects, profileActive);
			let createProfileMessage = []

		if(profileSave.length > 0){
			 await db.saveTxn(query.profile.insertTxn + await prepareGstinProfile(profileSave),[], offlinedb)
			 createProfileMessage = await profileCreateFunction(profileSave)
			
			}
	
		db.dbCommit(offlinedb)
		if(profileSave.length > 0){
		await profileSave.map( async (profile) =>{
			await db.executeAnexTables(profile.gstin)
		})
	}
		return _.compact(alreadyExistMessages).concat(_.compact(createProfileMessage))

		} catch (error) {
			throw new Error(message = error.message)
		} finally{
			db.closeDBConn(offlinedb)
		}

}

async function profileCreateFunction(profileSave) {
	return await Promise.all(_.map(profileSave, (profile) => {
		return { message: ProfileConstants.successMessage, gstin: profile.gstin, statusCd: "1" };
	}));
}

async function profileAlreadyExistRecords(profileActive) {
	return await Promise.all(_.map(profileActive, (profile) => {
		return { message: ProfileConstants.UserAlreadyExist, gstin: profile.gstin, statusCd: "0" }
	}));
}

async function pickProfileToSave(profileObjects, profileActive) {
	return await _.differenceBy(profileObjects, profileActive, 'gstin');
}

/**
 * This method will be called during delete profile
1. Delete entries from GSTIN_MASTER
2. UPDATE the deleted profiles as INACTIVE in USER_PROFILE
3. Delete the .db files

 * @param {*} gstin 
 */
async function deleteProfileDao(gstin) {

	let offlineDb;

	try {
		
		offlineDb = new sqlite3.Database(DB_PATH + OFFLINE_TOOL_DB + DB_EXT);
		
		offlineDb.exec('BEGIN TRANSACTION;');
		
			let sql = `${query.gstinMaster.deleteByGstin}` + "('" + gstin.join("','") + "');";
			logger.log("info", "userProfileDao.js ::  deleteGstMaster :: SQL :: %s", sql);
			
			  let count = await db.deleteBySqlInClauseTxn(sql, [], offlineDb);
			  
			console.log("gstin deleted : " + count);
			if(count === gstin.length) {	
				let updSql = `${query.profile.updateStatus}` + "('" + gstin.join("','") + "');";
				
				let updCount = await db.updateOrDeleteTxn(updSql, [], offlineDb);

				logger.log("info", "userProfileDao.js :: deleteProfileDao :: No.of records updated in USER_PROFILE :: %s",updCount);
									
				logger.log("info", "userProfileDao.js :: deleteProfileDao :: Commit Transaction");
						
				//After updating user_profile table, .db files for the deleted gstins has to be removed.
				for(let gst of gstin){
					fs.unlinkSync(DB_PATH + gst.toUpperCase() + DB_EXT); // to delete the db file
					
					logger.log("info", "userProfileDao.js :: deleteProfileDao :: DB file deleted for GSTIN :: %s",gst);
				}
				db.commitAndCloseDBConn(offlineDb);
				return Promise.resolve({ message: "Profile(s) deleted successfully", statusCd: STATUS_CD_ONE });
			} else{
				db.rollBackAndCloseDBConn(offlineDb);
				logger.log("info", " userProfileDao.js :: deleteProfileDao :: Count mismatch in Profile Deleteion. Hence Rollback");
				return Promise.resolve({ message: "Profile(s) cannot be deleted", statusCd: STATUS_CD_ZERO });
			}
		
		}catch(err) {
			logger.log("error", "userProfileDao.js :: deleteProfileDao :: Error in update User Profile :: %s",JSON.stringify(err));
			db.rollBackAndCloseDBConn(offlineDb);	
			return Promise.reject({ message: "Profile(s) cannot be deleted. Please try after sometime", statusCd: STATUS_CD_ZERO });
		}

}

function selectProfileDao() {
	return new Promise(function (resolve, reject) {
		db.fetchAll(query.profile.getall, OFFLINE_TOOL_DB)
			.then((rows) => {

				resolve(rows);
			})
			.catch((err) => {
				logger.log("error","Error in catch block  userProfileDao.js ::  selectProfileDao :: %s",JSON.stringify(err));
				reject({ error: err, statusCd: STATUS_CD_ZERO })
			});

	})

}

function modifyProfileDao(legaltradename, issezdev, filingfrequency, returntype, gstin) {
	return new Promise(function (resolve, reject) {
		db.update(query.profile.modify, [legaltradename, issezdev, filingfrequency, returntype, gstin], OFFLINE_TOOL_DB)
			.then((data) => {
				if (data) {

					return db.update(query.gstinMaster.modify, [legaltradename,gstin], OFFLINE_TOOL_DB)
						.then((data) => {

							resolve({ message: "Successfully Updated", statusCd: "1" });
						})
						.catch((err) => {
							logger.log("error","Error in catch block  db update userProfileDao.js ::  modifyProfileDao :: %s",JSON.stringify(err));
							reject({ error: err, statusCd: "0" })
						})

				}
			})
			.catch((err) => {
				logger.log("error","Error in catch block   userProfileDao.js ::  modifyProfileDao :: %s",JSON.stringify(err));
				reject({ error: err, statusCd: "0" })
			});
	})
}

function calculateReturnPeriod(fy, taxperiod){

	logger.log("debug", "Inside userProfileDao.js :: calculateReturnPeriod with params financial year :: %s , tax period :: %s", fy , taxperiod);
	let month;
	let tp = taxperiod.toUpperCase();
	if(tp === "JAN") { month = "01"} else
	if(tp === "FEB") { month = "02"} else
	if(tp === "MAR" || tp === "JAN-MAR") { month = "03"} else
	if(tp === "APR") { month = "04"} else
	if(tp === "MAY") { month = "05"} else
	if(tp === "JUN" || tp === "APR-JUN") { month = "06"} else
	if(tp === "JUL") { month = "07"} else
	if(tp === "AUG") { month = "08"} else
	if(tp === "SEP" || tp === "JUL-SEP") { month = "09"} else
	if(tp === "OCT") { month = "10"} else
	if(tp === "NOV") { month = "11"} else
	if(tp === "DEC" || tp === "OCT-DEC") { month = "12"} 
	else {
		month = "";
	}

	let year;
	if(month === "01" || month === "02" || month === "03"){
		year = fy.substr(fy.indexOf("-")+1, 4);
	} else {
		year = fy.substr(0, fy.indexOf("-"));
	}

	logger.log("debug", "Inside userProfileDao.js :: calculateReturnPeriod with Return Period month :: %s , year :: %s", month , year);
	return month + "" + year;
}


function getHsnMasterList(req, res){

	logger.log("info", "Inside userProfileDao.js :: Dao getHsnMasterList");
	
	return new Promise(function (resolve, reject) {

		return db.fetchAll(query.hsnMaster.getall, OFFLINE_TOOL_DB)
			.then((rows, err) => {
				if (err) {
					logger.log("error", "userProfileDao.js :: Error in getHsnMasterList :: %s",err);
					reject({ error: err, statusCd: STATUS_CD_ZERO });
				}
				else {
					//logger.log("debug", "userProfileDao.js :: Rows in getHsnMasterList :: %s",rows);
					let hsn=[]
						for(let i=0 ;i<rows.length;i++)
						{
							hsn.push({
							"hsncd" : rows[i].HSN_CD,
							"hsndesc" : rows[i].HSN_DESC
						})
						}
    
					resolve({"hsndetails":hsn});
				}
			}).catch((err) => {
				logger.log("error", "userProfileDao.js :: Error in fetching data :: %s",err);
				reject({ error: err, statusCd: STATUS_CD_ZERO });
			});

	});
}

//get tax rate 
function getrateMstrList(req, res){

	logger.log("info", "userProfileDao.js :: Inside Dao getrateMstrList");

	return new Promise(function (resolve, reject) {

		return db.fetchAll(query.rateMaster.getall, OFFLINE_TOOL_DB)
			.then((rows, err) => {
				
				if (err) {
					logger.log("error", "userProfileDao.js :: Error Inside Dao getrateMstrList :: %s",err);
					reject({ error: err, statusCd: STATUS_CD_ZERO });
				}
				else {
				
					logger.log("debug", "userProfileDao.js :: Rows in getrateMstrList :: %s",rows);

					let rate=[]
						for(let i=0 ;i<rows.length;i++)
						{
							rate.push({"rate" : rows[i].RATE})
						}
    
					resolve({"taxrate":rate});
				}
			}).catch((err) => {
				
				logger.log("error", "userProfileDao.js :: Error Inside Dao getrateMstrList fetching data:: %s",err);
				
				reject({ error: err, statusCd: STATUS_CD_ZERO });
			});

	});
}

module.exports = {
	getGstMstrList: getGstMstrList,
	updateProfileOnLogin: updateProfileOnLogin,
	getActiveUserProfile: getActiveUserProfile,
	createProfileDao: createProfileDao,
	deleteProfileDao: deleteProfileDao,
	selectProfileDao: selectProfileDao,
	modifyProfileDao: modifyProfileDao,
	getStatMstrList:getStatMstrList,
	getHsnMasterList:getHsnMasterList,
	getrateMstrList:getrateMstrList

}