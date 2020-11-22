/**
 * @author Sabahath.kousar@infosys.com
 */

/** Create Table Scripts should maintain here its only for OFFLINE_TOOL.DB */
const createTable = {
    /** GSTINMaster Table*/
    gstinMaster: "CREATE TABLE IF NOT EXISTS GSTIN_MASTER (GSTIN TEXT PRIMARY KEY  NOT NULL,LGL_TRDNAME TEXT ); ",
    /** UserProfile Table*/
    userProfile: "CREATE TABLE IF NOT EXISTS USER_PROFILE (GSTIN TEXT NOT NULL,LGL_TRDNAME TEXT, ISSEZDEV TEXT NOT NULL,FILING_FREQUENCY TEXT NOT NULL, RETURN_TYPE TEXT NOT NULL,FP TEXT NOT NULL,TAX_PERIOD TEXT NOT NULL, ISACTIVE CHAR(1) NOT NULL, ANX2_STAT CHAR(2), MTCHNG_RSLT_AVBL CHAR(1));",

    stateMaster: "CREATE TABLE IF NOT EXISTS STATE_MASTER (STATE_CD INTEGER(2) PRIMARY KEY NOT NULL,STATE_NAME TEXT );",

    hsnMaster: "CREATE TABLE IF NOT EXISTS HSN_MASTER(HSN_CD INTEGER(8) PRIMARY KEY NOT NULL, HSN_DESC TEXT);",

    rateMaster: "CREATE TABLE IF NOT EXISTS RATE_MASTER (RATE DECIMAL PRIMARY KEY NOT NULL,FROM_DATE DATE NOT NULL,TO_DATE DATE NOT NULL);"

}

/** Crud Operation Queries for All the tables should maintained here*/
const queries = {
    profile: {
        insert: "INSERT into USER_PROFILE(GSTIN,LGL_TRDNAME,ISSEZDEV,FILING_FREQUENCY,RETURN_TYPE,FP, TAX_PERIOD, ISACTIVE, MTCHNG_RSLT_AVBL) VALUES (?,?,?,?,?,?,?,?,'N')",
        insertTxn: "INSERT into USER_PROFILE(GSTIN,LGL_TRDNAME,ISSEZDEV,FILING_FREQUENCY,RETURN_TYPE,FP, TAX_PERIOD, ISACTIVE, MTCHNG_RSLT_AVBL) VALUES ",
        update: "UPDATE USER_PROFILE SET ISSEZDEV = ? WHERE GSTIN = ?",
        count: "SELECT count(*) from USER_PROFILE",
        checkProfileIsActive: "SELECT count(*) AS isActive, GSTIN as gstin from USER_PROFILE where GSTIN = ? and ISACTIVE = ?",
        checkProfileIsActiveTxn: "SELECT GSTIN as gstin from USER_PROFILE where ISACTIVE = 'Y' AND  GSTIN IN ",
        getActiveProfileForGstin: "SELECT GSTIN as gstin,LGL_TRDNAME as lgltrdname,ISSEZDEV as issezdev,FILING_FREQUENCY as filingfrequency,RETURN_TYPE as returntype,FP as fp,TAX_PERIOD as taxperiod, ISACTIVE as isactive,ANX2_STAT as filingstat,MTCHNG_RSLT_AVBL as match_stat from USER_PROFILE where ISACTIVE = 'Y' and GSTIN = ?",
        updateActiveFlag: "UPDATE USER_PROFILE SET ISACTIVE = 'N' WHERE ISACTIVE = 'Y' and GSTIN = ?",
        updateFYandTP: "UPDATE USER_PROFILE SET FP = ?, TAX_PERIOD = ? WHERE ISACTIVE = 'Y' and GSTIN = ?",
        updateStatus: "update USER_PROFILE set ISACTIVE = 'N' where ISACTIVE = 'Y' and GSTIN IN ",
        getall: "SELECT GSTIN as gstin,LGL_TRDNAME as lgltrdname,ISSEZDEV as issezdev,FILING_FREQUENCY as filingfrequency,RETURN_TYPE as returntype,FP as fp,TAX_PERIOD as taxperiod,MTCHNG_RSLT_AVBL as matchflag from USER_PROFILE where ISACTIVE='Y'",
        modify: "update USER_PROFILE set LGL_TRDNAME=?,ISSEZDEV=?,FILING_FREQUENCY=?,RETURN_TYPE=? where GSTIN=?",
        updatefdstat:"UPDATE USER_PROFILE SET ANX2_STAT = ? WHERE GSTIN = ? and ISACTIVE ='Y'",
        updateMatchStatus: "UPDATE USER_PROFILE SET MTCHNG_RSLT_AVBL = ? WHERE GSTIN = ? and FP = ? and TAX_PERIOD = ? and ISACTIVE ='Y'"
    },
    gstinMaster: {
        insert: "INSERT into GSTIN_MASTER(GSTIN,LGL_TRDNAME) VALUES (?,?)",
        insertTxn: "INSERT into GSTIN_MASTER(GSTIN,LGL_TRDNAME) VALUES ",
        count: "SELECT count(*) from GSTIN_MASTER",
        getByGstin: "SELECT count(*) AS hasRow from GSTIN_MASTER where GSTIN = ? ",
        getByGstinTxn: "SELECT GSTIN as gstin from GSTIN_MASTER where GSTIN IN ",
        getAllGstin: "SELECT GSTIN as gstin, LGL_TRDNAME as lgltrdname FROM GSTIN_MASTER",
        deleteByGstin: "DELETE FROM GSTIN_MASTER WHERE GSTIN IN ",
        getall: "SELECT * from GSTIN_MASTER",
        modify: "update GSTIN_MASTER set LGL_TRDNAME=? where GSTIN=?",
    },
    stateMaster: {
        getall: "SELECT * from STATE_MASTER"
    },

    hsnMaster: {
        getall: "SELECT * from HSN_MASTER"
    },

    rateMaster: {
        getall: "SELECT RATE from RATE_MASTER"
    },
    anx2: {

         b2b: {
            getData: "SELECT * from ANX2_3AB WHERE ITC_PERIOD=?",
            // getDataforJson:"SELECT * FROM ANX2_3AB A JOIN ANX2_ITEMDTLS B ON A.DOCREF=B.ITEMREF AND A.FLG='E' and A.ITC_PERIOD=?",
            getDataforJson:"SELECT * FROM ANX2_3AB  WHERE FLG='E' AND ITC_PERIOD=?",
            getCrcErrData:"SELECT * FROM ANX2_3AB  WHERE ERROR_CODE IS NOT NULL AND FLG='E' AND ITC_PERIOD=?",
            insertFileData: "INSERT into ANX2_3AB(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,IGST,CGST,SGST,CESS,IS_ITC_ENTL,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,IGST_ACT,ITC_PERIOD,REJ_PST_FIL,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            recCount: "SELECT count(*) count from ANX2_3AB where STIN = ? and DOCTYPE = ? and DOCNUM = ? and ITC_PERIOD=?",
            deleteAll: "DELETE FROM ANX2_3AB WHERE ITC_PERIOD=?",
            errdeleteAll: "DELETE FROM ANX2_3AB WHERE FLG='X' AND  ITC_PERIOD=?",
          //nrmdeleteAll: "DELETE FROM ANX2_3AB WHERE FLG<>'X' AND  ITC_PERIOD=?",
            count: "SELECT count(*) count from ANX2_3AB where ITC_PERIOD=?",
            saveAction: "UPDATE ANX2_3AB SET IS_ITC_ENTL = ? , ACTION_TAKEN = ?,FLG=?,ERROR_DTL=NULL WHERE DOCREF = ?",
            acceptCount: "SELECT * from ANX2_3B_SUMM_A WHERE AITC=?",
            rejectCount: "SELECT * from ANX2_3B_SUMM_R WHERE RITC=?",
            pendingCount: "SELECT * from ANX2_3B_SUMM_P WHERE PITC=?",
            acceptErrCount: "SELECT * from ANX2_3B_ERR_SUMM_A WHERE AITC=?",
            rejectErrCount: "SELECT * from ANX2_3B_ERR_SUMM_R WHERE RITC=?",
            pendingErrCount: "SELECT * from ANX2_3B_ERR_SUMM_P WHERE PITC=?",
            dashSummA:"SELECT count,taxval,igst,cgst,sgst,cess from ANX2_3B_DSUMM_A WHERE ITC_PERIOD=?",
            dashSummR:"SELECT count,taxval,igst,cgst,sgst,cess from ANX2_3B_DSUMM_R WHERE ITC_PERIOD=?",
            dashSummP:"SELECT count,taxval,igst,cgst,sgst,cess from ANX2_3B_DSUMM_P WHERE ITC_PERIOD=?",
            updateFlagData: "UPDATE ANX2_3AB SET FLG=?,ERROR_DTL=NULL, ERROR_CODE=NULL where ITC_PERIOD=?",
            updateFileData:"UPDATE ANX2_3AB SET FLG=?,ERROR_CODE=?,ERROR_DTL=? where DOCREF=?",
            getRecordCount:"SELECT count(*) as count FROM ANX2_3AB where ITC_PERIOD='",
            dasherrorCount :"SELECT count(FLG) count  from ANX2_3AB where FLG='X' AND  ERROR_CODE is not null AND ITC_PERIOD=?",
            dashcrtrecCount:"SELECT count(FLG) count  from ANX2_3AB where FLG<>'X' AND  ERROR_CODE is not null AND ITC_PERIOD=?"

            //repeatFileData: "REPLACE into ANX2_3AB(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,IGST,CGST,SGST,CESS,IS_ITC_ENTL,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,IGST_ACT,ITC_PERIOD,REJ_PST_FIL,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            //getChksum: "SELECT CHCKSUM chksum from ANX2_3AB where STIN = ? and DOCTYPE = ? and DOCNUM = ? and ITC_PERIOD=?",
        },
        sezwp: {
            insertFileData: "INSERT into ANX2_3AE(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,IGST,CESS,IS_ITC_ENTL,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,ITC_PERIOD,REJ_PST_FIL,CLM_REF,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            getData: "SELECT * from ANX2_3AE WHERE ITC_PERIOD=?",
            // getDataforJson:"SELECT * FROM ANX2_3AE A JOIN ANX2_ITEMDTLS B ON A.DOCREF=B.ITEMREF AND A.FLG='E' and A.ITC_PERIOD=?",
            getDataforJson:"SELECT * FROM ANX2_3AE  WHERE FLG='E' AND ITC_PERIOD=?",
            getCrcErrData:"SELECT * FROM ANX2_3AE  WHERE ERROR_CODE IS NOT NULL AND FLG='E' AND ITC_PERIOD=?",
            deleteAll: "DELETE FROM ANX2_3AE WHERE ITC_PERIOD=?",
            errdeleteAll: "DELETE FROM ANX2_3AE WHERE FLG='X' AND  ITC_PERIOD=?",
            nrmdeleteAll: "DELETE FROM ANX2_3AE WHERE FLG<>'X' AND  ITC_PERIOD=?",
            count: "SELECT count(*) count from ANX2_3AE where ITC_PERIOD=?",
            saveAction: "UPDATE ANX2_3AE SET IS_ITC_ENTL = ?, ACTION_TAKEN = ?,FLG=?,ERROR_DTL=NULL WHERE DOCREF = ? ",
            acceptCount: "SELECT * from ANX2_3E_SUMM_A WHERE AITC=?",
            rejectCount: "SELECT * from ANX2_3E_SUMM_R WHERE RITC=?",
            pendingCount: "SELECT * from ANX2_3E_SUMM_P WHERE PITC=?",
            acceptErrCount: "SELECT * from ANX2_3E_ERR_SUMM_A WHERE AITC=?",
            rejectErrCount: "SELECT * from ANX2_3E_ERR_SUMM_R WHERE RITC=?",
            pendingErrCount: "SELECT * from ANX2_3E_ERR_SUMM_P WHERE PITC=?",
            dashSummA:"SELECT count,taxval,'0' as cgst,'0' as sgst,igst,cess from ANX2_3E_DSUMM_A WHERE ITC_PERIOD=?",
            dashSummR:"SELECT count,taxval,'0' as cgst,'0' as sgst,igst,cess from ANX2_3E_DSUMM_R WHERE ITC_PERIOD=?",
            dashSummP:"SELECT count,taxval,'0' as cgst,'0' as sgst,igst,cess from ANX2_3E_DSUMM_P WHERE ITC_PERIOD=?",
          //repeatFileData: "REPLACE INTO ANX2_3AE (STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,IGST,CESS,IS_ITC_ENTL,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,ITC_PERIOD,REJ_PST_FIL,CLM_REF,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            updateFlagData: "UPDATE ANX2_3AE SET FLG=?,ERROR_DTL=NULL, ERROR_CODE=NULL  where ITC_PERIOD=?",
            updateFileData:"UPDATE ANX2_3AE SET FLG=?,ERROR_CODE=?,ERROR_DTL=? where DOCREF=?",
            getRecordCount:"SELECT count(*) as count FROM ANX2_3AE where ITC_PERIOD='",
            dasherrorCount :"SELECT count(FLG) count  from ANX2_3AE where FLG='X' AND  ERROR_CODE is not null AND ITC_PERIOD=?",
            dashcrtrecCount:"SELECT count(FLG) count  from ANX2_3AE where FLG<>'X' AND  ERROR_CODE is not null AND ITC_PERIOD=?"
        },
        sezwop: {
            insertFileData: "INSERT INTO ANX2_3AF(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,ITC_PERIOD,REJ_PST_FIL,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            getData: "SELECT * from ANX2_3AF WHERE ITC_PERIOD=?",
            // getDataforJson:"SELECT * FROM ANX2_3AF A JOIN ANX2_ITEMDTLS B ON A.DOCREF=B.ITEMREF AND A.FLG='E' and A.ITC_PERIOD=?",
            getDataforJson:"SELECT * FROM ANX2_3AF  WHERE FLG='E' AND ITC_PERIOD=?",
            getCrcErrData:"SELECT * FROM ANX2_3AF  WHERE ERROR_CODE IS NOT NULL AND FLG='E' AND ITC_PERIOD=?",
            saveAction: "UPDATE ANX2_3AF SET ACTION_TAKEN = ?,FLG=?,ERROR_DTL=NULL WHERE DOCREF = ? ",
            deleteAll: "DELETE FROM ANX2_3AF WHERE ITC_PERIOD=?",
            errdeleteAll: "DELETE FROM ANX2_3AF WHERE FLG='X' AND  ITC_PERIOD=?",
            nrmdeleteAll: "DELETE FROM ANX2_3AF WHERE FLG<>'X' AND  ITC_PERIOD=?",
            count: "SELECT count(*) count from ANX2_3AF where ITC_PERIOD=?",
            acceptCount: "SELECT STIN,TRDNAME,ITC_PERIOD AS AITC,count(1) AS ACOUNT FROM ANX2_3AF WHERE ITC_PERIOD=? AND S_RETURN_STAT != 'NF (ITC-NA)' AND (ACTION_TAKEN = 'A' OR ( (ACTION_TAKEN IN ('', 'S') OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT IN ('A', '') OR PORTAL_STAT IS NULL) ) OR (ACTION_TAKEN = 'S' AND PORTAL_STAT IN ('P', 'R') ) ) GROUP BY STIN",
            rejectCount: "SELECT STIN,TRDNAME,ITC_PERIOD AS RITC,count(1) AS RCOUNT FROM ANX2_3AF WHERE ITC_PERIOD=? AND (ACTION_TAKEN = 'R' OR ( (ACTION_TAKEN = '' OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT = 'R') ) ) GROUP BY STIN",
            pendingCount: "SELECT STIN,TRDNAME,ITC_PERIOD AS PITC,count(1) AS PCOUNT FROM ANX2_3AF WHERE ITC_PERIOD=? AND  (ACTION_TAKEN = 'P' OR ( (ACTION_TAKEN = '' OR       ACTION_TAKEN IS NULL) AND         (PORTAL_STAT = 'P') ) OR  (S_RETURN_STAT = 'NF (ITC-NA)' AND  ( (ACTION_TAKEN IN ('', 'S') OR   ACTION_TAKEN IS NULL) AND  (PORTAL_STAT IN ('A', '') OR  PORTAL_STAT IS NULL) ) ) ) GROUP BY STIN",
            dashSummA:"SELECT ICOUNT+CCOUNT AS count,(IFNULL(SUM(ITVAL),0)-IFNULL(SUM(CTVAL),0)) AS taxval,'0' as igst,'0' as cgst,'0' as sgst,'0' as cess FROM ( SELECT count(1) as ICOUNT, SUM(TAX_VALUE) as ITVAL FROM ANX2_3AF WHERE FLG !='X' AND DOCTYPE IN ('I','DN') and ITC_PERIOD=? AND S_RETURN_STAT != 'NF (ITC-NA)' AND (ACTION_TAKEN = 'A' OR ( (ACTION_TAKEN IN ('', 'S') OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT IN ('A', '') OR PORTAL_STAT IS NULL) ) OR (ACTION_TAKEN = 'S' AND PORTAL_STAT IN ('P', 'R') ) )) LEFT JOIN (SELECT count(1) as CCOUNT, SUM(TAX_VALUE) as CTVAL FROM ANX2_3AF WHERE FLG !='X' AND DOCTYPE = 'CN' and ITC_PERIOD=? AND S_RETURN_STAT != 'NF (ITC-NA)' AND (ACTION_TAKEN = 'A' OR ( (ACTION_TAKEN IN ('', 'S') OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT IN ('A', '') OR PORTAL_STAT IS NULL) ) OR (ACTION_TAKEN = 'S' AND PORTAL_STAT IN ('P', 'R') ) ));",
            dashSummR:"SELECT ICOUNT+CCOUNT AS count,(IFNULL(SUM(ITVAL),0)-IFNULL(SUM(CTVAL),0)) AS taxval,'0' as igst,'0' as cgst,'0' as sgst,'0' as cess FROM ( SELECT count(1) as ICOUNT, SUM(TAX_VALUE) as ITVAL FROM ANX2_3AF WHERE FLG !='X' AND DOCTYPE IN ('I','DN') and ITC_PERIOD=? AND (ACTION_TAKEN = 'R' OR ( (ACTION_TAKEN = '' OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT = 'R') ) )) LEFT JOIN (SELECT count(1) as CCOUNT, SUM(TAX_VALUE) as CTVAL FROM ANX2_3AF WHERE FLG !='X' AND DOCTYPE = 'CN' and ITC_PERIOD=? AND (ACTION_TAKEN = 'R' OR ( (ACTION_TAKEN = '' OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT = 'R') ) ));",
            dashSummP:"SELECT ICOUNT+CCOUNT AS count,(IFNULL(SUM(ITVAL),0)-IFNULL(SUM(CTVAL),0)) AS taxval,'0' as igst,'0' as cgst,'0' as sgst,'0' as cess FROM ( SELECT count(1) as ICOUNT, SUM(TAX_VALUE) as ITVAL FROM ANX2_3AF WHERE FLG !='X' AND DOCTYPE IN ('I','DN') and ITC_PERIOD=? AND  (ACTION_TAKEN = 'P' OR ( (ACTION_TAKEN = '' OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT = 'P') ) OR (S_RETURN_STAT = 'NF (ITC-NA)' AND ( (ACTION_TAKEN IN ('', 'S') OR ACTION_TAKEN IS NULL) AND  (PORTAL_STAT IN ('A', '') OR  PORTAL_STAT IS NULL) ) ) )) LEFT JOIN (SELECT count(1) as CCOUNT, SUM(TAX_VALUE) as CTVAL FROM ANX2_3AF WHERE FLG !='X' AND DOCTYPE = 'CN' and ITC_PERIOD=? AND  (ACTION_TAKEN = 'P' OR ( (ACTION_TAKEN = '' OR ACTION_TAKEN IS NULL) AND (PORTAL_STAT = 'P') ) OR (S_RETURN_STAT = 'NF (ITC-NA)' AND ( (ACTION_TAKEN IN ('', 'S') OR ACTION_TAKEN IS NULL) AND  (PORTAL_STAT IN ('A', '') OR  PORTAL_STAT IS NULL) ) ) ));",
            //repeatFileData: "REPLACE INTO ANX2_3AF(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,ITC_PERIOD,REJ_PST_FIL,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            updateFlagData: "UPDATE ANX2_3AF SET FLG=?,ERROR_DTL=NULL, ERROR_CODE=NULL  where ITC_PERIOD=?",
            updateFileData: "UPDATE ANX2_3AF SET FLG=?,ERROR_CODE=?,ERROR_DTL=? where DOCREF=?",
            acceptErrCount: "SELECT * from ANX2_3F_ERR_SUMM_A WHERE AITC=?",
            rejectErrCount: "SELECT * from ANX2_3F_ERR_SUMM_R WHERE RITC=?",
            pendingErrCount: "SELECT * from ANX2_3F_ERR_SUMM_P WHERE PITC=?",
            getRecordCount:"SELECT count(*) as count FROM ANX2_3AF where ITC_PERIOD='",
            dasherrorCount :"SELECT count(FLG) count  from ANX2_3AF where FLG='X' AND  ERROR_CODE is not null AND ITC_PERIOD=?",
            dashcrtrecCount:"SELECT count(FLG) count  from ANX2_3AF where FLG<>'X' AND  ERROR_CODE is not null AND ITC_PERIOD=?"
        },
        de: {
            insertFileData: "INSERT into ANX2_3AG(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,IGST,CGST,SGST,CESS,IS_ITC_ENTL,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,IGST_ACT,ITC_PERIOD,REJ_PST_FIL,CLM_REF,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            getData: "SELECT * from ANX2_3AG WHERE ITC_PERIOD=?",
            // getDataforJson:"SELECT * FROM ANX2_3AG A JOIN ANX2_ITEMDTLS B ON A.DOCREF=B.ITEMREF AND A.FLG='E' and A.ITC_PERIOD=?",
            getDataforJson:"SELECT * FROM ANX2_3AG  WHERE FLG='E' AND ITC_PERIOD=?",
            getCrcErrData:"SELECT * FROM ANX2_3AG  WHERE ERROR_CODE IS NOT NULL AND FLG='E' AND ITC_PERIOD=?",
            deleteAll: "DELETE FROM ANX2_3AG WHERE ITC_PERIOD=?",
            errdeleteAll: "DELETE FROM ANX2_3AG WHERE FLG='X' AND  ITC_PERIOD=?",
            nrmdeleteAll: "DELETE FROM ANX2_3AG WHERE FLG<>'X' AND  ITC_PERIOD=?",
            count: "SELECT count(*) count from ANX2_3AG where ITC_PERIOD=?",
            saveAction: "UPDATE ANX2_3AG SET IS_ITC_ENTL = ?, ACTION_TAKEN = ?,FLG=?,ERROR_DTL=NULL WHERE DOCREF = ? ",
            acceptCount: "SELECT * from ANX2_3G_SUMM_A WHERE AITC=?",
            rejectCount: "SELECT * from ANX2_3G_SUMM_R WHERE RITC=?",
            pendingCount: "SELECT * from ANX2_3G_SUMM_P WHERE PITC=?",
            acceptErrCount: "SELECT * from ANX2_3G_ERR_SUMM_A WHERE AITC=?",
            rejectErrCount: "SELECT * from ANX2_3G_ERR_SUMM_R WHERE RITC=?",
            pendingErrCount: "SELECT * from ANX2_3G_ERR_SUMM_P WHERE PITC=?",
            dashSummA:"SELECT count,taxval,igst,cgst,sgst,cess from ANX2_3G_DSUMM_A WHERE ITC_PERIOD=?",
            dashSummR:"SELECT count,taxval,igst,cgst,sgst,cess from ANX2_3G_DSUMM_R WHERE ITC_PERIOD=?",
            dashSummP:"SELECT count,taxval,igst,cgst,sgst,cess from ANX2_3G_DSUMM_P WHERE ITC_PERIOD=?",
          //repeatFileData: "REPLACE into ANX2_3AG(STIN,TRDNAME,DOCTYPE,DOCNUM,DOCDATE,DOCVALUE,POS,TAX_VALUE,IGST,CGST,SGST,CESS,IS_ITC_ENTL,S_TAXPERIOD,UPLOAD_DT,S_RETURN_STAT,PORTAL_STAT,APP_TAXRATE,IGST_ACT,ITC_PERIOD,REJ_PST_FIL,CLM_REF,CHCKSUM,FLG,DOCREF,ERROR_CODE,ERROR_DTL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            updateFlagData: "UPDATE ANX2_3AG SET FLG=?,ERROR_DTL=NULL, ERROR_CODE=NULL  where ITC_PERIOD=?",
            updateFileData: "UPDATE ANX2_3AG SET FLG=?,ERROR_CODE=?,ERROR_DTL=? where DOCREF=?",
            getRecordCount:"SELECT count(*) as count FROM ANX2_3AG where ITC_PERIOD='",
            dasherrorCount :"SELECT count(FLG) count  from ANX2_3AG where FLG='X' AND  ERROR_CODE is not null AND ITC_PERIOD=?",
            dashcrtrecCount:"SELECT count(FLG) count  from ANX2_3AG where FLG<>'X' AND  ERROR_CODE is not null AND ITC_PERIOD=?"
        },
        isdc: {
            insertFileData: "INSERT into ANX2_5(STIN,TRDNAME,DOCTYP,DOCNUM,DOCDT,IGST,CGST,SGST,CESS,DTXPRD,ASTIN,ATRDNAME,ADOCTYP,ADOCNUM,ADOCDT,AIGST,ACGST,ASGST,ACESS,ADTXPRD,ISAMD,AMD_RSN,ITC_PERIOD) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            getData: "SELECT * from ANX2_5 WHERE ITC_PERIOD=? ORDER BY LOWER(TRDNAME), strftime('%s',substr(DOCDT,7,4)||'-'||substr(DOCDT,4,2)||'-'||substr(DOCDT,1,2)), DOCNUM",
            deleteAll: "DELETE FROM ANX2_5 WHERE ITC_PERIOD=?",
            count: "SELECT count(*) count from ANX2_5 where ITC_PERIOD=?",
            dashSumm:"SELECT ICOUNT+CCOUNT AS count,(IFNULL(SUM(IIGST),0)-IFNULL(SUM(CIGST),0)) AS igst,(IFNULL(SUM(ICGST),0)-IFNULL(SUM(CCGST),0)) AS cgst,(IFNULL(SUM(ISGST),0)-IFNULL(SUM(CSGST),0)) AS sgst,(IFNULL(SUM(ICESS),0)-IFNULL(SUM(CCESS),0)) AS cess FROM ( SELECT count(1) as ICOUNT, SUM(IGST) as IIGST, SUM(CGST) as ICGST, SUM(SGST) as ISGST, SUM(CESS) as ICESS FROM ANX2_5 WHERE DOCTYP = 'I' and ITC_PERIOD=?) LEFT JOIN (SELECT count(1) as CCOUNT, SUM(IGST) as CIGST, SUM(CGST) as CCGST, SUM(SGST) as CSGST, SUM(CESS) as CCESS FROM ANX2_5 WHERE DOCTYP = 'CN' and ITC_PERIOD=?);",
            iCount:"SELECT DOCTYP,count(*) AS ICOUNT,SUM(IGST) AS IGST,SUM(CGST) AS CGST,SUM(SGST) AS SGST,SUM(CESS) AS CESS from ANX2_5 WHERE  ITC_PERIOD=? group by DOCTYP"
        },
        items: {
            insertItemData: "INSERT into ANX2_ITEMDTLS (HSN,RATE,TAXVAL,IGST,CGST,SGST,CESS,ITC_PERIOD,ITEMREF) VALUES (?,?,?,?,?,?,?,?,?)",
            maxItemId: "SELECT MAX(ItemID) max FROM ANX2_ITEMDETAILS",
            deleteAll: "DELETE FROM ANX2_ITEMDTLS WHERE ITC_PERIOD=?",
            getData: "SELECT * FROM ANX2_ITEMDTLS WHERE ITEMREF=? and ITC_PERIOD=?",
            deletenotreq:"delete from anx2_itemdtls where ITC_PERIOD=? and itemref not in (select docref from anx2_3ab union select docref from anx2_3ae union select docref from anx2_3af union select docref from anx2_3ag)",
          //repeatItemData: "REPLACE into ANX2_ITEMDTLS (HSN,RATE,TAXVAL,IGST,CGST,SGST,CESS,ITC_PERIOD,ITEMREF) VALUES (?,?,?,?,?,?,?,?,?)",

        }
    },
	matchingTables : {
		   progressSum : {
                          insertItemData : "INSERT OR IGNORE INTO PROGRESS_SUMM (STATUS,FIN_PRD,FIN_YR) VALUES (?,?,?)",
                          updateData : "UPDATE PROGRESS_SUMM SET STATUS =? WHERE FIN_PRD =?",
						  getData : "SELECT STATUS FROM PROGRESS_SUMM WHERE FIN_PRD=?",
						  deleteAll : "DELETE FROM PROGRESS_SUMM WHERE FIN_PRD=?"
                     },
            prDetails: {
                        insertItemData : "INSERT OR IGNORE INTO PR_DETL (DOCREF, GSTIN, LGL_TRDNAME, SUPPLY_TYPE, DOC_TYPE, DOC_NUM, DOC_DATE, TAXABLE_VALUE, TAX_AMOUNT, IGST, CGST, SGST, CESS, FIN_PRD, FIN_YR) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
						
                        getData : "SELECT T2.DOCREF, T2.GSTIN, T2.LGL_TRDNAME, T2.SUPPLY_TYPE, ((IFNULL((SELECT SUM(T3.TAXABLE_VALUE*100) FROM PR_DETL T3 WHERE T3.DOC_TYPE IN ('DN','I') AND T3.GSTIN = T2.GSTIN AND T3.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0) - IFNULL((SELECT SUM(T1.TAXABLE_VALUE*100) FROM PR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.GSTIN = T2.GSTIN AND T1.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0))/100) as TAXABLE_VALUE, ((IFNULL((SELECT SUM(T3.TAX_AMOUNT*100) FROM PR_DETL T3 WHERE T3.DOC_TYPE IN ('DN','I') AND T3.GSTIN = T2.GSTIN AND T3.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0) - IFNULL((SELECT SUM(T1.TAX_AMOUNT*100) FROM PR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.GSTIN = T2.GSTIN AND T1.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0))/100) as TAX_AMOUNT, ((IFNULL((SELECT SUM(T3.CGST*100) FROM PR_DETL T3 WHERE T3.DOC_TYPE IN ('DN','I') AND T3.GSTIN = T2.GSTIN AND T3.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0) - IFNULL((SELECT SUM(T1.CGST*100) FROM PR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.GSTIN = T2.GSTIN AND T1.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0))/100) as CGST, ((IFNULL((SELECT SUM(T3.IGST*100) FROM PR_DETL T3 WHERE T3.DOC_TYPE IN ('DN','I') AND T3.GSTIN = T2.GSTIN AND T3.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0) - IFNULL((SELECT SUM(T1.IGST*100) FROM PR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.GSTIN = T2.GSTIN AND T1.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0))/100) as IGST, ((IFNULL((SELECT SUM(T3.SGST*100) FROM PR_DETL T3 WHERE T3.DOC_TYPE IN ('DN','I') AND T3.GSTIN = T2.GSTIN AND T3.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0) - IFNULL((SELECT SUM(T1.SGST*100) FROM PR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.GSTIN = T2.GSTIN AND T1.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0))/100) as SGST, ((IFNULL((SELECT SUM(T3.CESS*100) FROM PR_DETL T3 WHERE T3.DOC_TYPE IN ('DN','I') AND T3.GSTIN = T2.GSTIN AND T3.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0) - IFNULL((SELECT SUM(T1.CESS*100) FROM PR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.GSTIN = T2.GSTIN AND T1.SUPPLY_TYPE = T2.SUPPLY_TYPE), 0))/100) as CESS FROM PR_DETL T2 WHERE T2.FIN_PRD = ? group BY T2.GSTIN,T2.SUPPLY_TYPE ORDER BY T2.LGL_TRDNAME ASC,T2.DOC_DATE ASC,T2.DOC_NUM ASC",
						
                        getDataByGstin: "select DOC_TYPE,DOC_NUM,DOC_DATE,TAXABLE_VALUE,TAX_AMOUNT,CGST,IGST,SGST,CESS from PR_DETL where GSTIN=? AND SUPPLY_TYPE=? AND FIN_PRD=? ORDER BY strftime('%s',substr(DOC_DATE,7,4)||'-'||substr(DOC_DATE,4,2)||'-'||substr(DOC_DATE,1,2)),UPPER(DOC_NUM)",
                        deleteAll : "DELETE FROM PR_DETL WHERE FIN_PRD=?",
						getPrDocRecords: "select * from PR_DETL WHERE FIN_PRD=? ORDER BY UPPER(LGL_TRDNAME),strftime('%s',substr(DOC_DATE,7,4)||'-'||substr(DOC_DATE,4,2)||'-'||substr(DOC_DATE,1,2)),UPPER(DOC_NUM)"
            },
            prDetailSummary: {
                        insertItemData : "INSERT OR IGNORE INTO PR_SUMM (SUPPLY_TYPE, NO_OF_DOCUMENTS, TAXABLE_VALUE , TAX_AMOUNT , FIN_PRD , FIN_YR) VALUES (?,?,?,?,?,?)",
						getData : "SELECT * FROM PR_SUMM WHERE FIN_PRD=?",
						deleteAll : "DELETE FROM PR_SUMM WHERE FIN_PRD=?"
            },
			matchResult : {
                  getDataAnx2: `SELECT 
								  * 
								FROM 
								  (
									select 
									  * 
									from 
									  ExactMatch 
									UNION 
									SELECT 
									  * 
									from 
									  ProbableMatch 
									UNION 
									SELECT 
									  * 
									FROM 
									  RemainingRecords
                                  ) WHERE FIN_PRD= ? OR PRFIN_PRD = ?`,
                updateANX2OnPRDelete3AB: "UPDATE ANX2_3AB SET MATCH_RESULT = NULL, MATCH_RSN = NULL WHERE ITC_PERIOD=?",
                updateANX2OnPRDelete3AE: "UPDATE ANX2_3AE SET MATCH_RESULT = NULL, MATCH_RSN = NULL WHERE ITC_PERIOD=?",
                updateANX2OnPRDelete3AF: "UPDATE ANX2_3AF SET MATCH_RESULT = NULL, MATCH_RSN = NULL WHERE ITC_PERIOD=?",
                updateANX2OnPRDelete3AG: "UPDATE ANX2_3AG SET MATCH_RESULT = NULL, MATCH_RSN = NULL WHERE ITC_PERIOD=?",
            },
            mrSummary : {
                insertItemData : `INSERT OR IGNORE INTO MR_SUMM (MATCH_TYPE,DOCS_IN_ANX2,DOCS_IN_PR,TAXABLE_VALUE,TAX_AMOUNT,APPROX,TOLERANCE,
                    FIN_PRD,FIN_YR) VALUES (?,?,?,?,?,?,?,?,?);`,
                insertTableWisedata : `INSERT OR IGNORE INTO tblnm (
                    MATCH_RESULT,
                    MATCH_TYPE,
                    NO_OF_DOCS,
                    TAXABLE_VALUE,
                    TAX_AMOUNT,
                    APPROX,
                    TOLERANCE,
                    FIN_PRD,
                    FIN_YR
                )
                VALUES (?,?,?,?,?,?,?,?,?);`,
                getData:`SELECT  mtype,tblnm,round(TValue,2) as TValue, round(tamount,2) as tamount,inAnxRec,inPrRec from  matchingSummary where FIN_PRD=?`,
                deleteMrSumm:`DELETE FROM MR_SUMM WHERE FIN_PRD =?`,
                deleteB2bSumm:`DELETE FROM MR_B2B_SUMM WHERE FIN_PRD =?`,
                deleteSezwpSumm:`DELETE FROM MR_SEZWP_SUMM WHERE FIN_PRD =?`,
                deleteSezwopSumm:`DELETE FROM MR_SEZWOP_SUMM WHERE FIN_PRD =?`,
                deleteDeSumm:`DELETE FROM MR_DE_SUMM WHERE FIN_PRD =?`,
                deleteMrDetails:`DELETE FROM MR_DETL WHERE FIN_PRD =?`,
                deletePrError:`DELETE FROM PR_ERROR WHERE FIN_PRD =?`,
                deleteProgressSumm:`DELETE FROM PROGRESS_SUMM WHERE FIN_PRD=?`,
                insertMrDetails:`INSERT OR IGNORE INTO MR_DETL (DOCREF, GSTIN, LGL_TRDNAME, DOC_TYPE, DOC_NUM, DOC_DATE, TAXABLE_VALUE, TAX_AMOUNT, CGST, IGST, SGST, CESS, ITC, ACTION, ACTION_TAKEN, REASON, FIN_PRD, FIN_YR, TABLE_NAME, MATCH_TYPE, RECORD_TYPE, FIELD_MATCH,'PORTAL_STAT','S_RETURN_STAT','MATCH_NUMBER')
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?);`,
                updateMrDetails:`UPDATE MR_DETL SET  REASON = ? ,MATCH_TYPE= ?,MATCH_TYPE_REFINE= ?, MATCH_NUMBER = ?,FIELD_MATCH = ?,FIELD_REFINE_MATCH=? WHERE DOCREF = ? and TABLE_NAME = ? AND RECORD_TYPE = ? AND MATCH_TYPE = ?`,
                refineMatchSummary:`SELECT T2.MATCH_TYPE AS matchType, T2.RECORD_TYPE, UPPER(T2.TABLE_NAME) AS tblnm, count(T2.MATCH_TYPE) AS numRec,

                (IFNULL((SELECT SUM(T3.TAXABLE_VALUE) FROM MR_DETL T3 WHERE T3.DOC_TYPE IN ('DN', 'I') AND T3.TABLE_NAME = T2.TABLE_NAME AND T3.MATCH_TYPE = T2.MATCH_TYPE AND T3.RECORD_TYPE='A' AND T2.RECORD_TYPE='A'), 0) -
                IFNULL((SELECT SUM(T1.TAXABLE_VALUE) FROM MR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.TABLE_NAME = T2.TABLE_NAME AND T1.MATCH_TYPE = T2.MATCH_TYPE AND T1.RECORD_TYPE='A' AND T2.RECORD_TYPE='A'), 0)) 
                AS TotalTaxbleValue,
                
                (IFNULL((SELECT SUM(T3.TAX_AMOUNT) FROM MR_DETL T3 WHERE T3.DOC_TYPE IN ('DN', 'I')  AND T3.TABLE_NAME = T2.TABLE_NAME AND T3.MATCH_TYPE = T2.MATCH_TYPE AND T3.RECORD_TYPE='A' AND T2.RECORD_TYPE='A'), 0) -  IFNULL((SELECT SUM(T1.TAX_AMOUNT) FROM MR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.TABLE_NAME = T2.TABLE_NAME AND T1.MATCH_TYPE = T2.MATCH_TYPE AND T1.RECORD_TYPE='A' AND T2.RECORD_TYPE='A'), 0)) 
                AS TotalTax
                
                FROM MR_DETL T2 WHERE T2.RECORD_TYPE='A' AND T2.FIN_PRD=? 
                
                GROUP BY T2.MATCH_TYPE,UPPER(T2.TABLE_NAME),T2.RECORD_TYPE
                
                UNION
                
                SELECT T2.MATCH_TYPE AS matchType, T2.RECORD_TYPE, UPPER(T2.TABLE_NAME) AS tblnm, count(T2.MATCH_TYPE) AS numRec,
                
                (IFNULL((SELECT SUM(T3.TAXABLE_VALUE) FROM MR_DETL T3 WHERE T3.DOC_TYPE IN ('DN', 'I') AND T3.TABLE_NAME = T2.TABLE_NAME AND T3.MATCH_TYPE = T2.MATCH_TYPE AND T3.RECORD_TYPE='P' AND T2.RECORD_TYPE='P'), 0) -
                IFNULL((SELECT SUM(T1.TAXABLE_VALUE) FROM MR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.TABLE_NAME = T2.TABLE_NAME AND T1.MATCH_TYPE = T2.MATCH_TYPE AND T1.RECORD_TYPE='P' AND T2.RECORD_TYPE='P'), 0)) 
                AS TotalTaxbleValue,
                
                (IFNULL((SELECT SUM(T3.TAX_AMOUNT) FROM MR_DETL T3 WHERE T3.DOC_TYPE IN ('DN', 'I') AND T3.TABLE_NAME = T2.TABLE_NAME AND T3.MATCH_TYPE = T2.MATCH_TYPE AND T3.RECORD_TYPE='P' AND T2.RECORD_TYPE='P'), 0) - 
                IFNULL((SELECT SUM(T1.TAX_AMOUNT) FROM MR_DETL T1 WHERE T1.DOC_TYPE IN ('CN') AND T1.TABLE_NAME = T2.TABLE_NAME AND T1.MATCH_TYPE = T2.MATCH_TYPE AND T1.RECORD_TYPE='P' AND T2.RECORD_TYPE='P'), 0)) 
                AS TotalTax
                
                FROM MR_DETL T2 WHERE T2.RECORD_TYPE='P' OR T2.MATCH_TYPE = 'INPR' AND T2.FIN_PRD=?
                
                GROUP BY T2.MATCH_TYPE,UPPER(T2.TABLE_NAME),T2.RECORD_TYPE`,
                 anx2B2bUpdate :`UPDATE ANX2_3AB set MATCH_RESULT = (select MR_DETL.MATCH_TYPE from MR_DETL where ANX2_3AB.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'B2B') , MATCH_RSN = (select MR_DETL.REASON from MR_DETL where ANX2_3AB.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'B2B') WHERE EXISTS (
                    select *from MR_DETL where ANX2_3AB.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'B2B'
                )`,
                anx2SezwpUpdate :`UPDATE ANX2_3AE set MATCH_RESULT = (select MR_DETL.MATCH_TYPE from MR_DETL where ANX2_3AE.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'SEZWP') , MATCH_RSN = (select MR_DETL.REASON from MR_DETL where ANX2_3AE.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'SEZWP') WHERE EXISTS (
                    select *from MR_DETL where ANX2_3AE.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'SEZWP'
                )`,
                anx2SezwopUpdate :`UPDATE ANX2_3AF set MATCH_RESULT = (select MR_DETL.MATCH_TYPE from MR_DETL where ANX2_3AF.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'SEZWOP') , MATCH_RSN = (select MR_DETL.REASON from MR_DETL where ANX2_3AF.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'SEZWOP') WHERE EXISTS (
                    select *from MR_DETL where ANX2_3AF.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'SEZWOP'
                )`,
                anx2DeUpdate:`UPDATE ANX2_3AG set MATCH_RESULT = (select MR_DETL.MATCH_TYPE from MR_DETL where ANX2_3AG.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'DE') , MATCH_RSN = (select MR_DETL.REASON from MR_DETL where ANX2_3AG.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'DE') WHERE EXISTS (
                    select *from MR_DETL where ANX2_3AG.DOCREF = MR_DETL.DOCREF and MR_DETL.RECORD_TYPE ='A' and MR_DETL.TABLE_NAME = 'DE'
                )`,
                anx2B2bRSNUpdate : `UPDATE ANX2_3AB set MATCH_RSN = NULL WHERE MATCH_RESULT IN('INANX2','INPR')`,
                anx2DeRSNUpdate : `UPDATE ANX2_3AG set MATCH_RSN = NULL WHERE MATCH_RESULT IN('INANX2','INPR')`,
                anx2SezwpRSNUpdate : `UPDATE ANX2_3AE set MATCH_RSN = NULL WHERE MATCH_RESULT IN('INANX2','INPR')`,
                anx2SezwopRSNUpdate : `UPDATE ANX2_3AF set MATCH_RSN = NULL WHERE MATCH_RESULT IN('INANX2','INPR')`,
                resetExistMatchType:`UPDATE MR_DETL set MATCH_TYPE_REFINE = '',MATCH_TYPE = (select md.MATCH_TYPE_REFINE from MR_DETL md where MR_DETL.DOCREF = md.DOCREF and MR_DETL.RECORD_TYPE = md.RECORD_TYPE and MR_DETL.TABLE_NAME = md.TABLE_NAME and md.MATCH_TYPE_REFINE IS NOT NULL) where MR_DETL.FIN_PRD= ? AND MR_DETL.MATCH_TYPE_REFINE IS NOT NULL`,
                restExistFieldMatch:`UPDATE MR_DETL set FIELD_REFINE_MATCH = '',FIELD_MATCH = (select md.FIELD_REFINE_MATCH from MR_DETL md where MR_DETL.DOCREF = md.DOCREF and MR_DETL.RECORD_TYPE = md.RECORD_TYPE and MR_DETL.TABLE_NAME = md.TABLE_NAME and md.FIELD_REFINE_MATCH IS NOT NULL and md.FIELD_REFINE_MATCH <> '' AND MR_DETL.MATCH_TYPE NOT IN ('INANX2','INPR')) 
                where MR_DETL.FIN_PRD= ? AND MR_DETL.FIELD_REFINE_MATCH IS NOT NULL`,
                resetPrmToInPr : `UPDATE MR_DETL set MATCH_TYPE = 'INPR', 
                MATCH_TYPE_REFINE = 'PRM',
                FIELD_MATCH = '',
                FIELD_REFINE_MATCH = (SELECT mr.FIELD_REFINE_MATCH FROM MR_DETL mr where MR_DETL.MATCH_TYPE = mr.MATCH_TYPE_REFINE 
                AND MR_DETL.MATCH_NUMBER = mr.MATCH_NUMBER AND mr.RECORD_TYPE = 'A')
                where RECORD_TYPE = 'P' 
                AND MATCH_TYPE = (SELECT mr.MATCH_TYPE_REFINE FROM MR_DETL mr where  mr.MATCH_TYPE_REFINE = MR_DETL.MATCH_TYPE
                AND mr.MATCH_NUMBER = MR_DETL.MATCH_NUMBER AND mr.RECORD_TYPE = 'A' and mr.FIN_PRD = ? ) and MATCH_TYPE = 'PRM' and (MATCH_TYPE_REFINE <> 'PRM' OR MATCH_TYPE_REFINE IS NULL) and MR_DETL.FIN_PRD= ?`,
                resetFieldMatchOfInax2AndInpr:`UPDATE MR_DETL set FIELD_MATCH = NULL where MATCH_TYPE IN ('INANX2','INPR') AND FIN_PRD= ?`,
                resetExistRefineMatchType:`UPDATE MR_DETL set MATCH_TYPE_REFINE = NULL,FIELD_REFINE_MATCH = NULL WHERE FIN_PRD=?`, 
                resetReasonsPrmRecords: `UPDATE MR_DETL
                SET REASON = CASE WHEN FIELD_MATCH = 'DOC_TYPE' THEN 'Document type mismatch' ELSE 'GSTIN mismatch' END
                WHERE FIN_PRD= ? AND MATCH_TYPE = 'PRM' and MATCH_TYPE_REFINE IS NOT NULL`,
                checkApprxTolerance:`select APPROX,TOLERANCE from MR_SUMM where FIN_PRD=? group by APPROX,TOLERANCE`,
                getMaxMatchNumber : `select MATCH_NUMBER from MR_DETL where FIN_PRD= ? AND (MATCH_NUMBER IS NOT NULL and MATCH_NUMBER <> '') ORDER BY MATCH_NUMBER DESC LIMIT 1`
            },
          getMatchResult : {
                mrGetData:`SELECT DOCREF,
                                GSTIN,
                                LGL_TRDNAME,
                                DOC_TYPE,
                                DOC_NUM,
                                DOC_DATE,
                                TAXABLE_VALUE,
                                TAX_AMOUNT,
                                CGST,
                                IGST,
                                SGST,
                                CESS,
                                ITC,
                                ACTION,
                                ACTION_TAKEN,
                                PORTAL_STAT,
                                S_RETURN_STAT,
                                REASON,
                                FIN_PRD,
                                FIN_YR,
                                TABLE_NAME,
                                MATCH_TYPE,
                                RECORD_TYPE,
                                FIELD_MATCH,
                                MATCH_NUMBER
                            FROM MR_DETL
                            WHERE MATCH_TYPE =? AND UPPER(TABLE_NAME) = UPPER(?) AND FIN_PRD =? AND RECORD_TYPE IN('A','P')  orderby`,
                matchall:`SELECT DOCREF,
                            GSTIN,
                            LGL_TRDNAME,
                            DOC_TYPE,
                            DOC_NUM,
                            DOC_DATE,
                            TAXABLE_VALUE,
                            TAX_AMOUNT,
                            CGST,
                            IGST,
                            SGST,
                            CESS,
                            ITC,
                            ACTION,
                            ACTION_TAKEN,
                            PORTAL_STAT,
                            S_RETURN_STAT,
                            REASON,
                            FIN_PRD,
                            FIN_YR,
                            TABLE_NAME,
                            MATCH_TYPE,
                            RECORD_TYPE,
                            FIELD_MATCH,
                            MATCH_NUMBER
                        FROM MR_DETL
                        WHERE  matchall AND UPPER(TABLE_NAME) = UPPER(?) AND FIN_PRD =? AND RECORD_TYPE IN('A','P') orderby`,
                refineData:`SELECT DOCREF,GSTIN,LGL_TRDNAME,DOC_TYPE,DOC_NUM,DOC_DATE,TAXABLE_VALUE,TAX_AMOUNT,CGST,IGST,SGST,CESS,ITC,ACTION,ACTION_TAKEN,REASON,
                                FIN_PRD,FIN_YR,TABLE_NAME,MATCH_TYPE,RECORD_TYPE,FIELD_MATCH,MATCH_NUMBER
                                FROM MR_DETL where FIN_PRD=? and MATCH_TYPE <> 'EM'`,
                getMatchSummaryData:`SELECT MATCH_TYPE
                                        FROM tblnm WHERE MATCH_RESULT =? and MATCH_TYPE=? AND FIN_PRD=?;`,
                updateMatchResult:`UPDATE tblnm set NO_OF_DOCS=?, TAXABLE_VALUE = ?,TAX_AMOUNT = ?  WHERE MATCH_RESULT = ? AND MATCH_TYPE=? AND FIN_PRD = ?`,
          },
		  takeAction:{
			  saveAction3AB: "UPDATE ANX2_3AB SET MATCH_RESULT=?, MATCH_RSN=?, ACTION_TAKEN=?, IS_ITC_ENTL=?, FLG='E' WHERE DOCREF=? AND ITC_PERIOD=?",
			  saveAction3AE: "UPDATE ANX2_3AE SET MATCH_RESULT=?, MATCH_RSN=?, ACTION_TAKEN=?, IS_ITC_ENTL=?, FLG='E' WHERE DOCREF=? AND ITC_PERIOD=?",
			  saveAction3AF: "UPDATE ANX2_3AF SET MATCH_RESULT=?, MATCH_RSN=?, ACTION_TAKEN=?, FLG='E' WHERE DOCREF=? AND ITC_PERIOD=?",
              saveAction3AG: "UPDATE ANX2_3AG SET MATCH_RESULT=?, MATCH_RSN=?, ACTION_TAKEN=?, IS_ITC_ENTL=?, FLG='E' WHERE DOCREF=? AND ITC_PERIOD=?",
              
              saveActionMR: "UPDATE MR_DETL SET ACTION_TAKEN=?,ACTION=?, ITC=? WHERE DOCREF=? AND FIN_PRD=? AND RECORD_TYPE='A'",
          },
          errorFile: {
              saveErrorFile: "REPLACE INTO PR_ERROR(ERR_FILE, FIN_PRD) VALUES(?, ?)",
              getErrorFile: "SELECT ERR_FILE FROM PR_ERROR WHERE FIN_PRD = ?",
            }
	}
}

/** Create Table Scripts should maintain here */
//flag U for uploaded from online ,N for added New from Offline 
// D- mark for delete ,E - editing ,F- failed Records ,C-corrected records
const createAnnex1Table = {
    table3a: `CREATE TABLE IF NOT EXISTS ANX1_3A (DOC_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        DOCREF TEXT NOT NULL UNIQUE,
        PLACE_OF_SUPPLY INTEGER NOT NULL,
        DIFF_PERCENTAGE INTEGER,
        DOC_TYPE CHAR(1),
        SEC7_ACT CHAR(1),
        UPLOAD_DATE DATE,
        SUPPLY_TYPE TEXT NOT NULL,
        FP TEXT,
        TAX_PERIOD TEXT,
        TOTAL_TAXABLE_VALUE INTEGER NOT NULL ,
        CGST INTEGER,
        IGST INTEGER,
        SGST INTEGER,
        CESS INTEGER, 
        STATUS TEXT,
        FLAG CHAR(1),
        ERROR_CODE TEXT,
        ERROR_DETAIL TEXT,
        CONSTRAINT UNIQUE_ANX1_3A UNIQUE (PLACE_OF_SUPPLY,SEC7_ACT ,DIFF_PERCENTAGE ,FP , TAX_PERIOD));`,

    anx13cdData: `CREATE TABLE IF NOT EXISTS ANX1_3CD 
    (
     DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
     DOC_TYPE CHAR NOT NULL,
     GSTIN TEXT NOT NULL,
     DOCREF TEXT NOT NULL,
     DOC_NUM TEXT NOT NULL,
     DOC_DATE DATE NOT NULL,
     DOC_VAL DECIMAL(13,2) NOT NULL,
     DOC_YEAR TEXT(4) NOT NULL,
     EXPORT_TYPE VARCHAR2(6) NOT NULL,
     SHIPNG_BILL_NUM TEXT,
     SHIPNG_BILL_DATE DATE,
     PORT_CODE TEXT,
     TOTAL_TAX_VALUE DECIMAL (13, 2) NOT NULL,
     TOTAL_IGST  DECIMAL (13, 2),
     TOTAL_CESS  DECIMAL (13, 2),
     SUPPLY_TYPE TEXT NOT NULL,
     UPLOAD_DT DATE, 
     FLAG CHAR(1) NOT NULL,
     STATUS TEXT,
     FP TEXT,
     TAX_PERIOD TEXT,
     ERROR_CODE TEXT,
     ERROR_DETAIL TEXT,
     CONSTRAINT UNIQUE_ANX1_3CD UNIQUE (DOC_NUM COLLATE NOCASE,DOC_TYPE,DOC_YEAR,TAX_PERIOD,FP));`,
    anx1itemData: "CREATE TABLE IF NOT EXISTS ANX1_ITEMDTLS (ITEM_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, HSN TEXT, TAXRATE DECIMAL NOT NULL, TAXVAL DECIMAL (13, 2) NOT NULL,IGST DECIMAL (13, 2),CGST DECIMAL (13, 2), SGST DECIMAL (13, 2), CESS DECIMAL (13, 2),ITEMREF TEXT NOT NULL);",
    anx1rev3hData: "CREATE TABLE IF NOT EXISTS ANX1_3H (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,DOCREF TEXT NOT NULL, CTIN  TEXT (15) NOT NULL,LGL_TRDNAME TEXT (99), POS STRING (2) NOT NULL,TAX_VALUE DECIMAL (13, 2) NOT NULL,IGST  DECIMAL (13, 2), CGST  DECIMAL (13, 2),  SGST  DECIMAL (13, 2),  CESS  DECIMAL (13, 2),DIFF_PERCENTAGE INTEGER NOT NULL,SEC7_ACT CHAR(1) NOT NULL, SUPPLY_TYPE TEXT NOT NULL,UPLOAD_DT TEXT,FLAG CHAR(1) NOT NULL, STATUS TEXT,FP TEXT,DOCTYPE CHAR NOT NULL,TAX_PERIOD TEXT,ERROR_CODE TEXT,ERROR_DETAIL TEXT ,CONSTRAINT UNIQUE_ANX1_3H UNIQUE (POS,DIFF_PERCENTAGE,SEC7_ACT,CTIN,FP,TAX_PERIOD));",
    anx1Summ: "CREATE TABLE IF NOT EXISTS ANX1_SUMM (TABLE_TYP TEXT NOT NULL, NO_OF_REC INTEGER NOT NULL, DOC_TYPE CHAR(2), CTIN TEXT, LGL_TRDNAME TEXT,FP TEXT NOT NULL, TAX_PERIOD TEXT NOT NULL, NET_TAXABLE_VALUE DECIMAL (15, 2) NOT NULL,CGST DECIMAL (13, 2),IGST DECIMAL (13, 2),SGST DECIMAL (13, 2),CESS DECIMAL (13, 2), PAYMT_WITH_TAX CHAR(1), NO_OF_REC_REJ INTEGER, NO_OF_REC_MFD INTEGER, VAL_SUP_MADE DECIMAL (13, 2), VAL_SUP_RETURN DECIMAL (13, 2), SUMM_TYP TEXT DEFAULT NULL, CONSTRAINT UNIQUE_ANX1_SUMM UNIQUE (TABLE_TYP, FP, TAX_PERIOD, DOC_TYPE, CTIN));",
    anx1ErrorSumm: "CREATE TABLE IF NOT EXISTS ANX1_ERR_SUMM (TABLE_TYP TEXT NOT NULL, NO_OF_REC INTEGER NOT NULL, DOC_TYPE CHAR(2), CTIN TEXT, LGL_TRDNAME TEXT,FP TEXT NOT NULL, TAX_PERIOD TEXT NOT NULL, NET_TAXABLE_VALUE DECIMAL (15, 2) NOT NULL,CGST DECIMAL (13, 2),IGST DECIMAL (13, 2),SGST DECIMAL (13, 2),CESS DECIMAL (13, 2), PAYMT_WITH_TAX CHAR(1), NO_OF_REC_REJ INTEGER, NO_OF_REC_MFD INTEGER, VAL_SUP_MADE DECIMAL (13, 2), VAL_SUP_RETURN DECIMAL (13, 2), SUMM_TYP TEXT DEFAULT NULL, CONSTRAINT UNIQUE_ANX1_ERR_SUMM UNIQUE (TABLE_TYP, FP, TAX_PERIOD, DOC_TYPE, CTIN));",
    table3b: "CREATE TABLE IF NOT EXISTS ANX1_3B (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,DOCREF TEXT NOT NULL, CTIN  TEXT (15) NOT NULL,LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL,DOC_YEAR TEXT(4) NOT NULL,DOC_VAL DECIMAL (13, 2) NOT NULL, POS STRING (2) NOT NULL, DIFF_PERCENTAGE INTEGER, SEC7_ACT CHAR(1),  TAX_VALUE DECIMAL (15, 2) NOT NULL, IGST  DECIMAL (13, 2),  CGST  DECIMAL (13, 2), SGST  DECIMAL (13, 2), CESS  DECIMAL (13, 2), SUPPLY_TYPE TEXT NOT NULL, CTIN_TYPE TEXT, UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL,  STATUS TEXT, FP TEXT, TAX_PERIOD TEXT, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT UNIQUE_ANX1_3B UNIQUE (DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    anx14Data: "CREATE TABLE IF NOT EXISTS ANX1_4 (DOC_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,DOCREF TEXT NOT NULL UNIQUE,ETIN TEXT NOT NULL,LGL_TRDNAME TEXT,SUPPLY_VAL DECIMAL (13, 2) NOT NULL,SUPPLY_VAL_RETURNED DECIMAL (13, 2)  NOT NULL,NET_SUPPLY_VAL DECIMAL (13, 2) NOT NULL,SUPPLY_TYPE TEXT, CGST DECIMAL (13, 2),IGST DECIMAL (13, 2),SGST DECIMAL (13, 2),CESS DECIMAL (13, 2),UPLOAD_DATE DATE,FP TEXT,TAX_PERIOD TEXT,STATUS TEXT,FLAG CHAR(1),ERROR_CODE TEXT,ERROR_DETAIL TEXT,CONSTRAINT UNIQUE_ANX1_4 UNIQUE (ETIN,TAX_PERIOD))",
    table3ef: "CREATE TABLE IF NOT EXISTS ANX1_3EF (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DOCREF TEXT NOT NULL, CTIN  TEXT (15) NOT NULL,LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL,DOC_YEAR TEXT(4) NOT NULL,DOC_VAL DECIMAL (13, 2) NOT NULL, POS STRING (2) NOT NULL, DIFF_PERCENTAGE INTEGER, TAX_VALUE DECIMAL (15, 2) NOT NULL, IGST  DECIMAL (13, 2), CESS  DECIMAL (13, 2), SUPPLY_TYPE TEXT NOT NULL, PAY_TYP CHAR(6) NOT NULL, CLAIM_REFUND CHAR(1), UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL,  STATUS TEXT, FP TEXT, TAX_PERIOD TEXT, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT UNIQUE_ANX1_3EF UNIQUE (DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    table3g: "CREATE TABLE IF NOT EXISTS ANX1_3G (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DOCREF TEXT NOT NULL, CTIN  TEXT (15) NOT NULL,LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL,DOC_YEAR TEXT(4) NOT NULL,DOC_VAL DECIMAL (13, 2) NOT NULL, POS STRING (2) NOT NULL, DIFF_PERCENTAGE INTEGER NOT NULL, SEC7_ACT CHAR(1), TAX_VALUE DECIMAL (15, 2) NOT NULL, IGST  DECIMAL (13, 2), CGST  DECIMAL (13, 2), SGST  DECIMAL (13, 2), CESS  DECIMAL (13, 2), SUPPLY_TYPE TEXT NOT NULL, CLAIM_REFUND CHAR(1) NOT NULL, UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL,  STATUS TEXT, FP TEXT, TAX_PERIOD TEXT, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT UNIQUE_ANX1_3G UNIQUE (DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    table3i: `
        CREATE TABLE IF NOT EXISTS ANX1_3I 
           (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
           DOCREF TEXT NOT NULL, 
           POS STRING (2) NOT NULL,
           TAX_VALUE DECIMAL (13, 2) NOT NULL,
           IGST  DECIMAL (13, 2), 
           CESS  DECIMAL (13, 2),
           SUPPLY_TYPE TEXT NOT NULL,
           UPLOAD_DT TEXT,
           DIFF_PERCENTAGE INTEGER NOT NULL,
           REFUND_ELG CHAR(1) NOT NULL,
           FLAG CHAR(1) NOT NULL, 
           STATUS TEXT, 
           FP TEXT,
           TAX_PERIOD TEXT,
           ERROR_CODE TEXT,
           ERROR_DETAIL TEXT ,
           CONSTRAINT UNIQUE_ANX1_3I UNIQUE (POS,FP,TAX_PERIOD)
    )`,
    table3j : `CREATE TABLE IF NOT EXISTS ANX1_3J
    (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    DOCREF TEXT NOT NULL, 
    DOCTYPE CHAR NOT NULL,
    POS STRING (2) NOT NULL,
    BOENUM STRING(16) NOT NULL,  
    BOEPCD STRING(6),
    BOEDT DATE,
    BOEVAL DECIMAL(13,2) NOT NULL,
    BOEYEAR STRING(4) NOT NULL,
    TAX_VALUE DECIMAL (13, 2) NOT NULL,
    IGST  DECIMAL (13, 2), 
    CESS  DECIMAL (13, 2),
    SUPPLY_TYPE TEXT NOT NULL,
    UPLOAD_DT TEXT,
    REFUND_ELG CHAR(1) NOT NULL,
    FLAG CHAR(1) NOT NULL, 
    STATUS TEXT, 
    FP TEXT,
    TAX_PERIOD TEXT,
    ERROR_CODE TEXT,
    ERROR_DETAIL TEXT ,
   CONSTRAINT UNIQUE_ANX1_3J UNIQUE(BOENUM COLLATE NOCASE,BOEYEAR,TAX_PERIOD,FP)
)`,
    table3K: `CREATE TABLE IF NOT EXISTS ANX1_3K (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DOCREF TEXT NOT NULL, CTIN TEXT (15) NOT NULL, LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL, PORT_CODE TEXT(6) NOT NULL, BOE_NUM TEXT(16) NOT NULL, BOE_DATE DATE NOT NULL, BOE_YEAR TEXT(4) NOT NULL, BOE_VALUE DECIMAL(13, 2) NOT NULL, POS TEXT(2) NOT NULL, SUPPLY_TYPE TEXT NOT NULL, TAX_VALUE DECIMAL(15, 2) NOT NULL, IGST  DECIMAL(13, 2), CESS  DECIMAL(13, 2), UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL, STATUS TEXT, FP TEXT, TAX_PERIOD TEXT, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT UNIQUE_ANX1_3K UNIQUE (BOE_NUM COLLATE NOCASE, BOE_YEAR, FP, TAX_PERIOD))`,
    table3L: "CREATE TABLE IF NOT EXISTS ANX1_3L ( DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, TABLE_TYPE TEXT NOT NULL, DOCREF TEXT NOT NULL, CTIN  TEXT (15) NOT NULL,LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL,DOC_YEAR TEXT(4) NOT NULL,DOC_VAL DECIMAL (13, 2) NOT NULL, POS STRING (2) NOT NULL, DIFF_PERCENTAGE INTEGER, SEC7_ACT CHAR(1), TAX_VALUE DECIMAL (15, 2) NOT NULL, IGST  DECIMAL (13, 2),CGST  DECIMAL (13, 2), SGST  DECIMAL (13, 2), CESS  DECIMAL (13, 2), SUPPLY_TYPE TEXT NOT NULL, CLAIM_REFUND CHAR(1), UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL,  STATUS TEXT, FP TEXT, TAX_PERIOD TEXT, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT UNIQUE_ANX1_3L UNIQUE (TABLE_TYPE,DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    createAnx1History: `CREATE TABLE IF NOT EXISTS FILE_UPLOAD_HISTORY(ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,TAX_PERIOD TEXT NOT NULL,FILE_NAME STRING NOT NULL, TYPE CHAR(1) NOT NULL, UPLOAD_TIME DATETIME NOT NULL, STATUS CHAR(1) NOT NULL, ERROR_FILE STRING, CONSTRAINT UNIQUE_FILE_UPLOAD_HISTORY UNIQUE (FILE_NAME, TAX_PERIOD));`,
}

const createAmendmentTable = {

    tableB2BAO: "CREATE TABLE IF NOT EXISTS ANX1_3BAO (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,DOCREF TEXT NOT NULL,REVDOCREF TEXT NOT NULL,CTIN TEXT (15) NOT NULL, LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL, DOC_YEAR TEXT(4) NOT NULL, CTIN_TYPE TEXT, UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL, REV_CTIN  TEXT(15) NOT NULL, REV_LGL_TRDNAME TEXT(99), REV_DOCTYPE CHAR(2) NOT NULL, REV_DOC_NUM TEXT(16) NOT NULL,REV_DOC_DATE DATE NOT NULL,REV_DOC_YEAR TEXT(4) NOT NULL,REV_DOC_VAL DECIMAL (13, 2) NOT NULL, REV_POS STRING (2) NOT NULL, REV_DIFF_PERCENTAGE INTEGER NOT NULL, REV_SEC7_ACT CHAR(1),REV_TAX_VALUE DECIMAL (15, 2) NOT NULL, REV_CTIN_TYPE TEXT,REV_IGST  DECIMAL (13, 2), REV_CGST  DECIMAL (13, 2), REV_SGST  DECIMAL (13, 2), REV_CESS  DECIMAL (13, 2),REV_SUPPLY_TYPE TEXT NOT NULL,STATUS TEXT, FP TEXT NOT NULL, TAX_PERIOD TEXT NOT NULL, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT REV_UNIQUE_ANX1_3BAO UNIQUE (REV_DOC_NUM COLLATE NOCASE,REV_DOCTYPE,REV_DOC_YEAR,TAX_PERIOD,FP), CONSTRAINT ORG_UNIQUE_ANX1_3BAO UNIQUE(DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    tableB2BA: "CREATE TABLE IF NOT EXISTS ANX1_3BA (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,DOCREF TEXT NOT NULL,REVDOCREF TEXT NOT NULL,CTIN TEXT (15) NOT NULL, LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL, DOC_YEAR TEXT(4) NOT NULL, CTIN_TYPE TEXT, UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL, REV_CTIN  TEXT(15) NOT NULL, REV_LGL_TRDNAME TEXT(99), REV_DOCTYPE CHAR(2) NOT NULL, REV_DOC_NUM TEXT(16) NOT NULL,REV_DOC_DATE DATE NOT NULL,REV_DOC_YEAR TEXT(4) NOT NULL,REV_DOC_VAL DECIMAL (13, 2) NOT NULL, REV_POS STRING (2) NOT NULL, REV_DIFF_PERCENTAGE INTEGER NOT NULL, REV_SEC7_ACT CHAR(1),REV_TAX_VALUE DECIMAL (15, 2) NOT NULL, REV_CTIN_TYPE TEXT,REV_IGST  DECIMAL (13, 2), REV_CGST  DECIMAL (13, 2), REV_SGST  DECIMAL (13, 2), REV_CESS  DECIMAL (13, 2),REV_SUPPLY_TYPE TEXT NOT NULL,STATUS TEXT, FP TEXT NOT NULL, TAX_PERIOD TEXT NOT NULL, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT REV_UNIQUE_ANX1_3BA UNIQUE (REV_DOC_NUM COLLATE NOCASE,REV_DOCTYPE,REV_DOC_YEAR,TAX_PERIOD,FP), CONSTRAINT ORG_UNIQUE_ANX1_3BA UNIQUE (DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    tableSEZA: "CREATE TABLE IF NOT EXISTS ANX1_3EFA (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,DOCREF TEXT NOT NULL,CTIN TEXT (15) NOT NULL, LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL, DOC_YEAR TEXT(4) NOT NULL, CTIN_TYPE TEXT, UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL, REV_CTIN  TEXT(15) NOT NULL, REV_LGL_TRDNAME TEXT(99), REV_DOCTYPE CHAR(2) NOT NULL, REV_DOC_NUM TEXT(16) NOT NULL,REV_DOC_DATE DATE NOT NULL,REV_DOC_YEAR TEXT(4) NOT NULL,REV_DOC_VAL DECIMAL (13, 2) NOT NULL, REV_POS STRING (2) NOT NULL, REV_DIFF_PERCENTAGE INTEGER NOT NULL, REV_TAX_VALUE DECIMAL (15, 2) NOT NULL, REV_CTIN_TYPE TEXT,REV_IGST  DECIMAL (13, 2), REV_CESS  DECIMAL (13, 2),REV_SUPPLY_TYPE TEXT NOT NULL,PAY_TYP CHAR(6) NOT NULL,CLAIM_REFUND CHAR(1),STATUS TEXT, FP TEXT NOT NULL, TAX_PERIOD TEXT NOT NULL, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT REV_UNIQUE_ANX1_3EFA UNIQUE (REV_DOC_NUM COLLATE NOCASE,REV_DOCTYPE,REV_DOC_YEAR,TAX_PERIOD,FP), CONSTRAINT ORG_UNIQUE_ANX1_3EFA UNIQUE(DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
    tableDEA: "CREATE TABLE IF NOT EXISTS ANX1_3GA (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,DOCREF TEXT NOT NULL,CTIN TEXT (15) NOT NULL, LGL_TRDNAME TEXT (99), DOCTYPE CHAR(2) NOT NULL,DOC_NUM TEXT(16) NOT NULL,DOC_DATE DATE NOT NULL, DOC_YEAR TEXT(4) NOT NULL, CTIN_TYPE TEXT, UPLOAD_DT TEXT, FLAG CHAR(1) NOT NULL, REV_CTIN  TEXT(15) NOT NULL, REV_LGL_TRDNAME TEXT(99), REV_DOCTYPE CHAR(2) NOT NULL, REV_DOC_NUM TEXT(16) NOT NULL,REV_DOC_DATE DATE NOT NULL,REV_DOC_YEAR TEXT(4) NOT NULL,REV_DOC_VAL DECIMAL (13, 2) NOT NULL, REV_POS STRING (2) NOT NULL, REV_DIFF_PERCENTAGE INTEGER NOT NULL, REV_SEC7_ACT CHAR(1),REV_TAX_VALUE DECIMAL (15, 2) NOT NULL, REV_CTIN_TYPE TEXT,REV_IGST  DECIMAL (13, 2), REV_CGST  DECIMAL (13, 2), REV_SGST  DECIMAL (13, 2), REV_CESS  DECIMAL (13, 2),CLAIM_REFUND CHAR(1),REV_SUPPLY_TYPE TEXT NOT NULL,STATUS TEXT, FP TEXT NOT NULL, TAX_PERIOD TEXT NOT NULL, ERROR_CODE TEXT, ERROR_DETAIL TEXT, CONSTRAINT REV_UNIQUE_ANX1_3DEA UNIQUE (REV_DOC_NUM COLLATE NOCASE,REV_DOCTYPE,REV_DOC_YEAR,TAX_PERIOD,FP), CONSTRAINT ORG_UNIQUE_ANX1_3GA UNIQUE (DOC_NUM COLLATE NOCASE,DOCTYPE,DOC_YEAR,TAX_PERIOD,FP));",
}

const anx1Queries = {
    fileHistory: {
        saveFileHistory: `INSERT into FILE_UPLOAD_HISTORY(TAX_PERIOD,FILE_NAME,TYPE,STATUS,ERROR_FILE,UPLOAD_TIME) VALUES (?,?,?,?,?,datetime('now','localtime'))`,
        getFileHistory: `SELECT FILE_NAME as filename,TYPE as type,UPLOAD_TIME as upldtime,STATUS as status,ERROR_FILE as errorfile from FILE_UPLOAD_HISTORY where TAX_PERIOD=? order by UPLOAD_TIME desc;`
    },
    table3a: {
        get3aDetailsErr : "SELECT * FROM ANX1_3A WHERE TAX_PERIOD=? AND FLAG IN ('F','C') ORDER BY DOC_ID DESC",
        get3aDetails: "SELECT * FROM ANX1_3A WHERE TAX_PERIOD=? AND FLAG NOT IN ('F')  ORDER BY DOC_ID DESC",
        save3a: `INSERT INTO ANX1_3A (DOCREF , PLACE_OF_SUPPLY, DIFF_PERCENTAGE, DOC_TYPE, SEC7_ACT,UPLOAD_DATE, SUPPLY_TYPE,FP,TAX_PERIOD, TOTAL_TAXABLE_VALUE, CGST,IGST,SGST, CESS, STATUS, FLAG, ERROR_CODE, ERROR_DETAIL)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )`,
        update3a: `update ANX1_3A set
       DOCREF =?,
       PLACE_OF_SUPPLY =?,
       DIFF_PERCENTAGE=?,
       SEC7_ACT=?,
       SUPPLY_TYPE=?,
       TOTAL_TAXABLE_VALUE=?, 
       CGST=?,IGST=?,SGST=?,CESS=?, STATUS=?,FLAG=? , UPLOAD_DATE = ? ,ERROR_CODE=? ,ERROR_DETAIL=?
       where DOC_ID=?`,
        markForDelete3a: 'update ANX1_3A set FLAG="D" where DOCREF=? ',
        delete3aByDocIds: `DELETE FROM ANX1_3A WHERE DOC_ID IN`,
        get3aDetailsByDocId: "SELECT DOC_ID as docId , DOCREF FROM ANX1_3A WHERE DOC_ID IN",
        get3aDetailsByDocRef: `SELECT * FROM ANX1_3A where DOCREF = ?`,
        update3aDetailsByDocRef: `UPDATE ANX1_3A SET TOTAL_TAXABLE_VALUE= ?,IGST= ?,CGST= ?,SGST= ?,CESS= ? where DOCREF = ?`,
        get3aErrJson : "SELECT * FROM ANX1_3A as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD = ? order by a.DOC_ID",
        get3AjSON: "SELECT * FROM ANX1_3A as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD = ? order by a.DOC_ID",
        update3aFlagByDocRef: `UPDATE ANX1_3A SET FLAG = 'C', ERROR_CODE='', ERROR_DETAIL='' where DOCREF = ?`,
    },

    table3h: {
        get3hDetailsErr : "SELECT * FROM ANX1_3H WHERE TAX_PERIOD=? AND FLAG IN ('F','C') ORDER BY DOC_ID DESC",
        save3h: `INSERT INTO ANX1_3H ( DOCREF,CTIN ,LGL_TRDNAME,POS,TAX_VALUE,IGST,
            CGST,SGST, CESS,DIFF_PERCENTAGE,SEC7_ACT, SUPPLY_TYPE,UPLOAD_DT,FLAG,STATUS,FP ,DOCTYPE,TAX_PERIOD, ERROR_CODE ,ERROR_DETAIL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);` ,
        update3h: `update ANX1_3H set
            DOCREF =?,
            CTIN=?,
            LGL_TRDNAME=?,
            POS=?,
            TAX_VALUE=?, 
            IGST =? ,
            CGST=?,SGST=?,CESS=?,DIFF_PERCENTAGE=?,SEC7_ACT=? ,
            SUPPLY_TYPE =?, FLAG =?, STATUS=? , UPLOAD_DT =? ,ERROR_CODE=? ,ERROR_DETAIL=?
            where DOC_ID=?`,
        get3hDetails: `SELECT * FROM ANX1_3H WHERE TAX_PERIOD=? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC`,
        get3hByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_3H where DOC_ID IN`,
        delete3hByDocIds: `DELETE FROM ANX1_3H WHERE DOC_ID IN`,
        get3hDetailsByDocRef: `SELECT * FROM ANX1_3H where DOCREF = ?`,
        update3hDetailsByDocRef: `UPDATE ANX1_3H SET TAX_VALUE= ?,IGST= ?,CGST= ?,SGST= ?,CESS= ? where DOCREF = ?`,
        get3HjSON: `SELECT * FROM ANX1_3H as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3hErrJson: `SELECT * FROM ANX1_3H as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        update3hFlagByDocRef: `UPDATE ANX1_3H SET FLAG = 'C', ERROR_CODE='', ERROR_DETAIL='' where DOCREF = ?`,
   
    },
    table3cd: {
        getDetailsByExpTyp: `SELECT * FROM ANX1_3CD WHERE TAX_PERIOD=? AND EXPORT_TYPE=?`,
        save3cd: `INSERT INTO ANX1_3CD ( DOC_TYPE, GSTIN ,DOCREF,DOC_NUM ,DOC_DATE,DOC_VAL,DOC_YEAR,EXPORT_TYPE ,
            SHIPNG_BILL_NUM ,SHIPNG_BILL_DATE ,PORT_CODE,
            TOTAL_TAX_VALUE, TOTAL_IGST  ,TOTAL_CESS  ,SUPPLY_TYPE ,UPLOAD_DT , FLAG  ,STATUS ,FP ,
            TAX_PERIOD ,ERROR_CODE ,ERROR_DETAIL) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        update3cd: `update ANX1_3CD set
        DOC_TYPE =?,
        DOCREF=?,
        DOC_NUM=?,
        DOC_DATE=?,
        DOC_VAL=?,
        DOC_YEAR=?, 
        EXPORT_TYPE =? ,
        SHIPNG_BILL_NUM=?,SHIPNG_BILL_DATE=?,PORT_CODE=?,TOTAL_TAX_VALUE=?,
        TOTAL_IGST=? ,
        TOTAL_CESS =?,
        FLAG=? , STATUS=? ,UPLOAD_DT=?, ERROR_CODE=? ,ERROR_DETAIL=?
        where DOC_ID=?`,
        get3cdByReturnPeriod: `SELECT   DOC_ID as docid ,
		                                DOC_TYPE as doctyp,
		                                GSTIN as gstin,
		                                DOCREF as docref, 
		                                DOC_NUM as docNum, 
		                                DOC_DATE as docDate, 
		                                DOC_VAL as docVal, 
		                                EXPORT_TYPE as exptype, 
		                                SHIPNG_BILL_NUM as sbNum, 
		                                SHIPNG_BILL_DATE as sbDate, 
		                                PORT_CODE as sbpcode, 
		                                TOTAL_TAX_VALUE as totaltxval, 
		                                TOTAL_IGST as totaligst, 
		                                TOTAL_CESS as totalcess, 
		                                SUPPLY_TYPE as suptype, 
		                                UPLOAD_DT as upldt, 
		                                FLAG as flag, 
		                                STATUS as status, 
		                                FP as fp, 
		                                TAX_PERIOD as taxprd, 
		                                ERROR_CODE as errorcode,
                                        ERROR_DETAIL as errordetail
                                 FROM ANX1_3CD WHERE TAX_PERIOD = ? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC;`,
                                 get3cdByReturnPeriodErr: `SELECT   DOC_ID as docid ,
		                                DOC_TYPE as doctyp,
		                                GSTIN as gstin,
		                                DOCREF as docref, 
		                                DOC_NUM as docNum, 
		                                DOC_DATE as docDate, 
		                                DOC_VAL as docVal, 
		                                EXPORT_TYPE as exptype, 
		                                SHIPNG_BILL_NUM as sbNum, 
		                                SHIPNG_BILL_DATE as sbDate, 
		                                PORT_CODE as sbpcode, 
		                                TOTAL_TAX_VALUE as totaltxval, 
		                                TOTAL_IGST as totaligst, 
		                                TOTAL_CESS as totalcess, 
		                                SUPPLY_TYPE as suptype, 
		                                UPLOAD_DT as upldt, 
		                                FLAG as flag, 
		                                STATUS as status, 
		                                FP as fp, 
		                                TAX_PERIOD as taxprd, 
		                                ERROR_CODE as errorcode,
                                        ERROR_DETAIL as err_msg
                                 FROM ANX1_3CD WHERE TAX_PERIOD = ? AND FLAG IN ('C','F') ORDER BY DOC_ID DESC;`,
        get3cdByDocIds: `SELECT DOC_ID as docId,DOCREF , EXPORT_TYPE , DOC_TYPE FROM ANX1_3CD where DOC_ID IN`,
        delete3cdByDocIds: `DELETE FROM ANX1_3CD WHERE DOC_ID IN`,
        get3cdDetailsByDocRef: `SELECT * FROM ANX1_3CD where DOCREF = ?`,
        update3cdDetailsByDocRef: `UPDATE ANX1_3CD SET TOTAL_TAX_VALUE= ?,TOTAL_IGST=?,TOTAL_CESS= ? where DOCREF = ?`,
        get3CDjSON : `SELECT * FROM ANX1_3CD as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? AND EXPORT_TYPE=? order by a.DOC_ID`,
        get3cdErrJson : `SELECT * FROM ANX1_3CD as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? AND EXPORT_TYPE=? order by a.DOC_ID`,
        get3cdByFPAndTaxperiod: `SELECT * FROM ANX1_3CD where FP=? AND TAX_PERIOD=? `,
        update3cdFlagByDocRef: `UPDATE ANX1_3CD SET FLAG = 'C' where DOCREF = ?`,
    },
    table3b: {
        save3b: `INSERT INTO ANX1_3B ( DOCREF,CTIN ,LGL_TRDNAME,POS,TAX_VALUE,IGST,
            CGST,SGST, CESS,DIFF_PERCENTAGE,SEC7_ACT, SUPPLY_TYPE,UPLOAD_DT,FLAG,STATUS,FP ,DOCTYPE,TAX_PERIOD, ERROR_CODE ,ERROR_DETAIL,DOC_NUM,DOC_DATE,DOC_VAL,DOC_YEAR, CTIN_TYPE)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);` ,
        get3bDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, (CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp, POS as pos, DIFF_PERCENTAGE as diffprcnt, SEC7_ACT as sec7act, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CGST as cgst, SGST as sgst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3B where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        get3bDocserr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, (CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp, POS as pos, DIFF_PERCENTAGE as diffprcnt, SEC7_ACT as sec7act, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CGST as cgst, SGST as sgst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag  ,ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3B where TAX_PERIOD=? AND FLAG IN('F','C')order by DOC_ID desc",
        get3bDetailsByDocRef: `SELECT * FROM ANX1_3B where DOCREF = ?`,
        update3bDetailsByDocRef: `UPDATE ANX1_3B SET TAX_VALUE= ?,IGST= ?,CGST= ?,SGST= ?,CESS= ? where DOCREF = ?`,
        updateb2b: `update ANX1_3B set DOCREF =?,CTIN=?,LGL_TRDNAME=?,DOCTYPE=?,DIFF_PERCENTAGE=?,SEC7_ACT=?,FLAG =?,POS=?,SUPPLY_TYPE =?,DOC_NUM=?,DOC_DATE=?,DOC_VAL=?,DOC_YEAR=?,TAX_VALUE=?,IGST =?,CGST=?,SGST=?,CESS=? ,UPLOAD_DT=?, STATUS = ? ,ERROR_CODE =? , ERROR_DETAIL = ? where DOC_ID=?`,
        delete3bItems: `DELETE FROM ANX1_ITEMDTLS WHERE ITEM_ID IN`,
        delete3bDocIds: `DELETE FROM ANX1_3B WHERE DOC_ID IN`,
        delete3bByDocIds: `DELETE FROM ANX1_3B WHERE DOC_ID IN (`,
        get3bByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_3B where DOC_ID IN`,
        delete3bItemsByDocId: "DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT DOCREF FROM ANX1_3B WHERE DOC_ID IN (",
        getDistinctCtinForDocIds: 'SELECT DISTINCT CTIN from ANX1_3B where DOC_ID IN',
        getDistinctCtinForDocIdsAmnd: 'SELECT DISTINCT CTIN from ANX1_3BA where DOC_ID IN',
        getDistinctDocTypForDocIds:'SELECT DISTINCT DOCTYPE from ANX1_3B where DOC_ID IN',
        getDistinctDocTypForDocIdsAmnd: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3BA where DOC_ID IN',
        getDistinctCtinForRtnPrd:'SELECT DISTINCT CTIN from ANX1_3B where TAX_PERIOD = ?',
        getDistinctCtinForRtnPrdAmnd: 'SELECT DISTINCT REV_CTIN from ANX1_3BA where TAX_PERIOD = ?',
        getDistinctDocTypForRtnPrd:'SELECT DISTINCT DOCTYPE from ANX1_3B where TAX_PERIOD = ?',
        getDistinctDocTypForRtnPrdAmnd: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3BA where TAX_PERIOD = ?',
        get3bErrJson : "SELECT * FROM ANX1_3B as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        get3bDetailsJson: "SELECT * FROM ANX1_3B as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        update3bFlagByDocRef: `UPDATE ANX1_3B SET FLAG = 'C' where DOCREF = ?`,

    },

    table3ef: {
        update3ef: `update ANX1_3EF set
        DOCREF =?,
		CTIN=?,
		LGL_TRDNAME=?,
        DOCTYPE =?,
		DOC_NUM=?,
        DOC_DATE=?,
        DOC_YEAR=?,
        DOC_VAL=?,
        DIFF_PERCENTAGE=?,
        POS=?,
		PAY_TYP =?,
        CLAIM_REFUND=?,
		TAX_VALUE=?,
        IGST=? ,
        CESS =?,
        FLAG=? , 
        STATUS=? ,
        UPLOAD_DT=?,
        ERROR_CODE =?,
        ERROR_DETAIL =?
        where DOC_ID=?`,
        get3efByDocIds: `SELECT DOC_ID as docId,DOCREF,PAY_TYP, DOCTYPE FROM ANX1_3EF where DOC_ID IN`,
        delete3efByDocIds: `DELETE FROM ANX1_3EF WHERE DOC_ID IN`,
        get3efDetailsByDocRef: `SELECT * FROM ANX1_3EF where DOCREF = ?`,
        update3efDetailsByDocRef: `UPDATE ANX1_3EF SET TAX_VALUE= ?,IGST=?,CESS= ? where DOCREF = ?`,
        save: `INSERT INTO ANX1_3EF (DOCREF,  CTIN,  LGL_TRDNAME,  DOCTYPE,  DOC_NUM,  DOC_DATE,  DOC_YEAR,  DOC_VAL,  POS,  DIFF_PERCENTAGE,  TAX_VALUE,  IGST,  CESS,  SUPPLY_TYPE,  PAY_TYP,  CLAIM_REFUND,  UPLOAD_DT,  FLAG,  STATUS,  FP,  TAX_PERIOD,  ERROR_CODE,  ERROR_DETAIL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);` ,
        getDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, POS as pos, DIFF_PERCENTAGE as diffprcnt,SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, PAY_TYP as payTyp, CLAIM_REFUND as clmrfnd, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3EF where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        getDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, POS as pos, DIFF_PERCENTAGE as diffprcnt,SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, PAY_TYP as payTyp, CLAIM_REFUND as clmrfnd, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , ERROR_CODE as err_cd , ERROR_DETAIL as err_msg from ANX1_3EF where TAX_PERIOD=? AND FLAG IN ('F','C') order by DOC_ID desc",
        get3EFjSON : `SELECT * FROM ANX1_3EF as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? AND PAY_TYP=? order by a.CTIN, a.DOC_ID`,
        get3EFErrJson : `SELECT * FROM ANX1_3EF as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? AND PAY_TYP=? order by a.CTIN,a.DOC_ID`,
        update3efFlagByDocRef: `UPDATE ANX1_3EF SET FLAG = 'C' where DOCREF = ?`,
    },

    table3g: {
        update3g: `update ANX1_3G set
        DOCREF =?,
		CTIN=?,
		LGL_TRDNAME=?,
        DOCTYPE =?,
		DOC_NUM=?,
        DOC_DATE=?,
        DOC_YEAR=?,
        DOC_VAL=?,
        DIFF_PERCENTAGE=?,
		SEC7_ACT=?,
		POS=?,
		CLAIM_REFUND=?,
		SUPPLY_TYPE =?,
	    TAX_VALUE=?,
        IGST=? ,
		CGST=?,
		SGST=?,
        CESS =?,
        FLAG=? , 
        STATUS=? ,
        UPLOAD_DT=?,
        ERROR_CODE =?,
        ERROR_DETAIL = ?
        where DOC_ID=?`,
        get3gByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_3G where DOC_ID IN`,
        delete3gByDocIds: `DELETE FROM ANX1_3G WHERE DOC_ID IN`,
        get3gDetailsByDocRef: `SELECT * FROM ANX1_3G where DOCREF = ?`,
        update3gDetailsByDocRef: `UPDATE ANX1_3G SET TAX_VALUE= ?,IGST=?,CGST=?,SGST=?,CESS= ? where DOCREF = ?`,
        save: `INSERT INTO ANX1_3G (DOCREF,  CTIN,  LGL_TRDNAME,  DOCTYPE,  DOC_NUM,  DOC_DATE,  DOC_YEAR,  DOC_VAL,  POS,  DIFF_PERCENTAGE, SEC7_ACT, TAX_VALUE, IGST, CGST, SGST, CESS, SUPPLY_TYPE, CLAIM_REFUND, UPLOAD_DT, FLAG, STATUS, FP, TAX_PERIOD, ERROR_CODE, ERROR_DETAIL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);` ,
        getDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, POS as pos, DIFF_PERCENTAGE as diffprcnt, SEC7_ACT as sec7act, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CGST as cgst, SGST as sgst, CESS as cess, CLAIM_REFUND as clmrfnd, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3G where TAX_PERIOD=?  AND FLAG NOT IN ('F') order by DOC_ID desc",
        getDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, POS as pos, DIFF_PERCENTAGE as diffprcnt, SEC7_ACT as sec7act, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CGST as cgst, SGST as sgst, CESS as cess, CLAIM_REFUND as clmrfnd, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3G where TAX_PERIOD=? AND FLAG IN ('F','C') order by DOC_ID desc",
        get3GjSON: `SELECT * FROM ANX1_3G as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3GErrJson : "SELECT * FROM ANX1_3G as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        update3gFlagByDocRef: `UPDATE ANX1_3G SET FLAG = 'C', ERROR_CODE='', ERROR_DETAIL='' where DOCREF = ?`,
    },
    table3K: {
        get3KjSON: `SELECT * FROM ANX1_3K as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3KErrJson : "SELECT * FROM ANX1_3K as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        update3K:`update ANX1_3K set 
        DOCREF =?, 
		CTIN=?,
		LGL_TRDNAME=?,
	    DOCTYPE =?,
        PORT_CODE=?,
		BOE_NUM=?,
        BOE_DATE=?,
        BOE_YEAR=?,
        BOE_VALUE=?,
        POS=?,
	    TAX_VALUE=?,
        IGST=? ,
	    CESS =?,
        FLAG=? , 
        STATUS=? ,
        UPLOAD_DT=?,
        ERROR_CODE = ?,
        ERROR_DETAIL = ?
        where DOC_ID=?`,
        get3kByDocIds: `SELECT DOC_ID as docId, DOCREF FROM ANX1_3K where DOC_ID IN`,
        delete3kByDocIds: `DELETE FROM ANX1_3K WHERE DOC_ID IN`,
        get3kDetailsByDocRef: `SELECT * FROM ANX1_3K where DOCREF = ?`,
        update3kDetailsByDocRef: `UPDATE ANX1_3K SET TAX_VALUE= ?,IGST=?,CESS= ? where DOCREF = ?`,
        update3kFlagByDocRef: `UPDATE ANX1_3K SET FLAG = 'C' where DOCREF = ?`,
        save: `INSERT INTO ANX1_3K (DOCREF, CTIN, LGL_TRDNAME, DOCTYPE , PORT_CODE , BOE_NUM , BOE_DATE , BOE_YEAR , BOE_VALUE , POS , SUPPLY_TYPE, TAX_VALUE , IGST , CESS, UPLOAD_DT , FLAG , STATUS , FP , TAX_PERIOD , ERROR_CODE , ERROR_DETAIL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
        getDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, BOE_NUM as boenum, BOE_DATE as boedt, BOE_VALUE as boeval, PORT_CODE as pcode, POS as pos, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3K where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",     
        getDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, BOE_NUM as boenum, BOE_DATE as boedt, BOE_VALUE as boeval, PORT_CODE as pcode, POS as pos, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , ERROR_CODE as err_cd , ERROR_DETAIL as err_msg from ANX1_3K where TAX_PERIOD=? AND FLAG IN ('F','C') order by DOC_ID desc",     
        getDistinctCtinForDocIds:'SELECT DISTINCT CTIN from ANX1_3K where DOC_ID IN'
    },
    table3l: {       
        save: `INSERT INTO ANX1_3L ( TABLE_TYPE, DOCREF,  CTIN,  LGL_TRDNAME,  DOCTYPE,  DOC_NUM,  DOC_DATE,  DOC_YEAR,  DOC_VAL,  POS,  DIFF_PERCENTAGE, SEC7_ACT,  TAX_VALUE,  IGST, CGST, SGST, CESS,  SUPPLY_TYPE, CLAIM_REFUND,  UPLOAD_DT,  FLAG,  STATUS,  FP,  TAX_PERIOD,  ERROR_CODE,  ERROR_DETAIL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);` , 
        getDocs: "SELECT DOC_ID as docid,TABLE_TYPE as tableType, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, POS as pos, DIFF_PERCENTAGE as diffprcnt,  SEC7_ACT as sec7act, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CGST as cgst, SGST as sgst, CESS as cess,  CLAIM_REFUND as clmrfnd, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3L where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        getDocsErr: "SELECT DOC_ID as docid,TABLE_TYPE as tableType, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt, DOC_VAL as docval, POS as pos, DIFF_PERCENTAGE as diffprcnt, SEC7_ACT as sec7act, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CGST as cgst, SGST as sgst, CESS as cess, CLAIM_REFUND as clmrfnd, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3L where TAX_PERIOD=? AND FLAG IN ('F','C') order by DOC_ID desc",
        delete3lByDocIds: `DELETE FROM ANX1_3L WHERE DOC_ID IN`,
        get3lByDocIds: `SELECT DOC_ID as docid,DOCREF FROM ANX1_3L where DOC_ID IN`,
        getDistinctCtinForDocIds:'SELECT DISTINCT CTIN from ANX1_3L where DOC_ID IN',
        getDistinctDocTypForDocIds:'SELECT DISTINCT DOCTYPE from ANX1_3L where DOC_ID IN',
        getDistinctCtinForRtnPrd:'SELECT DISTINCT CTIN from ANX1_3L where TAX_PERIOD = ?',
        getDistinctDocTypForRtnPrd:'SELECT DISTINCT DOCTYPE from ANX1_3L where TAX_PERIOD = ?',
        get3lDetailsByDocRef: `SELECT * FROM ANX1_3L where DOCREF = ?`,
        get3LjSON: `SELECT * FROM  ANX1_3L as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3LErrJson: "SELECT * FROM ANX1_3L as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        update3lDetailsByDocRef: `UPDATE ANX1_3L SET TAX_VALUE= ?,IGST=?,CGST=?,SGST=?,CESS= ? where DOCREF = ?`,
        update3l: `update ANX1_3L set
        DOCREF =?,
        TABLE_TYPE =?,
		CTIN=?,
		LGL_TRDNAME=?,
        DOCTYPE =?,
		DOC_NUM=?,
        DOC_DATE=?,
        DOC_YEAR=?,
        DOC_VAL=?,
        DIFF_PERCENTAGE=?,
		SEC7_ACT=?,
		POS=?,
		CLAIM_REFUND=?,
		SUPPLY_TYPE =?,
	    TAX_VALUE=?,
        IGST=? ,
		CGST=?,
		SGST=?,
        CESS =?,
        FLAG=? , 
        STATUS=? ,
        UPLOAD_DT=?,
        ERROR_CODE =?,
        ERROR_DETAIL = ?
        where DOC_ID=?`,
    },

    tableB2BAO: {

        get3baoDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SEC7_ACT as revsec7act, REV_SUPPLY_TYPE as revsuptype, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CGST as revcgst, REV_SGST as revsgst, REV_CESS as revcess from ANX1_3BAO where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        get3baoDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SEC7_ACT as revsec7act, REV_SUPPLY_TYPE as revsuptype, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CGST as revcgst, REV_SGST as revsgst, REV_CESS as revcess, ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3BAO where TAX_PERIOD=? AND FLAG IN('F','C') order by DOC_ID desc",
        saveb2bao: "INSERT INTO ANX1_3BAO (DOCREF,REVDOCREF,CTIN ,LGL_TRDNAME,DOCTYPE,DOC_NUM,DOC_DATE,DOC_YEAR,CTIN_TYPE,UPLOAD_DT,FLAG,REV_CTIN,REV_LGL_TRDNAME,REV_DOCTYPE,REV_DOC_NUM,REV_DOC_DATE,REV_DOC_YEAR,REV_DOC_VAL,REV_POS,REV_DIFF_PERCENTAGE,REV_SEC7_ACT,REV_TAX_VALUE,REV_CTIN_TYPE,REV_IGST,REV_CGST,REV_SGST,REV_CESS,REV_SUPPLY_TYPE,STATUS,FP,TAX_PERIOD,ERROR_CODE,ERROR_DETAIL)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        UpdateB2BAO: "update ANX1_3BAO set DOCREF =?,REVDOCREF =?,CTIN=? ,LGL_TRDNAME =?,DOCTYPE =?,DOC_NUM =?,DOC_DATE =?,DOC_YEAR =?,UPLOAD_DT=?,FLAG=?,REV_CTIN=?,REV_LGL_TRDNAME=?,REV_DOCTYPE=?,REV_DOC_NUM=?,REV_DOC_DATE=?,REV_DOC_YEAR=?,REV_DOC_VAL=?,REV_POS=?,REV_DIFF_PERCENTAGE=?,REV_SEC7_ACT=?,REV_TAX_VALUE=?,REV_IGST=?,REV_CGST=?,REV_SGST=?,REV_CESS=?,REV_SUPPLY_TYPE=?,STATUS=?,ERROR_CODE=?,ERROR_DETAIL=? where DOC_ID=?",
        get3baoByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_3BAO where DOC_ID IN`,
        getDistinctCtinForDocIds: 'SELECT DISTINCT REV_CTIN from ANX1_3BAO where DOC_ID IN',
        getDistinctDocTypForDocIds: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3BAO where DOC_ID IN',
        delete3baoDocIds: `DELETE FROM ANX1_3BAO WHERE DOC_ID IN`,
        get3baoDetailsByDocRef: `SELECT * FROM ANX1_3BAO where DOCREF = ?`,
        update3baoDetailsByDocRef: `UPDATE ANX1_3BAO SET REV_TAX_VALUE= ?,REV_IGST= ?,REV_CGST= ?,REV_SGST= ?,REV_CESS= ? where DOCREF = ?`,
        update3baoFlagByDocRef: `UPDATE ANX1_3BAO SET FLAG = 'C' where DOCREF = ?`,
        delete3baoItemsByDocId: "DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT REVDOCREF FROM ANX1_3BAO WHERE DOC_ID IN (",
        delete3baoByDocIds: `DELETE FROM ANX1_3BAO WHERE DOC_ID IN (`,
        get3BAOErrJson: "SELECT * FROM ANX1_3BAO as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        get3BAOjSON: "SELECT * FROM ANX1_3BAO as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('U','F') and (a.STATUS='' or a.STATUS = 'MFR' or a.STATUS = 'MAI' or a.STATUS is NULL) and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        getDistinctCtinForRtnPrdAmnd: 'SELECT DISTINCT REV_CTIN from ANX1_3BAO where TAX_PERIOD = ?',
        getDistinctDocTypForRtnPrdAmnd: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3BAO where TAX_PERIOD = ?',
        getDistinctCtinForDocIdsAmnd: 'SELECT DISTINCT CTIN from ANX1_3BAO where DOC_ID IN',
        getDistinctDocTypForDocIdsAmnd: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3BAO where DOC_ID IN',
    },
    tableB2BA: {

        saveb2ba: "INSERT INTO ANX1_3BA (DOCREF,REVDOCREF,CTIN ,LGL_TRDNAME,DOCTYPE,DOC_NUM,DOC_DATE,DOC_YEAR,CTIN_TYPE,UPLOAD_DT,FLAG,REV_CTIN,REV_LGL_TRDNAME,REV_DOCTYPE,REV_DOC_NUM,REV_DOC_DATE,REV_DOC_YEAR,REV_DOC_VAL,REV_POS,REV_DIFF_PERCENTAGE,REV_SEC7_ACT,REV_TAX_VALUE,REV_CTIN_TYPE,REV_IGST,REV_CGST,REV_SGST,REV_CESS,REV_SUPPLY_TYPE,STATUS,FP,TAX_PERIOD,ERROR_CODE,ERROR_DETAIL)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        UpdateB2BA: "update ANX1_3BA set DOCREF =?,REVDOCREF =?,CTIN=? ,LGL_TRDNAME =?,DOCTYPE =?,DOC_NUM =?,DOC_DATE =?,DOC_YEAR =?,UPLOAD_DT=?,FLAG=?,REV_CTIN=?,REV_LGL_TRDNAME=?,REV_DOCTYPE=?,REV_DOC_NUM=?,REV_DOC_DATE=?,REV_DOC_YEAR=?,REV_DOC_VAL=?,REV_POS=?,REV_DIFF_PERCENTAGE=?,REV_SEC7_ACT=?,REV_TAX_VALUE=?,REV_IGST=?,REV_CGST=?,REV_SGST=?,REV_CESS=?,REV_SUPPLY_TYPE=?,STATUS=?,ERROR_CODE=?,ERROR_DETAIL=? where DOC_ID=?",
        get3baDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SEC7_ACT as revsec7act, REV_SUPPLY_TYPE as revsuptype, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CGST as revcgst, REV_SGST as revsgst, REV_CESS as revcess from ANX1_3BA where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        get3baDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SEC7_ACT as revsec7act, REV_SUPPLY_TYPE as revsuptype, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CGST as revcgst, REV_SGST as revsgst, REV_CESS as revcess, ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3BA where TAX_PERIOD=? AND FLAG IN('F','C') order by DOC_ID desc",
        delete3baItems: `DELETE FROM ANX1_ITEMDTLS WHERE ITEM_ID IN`,
        delete3baDocIds: `DELETE FROM ANX1_3BA WHERE DOC_ID IN`,
        delete3baByDocIds: `DELETE FROM ANX1_3BA WHERE DOC_ID IN (`,
        get3baByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_3BA where DOC_ID IN`,
        delete3baItemsByDocId: "DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT REVDOCREF FROM ANX1_3BA WHERE DOC_ID IN (",
        getDistinctCtinForDocIds: 'SELECT DISTINCT REV_CTIN from ANX1_3BA where DOC_ID IN',
        getDistinctDocTypForDocIds: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3BA where DOC_ID IN',
        get3baDetailsByDocRef: `SELECT * FROM ANX1_3BA where DOCREF = ?`,
        update3baFlagByDocRef: `UPDATE ANX1_3BA SET FLAG = 'C' where DOCREF = ?`,
        get3BAErrJson: "SELECT * FROM ANX1_3BA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        get3BAjSON: `SELECT * FROM ANX1_3BA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('F') and (a.STATUS="" or a.STATUS = "MFR" or a.STATUS = "MAI") and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        update3baDetailsByDocRef: `UPDATE ANX1_3BA SET REV_TAX_VALUE= ?,REV_IGST= ?,REV_CGST= ?,REV_SGST= ?,REV_CESS= ? where DOCREF = ?`,
    },

    tableSEZA: {
        getDistinctDocTypForRtnPrdAmnd: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3EFA where TAX_PERIOD = ?',
        getDistinctCtinForRtnPrdAmnd: 'SELECT DISTINCT REV_CTIN from ANX1_3EFA where TAX_PERIOD = ?',
        get3efaDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval,PAY_TYP as payTyp, CLAIM_REFUND as clmrfnd, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SUPPLY_TYPE as revsuptype, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CESS as revcess from ANX1_3EFA where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        get3efaDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval,PAY_TYP as payTyp, CLAIM_REFUND as clmrfnd, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SUPPLY_TYPE as revsuptype, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CESS as revcess, ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3EFA where TAX_PERIOD=? AND FLAG IN('F','C') order by DOC_ID desc",
        delete3EFAItems: 'DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT DOCREF FROM ANX1_3EFA WHERE DOC_ID IN (',
        getDistinctCtinForDocIds: 'SELECT DISTINCT REV_CTIN from ANX1_3EFA where DOC_ID IN',
        delete3efaByDoc: `DELETE FROM ANX1_3EFA WHERE DOC_ID IN (`,
        update3EFAFlag: `UPDATE ANX1_3EFA SET FLAG = 'C' where DOCREF = ?`,
        update3EFAByDocRef: `UPDATE ANX1_3EFA SET REV_TAX_VALUE= ?,REV_IGST= ?,REV_CESS= ? where DOCREF = ?`,
        get3EFAByDocRef: `SELECT * FROM ANX1_3EFA where DOCREF = ?`,
        getDistinctDocTypForDocIds: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3EFA where DOC_ID IN',
        get3EFAjSON: `SELECT * FROM ANX1_3EFA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('F') and (a.STATUS="" or a.STATUS = "MFR" or a.STATUS = "MAI") and a.TAX_PERIOD=? AND PAY_TYP=? order by a.CTIN, a.DOC_ID`,
        get3EFAErrJson: `SELECT * FROM ANX1_3EFA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? AND PAY_TYP=? order by a.CTIN,a.DOC_ID`,
        Update3EFA: "update ANX1_3EFA set DOCREF =?,CTIN=? ,LGL_TRDNAME =?,DOCTYPE =?,DOC_NUM =?,DOC_DATE =?,DOC_YEAR =?,UPLOAD_DT=?,FLAG=?,REV_CTIN=?,REV_LGL_TRDNAME=?,REV_DOCTYPE=?,REV_DOC_NUM=?,REV_DOC_DATE=?,REV_DOC_YEAR=?,REV_DOC_VAL=?,REV_POS=?,REV_DIFF_PERCENTAGE=?,REV_TAX_VALUE=?,REV_IGST=?,REV_CESS=?,REV_SUPPLY_TYPE=?,PAY_TYP=?, CLAIM_REFUND=?,STATUS=?,ERROR_CODE=?,ERROR_DETAIL=? where DOC_ID=?",
        save: `INSERT INTO ANX1_3EFA (DOCREF,  CTIN,  LGL_TRDNAME,  DOCTYPE,  DOC_NUM,  DOC_DATE,  DOC_YEAR, REV_CTIN,  REV_LGL_TRDNAME,  REV_DOCTYPE,  REV_DOC_NUM,  REV_DOC_DATE,  REV_DOC_YEAR, REV_DOC_VAL,  REV_POS,  REV_DIFF_PERCENTAGE,  REV_TAX_VALUE,  REV_IGST,  REV_CESS,  REV_SUPPLY_TYPE,  PAY_TYP,  CLAIM_REFUND,  UPLOAD_DT,  FLAG,  STATUS,  FP,  TAX_PERIOD,  ERROR_CODE,  ERROR_DETAIL)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    },
    tableDEA: {
        save: `INSERT INTO ANX1_3GA (DOCREF,  CTIN,  LGL_TRDNAME,  DOCTYPE,  DOC_NUM,  DOC_DATE,  DOC_YEAR, CTIN_TYPE, UPLOAD_DT, FLAG, REV_CTIN,  REV_LGL_TRDNAME,  REV_DOCTYPE, REV_DOC_NUM, REV_DOC_DATE, REV_DOC_YEAR, REV_DOC_VAL, REV_POS, REV_DIFF_PERCENTAGE,REV_SEC7_ACT,REV_TAX_VALUE, REV_CTIN_TYPE, REV_IGST,REV_CGST,REV_SGST,REV_CESS, REV_SUPPLY_TYPE,CLAIM_REFUND,STATUS, FP, TAX_PERIOD, ERROR_CODE, ERROR_DETAIL)VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
        get3gaDocs: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp, CLAIM_REFUND as clmrfnd,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SEC7_ACT as revsec7act, REV_SUPPLY_TYPE as revsuptype,CLAIM_REFUND as clmrfnd, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CGST as revcgst, REV_SGST as revsgst, REV_CESS as revcess from ANX1_3GA where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        get3gaDocsErr: "SELECT DOC_ID as docid, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, DOC_NUM as docnum, DOC_DATE as docdt,(CASE WHEN CTIN_TYPE IS NULL THEN '' ELSE CTIN_TYPE END) as ctintyp,(CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , REV_CTIN as revctin,(CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as revlglNm, REV_DOCTYPE as revdoctyp, CLAIM_REFUND as clmrfnd,REV_DOC_NUM as revdocnum , REV_DOC_DATE as revdocdt, REV_DOC_VAL as revdocval, (CASE WHEN REV_CTIN_TYPE IS NULL THEN '' ELSE REV_CTIN_TYPE END) as revctintyp,REV_POS as revpos,REV_DIFF_PERCENTAGE as  revdiffprcnt, REV_SEC7_ACT as revsec7act, REV_SUPPLY_TYPE as revsuptype,CLAIM_REFUND as clmrfnd, REV_TAX_VALUE as revtxval, REV_IGST as revigst, REV_CGST as revcgst, REV_SGST as revsgst, REV_CESS as revcess, ERROR_DETAIL as err_msg , ERROR_CODE as err_cd from ANX1_3GA where TAX_PERIOD=? AND FLAG IN('F','C') order by DOC_ID desc",
        UpdateDEA: "update ANX1_3GA set DOCREF =?,CTIN=? ,LGL_TRDNAME =?,DOCTYPE =?,DOC_NUM =?,DOC_DATE =?,DOC_YEAR =?,UPLOAD_DT=?,FLAG=?,REV_CTIN=?,REV_LGL_TRDNAME=?,REV_DOCTYPE=?,REV_DOC_NUM=?,REV_DOC_DATE=?,REV_DOC_YEAR=?,REV_DOC_VAL=?,REV_POS=?,REV_DIFF_PERCENTAGE=?,REV_SEC7_ACT=?,REV_TAX_VALUE=?,REV_IGST=?,REV_CGST=?,REV_SGST=?,REV_CESS=?,CLAIM_REFUND=?,REV_SUPPLY_TYPE=?,STATUS=?,ERROR_CODE=?,ERROR_DETAIL=? where DOC_ID=?",
        delete3gaByDocIds: `DELETE FROM ANX1_3GA WHERE DOC_ID IN (`,
        delete3gaItemsByDocId: "DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (SELECT DOCREF FROM ANX1_3GA WHERE DOC_ID IN (",
        update3gaDetailsByDocRef: `UPDATE ANX1_3GA SET REV_TAX_VALUE= ?,REV_IGST= ?,REV_CGST= ?,REV_SGST= ?,REV_CESS= ? where DOCREF = ?`,
        get3gaDetailsByDocRef: `SELECT * FROM ANX1_3GA where DOCREF = ?`,
        update3gaFlagByDocRef: `UPDATE ANX1_3GA SET FLAG = 'C' where DOCREF = ?`,
        get3GAjSON: `SELECT * FROM ANX1_3GA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('F') and (a.STATUS="" or a.STATUS = "MFR" or a.STATUS = "MAI") and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3GAErrJson: `SELECT * FROM ANX1_3GA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN,a.DOC_ID`,
        getDistinctCtinForDocIds: 'SELECT DISTINCT REV_CTIN from ANX1_3GA where DOC_ID IN',
        getDistinctDocTypForDocIds: 'SELECT DISTINCT REV_DOCTYPE from ANX1_3GA where DOC_ID IN',
    },

    itemDetails: {
        saveItemDetails: `INSERT INTO ANX1_ITEMDTLS ( HSN , TAXRATE , TAXVAL ,IGST ,CGST, SGST, CESS ,ITEMREF) VALUES (?,?,?,?,?,?,?,?)`,
        getItemTableDetails: `SELECT * FROM ANX1_ITEMDTLS WHERE ITEMREF = ?`,
        updateItemDetails: `update ANX1_ITEMDTLS set
        HSN =?,
        TAXRATE=?,
        TAXVAL=?,
        IGST =? ,
        CGST=?,
        SGST =?,
        CESS=?,
        ITEMREF=?
        where ITEM_ID = ?`,
        getItemRefByItemId: `SELECT * FROM ANX1_ITEMDTLS where ITEM_ID IN`,
        getItemsByRefId: `SELECT * FROM ANX1_ITEMDTLS where ITEMREF = ?`,
        deleteItemsByItemIds: `DELETE FROM ANX1_ITEMDTLS WHERE ITEM_ID IN`,
        deleteItemsByitemRef: `DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN`,
        saveItemDetailsBatch :`INSERT INTO ANX1_ITEMDTLS (HSN, TAXRATE, TAXVAL, IGST, CGST, SGST, CESS, ITEMREF) VALUES`,
        deleteAllItemsByItemRef: 'DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (?)'
    },
    
    errorSummary: {
        save3KSumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
        getCountMarkForDelfor3KCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName from ANX1_3K where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
        calculate3KSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3K where FLAG ='C' and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
        delete3KsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3K" and CTIN = ?',
        getCountMarkForDelfor3KDocWise: 'select count(*) as count from ANX1_3K where FLAG = "F" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
        calculate3KSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3K where FLAG="C" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE',
        delete3KsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3K" and SUMM_TYP = "DOC"',
        calculate3EFSumm: 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3EF where FLAG ="C" and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
        calculate3EFASumm: 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWPA" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, SUM(REV_CESS) as cess from ANX1_3EFA where FLAG ="C" and FP = ? and TAX_PERIOD = ? group by REV_DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',

        getCountYetToCorrect3EF: 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) || "-" || DOCTYPE) as type, count(*) as count from ANX1_3EF where FLAG = "F" and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP',
        get3Bor3KSummDocWise: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC" order by DOC_TYPE',
        get3Bor3KSummCtinWise: "select CTIN as ctin,(CASE WHEN LGL_TRDNAME IS NULL THEN ' ' ELSE LGL_TRDNAME END) as lglName, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?  and SUMM_TYP = 'CTIN' order by CTIN",
        get3Aor3HSumm: 'select NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
        get3GSumm: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC"',
        get3CDSumm: 'select DOC_TYPE as doctyp , PAYMT_WITH_TAX as expwp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST,2) as cgst, ROUND(SGST,2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd  , SUMM_TYP  from ANX1_ERR_SUMM WHERE FP= ?  and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP IS NULL;',
        get3EFSummByPayTyp: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and PAYMT_WITH_TAX = ? and SUMM_TYP = "PAY_TYP"',

        getCountYetToCorrect3EFA: 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWPA" THEN "Y" ELSE "N" END) || "-" || REV_DOCTYPE) as type, count(*) as count from ANX1_3EFA where FLAG = "F" and FP = ? and TAX_PERIOD = ? group by REV_DOCTYPE, PAY_TYP',

        calculate3AErrorSumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3A where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
        getCountErrorfor3A: 'select count(*) as count from ANX1_3A where FLAG = "F" and FP= ? and TAX_PERIOD = ?',

        save3Aor3HErrsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
        save3Aor3HErrorsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "DOC")',

        delete3Aor3HErrorsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',

        calculate3HErrorSumm: 'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3H where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
        getErrorCountfor3H: 'select count(*) as count from ANX1_3H where FLAG = "F" and FP= ? and TAX_PERIOD = ?',

        calculate3BErrorSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3B where FLAG = "C" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',
        getCountofErrorRecords3BDocWise: 'select count(*) as count from ANX1_3B where FLAG = "F" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
        calculate3BErrorSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3B where FLAG = 'C' and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
        getCountofErrorRecords3BCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3B where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and CTIN = ?",

        calculate3LErrorSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3L where FLAG = "C" AND FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',

        calculate3LErrorSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3L where FLAG = 'C' AND FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
        getCountofErrorRecords3LDocWise: 'select count(*) as count from ANX1_3L where FLAG IN ("F") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
        getCountofErrorRecords3LCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3L where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
        calculate3BAOErrorSummaryDocWise: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BAO where FLAG = "C" and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        getCountofErrorRecords3BAODocWise: 'select count(*) as count from ANX1_3BAO where FLAG = "F" and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ?',
        calculate3BAOErrorSummaryCtinWise: "select REV_CTIN as ctin, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cess from ANX1_3BAO where FLAG = 'C' and FP = ? and TAX_PERIOD = ? and REV_CTIN = ? group by REV_CTIN HAVING COUNT(*) > 0",
        getCountofErrorRecords3BAOCtinWise: "select count(*) as count, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName  from ANX1_3BAO where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?",

        calculate3BAErrorSummaryDocWise: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BA where FLAG = "C" and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        getCountofErrorRecords3BADocWise: 'select count(*) as count from ANX1_3BA where FLAG = "F" and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ?',
        calculate3BAErrorSummaryCtinWise: "select REV_CTIN as ctin, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cess from ANX1_3BA where FLAG = 'C' and FP = ? and TAX_PERIOD = ? and REV_CTIN = ? group by REV_CTIN HAVING COUNT(*) > 0",
        getCountofErrorRecords3BACtinWise: "select count(*) as count, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName  from ANX1_3BA where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?",

        save3BErrorSummDocWise: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL,"DOC")',
        save3BErrorSummCtinWise: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "CTIN")',

        get3Bor3KErrSummDocWise: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC" order by DOC_TYPE',
        delete3BErrsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and (DOC_TYPE = ? or CTIN = ? or DOC_TYPE = "N")',
        delete3BErrsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and CTIN = ?',
        delete3LErrsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and CTIN = ?',
        delete3BAOErrsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BAO" and CTIN = ?',
        delete3BErrsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3LErrsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3BAOErrsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BAO" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3Aor3Hsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',

        delete3BAErrsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and CTIN = ?',
        delete3BAErrsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and (DOC_TYPE = ? or DOC_TYPE = "N")',

        getCountYetToCorrectfor3G: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3G where FLAG = "F" and FP = ? and TAX_PERIOD = ? GROUP BY DOCTYPE',
        calculate3GSummary: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3G where FLAG ="C" and FP = ? and TAX_PERIOD = ? group by DOCTYPE HAVING COUNT(*) > 0',
        save3EFSumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',

        getCountYetToCorrectfor3GA: 'select REV_DOCTYPE as docTyp, count(*) as count from ANX1_3GA where FLAG = "F" and FP = ? and TAX_PERIOD = ? GROUP BY REV_DOCTYPE',
        calculate3GASummary: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3GA where FLAG ="C" and FP = ? and TAX_PERIOD = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',

        calculate3iErrSumm: 'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3I where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
        getYetToBeCorrectedCount3i: 'select count(*) as count from ANX1_3I where FLAG = "F" and FP= ? and TAX_PERIOD = ?',

        calculate3jErrSumm: 'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3J where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
        getYetToBeCorrectedCount3j: 'select count(*) as count from ANX1_3J where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
        getYetToBeCorrectedCount3cd: `
        SELECT "3CD" AS TABLE_TYP,FP,TAX_PERIOD,DOC_TYPE,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, COUNT(*) AS MFD from ANX1_3CD where FLAG ='F' AND FP = ? AND TAX_PERIOD = ? group by DOC_TYPE,EXPORT_TYPE;
        `,
        tableSummarywpAndwopNet: `       
        INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH tableSummarywpAndwopNet AS (
            select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, 
            count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 
            0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 
            0 as minusCess from ANX1_3CD 
            where FLAG ='C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
        
        UNION ALL
        
        select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX,
         count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,
         0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess 
         from ANX1_3CD where FLAG='C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
        and DOC_TYPE in ('CR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
        
        )
        select "3CD" as TABLE_TYP,(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,sum(plusTotVal) - sum(minusTotval) as totalVal, NULL as CGST,sum(plusIgst)- sum(minusIgst) as IGST, NULL as SGST,sum(plusCess) - sum(minusCess) as CESS , PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from tableSummarywpAndwopNet group by EXPORT_TYPE HAVING COUNT(*) > 0;      
        `,
        consolidateNetForDocTypes:`
        INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH consolidateNetForDocTypes as 
        (select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE)
        IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as totVal, SUM(TOTAL_IGST) as IGST, 
        SUM(TOTAL_CESS) as CESS from ANX1_3CD where FLAG='C' and FP = ? and
        TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0
        )
        select "3CD" as TABLE_TYP, (CASE WHEN SUM(noRec) IS NULL THEN 0 ELSE SUM(noRec) END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,(CASE WHEN SUM(totVal)
        IS NULL THEN 0 ELSE SUM(totVal) END) as totVal , NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,'DOC' as SUMM_TYP from consolidateNetForDocTypes group by DOC_TYPE;`,

        consolidateNet:`
        INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH consolidateNet AS (
            select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 0 as minusCess from ANX1_3CD where FLAG ='C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR') group by EXPORT_TYPE HAVING COUNT(*) > 0
        
        UNION ALL
        
        select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE)
        IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess from ANX1_3CD where FLAG = 'C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
        and DOC_TYPE in ('CR') group by EXPORT_TYPE HAVING COUNT(*) > 0
        
        )
        select "3CD",(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN, NULL as  LGL_TRDNAME,(CASE WHEN FP IS NULL THEN "" ELSE FP END) as FP,(CASE WHEN TAX_PERIOD IS NULL THEN "" ELSE TAX_PERIOD END) as TAX_PERIOD,
        ( CASE WHEN (sum(plusTotVal) - sum(minusTotval)) IS NULL THEN 0 
        ELSE sum(plusTotVal) - sum(minusTotval) END) as totalVal,
        NULL as CGST,
        (CASE WHEN (sum(plusIgst)- sum(minusIgst)) IS NULL THEN 0
        ELSE (sum(plusIgst) - sum(minusIgst)) END) as IGST, 
        NULL as SGST,
        (CASE WHEN (sum(plusCess) - sum(minusCess)) IS NULL THEN 0
        ELSE (sum(plusCess) - sum(minusCess)) END)  as CESS ,
        NULL as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, 
        NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,'DOC' as SUMM_TYP 
        from consolidateNet ; 
               
        `,
        docTypeValuesInsertionFor3cd:`
             
        INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH docTypeValuesInsertion as 
        (select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD, 
            (
                CASE WHEN FLAG = "F" THEN 
                        count(*) - count (CASE FLAG WHEN 'F' THEN 1 ELSE NULL END) 
                        ELSE 
                        count(*) END)  as noRec, 
         (CASE WHEN (CASE WHEN FLAG = "F" THEN count(*) - count (CASE FLAG WHEN 'F' THEN 1 ELSE NULL END) 
                    ELSE count(*) END) = 0 THEN 0
            WHEN TOTAL_TAX_VALUE IS NOT NULL AND FLAG = "F" THEN SUM(TOTAL_TAX_VALUE)-TOTAL_TAX_VALUE
            WHEN TOTAL_TAX_VALUE IS NOT NULL AND FLAG <> "F" THEN SUM(TOTAL_TAX_VALUE)
            WHEN TOTAL_TAX_VALUE IS NULL THEN 0
         END) as totVal, 
         (CASE WHEN (CASE WHEN FLAG = "F" THEN count(*) - count (CASE FLAG WHEN 'F' THEN 1 ELSE NULL END) 
                    ELSE count(*) END) = 0 THEN 0
            WHEN TOTAL_IGST IS NOT NULL AND FLAG = "F" THEN SUM(TOTAL_IGST)-TOTAL_IGST
            WHEN TOTAL_IGST IS NOT NULL AND FLAG <> "F" THEN SUM(TOTAL_IGST)
            WHEN TOTAL_IGST IS NULL THEN 0
         END) as IGST, 
        (CASE WHEN (CASE WHEN FLAG = "F" THEN count(*) - count (CASE FLAG WHEN 'F' THEN 1 ELSE NULL END) 
            ELSE count(*) END) = 0 THEN 0
            WHEN TOTAL_CESS IS NOT NULL AND FLAG = "F" THEN SUM(TOTAL_CESS)-TOTAL_CESS
            WHEN TOTAL_CESS IS NOT NULL AND FLAG <> "F" THEN SUM(TOTAL_CESS)
            WHEN TOTAL_CESS IS NULL THEN 0
         END) as CESS,
         count (CASE FLAG WHEN 'F' THEN 1 ELSE NULL END) as NO_OF_REC_MFD from ANX1_3CD where FLAG IN ("F","C") and FP = ? and 
        TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0)
        select "3CD" as TABLE_TYP, (CASE WHEN noRec IS NULL THEN 0 ELSE noRec END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,totVal, NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from docTypeValuesInsertion;
        `,
        updateSummaryOnRemoveDataForAllTables: 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC = 0, NET_TAXABLE_VALUE = 0.0, IGST = 0.0, CGST = 0.0, SGST = 0.0, CESS = 0.0, VAL_SUP_MADE = 0.0, VAL_SUP_RETURN = 0.0 WHERE TAX_PERIOD = ?',
        updateSummaryOnRemoveDataForSelectedTable: 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC = 0, NET_TAXABLE_VALUE = 0.0, IGST = 0.0, CGST = 0.0, SGST = 0.0, CESS = 0.0, VAL_SUP_MADE = 0.0, VAL_SUP_RETURN = 0.0 WHERE TAX_PERIOD = ? AND TABLE_TYP = ?',
        updateYetToBeCorrectedOnRemoveDataForAllTables: 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC_MFD = 0 WHERE TAX_PERIOD = ?',
        updateYetToBeCorrectedOnRemoveDataForSelectedTable: 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC_MFD = 0 WHERE TAX_PERIOD = ? AND TABLE_TYP = ?',

        // ANX1 Amend table queries
        calculate3AAErrorSumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3AA where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
        getCountErrorfor3AA: 'select count(*) as count from ANX1_3AA where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
        tableSummaryAwpAndwopNet: `       
        INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH tableSummarywpAndwopNet AS (
            select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, 
            count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 
            0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 
            0 as minusCess from ANX1_3CDA 
            where FLAG ='C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
        
        UNION ALL
        
        select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX,
         count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,
         0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess 
         from ANX1_3CDA where FLAG='C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
        and DOC_TYPE in ('CR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
        
        )
        select "3CDA" as TABLE_TYP,(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,sum(plusTotVal) - sum(minusTotval) as totalVal, NULL as CGST,sum(plusIgst)- sum(minusIgst) as IGST, NULL as SGST,sum(plusCess) - sum(minusCess) as CESS , PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from tableSummarywpAndwopNet group by EXPORT_TYPE HAVING COUNT(*) > 0;`,
    },

    summary: {
        //save3EFSumm : 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
        getConsolidatedSummaryByType: 'select TABLE_TYP as tableTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and DOC_TYPE = ? and SUMM_TYP = "DOC" order by TABLE_TYP',

        calculate3ASumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3A where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
        getCountMarkForDelfor3A: 'select count(*) as count from ANX1_3A where FLAG = "D" and FP= ? and TAX_PERIOD = ?',

        save3Aor3Hsumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',

        delete3Aor3Hsumm: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
        get3Aor3HSumm: 'select NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',

        calculate3HSumm: 'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3H where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
        getCountMarkForDelfor3H: 'select count(*) as count from ANX1_3H where FLAG = "D" and FP= ? and TAX_PERIOD = ?',

        calculate3CDSumm: `select DOC_TYPE , EXPORT_TYPE , count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE)
        IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as totVal, SUM(TOTAL_IGST) as igst, 
        SUM(TOTAL_CESS) as cess from ANX1_3CD where FLAG NOT IN ("F","D") and FP = ? and
        TAX_PERIOD = ? and EXPORT_TYPE =? and DOC_TYPE=? group by DOC_TYPE HAVING COUNT(*) > 0`,
        getCountMarkForDelfor3CD: 'select count(*) as count from ANX1_3CD where FLAG = "D" and FP= ? and TAX_PERIOD = ?  and EXPORT_TYPE =? and  DOC_TYPE=? ',
        docTypeValuesInsertionFor3cd: `
             
        INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH docTypeValuesInsertion as 
        (select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD, 
            (
                CASE WHEN FLAG = "D" THEN 
                        count(*) - count (CASE FLAG WHEN 'D' THEN 1 ELSE NULL END) 
                        ELSE 
                        count(*) END)  as noRec, 
         (CASE WHEN (CASE WHEN FLAG = "D" THEN count(*) - count (CASE FLAG WHEN 'D' THEN 1 ELSE NULL END) 
                    ELSE count(*) END) = 0 THEN 0
            WHEN TOTAL_TAX_VALUE IS NOT NULL AND FLAG = "D" THEN SUM(TOTAL_TAX_VALUE)-TOTAL_TAX_VALUE
            WHEN TOTAL_TAX_VALUE IS NOT NULL AND FLAG <> "D" THEN SUM(TOTAL_TAX_VALUE)
            WHEN TOTAL_TAX_VALUE IS NULL THEN 0
         END) as totVal, 
         (CASE WHEN (CASE WHEN FLAG = "D" THEN count(*) - count (CASE FLAG WHEN 'D' THEN 1 ELSE NULL END) 
                    ELSE count(*) END) = 0 THEN 0
            WHEN TOTAL_IGST IS NOT NULL AND FLAG = "D" THEN SUM(TOTAL_IGST)-TOTAL_IGST
            WHEN TOTAL_IGST IS NOT NULL AND FLAG <> "D" THEN SUM(TOTAL_IGST)
            WHEN TOTAL_IGST IS NULL THEN 0
         END) as IGST, 
        (CASE WHEN (CASE WHEN FLAG = "D" THEN count(*) - count (CASE FLAG WHEN 'D' THEN 1 ELSE NULL END) 
            ELSE count(*) END) = 0 THEN 0
            WHEN TOTAL_CESS IS NOT NULL AND FLAG = "D" THEN SUM(TOTAL_CESS)-TOTAL_CESS
            WHEN TOTAL_CESS IS NOT NULL AND FLAG <> "D" THEN SUM(TOTAL_CESS)
            WHEN TOTAL_CESS IS NULL THEN 0
         END) as CESS,
         count (CASE FLAG WHEN 'D' THEN 1 ELSE NULL END) as NO_OF_REC_MFD from ANX1_3CD where FLAG <> "F" and FP = ? and 
        TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0
        )
        select "3CD" as TABLE_TYP, (CASE WHEN noRec IS NULL THEN 0 ELSE noRec END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,totVal, NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from docTypeValuesInsertion;
        `,
        tableSummarywpAndwopNet:`       
        INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH tableSummarywpAndwopNet AS (
            select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, 
            count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 
            0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 
            0 as minusCess from ANX1_3CD 
            where FLAG NOT IN ("F","D") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
        
        UNION ALL
        
        select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX,
         count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,
         0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess 
         from ANX1_3CD where FLAG NOT IN ("F","D") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
        and DOC_TYPE in ('CR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
        
        )
        select "3CD" as TABLE_TYP,(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,sum(plusTotVal) - sum(minusTotval) as totalVal, NULL as CGST,sum(plusIgst)- sum(minusIgst) as IGST, NULL as SGST,sum(plusCess) - sum(minusCess) as CESS , PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from tableSummarywpAndwopNet group by EXPORT_TYPE HAVING COUNT(*) > 0;      
        `,
        consolidateNetForDocTypes:`
        INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH consolidateNetForDocTypes as 
        (select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE)
        IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as totVal, SUM(TOTAL_IGST) as IGST, 
        SUM(TOTAL_CESS) as CESS from ANX1_3CD where FLAG NOT IN ("F","D") and FP = ? and
        TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0
        )
        select "3CD" as TABLE_TYP, (CASE WHEN SUM(noRec) IS NULL THEN 0 ELSE SUM(noRec) END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,(CASE WHEN SUM(totVal)
        IS NULL THEN 0 ELSE SUM(totVal) END) as totVal , NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,'DOC' as SUMM_TYP from consolidateNetForDocTypes group by DOC_TYPE;`,
        consolidateNet:`
        INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
        WITH consolidateNet AS (
            select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 0 as minusCess from ANX1_3CD where FLAG NOT IN ("F","D") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
        and DOC_TYPE in ('I', 'DR') group by EXPORT_TYPE HAVING COUNT(*) > 0
        
        UNION ALL
        
        select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE)
        IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess from ANX1_3CD where FLAG NOT IN ("F","D") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
        and DOC_TYPE in ('CR') group by EXPORT_TYPE HAVING COUNT(*) > 0
        
        )
        select "3CD",(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN, NULL as  LGL_TRDNAME,(CASE WHEN FP IS NULL THEN "" ELSE FP END) as FP,(CASE WHEN TAX_PERIOD IS NULL THEN "" ELSE TAX_PERIOD END) as TAX_PERIOD,
        ( CASE WHEN (sum(plusTotVal) - sum(minusTotval)) IS NULL THEN 0 
        ELSE sum(plusTotVal) - sum(minusTotval) END) as totalVal,
        NULL as CGST,
        (CASE WHEN (sum(plusIgst)- sum(minusIgst)) IS NULL THEN 0
        ELSE (sum(plusIgst) - sum(minusIgst)) END) as IGST, 
        NULL as SGST,
        (CASE WHEN (sum(plusCess) - sum(minusCess)) IS NULL THEN 0
        ELSE (sum(plusCess) - sum(minusCess)) END)  as CESS ,
        NULL as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, 
        NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,'DOC' as SUMM_TYP 
        from consolidateNet ; 
               
        `,
        checkMarkForDelete3cd:`
        SELECT "3CD" AS TABLE_TYP,FP,TAX_PERIOD,DOC_TYPE,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, COUNT(*) AS MFD from ANX1_3CD where FLAG NOT IN ('D','F') AND FP = ? AND TAX_PERIOD = ? group by DOC_TYPE,EXPORT_TYPE;
        `,
        updateMarkForDeleteFor3cd:`UPDATE ANX1_SUMM SET NO_OF_REC_MFD = ? where  TABLE_TYP= ? AND DOC_TYPE = ? and PAYMT_WITH_TAX = ?  AND FP = ? AND TAX_PERIOD = ? AND SUMM_TYP ISNULL ;
        `,
        save3CDsumm: `INSERT INTO ANX1_SUMM 
       (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST,
       SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN) VALUES 
       (?, ?, ?, NULL, NULL, ?, ?, ?, ?, NULL, NULL, ?, ?, NULL, ?, NULL, NULL)`,
        delete3CDsumm: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and PAYMT_WITH_TAX=? and DOC_TYPE=?',
        get3CDSumm: 'select DOC_TYPE as doctyp , PAYMT_WITH_TAX as expwp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST,2) as cgst, ROUND(SGST,2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd  , SUMM_TYP  from ANX1_SUMM WHERE FP= ?  and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP IS NULL;',
        get3CDSummPWT: 'select DOC_TYPE as doctyp , PAYMT_WITH_TAX as expwp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and PAYMT_WITH_TAX = ? and DOC_TYPE != "N"',

        calculateConsolidated3CD: `select DOC_TYPE as doctyp ,  sum(NO_OF_REC) as records, SUM(NET_TAXABLE_VALUE) as totalval,
        (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as 
        cess, SUM(NO_OF_REC_MFD) as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3CD" 
        and( PAYMT_WITH_TAX = "Y" or PAYMT_WITH_TAX = "N") group by DOC_TYPE having count(*)>0;`,
        calculate3BSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3B where FLAG NOT IN("D","F") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',
        calculate3BSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3B where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
        calculate3BSummaryForRejectedDocs: 'select "REJ" as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3B where FLAG NOT IN("D","F") and status = "Rejected" and FP = ? and TAX_PERIOD = ? group by status',
        calculate3BASummaryForRejectedDocs: 'select "REJ" as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3BA where FLAG NOT IN("D","F") and status = "Rejected" and FP = ? and TAX_PERIOD = ? group by status',
        calculate3LSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3L where FLAG NOT IN("D","F") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',
        calculate3EFASummaryForRejectedDocs: 'select "REJ" as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst,SUM(CESS) as cess from ANX1_3EFA where FLAG NOT IN("D","F") and status = "Rejected" and FP = ? and TAX_PERIOD = ? group by status',
        calculate3LSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3L where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
        //calculate3LSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3L where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
        calculate3BAOSummaryDocWise: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BAO where FLAG NOT IN("D","F") and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        calculate3BASummaryDocWise: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BA where FLAG NOT IN("D","F","M") and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        calculate3BAOSummaryCtinWise: "select REV_CTIN as ctin, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as totVal,((SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as igst , ((SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BAO where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BAO where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cess from ANX1_3BAO where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ? group by REV_CTIN HAVING COUNT(*) > 0",
        calculate3BAOSummaryForRejectedDocs: 'select "REJ" as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BAO where FLAG NOT IN("D","F") and status = "Rejected" and FP = ? and TAX_PERIOD = ? group by status',
        calculate3BASummaryCtinWise: "select REV_CTIN as ctin, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as totVal,((SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as igst , ((SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cess from ANX1_3BA where FLAG NOT IN ('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ? group by REV_CTIN HAVING COUNT(*) > 0",
        calculate3BASummaryForRejectedDocs: 'select "REJ" as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BA where FLAG NOT IN("D","F") and status = "Rejected" and FP = ? and TAX_PERIOD = ? group by status',
        getCountMarkForDelfor3BDocWise: 'select count(*) as count from ANX1_3B where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
        getCountMarkForDelfor3BCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3B where FLAG IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?",
        getCountMarkForDelfor3BRejectedDocs: 'select count(*) as count from ANX1_3B where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected"',
        getCountMarkForDelfor3BAODocWise: 'select count(*) as count from ANX1_3BAO where FLAG = "D" and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ?',
        getCountMarkForDelfor3BADocWise: 'select count(*) as count from ANX1_3BA where FLAG IN ("D","M") and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ?',
        getCountMarkForDelfor3BAOCtinWise: "select count(*) as count, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName  from ANX1_3BAO where FLAG = 'D' and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?",
        getCountMarkForDelfor3BACtinWise: "select count(*) as count, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName  from ANX1_3BA where FLAG in ('D','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?",
        getCountMarkForDelfor3LDocWise: 'select count(*) as count from ANX1_3L where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
        getCountMarkForDelfor3LCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3L where FLAG = 'D' and FP = ? and TAX_PERIOD = ? and CTIN = ?",

        //getCountMarkForDelfor3LCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3L where FLAG IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?",

        save3BSummDocWise: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL,"DOC")',
        save3BSummCtinWise: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "CTIN")',

        get3Bor3KSummDocWise: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC" order by DOC_TYPE',
        get3Bor3KSummCtinWise: "select CTIN as ctin,(CASE WHEN LGL_TRDNAME IS NULL THEN ' ' ELSE LGL_TRDNAME END) as lglName, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?  and SUMM_TYP = 'CTIN' order by CTIN",
        delete3Bsumm: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and (DOC_TYPE = ? or CTIN = ? or DOC_TYPE = "N")',
        delete3BsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and (DOC_TYPE = ? or DOC_TYPE = "N")',
    // delete3BAsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BA" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3EFAsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3EFA" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3BsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and CTIN = ?',
        //delete3BAsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BA" and CTIN = ?',
        delete3EFAsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3EFA" and CTIN = ?',
        delete3LsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3LsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and CTIN = ?',
        delete3BAOsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BAO" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3BAOsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3BAO" and CTIN = ?',

        /**B2BA Table */
        delete3BAsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and CTIN = ?',
        delete3BAsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and (DOC_TYPE = ? or DOC_TYPE = "N")',
        calculate3BASummaryDocWise: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3BA where FLAG NOT IN("D","F","M") and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        calculate3BASummaryCtinWise: "select REV_CTIN as ctin, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as totVal,((SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as igst , ((SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3BA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cess from ANX1_3BA where FLAG NOT IN ('D','F','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ? group by REV_CTIN HAVING COUNT(*) > 0",
        getCountMarkForDelfor3BADocWise: 'select count(*) as count from ANX1_3BA where FLAG in ("D","M") and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ?',

        getCountMarkForDelfor3BACtinWise: "select count(*) as count, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName  from ANX1_3BA where FLAG in ('D','M') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?",

        calculate3EFASummaryDocWise: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, SUM(REV_CESS) as cess from ANX1_3EFA where FLAG NOT IN("D","F") and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        calculate3EFASummaryCtinWise: "select REV_CTIN as ctin, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3EFA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END from ANX1_3EFA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as totVal,((SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3EFA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END from ANX1_3EFA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as igst ,((SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3EFA where REV_DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?) - (SELECT CASE WHEN SUM(REV_CESS) IS NULL THEN 0 ELSE SUM(REV_CESS) END from ANX1_3EFA where REV_DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?)) as cess from ANX1_3EFA where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and REV_CTIN = ? group by REV_CTIN HAVING COUNT(*) > 0",
        getCountMarkForDelfor3EFADocWise: 'select count(*) as count from ANX1_3EFA where FLAG = "D" and FP = ? and TAX_PERIOD = ? and REV_DOCTYPE = ?',

        getCountMarkForDelfor3EFACtinWise: "select count(*) as count, (CASE WHEN REV_LGL_TRDNAME IS NULL THEN '' ELSE REV_LGL_TRDNAME END) as lglName  from ANX1_3EFA where FLAG ='D' and FP = ? and TAX_PERIOD = ? and REV_CTIN = ?",

        deleteSummforRejectedDocs: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and DOC_TYPE = "REJ"',
        calculate3EFASumm: 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWPA" THEN "Y" ELSE "N" END) as payTyp, REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, SUM(REV_CESS) as cess from ANX1_3EFA where FLAG NOT IN ("D","F","M") and FP = ? and TAX_PERIOD = ? group by REV_DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
        calculate3EFSumm: 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3EF where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
        calculate3EFSummForRejectedDocs: 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3EF where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
        calculate3EFASummForRejectedDocs: 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWPA" THEN "Y" ELSE "N" END) as payTyp, REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, SUM(REV_CESS) as cess from ANX1_3EFA where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by REV_DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
        save3EFSumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
        getCountMarkForDelete3EF: 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) || "-" || DOCTYPE) as type, count(*) as count from ANX1_3EF where FLAG = "D" and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP',
        getCountMarkForDelete3EFA: 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWPA" THEN "Y" ELSE "N" END) || "-" || REV_DOCTYPE) as type, count(*) as count from ANX1_3EFA where FLAG in ("D","M") and FP = ? and TAX_PERIOD = ? group by REV_DOCTYPE, PAY_TYP',
        getCountMarkForDelfor3EFRejectedDocs: 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) || "-" || DOCTYPE) as type, count(*) as count from ANX1_3EF where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by DOCTYPE, PAY_TYP',
        get3EFSummByPayTyp: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and PAYMT_WITH_TAX = ? and SUMM_TYP = "PAY_TYP"',
        getCountMarkForDelfor3EFConsolidatedsummary: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3EF where FLAG in ("D","M") and FP = ? and TAX_PERIOD = ? GROUP BY DOCTYPE',
        getCountMarkForDelfor3EFAConsolidatedsummary: 'select REV_DOCTYPE as docTyp, count(*) as count from ANX1_3EFA where FLAG = "D" and FP = ? and TAX_PERIOD = ? GROUP BY REV_DOCTYPE',
        getCountMarkForDelfor3EFARejectedDocs: 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWPA" THEN "Y" ELSE "N" END) || "-" || REV_DOCTYPE) as type, count(*) as count from ANX1_3EFA where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by REV_DOCTYPE, PAY_TYP',
        getCountMarkForDelfor3G: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3G where FLAG = "D" and FP = ? and TAX_PERIOD = ? GROUP BY DOCTYPE',
        getCountMarkForDelfor3GA: 'select REV_DOCTYPE as docTyp, count(*) as count from ANX1_3GA where FLAG in ("D","M") and FP = ? and TAX_PERIOD = ? GROUP BY REV_DOCTYPE',
        getCountMarkForDelfor3GRejectedDocs: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3G where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" GROUP BY DOCTYPE',
        getCountMarkForDelfor3GARejectedDocs: 'select REV_DOCTYPE as docTyp, count(*) as count from ANX1_3GA where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" GROUP BY REV_DOCTYPE',
        calculate3GSummary: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3G where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? group by DOCTYPE HAVING COUNT(*) > 0',
        calculate3GASummary: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3GA where FLAG NOT IN ("D","M","F") and FP = ? and TAX_PERIOD = ? group by REV_DOCTYPE HAVING COUNT(*) > 0',
        calculate3GSummaryForRejectedDocs: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, (CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END) as cgst, (CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END) as sgst, SUM(CESS) as cess from ANX1_3G where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by DOCTYPE HAVING COUNT(*) > 0',
        calculate3GASummaryForRejectedDocs: 'select REV_DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(REV_TAX_VALUE) IS NULL THEN 0 ELSE SUM(REV_TAX_VALUE) END) as totVal, (CASE WHEN SUM(REV_IGST) IS NULL THEN 0 ELSE SUM(REV_IGST) END) as igst, (CASE WHEN SUM(REV_CGST) IS NULL THEN 0 ELSE SUM(REV_CGST) END) as cgst, (CASE WHEN SUM(REV_SGST) IS NULL THEN 0 ELSE SUM(REV_SGST) END) as sgst, SUM(REV_CESS) as cess from ANX1_3GA where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by REV_DOCTYPE HAVING COUNT(*) > 0',
        get3GSumm: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC"',

        calculate3KSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3K where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE',
        calculate3KSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, (CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END) as igst, SUM(CESS) as cess from ANX1_3K where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",

        getCountMarkForDelfor3KDocWise: 'select count(*) as count from ANX1_3K where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
        getCountMarkForDelfor3KCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName from ANX1_3K where FLAG = 'D' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
        save3KSumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
        delete3KsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3K" and SUMM_TYP = "DOC"',
        delete3KsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3K" and CTIN = ?',

        deleteconsolidatedCD: "DELETE FROM ANX1_SUMM WHERE TABLE_TYP = '3CD' AND SUMM_TYP = 'DOC' AND FP =? AND TAX_PERIOD = ?",
        delete3LsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and (DOC_TYPE = ? or DOC_TYPE = "N")',
        delete3LsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and CTIN = ?'

    },

    removeData: {
        removeItemDetails: 'delete from ANX1_ITEMDTLS where ITEMREF like ',
        removeSummaryforTable: 'delete from ANX1_SUMM where TABLE_TYP = ? and FP= ? and TAX_PERIOD = ?',
        removeSummaryforAll: 'delete from ANX1_SUMM where FP= ? and TAX_PERIOD = ?',
        removeFrom4: "DELETE FROM ANX1_4",
        removeErrSummaryforAll: 'delete from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ?',
        removeErrSummaryforTable: 'delete from ANX1_ERR_SUMM where TABLE_TYP = ? and FP= ? and TAX_PERIOD = ?',
        removeSummaryForZeroValues: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and NO_OF_REC = 0 and NO_OF_REC_MFD = 0',
        removeErrSummaryForZeroValues: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and NO_OF_REC = 0 and NO_OF_REC_MFD = 0'
    },
    importJson: {
        get3hDocrefs: 'SELECT DOCREF as docRef FROM ANX1_3H WHERE FP=? AND TAX_PERIOD=?',
        removeItemDetails: 'DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (?)',
        remove3hdetails: 'DELETE FROM ANX1_3H WHERE DOCREF IN (?)',
        remove3adetails: 'DELETE FROM ANX1_3A WHERE DOCREF IN (?)',
        remove3bdetails: 'DELETE FROM ANX1_3B WHERE DOCREF IN (?)',
        remove3ldetails: 'DELETE FROM ANX1_3L WHERE DOCREF IN (?)',
        remove3cddetails: 'DELETE FROM ANX1_3CD WHERE DOCREF IN (?)',
        remove3efdetails: 'DELETE FROM ANX1_3EF WHERE DOCREF IN (?)',
        remove3efadetails: 'DELETE FROM ANX1_3EFA WHERE DOCREF IN (?)',
        remove3gdetails: 'DELETE FROM ANX1_3G WHERE DOCREF IN (?)',
        remove3gadetails: 'DELETE FROM ANX1_3GA WHERE DOCREF IN (?)',
        remove3jdetails: 'DELETE FROM ANX1_3J WHERE DOCREF IN (?)',
        remove3idetails: 'DELETE FROM ANX1_3I WHERE DOCREF IN (?)',
        remove4details: 'DELETE FROM ANX1_4 WHERE DOCREF IN (?)',
        remove3kdetails: 'DELETE FROM ANX1_3K WHERE DOCREF IN (?)',
        remove3badetails: 'DELETE FROM ANX1_3BA WHERE DOCREF IN (?)',
        remove3baodetails: 'DELETE FROM ANX1_3BAO WHERE DOCREF IN (?)',
        removeSummary: 'DELETE FROM ANX1_SUMM WHERE FP=? AND TAX_PERIOD=? AND TABLE_TYP = ?',
        removeErrorSummary:'DELETE FROM ANX1_ERR_SUMM WHERE FP=? AND TAX_PERIOD=? AND TABLE_TYP = ?',
        save3Aor3Hsumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "DOC")',
        save4summ: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, "DOC")',
        save4Errsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, "DOC")',
        save3KSummDocWise: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, ?, NULL, NULL, ?)',
        getCountMarkForDelfor3KDocWise: 'select count(*) as count from ANX1_3K where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',

        // ANX1 Amendment related
        remove3aadetails: 'DELETE FROM ANX1_3AA WHERE DOCREF IN (?)',

    },
    markForDelete :{
        getUCount: 'select count(DOCREF) from ? where TAX_PERIOD =? and FLAG = "U"',
        getDCount: 'select count(DOCREF) from ? where TAX_PERIOD =? and FLAG = "D"',
        markAll: 'update FLAG = ? from ? where TAX_PERIOD = ?',
        markforDel: 'update FLAG = ? from ? where TAX_PERIOD = ? and DOC_ID IN (?)',
    },
    history: {
        getFileHistory: 'SELECT TAX_PERIOD,FILE_NAME,TYPE,UPLOAD_TIME FROM FILE_UPLOAD_HISTORY WHERE TAX_PERIOD = ?',
    }
}

const createAnnex2Table = {
    /**3A-3B(B2B) Table*/
    b2bData: "CREATE TABLE IF NOT EXISTS ANX2_3AB (DOCREF TEXT PRIMARY KEY, STIN  TEXT (15) NOT NULL, TRDNAME TEXT (99), DOCTYPE CHAR NOT NULL, DOCNUM TEXT NOT NULL, DOCDATE TEXT, DOCVALUE DECIMAL (13, 2), POS TEXT(2), TAX_VALUE DECIMAL (13, 2), IGST  DECIMAL (13, 2), CGST  DECIMAL (13, 2), SGST  DECIMAL (13, 2), CESS  DECIMAL (13, 2), IS_ITC_ENTL CHAR (1), S_TAXPERIOD TEXT, UPLOAD_DT TEXT, S_RETURN_STAT TEXT, PORTAL_STAT CHAR, MATCH_RESULT TEXT,MATCH_RSN TEXT,ACTION_TAKEN CHAR, APP_TAXRATE  INTEGER, IGST_ACT CHAR (1), ITC_PERIOD  TEXT NOT NULL, REJ_PST_FIL CHAR (1), ERROR_CODE    TEXT, ERROR_DTL TEXT, CHCKSUM  TEXT, FLG CHAR (1) );",

    itemData: "CREATE TABLE IF NOT EXISTS ANX2_ITEMDTLS ( HSN TEXT, RATE INTEGER, TAXVAL DECIMAL (13, 2), IGST DECIMAL (13, 2), CGST DECIMAL (13, 2), SGST DECIMAL (13, 2), CESS DECIMAL (13, 2),ITC_PERIOD  TEXT NOT NULL, ITEMREF TEXT );",

    sezwpData: "CREATE TABLE IF NOT EXISTS ANX2_3AE (DOCREF TEXT PRIMARY KEY, STIN  TEXT (15) NOT NULL, TRDNAME TEXT (99), DOCTYPE CHAR NOT NULL, DOCNUM TEXT NOT NULL, DOCDATE TEXT, DOCVALUE DECIMAL (13, 2), POS TEXT (2), TAX_VALUE DECIMAL (13, 2), IGST  DECIMAL (13, 2), CESS DECIMAL (13, 2), IS_ITC_ENTL CHAR (1), S_TAXPERIOD TEXT, UPLOAD_DT TEXT, S_RETURN_STAT TEXT, PORTAL_STAT CHAR, MATCH_RESULT TEXT,MATCH_RSN TEXT, ACTION_TAKEN CHAR, APP_TAXRATE  INTEGER, ITC_PERIOD  TEXT NOT NULL, REJ_PST_FIL CHAR (1), CLM_REF CHAR (1), ERROR_CODE TEXT, ERROR_DTL TEXT, CHCKSUM  TEXT, FLG CHAR (1) );",

    sezwopData: "CREATE TABLE IF NOT EXISTS ANX2_3AF (DOCREF TEXT PRIMARY KEY, STIN  TEXT (15) NOT NULL, TRDNAME TEXT (99), DOCTYPE CHAR NOT NULL, DOCNUM TEXT NOT NULL, DOCDATE TEXT, DOCVALUE DECIMAL (13, 2), POS TEXT (2), TAX_VALUE DECIMAL (13, 2), S_TAXPERIOD TEXT, UPLOAD_DT TEXT, S_RETURN_STAT TEXT, PORTAL_STAT CHAR, MATCH_RESULT TEXT,MATCH_RSN TEXT, ACTION_TAKEN CHAR, APP_TAXRATE  INTEGER, ITC_PERIOD  TEXT NOT NULL, REJ_PST_FIL CHAR (1), ERROR_CODE TEXT, ERROR_DTL TEXT, CHCKSUM  TEXT, FLG CHAR (1) );",

    deData: "CREATE TABLE IF NOT EXISTS ANX2_3AG (DOCREF TEXT PRIMARY KEY, STIN  TEXT (15) NOT NULL, TRDNAME TEXT (99), DOCTYPE CHAR NOT NULL, DOCNUM TEXT NOT NULL, DOCDATE TEXT, DOCVALUE DECIMAL (13, 2), POS TEXT (2), TAX_VALUE DECIMAL (13, 2), IGST  DECIMAL (13, 2), CGST  DECIMAL (13, 2), SGST  DECIMAL (13, 2), CESS  DECIMAL (13, 2), IS_ITC_ENTL CHAR (1), S_TAXPERIOD TEXT, UPLOAD_DT TEXT, S_RETURN_STAT TEXT, PORTAL_STAT CHAR, MATCH_RESULT TEXT, MATCH_RSN TEXT, ACTION_TAKEN CHAR, APP_TAXRATE  INTEGER, IGST_ACT CHAR (1), ITC_PERIOD  TEXT NOT NULL, REJ_PST_FIL CHAR (1), CLM_REF CHAR (1), ERROR_CODE TEXT, ERROR_DTL TEXT, CHCKSUM  TEXT, FLG CHAR (1) );",

    tab5Data: "CREATE TABLE IF NOT EXISTS ANX2_5 ( STIN TEXT (15), TRDNAME TEXT (99), DOCTYP  CHAR, DOCNUM  TEXT, DOCDT TEXT, IGST DECIMAL (13, 2), CGST DECIMAL (13, 2), SGST DECIMAL (13, 2), CESS DECIMAL (13, 2), DTXPRD  TEXT, ASTIN TEXT (15), ATRDNAME TEXT (99), ADOCTYP  CHAR, ADOCNUM TEXT, ADOCDT TEXT, AIGST DECIMAL (13, 2), ACGST DECIMAL (13, 2), ASGST DECIMAL (13, 2), ACESS DECIMAL (13, 2), ADTXPRD  TEXT, ISAMD CHAR (1), AMD_RSN CHAR (2), ITC_PERIOD  TEXT NOT NULL );",


}
/* create matching tools tables */
const matchingToolTables = {

    prDetls: "CREATE TABLE IF NOT EXISTS PR_DETL(DOCREF TEXT,GSTIN TEXT,LGL_TRDNAME TEXT,SUPPLY_TYPE TEXT,DOC_TYPE CHAR(2),DOC_NUM TEXT,DOC_DATE DATE,TAXABLE_VALUE INTEGER,TAX_AMOUNT INTEGER,CGST INTEGER,IGST INTEGER,SGST INTEGER,CESS INTEGER,FIN_PRD TEXT,FIN_YR TEXT,PRIMARY KEY (GSTIN,DOC_TYPE,DOC_NUM,DOC_DATE));",

    prSummary: "CREATE TABLE IF NOT EXISTS PR_SUMM (SUPPLY_TYPE TEXT, NO_OF_DOCUMENTS NUMERIC, TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, FIN_PRD TEXT, FIN_YR TEXT, PRIMARY KEY(SUPPLY_TYPE, NO_OF_DOCUMENTS, TAXABLE_VALUE, TAX_AMOUNT, FIN_PRD, FIN_YR));",

    progressBar: "CREATE TABLE IF NOT EXISTS PROGRESS_SUMM (STATUS CHAR (1),FIN_PRD TEXT, FIN_YR TEXT);",

    mrSummary: "CREATE TABLE IF NOT EXISTS MR_SUMM (MATCH_TYPE TEXT, DOCS_IN_ANX2 INTEGER, DOCS_IN_PR INTEGER, TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, APPROX BOOLEAN, TOLERANCE INTEGER, FIN_PRD TEXT, FIN_YR TEXT, PRIMARY KEY (MATCH_TYPE,FIN_PRD,FIN_YR));",

    mrB2bSummary: "CREATE TABLE IF NOT EXISTS MR_B2B_SUMM (MATCH_RESULT TEXT, MATCH_TYPE TEXT, NO_OF_DOCS INTEGER, TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, APPROX BOOLEAN, TOLERANCE INTEGER, FIN_PRD TEXT, FIN_YR TEXT, PRIMARY KEY (MATCH_RESULT,MATCH_TYPE,FIN_PRD,FIN_YR));",

    mrDeSummary: "CREATE TABLE IF NOT EXISTS MR_DE_SUMM (MATCH_RESULT TEXT, MATCH_TYPE TEXT, NO_OF_DOCS INTEGER, TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, APPROX BOOLEAN, TOLERANCE INTEGER, FIN_PRD TEXT, FIN_YR TEXT, PRIMARY KEY (MATCH_RESULT,MATCH_TYPE,FIN_PRD,FIN_YR));",

    mrSezwpSummary: "CREATE TABLE IF NOT EXISTS MR_SEZWP_SUMM (MATCH_RESULT TEXT, MATCH_TYPE TEXT, NO_OF_DOCS INTEGER, TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, APPROX BOOLEAN, TOLERANCE INTEGER, FIN_PRD TEXT, FIN_YR TEXT, PRIMARY KEY (MATCH_RESULT,MATCH_TYPE,FIN_PRD,FIN_YR));",

    mrSexwopSummary: "CREATE TABLE IF NOT EXISTS MR_SEZWOP_SUMM (MATCH_RESULT TEX,MATCH_TYPE TEXT, NO_OF_DOCS INTEGER, TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, APPROX BOOLEAN, TOLERANCE INTEGER, FIN_PRD TEXT, FIN_YR TEXT, PRIMARY KEY (MATCH_RESULT,MATCH_TYPE,FIN_PRD,FIN_YR));",

    mrDetails: `CREATE TABLE IF NOT EXISTS MR_DETL (DOCREF TEXT,GSTIN TEXT, LGL_TRDNAME TEXT, DOC_TYPE CHAR(2),DOC_NUM TEXT, DOC_DATE DATE,TAXABLE_VALUE INTEGER, TAX_AMOUNT INTEGER, CGST INTEGER, IGST INTEGER, SGST INTEGER, CESS INTEGER, ITC CHAR(5),ACTION CHAR(1),
    ACTION_TAKEN TEXT, REASON TEXT, FIN_PRD TEXT, FIN_YR TEXT, TABLE_NAME CHAR(8),MATCH_TYPE CHAR(8),RECORD_TYPE CHAR(5),FIELD_MATCH TEXT,FIELD_REFINE_MATCH TEXT,PORTAL_STAT CHAR(8),S_RETURN_STAT CHAR(10), MATCH_TYPE_REFINE CHAR(8),MATCH_NUMBER INTEGER, PRIMARY KEY (GSTIN,DOC_TYPE,DOC_NUM,DOC_DATE,FIN_PRD,FIN_YR,RECORD_TYPE));`,

    prError: "CREATE TABLE IF NOT EXISTS PR_ERROR (FIN_PRD TEXT, ERR_FILE TEXT, PRIMARY KEY (FIN_PRD))",
        anxView : `CREATE VIEW anx2Tables AS
        SELECT DOCREF,
               STIN AS GSTIN,
               TRDNAME AS LGL_TRDNAME,
               DOCTYPE AS DOC_TYPE,
               DOCNUM AS DOC_NUM,
               [replace](DOCDATE, '-', '/') AS DOC_DATE,
               ROUND(TAX_VALUE, 2) AS TAXABLE_VALUE,
               ROUND( (IGST + CGST + SGST + CESS), 2) AS TAX_AMOUNT,
               IGST,
               CGST,
               SGST,
               CESS,
               ITC_PERIOD AS FIN_PRD,
               ACTION_TAKEN,
               PORTAL_STAT,
               S_RETURN_STAT,
               IS_ITC_ENTL,
               'B2B' AS SUPPLY_TYPE
          FROM ANX2_3AB
        UNION
        SELECT DOCREF,
               STIN AS GSTIN,
               TRDNAME AS LGL_TRDNAME,
               DOCTYPE AS DOC_TYPE,
               DOCNUM AS DOC_NUM,
               [replace](DOCDATE, '-', '/') AS DOC_DATE,
               ROUND(TAX_VALUE, 2) AS TAXABLE_VALUE,
               ROUND( (IGST + CESS), 2) AS TAX_AMOUNT,
               IGST,
               NULL AS CGST,
               NULL AS SGST,
               CESS,
               ITC_PERIOD AS FIN_PRD,
               ACTION_TAKEN,
               PORTAL_STAT,
               S_RETURN_STAT,
               IS_ITC_ENTL,
               'SEZWP' AS SUPPLY_TYPE
          FROM ANX2_3AE
        UNION
        SELECT DOCREF,
               STIN AS GSTIN,
               TRDNAME AS LGL_TRDNAME,
               DOCTYPE AS DOC_TYPE,
               DOCNUM AS DOC_NUM,
               [replace](DOCDATE, '-', '/') AS DOC_DATE,
               ROUND(TAX_VALUE, 2) AS TAXABLE_VALUE,
               NULL AS TAX_AMOUNT,
               NULL AS IGST,
               NULL AS CGST,
               NULL AS SGST,
               NULL AS CESS,
               ITC_PERIOD AS FIN_PRD,
               ACTION_TAKEN,
               PORTAL_STAT,
               S_RETURN_STAT,
               NULL AS IS_ITC_ENTL,
               'SEZWOP' AS SUPPLY_TYPE
          FROM ANX2_3AF
        UNION
        SELECT DOCREF,
               STIN AS GSTIN,
               TRDNAME AS LGL_TRDNAME,
               DOCTYPE AS DOC_TYPE,
               DOCNUM AS DOC_NUM,
               [replace](DOCDATE, '-', '/') AS DOC_DATE,
               ROUND(TAX_VALUE, 2) AS TAXABLE_VALUE,
               ROUND( (IGST + CGST + SGST + CESS), 2) AS TAX_AMOUNT,
               IGST,
               CGST,
               SGST,
               CESS,
               ITC_PERIOD AS FIN_PRD,
               ACTION_TAKEN,
               PORTAL_STAT,
               S_RETURN_STAT,
               IS_ITC_ENTL,
               'DE' AS SUPPLY_TYPE
          FROM ANX2_3AG;`,
        exactMatchView : `CREATE VIEW ExactMatch AS
        SELECT anx2.DOCREF,
               anx2.GSTIN,
               anx2.LGL_TRDNAME,
               UPPER(anx2.SUPPLY_TYPE) AS SUPPLY_TYPE,
               anx2.DOC_TYPE,
               anx2.DOC_NUM,
               [replace](anx2.DOC_DATE, '-', '/') DOC_DATE,
               anx2.TAXABLE_VALUE,
               IFNULL(anx2.TAX_AMOUNT, 0) AS TAX_AMOUNT,
               IFNULL(anx2.CGST, 0) AS CGST,
               IFNULL(anx2.IGST, 0) AS IGST,
               IFNULL(anx2.SGST, 0) AS SGST,
               IFNULL(anx2.CESS, 0) AS CESS,
               anx2.FIN_PRD,
               anx2.ACTION_TAKEN,
               anx2.PORTAL_STAT,
               anx2.S_RETURN_STAT,
               anx2.IS_ITC_ENTL,
               'EM' AS MatchType,
               'A' AS RecordType,
               NULL AS MISSINGTYPE,
               '' AS FIELD_MATCH,
               '' AS MATCH_NUMBER,
               '' AS REASON,
               pr.DOCREF AS PRDOCREF,
               pr.GSTIN AS PRGSTIN,
               pr.LGL_TRDNAME AS PRLGL_TRDNAME,
               UPPER(pr.SUPPLY_TYPE) AS PRSUPPLY_TYPE,
               pr.DOC_TYPE AS PRDOC_TYPE,
               pr.DOC_NUM AS PRDOC_NUM,
               [replace](pr.DOC_DATE, '-', '/') AS PRDOC_DATE,
               pr.TAXABLE_VALUE AS PRTAXABLE_VALUE,
               IFNULL(pr.TAX_AMOUNT, 0) AS PRTAX_AMOUNT,
               IFNULL(pr.CGST, 0) AS PRCGST,
               IFNULL(pr.IGST, 0) AS PRIGST,
               IFNULL(pr.SGST, 0) AS PRSGST,
               IFNULL(pr.CESS, 0) AS PRCESS,
               pr.FIN_PRD AS PRFIN_PRD,
               NULL AS PRACTION_TAKEN,
               NULL AS PRPORTAL_STAT,
               NULL AS PRS_RETURN_STAT,
               NULL AS PRIS_ITC_ENTL,
               'EM' AS PRMatchType,
               'P' AS PRRecordType,
               NULL AS PRMISSINGTYPE,
               '' AS PRFIELD_MATCH,
               '' AS PRMATCH_NUMBER,
               '' AS PRREASON
          FROM PR_DETL pr
               INNER JOIN
               anx2Tables anx2 ON pr.SUPPLY_TYPE = anx2.SUPPLY_TYPE AND 
                                  pr.GSTIN = anx2.GSTIN AND 
                                  pr.DOC_NUM = anx2.DOC_NUM AND 
                                  pr.DOC_TYPE = anx2.DOC_TYPE AND 
                                  pr.DOC_DATE = anx2.DOC_DATE AND 
                                  pr.TAXABLE_VALUE = anx2.TAXABLE_VALUE AND 
                                  ((pr.TAX_AMOUNT IS NULL AND (anx2.TAX_AMOUNT IS NULL OR anx2.TAX_AMOUNT = 0)) OR 
                                    (pr.TAX_AMOUNT = anx2.TAX_AMOUNT) ) AND 
                                  ((pr.CESS IS NULL AND (anx2.CESS IS NULL or anx2.CESS = 0)) OR 
                                    (pr.CESS = anx2.CESS) ) AND 
                                  ( (pr.IGST IS NULL AND (anx2.IGST IS NULL or anx2.IGST = 0)) OR 
                                    (pr.IGST = anx2.IGST) ) AND 
                                  ( (pr.SGST IS NULL AND 
                                     (anx2.SGST IS NULL OR anx2.SGST = 0)) OR 
                                    (pr.SGST = anx2.SGST) ) AND 
                                  ( (pr.CGST IS NULL AND 
                                     (anx2.CGST IS NULL OR anx2.CGST = 0)) OR 
                                    (pr.CGST = anx2.CGST) )`,
		probablMatchView:`CREATE VIEW ProbableMatch AS
        SELECT anx2.DOCREF,
               anx2.GSTIN,
               anx2.LGL_TRDNAME,
               UPPER(anx2.SUPPLY_TYPE) AS SUPPLY_TYPE,
               anx2.DOC_TYPE,
               anx2.DOC_NUM,
               [replace](anx2.DOC_DATE, '-', '/') DOC_DATE,
               anx2.TAXABLE_VALUE,
               IFNULL(anx2.TAX_AMOUNT, 0) AS TAX_AMOUNT,
               IFNULL(anx2.CGST, 0) AS CGST,
               IFNULL(anx2.IGST, 0) AS IGST,
               IFNULL(anx2.SGST, 0) AS SGST,
               IFNULL(anx2.CESS, 0) AS CESS,
               anx2.FIN_PRD,
               anx2.ACTION_TAKEN,
               anx2.PORTAL_STAT,
               anx2.S_RETURN_STAT,
               anx2.IS_ITC_ENTL,
               'PRM' AS MatchType,
               'A' AS RecordType,
               CASE WHEN (pr.GSTIN = anx2.GSTIN AND 
                          pr.DOC_TYPE <> anx2.DOC_TYPE) THEN 'DOC_TYPE' ELSE 'GSTIN' END AS MISSINGTYPE,
               '' AS FIELD_MATCH,
               '' AS MATCH_NUMBER,
               CASE WHEN (pr.GSTIN = anx2.GSTIN AND 
                          pr.DOC_TYPE <> anx2.DOC_TYPE) THEN 'Document type mismatch' ELSE 'GSTIN mismatch' END AS REASON,
               pr.DOCREF AS PRDOCREF,
               pr.GSTIN AS PRGSTIN,
               pr.LGL_TRDNAME AS PRLGL_TRDNAME,
               UPPER(pr.SUPPLY_TYPE) AS PRSUPPLY_TYPE,
               pr.DOC_TYPE AS PRDOC_TYPE,
               pr.DOC_NUM AS PRDOC_NUM,
               [replace](pr.DOC_DATE, '-', '/') AS PRDOC_DATE,
               pr.TAXABLE_VALUE AS TAXABLE_VALUE,
               IFNULL(pr.TAX_AMOUNT, 0) AS PRTAX_AMOUNT,
               IFNULL(pr.CGST, 0) AS PRCGST,
               IFNULL(pr.IGST, 0) AS PRIGST,
               IFNULL(pr.SGST, 0) AS PRSGST,
               IFNULL(pr.CESS, 0) AS PRCESS,
               pr.FIN_PRD AS PRFIN_PRD,
               NULL AS PRACTION_TAKEN,
               NULL AS PRPORTAL_STAT,
               NULL AS PRS_RETURN_STAT,
               NULL AS PRIS_ITC_ENTL,
               'PRM' AS PRMatchType,
               'P' AS PRRecordType,
               CASE WHEN (pr.GSTIN = anx2.GSTIN AND 
                          pr.DOC_TYPE <> anx2.DOC_TYPE) THEN 'DOC_TYPE' ELSE 'GSTIN' END AS PRMISSINGTYPE,
               '' AS PRFIELD_MATCH,
               '' AS PRMATCH_NUMBER,
               CASE WHEN (pr.GSTIN = anx2.GSTIN AND 
                          pr.DOC_TYPE <> anx2.DOC_TYPE) THEN 'Document type mismatch' ELSE 'GSTIN mismatch' END AS PRREASON
          FROM PR_DETL pr
               INNER JOIN
               anx2Tables anx2 ON ( (pr.GSTIN = anx2.GSTIN AND 
                                     pr.DOC_TYPE <> anx2.DOC_TYPE) OR 
                                    (pr.GSTIN <> anx2.GSTIN AND 
                                     pr.DOC_TYPE = anx2.DOC_TYPE) ) AND 
                                  pr.SUPPLY_TYPE = anx2.SUPPLY_TYPE AND 
                                  pr.DOC_NUM = anx2.DOC_NUM AND 
                                  pr.TAXABLE_VALUE = anx2.TAXABLE_VALUE AND 
                                  pr.DOC_DATE = anx2.DOC_DATE AND 
                                  ((pr.TAX_AMOUNT IS NULL AND (anx2.TAX_AMOUNT IS NULL OR anx2.TAX_AMOUNT = 0)) OR 
                                    (pr.TAX_AMOUNT = anx2.TAX_AMOUNT) ) AND 
                                  ((pr.CESS IS NULL AND (anx2.CESS IS NULL or anx2.CESS = 0)) OR 
                                    (pr.CESS = anx2.CESS) ) AND 
                                  ( (pr.IGST IS NULL AND (anx2.IGST IS NULL or anx2.IGST = 0)) OR 
                                    (pr.IGST = anx2.IGST) ) AND 
                                  ( (pr.SGST IS NULL AND 
                                     (anx2.SGST IS NULL OR anx2.SGST = 0)) OR 
                                    (pr.SGST = anx2.SGST) ) AND 
                                  ( (pr.CGST IS NULL AND 
                                     (anx2.CGST IS NULL OR anx2.CGST = 0)) OR 
                                    (pr.CGST = anx2.CGST) )
                                    AND anx2.DOCREF NOT IN (SELECT DOCREF FROM ExactMatch)
                                    AND pr.DOCREF NOT IN (SELECT PRDOCREF FROM ExactMatch)`,
		  remaingRecordsView:`CREATE VIEW RemainingRecords AS
          SELECT *
            FROM (
                     SELECT anx2.DOCREF,
                            anx2.GSTIN,
                            anx2.LGL_TRDNAME,
                            UPPER(anx2.SUPPLY_TYPE) AS SUPPLY_TYPE,
                            anx2.DOC_TYPE,
                            anx2.DOC_NUM,
                            [replace](anx2.DOC_DATE, '-', '/') DOC_DATE,
                            anx2.TAXABLE_VALUE,
                            IFNULL(anx2.TAX_AMOUNT, 0) AS TAX_AMOUNT,
                            IFNULL(anx2.CGST, 0) AS CGST,
                            IFNULL(anx2.IGST, 0) AS IGST,
                            IFNULL(anx2.SGST, 0) AS SGST,
                            IFNULL(anx2.CESS, 0) AS CESS,
                            anx2.FIN_PRD,
                            anx2.ACTION_TAKEN,
                            anx2.PORTAL_STAT,
                            anx2.S_RETURN_STAT,
                            anx2.IS_ITC_ENTL,
                            'RM' AS MatchType,
                            'A' AS RecordType,
                            NULL AS MISSINGTYPE,
                            '' AS FIELD_MATCH,
                            '' AS MATCH_NUMBER,
                            '' AS REASON,
                            NULL AS PRDOCREF,
                            NULL AS PRGSTIN,
                            NULL AS PRLGL_TRDNAME,
                            NULL AS PRSUPPLY_TYPE,
                            NULL AS PRDOC_TYPE,
                            NULL AS PRDOC_NUM,
                            NULL AS PRDOC_DATE,
                            NULL AS PRTAXABLE_VALUE,
                            NULL AS PRTAX_AMOUNT,
                            NULL AS PRCGST,
                            NULL AS PRIGST,
                            NULL AS PRSGST,
                            NULL AS PRCESS,
                            NULL AS PRFIN_PRD,
                            NULL AS PRACTION_TAKEN,
                            NULL AS PRPORTAL_STAT,
                            NULL AS PRS_RETURN_STAT,
                            NULL AS PRIS_ITC_ENTL,
                            NULL AS PRMatchType,
                            NULL AS PRRecordType,
                            NULL AS PRMISSINGTYPE,
                            '' AS PRFIELD_MATCH,
                            '' AS PRMATCH_NUMBER,
                            '' AS PRREASON
                       FROM anx2Tables anx2
                      WHERE anx2.DOCREF NOT IN (
                                SELECT DOCREF
                                  FROM ExactMatch
                                 WHERE RecordType = 'A'
                                UNION
                                SELECT DOCREF
                                  FROM ProbableMatch
                                 WHERE RecordType = 'A'
                            )
                     UNION
                     SELECT NULL AS DOCREF,
                            NULL AS GSTIN,
                            NULL AS LGL_TRDNAME,
                            NULL AS SUPPLY_TYPE,
                            NULL AS DOC_TYPE,
                            NULL AS DOC_NUM,
                            NULL AS DOC_DATE,
                            NULL AS TAXABLE_VALUE,
                            NULL AS TAX_AMOUNT,
                            NULL AS CGST,
                            NULL AS IGST,
                            NULL AS SGST,
                            NULL AS CESS,
                            NULL AS FIN_PRD,
                            NULL AS ACTION_TAKEN,
                            NULL AS PORTAL_STAT,
                            NULL AS S_RETURN_STAT,
                            NULL AS IS_ITC_ENTL,
                            NULL AS MatchType,
                            NULL AS RecordType,
                            NULL AS MISSINGTYPE,
                            '' AS FIELD_MATCH,
                            '' AS MATCH_NUMBER,
                            '' AS REASON,
                            pr.DOCREF AS PRDOCREF,
                            pr.GSTIN AS PRGSTIN,
                            pr.LGL_TRDNAME AS PRLGL_TRDNAME,
                            UPPER(pr.SUPPLY_TYPE) AS PRSUPPLY_TYPE,
                            pr.DOC_TYPE AS PRDOC_TYPE,
                            pr.DOC_NUM AS PRDOC_NUM,
                            [replace](pr.DOC_DATE, '-', '/') AS PRDOC_DATE,
                            pr.TAXABLE_VALUE AS PRTAXABLE_VALUE,
                            IFNULL(pr.TAX_AMOUNT, 0) AS PRTAX_AMOUNT,
                            IFNULL(pr.CGST, 0) AS PRCGST,
                            IFNULL(pr.IGST, 0) AS PRIGST,
                            IFNULL(pr.SGST, 0) AS PRSGST,
                            IFNULL(pr.CESS, 0) AS PRCESS,
                            pr.FIN_PRD AS PRFIN_PRD,
                            NULL AS PRACTION_TAKEN,
                            NULL AS PRPORTAL_STAT,
                            NULL AS PRS_RETURN_STAT,
                            NULL AS PRIS_ITC_ENTL,
                            'RM' AS PRMatchType,
                            'P' AS PRRecordType,
                            NULL AS PRMISSINGTYPE,
                            '' AS PRFIELD_MATCH,
                            '' AS PRMATCH_NUMBER,
                            '' AS PRREASON
                       FROM PR_DETL pr
                      WHERE pr.DOCREF NOT IN (
                                SELECT PRDOCREF
                                  FROM ExactMatch
                                 WHERE PRRecordType = 'P'
                                UNION
                                SELECT PRDOCREF
                                  FROM ProbableMatch
                                 WHERE PRRecordType = 'P'
                            )
                 );`,
           matchingSummaryView:`CREATE VIEW matchingSummary AS
           SELECT *
             FROM (
                      SELECT MATCH_TYPE AS mtype,
                             DOCS_IN_ANX2 AS inAnxRec,
                             DOCS_IN_PR AS inPrRec,
                             TAXABLE_VALUE AS TVALUE,
                             TAX_AMOUNT AS TAMOUNT,
                             FIN_PRD,
                             FIN_YR,
                             'MRSUMM' AS TBLNM
                        FROM MR_SUMM
                      UNION ALL
                      SELECT MATCH_TYPE AS mtype,
                             NO_OF_DOCS AS inAnxRec,
                             '' AS inPrRec,
                             TAXABLE_VALUE AS TVALUE,
                             TAX_AMOUNT AS TAMOUNT,
                             FIN_PRD,
                             FIN_YR,
                             'B2BSUMM' AS TBLNM
                        FROM MR_B2B_SUMM
                      UNION ALL
                      SELECT MATCH_TYPE AS mtype,
                             NO_OF_DOCS AS inAnxRec,
                             '' AS inPrRec,
                             TAXABLE_VALUE AS TVALUE,
                             TAX_AMOUNT AS TAMOUNT,
                             FIN_PRD,
                             FIN_YR,
                             'SEZWPSUMM' AS TBLNM
                        FROM MR_SEZWP_SUMM
                      UNION ALL
                      SELECT MATCH_TYPE AS mtype,
                             NO_OF_DOCS AS inAnxRec,
                             '' AS inPrRec,
                             TAXABLE_VALUE AS TVALUE,
                             TAX_AMOUNT AS TAMOUNT,
                             FIN_PRD,
                             FIN_YR,
                             'SEZWOPSUMM' AS TBLNM
                        FROM MR_SEZWOP_SUMM
                      UNION ALL
                      SELECT MATCH_TYPE AS mtype,
                             NO_OF_DOCS AS inAnxRec,
                             '' AS inPrRec,
                             TAXABLE_VALUE AS TVALUE,
                             TAX_AMOUNT AS TAMOUNT,
                             FIN_PRD,
                             FIN_YR,
                             'DESUMM' AS TBLNM
                        FROM MR_DE_SUMM
                  );`

}



module.exports = {
    table: createTable,
    query: queries,
    createAnnex1Table: createAnnex1Table,
    anx1Queries: anx1Queries,
    createAnnex2Table: createAnnex2Table,
    matchingToolTables: matchingToolTables,
    createAmendmentTable: createAmendmentTable,
}