const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { table } = require('../utility/Queries');
const { OFFLINE_TOOL_DB, DB_PATH, DB_EXT } = require('../utility/constants');

/**
 * Connect to common db for Offline
 */
function getOfflineDBConnection(){
    let offlineDb = new sqlite3.Database(DB_PATH + OFFLINE_TOOL_DB + DB_EXT, (err) => {
        if(err){
            console.log("Could not connect to Offline DB");
        }
    });

    return offlineDb;
}

/**
 * Creates DB connection for GSTIN specific schema
 * @param {*} gstin 
 * 
 * return -> DB coonection for {GSTIN}.db schema
 */
function getGstinDBConnection(gstin){
	console.log("Inside getGstinDBConnection for gstin :" + gstin);

	let gstinDb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT, (err) => {
		if(err){
			console.log("Could not connect to " + gstin + " DB");
		}
	});

	return gstinDb;
}


/** Fetch all the records of sql statment
 * @param  {} sql
 */
function fetchAll(sql, dbSchema) {
    return new Promise(function (resolve, reject) {
        dbSchema.serialize(function () {
            dbSchema.all(sql, function (err, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(rows);
                    resolve(rows);
                }
            });
        });
    })
}

/**
 * Fetch the details by ID 
 * @param  {} sql
 * @param  {} params=[]
 */
function fetchById(sql, params = []) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.get(sql, params, function (err, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(rows);
                    resolve(rows);
                }
            });
        });
    })
}

/**
 * Insert the data to data base
 * @param {*} sql 
 * @param {*} params 
 */
function save(sql, params = []) {
    return new Promise(function (resolve, reject) {
        console.log("sql " + sql);
        console.log("params " + params);
        db.serialize(function () {
            db.run(sql, params, function (err, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(rows);
                    resolve(rows);
                }
            });
        });
    })
}


/** Returns the count
 * @param  {} sql
 */
function getCount(sql, dbSchema) {
    return new Promise(function (resolve, reject) {
        dbSchema.serialize(function () {
            dbSchema.get(sql, function (err, row) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    })
}

module.exports = {
    getOfflineDBConnection : getOfflineDBConnection,
    getGstinDBConnection : getGstinDBConnection,
    fetchById: fetchById,
    fetchAll: fetchAll,
    save: save,
    getCount : getCount

}