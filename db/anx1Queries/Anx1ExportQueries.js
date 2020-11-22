const impConstants = require('../../utility/impConstants');
/* Export to Excel ans CSV Queries for all tables */

const exportExcelQuery = {

	B2CData: 'select a.PLACE_OF_SUPPLY as "' + impConstants.pos + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '" ,CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '" ,b.TAXRATE as "' + impConstants.rate + '" ,b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DATE as "' + impConstants.upload_date + '",a.STATUS as "' + impConstants.status + '" from ANX1_3A AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD =?',

	B2BData: 'select a.CTIN as "' + impConstants.ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '", a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '", a.DOC_VAL as "' + impConstants.doc_val + '", a.POS AS "' + impConstants.pos + '", a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", a.SUPPLY_TYPE as "' + impConstants.sup_typ + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.CTIN_TYPE AS "Recipient type",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '"  FROM ANX1_3B AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	CData: 'select CASE WHEN a.DOC_TYPE=="I" THEN "Invoice" WHEN a.DOC_TYPE == "CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '",a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '",a.DOC_VAL as "' + impConstants.doc_val + '",CASE WHEN a.EXPORT_TYPE == "EXPWP" THEN "WPAY" ELSE  "WOPAY" END as "' + impConstants.exp_typ + '",a.PORT_CODE as "' + impConstants.pcode_opt + '" ,a.SHIPNG_BILL_NUM as "' + impConstants.ship_num + '",a.SHIPNG_BILL_DATE as "' + impConstants.ship_date + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '" ,a. SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '" from ANX1_3CD AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	EFData: 'select a.CTIN as "' + impConstants.ctin_rec + '",a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '",a.DOC_NUM as "' + impConstants.doc_num + '", a.DOC_DATE as "' + impConstants.doc_date + '",a.DOC_VAL as "' + impConstants.doc_val + '",a.POS as "' + impConstants.pos + '",CASE WHEN a.PAY_TYP=="SEZWP" THEN "WPAY" ELSE "WOPAY" END as "' + impConstants.gst_pay_typ + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '",CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.STATUS as "' + impConstants.status + '" from ANX1_3EF AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	GData: 'select a.CTIN as "' + impConstants.ctin_rec + '",a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '",a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '",a.DOC_VAL as "' + impConstants.doc_val + '",a.POS as "' + impConstants.pos + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '",CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '",CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.STATUS as "' + impConstants.status + '" from ANX1_3G AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	HData: 'select a.CTIN as "' + impConstants.ctin_pan_sup + '",a.LGL_TRDNAME as "' + impConstants.trade_name + '",a.POS as "' + impConstants.pos + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '",CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '",b.HSN as "' + impConstants.hsn_opt + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '" from ANX1_3H AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	ImpsData: 'select a.POS as "' + impConstants.pos + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '" from ANX1_3I AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	ImpgData: 'select CASE WHEN a.DOCTYPE=="B" THEN "Bill of Entry" END as "' + impConstants.doc_type + '",a.BOEPCD as "' + impConstants.pcode_mand + '",a.BOENUM as "' + impConstants.boe_num + '",a.BOEDT as "' + impConstants.boe_date + '",a.BOEVAL as "' + impConstants.boe_val + '",a.POS as "' + impConstants.pos + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst_paid + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess_paid + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '" from ANX1_3J AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	KData: 'select a.CTIN as "' + impConstants.ctin_sup + '" ,a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="B" THEN "Bill of Entry" END as "' + impConstants.doc_type + '",a.PORT_CODE as "' + impConstants.pcode_mand + '",a.BOE_NUM as "' + impConstants.boe_num + '",a.BOE_DATE as "' + impConstants.boe_date + '",a.BOE_VALUE as "' + impConstants.boe_val + '",a.POS as "' + impConstants.pos + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '", b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst_paid + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess_paid + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '" from ANX1_3K AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	EcomData: 'select ETIN as "' + impConstants.ctin_ecom + '",LGL_TRDNAME as "' + impConstants.trade_name + '",SUPPLY_VAL as "' + impConstants.val_of_sup + '",SUPPLY_VAL_RETURNED as "' + impConstants.val_of_ret + '",NET_SUPPLY_VAL as "' + impConstants.net_val_sup + '",IGST as "' + impConstants.igst + '",CGST as "' + impConstants.cgst + '",SGST as "' + impConstants.sgst + '",Cess as "' + impConstants.cess + '",UPLOAD_DATE as "' + impConstants.upload_date + '" ,Status as "' + impConstants.status + '" from ANX1_4 where FLAG NOT IN ("F") and TAX_PERIOD=?',
	
	MISData: 'select CASE WHEN a.TABLE_TYPE=="3B" THEN "3B (B2B)" WHEN a.TABLE_TYPE=="3G" THEN "3G (DE)" ELSE "3E (SEZWP)" END as "' + impConstants.supply_related_to + '", a.CTIN as "' + impConstants.ctin_sup + '", a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '", a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '", a.DOC_VAL as "' + impConstants.doc_val + '", a.POS AS "' + impConstants.pos + '", a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", CASE WHEN a.CLAIM_REFUND == "Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_eligible_clm_rfnd + '", b.HSN as "' + impConstants.hsn_mand + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.TAXRATE as "' + impConstants.rate  + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '"  FROM ANX1_3L AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	B2BAOData : 'select a.CTIN as "' + impConstants.org_ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_uin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.REV_SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '"  FROM ANX1_3BAO AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	B2BAData : 'select a.CTIN as "' + impConstants.org_ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_uin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.REV_SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '"  FROM ANX1_3BA AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	SEZAData : 'select a.CTIN as "' + impConstants.org_ctin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", CASE WHEN a.PAY_TYP == "SEZWPA" THEN "WPAY" ELSE "WOPAY" END as "' + impConstants.gst_pay_typ + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '", b.HSN as "' + impConstants.hsn_mand + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '"  FROM ANX1_3EFA AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

	DEAData : 'select a.CTIN as "' + impConstants.org_ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_uin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.REV_SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' +  impConstants.sup_cov_sec7 + '", CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",a.Status as "' + impConstants.status + '"  FROM ANX1_3GA AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG NOT IN ("F") and a.TAX_PERIOD=?',

}

const exportErrExcelQuery = {

	B2CData: 'select a.PLACE_OF_SUPPLY as "' + impConstants.pos + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '" ,CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ+ '" ,b.TAXRATE as "' + impConstants.rate+ '" ,b.TAXVAL as "' + impConstants.taxable_value+ '",b.IGST as "' + impConstants.igst+ '",b.CGST as "' + impConstants.cgst+ '",b.SGST as "' + impConstants.sgst+ '",b.CESS as "' + impConstants.cess+ '",a.UPLOAD_DATE as "' + impConstants.upload_date+ '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status+ '",ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3A AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD =?',
	
	B2BData:'select a.CTIN as "' + impConstants.ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '", a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '", a.DOC_VAL as "' + impConstants.doc_val + '", a.POS AS "' + impConstants.pos + '", a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", a.SUPPLY_TYPE as "' + impConstants.sup_typ+ '", b.HSN as "' + impConstants.hsn_opt+ '", b.TAXRATE as "' + impConstants.rate+ '", b.TAXVAL as "' + impConstants.taxable_value+ '", b.IGST as "' + impConstants.igst+ '",b.CGST as "' + impConstants.cgst+ '",b.SGST as "' + impConstants.sgst+ '",b.CESS as "' + impConstants.cess+ '",a.CTIN_TYPE AS "Recipient type",a.UPLOAD_DT as "' + impConstants.upload_date+ '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status+ '",ERROR_DETAIL as "' + impConstants.error + '"  FROM ANX1_3B AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and  a.TAX_PERIOD=?',
	
	CData: 'select CASE WHEN a.DOC_TYPE=="I" THEN "Invoice" WHEN a.DOC_TYPE == "CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '",a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '",a.DOC_VAL as "' + impConstants.doc_val + '",CASE WHEN a.EXPORT_TYPE == "EXPWP" THEN "WPAY" ELSE  "WOPAY" END as "' + impConstants.exp_typ + '",a.PORT_CODE as "' + impConstants.pcode_opt + '" ,a.SHIPNG_BILL_NUM as "' + impConstants.ship_num + '",a.SHIPNG_BILL_DATE as "' + impConstants.ship_date + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '" ,a. SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3CD AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',

	EFData: 'select a.CTIN as "' + impConstants.ctin_rec + '",a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '",a.DOC_NUM as "' + impConstants.doc_num + '", a.DOC_DATE as "' + impConstants.doc_date + '",a.DOC_VAL as "' + impConstants.doc_val + '",a.POS as "' + impConstants.pos + '",CASE WHEN a.PAY_TYP=="SEZWP" THEN "WPAY" ELSE "WOPAY" END as "' + impConstants.gst_pay_typ + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '",CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '" , ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3EF AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',

	GData: 'select a.CTIN as "' + impConstants.ctin_rec + '",a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '",a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '",a.DOC_VAL as "' + impConstants.doc_val + '",a.POS as "' + impConstants.pos + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '",CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '",CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '", ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3G AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',

	HData: 'select a.CTIN as "' + impConstants.ctin_pan_sup + '",a.LGL_TRDNAME as "' + impConstants.trade_name + '",a.POS as "' + impConstants.pos + '",a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '",CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '",b.HSN as "' + impConstants.hsn_opt + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '", ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3H AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',

	ImpsData: 'select a.POS as "' + impConstants.pos + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '", ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3I AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',

	ImpgData: 'select CASE WHEN a.DOCTYPE=="B" THEN "Bill of Entry" END as "' + impConstants.doc_type + '",a.BOEPCD as "' + impConstants.pcode_mand + '",a.BOENUM as "' + impConstants.boe_num + '",a.BOEDT as "' + impConstants.boe_date + '",a.BOEVAL as "' + impConstants.boe_val + '",a.POS as "' + impConstants.pos + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '",b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst_paid + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess_paid + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '", ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3J AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',
	
	KData: 'select a.CTIN as "' + impConstants.ctin_sup + '" ,a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="B" THEN "Bill of Entry" END as "' + impConstants.doc_type + '",a.PORT_CODE as "' + impConstants.pcode_mand + '",a.BOE_NUM as "' + impConstants.boe_num + '",a.BOE_DATE as "' + impConstants.boe_date + '",a.BOE_VALUE as "' + impConstants.boe_val + '",a.POS as "' + impConstants.pos + '",a.SUPPLY_TYPE as "' + impConstants.sup_typ + '", b.HSN as "' + impConstants.hsn_mand + '",b.TAXRATE as "' + impConstants.rate + '",b.TAXVAL as "' + impConstants.taxable_value + '",b.IGST as "' + impConstants.igst_paid + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess_paid + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error + '" from ANX1_3K AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where FLAG IN ("F","C") and a.TAX_PERIOD=?',
	
	EcomData: 'select ETIN as "' + impConstants.ctin_ecom + '",LGL_TRDNAME as "' + impConstants.trade_name + '",SUPPLY_VAL as "' + impConstants.val_of_sup + '",SUPPLY_VAL_RETURNED as "' + impConstants.val_of_ret + '",NET_SUPPLY_VAL as "' + impConstants.net_val_sup + '",IGST as "' + impConstants.igst + '",CGST as "' + impConstants.cgst + '",SGST as "' + impConstants.sgst + '",Cess as "' + impConstants.cess + '",UPLOAD_DATE as "' + impConstants.upload_date + '" ,CASE WHEN FLAG=="F" THEN "Error" WHEN FLAG=="C" THEN "Corrected" END "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error + '" from ANX1_4 where FLAG IN ("F","C") and TAX_PERIOD=?',

	MISData: 'select CASE WHEN a.TABLE_TYPE=="3B" THEN "3B (B2B)" WHEN a.TABLE_TYPE=="3G" THEN "3G (DE)" ELSE "3E (SEZWP)" END as "' + impConstants.supply_related_to + '", a.CTIN as "' + impConstants.ctin_sup + '", a.LGL_TRDNAME as "' + impConstants.trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.doc_type + '", a.DOC_NUM as "' + impConstants.doc_num + '",a.DOC_DATE as "' + impConstants.doc_date + '", a.DOC_VAL as "' + impConstants.doc_val + '", a.POS AS "' + impConstants.pos + '", a.DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", CASE WHEN a.CLAIM_REFUND == "Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_eligible_clm_rfnd + '", b.HSN as "' + impConstants.hsn_mand + '", b.TAXRATE as "' + impConstants.rate  + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error +  '"  FROM ANX1_3L AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG IN ("F", "C") and a.TAX_PERIOD=?',

	B2BAOData : 'select a.CTIN as "' + impConstants.org_ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_uin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.REV_SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.CTIN_TYPE AS "Recipient type",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error +  '"  FROM ANX1_3BAO AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG IN ("F", "C") and a.TAX_PERIOD=?',

	B2BAData : 'select a.CTIN as "' + impConstants.org_ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_uin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.REV_SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.sup_cov_sec7 + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.CTIN_TYPE AS "Recipient type",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error +  '"  FROM ANX1_3BA AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG IN ("F", "C") and a.TAX_PERIOD=?',

	SEZAData : 'select a.CTIN as "' + impConstants.org_ctin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", CASE WHEN a.PAY_TYP == "SEZWPA" THEN "WPAY" ELSE "WOPAY" END as "' + impConstants.gst_pay_typ + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '", b.HSN as "' + impConstants.hsn_mand + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error +  '"  FROM ANX1_3EFA AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG IN ("F", "C") and a.TAX_PERIOD=?',

	DEAData : 'select a.CTIN as "' + impConstants.org_ctin_uin_rec + '", a.LGL_TRDNAME as "' + impConstants.org_trade_name + '",CASE WHEN a.DOCTYPE=="I" THEN "Invoice" WHEN a.DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.org_doc_type + '", a.DOC_NUM as "' + impConstants.org_doc_num + '",a.DOC_DATE as "' + impConstants.org_doc_date + '", a.REV_CTIN as "' + impConstants.rev_ctin_uin_rec + '", a.REV_LGL_TRDNAME as "' + impConstants.rev_trade_name + '",CASE WHEN a.REV_DOCTYPE=="I" THEN "Invoice" WHEN a.REV_DOCTYPE=="CR" THEN "Credit Note" ELSE "Debit Note" END as "' + impConstants.rev_doc_type + '", a.REV_DOC_NUM as "' + impConstants.rev_doc_num + '",a.REV_DOC_DATE as "' + impConstants.rev_doc_date + '",a.REV_DOC_VAL as "' + impConstants.doc_val + '", a.REV_POS AS "' + impConstants.pos + '", a.REV_DIFF_PERCENTAGE as "' + impConstants.diff_prcnt + '", CASE WHEN a.REV_SEC7_ACT=="Y" THEN "Yes" ELSE "No" END as "' +  impConstants.sup_cov_sec7 + '", CASE WHEN a.CLAIM_REFUND=="Y" THEN "Yes" ELSE "No" END as "' + impConstants.clm_rfnd + '", b.HSN as "' + impConstants.hsn_opt + '", b.TAXRATE as "' + impConstants.rate + '", b.TAXVAL as "' + impConstants.taxable_value + '", b.IGST as "' + impConstants.igst + '",b.CGST as "' + impConstants.cgst + '",b.SGST as "' + impConstants.sgst + '",b.CESS as "' + impConstants.cess + '",a.UPLOAD_DT as "' + impConstants.upload_date + '",CASE WHEN a.FLAG=="F" THEN "Error" WHEN a.FLAG=="C" THEN "Corrected" END as "' + impConstants.status + '",ERROR_DETAIL as "' + impConstants.error +  '"  FROM ANX1_3GA AS a INNER JOIN ANX1_ITEMDTLS AS b on b.ITEMREF = a.DOCREF where a.FLAG IN ("F", "C") and a.TAX_PERIOD=?'
}

module.exports = {
	exportExcelQuery: exportExcelQuery,
	exportErrExcelQuery: exportErrExcelQuery
}