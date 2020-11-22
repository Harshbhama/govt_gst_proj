/**
 * @author Sabahath.kousar@infosys.com
 */

const sqlite3 = require('sqlite3').verbose();
const { table, createAnnex1Table, createAmendmentTable, createAnnex2Table, matchingToolTables } = require('../db/Queries');
const { createAnnex1ATable } = require('../db/queriesanx1a');
const { b2b, sezwp, de, sezwop } = require('../db/anx2Queries/views');
const { DB_PATH, DB_EXT } = require('../utility/constants');
const Promise = require("bluebird");
const logger = require('../utility/logger').logger;

/**
 * This method will create the DB connection for the specified gstin
 * @param {*} gstin 
 */
function getConnection(gstin) {

    const dbObj = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT);
    return dbObj;
}

/**
 * Data base connection check function for sqlite
 */
function connect() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.log('Could not connect to database', err);
        } else {
            console.log('Connected to database' + DB_PATH);
        }
    });
}

/**
 * Function will execute the table cration script 
 * and creates the table if its not exists
 */
function executeTables(dbName) {
    return new Promise((resolve, reject) => {
       // console.log(`${dbName.toUpperCase()}.db`);
        const db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);

        db.serialize(function () {
            // Queries scheduled here will be serialized.
            // db.run(table.gstinMaster)
            // db.run(table.userProfile)
            // resolve(true)
            db.run(table.gstinMaster, (res, err) => {
                if (err) console.log("secondResponse :" + err);
                else console.log("res " + res);
            })
            db.run(table.userProfile, (secondResponse, err) => {
                if (err) console.log("userProfile :" + err);
                else console.log("userProfile " + secondResponse);
                resolve(true)
            })
            db.run(table.stateMaster, (thirdResponse, err) => {
                if (err) console.log("stateMaster :" + err);
                else console.log("stateMaster " + thirdResponse);
                resolve(true)
            })
            db.run(table.hsnMaster, (fourthresponse, err) => {
                if (err) console.log("fourthresponse :" + err);
                else console.log("fourthresponse " + fourthresponse);
                resolve(true)
            })

            db.run(table.rateMaster, (fifthresponse, err) => {
                if (err) console.log("rateMaster :" + err);
                else console.log("rateMaster " + fifthresponse);
                resolve(true)
            })
            // db.run("commit")         

        });
        db.close();
    }).catch((err) => {
        console.log(err);
        // reject(err)
    })

}

/**
 * Function will execute the table creation script 
 * and creates the table if its not exists
 */
async function executeAnexTables(gstin) {
    logger.log("info", "Entering dbUtil.executeAnexTables");
    let gstindb = new sqlite3.Database(DB_PATH + gstin.toUpperCase() + DB_EXT)
    try {
        gstindb.exec('BEGIN TRANSACTION;');
        return new Promise(function (resolve, reject) {
            gstindb.serialize(function () {
                resolve(gstindb.run(createAnnex1Table.table3a)
                    .run(createAnnex1Table.anx1itemData)
                    .run(createAnnex1Table.anx1rev3hData)
                    .run(createAnnex1Table.anx1Summ)
                    .run(createAnnex1Table.anx1ErrorSumm)
                    .run(createAnnex1Table.anx13cdData)
                    .run(createAnnex1Table.table3b)
                    .run(createAnnex1Table.anx14Data)
                    .run(createAnnex1Table.table3i)
                    .run(createAnnex1Table.table3ef)
                    .run(createAnnex1Table.table3g)
                    .run(createAnnex1Table.table3K)
                    .run(createAnnex1Table.table3j)
                    .run(createAnnex1Table.table3L)

                    /** Amendment Table  */
                    .run(createAmendmentTable.tableB2BAO)
                    .run(createAmendmentTable.tableB2BA)
                    .run(createAmendmentTable.tableSEZA)
                    .run(createAmendmentTable.tableDEA)

                    .run(createAnnex1ATable.omastertbl)  // Amendment table
                    .run(createAnnex1ATable.anx13aatbl)  // Amendment table 3AA
                    .run(createAnnex1ATable.anx13cdatbl) // Amendment table 3CDA
                    .run(createAnnex1ATable.anx13hatbl)  // Amendment table 3HA
                    .run(createAnnex1ATable.anx13iatbl)  // Amendment table 3IA
                    .run(createAnnex1ATable.anx14atbl)   // Amendment table 4A
                    .run(createAnnex1ATable.anx13jatbl)  // Amendment table 3JA
                    .run(createAnnex1ATable.anx13katbl)  // Amendment table 3KA

                    .run(createAnnex1Table.createAnx1History)
                    .run(createAnnex2Table.b2bData)
                    .run(createAnnex2Table.itemData)
                    .run(createAnnex2Table.sezwpData)
                    .run(createAnnex2Table.sezwopData)
                    .run(createAnnex2Table.deData)
                    .run(createAnnex2Table.tab5Data)
                    .run(b2b.accept)
                    .run(b2b.reject)
                    .run(b2b.pending)
                    .run(matchingToolTables.prDetls)
                    .run(matchingToolTables.prSummary)
                    .run(matchingToolTables.progressBar)
                    .run(matchingToolTables.mrSummary)
                    .run(matchingToolTables.mrB2bSummary)
                    .run(matchingToolTables.mrDeSummary)
                    .run(matchingToolTables.mrSezwpSummary)
                    .run(matchingToolTables.mrSexwopSummary)
                    .run(matchingToolTables.mrDetails)
                    .run(matchingToolTables.prError)
                    .run(matchingToolTables.anxView)
                    .run(matchingToolTables.exactMatchView)
                    .run(matchingToolTables.probablMatchView)
                    .run(matchingToolTables.remaingRecordsView)
                    .run(matchingToolTables.matchingSummaryView)
                    .run(de.accept)
                    .run(de.reject)
                    .run(de.pending)
                    .run(sezwp.accept)
                    .run(sezwp.reject)
                    .run(sezwp.pending)

                    .run(b2b.summaccept)
                    .run(b2b.summreject)
                    .run(b2b.summpending)
                    .run(sezwp.summaccept)
                    .run(sezwp.summreject)
                    .run(sezwp.summpending)
                    .run(de.summaccept)
                    .run(de.summreject)
                    .run(de.summpending)

                    .run(b2b.erraccept)
                    .run(b2b.errpending)
                    .run(b2b.errreject)
                    .run(sezwp.erraccept)
                    .run(sezwp.errpending)
                    .run(sezwp.errreject)
                    .run(de.erraccept)
                    .run(de.errpending)
                    .run(de.errreject)
                    .run(sezwop.erraccept)
                    .run(sezwop.errpending)
                    .run(sezwop.errreject))
            })

            dbCommit(gstindb)
        })
    } catch (error) {
        throw new Error(message = error.message)
    } finally {
        closeDBConn(gstindb)
    }

}


/** Fetch all the records of sql statment
 * @param  {} sql
 */
function fetchAll(sql, dbName) {
    let db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);

    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all(sql, function (err, rows) {
                db.close();
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    // console.log("rows "+ JSON.stringify(rows));
                    resolve(rows);
                }
            });
        });

    })
}

/**
 * Fetch the details by ID
 * Params should be sent in commoa seprated array 
 * @param  {} sql
 * @param  {} params=[]
 */
function fetchById(sql, params = [], dbName) {
    const db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.get(sql, params, function (err, rows) {
                db.close();
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    //console.log(rows);
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
function save(sql, params = [], dbName) {
    let db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    return new Promise(function (resolve, reject) {
        // console.log("sql " + sql);
        // console.log("params " + params);
        db.serialize(function () {
            db.run(sql, params, function (err, rows) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    })
}

/**
 * 
 * @param {*} sql 
 * @param {*} params 
 * @param {*} dbName 
 * @param {*} dbConn : send the dbConn object if connection object is available. else, do not pass the parameter. 
 *                      It will be considered as undefined and a new db connection object will be created.
 */
function update(sql, params = [], dbName, dbConn) {
    let db;
    console.log('dbupdate');
    if (dbConn == undefined) {
        // console.log("DB Conn is undefined. Hence creating a new connection");
        db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    } else {
        // console.log("DB Conn is available!");
        db = dbConn;
    }

    return new Promise(function (resolve, reject) {
        // console.log("sql " + sql);
        // console.log("params " + params);
        db.serialize(function () {
            db.run(sql, params, function (err) {
                if (dbConn == undefined) {    //Close the connection only when the connection is newly created in this method
                    db.close();
                }
                if (err) {
                    console.log('err',err);
                    reject(err);
                } else {
                    // console.log("Have made changes")
                    // console.log("Changes" + this.changes);
                    resolve(this.changes);
                }
            });
        });
    })
}

/** Returns the first row 
 * @param  {} sql
 * @param  {} dbName
 */
function getFirst(sql, params, dbName) {
    let db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.get(sql, params, function (err, row) {
                db.close();
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    })
}

/** Returns the first row 
 * @param  {} sql
 * @param  {} dbobj
 */
function getFirstRow(sql, params, dbobj) {
    return new Promise(function (resolve, reject) {
        dbobj.serialize(function () {
            dbobj.get(sql, params, function (err, row) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(row);
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
function saveWithDbObject(sql, params = [], dbobj) {
    return new Promise(function (resolve, reject) {
        dbobj.run(sql, params, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    })
}

/** Returns the count
 * @param  {} sql
 */
function getCountWithDbObj(sql, params, dbobj) {
    return new Promise(function (resolve, reject) {
        dbobj.get(sql, params, function (err, row) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    })
}

/** Returns the count
 * @param  {} sql
 */
function getCount(sql, params, dbName, gstindb) {
    let db;
    /* console.log("Inside getCount : params : " + params); 
     console.log("gstindb : " + gstindb); */
    if (gstindb === undefined) {
        db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    } else {
        db = gstindb;
    }

    return new Promise(function (resolve, reject) {
        db.get(sql, params, function (err, row) {
            if (gstindb === undefined) {
                db.close();
            }

            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });

    })
}

/**
 * Fetch all the details matching the search criteria
 * Params should be sent in comma seprated array 
 * 
 * params and IsSqlInClause has default values specfied
 * 
 * @requires {*} sql : String sql 
 * @param {*} params : asscociated input params to the query
 * @requires {*} dbName : GSTIN name as DB name
 * @param {*} IsSqlInClause : by default false if its true, will create SQL in clause parameters to the query 
 * @return {*} Rows :  Returns SQL rows 
 */
function fetchAllById(sql, params = [], dbName, IsSqlInClause = false) {
    /** SQL in caluse paramters */
    if (IsSqlInClause) {
        sql = `${sql} (${params.map(function () { return '?' }).join(',')})`
    }

    const db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all(sql, params, function (err, rows) {
                db.close();

                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

        });
    })
}

/**
 * prepares a in clause SQL to delete record(s) based on the input params 
 * Params should be sent in comma seprated array 
 * @param  {*} sql
 * @param  {*} params=[]
 * @param  {*} dbName
 * @param {*} dbConn : send the dbConn object if connection object is available. else, do not pass the parameter. 
 *                      It will be considered as undefined and a new db connection object will be created.
 * @returns {*} number of row count deleted
 */
function deleteBySqlInClause(sql, params = [], dbName, dbConn) {
    // to create in clause query
    sql = `${sql} ( ${params.map(function () { return '?' }).join(',')} )`

    let db;
    if (dbConn == undefined) {
        console.log("DB Conn is undefined. Hence creating a new connection");
        db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    } else {
        console.log("DB Conn is available!");
        db = dbConn;
    }

    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.run(sql, params, function (err, rows) {
                if (dbConn == undefined) {    //Close the connection only when the connection is newly created in this method
                    db.close();
                }
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });

        });
    })
}


/**
 * Fetch all the details matching the search criteria
 * Params should be sent in comma seprated array 
 * 
 * params and IsSqlInClause has default values specfied
 * 
 * @requires {*} sql : String sql 
 * @param {*} params : asscociated input params to the query
 * @param {*} IsSqlInClause : by default false if its true, will create SQL in clause parameters to the query 
 * @param {*} dbConn : send the dbConn object if connection object is available. else, do not pass the parameter. 
 *                      It will be considered as undefined and a new db connection object will be created.
 * @return {*} Rows :  Returns SQL rows 
 */
function fetchAllByIdInTransaction(sql, params = [], dbConn, IsSqlInClause = false) {
    /** SQL in caluse paramters */
    if (IsSqlInClause) {
        sql = `${sql} (${params.map(function () { return '?' }).join(',')})`
    }
    return new Promise(function (resolve, reject) {

        dbConn.all(sql, params, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });

    })
}

function runQuery(sql, params = [], db) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                logger.log("error", "dc|runQuery|err:%s", err);
                return reject(err);

            }
            console.log("err Query", (this.changes))
            return resolve(this.changes);

        });
    }
    )
}

function getRow(sql, params = [], db) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, function (err, row) {
            if (err) {
                logger.log("error", "dc|getRow|err:%s", err);
                return reject(err);
            }
            return resolve(row);
        });
    }
    )
}

function getRows(sql, params = [], db) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, function (err, rows) {
            if (err) {
                logger.log("error", "dc|getRows|err:%s", err);
                return reject(err);
            }
            return resolve(rows);
        });
    }
    )
}

function updateRow(sql, params = [], db) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                logger.log("error", "dc|updateRow|err:%s", err);
                return reject(err);
            }
            return resolve(this.changes);
        });
    }
    )
}

function saveRow(sql, params = [], db) {

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {

            if (err) {
                console.log("err", err)
                logger.log("error", "dc|saveRow|err:%s", err);
                return reject(err);
            }
            console.log("this.changes", this.changes)
            return resolve(this.changes);
        });
    }
    )
}

function saveRows(sql, params = [], db) {
    return Promise.mapSeries(params, (param) => {
        return saveRow(sql, param, db);
    }
    );
}

function saveArray(sql, params = [], db) {
    params = Object.values(params);
    // console.log("lent : ",sql,params,params.length) 
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                logger.log("error", "saveArray|saveRow|err:%s", err);
                return reject(err);
            }
            return resolve(this.changes);
        });
    }
    )
}

function saveArrays(sql, params = [], db) {
    // console.log(sql,params)
    return Promise.map(params, (param) => {
        return saveArray(sql, param, db);
    }
    );
}

function deleteData(sql, params = [], db) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                logger.log("error", "dc|deleteData|err:%s", err);
                return reject(err);
            }

            return resolve(this.changes);
        });
    }
    )
}

function dbClose(db) {
    return new Promise((resolve, reject) => {
        db.close(function (err) {
            if (err) {
                logger.log("error", "dc|dbClose|err:%s", err);
                return reject(err);
            }
            return resolve();
        }
        );
    }
    );
}

function deleteDataFromTable(sql, params, dbName) {
    const db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                console.log("deleteData:err:", err);
                return reject(err);
            }
            return resolve(this.changes);
        });
    }
    )
}

function fetchByFyPrd(sql, params, dbName) {
    const db = new sqlite3.Database(DB_PATH + dbName.toUpperCase() + DB_EXT);
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.all(sql, params, function (err, rows) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    //console.log(rows);
                    resolve(rows);
                }
            });

        });
        db.close()
    })
}


/**
 * Insert the data to data base
 * @param {*} sql 
 * @param {*} params 
 * @param {*} gstindb : Data base connection 
 */
async function saveTxn(sql, params = [], gstindb) {
    return new Promise(function (resolve, reject) {
        console.log("sql " + sql);
        console.log("params " + params);
        gstindb.run(sql, params, function (err, rows) {
            if (err) {
                console.log(err);
                rollBackDBConn(gstindb);
                reject(err);
            } else {
                console.log(this.changes);
                resolve(this.changes);
            }
        });
    })
}


/**
 * Fetch the details by ID
 * Params should be sent in commoa seprated array 
 * @param  {} sql
 * @param  {} params=[]
 */
async function fetchByIdTxn(sql, params = [], gstindb) {
    return new Promise(function (resolve, reject) {
        gstindb.serialize(function () {
            gstindb.get(sql, params, function (err, rows) {
                if (err) {
                    rollBackDBConn(gstindb)
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

        });
    })
}


/** Returns the count
 * @param  {} sql
 */
function getCountTxn(sql, params, gstindb) {
    return new Promise(function (resolve, reject) {
        gstindb.serialize(function () {
            gstindb.get(sql, params, function (err, row) {
                if (err) {
                    rollBackDBConn(gstindb)
                    reject(err);
                } else {
                    resolve(row.count);
                }
            });
        });
    })
}


function updateOrDeleteTxn(sql, params = [], gstindb) {
    return new Promise(function (resolve, reject) {
        gstindb.serialize(function () {
            gstindb.run(sql, params, function (err) {
                if (err) {
                    rollBackDBConn(gstindb)
                    reject(err);
                } else {
                    console.log("Changes" + this.changes);
                    resolve(this.changes);
                }
            });
        })
    })
}

/**
   * This method will rollback the transaction and close the DB connection
   * @param {*} gstindb 
   */
function rollBackDBConn(gstindb) {
    gstindb.exec('ROLLBACK;');
}


/**
   * This method will rollback the transaction and close the DB connection
   * @param {*} gstindb 
   */
function closeDBConn(gstindb) {
    gstindb.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}


/**
   * This method will rollback the transaction and close the DB connection
   * @param {*} gstindb 
   */
function dbCommit(gstindb) { gstindb.exec("COMMIT;") }


function deleteBySqlInClauseTxn(sql, params = [], gstindb) {
    sql = `${sql} ( ${params.map(function () { return '?' }).join(',')} )`
    return new Promise(function (resolve, reject) {
        gstindb.serialize(function () {
            gstindb.run(sql, params, function (err) {
                if (err) {
                    rollBackDBConn(gstindb)
                    reject(err);
                } else {
                    console.log("Changes" + this.changes);
                    resolve(this.changes);
                }
            });
        });
    })
}


/**
* prepares a in clause SQL to delete record(s) based on the input params 
* Params should be sent in comma seprated array 
* @param  {*} sql
* @param  {*} params=[]
* @param  {*} dbName
* @param {*} dbConn : send the dbConn object if connection object is available. else, do not pass the parameter. 
*                      It will be considered as undefined and a new db connection object will be created.
* @returns {*} number of row count deleted
*/
function deleteBySqlInClauseTxn(sql, params = [], gstindb) {
    // to create in clause query
    sql = `${sql} ( ${params.map(function () { return '?' }).join(',')} )`

    return new Promise(function (resolve, reject) {
        gstindb.serialize(function () {
            gstindb.run(sql, params, function (err, rows) {
                if (err) {
                    rollBackDBConn(gstindb)
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });

        });
    })
}

/**
 * Fetch all the details matching the search criteria
 * Params should be sent in comma seprated array 
 * 
 * params and IsSqlInClause has default values specfied
 * 
 * @requires {*} sql : String sql 
 * @param {*} params : asscociated input params to the query
 * @requires {*} dbName : GSTIN name as DB name
 * @param {*} IsSqlInClause : by default false if its true, will create SQL in clause parameters to the query 
 * @return {*} Rows :  Returns SQL rows 
 */
function fetchAllByIdTxn(sql, params = [], gstindb, IsSqlInClause = false) {
    /** SQL in caluse paramters */
    if (IsSqlInClause) {
        sql = `${sql} (${params.map(function () { return '?' }).join(',')})`
    }
    return new Promise(function (resolve, reject) {
        gstindb.serialize(function () {
            gstindb.all(sql, params, function (err, rows) {
                if (err) {
                    rollBackDBConn(gstindb)
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

        });
    })
}

/**
 * This method will rollback the transaction and close the DB connection
 * @param {*} gstindb 
 */
function rollBackAndCloseDBConn(gstindb) {
    gstindb.exec('ROLLBACK;');
    gstindb.close((err) => {
        if (err) {
            console.log(err.message);
        }
        console.log('Close the database connection.');
    });
}

/**
 * This method will commit the transaction and close the DB connection
 * @param {*} gstindb 
 */
function commitAndCloseDBConn(gstindb) {
    console.log("commitAndCloseDBConn");
    gstindb.exec('COMMIT;');
    gstindb.close((err) => {
        if (err) {
            console.log(err.message);
        }
        console.log('Close the database connection.');
    });
}

module.exports = {
    connect: connect,
    fetchById: fetchById,
    fetchAll: fetchAll,
    save: save,
    executeTables: executeTables,
    executeAnexTables: executeAnexTables,
    update: update,
    getFirst: getFirst,
    getFirstRow: getFirstRow,
    saveWithDbObject: saveWithDbObject,
    getCountWithDbObj: getCountWithDbObj,
    getCount: getCount,
    fetchAllById: fetchAllById,
    deleteBySqlInClause: deleteBySqlInClause,
    runQuery: runQuery,
    saveRow: saveRow,
    saveRows: saveRows,
    updateRow: updateRow,
    getRow: getRow,
    getRows: getRows,
    deleteData: deleteData,
    dbClose: dbClose,
    deleteDataFromTable: deleteDataFromTable,
    fetchByFyPrd: fetchByFyPrd,
    saveArrays: saveArrays,
    saveArray: saveArray,
    /** Transaction related new methods */
    saveTxn: saveTxn,
    fetchByIdTxn: fetchByIdTxn,
    getCountTxn: getCountTxn,
    updateOrDeleteTxn: updateOrDeleteTxn,
    deleteBySqlInClauseTxn: deleteBySqlInClauseTxn,
    fetchAllByIdInTransaction: fetchAllByIdInTransaction,
    fetchAllByIdTxn: fetchAllByIdTxn,
    rollBackDBConn: rollBackDBConn,
    closeDBConn: closeDBConn,
    dbCommit: dbCommit,
    commitAndCloseDBConn: commitAndCloseDBConn,
    rollBackAndCloseDBConn: rollBackAndCloseDBConn,
    getConnection: getConnection

}