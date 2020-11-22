/* Export to CSV Queries for all tables */

const exportCsvQuery = {
	
    b2bData: `SELECT a.STIN AS "GSTIN of Supplier", a.TRDNAME AS "Trade/Legal name", 
    CASE WHEN a.DOCTYPE=='I' THEN "Invoice"
    WHEN a.DOCTYPE=='CN' THEN "Credit Note"
    ELSE "Debit Note"
    END AS "Document type",
    a.DOCNUM AS "Document number" , 
    replace(a.DOCDATE,'-','/')  AS "Document date DD/MM/YYYY" ,a.DOCVALUE AS "Document Value (₹)" ,
    a.POS AS "Place of supply (Name of State/UT)",
    i.HSN AS "HSN Code", i.RATE AS "Tax rate (%)", a.APP_TAXRATE AS "Applicable % of tax rate",
    CASE WHEN a.IGST_ACT=='Y' THEN "Yes"
    WHEN a.IGST_ACT=='N' THEN "No"
    ELSE " "
    END AS "Supply covered under Sec 7 of IGST Act",
    i.TAXVAL AS "Taxable value (₹)", i.IGST AS "Integrated tax (₹)", i.CGST AS "Central tax (₹)", i.SGST AS "State/UT tax (₹)",
    i.CESS AS "Cess (₹)",
    CASE WHEN a.IS_ITC_ENTL=='N' THEN "No"
    WHEN a.IS_ITC_ENTL=='Y/N' THEN "Yes"
    WHEN a.IS_ITC_ENTL=='N/Y' THEN "No"
    ELSE " "
    END AS "ITC entitlement", a.S_TAXPERIOD AS "Supplier's tax period", 
    replace(a.UPLOAD_DT,'-','/') AS "Date of uploading", 
    CASE WHEN a.S_RETURN_STAT=='F' THEN "Filed"
    WHEN a.S_RETURN_STAT=='NF' THEN "Not Filed"
    WHEN a.S_RETURN_STAT=='NF(ITC-NA)' THEN "Not Filed - ITC Not Available"
    ELSE " "
    END AS "Supplier's return status",
    CASE WHEN a.PORTAL_STAT=='A' THEN "Accepted"
    WHEN a.PORTAL_STAT=='P' THEN "Pending"
    WHEN a.PORTAL_STAT=='R' THEN "Rejected"
    ELSE " "
    END AS "Status as per portal", 
	a.MATCH_RESULT AS "Matching result", a.MATCH_RSN AS "Reason(s) of Matching result",
    CASE WHEN a.ACTION_TAKEN=='A' THEN "Accepted"
    WHEN a.ACTION_TAKEN=='P' THEN "Pending"
    WHEN a.ACTION_TAKEN=='R' THEN "Rejected"
    WHEN a.ACTION_TAKEN=='S' THEN "Reset"
    ELSE " "
    END  AS "Action taken",
    a.ERROR_DTL AS "GST portal validation error",
    CASE WHEN a.REJ_PST_FIL=='Y' THEN "Yes"
    WHEN a.REJ_PST_FIL=='N' THEN "No"
    ELSE " "
    END AS "Rejection after filing"
    FROM ANX2_3AB a LEFT JOIN ANX2_ITEMDTLS i ON i.ITEMREF= a.DOCREF where a.ITC_PERIOD=?`,

    sezwpData:`SELECT a.STIN AS "GSTIN of Supplier", a.TRDNAME AS "Trade/Legal name", 
    CASE WHEN a.DOCTYPE=='I' THEN "Invoice"
    WHEN a.DOCTYPE=='CN' THEN "Credit Note"
    ELSE "Debit Note"
    END AS "Document type",
    a.DOCNUM AS "Document number" , replace(a.DOCDATE,'-','/') AS "Document date DD/MM/YYYY" ,a.DOCVALUE AS "Document Value (₹)" ,
    a.POS AS "Place of supply (Name of State/UT)",
    i.HSN AS "HSN Code", i.RATE AS "Tax rate (%)", a.APP_TAXRATE AS "Applicable % of tax rate",
    i.TAXVAL AS "Taxable value (₹)", i.IGST AS "Integrated tax (₹)", i.CGST AS "Central tax (₹)", i.SGST AS "State/UT tax (₹)",
    i.CESS AS "Cess (₹)",
	CASE WHEN a.CLM_REF=='Y' THEN "Yes"
    WHEN a.CLM_REF=='N' THEN "No"
    ELSE " "
    END AS "Supplier Claiming Refund",
	CASE WHEN a.IS_ITC_ENTL=='N' THEN "No"
    WHEN a.IS_ITC_ENTL=='Y/N' THEN "Yes"
    WHEN a.IS_ITC_ENTL=='N/Y' THEN "No"
    ELSE " "
    END AS "ITC entitlement", a.S_TAXPERIOD AS "Supplier's tax period", 
    replace(a.UPLOAD_DT,'-','/') AS "Date of uploading", 
    CASE WHEN a.S_RETURN_STAT=='F' THEN "Filed"
    WHEN a.S_RETURN_STAT=='NF' THEN "Not Filed"
    WHEN a.S_RETURN_STAT=='NF(ITC-NA)' THEN "Not Filed - ITC Not Available"
    ELSE " "
    END AS "Supplier's return status",
    CASE WHEN a.PORTAL_STAT=='A' THEN "Accepted"
    WHEN a.PORTAL_STAT=='P' THEN "Pending"
    WHEN a.PORTAL_STAT=='R' THEN "Rejected"
    ELSE " "
    END AS "Status as per portal", 
	a.MATCH_RESULT AS "Matching result", a.MATCH_RSN AS "Reason(s) of Matching result",
    CASE WHEN a.ACTION_TAKEN=='A' THEN "Accepted"
    WHEN a.ACTION_TAKEN=='P' THEN "Pending"
    WHEN a.ACTION_TAKEN=='R' THEN "Rejected"
    WHEN a.ACTION_TAKEN=='S' THEN "Reset"
    ELSE " "
    END  AS "Action taken",
    a.ERROR_DTL AS "GST portal validation error",
    CASE WHEN a.REJ_PST_FIL=='Y' THEN "Yes"
    WHEN a.REJ_PST_FIL=='N' THEN "No"
    ELSE " "
    END AS "Rejection after filing"
    FROM ANX2_3AE a LEFT JOIN ANX2_ITEMDTLS i ON i.ITEMREF= a.DOCREF where a.ITC_PERIOD=?`,

    sezwopData:`SELECT a.STIN AS "GSTIN of Supplier", a.TRDNAME AS "Trade/Legal name", 
    CASE WHEN a.DOCTYPE=='I' THEN "Invoice"
    WHEN a.DOCTYPE=='CN' THEN "Credit Note"
    ELSE "Debit Note"
    END AS "Document type",
    a.DOCNUM AS "Document number" , replace(a.DOCDATE,'-','/') AS "Document date DD/MM/YYYY" ,a.DOCVALUE AS "Document Value (₹)" ,
    a.POS AS "Place of supply (Name of State/UT)",
    i.HSN AS "HSN Code", i.RATE AS "Tax rate (%)", 
    i.TAXVAL AS "Taxable value (₹)", i.IGST AS "Integrated tax (₹)", i.CGST AS "Central tax (₹)", i.SGST AS "State/UT tax (₹)",
    i.CESS AS "Cess (₹)",
    a.S_TAXPERIOD AS "Supplier's tax period", 
    replace(a.UPLOAD_DT,'-','/') AS "Date of uploading", 
    CASE WHEN a.S_RETURN_STAT=='F' THEN "Filed"
    WHEN a.S_RETURN_STAT=='NF' THEN "Not Filed"
    WHEN a.S_RETURN_STAT=='NF(ITC-NA)' THEN "Not Filed - ITC Not Available"
    ELSE " "
    END AS "Supplier's return status",
    CASE WHEN a.PORTAL_STAT=='A' THEN "Accepted"
    WHEN a.PORTAL_STAT=='P' THEN "Pending"
    WHEN a.PORTAL_STAT=='R' THEN "Rejected"
    ELSE " "
    END AS "Status as per portal", 
	a.MATCH_RESULT AS "Matching result", a.MATCH_RSN AS "Reason(s) of Matching result",
    CASE WHEN a.ACTION_TAKEN=='A' THEN "Accepted"
    WHEN a.ACTION_TAKEN=='P' THEN "Pending"
    WHEN a.ACTION_TAKEN=='R' THEN "Rejected"
    WHEN a.ACTION_TAKEN=='S' THEN "Reset"
    ELSE " "
    END  AS "Action taken",
    a.ERROR_DTL AS "GST portal validation error",
    CASE WHEN a.REJ_PST_FIL=='Y' THEN "Yes"
    WHEN a.REJ_PST_FIL=='N' THEN "No"
    ELSE " "
    END AS "Rejection after filing"
    FROM ANX2_3AF a LEFT JOIN ANX2_ITEMDTLS i ON i.ITEMREF= a.DOCREF where a.ITC_PERIOD=?`,

    deData:`SELECT a.STIN AS "GSTIN of Supplier", a.TRDNAME AS "Trade/Legal name", 
    CASE WHEN a.DOCTYPE=='I' THEN "Invoice"
    WHEN a.DOCTYPE=='CN' THEN "Credit Note"
    ELSE "Debit Note"
    END AS "Document type",
    a.DOCNUM AS "Document number" , replace(a.DOCDATE,'-','/') AS "Document date DD/MM/YYYY" ,a.DOCVALUE AS "Document Value (₹)" ,
    a.POS AS "Place of supply (Name of State/UT)",
    i.HSN AS "HSN Code", i.RATE AS "Tax rate (%)", a.APP_TAXRATE AS "Applicable % of tax rate",
    CASE WHEN a.IGST_ACT=='Y' THEN "Yes"
    WHEN a.IGST_ACT=='N' THEN "No"
    ELSE " "
    END AS "Supply covered under Sec 7 of IGST Act",
    i.TAXVAL AS "Taxable value (₹)", i.IGST AS "Integrated tax (₹)", i.CGST AS "Central tax (₹)", i.SGST AS "State/UT tax (₹)",
    i.CESS AS "Cess (₹)",
	CASE WHEN a.CLM_REF=='Y' THEN "Yes"
    WHEN a.CLM_REF=='N' THEN "No"
    ELSE " "
    END AS "Supplier Claiming Refund",
    CASE WHEN a.IS_ITC_ENTL=='N' THEN "No"
    WHEN a.IS_ITC_ENTL=='Y/N' THEN "Yes"
    WHEN a.IS_ITC_ENTL=='N/Y' THEN "No"
    ELSE " "
    END AS "ITC entitlement",	
    a.S_TAXPERIOD AS "Supplier's tax period", 
    replace(a.UPLOAD_DT,'-','/') AS "Date of uploading", 
    CASE WHEN a.S_RETURN_STAT=='F' THEN "Filed"
    WHEN a.S_RETURN_STAT=='NF' THEN "Not Filed"
    WHEN a.S_RETURN_STAT=='NF(ITC-NA)' THEN "Not Filed - ITC Not Available"
    ELSE " "
    END AS "Supplier's return status",
    CASE WHEN a.PORTAL_STAT=='A' THEN "Accepted"
    WHEN a.PORTAL_STAT=='P' THEN "Pending"
    WHEN a.PORTAL_STAT=='R' THEN "Rejected"
    ELSE " "
    END AS "Status as per portal", 
	a.MATCH_RESULT AS "Matching result", a.MATCH_RSN AS "Reason(s) of Matching result",
    CASE WHEN a.ACTION_TAKEN=='A' THEN "Accepted"
    WHEN a.ACTION_TAKEN=='P' THEN "Pending"
    WHEN a.ACTION_TAKEN=='R' THEN "Rejected"
    WHEN a.ACTION_TAKEN=='S' THEN "Reset"
    ELSE " "
    END  AS "Action taken",
    a.ERROR_DTL AS "GST portal validation error",
    CASE WHEN a.REJ_PST_FIL=='Y' THEN "Yes"
    WHEN a.REJ_PST_FIL=='N' THEN "No"
    ELSE " "
    END AS "Rejection after filing"
    FROM ANX2_3AG a LEFT JOIN ANX2_ITEMDTLS i ON i.ITEMREF= a.DOCREF where a.ITC_PERIOD=?`,

    isdcData:`SELECT STIN AS "GSTIN of ISD", TRDNAME AS "Trade/Legal name", 
    CASE WHEN DOCTYP=='I' THEN "ISD Invoice"
    WHEN DOCTYP=='CN' THEN "ISD Credit Note"
    ELSE " "
    END AS "Document type",
    DOCNUM AS "Document number" , replace(DOCDT,'-','/') AS "Document date DD/MM/YYYY",
    IGST AS "Integrated tax (₹)", CGST AS "Central tax (₹)", SGST AS "State/UT tax (₹)",
    CESS AS "Cess (₹)",
	DTXPRD AS "Distributor's tax period",
	CASE WHEN ISAMD =='Y' THEN "Yes"
	ELSE "No"
    END AS "Amendment Made, if any",	
    ASTIN AS "Original GSTIN of ISD", ATRDNAME AS "Original Trade/Legal name", 
    CASE WHEN ADOCTYP=='I' THEN "ISD Invoice"
    WHEN ADOCTYP=='CN' THEN "ISD Credit Note"
    ELSE " "
    END AS "Original document type",
    ADOCNUM AS "Original document number" , replace(ADOCDT,'-','/') AS "Original document date DD/MM/YYYY",
    AIGST AS "Original Integrated tax (₹)", ACGST AS "Original Central tax (₹)", ASGST AS "Original State/UT tax (₹)",
    ACESS AS "Original Cess (₹)",
	case substr(ADTXPRD,1,2) when '01' then 'Jan' when '02' then 'Feb' when '03' then 'Mar' when '04' then 'Apr'
	 when '05' then 'May' when '06' then 'Jun' when '07' then 'Jul' when '08' then 'Aug' when '09' then 'Sep'
	  when '10' then 'Oct' when '11' then 'Nov' when '12' then 'Dec' else '' end || "'" || substr(ADTXPRD,5,2)
	   AS "Original Distributor's tax period"
    FROM ANX2_5
    WHERE ITC_PERIOD = ?` ,

    userProfile: `SELECT GSTIN AS "GSTIN of Recipient", LGL_TRDNAME AS "Trade/Legal name", FP AS "Financial year",
    TAX_PERIOD AS "Tax period" ,'GST ANX-2: Annexure of Inward Supplies' AS "Type of Annexure", CASE WHEN ANX2_STAT=='F' THEN "Filed"
    WHEN ANX2_STAT=='NF' THEN "Not filed"
    ELSE " "
    END AS "Return Status",
    (SELECT strftime('%d/%m/%Y', 'now', 'localtime')) AS "Date of generation" FROM  USER_PROFILE WHERE GSTIN= ? and ISACTIVE='Y';`
    
}

module.exports = {
    exportCsvQuery: exportCsvQuery
}