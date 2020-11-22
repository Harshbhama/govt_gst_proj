
/** Create Table Scripts should maintain here */
const createTable = {
    /** GSTINMaster Table*/
    gstinMaster: "CREATE TABLE IF NOT EXISTS GSTIN_MSTR (GSTIN TEXT NOT NULL PRIMARY KEY,LGL_NM TEXT)",
    /** UserProfile Table*/
    userProfile: "CREATE TABLE IF NOT EXISTS USER_PROFILE (GSTIN TEXT NOT NULL,LGL_NM TEXT, ISSEZDEV TEXT NOT NULL,FILINGFREQUENCY TEXT NOT NULL, RETURNTYPE TEXT NOT NULL,FP TEXT,TAXPERIOD TEXT, ACTIVEFLAG CHAR(1) NOT NULL)"
}

/** Crud Operation Queries for All the tables should maintained here*/
const queries = {
    profile: {
        insert: "INSERT into USER_PROFILE(GSTIN,LGL_NM,ISSEZDEV,FILINGFREQUENCY,RETURNTYPE,FP, TAXPERIOD, ACTIVEFLAG) VALUES (?,?,?,?,?,?,?,?)",
        count: "SELECT count(*) as count from USER_PROFILE",
        getByGstin: "SELECT * from USER_PROFILE where GSTIN = ?",
        updateActiveFlag: "UPDATE USER_PROFILE SET ACTIVEFLAG = 'I' WHERE ACTIVEFLAG = 'A'",
        updateFYandTP: "UPDATE USER_PROFILE SET FP = ?, TAXPERIOD = ? WHERE ACTIVEFLAG = 'A'",
        getActiveProfileForGstin: "SELECT GSTIN as gstin,LGL_NM as lgltrdname,ISSEZDEV as issezdev,FILINGFREQUENCY as filingfrequency,RETURNTYPE as returntype,FP as fp,TAXPERIOD as taxperiod, ACTIVEFLAG as isactive from USER_PROFILE where ACTIVEFLAG = 'A'"
    },
    gstinMaster:{
        insert: "INSERT into GSTIN_MSTR(GSTIN, LGL_NM) VALUES (?,?)",
        count: "SELECT count(*) as count from GSTIN_MSTR",
        getByGstin: "SELECT * from GSTIN_MSTR where GSTIN = ?",
        getAllGstin: "SELECT GSTIN as gstin, LGL_NM as lgltrdname FROM GSTIN_MSTR"
    },
    anx2:{
        insertFileData:"INSERT into ANX2_3AB(STIN,DOCTYPE,DOCNUM,TRDNAME,DOCDATE,DOCVAL,POS,APPTAXRATE,IGSTACT,SUPPLYTYPE,FINANCIALYEAR,ITCPERIOD,UPLOADDATE,PORTAL_STATUS,FLAG,STAXPERIOD,SRETURNSTATUS,ISITCENTITLED,MATCHINGRESULT,ACTIONTAKEN,ITEMID,ERRORCODE,ERRORDTL,CHECKSUM) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        get3ABData:"SELECT * from ANX2_3AB"
    }
}
module.exports = {
    table: createTable,
    query: queries
}