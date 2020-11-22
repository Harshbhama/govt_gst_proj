/**
 * @author sudarshan.274788@infosys.com
 */


/** Create ANX1 Amendment Tables */
//flag U for uploaded from online ,N for added New from Offline 
// D- mark for delete ,E - editing ,F- failed Records ,C-corrected records
const createAnnex1ATable = {
    // 3AA amendment table represented as ANX1_3AA
    anx13aatbl: `CREATE TABLE IF NOT EXISTS ANX1_3AA (DOC_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
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
        CONSTRAINT UNIQUE_ANX1_3AA UNIQUE (PLACE_OF_SUPPLY,SEC7_ACT ,DIFF_PERCENTAGE ,FP , TAX_PERIOD));`,
    
    // 3CDA amendment table represented as ANX1_3CDA
    anx13cdatbl: `CREATE TABLE IF NOT EXISTS ANX1_3CDA 
    (
     DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
     DOC_TYPE CHAR NOT NULL,
     ODOC_TYPE CHAR NOT NULL,
     GSTIN TEXT NOT NULL,
     DOCREF TEXT NOT NULL,
     DOC_NUM TEXT NOT NULL,
     DOC_DATE DATE NOT NULL,
     ODOCREF TEXT,
     ODOC_NUM TEXT NOT NULL,
     ODOC_DATE DATE NOT NULL,
     ODOC_YEAR TEXT(4) NOT NULL,
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
     CONSTRAINT UNIQUE_ANX1_3CDA UNIQUE (DOC_NUM COLLATE NOCASE,DOC_TYPE,DOC_YEAR,TAX_PERIOD,FP),
     CONSTRAINT UNIQUE2_ANX1_3CDA UNIQUE (ODOC_NUM COLLATE NOCASE,ODOC_TYPE,ODOC_YEAR,TAX_PERIOD,FP));`,
    
     omastertbl: `CREATE TABLE IF NOT EXISTS OTHER_MASTER 
    (
     ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
     RETURN_TYPE TEXT NOT NULL,
     FP TEXT,
     TAX_PERIOD TEXT,
     AMD_NUM INTEGER
    )`,
    
    // 3HA amendment table represented as ANX1_3HA
    anx13hatbl: `CREATE TABLE IF NOT EXISTS ANX1_3HA 
    (
    DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    DOCREF TEXT NOT NULL, 
    CTIN  TEXT (15) NOT NULL,
    LGL_TRDNAME TEXT (99), 
    POS STRING (2) NOT NULL,
    TAX_VALUE DECIMAL (13, 2) NOT NULL,
    IGST  DECIMAL (13, 2), 
    CGST  DECIMAL (13, 2),  
    SGST  DECIMAL (13, 2),  
    CESS  DECIMAL (13, 2),
    DIFF_PERCENTAGE INTEGER NOT NULL,
    SEC7_ACT CHAR(1) NOT NULL, 
    SUPPLY_TYPE TEXT NOT NULL,
    UPLOAD_DT TEXT,
    REFUND_ELG CHAR(1) NOT NULL,
    FLAG CHAR(1) NOT NULL, 
    STATUS TEXT,
    FP TEXT,
    DOCTYPE CHAR NOT NULL,
    TAX_PERIOD TEXT,
    ERROR_CODE TEXT,
    ERROR_DETAIL TEXT,
    CONSTRAINT UNIQUE_ANX1_3HA UNIQUE (POS,DIFF_PERCENTAGE,SEC7_ACT,CTIN,FP,TAX_PERIOD)
    )`,
    
    anx13iatbl: `
            CREATE TABLE IF NOT EXISTS ANX1_3IA
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
               CONSTRAINT UNIQUE_ANX1_3IA UNIQUE (POS,FP,TAX_PERIOD)
        )`,
    
    // 4A amendment table represented as ANX1_4A
    anx14atbl: `CREATE TABLE IF NOT EXISTS ANX1_4A  
    (
    DOC_ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    DOCREF TEXT NOT NULL UNIQUE,
    ETIN TEXT NOT NULL,
    LGL_TRDNAME TEXT,
    SUPPLY_VAL DECIMAL (13, 2) NOT NULL,
    SUPPLY_VAL_RETURNED DECIMAL (13, 2)  NOT NULL,
    NET_SUPPLY_VAL DECIMAL (13, 2) NOT NULL,
    SUPPLY_TYPE TEXT, 
    CGST DECIMAL (13, 2),
    IGST DECIMAL (13, 2),
    SGST DECIMAL (13, 2),
    CESS DECIMAL (13, 2),
    UPLOAD_DATE DATE,
    FP TEXT,
    TAX_PERIOD TEXT,
    STATUS TEXT,
    FLAG CHAR(1),
    ERROR_CODE TEXT,
    ERROR_DETAIL TEXT,
    CONSTRAINT UNIQUE_ANX1_4A UNIQUE (ETIN,TAX_PERIOD)
    )`,
    anx13jatbl: `CREATE TABLE IF NOT EXISTS ANX1_3JA
    (DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    DOCREF TEXT NOT NULL,
    ODOCREF TEXT NOT NULL,
	ODOCTYPE CHAR NOT NULL,
	OBOENUM STRING(16) NOT NULL,
	OBOEDT DATE,
	OBOEPCD STRING(6),
	OBOEYEAR STRING(4) NOT NULL,
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
   CONSTRAINT UNIQUE_ANX1_3JA UNIQUE(BOENUM COLLATE NOCASE,BOEYEAR,BOEPCD COLLATE NOCASE,TAX_PERIOD,FP)
   CONSTRAINT UNIQUE2_ANX1_3JA UNIQUE(OBOENUM COLLATE NOCASE,OBOEYEAR,OBOEPCD COLLATE NOCASE,TAX_PERIOD,FP)
)`,
    
    anx13katbl: `CREATE TABLE IF NOT EXISTS ANX1_3KA 
	(DOC_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    DOCREF TEXT NOT NULL,
    ODOCREF TEXT NOT NULL,
	OCTIN TEXT (15) NOT NULL, 
	OLGL_TRDNAME TEXT (99), 
	ODOCTYPE CHAR(2) NOT NULL, 
	OBOE_NUM TEXT(16) NOT NULL, 
	OBOE_DATE DATE NOT NULL, 
	OPORT_CODE TEXT(6) NOT NULL, 
	OBOE_YEAR TEXT(4) NOT NULL, 
	CTIN TEXT (15) NOT NULL, 
	LGL_TRDNAME TEXT (99), 
	DOCTYPE CHAR(2) NOT NULL, 
	PORT_CODE TEXT(6) NOT NULL, 
	BOE_NUM TEXT(16) NOT NULL, 
	BOE_DATE DATE NOT NULL, 
	BOE_YEAR TEXT(4) NOT NULL, 
	BOE_VALUE DECIMAL(13, 2) NOT NULL, 
	POS TEXT(2) NOT NULL, 
	SUPPLY_TYPE TEXT NOT NULL, 
	TAX_VALUE DECIMAL(15, 2) NOT NULL, 
	IGST  DECIMAL(13, 2), 
	CESS  DECIMAL(13, 2), 
	UPLOAD_DT TEXT, 
	FLAG CHAR(1) NOT NULL, 
	STATUS TEXT, 
	FP TEXT, 
	TAX_PERIOD TEXT, 
	ERROR_CODE TEXT, 
	ERROR_DETAIL TEXT, 
	CONSTRAINT UNIQUE_ANX1_3KA UNIQUE(BOE_NUM COLLATE NOCASE,BOE_YEAR,PORT_CODE COLLATE NOCASE,TAX_PERIOD,FP)
	CONSTRAINT UNIQUE2_ANX1_3KA UNIQUE(OBOE_NUM COLLATE NOCASE,OBOE_YEAR,OPORT_CODE COLLATE NOCASE,TAX_PERIOD,FP)
	)`
    }
    
    const anx1aQueries = {
    
        itemDetails :{
            saveItemDetails :`INSERT INTO ANX1_ITEMDTLS ( HSN , TAXRATE , 
                TAXVAL ,IGST ,CGST, SGST, CESS ,ITEMREF)
            VALUES (?,?,?,?,?,?,?,?)`,
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
            getCountMarkForDelfor3KCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName from ANX1_3KA where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
            calculate3KSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3KA where FLAG ='C' and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
            delete3KsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3KA" and CTIN = ?',
            getCountMarkForDelfor3KDocWise: 'select count(*) as count from ANX1_3KA where FLAG = "F" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
            calculate3KSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3KA where FLAG="C" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE',
            delete3KsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3KA" and SUMM_TYP = "DOC"',
            calculate3EFSumm : 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3EF where FLAG ="C" and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
            getCountYetToCorrect3EF : 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) || "-" || DOCTYPE) as type, count(*) as count from ANX1_3EF where FLAG = "F" and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP',
            get3Bor3KSummDocWise: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC" order by DOC_TYPE',
            get3Bor3KSummCtinWise: "select CTIN as ctin,(CASE WHEN LGL_TRDNAME IS NULL THEN ' ' ELSE LGL_TRDNAME END) as lglName, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?  and SUMM_TYP = 'CTIN' order by CTIN",
            get3Aor3HSumm: 'select NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
            get3GSumm: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3G" and SUMM_TYP = "DOC"',
            get3CDSumm: 'select DOC_TYPE as doctyp , PAYMT_WITH_TAX as expwp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST,2) as cgst, ROUND(SGST,2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd  , SUMM_TYP  from ANX1_ERR_SUMM WHERE FP= ?  and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP IS NULL;',
            get3EFSummByPayTyp: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3EF" and PAYMT_WITH_TAX = ? and SUMM_TYP = "PAY_TYP"',
    
            calculate3AErrorSumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3A where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
            getCountErrorfor3A: 'select count(*) as count from ANX1_3A where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
    
            save3Aor3HErrsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
            save3Aor3HErrorsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "DOC")',
    
            delete3Aor3HErrorsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
    
            calculate3HErrorSumm: 'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3HA where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
            getErrorCountfor3H: 'select count(*) as count from ANX1_3HA where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
    
            calculate3BErrorSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3B where FLAG = "C" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',
            getCountofErrorRecords3BDocWise: 'select count(*) as count from ANX1_3B where FLAG = "F" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
            calculate3BErrorSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3B where FLAG = 'C' and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
            getCountofErrorRecords3BCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3B where FLAG = 'F' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
    
            save3BErrorSummDocWise: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL,"DOC")',
            save3BErrorSummCtinWise: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "CTIN")',
    
            get3Bor3KErrSummDocWise: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC" order by DOC_TYPE',
            delete3BErrsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and (DOC_TYPE = ? or CTIN = ? or DOC_TYPE = "N")',
            delete3BErrsummbyCtin: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and CTIN = ?',
            delete3BErrsummbyDoc: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and (DOC_TYPE = ? or DOC_TYPE = "N")',
            delete3Aor3Hsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
            getCountYetToCorrectfor3G: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3G where FLAG = "F" and FP = ? and TAX_PERIOD = ? GROUP BY DOCTYPE',
            calculate3GSummary: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3G where FLAG ="C" and FP = ? and TAX_PERIOD = ? group by DOCTYPE HAVING COUNT(*) > 0',
            save3EFSumm : 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
    
            calculate3iErrSumm:'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3IA where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
            getYetToBeCorrectedCount3i:'select count(*) as count from ANX1_3IA where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
    
            calculate3jErrSumm:'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3J where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
            getYetToBeCorrectedCount3j:'select count(*) as count from ANX1_3JA where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
            getYetToBeCorrectedCount3cd:`
            SELECT "3CDA" AS TABLE_TYP,FP,TAX_PERIOD,DOC_TYPE,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, COUNT(*) AS MFD from ANX1_3CDA where FLAG ='F' AND FP = ? AND TAX_PERIOD = ? group by DOC_TYPE,EXPORT_TYPE;
            `,
            tableSummarywpAndwopNet:`       
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
            select "3CD" as TABLE_TYP,(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,sum(plusTotVal) - sum(minusTotval) as totalVal, NULL as CGST,sum(plusIgst)- sum(minusIgst) as IGST, NULL as SGST,sum(plusCess) - sum(minusCess) as CESS , PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from tableSummarywpAndwopNet group by EXPORT_TYPE HAVING COUNT(*) > 0;      
            `,
            consolidateNetForDocTypes:`
            INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
            WITH consolidateNetForDocTypes as 
            (select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE)
            IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as totVal, SUM(TOTAL_IGST) as IGST, 
            SUM(TOTAL_CESS) as CESS from ANX1_3CDA where FLAG='C' and FP = ? and
            TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0
            )
            select "3CDA" as TABLE_TYP, (CASE WHEN SUM(noRec) IS NULL THEN 0 ELSE SUM(noRec) END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,(CASE WHEN SUM(totVal)
            IS NULL THEN 0 ELSE SUM(totVal) END) as totVal , NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,'DOC' as SUMM_TYP from consolidateNetForDocTypes group by DOC_TYPE;`,
    
            consolidateNet:`
            INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
            WITH consolidateNet AS (
                select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 0 as minusCess from ANX1_3CDA where FLAG ='C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR') group by EXPORT_TYPE HAVING COUNT(*) > 0
            
            UNION ALL
            
            select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE)
            IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess from ANX1_3CDA where FLAG = 'C' and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
            and DOC_TYPE in ('CR') group by EXPORT_TYPE HAVING COUNT(*) > 0
            
            )
            select "3CDA",(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN, NULL as  LGL_TRDNAME,(CASE WHEN FP IS NULL THEN "" ELSE FP END) as FP,(CASE WHEN TAX_PERIOD IS NULL THEN "" ELSE TAX_PERIOD END) as TAX_PERIOD,
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
             count (CASE FLAG WHEN 'F' THEN 1 ELSE NULL END) as NO_OF_REC_MFD from ANX1_3CDA where FLAG IN ("F","C") and FP = ? and 
            TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0)
            select "3CDA" as TABLE_TYP, (CASE WHEN noRec IS NULL THEN 0 ELSE noRec END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,totVal, NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from docTypeValuesInsertion;
            `,
            updateSummaryOnRemoveDataForAllTables : 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC = 0, NET_TAXABLE_VALUE = 0.0, IGST = 0.0, CGST = 0.0, SGST = 0.0, CESS = 0.0, VAL_SUP_MADE = 0.0, VAL_SUP_RETURN = 0.0 WHERE TAX_PERIOD = ?',
            updateSummaryOnRemoveDataForSelectedTable : 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC = 0, NET_TAXABLE_VALUE = 0.0, IGST = 0.0, CGST = 0.0, SGST = 0.0, CESS = 0.0, VAL_SUP_MADE = 0.0, VAL_SUP_RETURN = 0.0 WHERE TAX_PERIOD = ? AND TABLE_TYP = ?',
            updateYetToBeCorrectedOnRemoveDataForAllTables : 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC_MFD = 0 WHERE TAX_PERIOD = ?',
            updateYetToBeCorrectedOnRemoveDataForSelectedTable : 'UPDATE ANX1_ERR_SUMM SET NO_OF_REC_MFD = 0 WHERE TAX_PERIOD = ? AND TABLE_TYP = ?',
    
            // ANX1 Amend table queries
            calculate3AAErrorSumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3AA where FLAG = "C" and FP = ? and TAX_PERIOD = ?',
            getCountErrorfor3AA: 'select count(*) as count from ANX1_3AA where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
            tableSummaryAwpAndwopNet:`       
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
            select "3CDA" as TABLE_TYP,(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,sum(plusTotVal) - sum(minusTotval) as totalVal, NULL as CGST,sum(plusIgst)- sum(minusIgst) as IGST, NULL as SGST,sum(plusCess) - sum(minusCess) as CESS , PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from tableSummarywpAndwopNet group by EXPORT_TYPE HAVING COUNT(*) > 0;      
            `,
        },
        
        summary: {
            save3EFSumm : 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
            getConsolidatedSummaryByType: 'select TABLE_TYP as tableTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and DOC_TYPE = ? and SUMM_TYP = "DOC" order by TABLE_TYP',
    
            calculate3ASumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3A where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
            getCountMarkForDelfor3A: 'select count(*) as count from ANX1_3A where FLAG = "D" and FP= ? and TAX_PERIOD = ?',
    
            save3Aor3Hsumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
    
            delete3Aor3Hsumm: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
            get3Aor3HSumm: 'select NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
    
            calculate3HSumm: 'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3HA where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
            getCountMarkForDelfor3H: 'select count(*) as count from ANX1_3HA where FLAG = "D" and FP= ? and TAX_PERIOD = ?',
    
            calculate3CDSumm: `select DOC_TYPE , EXPORT_TYPE , count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE)
            IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as totVal, SUM(TOTAL_IGST) as igst, 
            SUM(TOTAL_CESS) as cess from ANX1_3CDA where FLAG NOT IN ("F","D","I") and FP = ? and
            TAX_PERIOD = ? and EXPORT_TYPE =? and DOC_TYPE=? group by DOC_TYPE HAVING COUNT(*) > 0`,
            getCountMarkForDelfor3CD: 'select count(*) as count from ANX1_3CDA where FLAG = "D" and FP= ? and TAX_PERIOD = ?  and EXPORT_TYPE =? and  DOC_TYPE=? ',
            docTypeValuesInsertionFor3cd:`
                 
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
             count (CASE FLAG WHEN 'D' THEN 1 ELSE NULL END) as NO_OF_REC_MFD from ANX1_3CDA where FLAG NOT IN ("F", "I") and FP = ? and 
            TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0
            )
            select "3CDA" as TABLE_TYP, (CASE WHEN noRec IS NULL THEN 0 ELSE noRec END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,totVal, NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from docTypeValuesInsertion;
            `,
            tableSummarywpAndwopNet:`       
            INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
            WITH tableSummarywpAndwopNet AS (
                select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, 
                count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 
                0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 
                0 as minusCess from ANX1_3CDA 
                where FLAG NOT IN ("F","D","I") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
            
            UNION ALL
            
            select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX,
             count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,
             0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess 
             from ANX1_3CDA where FLAG NOT IN ("F","D","I") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
            and DOC_TYPE in ('CR') group by DOC_TYPE, EXPORT_TYPE HAVING COUNT(*) > 0
            
            )
            select "3CDA" as TABLE_TYP,(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,sum(plusTotVal) - sum(minusTotval) as totalVal, NULL as CGST,sum(plusIgst)- sum(minusIgst) as IGST, NULL as SGST,sum(plusCess) - sum(minusCess) as CESS , PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,NULL as SUMM_TYP from tableSummarywpAndwopNet group by EXPORT_TYPE HAVING COUNT(*) > 0;      
            `,
            consolidateNetForDocTypes:`
            INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
            WITH consolidateNetForDocTypes as 
            (select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE)
            IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as totVal, SUM(TOTAL_IGST) as IGST, 
            SUM(TOTAL_CESS) as CESS from ANX1_3CDA where FLAG NOT IN ("F","D","I") and FP = ? and
            TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR', 'CR') group by DOC_TYPE,EXPORT_TYPE HAVING COUNT(*) > 0
            )
            select "3CDA" as TABLE_TYP, (CASE WHEN SUM(noRec) IS NULL THEN 0 ELSE SUM(noRec) END) as noRec,DOC_TYPE,NULL as CTIN,NULL as  LGL_TRDNAME, FP,TAX_PERIOD,(CASE WHEN SUM(totVal)
            IS NULL THEN 0 ELSE SUM(totVal) END) as totVal , NULL as CGST,IGST, NULL as SGST,CESS , (CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, NULL as NO_OF_REC_REJ, 0 as NO_OF_REC_MFD, NULL as VAL_SUP_MADE,NULL as VAL_SUP_RETURN,'DOC' as SUMM_TYP from consolidateNetForDocTypes group by DOC_TYPE;`,
            consolidateNet:`
            INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, CGST, IGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP)
            WITH consolidateNet AS (
                select DOC_TYPE , EXPORT_TYPE ,FP,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, (CASE WHEN SUM(TOTAL_TAX_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as plusTotVal, 0 as minusTotval, SUM(TOTAL_IGST) as plusIgst, 0 as minusIgst, SUM(TOTAL_CESS) as plusCess, 0 as minusCess from ANX1_3CDA where FLAG NOT IN ("F","D","I") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP') 
            and DOC_TYPE in ('I', 'DR') group by EXPORT_TYPE HAVING COUNT(*) > 0
            
            UNION ALL
            
            select DOC_TYPE , EXPORT_TYPE,FP ,TAX_PERIOD,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, count(*) as noRec, 0 as plusTotVal, (CASE WHEN SUM(TOTAL_TAX_VALUE)
            IS NULL THEN 0 ELSE SUM(TOTAL_TAX_VALUE) END) as minusTotVal,0 as plusIgst, SUM(TOTAL_IGST) as minusIgst, 0 as plusCess,SUM(TOTAL_CESS) as minusCess from ANX1_3CDA where FLAG NOT IN ("F","D","I") and FP = ? and TAX_PERIOD = ? and EXPORT_TYPE in ('EXPWP','EXPWOP')
            and DOC_TYPE in ('CR') group by EXPORT_TYPE HAVING COUNT(*) > 0
            
            )
            select "3CDA",(CASE WHEN sum(noRec) IS NULL THEN 0 ELSE sum(noRec) END) as  noRec,'N' as DOCTYP,NULL as CTIN, NULL as  LGL_TRDNAME,(CASE WHEN FP IS NULL THEN "" ELSE FP END) as FP,(CASE WHEN TAX_PERIOD IS NULL THEN "" ELSE TAX_PERIOD END) as TAX_PERIOD,
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
            SELECT "3CDA" AS TABLE_TYP,FP,TAX_PERIOD,DOC_TYPE,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, COUNT(*) AS MFD from ANX1_3CDA where FLAG NOT IN ('D','F') AND FP = ? AND TAX_PERIOD = ? group by DOC_TYPE,EXPORT_TYPE;
            `,
            checkMarkInvalid3cd:`
            SELECT "3CDA" AS TABLE_TYP,FP,TAX_PERIOD,DOC_TYPE,(CASE WHEN EXPORT_TYPE='EXPWP'  THEN 'Y' ELSE 'N' END) as PAYMT_WITH_TAX, COUNT(*) AS MAI from ANX1_3CDA where FLAG NOT IN ('I','F') AND FP = ? AND TAX_PERIOD = ? group by DOC_TYPE,EXPORT_TYPE;
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
    
            calculateConsolidated3CD : `select DOC_TYPE as doctyp ,  sum(NO_OF_REC) as records, SUM(NET_TAXABLE_VALUE) as totalval,
            SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as 
            cess, SUM(NO_OF_REC_MFD) as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3CDA" 
            and( PAYMT_WITH_TAX = "Y" or PAYMT_WITH_TAX = "N") group by DOC_TYPE having count(*)>0;`,
            calculate3BSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3B where FLAG NOT IN("D","F") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',
            calculate3BSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3B where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3B where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
            calculate3BSummaryForRejectedDocs: 'select "REJ" as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3B where FLAG NOT IN("D","F") and status = "Rejected" and FP = ? and TAX_PERIOD = ? group by status',
            calculate3LSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3L where FLAG NOT IN("D","F") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE HAVING COUNT(*) > 0',
            calculate3LSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3B where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
            calculate3LSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, ((SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as totVal, ((SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(IGST) IS NULL THEN 0 ELSE SUM(IGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as igst, ((SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CGST) IS NULL THEN 0 ELSE SUM(CGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cgst, ((SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(SGST) IS NULL THEN 0 ELSE SUM(SGST) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as sgst, ((SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE IN ('I', 'DR') and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?) - (SELECT CASE WHEN SUM(CESS) IS NULL THEN 0 ELSE SUM(CESS) END from ANX1_3L where DOCTYPE = 'CR' and FLAG NOT IN('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ?)) as cess from ANX1_3L where FLAG NOT IN ('D','F') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
    
            getCountMarkForDelfor3BDocWise: 'select count(*) as count from ANX1_3B where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
            getCountMarkForDelfor3BCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3B where FLAG = 'D' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
            getCountMarkForDelfor3BRejectedDocs: 'select count(*) as count from ANX1_3B where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected"',
            getCountMarkForDelfor3LDocWise: 'select count(*) as count from ANX1_3L where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
            getCountMarkForDelfor3LCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName  from ANX1_3L where FLAG = 'D' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
    
            save3BSummDocWise: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL,"DOC")',
            save3BSummCtinWise: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "CTIN")',
    
            get3Bor3KSummDocWise: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and SUMM_TYP = "DOC" order by DOC_TYPE',
            get3Bor3KSummCtinWise: "select CTIN as ctin,(CASE WHEN LGL_TRDNAME IS NULL THEN ' ' ELSE LGL_TRDNAME END) as lglName, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, (CASE WHEN NO_OF_REC_MFD IS NULL THEN 0 ELSE NO_OF_REC_MFD END) as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?  and SUMM_TYP = 'CTIN' order by CTIN",
            delete3Bsumm: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and (DOC_TYPE = ? or CTIN = ? or DOC_TYPE = "N")',
            delete3BsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and (DOC_TYPE = ? or DOC_TYPE = "N")',
            delete3BsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3B" and CTIN = ?',
            
            deleteSummforRejectedDocs: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ? and DOC_TYPE = "REJ"',
    
            calculate3EFSumm : 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3EF where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
            calculate3EFSummForRejectedDocs : 'select (CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) as payTyp, DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3EF where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by DOCTYPE, PAY_TYP HAVING COUNT(*) > 0;',
            save3EFSumm : 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
            getCountMarkForDelete3EF : 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) || "-" || DOCTYPE) as type, count(*) as count from ANX1_3EF where FLAG = "D" and FP = ? and TAX_PERIOD = ? group by DOCTYPE, PAY_TYP',
            getCountMarkForDelfor3EFRejectedDocs : 'select ((CASE WHEN UPPER(PAY_TYP) IS "SEZWP" THEN "Y" ELSE "N" END) || "-" || DOCTYPE) as type, count(*) as count from ANX1_3EF where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by DOCTYPE, PAY_TYP',
            get3EFSummByPayTyp: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3EF" and PAYMT_WITH_TAX = ? and SUMM_TYP = "PAY_TYP"',
            getCountMarkForDelfor3EFConsolidatedsummary: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3EF where FLAG = "D" and FP = ? and TAX_PERIOD = ? GROUP BY DOCTYPE',
    
            getCountMarkForDelfor3G: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3G where FLAG = "D" and FP = ? and TAX_PERIOD = ? GROUP BY DOCTYPE',
            getCountMarkForDelfor3GRejectedDocs: 'select DOCTYPE as docTyp, count(*) as count from ANX1_3G where FLAG = "D" and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" GROUP BY DOCTYPE',
            calculate3GSummary: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3G where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? group by DOCTYPE HAVING COUNT(*) > 0',
            calculate3GSummaryForRejectedDocs: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3G where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ? and STATUS = "Rejected" group by DOCTYPE HAVING COUNT(*) > 0',
            get3GSumm: 'select DOC_TYPE as docTyp, NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as totalval, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3G" and SUMM_TYP = "DOC"',
    
            calculate3KSummaryDocWise: 'select DOCTYPE as docTyp, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3KA where FLAG NOT IN ("D","F","I") and FP = ? and TAX_PERIOD = ? and DOCTYPE = ? group by DOCTYPE',
            calculate3KSummaryCtinWise: "select CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName, count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3KA where FLAG NOT IN ('D','F','I') and FP = ? and TAX_PERIOD = ? and CTIN = ? group by CTIN HAVING COUNT(*) > 0",
    
            getCountMarkForDelfor3KDocWise: 'select count(*) as count from ANX1_3KA where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
            getCountMarkForDelfor3KCtinWise: "select count(*) as count, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglName from ANX1_3KA where FLAG = 'D' and FP = ? and TAX_PERIOD = ? and CTIN = ?",
            save3KSumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES ',
            delete3KsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3KA" and SUMM_TYP = "DOC"',
            delete3KsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3KA" and CTIN = ?',
    
            deleteconsolidatedCD : "DELETE FROM ANX1_SUMM WHERE TABLE_TYP = '3CDA' AND SUMM_TYP = 'DOC' AND FP =? AND TAX_PERIOD = ?",
            delete3LsummbyDoc: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and (DOC_TYPE = ? or DOC_TYPE = "N")',
            delete3LsummbyCtin: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = "3L" and CTIN = ?',
    
            // ANX1 Amend table queries
            calculate3AASumm: 'select count(*) as noRec, (CASE WHEN SUM(TOTAL_TAXABLE_VALUE) IS NULL THEN 0 ELSE SUM(TOTAL_TAXABLE_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_3AA where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
            
            getCountMarkForDelfor3AA: 'select count(*) as count from ANX1_3AA where FLAG = "D" and FP= ? and TAX_PERIOD = ?'
            
            
        },
    
        removeData: {
            removeItemDetails: 'delete from ANX1_ITEMDTLS where ITEMREF like ',
            removeSummaryforTable: 'delete from ANX1_SUMM where TABLE_TYP = ? and FP= ? and TAX_PERIOD = ?',
            removeSummaryforAll: 'delete from ANX1_SUMM where FP= ? and TAX_PERIOD = ?',
            removeFrom4 : "DELETE FROM ANX1_4",
            removeErrSummaryforAll: 'delete from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ?',
            removeErrSummaryforTable: 'delete from ANX1_ERR_SUMM where TABLE_TYP = ? and FP= ? and TAX_PERIOD = ?'
        },
        importJson: {
            get3hDocrefs: 'SELECT DOCREF as docRef FROM ANX1_3HA WHERE FP=? AND TAX_PERIOD=?',
            removeItemDetails: 'DELETE FROM ANX1_ITEMDTLS WHERE ITEMREF IN (?)',
            remove3hdetails: 'DELETE FROM ANX1_3HA WHERE DOCREF IN (?)',
            remove3adetails: 'DELETE FROM ANX1_3A WHERE DOCREF IN (?)',
            remove3bdetails: 'DELETE FROM ANX1_3B WHERE DOCREF IN (?)',
            remove3cddetails: 'DELETE FROM ANX1_3CDA WHERE DOCREF IN (?)',
            remove3cdodetails: 'DELETE FROM ANX1_3CDA WHERE ODOCREF IN (?)',
            remove3efdetails: 'DELETE FROM ANX1_3EF WHERE DOCREF IN (?)',
            remove3gdetails: 'DELETE FROM ANX1_3G WHERE DOCREF IN (?)',
            remove3jdetails: 'DELETE FROM ANX1_3JA WHERE DOCREF IN (?)',
            remove3jodetails: 'DELETE FROM ANX1_3JA WHERE ODOCREF IN (?)',
            remove3idetails: 'DELETE FROM ANX1_3IA WHERE DOCREF IN (?)',
            remove4details: 'DELETE FROM ANX1_4A WHERE DOCREF IN (?)',
            remove3kdetails: 'DELETE FROM ANX1_3KA WHERE DOCREF IN (?)',
            remove3kodetails: 'DELETE FROM ANX1_3KA WHERE ODOCREF IN (?)',
            removeSummary: 'DELETE FROM ANX1_SUMM WHERE FP=? AND TAX_PERIOD=? AND TABLE_TYP = ?',
            removeErrorSummary:'DELETE FROM ANX1_ERR_SUMM WHERE FP=? AND TAX_PERIOD=? AND TABLE_TYP = ?',
            save3Aor3Hsumm: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, "DOC")',
            save4summ: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, "DOC")',
            save4Errsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, "DOC")',
            save3KSummDocWise: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME, FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN, SUMM_TYP) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, NULL, NULL, ?, NULL, NULL, ?)',
            getCountMarkForDelfor3KDocWise:  'select count(*) as count from ANX1_3K where FLAG = "D" and FP = ? and TAX_PERIOD = ? and DOCTYPE = ?',
            
            // ANX1 Amendment related
            remove3aadetails: 'DELETE FROM ANX1_3AA WHERE DOCREF IN (?)'
    
        },
        markForDelete :{
            getUCount: 'select count(DOCREF) from ? where TAX_PERIOD =? and FLAG = "U"',
            getDCount: 'select count(DOCREF) from ? where TAX_PERIOD =? and FLAG = "D"',
            markAll : 'update FLAG = ? from ? where TAX_PERIOD = ?',
            markforDel : 'update FLAG = ? from ? where TAX_PERIOD = ? and DOC_ID IN (?)',
        },
    // 3AA Amendment table related queries
    tableamdno: {
        saveamdno: `INSERT INTO OTHER_MASTER (FP , TAX_PERIOD, RETURN_TYPE, AMD_NUM) VALUES (?,?,?,? )`,
        deleteamdno: 'DELETE FROM OTHER_MASTER WHERE FP=? AND TAX_PERIOD=? AND RETURN_TYPE = ?',
        getamdno: 'SELECT AMD_NUM as amdno FROM OTHER_MASTER WHERE FP=? AND TAX_PERIOD=? AND RETURN_TYPE = ?',
    },
    table3aa: {
        get3AADetailsErr : "SELECT * FROM ANX1_3AA WHERE TAX_PERIOD=? AND FLAG IN ('F','C') ORDER BY DOC_ID DESC",
        get3AADetails: "SELECT * FROM ANX1_3AA WHERE TAX_PERIOD=? AND FLAG NOT IN ('F')  ORDER BY DOC_ID DESC",
        // get3AADetails: "SELECT * FROM ANX1_3AA WHERE TAX_PERIOD=? ORDER BY DOC_ID DESC",
        save3AA: `INSERT INTO ANX1_3AA (DOCREF , PLACE_OF_SUPPLY, DIFF_PERCENTAGE, DOC_TYPE, SEC7_ACT,UPLOAD_DATE, SUPPLY_TYPE,FP,TAX_PERIOD, TOTAL_TAXABLE_VALUE, CGST,IGST,SGST, CESS, STATUS, FLAG, ERROR_CODE, ERROR_DETAIL)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )`,
        update3AA: `update ANX1_3AA set
       DOCREF =?,
       PLACE_OF_SUPPLY =?,
       DIFF_PERCENTAGE=?,
       SEC7_ACT=?,
       SUPPLY_TYPE=?,
       TOTAL_TAXABLE_VALUE=?, 
       CGST=?,IGST=?,SGST=?,CESS=?, STATUS=?,FLAG=? , UPLOAD_DATE = ? ,ERROR_CODE=? ,ERROR_DETAIL=?
       where DOC_ID=?`,
        markForDelete3AA: 'update ANX1_3AA set FLAG="D" where DOCREF=? ',
        delete3AAByDocIds: `DELETE FROM ANX1_3AA WHERE DOC_ID IN`,
        get3AADetailsByDocId: "SELECT DOC_ID as docId , DOCREF FROM ANX1_3AA WHERE DOC_ID IN",
        get3AADetailsByDocRef: `SELECT * FROM ANX1_3AA where DOCREF = ?`,
        update3AADetailsByDocRef: `UPDATE ANX1_3AA SET TOTAL_TAXABLE_VALUE= ?,IGST= ?,CGST= ?,SGST= ?,CESS= ? where DOCREF = ?`,
        get3AAErrJson : "SELECT * FROM ANX1_3AA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD = ? order by a.DOC_ID",
        get3AAjSON: "SELECT * FROM ANX1_3AA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('Am','F') and a.TAX_PERIOD = ? order by a.DOC_ID",
        update3AAFlagByDocRef: `UPDATE ANX1_3AA SET FLAG = 'C', ERROR_CODE='', ERROR_DETAIL='' where DOCREF = ?`,
        get3aaflagbyDocref : `SELECT FLAG  FROM ANX1_3AA WHERE FLAG IN('D') and  DOCREF=?`
    },
    
    // 3CDA Amendment table related queries
    table3CDA: {
        getDetailsByExpTyp: `SELECT * FROM ANX1_3CDA WHERE TAX_PERIOD=? AND EXPORT_TYPE=?`,
        save3cdA: `INSERT INTO ANX1_3CDA ( ODOCREF, ODOC_TYPE, ODOC_NUM, ODOC_DATE, ODOC_YEAR, DOC_TYPE, GSTIN ,DOCREF,DOC_NUM ,DOC_DATE,DOC_VAL,DOC_YEAR,EXPORT_TYPE ,
            SHIPNG_BILL_NUM ,SHIPNG_BILL_DATE ,PORT_CODE,
            TOTAL_TAX_VALUE, TOTAL_IGST  ,TOTAL_CESS  ,SUPPLY_TYPE ,UPLOAD_DT , FLAG  ,STATUS ,FP ,
            TAX_PERIOD ,ERROR_CODE ,ERROR_DETAIL) VALUES (?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        update3cd: `update ANX1_3CDA set
        ODOCREF=?,
        ODOC_TYPE =?, 
        ODOC_NUM =?, 
        ODOC_DATE =?,
        ODOC_YEAR =?,
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
        get3cdAByReturnPeriod: `SELECT  ODOCREF as odocref,
                                        ODOC_TYPE as odocTyp, 
                                        ODOC_NUM as odocNum, 
                                        ODOC_DATE as odocDate, 
                                        DOC_ID as docid ,
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
                                 FROM ANX1_3CDA WHERE TAX_PERIOD = ? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC;`,
    // get3cdAByReturnPeriod: `SELECT  ODOCREF as odocref, ODOC_TYPE as odocTyp, 
    //                              ODOC_NUM as odocNum, 
    //                              ODOC_DATE as odocDate, 
    //                              DOC_ID as docid ,
    //                              DOC_TYPE as doctyp,
    //                              GSTIN as gstin,
    //                              DOCREF as docref, 
    //                              DOC_NUM as docNum, 
    //                              DOC_DATE as docDate, 
    //                              DOC_VAL as docVal, 
    //                              EXPORT_TYPE as exptype, 
    //                              SHIPNG_BILL_NUM as sbNum, 
    //                              SHIPNG_BILL_DATE as sbDate, 
    //                              PORT_CODE as sbpcode, 
    //                              TOTAL_TAX_VALUE as totaltxval, 
    //                              TOTAL_IGST as totaligst, 
    //                              TOTAL_CESS as totalcess, 
    //                              SUPPLY_TYPE as suptype, 
    //                              UPLOAD_DT as upldt, 
    //                              FLAG as flag, 
    //                              STATUS as status, 
    //                              FP as fp, 
    //                              TAX_PERIOD as taxprd, 
    //                              ERROR_CODE as errorcode,
    //                              ERROR_DETAIL as errordetail
    //                       FROM ANX1_3CDA WHERE TAX_PERIOD = ? ORDER BY DOC_ID DESC;`,
        get3cdAByReturnPeriodErr: `SELECT ODOCREF as odocref, ODOC_TYPE as odocTyp, 
                                        ODOC_NUM as odocNum, 
                                        ODOC_DATE as odocDate,
                                        DOC_ID as docid ,
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
                                 FROM ANX1_3CDA WHERE TAX_PERIOD = ? AND FLAG IN ('C','F') ORDER BY DOC_ID DESC;`,
        get3cdAByDocIds: `SELECT DOC_ID as docId,DOCREF , EXPORT_TYPE , DOC_TYPE FROM ANX1_3CDA where DOC_ID IN`,
        delete3cdAByDocIds: `DELETE FROM ANX1_3CDA WHERE DOC_ID IN`,
        get3cdADetailsByDocRef: `SELECT * FROM ANX1_3CDA where DOCREF = ?`,
        update3cdADetailsByDocRef: `UPDATE ANX1_3CDA SET TOTAL_TAX_VALUE= ?,TOTAL_IGST=?,TOTAL_CESS= ? where DOCREF = ?`,
        get3CDAjSON : `SELECT * FROM ANX1_3CDA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('Am','F') AND (a.STATUS NOT IN ("Invalid") OR a.status is NULL) AND a.TAX_PERIOD=? AND EXPORT_TYPE=? order by a.DOC_ID`,
        get3cdAErrJson : `SELECT * FROM ANX1_3CDA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? AND EXPORT_TYPE=? order by a.DOC_ID`,
        get3cdAByFPAndTaxperiod: `SELECT * FROM ANX1_3CDA where FP=? AND TAX_PERIOD=? `,
        update3cdAFlagByDocRef: `UPDATE ANX1_3CDA SET FLAG = 'C' where DOCREF = ?`,
        get3cdaflagbyDocref : `SELECT FLAG  FROM ANX1_3CDA WHERE FLAG IN('I','D','') and  DOCREF=?`
    },
    table3ha: {
        get3hDetailsErr : "SELECT * FROM ANX1_3HA WHERE TAX_PERIOD=? AND FLAG IN ('F','C') ORDER BY DOC_ID DESC",
        save3h: `INSERT INTO ANX1_3HA ( DOCREF,CTIN ,LGL_TRDNAME,POS,TAX_VALUE,IGST,
            CGST,SGST, CESS,DIFF_PERCENTAGE,SEC7_ACT, SUPPLY_TYPE,UPLOAD_DT,FLAG,STATUS,FP ,DOCTYPE,TAX_PERIOD, ERROR_CODE ,ERROR_DETAIL, REFUND_ELG)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);` ,
        update3h: `update ANX1_3HA set
            DOCREF =?,
            CTIN=?,
            LGL_TRDNAME=?,
            POS=?,
            TAX_VALUE=?, 
            IGST =? ,
            CGST=?,SGST=?,CESS=?,DIFF_PERCENTAGE=?,SEC7_ACT=? ,
            SUPPLY_TYPE =?, FLAG =?, STATUS=? , UPLOAD_DT =? ,ERROR_CODE=? ,ERROR_DETAIL=?, REFUND_ELG=?
            where DOC_ID=?`,
        get3hDetails: `SELECT * FROM ANX1_3HA WHERE TAX_PERIOD=? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC`,
        // get3hDetails: `SELECT * FROM ANX1_3HA WHERE TAX_PERIOD=? ORDER BY DOC_ID DESC`,
        get3hByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_3HA where DOC_ID IN`,
        delete3hByDocIds: `DELETE FROM ANX1_3HA WHERE DOC_ID IN`,
        get3hDetailsByDocRef: `SELECT * FROM ANX1_3HA where DOCREF = ?`,
        update3hDetailsByDocRef: `UPDATE ANX1_3HA SET TAX_VALUE= ?,IGST= ?,CGST= ?,SGST= ?,CESS= ? where DOCREF = ?`,
        get3HjSON: `SELECT * FROM ANX1_3HA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('Am','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3hErrJson: `SELECT * FROM ANX1_3HA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        update3hFlagByDocRef: `UPDATE ANX1_3HA SET FLAG = 'C', ERROR_CODE='', ERROR_DETAIL='' where DOCREF = ?`,
        get3haflagbyDocref : `SELECT FLAG  FROM ANX1_3HA WHERE FLAG IN('D') and  DOCREF=?`    
    },
    table4a: {
        save4: `INSERT INTO ANX1_4A (DOCREF,
        ETIN ,LGL_TRDNAME ,SUPPLY_VAL ,SUPPLY_VAL_RETURNED,
        NET_SUPPLY_VAL, SUPPLY_TYPE , CGST,IGST,SGST ,CESS ,UPLOAD_DATE ,FP ,
        TAX_PERIOD ,STATUS ,FLAG ,ERROR_CODE ,ERROR_DETAIL) VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        getTab4details: `SELECT * FROM ANX1_4A WHERE TAX_PERIOD=? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC`,
        // getTab4details: `SELECT * FROM ANX1_4A WHERE TAX_PERIOD=? ORDER BY DOC_ID DESC`,
        getTab4detailsErr: `SELECT * FROM ANX1_4A WHERE TAX_PERIOD=? AND FLAG IN ('F' ,'C') ORDER BY DOC_ID DESC`,
        getTab4ByDocIds: `SELECT DOC_ID as docId,DOCREF FROM ANX1_4A where DOC_ID IN`,
        deleteTab4ByDocIds: `DELETE FROM ANX1_4A WHERE DOC_ID IN`,
        editTab4: `UPDATE ANX1_4A SET DOCREF =?,
    ETIN =? ,LGL_TRDNAME =? ,SUPPLY_VAL =? ,SUPPLY_VAL_RETURNED =?,
    NET_SUPPLY_VAL =?,  CGST =?,IGST=?,SGST =?,CESS =?,
    STATUS =?,FLAG =? , UPLOAD_DATE=?,ERROR_CODE =? , ERROR_DETAIL = ? WHERE DOC_ID =?`,
        calculate4Summ: 'select count(*) as noRec,(CASE WHEN SUM(SUPPLY_VAL) IS NULL THEN 0 ELSE SUM(SUPPLY_VAL) END) as supVal,(CASE WHEN SUM(SUPPLY_VAL_RETURNED) IS NULL THEN 0 ELSE SUM(SUPPLY_VAL_RETURNED) END) as suprVal, (CASE WHEN SUM(NET_SUPPLY_VAL) IS NULL THEN 0 ELSE SUM(NET_SUPPLY_VAL) END) as netVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_4A where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
        calculate4ErrSumm: 'select count(*) as noRec,(CASE WHEN SUM(SUPPLY_VAL) IS NULL THEN 0 ELSE SUM(SUPPLY_VAL) END) as supVal,(CASE WHEN SUM(SUPPLY_VAL_RETURNED) IS NULL THEN 0 ELSE SUM(SUPPLY_VAL_RETURNED) END) as suprVal, (CASE WHEN SUM(NET_SUPPLY_VAL) IS NULL THEN 0 ELSE SUM(NET_SUPPLY_VAL) END) as netVal, SUM(IGST) as igst, SUM(CGST) as cgst, SUM(SGST) as sgst, SUM(CESS) as cess from ANX1_4A where FLAG ="C" and FP = ? and TAX_PERIOD = ?',
        getCountMarkForDelfor4: 'select count(*) as count from ANX1_4A where FLAG = "D" and FP= ? and TAX_PERIOD = ?',
        getCountYetToCorrectForDelfor4: 'select count(*) as count from ANX1_4A where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
        save4summ: 'INSERT INTO ANX1_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME,  FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN , SUMM_TYP) VALUES ',
        save4Errsumm: 'INSERT INTO ANX1_ERR_SUMM (TABLE_TYP, NO_OF_REC, DOC_TYPE, CTIN, LGL_TRDNAME,  FP, TAX_PERIOD, NET_TAXABLE_VALUE, IGST, CGST, SGST, CESS, PAYMT_WITH_TAX, NO_OF_REC_REJ, NO_OF_REC_MFD, VAL_SUP_MADE, VAL_SUP_RETURN , SUMM_TYP) VALUES ',
        delete4summ: 'DELETE from ANX1_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
        delete4Errsumm: 'DELETE from ANX1_ERR_SUMM where FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
        get4Summ: 'select DOC_TYPE as doctyp , NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as nsup, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd , VAL_SUP_MADE as sup, VAL_SUP_RETURN as supr from ANX1_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
        get4ErrJson : "SELECT * FROM ANX1_4A WHERE TAX_PERIOD=? AND FLAG IN ('C','F')",
        getTab4json: "SELECT * FROM ANX1_4A WHERE TAX_PERIOD=? AND FLAG NOT IN ('Am','F')",
        get4aflagbyDocref : `SELECT FLAG  FROM ANX1_4A WHERE FLAG IN('D') and  DOCREF=?`
    },
    table4aErr : {
      get4Summ: 'select DOC_TYPE as doctyp , NO_OF_REC as records, ROUND(NET_TAXABLE_VALUE, 2) as nsup, ROUND(IGST, 2) as igst, ROUND(CGST, 2) as cgst, ROUND(SGST, 2) as sgst, ROUND(CESS, 2) as cess, NO_OF_REC_MFD as mfd , VAL_SUP_MADE as sup, VAL_SUP_RETURN as supr from ANX1_ERR_SUMM WHERE FP= ? and TAX_PERIOD = ? and TABLE_TYP = ?',
    },
    table3ia: {
        save3i: `
          INSERT INTO ANX1_3IA (
            DOCREF , 
            POS ,
            TAX_VALUE ,
            IGST , 
            CESS ,
            SUPPLY_TYPE ,
            UPLOAD_DT,
            DIFF_PERCENTAGE ,
            REFUND_ELG, 
            FLAG, 
            STATUS, 
            FP,
            TAX_PERIOD,
            ERROR_CODE,
            ERROR_DETAIL 
          ) VALUES
          (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
          )
          `,
        getAll3i: `Select  DOC_ID as docId,DOCREF as docref, POS as pos,TAX_VALUE as taxVal,IGST as igst, 
                    CESS as cess,SUPPLY_TYPE as suptype,UPLOAD_DT as upldt,DIFF_PERCENTAGE as diffpercnt,REFUND_ELG as rfndelg, 
                    FLAG as flag, STATUS as status, FP as fp,TAX_PERIOD as taxPrd
                     from ANX1_3IA WHERE TAX_PERIOD=? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC`,
        // getAll3i: `Select  DOC_ID as docId,DOCREF as docref, POS as pos,TAX_VALUE as taxVal,IGST as igst, 
        //              CESS as cess,SUPPLY_TYPE as suptype,UPLOAD_DT as upldt,DIFF_PERCENTAGE as diffpercnt,REFUND_ELG as rfndelg, 
        //              FLAG as flag, STATUS as status, FP as fp,TAX_PERIOD as taxPrd
        //               from ANX1_3IA WHERE TAX_PERIOD=? ORDER BY DOC_ID DESC`,
          getAll3iErr: `Select  DOC_ID as docId,
                     DOCREF as docref, 
                     POS as pos,
                     TAX_VALUE as taxVal,
                     IGST as igst, 
                     CESS as cess,
                     SUPPLY_TYPE as suptype,
                     UPLOAD_DT as upldt,
                     DIFF_PERCENTAGE as diffpercnt,
                     REFUND_ELG as rfndelg, 
                     FLAG as flag, 
                     STATUS as status, 
                     FP as fp,
                     TAX_PERIOD as taxPrd ,
                     ERROR_CODE as err_cd,
                     ERROR_DETAIL as err_msg
                      from ANX1_3IA WHERE TAX_PERIOD=? AND FLAG IN ('C','F') ORDER BY DOC_ID DESC`,
        getTab3iByDocIds: `SELECT DOC_ID as docId,DOCREF as docref FROM ANX1_3IA where DOC_ID IN`,
        deleteTab3iByDocIds: `DELETE FROM ANX1_3IA WHERE DOC_ID IN`,
    edit3i :`UPDATE ANX1_3IA SET  
    DOCREF =?, 
    POS =? ,
    TAX_VALUE =? ,
    IGST = ?, 
    CESS = ?,
    FLAG =?, 
    STATUS =? ,UPLOAD_DT=?, ERROR_CODE=? ,ERROR_DETAIL=? WHERE DOC_ID =?`,
    calculate3iSumm:'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3IA where FLAG NOT IN ("D","F") and FP = ? and TAX_PERIOD = ?',
    getCountMarkForDelfor3i:'select count(*) as count from ANX1_3IA where FLAG = "D" and FP= ? and TAX_PERIOD = ?',
    get3iDetailsByDocRef: `SELECT * FROM ANX1_3IA where DOCREF = ?`,
    update3iDetailsByDocRef: `UPDATE ANX1_3IA SET TAX_VALUE= ?,IGST=?,CESS= ? where DOCREF = ?`,
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
    saveItemDetailsBatch :`INSERT INTO ANX1_ITEMDTLS (HSN, TAXRATE, TAXVAL, IGST, CGST, SGST, CESS, ITEMREF) VALUES`,
    get3IjSON: `SELECT * FROM ANX1_3IA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('Am','F') and a.TAX_PERIOD=? order by a.DOC_ID`,
    get3IErrJson : "SELECT * FROM ANX1_3IA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.DOC_ID",
    update3iFlagByDocRef: `UPDATE ANX1_3IA SET FLAG = 'C', ERROR_CODE='', ERROR_DETAIL='' where DOCREF = ?`,
    get3iaflagbyDocref : `SELECT FLAG  FROM ANX1_3IA WHERE FLAG IN('D') and  DOCREF=?`
    },

    table3ja:{
        save3j : `INSERT INTO ANX1_3JA(ODOCREF, ODOCTYPE, OBOENUM, OBOEDT, OBOEPCD, OBOEYEAR, DOCREF,DOCTYPE,POS,BOENUM,BOEPCD,BOEDT,BOEVAL,
          BOEYEAR,TAX_VALUE,IGST,CESS,SUPPLY_TYPE,UPLOAD_DT,REFUND_ELG,FLAG,STATUS,FP,TAX_PERIOD ,ERROR_CODE ,ERROR_DETAIL) 
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        update3j :`UPDATE ANX1_3JA SET ODOCREF=?, ODOCTYPE=?, OBOENUM=?, OBOEDT=?, OBOEPCD=?, OBOEYEAR=?, DOCREF=?,DOCTYPE=?,
        POS =?,BOENUM=?,BOEPCD=?,BOEDT=?,BOEVAL=?,BOEYEAR=?,TAX_VALUE=?,IGST=?,CESS=?,
        SUPPLY_TYPE=?,REFUND_ELG=?,FLAG=?,STATUS=? , UPLOAD_DT=?,ERROR_CODE=? ,ERROR_DETAIL=? WHERE DOC_ID=?`,
        calculate3jSumm:'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3JA where FLAG NOT IN ("D","F","I") and FP = ? and TAX_PERIOD = ?',
        calculate3jErrSumm:'select count(*) as noRec, (CASE WHEN SUM(TAX_VALUE) IS NULL THEN 0 ELSE SUM(TAX_VALUE) END) as totVal, SUM(IGST) as igst, SUM(CESS) as cess from ANX1_3JA where FLAG ="C" and FP = ? and TAX_PERIOD = ?',
        getCountMarkForDelfor3j:'select count(*) as count from ANX1_3JA where FLAG = "D" and FP= ? and TAX_PERIOD = ?',
        getCountYetToCorrectfor3j:'select count(*) as count from ANX1_3JA where FLAG = "F" and FP= ? and TAX_PERIOD = ?',
        getAll3j: `Select  DOC_ID as docid,
                        ODOCREF as odocref, 
                        OBOENUM as onum, 
                        OBOEDT as odt, 
                        OBOEPCD as opcode,
                        DOCREF as docref, 
                        POS as pos,
                        TAX_VALUE as taxVal,
                        IGST as igst, 
                        CESS as cess,
                        SUPPLY_TYPE as suptype,
                        UPLOAD_DT as upldt,
                        REFUND_ELG as rfndelg, 
                        FLAG as flag, 
                        STATUS as status, 
                        FP as fp,
                        TAX_PERIOD as taxPrd,
                        BOENUM as num,
                        BOEPCD as pcode,
                        BOEDT as dt,
                        BOEVAL as val
                         from ANX1_3JA WHERE TAX_PERIOD=? AND FLAG NOT IN ('F') ORDER BY DOC_ID DESC`,
                        //  getAll3j: `Select  DOC_ID as docid,
                        // ODOCREF as odocref, 
                        // OBOENUM as onum, 
                        // OBOEDT as odt, 
                        // OBOEPCD as opcode,
                        // DOCREF as docref, 
                        // POS as pos,
                        // TAX_VALUE as taxVal,
                        // IGST as igst, 
                        // CESS as cess,
                        // SUPPLY_TYPE as suptype,
                        // UPLOAD_DT as upldt,
                        // REFUND_ELG as rfndelg, 
                        // FLAG as flag, 
                        // STATUS as status, 
                        // FP as fp,
                        // TAX_PERIOD as taxPrd,
                        // BOENUM as num,
                        // BOEPCD as pcode,
                        // BOEDT as dt,
                        // BOEVAL as val
                        //  from ANX1_3JA WHERE TAX_PERIOD=? ORDER BY DOC_ID DESC`,
                         getAll3jErr: `Select  DOC_ID as docid,
                         ODOCREF as odocref, 
                        OBOENUM as onum, 
                        OBOEDT as odt, 
                        OBOEPCD as opcode,
                         DOCREF as docref, 
                         POS as pos,
                         TAX_VALUE as taxVal,
                         IGST as igst, 
                         CESS as cess,
                         SUPPLY_TYPE as suptype,
                         UPLOAD_DT as upldt,
                         REFUND_ELG as rfndelg, 
                         FLAG as flag, 
                         STATUS as status, 
                         FP as fp,
                         TAX_PERIOD as taxPrd,
                         BOENUM as num,
                         BOEPCD as pcode,
                         BOEDT as dt,
                         BOEVAL as val,
                         ERROR_CODE as err_cd,
                         ERROR_DETAIL as err_msg
                        from ANX1_3JA WHERE TAX_PERIOD=? AND FLAG IN ('C','F') ORDER BY DOC_ID DESC`,
                         getTab3jByDocIds: `SELECT DOC_ID as docid,DOCREF as docref FROM ANX1_3JA where DOC_ID IN`,
                         deleteTab3jByDocIds: `DELETE FROM ANX1_3JA WHERE DOC_ID IN`,
                         get3jDetailsByDocRef: `SELECT * FROM ANX1_3JA where DOCREF = ?`,
                         update3jDetailsByDocRef: `UPDATE ANX1_3JA SET TAX_VALUE= ?,IGST=?,CESS= ? where DOCREF = ?`,
                         update3jFlagByDocRef: `UPDATE ANX1_3JA SET FLAG = 'C' where DOCREF = ?`,
                         get3jDetailsByDocRef: `SELECT * FROM ANX1_3JA where DOCREF = ?`,
                         get3jjSON: `SELECT * FROM ANX1_3JA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('Am','F') and a.TAX_PERIOD=? order by a.POS, a.DOC_ID`,
                         get3JErrJson : "SELECT * FROM ANX1_3JA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.POS, a.DOC_ID",
                         get3jaflagbyDocref : `SELECT FLAG  FROM ANX1_3JA WHERE FLAG IN('I','D','') and  DOCREF=?`
      },
      table3KA: {
        get3KjSON: `SELECT * FROM ANX1_3KA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG NOT IN ('Am','F') and a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID`,
        get3KErrJson: "SELECT * FROM ANX1_3KA as a, ANX1_ITEMDTLS AS b where b.ITEMREF = a.DOCREF AND a.FLAG IN ('C','F') AND a.TAX_PERIOD=? order by a.CTIN, a.DOC_ID",
        update3K: `update ANX1_3KA set 
        ODOCREF =?,
        OCTIN =?, 
        OLGL_TRDNAME =?, 
        ODOCTYPE =?,
        OBOE_NUM =?,
        OBOE_DATE =?,
        OPORT_CODE =?, 
        OBOE_YEAR =?,
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
        get3kByDocIds: `SELECT DOC_ID as docId, DOCREF FROM ANX1_3KA where DOC_ID IN`,
        delete3kByDocIds: `DELETE FROM ANX1_3KA WHERE DOC_ID IN`,
        get3kDetailsByDocRef: `SELECT * FROM ANX1_3KA where DOCREF = ?`,
        update3kDetailsByDocRef: `UPDATE ANX1_3KA SET TAX_VALUE= ?,IGST=?,CESS= ? where DOCREF = ?`,
        update3kFlagByDocRef: `UPDATE ANX1_3KA SET FLAG = 'C' where DOCREF = ?`,
        save: `INSERT INTO ANX1_3KA (ODOCREF, OCTIN, OLGL_TRDNAME, ODOCTYPE, OBOE_NUM, OBOE_DATE, OPORT_CODE, OBOE_YEAR, DOCREF, CTIN, LGL_TRDNAME, DOCTYPE , PORT_CODE , BOE_NUM , BOE_DATE , BOE_YEAR , BOE_VALUE , POS , SUPPLY_TYPE, TAX_VALUE , IGST , CESS, UPLOAD_DT , FLAG , STATUS , FP , TAX_PERIOD , ERROR_CODE , ERROR_DETAIL)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
        getDocs: "SELECT DOC_ID as docid, ODOCREF as odocref, OCTIN as octin, (CASE WHEN OLGL_TRDNAME IS NULL THEN '' ELSE OLGL_TRDNAME END) as olglNm, ODOCTYPE as odoctyp, OBOE_NUM as oboenum, OBOE_DATE as oboedt, OPORT_CODE as opcode, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, BOE_NUM as boenum, BOE_DATE as boedt, BOE_VALUE as boeval, PORT_CODE as pcode, POS as pos, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3KA where TAX_PERIOD=? AND FLAG NOT IN ('F') order by DOC_ID desc",
        // getDocs: "SELECT DOC_ID as docid, ODOCREF as odocref, OCTIN as octin, (CASE WHEN OLGL_TRDNAME IS NULL THEN '' ELSE OLGL_TRDNAME END) as olglNm, ODOCTYPE as odoctyp, OBOE_NUM as oboenum, OBOE_DATE as oboedt, OPORT_CODE as opcode, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, BOE_NUM as boenum, BOE_DATE as boedt, BOE_VALUE as boeval, PORT_CODE as pcode, POS as pos, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag from ANX1_3KA where TAX_PERIOD=? order by DOC_ID desc",
        getDocsErr: "SELECT DOC_ID as docid, ODOCREF as odocref, OCTIN as octin, (CASE WHEN OLGL_TRDNAME IS NULL THEN '' ELSE OLGL_TRDNAME END) as olglNm, ODOCTYPE as odoctyp, OBOE_NUM as oboenum, OBOE_DATE as oboedt, OPORT_CODE as opcode, DOCREF as docref, CTIN as ctin, (CASE WHEN LGL_TRDNAME IS NULL THEN '' ELSE LGL_TRDNAME END) as lglNm, DOCTYPE as doctyp, BOE_NUM as boenum, BOE_DATE as boedt, BOE_VALUE as boeval, PORT_CODE as pcode, POS as pos, SUPPLY_TYPE as suptype, TAX_VALUE as txval, IGST as igst, CESS as cess, (CASE WHEN UPLOAD_DT IS NULL THEN '' ELSE UPLOAD_DT END) as upld_dt, (CASE WHEN STATUS IS NULL THEN '' ELSE STATUS END) as status, FLAG as flag , ERROR_CODE as err_cd , ERROR_DETAIL as err_msg from ANX1_3KA where TAX_PERIOD=? AND FLAG IN ('F','C') order by DOC_ID desc",
        getDistinctCtinForDocIds: 'SELECT DISTINCT CTIN from ANX1_3KA where DOC_ID IN',
        get3kaflagbyDocref : `SELECT FLAG  FROM ANX1_3KA WHERE FLAG IN('I','D','') and  DOCREF=?`
    },
    
    }
    
    
    module.exports = {
        createAnnex1ATable: createAnnex1ATable,
        anx1aQueries: anx1aQueries
    }