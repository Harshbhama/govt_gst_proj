/*global exports */
'use strict';
/*constants for import excel headers*/
exports.pos ='Place of Supply*';
exports.taxable_value='Taxable Value*';
exports.diff_prcnt='Differential % of Tax Rate*';
exports.appl_tax='Applicable % of tax rate';
exports.supplier_typ='Supplier Type*';
exports.ctin_pan_sup='GSTIN/PAN of Supplier*';
exports.rate='Rate*';
exports.cess='Cess';
exports.sup_cov_sec7='Supply Covered Under Sec 7 of IGST Act*';
exports.ctin_uin_rec='GSTIN/UIN of Recipient*';
exports.org_ctin_uin_rec='Original GSTIN/UIN of Recipient*';
exports.rev_ctin_uin_rec='Revised GSTIN/UIN of Recipient*';
exports.doc_type='Document Type*';
exports.org_doc_type='Original Document Type*';
exports.rev_doc_type='Revised Document Type*';
exports.doc_num='Document Number*';
exports.org_doc_num='Original Document Number*';
exports.rev_doc_num='Revised Document Number*';
exports.org_doc_date='Original Document Date*';
exports.doc_date='Document Date*';
exports.rev_doc_date='Revised Document Date*';
exports.doc_val='Document Value*';
exports.rev_doc_val ='Document Value*';
exports.ship_num='Shipping Bill Number';
exports.ship_date='Shipping Bill Date';
exports.exp_typ='Export Type*';
exports.pcode_opt='Port Code';
exports.hsn_mand='HSN Code*';
exports.hsn_opt='HSN Code';
exports.gst_pay_typ='GST Payment Type*';
exports.clm_rfnd='Would You Claim Refund*';
exports.cess_paid='Cess Paid';
exports.boe_num='Bill of Entry Number*';
exports.boe_date='Bill of Entry Date*';
exports.boe_val='Bill of Entry Value*';
exports.ctin_sup='GSTIN of Supplier*';
exports.ctin_rec='GSTIN of Recipient*';
exports.rev_ctin_rec='GSTIN  of Recipient*';
exports.pcode_mand='Port Code*';
exports.ctin_ecom='GSTIN of E-com*';
exports.val_of_sup='Value of supplies made*';
exports.val_of_ret='Value of Suppies Returned*';
exports.net_val_sup='Net Value of Supplies';
exports.sup_rel_tab='Supply Relates to Table *';
exports.sup_typ='Supply Type';
exports.igst='Integrated Tax';
exports.cgst='Central Tax';
exports.sgst='State/UT Tax';
exports.org_trade_name='Original Trade/Legal Name';
exports.trade_name='Trade/Legal Name';
exports.rev_trade_name='Revised Trade/Legal Name';
exports.igst_paid='Integrated Tax Paid';
exports.upload_date="Date of Upload";
exports.status="Status";
exports.ErrorMessage="Error Message";
exports.flag="flag";
exports.error = "GST portal validation errors";
exports.odoc_type='Original Document Type*';
exports.odoc_num='Original Document Number*';
exports.odoc_date='Original Document Date*';
exports.supply_related_to = "Supply relates to Table*";
exports.sup_eligible_clm_rfnd='Is supplier eligible to claim refund*';
exports.opcode_mand='Original Port Code*';
exports.oboe_num='Original Bill of Entry Number*';
exports.oboe_date='Original Bill of Entry Date*';
exports.otrade_name='Original Trade/Legal Name';
exports.octin_sup='Original GSTIN of Supplier*';

/*constants for field pattern validations*/
exports.gstin_ptrn = /[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[a-zA-Z0-9]{3}/;
exports.uin_ptrn = /[0-9]{4}[A-Z]{3}[0-9]{5}[UN|ON]{2}[A-Z0-9]{1}/;
exports.tds_ptrn= /^[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z]{1}[A-Z0-9]{1}[D]{1}[A-Z0-9]{1}$/;
exports.tcs_ptrn=/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[D|C|S]{1}[A-Z0-9]{1}$/;
exports.nri_ptrn = /^[0-9]{4}[a-zA-Z]{3}[0-9]{5}[N][R][0-9a-zA-Z]{1}$/;
exports.amount_with_neg=/^[-]?\d{1,13}(\.\d{1,2})?$/;
exports.diff_ptrn=/^(100|65)$/;
exports.pan_ptrn=/^[A-Za-z0-9]{10}$/;
exports.rate_ptrn=/^(0|0.25|0.1|0.10|1|1.5|1.50|3|5|7.5|7.50|12|18|28)$/;
exports.amount_wo_neg=/^\d{1,13}(\.\d{1,2})?$/;
exports.doc_ship_num_ptrn=/^[A-Za-z0-9/-]+$/;
exports.pcode_ptrn=/^[A-Za-z0-9]{0,6}$/;
exports.trade_name_ptrn=/^[a-zA-Z0-9\_&'\-\.\/\,()?@!#%$~*;+= ]{1,99}$/;
exports.ecom_gstin_ptrn=/[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Cc]{1}[0-9a-zA-Z]{1}/;
exports.sahaz='SJ';
exports.sugam='SM';
exports.qrtly_norm='QN';
exports.mon_norm='MN';


/**Constants for Error Excel */
exports.b2cColumns = ['Place of Supply*', 'Differential % of Tax Rate*', 'Supply Covered Under Sec 7 of IGST Act*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.b2bColumns = ['GSTIN/UIN of Recipient*', 'Trade/Legal  Name', 'Document Type*', 'Document Number*', 'Document Date*', 'Document Value*', 'Place of Supply*', 'Differential % of Tax Rate*', 'Supply Covered Under Sec 7 of IGST Act*', 'HSN Code', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.expColumns = ['Document Type*', 'Document Number*', 'Document Date*', 'Document Value*', 'Export Type*', 'Port Code', 'Shipping Bill Number', 'Shipping Bill Date', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.sezColumns = ['GSTIN of Recipient*', 'Trade/Legal  Name', 'Document Type*', 'Document Number*', 'Document Date*', 'Document Value*', 'Place of Supply*','GST Payment Type*', 'Differential % of Tax Rate*', 'Would You Claim Refund*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.deColumns = ['GSTIN of Recipient*', 'Trade/Legal  Name', 'Document Type*', 'Document Number*', 'Document Date*', 'Document Value*', 'Place of Supply*', 'Differential % of Tax Rate*', 'Supply Covered Under Sec 7 of IGST Act*', 'Would You Claim Refund*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.revColumns = ['GSTIN/PAN of Supplier*', 'Trade/Legal  Name', 'Place of Supply*', 'Differential % of Tax Rate*', 'Supply Covered Under Sec 7 of IGST Act*','Supply Type', 'HSN Code', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.impsColumns = ['Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.impgColumns = ['Document Type*', 'Port Code*', 'Bill of Entry Number*', 'Bill of Entry Date*', 'Bill of Entry Value*', 'Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax Paid', 'Central tax', 'State/UT tax', 'Cess Paid'];
exports.ecomColumns = ['GSTIN of E-com*', 'Trade/Legal  Name', 'Value of supplies made*', 'Value of Suppies Returned*', 'Net Value of Supplies', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'];
exports.impgsezColumns = ['GSTIN of Supplier*', 'Trade/Legal  Name', 'Document Type*', 'Port Code*', 'Bill of Entry Number*', 'Bill of Entry Date*', 'Bill of Entry Value*', 'Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax Paid', 'Central tax', 'State/UT tax', 'Cess Paid'];
exports.baoColumns =['Original GSTIN/UIN of Recipient*','Original Trade/Legal Name','Original Document Type*','Original Document Number*','Original Document Date*','Revised GSTIN/UIN of Recipient*','Revised Trade/Legal Name','Revised Document Type*','Revised Document Number*','Revised Document Date*','Document Value*','Place of Supply*','Differential % of Tax Rate*','Supply Covered Under Sec 7 of IGST Act*','HSN Code','Rate*','Taxable Value*','Integrated Tax','Central Tax','State/UT Tax','Cess'];


// Ammendment related
exports.b2caColumns = ['Place of Supply*', 'Differential % of Tax Rate*', 'Supply Covered Under Sec 7 of IGST Act*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.expaColumns = ['Document Type*', 'Document Number*', 'Document Date*', 'Document Type*', 'Document Number*', 'Document Date*', 'Document Value*', 'Export Type*', 'Port Code', 'Shipping Bill Number', 'Shipping Bill Date', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.expaCsvColumns = ['Original Document Type*', 'Original Document Number*', 'Original Document Date*', 'Revised Document Type*', 'Revised Document Number*', 'Revised Document Date*', 'Document Value*', 'Export Type*', 'Port Code', 'Shipping Bill Number', 'Shipping Bill Date', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.expaXlColumns = ['Document Type*', 'Document Number*', 'Document Date*', 'Document Type*_1', 'Document Number*_1', 'Document Date*_1', 'Document Value*', 'Export Type*', 'Port Code', 'Shipping Bill Number', 'Shipping Bill Date', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.revaColumns = ['GSTIN/PAN of Supplier*', 'Trade/Legal  Name', 'Place of Supply*', 'Differential % of Tax Rate*', 'Supply Covered Under Sec 7 of IGST Act*','Supply Type', 'HSN Code', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.impsaColumns = ['Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax', 'Central tax', 'State/UT tax', 'Cess'];
exports.ecomaColumns = ['GSTIN of E-com*', 'Trade/Legal  Name', 'Value of supplies made*', 'Value of Suppies Returned*', 'Net Value of Supplies', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'];
exports.impgaColumns = ['Document Type*', 'Port Code*', 'Bill of Entry Number*', 'Bill of Entry Date*', 'Document Type*_1', 'Port Code*_1', 'Bill of Entry Number*_1', 'Bill of Entry Date*_1', 'Bill of Entry Value*', 'Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax Paid', 'Central tax', 'State/UT tax', 'Cess Paid'];
exports.impgsezaColumns = ['GSTIN of Supplier*', 'Trade/Legal Name', 'Document Type*', 'Port Code*', 'Bill of Entry Number*', 'Bill of Entry Date*', 'GSTIN of Supplier*_1', 'Trade/Legal Name_1', 'Document Type*_1', 'Port Code*_1', 'Bill of Entry Number*_1', 'Bill of Entry Date*_1', 'Bill of Entry Value*', 'Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax Paid', 'Central tax', 'State/UT tax', 'Cess Paid'];
exports.impgaCsvColumns = ['Original Document Type*', 'Original Port Code*', 'Original Bill of Entry Number*', 'Original Bill of Entry Date*', 'Revised Document Type*', 'Revised Port Code*', 'Revised Bill of Entry Number*', 'Revised Bill of Entry Date*','Bill of Entry Value*', 'Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax Paid', 'Central tax', 'State/UT tax', 'Cess Paid'];
exports.impgsezaCSvColumns = ['Original GSTIN of Supplier*', 'Original Trade/Legal Name', 'Original Document Type*', 'Original Port Code*', 'Original Bill of Entry Number*', 'Original Bill of Entry Date*', 'Revised GSTIN of Supplier*', 'Revised Trade/Legal Name', 'Revised Document Type*', 'Revised Port Code*', 'Revised Bill of Entry Number*', 'Revised Bill of Entry Date*', 'Bill of Entry Value*', 'Place of Supply*', 'HSN Code*', 'Rate*', 'Taxable Value*', 'Integrated Tax Paid', 'Central tax', 'State/UT tax', 'Cess Paid'];

exports.misColumns =['Supply relates to Table*','GSTIN of Supplier*','Trade/Legal  Name','Document Type*','Document Number*','Document Date*','Document Value*','Place of Supply*','Differential % of Tax Rate*','Supply Covered Under Sec 7 of IGST Act*','Is supplier eligible to claim refund*','HSN Code*','Rate*','Taxable Value*','Integrated Tax','Central Tax','State/UT Tax','Cess'];
exports.misColumnsHSNnonMand =['Supply relates to Table*','GSTIN of Supplier*','Trade/Legal  Name','Document Type*','Document Number*','Document Date*','Document Value*','Place of Supply*','Differential % of Tax Rate*','Supply Covered Under Sec 7 of IGST Act*','Is supplier eligible to claim refund*','HSN Code','Rate*','Taxable Value*','Integrated Tax','Central Tax','State/UT Tax','Cess'];
//for schema json
exports.schemaObject = {
    "b2bctin":'Recipient GSTIN/UIN',
    "trdnm":'Trade/Legal name',
    "boenum":'Bill of Entry Number',
    "igst":'Integrated Tax',
    "cgst":'Central Tax',
    "sgst":'State/UT Tax',
    "cess":'cess',
    "date":'Document Date',
    "diffprcnt":'Differential % of Tax Rate',
    "doctyp":'Document Type',
    "impgdoctyp":'Document Type',
    "impshsn":'HSN Code',
    "negtxval":'Taxable Value',
    "negigst":'Integrated Tax',
    "negsgst":'State/UT Tax',
    "negcgst":'Central Tax',
    "negcess":'cess',
    "doc.num":'Document Number',
    "pan":'GSTIN/PAN of Supplier*',
    "pcode":'Port Code',
    "pos":'Place of Supply',
    "hsn": 'HSN Code',
    "postxval":'Taxable Value',
    "rate":'Rate',
    "revctintypeG":'Supplier GSTIN/PAN',
    "revctintypeP":'Supplier GSTIN/PAN',
    "revsupplytyp":'Supply Type',
    "rtnprd":'Return Period',
    "etin":'Ecommerce CTIN',
    "ctin": 'Recipient GSTIN',
    "txval": 'Taxable Value',
    "doc.dt":'Document Date',
    "val":'Document Value',
    "sec7act":'Supply Covered Under Sec 7 of IGST Act',
    "nsup":'Net Value of Supplies',
    "sup":'Value of supplies made',
    "supr":'Value of Suppies Returned',
    "sb.dt":'Shipping bill date',
    "sb.num":'Shipping bill number',
    "gstin":'Supplier GSTIN',
    "boe.dt":'Bill of Entry Date',
    "boe.num":'Bill of Entry Number',
    "boe.val":'Bill of Entry Value',
    "data.ctin":'Recipient GSTIN',
    "odoc.num":'Document Number',
    "odoc.dt":'Document Date',
    "odoctyp":'Document Type',
    "doc.val":'Document Value',
    "odoc.pcode":'Original Port Code',
    "oboe.num":'Original Bill of Entry Number',
    "oboe.dt":'Original Bill of Entry Date',
    "octin":'Original GSTIN of Supplier',
    "otrdnm":'Original Trade/Legal Name',
    "suptyp": 'Supply Type',
    "rev_boe_date": 'Revised Bill of Entry Date',
    "org_boe_date": 'Original Bill of Entry Date',
    "rev_boe_num": 'Revised Bill of Entry Number*',
    "org_boe_num": 'Revised Bill of Entry Number*',
    "org_pcode": "Original Port Code",
    "rev_pcode": "Revised Port Code",
    "rev_doc_dt": "Revised Document Date",
    "org_doc_dt": "Original Document Date",
    "rev_doc_num": "Revised Document Number",
    "org_doc_num": "Original Document Number"
} 

exports.rev_ctin_sup = 'Revised GSTIN of Supplier*';
exports.rev_pcode_mand = 'Revised Port Code*';
exports.rev_boe_num = 'Revised Bill of Entry Number*';
exports.rev_boe_date = 'Revised Bill of Entry Date*';

