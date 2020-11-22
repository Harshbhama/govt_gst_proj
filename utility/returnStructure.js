/**
 *  @author:   Prakash Kaphle
 *  @created:   July 2019
 *  @description: Anx1 Offline utility
 *  @copyright: (c) Copyright by Infosys technologies
 *  version GST1.00
 *  Last Updated:  Prakash Kaphle, July 16 2019
 **/
let extend = require('node.extend');
let angular = require('../utility/angularHelper');
const validateExcel = require('../utility/validateExcelImp');
const logger = require('../utility/logger').logger;
const impconst = require('../utility/impConstants');
const { calSupTypeFor3A, calSupTypeFor3B, calSupTypeFor3BA, calSupTypeFor3G, calSupTypeFor3H, getStateCodeFromPOS } = require("../utility/common");
//let moment = require('moment');

//This function converts string to number
let cnvt2Nm = function (s) {
    // var reg = new RegExp('^[-.0-9]*$');
    var reg = new RegExp('^-?[.0-9]*$');
    // var reg = new RegExp('^[-+]?\d+(\.\d+)?$');
    if (!s)
        return 0;
    if (s == '')
        return 0;
    if (!reg.test(s)) // Simply means number contains string - Json validation takes precedence
        return s;
    s = parseFloat(s);
    s = s.toFixed(2);
    s = parseFloat(s);
    return s;
}
//This functtion validates the checksum for ctin
function checkGstn(gst) {
    let factor = 2,
        sum = 0,
        checkCodePoint = 0,
        i, j, digit, mod, codePoint, cpChars, inputChars;
    cpChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    inputChars = gst.trim().toUpperCase();
    mod = cpChars.length;
    for (i = inputChars.length - 1; i >= 0; i = i - 1) {
        codePoint = -1;
        for (j = 0; j < cpChars.length; j = j + 1) {
            if (cpChars[j] === inputChars[i]) {
                codePoint = j;
            }
        }
        digit = factor * codePoint;
        factor = (factor === 2) ? 1 : 2;
        digit = (digit / mod) + (digit % mod);
        sum += Math.floor(digit);
    }
    checkCodePoint = ((mod - (sum % mod)) % mod);

    return gst + cpChars[checkCodePoint];
};
//This function validates the ctin pattern
function isCtinPttrnValid(ctin, pttrn) {
    if (testPattern(ctin, pttrn)) {
        var substrgst = ctin.substr(0, 14);
        if (ctin === checkGstn(substrgst)) {
            return true;
        }
    }
    return false;
};
function testPattern(iString, iPattern) {
    var patt = new RegExp(iPattern),
        isPatternValid = patt.test(iString);
    return isPatternValid;
}
//To validate GSTIN/UIN
function validateGSTIN(ctin, iForm) {
    let gstinPttrn = impconst.gstin_ptrn;
    let uinPttrn = impconst.uin_ptrn;
    let tdsPttrn = impconst.tds_ptrn;
    let tcsPttrn = impconst.tcs_ptrn;
    let nriPttrn = impconst.nri_ptrn;
    var validGstin = false;
    if (iForm == 'ANX1') {
        //validGstin = isCtinPttrnValid(ctin,gstinPttrn) || isCtinPttrnValid(ctin,uinPttrn) ||isCtinPttrnValid(ctin,tdsPttrn)
        //|| isCtinPttrnValid(ctin,tcsPttrn) || isCtinPttrnValid(ctin,nriPttrn);
        validGstin = (ctin) ? (ctin.length == 15 ? true : false) : false;
    }
    else {
        //validGstin = isCtinPttrnValid(ctin,gstinPttrn);
        validGstin = (ctin) ? (ctin.length == 15 ? true : false) : false;
    }
    return validGstin;
}
//This function sets the document level properties , and returns function
let getInv = function (iSec, iForm, shareData) {
    logger.log('debug', 'Entering returnStructure :: getInv');
    let rtFn = null, comonObj;

    if (iForm == "ANX1") {
        switch (iSec) {
            case 'REV':

                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }

                    comonObj = {
                        "sec7act": ((inv[impconst.sup_cov_sec7]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_pan_sup],
                        "trdnm": inv[impconst.trade_name],
                        //"flag" : "U",
                        "type": validateExcel.getSupplierType(inv[impconst.ctin_pan_sup]),
                        //   "suptyp":(inv[impconst.sup_typ]=='Inter-State')?'inter':'intra',
                        "suptyp": calSupTypeFor3H(inv[impconst.ctin_pan_sup],
                            getStateCodeFromPOS(inv[impconst.pos]),
                            inv[impconst.sup_cov_sec7],
                            shareData.issez,
                            inv[impconst.sup_typ]) == 'Inter-State' ? 'inter' : 'intra',
                        "items": [itemFn(i, inv)]
                    }
                    if (comonObj.type == 'G') {
                        delete comonObj.suptyp;
                    }

                    return comonObj;

                }
                break;

            case 'B2C':

                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }

                    comonObj = {
                        "sec7act": ((inv[impconst.sup_cov_sec7]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_pan_sup],
                        //"flag" : "U",
                        "items": [itemFn(i, inv)]
                    }

                    return comonObj;
                }
                break;
            case 'B2B':

                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null, diffval = true;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        diffval = false;
                    }

                    comonObj = {
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        "sec7act": ((inv[impconst.sup_cov_sec7]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_uin_rec],
                        "trdnm": inv[impconst.trade_name],
                        //"flag" : "U",
                        "doc": {
                            "num": (inv[impconst.doc_num]) ? (inv[impconst.doc_num]).toString() : null,
                            "dt": inv[impconst.doc_date],
                            "val": cnvt2Nm(inv[impconst.doc_val])
                        },
                        "items": [itemFn(i, inv)]
                    }


                    return comonObj;

                }
                break;
            case 'EXP':
                rtFn = function (i, inv, itemFn) {
                    comonObj = {
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        "exptype": inv[impconst.exp_typ],
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        //"flag" : "U",
                        "doc": {
                            "num": (inv[impconst.doc_num]) ? (inv[impconst.doc_num]).toString() : null,
                            "dt": inv[impconst.doc_date],
                            "val": cnvt2Nm(inv[impconst.doc_val])
                        },
                        "sb": {
                            "num": (inv[impconst.ship_num]) ? (inv[impconst.ship_num]).toString() : null,
                            "pcode": (inv[impconst.pcode_opt]) ? (inv[impconst.pcode_opt]).toString() : null,
                            "dt": inv[impconst.ship_date]

                        },
                        "items": [itemFn(i, inv)]
                    }

                    return comonObj;
                }
                break;
            case 'SEZ':
                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }

                    comonObj = {
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        "seztype": inv[impconst.gst_pay_typ],
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_rec],
                        "trdnm": inv[impconst.trade_name],
                        //"flag" : "U",
                        "clmrfnd": ((inv[impconst.clm_rfnd]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        "doc": {
                            "num": (inv[impconst.doc_num]) ? (inv[impconst.doc_num]).toString() : null,
                            "dt": inv[impconst.doc_date],
                            "val": cnvt2Nm(inv[impconst.doc_val])
                        },

                        "items": [itemFn(i, inv)]
                    }
                    if ((comonObj.seztype).toUpperCase() == 'WOPAY') {
                        delete comonObj.clmrfnd;
                        //delete comonObj.diffprcnt;
                    }
                    return comonObj;
                }
                break;
            case 'DE':
                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null, diffval = true;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        diffval = false;
                    }

                    comonObj = {
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        "sec7act": ((inv[impconst.sup_cov_sec7]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_rec],
                        "trdnm": inv[impconst.trade_name],
                        //"flag" : "U",
                        "clmrfnd": ((inv[impconst.clm_rfnd]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        "doc": {
                            "num": (inv[impconst.doc_num]) ? (inv[impconst.doc_num]).toString() : null,
                            "dt": inv[impconst.doc_date],
                            "val": cnvt2Nm(inv[impconst.doc_val])
                        },

                        "items": [itemFn(i, inv)]
                    }


                    return comonObj;
                }
                break;
            case 'IMPS':
                rtFn = function (i, inv, itemFn) {
                    comonObj = {
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        //"flag" : "U",
                        "items": [itemFn(i, inv)]
                    }
                    return comonObj;
                }
                break;
            case 'IMPG':
                rtFn = function (i, inv, itemFn) {
                    comonObj = {
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        //"flag" : "U",
                        "boe": {
                            "num": (inv[impconst.boe_num]) ? (inv[impconst.boe_num]).toString() : null,
                            "pcode": (inv[impconst.pcode_mand]) ? (inv[impconst.pcode_mand]).toString() : null,
                            "dt": inv[impconst.boe_date],
                            "val": cnvt2Nm(inv[impconst.boe_val])
                        },
                        "items": [itemFn(i, inv)]
                    }
                    return comonObj;
                }
                break;
            case 'IMPGSEZ':
                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null, diffval = true;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        diffval = false;
                    }

                    comonObj = {
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        //"flag" : "U",
                        "ctin": inv[impconst.ctin_sup],
                        "trdnm": inv[impconst.trade_name],
                        "boe": {
                            "num": (inv[impconst.boe_num]) ? (inv[impconst.boe_num]).toString() : (inv[impconst.boe_num] == 0 ? '0' : null),
                            "pcode": (inv[impconst.pcode_mand]) ? (inv[impconst.pcode_mand]).toString() : null,
                            "dt": inv[impconst.boe_date],
                            "val": cnvt2Nm(inv[impconst.boe_val])
                        },

                        "items": [itemFn(i, inv)]
                    }
                    return comonObj;

                }
                break;
            case 'MIS':
                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null, diffval = true;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        diffval = false;
                    }

                    comonObj = {
                        "sec7act": ((inv[impconst.sup_cov_sec7]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        "doctyp": getDoctype(inv[impconst.doc_type]),
                        "tblref": getSecref(inv[impconst.supply_related_to]),
                        "clmrfnd": ((inv[impconst.sup_eligible_clm_rfnd]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        //"rfndelg": "Y",
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_sup],
                        "trdnm": inv[impconst.trade_name],
                        //"flag" : "U",
                        "doc": {
                            "num": (inv[impconst.doc_num]) ? (inv[impconst.doc_num]).toString() : null,
                            "dt": inv[impconst.doc_date],
                            "val": cnvt2Nm(inv[impconst.doc_val])
                        },

                        "items": [itemFn(i, inv)]
                    }
                    return comonObj;
                }
                break;
            case 'ECOM':
                rtFn = function (i, inv, itemFn) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }
                    comonObj = {
                        "etin": inv[impconst.ctin_ecom],
                        "trdnm": inv[impconst.trade_name],
                        //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                        "sup": inv[impconst.val_of_sup] ? cnvt2Nm(inv[impconst.val_of_sup]) : 0,
                        "supr": inv[impconst.val_of_ret] ? cnvt2Nm(inv[impconst.val_of_ret]) : 0,
                        "nsup": validateExcel.getTaxAmount(inv, impconst.net_val_sup, diffFactor),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    }
                    if (comonObj.cess == null || comonObj.cess == undefined || comonObj == '') {
                        delete comonObj.cess;
                    }
                    return comonObj;
                }
                break;
                case 'ECOM':
                        rtFn = function (i, inv, itemFn) {
                            let diffFactor = 1.00;
                            if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                                diffFactor = (inv[impconst.diff_prcnt]/100).toFixed(2);
                            }
                            else{
                                diffFactor=1.00;
                            }
                            comonObj = { 
                                "etin": inv[impconst.ctin_ecom],
                                "trdnm":inv[impconst.trade_name],
                                //"chksum": "0dbdc754fbb79bf3eba1207a9bd0e21d27d3bf0935eaf8d58a29f0db32cef279",
                                "sup": inv[impconst.val_of_sup]?cnvt2Nm(inv[impconst.val_of_sup]):0,
                                "supr" :inv[impconst.val_of_ret]?cnvt2Nm(inv[impconst.val_of_ret]):0,
                                "nsup": validateExcel.getTaxAmount(inv,impconst.net_val_sup,diffFactor),
                                "igst": validateExcel.getTaxAmount(inv,impconst.igst,diffFactor),
                                "cgst": (validateExcel.getTaxAmount(inv,impconst.cgst,diffFactor)),
                                "sgst": (validateExcel.getTaxAmount(inv,impconst.sgst,diffFactor)),
                                "cess": inv[impconst.cess]?cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)):null
                            }
                            if(comonObj.cess==null || comonObj.cess==undefined || comonObj ==''){
                                delete comonObj.cess;
                            }
                            return comonObj;
                        }
                break;


            case 'B2BAO':
                //console.log('entered b2bao',rtFn);
                rtFn = function (i, inv, itemFn) {
                    let diffFactor = null, diffval = true;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        diffval = false;
                    }


                    comonObj = {
                        "typ": "O",
                        "odoctyp": getDoctype(inv[impconst.org_doc_type]),
                        "doctyp": getDoctype(inv[impconst.rev_doc_type]),
                        "sec7act": ((inv[impconst.sup_cov_sec7]).toUpperCase()) === 'YES' ? 'Y' : 'N',
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "octin": inv[impconst.org_ctin_uin_rec],
                        "ctin": inv[impconst.rev_ctin_uin_rec],
                        "otrdnm": inv[impconst.org_trade_name],
                        "trdnm": inv[impconst.rev_trade_name],

                        "doc": {
                            "num": (inv[impconst.rev_doc_num]) ? (inv[impconst.rev_doc_num]).toString() : null,
                            "dt": inv[impconst.rev_doc_date],
                            "val": cnvt2Nm(inv[impconst.doc_val])
                        },
                        "odoc": {
                            "num": (inv[impconst.org_doc_num]) ? (inv[impconst.org_doc_num]).toString() : null,
                            "dt": inv[impconst.org_doc_date]
                        },
                        "items": [itemFn(i, inv)]
                    }

                    //console.log("comonObj get::", comonObj)
                    return comonObj;

                }
                break;
        }
    } else if (iForm == "ANX1A") {

        switch (iSec) {
            case 'B2CA':
                rtFn = function (i, inv, itemFnA) {

                    let diffFactor = null;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }

                    let sec7var = inv[impconst.sup_cov_sec7];
                    if ((inv[impconst.sup_cov_sec7]).toUpperCase() === 'YES') {
                        sec7var = 'Y'
                    } else if ((inv[impconst.sup_cov_sec7]).toUpperCase() === 'NO') {
                        sec7var = 'N'
                    }
                    comonObj = {
                        "sec7act": sec7var,
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_pan_sup],
                        "items": [itemFnA(i, inv)]
                    }
                    //  console.log('comonObj B2CA', comonObj);
                    return comonObj;
                }
                break;
            case 'EXPA':
                rtFn = function (i, inv, itemFnA) {
                    // console.log('inv EXPA', inv);
                    if (inv[impconst.doc_type + '_1']) {
                        // doctyp = inv[impconst.doc_type+'_1']
                        // docnum = inv[impconst.doc_num+'_1']
                        // docdt = inv[impconst.doc_date+'_1']
                        // odoctyp = inv[impconst.doc_type]
                        // odocnum = inv[impconst.doc_num]
                        // odocdt = inv[impconst.doc_date]

                        comonObj = {
                            "doctyp": getDoctype(inv[impconst.doc_type + '_1']),
                            "odoctyp": getDoctype(inv[impconst.doc_type]),
                            "exptype": inv[impconst.exp_typ],
                            "doc": {
                                "num": (inv[impconst.doc_num + '_1']) ? (inv[impconst.doc_num + '_1']).toString() : null,
                                "dt": inv[impconst.doc_date + '_1'],
                                "val": cnvt2Nm(inv[impconst.doc_val])
                            },
                            "odoc": {
                                "num": (inv[impconst.doc_num]) ? (inv[impconst.doc_num]).toString() : null,
                                "dt": inv[impconst.doc_date]
                            },
                            "sb": {
                                "num": (inv[impconst.ship_num]) ? (inv[impconst.ship_num]).toString() : null,
                                "pcode": (inv[impconst.pcode_opt]) ? (inv[impconst.pcode_opt]).toString() : null,
                                "dt": inv[impconst.ship_date]

                            },
                            "items": [itemFnA(i, inv)]
                        }
                    } else {
                        comonObj = {
                            "doctyp": getDoctype(inv[impconst.rev_doc_type]),
                            "odoctyp": getDoctype(inv[impconst.odoc_type]),
                            "exptype": inv[impconst.exp_typ],
                            "doc": {
                                "num": (inv[impconst.rev_doc_num]) ? (inv[impconst.rev_doc_num]).toString() : null,
                                 "dt": inv[impconst.rev_doc_date],
								"val": cnvt2Nm(inv[impconst.doc_val])
                            },
                            "odoc": {
                                "num": (inv[impconst.odoc_num]) ? (inv[impconst.odoc_num]).toString() : null,
                                "dt": inv[impconst.odoc_date]
                            },
                            "sb": {
                                "num": (inv[impconst.ship_num]) ? (inv[impconst.ship_num]).toString() : null,
                                "pcode": (inv[impconst.pcode_opt]) ? (inv[impconst.pcode_opt]).toString() : null,
                                "dt": inv[impconst.ship_date]

                            },
                            "items": [itemFnA(i, inv)]
                        }
                    }


                    // console.log('comonObj EXPA', comonObj);
                    return comonObj;
                }
                break;
            case 'REVA':

                rtFn = function (i, inv, itemFn) {

                    let diffFactor = null;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }
                    let sec7var = inv[impconst.sup_cov_sec7];
                    if ((inv[impconst.sup_cov_sec7]).toUpperCase() === 'YES') {
                        sec7var = 'Y'
                    } else if ((inv[impconst.sup_cov_sec7]).toUpperCase() === 'NO') {
                        sec7var = 'N'
                    }
                    console.log("inv[impconst.sup_typ]", inv[impconst.sup_typ]);
                    let suptypevar =   calSupTypeFor3H(inv[impconst.ctin_pan_sup],
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez, inv[impconst.sup_typ])
                        console.log('suptypevar', suptypevar);

                    if (suptypevar.toUpperCase() === 'INTER-STATE') {
                        suptypevar = 'inter'
                    } else if (suptypevar.toUpperCase() === 'INTRA-STATE') {
                        suptypevar = 'intra'
                    } 
                    comonObj = {
                        "sec7act": sec7var,
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "diffprcnt": cnvt2Nm(diffFactor),
                        "ctin": inv[impconst.ctin_pan_sup].toUpperCase(),
                        "trdnm": inv[impconst.trade_name],
                        "type": validateExcel.getSupplierType(inv[impconst.ctin_pan_sup]),
                        "suptyp": chksupType(suptypevar),
                            // inv[impconst.sup_typ]) == 'Inter-State' ? 'inter' : 'intra',
                        "items": [itemFn(i, inv)]
                    }
                    if (comonObj.type == 'G') {
                        delete comonObj.suptyp;
                    }
                    return comonObj;

                }
                break;
            case 'IMPSA':
                rtFn = function (i, inv, itemFn) {
                    comonObj = {
                        "pos": (inv[impconst.pos]).substring(0, 2),
                        "items": [itemFn(i, inv)]
                    }
                    return comonObj;
                }
                break;
            case 'ECOMA':

                rtFn = function (i, inv, itemFn) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    }
                    else {
                        diffFactor = 1.00;
                    }
                    comonObj = {
                        "etin": inv[impconst.ctin_ecom].toUpperCase(),
                        "trdnm": inv[impconst.trade_name],
                        "sup": inv[impconst.val_of_sup] ? cnvt2Nm(inv[impconst.val_of_sup]) : 0,
                        "supr": inv[impconst.val_of_ret] ? cnvt2Nm(inv[impconst.val_of_ret]) : 0,
                        "nsup": validateExcel.getTaxAmount(inv, impconst.net_val_sup, diffFactor),
                        // "igst": validateExcel.getTaxAmountA(csvCheckForISCgst(inv), impconst.igst, diffFactor),
                        // "cgst": (validateExcel.getTaxAmountA(csvCheckForISCgst(inv), impconst.cgst, diffFactor)),
                        // "sgst": (validateExcel.getTaxAmountA(csvCheckForISCgst(inv), impconst.sgst, diffFactor)),
                        "igst": inv[impconst.igst] ? cnvt2Nm(inv[impconst.igst]) : null,
                        "cgst": inv[impconst.cgst] ? cnvt2Nm(inv[impconst.cgst]) : null,
                        "sgst": inv[impconst.sgst] ? cnvt2Nm(inv[impconst.sgst]) : null,
                        "cess": inv[impconst.cess] ? cnvt2Nm(inv[impconst.cess]) : null
                    }
                    if (comonObj.cess == null || comonObj.cess == undefined || comonObj == '') {
                        delete comonObj.cess;
                    }
                    if (isNaN(comonObj.nsup)) {
                        comonObj.nsup = 0;
                    }
                    return comonObj;
                }
                break;
            case 'IMPGA':
                rtFn = function (i, inv, itemFn) {
                    //  console.log('IN INV IMPGA', inv);
                    if (inv[impconst.doc_type + '_1']) {
                        comonObj = {
                            "doctyp": getDoctype(inv[impconst.doc_type + '_1']),
                            "odoctyp": getDoctype(inv[impconst.doc_type]),
                            "pos": (inv[impconst.pos]).substring(0, 2),
                            "boe": {
                                "num": (inv[impconst.boe_num + '_1']) ? (inv[impconst.boe_num + '_1']).toString() : null,
                                "pcode": (inv[impconst.pcode_mand + '_1']) ? (inv[impconst.pcode_mand + '_1']).toString() : null,
                                "dt": inv[impconst.boe_date + '_1'],
                                "val": cnvt2Nm(inv[impconst.boe_val])
                            },
                            "oboe": {
                                "num": (inv[impconst.boe_num]) ? (inv[impconst.boe_num]).toString() : null,
                                "pcode": (inv[impconst.pcode_mand]) ? (inv[impconst.pcode_mand]).toString() : null,
                                "dt": inv[impconst.boe_date]
                            },
                            "items": [itemFn(i, inv)]
                        }
                    } else {
                        comonObj = {
                            "doctyp": getDoctype(inv[impconst.rev_doc_type]),
                            "odoctyp": getDoctype(inv[impconst.odoc_type]),
                            "pos": (inv[impconst.pos]).substring(0, 2),
                            "boe": {
                                "num": (inv[impconst.rev_boe_num]) ? (inv[impconst.rev_boe_num]).toString() : null,
                                "pcode": (inv[impconst.rev_pcode_mand]) ? (inv[impconst.rev_pcode_mand]).toString() : null,
                                "dt": inv[impconst.rev_boe_date],
								"val": cnvt2Nm(inv[impconst.boe_val])
                            },
                            "oboe": {
                                "num": (inv[impconst.oboe_num]) ? (inv[impconst.oboe_num]).toString() : null,
                                "pcode": (inv[impconst.opcode_mand]) ? (inv[impconst.opcode_mand]).toString() : null,
                                "dt": inv[impconst.oboe_date]
                            },
                            "items": [itemFn(i, inv)]
                        }
                    }
                    return comonObj;
                }
                break;
            case 'IMPGSEZA':
                rtFn = function (i, inv, itemFn) {

                    let diffFactor = null, diffval = true;
                    if (inv.hasOwnProperty(impconst.diff_prcnt)) {
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        diffval = false;
                    }

                    if (inv[impconst.doc_type + '_1']) {
                        comonObj = {
                            "doctyp": getDoctype(inv[impconst.doc_type + '_1']),
                            "odoctyp": getDoctype(inv[impconst.doc_type]),
                            "pos": (inv[impconst.pos]).substring(0, 2),
                            "ctin": inv[impconst.ctin_sup + '_1'],
                            "trdnm": inv[impconst.trade_name + '_1'],
                            "octin": inv[impconst.ctin_sup],
                            "otrdnm": inv[impconst.trade_name],
                            "boe": {
                                "num": (inv[impconst.boe_num + '_1']) ? (inv[impconst.boe_num + '_1']).toString() : (inv[impconst.boe_num + '_1'] == 0 ? '0' : null),
                                "pcode": (inv[impconst.pcode_mand + '_1']) ? (inv[impconst.pcode_mand + '_1']).toString() : null,
                                "dt": inv[impconst.boe_date + '_1'],
                                "val": cnvt2Nm(inv[impconst.boe_val])
                            },
                            "oboe": {
                                "num": (inv[impconst.boe_num]) ? (inv[impconst.boe_num]).toString() : (inv[impconst.boe_num] == 0 ? '0' : null),
                                "pcode": (inv[impconst.pcode_mand]) ? (inv[impconst.pcode_mand]).toString() : null,
                                "dt": inv[impconst.boe_date]
                            },

                            "items": [itemFn(i, inv)]
                        }
                    } else {
                        comonObj = {
                            "doctyp": getDoctype(inv[impconst.rev_doc_type]),
                            "odoctyp": getDoctype(inv[impconst.odoc_type]),
                            "pos": (inv[impconst.pos]).substring(0, 2),
                            "ctin": inv[impconst.rev_ctin_sup],
                            "trdnm": inv[impconst.rev_trade_name],
                            "octin": inv[impconst.octin_sup],
                            "otrdnm": inv[impconst.otrade_name],
                            "boe": {
                                "num": (inv[impconst.rev_boe_num]) ? (inv[impconst.rev_boe_num]).toString() : (inv[impconst.rev_boe_num] == 0 ? '0' : null),
                                "pcode": (inv[impconst.rev_pcode_mand]) ? (inv[impconst.rev_pcode_mand]).toString() : null,
                                "dt": inv[impconst.rev_boe_date],
								"val": cnvt2Nm(inv[impconst.boe_val])
                            },
                            "oboe": {
                                "num": (inv[impconst.oboe_num]) ? (inv[impconst.oboe_num]).toString() : (inv[impconst.oboe_num] == 0 ? '0' : null),
                                "pcode": (inv[impconst.opcode_mand]) ? (inv[impconst.opcode_mand]).toString() : null,
                                "dt": inv[impconst.oboe_date]
                            },

                            "items": [itemFn(i, inv)]
                        }
                    }
                    //    console.log('comonObj IMPSEZA', comonObj);
                    return comonObj;

                }
                break;
        }
    }
    logger.log('debug', 'Exiting returnStructure :: getInv');
    return rtFn;
}

// This function sets the item level properties , and returns function
let getItm = function (iSec, iForm, shareData) {
    logger.log("debug", "Entering returnStructure.js:: getItm");
    let rtFn = null;
    if (iForm == "ANX1") {
        switch (iSec) {
            case 'REV':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3H(inv[impconst.ctin_pan_sup],
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        inv[impconst.sup_typ]);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_opt]) ? (inv[impconst.hsn_opt]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'B2C':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3A(shareData.gstin,
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        null);
                    let itemObj = {
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'B2B':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3B(shareData.gstin,
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        null);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_opt]) ? (inv[impconst.hsn_opt]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'EXP':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {};
                    if ((inv[impconst.exp_typ].toUpperCase()) == 'WPAY') {
                        itemObj = {
                            "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                            "rate": inv[impconst.rate],
                            "txval": cnvt2Nm(inv[impconst.taxable_value]),
                            "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                            "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                        };
                    }
                    else {
                        itemObj = {
                            "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                            "rate": inv[impconst.rate],
                            "txval": cnvt2Nm(inv[impconst.taxable_value])
                        };
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'SEZ':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {};
                    if ((inv[impconst.gst_pay_typ].toUpperCase()) == 'WPAY') {
                        itemObj = {
                            "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                            "rate": inv[impconst.rate],
                            "txval": cnvt2Nm(inv[impconst.taxable_value]),
                            "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                            "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                        };

                    }
                    else {
                        itemObj = {
                            "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                            "rate": inv[impconst.rate],
                            "txval": cnvt2Nm(inv[impconst.taxable_value])
                        };
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'DE':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3G(shareData.gstin,
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        null);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'IMPS':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'IMPG':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst_paid, diffFactor),
                        "cess": inv[impconst.cess_paid] ? cnvt2Nm(parseFloat(inv[impconst.cess_paid]).toFixed(2)) : null
                    };
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'IMPGSEZ':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst_paid, diffFactor),
                        "cess": inv[impconst.cess_paid] ? cnvt2Nm(parseFloat(inv[impconst.cess_paid]).toFixed(2)) : null
                    };
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'MIS':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = validateExcel.calSupType(inv[impconst.ctin_sup],
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        null);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            // case 'ECOM':
            //         rtFn = function (i, inv) {


            //             let diffFactor = 1.00;

            //             if (inv.hasOwnProperty(impconst.diff_prcnt))
            //                 diffFactor = (inv[impconst.diff_prcnt]/100).toFixed(2);
            //                   let itemObj = {
            //                         "igst":(parseFloat((inv[impconst.igst] * diffFactor).toFixed(2))),
            //                         "cgst": (parseFloat((inv[impconst.cgst]  * diffFactor).toFixed(2))),
            //                         "sgst":  (parseFloat((inv[impconst.sgst]  * diffFactor).toFixed(2))),
            //                         "cess": cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2))

            //};
            //                 return itemObj;


            //         }
            // break;
            case 'B2BAO':
                // console.log("rtFn ::",rtFn)
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3BA(shareData.gstin,
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        null);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_opt]) ? (inv[impconst.hsn_opt]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(inv, impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(inv, impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(inv, impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(parseFloat(inv[impconst.cess]).toFixed(2)) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;

            default:
                rtFn = null
                break;
        }
    } else if (iForm == "ANX1A") {
        switch (iSec) {
            case 'B2CA':

                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3A(shareData.gstin,
                        getStateCodeFromPOS(inv[impconst.pos]),
                        //    inv[impconst.pos], 
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        null);
                    let itemObj = {
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(inv[impconst.cess]) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'EXPA':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv[impconst.doc_type + '_1']) {
                        if (inv.hasOwnProperty(impconst.diff_prcnt))
                            diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        let itemObj = {};
                        if ((inv[impconst.exp_typ].toUpperCase()) == 'WPAY') {
                            itemObj = {
                                "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                                "rate": inv[impconst.rate],
                                "txval": cnvt2Nm(inv[impconst.taxable_value]),
                                "igst": validateExcel.getTaxAmountA(csvCheckForISCgst2(inv), impconst.igst, diffFactor),
                                "cess": inv[impconst.cess] ? cnvt2Nm(inv[impconst.cess]) : null
                            };
                        }
                        else {
                            itemObj = {
                                "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                                "rate": inv[impconst.rate],
                                "txval": cnvt2Nm(inv[impconst.taxable_value])
                            };
                        }
                        if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                            delete itemObj.cess;
                        }
                        // console.log('itemObj', itemObj);
                        return itemObj;
                    } else {
                        if (inv.hasOwnProperty(impconst.diff_prcnt))
                            diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                        let itemObj = {};
                        if ((inv[impconst.exp_typ].toUpperCase()) == 'WPAY') {
                            itemObj = {
                                "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                                "rate": inv[impconst.rate],
                                "txval": cnvt2Nm(inv[impconst.taxable_value]),
                                "igst": validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.igst, diffFactor),
                                "cess": inv[impconst.cess] ? cnvt2Nm(inv[impconst.cess]) : null
                            };
                        }
                        else {
                            itemObj = {
                                "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                                "rate": inv[impconst.rate],
                                "txval": cnvt2Nm(inv[impconst.taxable_value])
                            };
                        }
                        if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                            delete itemObj.cess;
                        }
                        // console.log('itemObj', itemObj);
                        return itemObj;
                    }
                }

                break;
            case 'REVA':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let suptype = calSupTypeFor3H(inv[impconst.ctin_pan_sup],
                        getStateCodeFromPOS(inv[impconst.pos]),
                        inv[impconst.sup_cov_sec7],
                        shareData.issez,
                        inv[impconst.sup_typ]);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_opt]) ? (inv[impconst.hsn_opt]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.igst, diffFactor),
                        "cgst": (validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.cgst, diffFactor)),
                        "sgst": (validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.sgst, diffFactor)),
                        "cess": inv[impconst.cess] ? cnvt2Nm(inv[impconst.cess]) : null
                    };
                    if (suptype == 'Inter-State') {
                        delete itemObj.cgst;
                        delete itemObj.sgst;
                    }
                    else {
                        delete itemObj.igst;
                    }
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'IMPSA':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmount(csvCheckForISCgst(inv), impconst.igst, diffFactor),
                        "cess": inv[impconst.cess] ? cnvt2Nm(inv[impconst.cess]) : null
                    };
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'IMPGA':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmountA(csvCheckForISCgst(inv), impconst.igst_paid, diffFactor),
                        "cess": inv[impconst.cess_paid] ? cnvt2Nm(inv[impconst.cess_paid]) : null
                    };
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;
            case 'IMPGSEZA':
                rtFn = function (i, inv) {
                    let diffFactor = 1.00;
                    if (inv.hasOwnProperty(impconst.diff_prcnt))
                        diffFactor = (inv[impconst.diff_prcnt] / 100).toFixed(2);
                    let itemObj = {
                        "hsn": (inv[impconst.hsn_mand]) ? (inv[impconst.hsn_mand]).toString() : null,
                        "rate": inv[impconst.rate],
                        "txval": cnvt2Nm(inv[impconst.taxable_value]),
                        "igst": validateExcel.getTaxAmountA(csvCheckForISCgst(inv), impconst.igst_paid, diffFactor),
                        "cess": inv[impconst.cess_paid] ? cnvt2Nm(inv[impconst.cess_paid]) : null
                    };
                    if (itemObj.cess == null || itemObj.cess == undefined || itemObj.cess == '') {
                        delete itemObj.cess;
                    }
                    return itemObj;
                }
                break;

            default:
                rtFn = null
                break;
        }
    }
    logger.log("debug", "Exiting returnStructure.js:: getItm");
    return rtFn;
}
//This function converts the response payload into save json format, and returns an object
let formateNodePayload = function (iSec, iForm) {
    logger.log("debug", "Entering returnStructure.js:: formateNodePayload");
    let rtFn = null, rtData;
    if (iForm == "ANX1") {
        switch (iSec) {
            case 'REV':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "type": iData.type,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    delete iData.type;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'B2C':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = iData;
                    return rtData;
                }
                break;
            case 'B2B':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'EXP':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = iData;
                    return rtData;
                }
                break;
            case 'SEZ':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        'seztype': iData.seztype,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.seztype;
                    delete iData.trdnm;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'DE':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'IMPS':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};

                    rtData = iData;
                    return rtData;
                }
                break;
            case 'IMPG':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    rtData = {
                        "pos": iData.pos,
                        //"rfndelg": iData.rfndelg,
                        "docs": []
                    }
                    delete iData.pos;
                    delete iData.rfndelg
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'IMPGSEZ':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'MIS':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "tblref": iData.tblref,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    delete iData.tblref;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'ECOM':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = iData;
                    return rtData;
                }
                break;

            case 'B2BAO':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};

                    rtData = iData;
                    return rtData;

                }
                break;


        }
    } else if (iForm == "ANX1A") {
        switch (iSec) {
            case 'B2CA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = iData;
                    return rtData;
                }
                break;
            case 'EXPA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = iData;
                    return rtData;
                }
                break;
            case 'REVA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "type": iData.type,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    delete iData.type;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'IMPSA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};

                    rtData = iData;
                    return rtData;
                }
                break;
            case 'ECOMA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = iData;
                    return rtData;
                }
                break;
            case 'IMPGA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    rtData = {
                        "pos": iData.pos,
                        //"rfndelg": iData.rfndelg,
                        "docs": []
                    }
                    delete iData.pos;
                    delete iData.rfndelg
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
            case 'IMPGSEZA':
                rtFn = function (oData) {
                    let iData = extend(true, {}, oData);
                    let rtData = {};
                    rtData = {
                        "ctin": iData.ctin,
                        "trdnm": iData.trdnm,
                        "octin": iData.octin,
                        "otrdnm": iData.otrdnm,
                        "docs": []
                    }
                    delete iData.ctin;
                    delete iData.trdnm;
                    delete iData.octin;
                    delete iData.otrdnm;
                    rtData.docs.push(iData);
                    return rtData;
                }
                break;
        }
    }
    logger.log("debug", "Exiting returnStructure.js:: formateNodePayload");
    return rtFn;
}
//To validate mandatory fields n regex patterns for fields from excel
function validateExcelMandatoryFields(iInv, iSecId, iForm, shareData) {
    logger.log("debug", "Entering returnStructure.js:: validateExcelMandatoryFields :%s", iSecId);
    let rtn_prd = shareData.rtnprd;
    let isPttnMthced = false;
    if (iForm == "ANX1") {
        switch (iSecId) {
            case 'REV':
                // if (!iInv[impconst.diff_prcnt]) {
                //     iInv[impconst.diff_prcnt] = 100;
                // }
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    //((validateGSTIN(iInv[impconst.ctin_pan_sup], iForm) &&
                    (validatePattern(iInv[impconst.ctin_pan_sup], true, null, false) || validatePattern(iInv[impconst.ctin_pan_sup], true, null, false)) &&
                    //validatePattern(iInv[impconst.trade_name], false, impconst.trade_name_ptrn,false) &&                         
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    //validatePattern(iInv[impconst.supplier_typ], true, null,false) &&
                    validatePattern(iInv[impconst.sup_cov_sec7], true, null, false)
                    //(iInv[impconst.hsn_opt]?validateExcel.validateHSN(iInv[impconst.hsn_opt]):true)
                );
                break;
            case 'B2C':

                // if (!iInv[impconst.diff_prcnt]) {
                //     iInv[impconst.diff_prcnt] = 100;
                // }

                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.sup_cov_sec7], true, null, false)
                );


                break;
            case 'B2B':
                // if (!iInv[impconst.diff_prcnt]) {
                //     iInv[impconst.diff_prcnt] = 100;
                // }
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    //validateGSTIN(iInv[impconst.ctin_uin_rec], iForm) &&
                    validatePattern(iInv[impconst.ctin_uin_rec], true, null, false) &&
                    //validatePattern(iInv[impconst.trade_name], false, impconst.trade_name_ptrn,false) &&                         
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.doc_type], true, null, false) &&
                    validatePattern(iInv[impconst.doc_num], true, null, false) &&
                    validatePattern(iInv[impconst.doc_date], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                    validatePattern(iInv[impconst.doc_val], true, null, false) &&
                    validatePattern(iInv[impconst.sup_cov_sec7], true, null, false)
                    //validateExcel.validateHSN(iInv[impconst.hsn_opt])
                );
                break;
            case 'EXP':
                isPttnMthced = (
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.doc_type], true, null, false) &&
                    validatePattern(iInv[impconst.doc_num], true, null, false) &&
                    validatePattern(iInv[impconst.doc_val], true, null, false) &&
                    validatePattern(iInv[impconst.ship_num], false, null, false) &&
                    validatePattern(iInv[impconst.exp_typ], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                    validatePattern(iInv[impconst.doc_date], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.ship_date],rtn_prd)&&
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                    validatePattern(iInv[impconst.pcode_opt], false, null, false)
                    && validateShippingDetailsCombo(iInv[impconst.ship_date], iInv[impconst.pcode_opt], iInv[impconst.ship_num])
                );
                break;
            case 'SEZ':
                // if (!iInv[impconst.diff_prcnt]) {
                //     iInv[impconst.diff_prcnt] = 100;
                // }
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    //validateGSTIN(iInv[impconst.ctin_rec], iForm) &&
                    validatePattern(iInv[impconst.ctin_rec], true, null, false) &&
                    //validatePattern(iInv[impconst.trade_name], false, impconst.trade_name_ptrn,false) &&                         
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.doc_date], true, null, false) &&
                    validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                    validatePattern(iInv[impconst.doc_type], true, null, false) &&
                    validatePattern(iInv[impconst.doc_num], true, null, false) &&
                    validatePattern(iInv[impconst.doc_val], true, null, false) &&
                    validatePattern(iInv[impconst.gst_pay_typ], true, null, false) &&
                    validatePattern(iInv[impconst.clm_rfnd], true, null, false)
                );
                break;
            case 'DE':
                // if (!iInv[impconst.diff_prcnt]) {
                //     iInv[impconst.diff_prcnt] = 100;
                // }
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    //validateGSTIN(iInv[impconst.ctin_rec], iForm) &&
                    validatePattern(iInv[impconst.ctin_rec], true, null, false) &&
                    //validatePattern(iInv[impconst.trade_name], false, impconst.trade_name_ptrn,false) &&                         
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.doc_date], true, null, false) &&
                    validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                    validatePattern(iInv[impconst.doc_type], true, null, false) &&
                    validatePattern(iInv[impconst.doc_num], true, null, false) &&
                    validatePattern(iInv[impconst.doc_val], true, null, false) &&
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                    validatePattern(iInv[impconst.clm_rfnd], true, null, false)
                );
                break;
            case 'IMPS':
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.hsn_mand], true, null, false)
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])
                );
                break;
            case 'IMPG':
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess_paid]), false, null, false) &&
                    validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                    validatePattern(iInv[impconst.pcode_mand], true, null, false) &&
                    validatePattern(iInv[impconst.boe_num], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.boe_date],rtn_prd)&&
                    validatePattern(iInv[impconst.boe_date], true, null, false) &&
                    validatePattern(iInv[impconst.boe_val], true, null, false) &&
                    validatePattern(iInv[impconst.doc_type], true, null, false)

                );
                break;
            case 'IMPGSEZ':
                isPttnMthced = (
                    //validateGSTIN(iInv[impconst.ctin_sup], iForm) &&
                    validatePattern(iInv[impconst.ctin_sup], true, null, false) &&
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess_paid]), false, null, false) &&
                    validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                    validatePattern(iInv[impconst.pcode_mand], true, null, false) &&
                    validatePattern(iInv[impconst.boe_num], true, null, false) &&
                    validatePattern(iInv[impconst.boe_date], true, null, false) &&
                    //validateExcel.checkDocumentDate(iInv[impconst.boe_date],rtn_prd)&&
                    validatePattern(iInv[impconst.boe_val], true, null, false) &&
                    validatePattern(iInv[impconst.doc_type], true, null, false)
                );
                break;
            case 'MIS':
                // if (!iInv[impconst.diff_prcnt]) {
                //     iInv[impconst.diff_prcnt] = 100;
                // }
                isPttnMthced = (
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                        //validateGSTIN(iInv[impconst.ctin_sup], iForm) &&
                        validatePattern(iInv[impconst.ctin_sup], true, null, false) &&
                        validatePattern(iInv[impconst.sup_eligible_clm_rfnd], true, null, false) &&
                        //validatePattern(iInv[impconst.trade_name], false, impconst.trade_name_ptrn,false) &&                         
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                        validatePattern(iInv[impconst.doc_date], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                        validatePattern(iInv[impconst.doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.doc_num], true, null, false) &&
                        validatePattern(iInv[impconst.doc_val], true, null, false) &&
                        (iInv[impconst.supply_related_to] !== '3B (B2B)') ? validatePattern(iInv[impconst.hsn_mand], true, null, false) : validatePattern(iInv[impconst.hsn_mand], false, null, false)
                    //validateExcel.validateHSN(iInv[impconst.hsn_opt])
                );
                break;
            case 'ECOM':
                isPttnMthced = (
                    //validateExcel.validateEcomGSTIN(iInv[impconst.ctin_ecom]) &&
                    validatePattern(iInv[impconst.ctin_ecom], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.val_of_sup], true, null, false) &&
                    validatePattern(iInv[impconst.val_of_ret], true, null, false)
                );
                break;
            case 'B2BAO':
                //console.log("iInv vheck",iInv)
                isPttnMthced = (
                    validatePattern(iInv[impconst.org_ctin_uin_rec], true, null, false) &&
                    validatePattern(iInv[impconst.org_doc_type], true, null, false) &&
                    validatePattern(iInv[impconst.org_doc_num], true, null, false) &&
                    validatePattern(iInv[impconst.org_doc_date], true, null, false) &&
                    validatePattern(iInv[impconst.rev_ctin_uin_rec], true, null, false) &&
                    validatePattern(iInv[impconst.rev_doc_type], true, null, false) &&
                    validatePattern(iInv[impconst.rev_doc_num], true, null, false) &&
                    validatePattern(iInv[impconst.rev_doc_date], true, null, false) &&
                    validatePattern(iInv[impconst.doc_val], true, null, false) &&
                    validatePattern(iInv[impconst.pos], true, null, true) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    validatePattern(iInv[impconst.sup_cov_sec7], true, null, false) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false)
                );

                break;

        }
        // console.log("isPttnMthced", isPttnMthced)
    }
     else if (iForm == "ANX1A") {
        switch (iSecId) {
            case 'REVA':
                let panSupCheck = false;
                if(iInv[impconst.ctin_pan_sup].length == 10){
                    panSupCheck = true;
                }
               
                if (!iInv[impconst.diff_prcnt]) {
                    iInv[impconst.diff_prcnt] = 100;
                }
                isPttnMthced = (
                    checkForMandatory(iInv[impconst.pos]) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    //((validateGSTIN(iInv[impconst.ctin_pan_sup], iForm) &&
                    (validatePattern(iInv[impconst.ctin_pan_sup], true, null, false) || validatePattern(iInv[impconst.ctin_pan_sup], true, null, false)) &&
                    //validatePattern(iInv[impconst.trade_name], false, impconst.trade_name_ptrn,false) &&                         
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    // validatePattern(iInv[impconst.supplier_typ], true, null,false) &&
                    validatePattern(iInv[impconst.sup_cov_sec7], true, null, false)
                    //(iInv[impconst.hsn_opt]?validateExcel.validateHSN(iInv[impconst.hsn_opt]):true)
                );
                if(panSupCheck == true) {
                    isPttnMthced =  isPttnMthced && checkForMandatory(iInv[impconst.sup_typ]); 
               }

                break;
            case 'B2CA':
                isPttnMthced = (
                    checkForMandatory(iInv[impconst.pos]) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.diff_prcnt], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.sup_cov_sec7], true, null, false)
                );
                break;
            case 'EXPA':
                if (iInv[impconst.doc_type + '_1']) {

                    isPttnMthced = (
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                        validatePattern(iInv[impconst.doc_type + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.doc_num + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.doc_val], true, null, false) &&
                        validatePattern(iInv[impconst.ship_num], false, null, false) &&
                        validatePattern(iInv[impconst.exp_typ], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                        validatePattern(iInv[impconst.doc_date + '_1'], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.ship_date],rtn_prd)&&
                        // validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                        validatePattern(iInv[impconst.hsn_mand],true, null, false)&&
                        validatePattern(iInv[impconst.pcode_opt], false, null, false) &&
                        validatePattern(iInv[impconst.doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.doc_num], true, null, false) &&
                        validatePattern(iInv[impconst.doc_date], true, null, false) &&
                        validateShippingDetailsCombo(iInv[impconst.ship_date], iInv[impconst.pcode_opt], iInv[impconst.ship_num]))
                } else {

                    isPttnMthced = (
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                        // validatePattern(iInv[impconst.doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.rev_doc_type], true, null, false) &&
                        // validatePattern(iInv[impconst.doc_num], true, null, false) &&
                        validatePattern(iInv[impconst.rev_doc_num], true, null, false) &&
                        validatePattern(iInv[impconst.doc_val], true, null, false) &&
                        validatePattern(iInv[impconst.ship_num], false, null, false) &&
                        validatePattern(iInv[impconst.exp_typ], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.doc_date],rtn_prd)&&
                        // validatePattern(iInv[impconst.doc_date], true, null, false) &&
                        validatePattern(iInv[impconst.rev_doc_date], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.ship_date],rtn_prd)&&
                        //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                        validatePattern(iInv[impconst.hsn_mand],true, null, false)&&
                        validatePattern(iInv[impconst.pcode_opt], false, null, false) &&
                        validatePattern(iInv[impconst.odoc_type], true, null, false) &&
                        validatePattern(iInv[impconst.odoc_num], true, null, false) &&
                        validatePattern(iInv[impconst.odoc_date], true, null, false) &&
                        validateShippingDetailsCombo(iInv[impconst.ship_date], iInv[impconst.pcode_opt], iInv[impconst.ship_num])
                    );
                }

                break;
            case 'IMPSA':
                isPttnMthced = (
                    checkForMandatory(iInv[impconst.pos]) &&
                    validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                    validatePattern(iInv[impconst.rate], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.hsn_mand], true, null, false)
                    //validateExcel.validateHSN(iInv[impconst.hsn_mand])
                );
                break;
            case 'IMPGA':
                if (iInv[impconst.doc_type + '_1']) {
                    isPttnMthced = (
                        checkForMandatory(iInv[impconst.pos]) &&
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess_paid]), false, null, false) &&
                        validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                        //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                        validatePattern(iInv[impconst.pcode_mand + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.boe_num + '_1'], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.boe_date],rtn_prd)&&
                        validatePattern(iInv[impconst.boe_date + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.boe_val], true, null, false) &&
                        validatePattern(iInv[impconst.doc_type + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.boe_num], true, null, false) &&
                        validatePattern(iInv[impconst.boe_date], true, null, false) &&
                        validatePattern(iInv[impconst.doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.pcode_mand], true, null, false)

                    );
                } else {
                    isPttnMthced = (
                        checkForMandatory(iInv[impconst.pos]) &&
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess_paid]), false, null, false) &&
                        validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                        //validateExcel.validateHSN(iInv[impconst.hsn_mand])&&
                        // validatePattern(iInv[impconst.pcode_mand], true, null, false) &&
                        validatePattern(iInv[impconst.rev_pcode_mand], true, null, false) &&
                        // validatePattern(iInv[impconst.boe_num], true, null, false) &&
                        validatePattern(iInv[impconst.rev_boe_num], true, null, false) &&
                        //validateExcel.checkDocumentDate(iInv[impconst.boe_date],rtn_prd)&&
                        // validatePattern(iInv[impconst.boe_date], true, null, false) &&
                        validatePattern(iInv[impconst.rev_boe_date], true, null, false) &&
                        validatePattern(iInv[impconst.boe_val], true, null, false) &&
                        // validatePattern(iInv[impconst.doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.rev_doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.oboe_num], true, null, false) &&
                        validatePattern(iInv[impconst.oboe_date], true, null, false) &&
                        validatePattern(iInv[impconst.odoc_type], true, null, false) &&
                        validatePattern(iInv[impconst.opcode_mand], true, null, false)

                    );
                }
                break;
            case 'IMPGSEZA':
                if (iInv[impconst.doc_type + '_1']) {
                    isPttnMthced = (
                        validatePattern(iInv[impconst.ctin_sup + '_1'], true, null, false) &&
                        checkForMandatory(iInv[impconst.pos]) &&
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess_paid]), false, null, false) &&
                        validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                        validatePattern(iInv[impconst.pcode_mand + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.boe_num + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.boe_date + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.boe_val], true, null, false) &&
                        validatePattern(iInv[impconst.doc_type + '_1'], true, null, false) &&
                        validatePattern(iInv[impconst.ctin_sup], true, null, false) &&
                        validatePattern(iInv[impconst.pcode_mand], true, null, false) &&
                        validatePattern(iInv[impconst.boe_num], true, null, false) &&
                        validatePattern(iInv[impconst.boe_date], true, null, false) &&
                        validatePattern(iInv[impconst.doc_type], true, null, false)
                    );
                } else {
                    isPttnMthced = (
                        // validatePattern(iInv[impconst.ctin_sup], true, null, false) &&
                        validatePattern(iInv[impconst.rev_ctin_sup], true, null, false) &&
                        checkForMandatory(iInv[impconst.pos]) &&
                        validatePattern(iInv[impconst.taxable_value], true, null, false) &&
                        validatePattern(iInv[impconst.rate], true, null, false) &&
                        validatePattern(cnvt2Nm(iInv[impconst.cess_paid]), false, null, false) &&
                        validatePattern(iInv[impconst.hsn_mand], true, null, false) &&
                        // validatePattern(iInv[impconst.pcode_mand], true, null, false) &&
                        validatePattern(iInv[impconst.rev_pcode_mand], true, null, false) &&
                        // validatePattern(iInv[impconst.boe_num], true, null, false) &&
                        validatePattern(iInv[impconst.rev_boe_num], true, null, false) &&
                        // validatePattern(iInv[impconst.boe_date], true, null, false) &&
                        validatePattern(iInv[impconst.rev_boe_date], true, null, false) &&
                        validatePattern(iInv[impconst.boe_val], true, null, false) &&
                        // validatePattern(iInv[impconst.doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.rev_doc_type], true, null, false) &&
                        validatePattern(iInv[impconst.octin_sup], true, null, false) &&
                        validatePattern(iInv[impconst.opcode_mand], true, null, false) &&
                        validatePattern(iInv[impconst.oboe_num], true, null, false) &&
                        validatePattern(iInv[impconst.oboe_date], true, null, false) &&
                        validatePattern(iInv[impconst.odoc_type], true, null, false)
                    );
                }
                break;
            case 'ECOMA':
                isPttnMthced = (
                    //validateExcel.validateEcomGSTIN(iInv[impconst.ctin_ecom]) &&
                    validatePattern(iInv[impconst.ctin_ecom], true, null, false) &&
                    validatePattern(cnvt2Nm(iInv[impconst.cess]), false, null, false) &&
                    validatePattern(iInv[impconst.val_of_sup], true, null, false) &&
                    validatePattern(iInv[impconst.val_of_ret], true, null, false)
                );
                break;
        }
    }

    logger.log("debug", "Exiting returnStructure.js:: validateExcelMandatoryFields :: %s", isPttnMthced);
    return isPttnMthced;
}
//To check all values at invoice level inorder to add multi items from excel
function validateInvoice(iForm, iSecID, iExInv, existingInv) {
    logger.log("debug", "Entering returnStructure.js:: validateInvoice");
    var isFieldsMatch = false;
    if (iExInv[impconst.pos]) {
        iExInv[impconst.pos] = (iExInv[impconst.pos]).substring(0, 2);
    }
    if (iForm === "ANX1") {
        switch (iSecID) {
            case 'REV':
                isFieldsMatch = (
                    iExInv[impconst.ctin_pan_sup] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == (existingInv['diffprcnt']).toFixed(2) &&
                    iExInv[impconst.sup_cov_sec7] == (existingInv['sec7act'] == 'Y' ? 'Yes' : 'No')
                );
                break;
            case 'B2C':

                isFieldsMatch = (
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt'] &&
                    iExInv[impconst.sup_cov_sec7] == (existingInv['sec7act'] == 'Y' ? 'Yes' : 'No')
                );

                break;
            case 'B2B':
                isFieldsMatch = (
                    iExInv[impconst.ctin_uin_rec] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt'] &&
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    (iExInv[impconst.doc_num]).toString() == existingInv.doc['num'] &&
                    (iExInv[impconst.doc_date]).toString() == existingInv.doc['dt'] &&
                    iExInv[impconst.doc_val] == existingInv.doc['val']

                );

                break;
            case 'EXP':
                isFieldsMatch = (
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    iExInv[impconst.exp_typ] == existingInv['exptype'] &&
                    (iExInv[impconst.doc_num]).toString() == existingInv.doc['num'] &&
                    (iExInv[impconst.doc_date]).toString() == existingInv.doc['dt'] &&
                    iExInv[impconst.doc_val] == existingInv.doc['val']
                );
                break;
            case 'SEZ':
                isFieldsMatch = (
                    iExInv[impconst.ctin_rec] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    iExInv[impconst.gst_pay_typ] == existingInv['seztype'] &&
                    (existingInv['diffprcnt'] ? ((iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt']) : true) &&
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    (iExInv[impconst.doc_num]).toString() == existingInv.doc['num'] &&
                    (iExInv[impconst.doc_date]).toString() == existingInv.doc['dt'] &&
                    iExInv[impconst.doc_val] == existingInv.doc['val']
                );
                break;
            case 'DE':
                isFieldsMatch = (
                    iExInv[impconst.ctin_rec] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt'] &&
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    (iExInv[impconst.doc_num]).toString() == existingInv.doc['num'] &&
                    (iExInv[impconst.doc_date]).toString() == existingInv.doc['dt'] &&
                    iExInv[impconst.doc_val] == existingInv.doc['val']
                );
                break;
            case 'IMPS':
                isFieldsMatch = (
                    iExInv[impconst.pos] == existingInv['pos']
                );
                break;
            case 'IMPG':
                isFieldsMatch = (
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    (iExInv[impconst.boe_num]).toString() == existingInv.boe['num'] &&
                    (iExInv[impconst.boe_date]).toString() == existingInv.boe['dt'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    iExInv[impconst.boe_val] == existingInv.boe['val']
                );
                break;
            case 'IMPGSEZ':
                isFieldsMatch = (
                    iExInv[impconst.ctin_sup] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    (iExInv[impconst.boe_num]).toString() == existingInv.boe['num'] &&
                    (iExInv[impconst.boe_date]).toString() == existingInv.boe['dt'] &&
                    iExInv[impconst.boe_val] == existingInv.boe['val']
                );
                break;
            case 'MIS':
                isFieldsMatch = (
                    iExInv[impconst.ctin_sup] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt'] &&
                    getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                    getSecref(iExInv[impconst.supply_related_to]) == existingInv['tblref'] &&
                    (iExInv[impconst.doc_num]).toString() == existingInv.doc['num'] &&
                    (iExInv[impconst.doc_date]).toString() == existingInv.doc['dt'] &&
                    iExInv[impconst.doc_val] == existingInv.doc['val']
                );
            break;        
        // case 'ECOM':
        // isFieldsMatch = (
        //     iExInv[impconst.ctin_ecom] == existingInv['ctin']
        // );
        // break;
            case 'B2BAO':
     //   console.log("isFieldsMatch rate ::", iExInv[impconst.rate],existingInv)
                isFieldsMatch = (
                    iExInv[impconst.org_ctin_uin_rec] == existingInv['octin'] &&
                    iExInv[impconst.rev_ctin_uin_rec] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt'] &&
                    getDoctype(iExInv[impconst.org_doc_type]) == existingInv['odoctyp'] &&
                    getDoctype(iExInv[impconst.rev_doc_type]) == existingInv['doctyp'] &&
                    (iExInv[impconst.org_doc_num]).toString() == existingInv.odoc['num'] &&
                    (iExInv[impconst.rev_doc_num]).toString() == existingInv.doc['num'] &&
                    (iExInv[impconst.org_doc_date]).toString() == existingInv.odoc['dt'] &&
                    (iExInv[impconst.rev_doc_date]).toString() == existingInv.doc['dt'] &&
                    (iExInv[impconst.rate]) != existingInv.items[0]['rate'] &&
                    iExInv[impconst.rev_doc_val] == existingInv.doc['val'] 

                );

                break;

        }
    } else if (iForm === "ANX1A") {
        switch (iSecID) {
            case 'REVA':
                isFieldsMatch = (
                    iExInv[impconst.ctin_pan_sup] == existingInv['ctin'] &&
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == (existingInv['diffprcnt']).toFixed(2) &&
                    iExInv[impconst.sup_cov_sec7] == (existingInv['sec7act'] == 'Y' ? 'Yes' : 'No')
                );
                break;
            case 'B2CA':
                isFieldsMatch = (
                    iExInv[impconst.pos] == existingInv['pos'] &&
                    (iExInv[impconst.diff_prcnt] / 100).toFixed(2) == existingInv['diffprcnt'] &&
                    iExInv[impconst.sup_cov_sec7] == (existingInv['sec7act'] == 'Y' ? 'Yes' : 'No')
                );
                break;
            case 'EXPA':
                if (iExInv[impconst.doc_type + '_1']) {
                    isFieldsMatch = (
                        getDoctype(iExInv[impconst.doc_type + '_1']) == existingInv['doctyp'] &&
                        iExInv[impconst.exp_typ] == existingInv['exptype'] &&
                        (iExInv[impconst.doc_num + '_1']).toString() == existingInv.doc['num'] &&
                        (iExInv[impconst.doc_date + '_1']).toString() == existingInv.doc['dt'] &&
                        iExInv[impconst.doc_val] == existingInv.doc['val'] &&
                        getDoctype(iExInv[impconst.doc_type]) == existingInv['odoctyp'] &&
                        (iExInv[impconst.doc_num]).toString() == existingInv.odoc['num'] &&
                        (iExInv[impconst.doc_date]).toString() == existingInv.odoc['dt']
                    );
                } else {
                    isFieldsMatch = (
                        // getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                        getDoctype(iExInv[impconst.rev_doc_type]) == existingInv['doctyp'] &&
                        iExInv[impconst.exp_typ] == existingInv['exptype'] &&
                        // (iExInv[impconst.doc_num]).toString() == existingInv.doc['num'] &&
                        (iExInv[impconst.rev_doc_num]).toString() == existingInv.doc['num'] &&
                        // (iExInv[impconst.doc_date]).toString() == existingInv.doc['dt'] &&
                        (iExInv[impconst.rev_doc_date]).toString() == existingInv.doc['dt'] &&
                        iExInv[impconst.doc_val] == existingInv.doc['val'] &&
                        getDoctype(iExInv[impconst.odoc_type]) == existingInv['odoctyp'] &&
                        (iExInv[impconst.odoc_num]).toString() == existingInv.odoc['num'] &&
                        (iExInv[impconst.odoc_date]).toString() == existingInv.odoc['dt']
                    );
                }
                break;
            case 'IMPSA':
                isFieldsMatch = (
                    iExInv[impconst.pos] == existingInv['pos']
                );
                break;
            case 'IMPGA':
                if (iExInv[impconst.doc_type + '_1']) {
                    isFieldsMatch = (
                        getDoctype(iExInv[impconst.doc_type + '_1']) == existingInv['doctyp'] &&
                        (iExInv[impconst.boe_num + '_1']).toString() == existingInv.boe['num'] &&
                        (iExInv[impconst.boe_date + '_1']).toString() == existingInv.boe['dt'] &&
                        iExInv[impconst.pos] == existingInv['pos'] &&
                        iExInv[impconst.boe_val] == existingInv.boe['val'] &&
                        getDoctype(iExInv[impconst.doc_type]) == existingInv['odoctyp'] &&
                        (iExInv[impconst.boe_num]).toString() == existingInv.oboe['num'] &&
                        (iExInv[impconst.boe_date]).toString() == existingInv.oboe['dt']
                    );
                } else {
                    isFieldsMatch = (
                        // getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                        getDoctype(iExInv[impconst.rev_doc_type]) == existingInv['doctyp'] &&
                        // (iExInv[impconst.boe_num]).toString() == existingInv.boe['num'] &&
                        (iExInv[impconst.rev_boe_num]).toString() == existingInv.boe['num'] &&
                        // (iExInv[impconst.boe_date]).toString() == existingInv.boe['dt'] &&
                        (iExInv[impconst.rev_boe_date]).toString() == existingInv.boe['dt'] &&
                        iExInv[impconst.pos] == existingInv['pos'] &&
                        iExInv[impconst.boe_val] == existingInv.boe['val'] &&
                        getDoctype(iExInv[impconst.odoc_type]) == existingInv['odoctyp'] &&
                        (iExInv[impconst.oboe_num]).toString() == existingInv.oboe['num'] &&
                        (iExInv[impconst.oboe_date]).toString() == existingInv.oboe['dt']
                    );
                }
                break;
            case 'IMPGSEZA':
                if (iExInv[impconst.doc_type + '_1']) {
                    isFieldsMatch = (
                        iExInv[impconst.ctin_sup + '_1'] == existingInv['ctin'] &&
                        iExInv[impconst.pos] == existingInv['pos'] &&
                        getDoctype(iExInv[impconst.doc_type + '_1']) == existingInv['doctyp'] &&
                        (iExInv[impconst.boe_num + '_1']).toString() == existingInv.boe['num'] &&
                        (iExInv[impconst.boe_date + '_1']).toString() == existingInv.boe['dt'] &&
                        iExInv[impconst.boe_val] == existingInv.boe['val'] &&
                        iExInv[impconst.ctin_sup] == existingInv['octin'] &&
                        getDoctype(iExInv[impconst.doc_type]) == existingInv['odoctyp'] &&
                        (iExInv[impconst.boe_num]).toString() == existingInv.oboe['num'] &&
                        (iExInv[impconst.boe_date]).toString() == existingInv.oboe['dt']
                    );
                } else {
                    isFieldsMatch = (
                        // iExInv[impconst.ctin_sup] == existingInv['ctin'] &&
                        iExInv[impconst.rev_ctin_sup] == existingInv['ctin'] &&
                        iExInv[impconst.pos] == existingInv['pos'] &&
                        // getDoctype(iExInv[impconst.doc_type]) == existingInv['doctyp'] &&
                        getDoctype(iExInv[impconst.rev_doc_type]) == existingInv['doctyp'] &&
                        // (iExInv[impconst.boe_num]).toString() == existingInv.boe['num'] &&
                        (iExInv[impconst.rev_boe_num]).toString() == existingInv.boe['num'] &&
                        // (iExInv[impconst.boe_date]).toString() == existingInv.boe['dt'] &&
                        (iExInv[impconst.rev_boe_date]).toString() == existingInv.boe['dt'] &&
                        iExInv[impconst.boe_val] == existingInv.boe['val'] &&
                        iExInv[impconst.octin_sup] == existingInv['octin'] &&
                        getDoctype(iExInv[impconst.odoc_type]) == existingInv['odoctyp'] &&
                        (iExInv[impconst.oboe_num]).toString() == existingInv.oboe['num'] &&
                        (iExInv[impconst.oboe_date]).toString() == existingInv.oboe['dt']
                    );
                }
                break;
        }
    }

    logger.log("debug", "Exiting returnStructure.js:: validateInvoice :%s :%s", isFieldsMatch, iSecID);
    return isFieldsMatch;
}

function validateShippingDetailsCombo(sbDate, pcode, sbNum) {

    if ((pcode == null || pcode == undefined) && (sbNum == null || sbNum == undefined) && (sbDate == null || sbDate == undefined)) {
        return true;
    }

    if (sbDate && (pcode == null || pcode == undefined || sbNum == null || sbNum == undefined)) {
        return false;
    }

    if (sbNum != null && sbNum != undefined && (pcode == null || pcode == undefined || sbDate == null || sbDate == undefined)) {
        return false;
    }

    if (pcode != null && pcode != undefined && (sbNum == null || sbNum == undefined || sbDate == null || sbDate == undefined)) {
        return false;
    }

    return true;
}

// This method has been modified to just check whether the field value is entered or not. Basically for Mandatory field check
// Pattern check will be handled in schema and business validations
function checkForMandatory(iString){
    logger.log("debug", "Entering returnStructure.js:: checkForMandatory");
    if (iString !== undefined && iString != null && iString !== "") {
        return true; 
    } else {
        return false;
    }
}

//This function takes the input string and regex pattern and returns boolean value
function validatePattern(iString, isMandatory, iPattern, isPos) {
    logger.log("debug", "Entering returnStructure.js:: validatePattern");
    var isValid = false;

    if (iString !== undefined && iString != null && iString !== "") {
        isValid = true; //isMandatory ? true : true;
        if (iPattern) {
            var patt = new RegExp(iPattern),
                isPatternValid = false;
            isPatternValid = patt.test(iString);

            isValid = isValid && isPatternValid ? true : false;
        }

        if (isPos) {
            let pos = iString;
            if (iString && iString.indexOf("-") > 0) {
                pos = iString.split("-")[0];
            }
            let posCode = parseInt(pos);
            var pos0to37 = (posCode >= 1 && posCode <= 37),  // to allows states from 01 to 37
                pos97 = (posCode >= 97 && posCode <= 99);  // to allow 97, 98 and 99
            isValid = (pos0to37 || pos97) ? true : false;
        }
    } else {
        isValid = isMandatory ? false : true;
    }
    logger.log("debug", "Exiting returnStructure.js:: validatePattern :%s", isValid);

    return isValid;
}



//This function prepares json payload from validated excal data
let preparePayloadFromExcel = function (oData, getInvFn, getItmFn, iSecID, iForm, shareData) {
    logger.log("debug", "Entering returnStructure.js :: PreparePayloadFromExcel");
    let iData = null;
    let invAry = [];
    let isValid = true;

    iData = convertStrToNum(oData, "Rate");

    //iData = trimIt(iData, "Number");

    let getMatchObj = {};

    angular.forEachCustom(iData, (inv) => {

        let isValidExcelFields = validateExcelMandatoryFields(inv, iSecID, iForm, shareData);

        if (!isValidExcelFields) {
            isValid = false;
        }

        if (isValidExcelFields) {

            getMatchObj = getMatchedInv(invAry, inv, iSecID, iForm);

            let matchedInv = getMatchObj.rInv;

            if (matchedInv && getItmFn) {
                //item repeated
                let newItmNum = (matchedInv.items.length + 1);
                let newItm = getItmFn(newItmNum, inv);
                //let rateFound = false;
                // matchedInv.items.forEach(function(itmRow){
                //     // if ((iSecID == 'REV' || iSecID =='B2B' || iSecID =='EXP' || iSecID == 'IMPS' 
                //     // || iSecID == 'IMPG' || iSecID == 'SEZ' || iSecID == 'IMPGSEZ') && itmRow.hsn!==null) {
                //     //     rateFound = false;
                //     // }
                //     // else{
                //     //     if (typeof itmRow != 'undefined' && typeof itmRow.rate != 'undefined' && itmRow.rate == newItm.rate) {
                //     //         itmRow = newItm;
                //     //         rateFound = true;

                //     //     } else if (typeof itmRow.rate != 'undefined' && itmRow.rate == newItm.rate) {
                //     //         itmRow = newItm;
                //     //         rateFound = true;
                //     //     }
                //     // }

                // });
                //  if (rateFound == false) {
                matchedInv.items.push(newItm);


                //  }
            }
            else {
                invAry.push(getInvFn(1, inv, getItmFn));

            }
        }
    }
    );

    logger.log("debug", "Entering returnStructure.js :: PreparePayloadFromExcel");

    //console.log("invAry", invAry)

    return {
        inv: invAry,
        isValid: isValid
    };
}


//This functions takes a string and converts to num
function convertStrToNum(oData, iKey) {
    logger.log("debug", "Entering returnStructure.js:: convertStrToNum");
    var stData = extend(true, {}, oData)
    angular.forEachCustom(stData, function (inv, i) {
        var keys = Object.keys(inv);
        angular.forEachCustom(keys, function (key, i) {
            if (key.indexOf(iKey) != -1) {
                var type = typeof (inv[key]);
                if (inv[key] && typeof (inv[key]) != "number") {
                    if(!isNaN(inv[key])) {
                    inv[key] = parseFloat(inv[key].replace(',', ''));
                    }
                }
            }
        })
    });
    logger.log("debug", "Entering returnStructure.js:: convertStrToNum :%s", stData);
    return stData;
}

function trimIt(oData, iKey) {
    var stData = extend(true, {}, oData)
    angular.forEachCustom(stData, function (inv, i) {
        var keys = Object.keys(inv);
        angular.forEachCustom(keys, function (key, i) {
            if (inv[key] && typeof (inv[key]) != "number") {
                inv[key] = inv[key];
            }
        })
    })
    return stData;
}
//This functions returns the document type
function getDoctype(oData) {
    let docType = null;
    let typVal = oData.toUpperCase();
    switch (typVal) {
        case 'INVOICE':
            docType = 'I';
            break;
        case 'DEBIT NOTE':
            docType = 'D';
            break;
        case 'CREDIT NOTE':
            docType = 'C';
            break;
        case 'BILL OF ENTRY':
            docType = 'B';
            break;
        default:
            docType = typVal;
            break;
    }
    return docType;
}
//This function returns the section reference
function getSecref(oData) {
    let secRef = null;
    let typRef = oData.toUpperCase();

    switch (typRef) {
        case '3B (B2B)':
            secRef = '3B';
            break;
        case '3E (SEZWP)':
            secRef = '3E';
            break;
        case '3G (DE)':
            secRef = '3G';
            break;

    }
    return secRef;
}
//This function returns the matched Inv/Doc 
function getMatchedInv(saveArry, iExInv, iSecID, iForm) {
    logger.log("debug", "Entering returnStructure.js :: getMatchedInv");
    let rInv = null;

    saveArry.forEach((saveObj) => {

        if (!iExInv[impconst.ctin_pan_sup])
            iExInv[impconst.ctin_pan_sup] = '';

        if (!iExInv[impconst.ctin_uin_rec])
            iExInv[impconst.ctin_uin_rec] = '';

        if (iSecID == 'B2C' || iSecID == 'B2CA') {
            if (saveObj['pos'] === iExInv[impconst.pos].split("-", 1).pop()) {

                let existingInv = saveObj;
                let isValidInv = validateInvoice(iForm, iSecID, iExInv, existingInv);

                if (isValidInv)
                    rInv = saveObj;
            }
        }

        else if (iSecID == 'REV' || iSecID == 'B2B' || iSecID == 'SEZ' || iSecID == 'DE' || iSecID == 'IMPGSEZ' || iSecID == 'MIS' || iSecID == 'REVA' || iSecID == 'IMPGSEZA') {

            if (saveObj['ctin'] == iExInv[impconst.ctin_pan_sup] || saveObj['ctin'] == iExInv[impconst.ctin_uin_rec] || saveObj['ctin'] == iExInv[impconst.rev_ctin_uin_rec]
                || saveObj['ctin'] == iExInv[impconst.ctin_rec] || saveObj['ctin'] == iExInv[impconst.ctin_sup]
                || saveObj['ctin'] == iExInv[impconst.ctin_sup] || saveObj['ctin'] == iExInv[impconst.ctin_sup + '_1']) {

                let existingInv = saveObj;
                let isValidInv = validateInvoice(iForm, iSecID, iExInv, existingInv);


                if (isValidInv)
                    rInv = saveObj;

            }

        }
        else if (iSecID == 'EXP' || iSecID == 'IMPS' || iSecID == 'IMPG' || iSecID == 'EXPA' || iSecID == 'IMPSA' || iSecID == 'IMPGA') {

            let existingInv = saveObj;
            let isValidInv = validateInvoice(iForm, iSecID, iExInv, existingInv);

            if (isValidInv)
                rInv = saveObj;
        }
        else if(iSecID == 'B2BAO'){
            let existingInv = saveObj;
                let isValidInv = validateInvoice(iForm, iSecID, iExInv, existingInv);
                if (isValidInv)
                    rInv = saveObj;
        }
    }
    );
    logger.log("debug", "Exiting returnStructure.js :: getMatchedInv : %s", rInv);
    return {
        rInv: rInv,

    };
}

let csvCheckForISCgst = function (inv) {
    if (inv.hasOwnProperty(impconst.doc_type)) {
        if ((inv[impconst.doc_type].toUpperCase()) === 'INVOICE') {
            if (inv[impconst.igst] != null && inv[impconst.igst].length >= 0) {
                inv[impconst.igst] = null;
            } else if (inv[impconst.cgst] != null && inv[impconst.cgst].length >= 0) {
                inv[impconst.cgst] = null;
            } else if (inv[impconst.sgst] != null && inv[impconst.sgst].length >= 0) {
                inv[impconst.sgst] = null;
            }
        } else {
            if (inv[impconst.igst] != null && inv[impconst.igst].length == 0) {
                inv[impconst.igst] = null;
            } else if (inv[impconst.cgst] != null && inv[impconst.cgst].length == 0) {
                inv[impconst.cgst] = null;
            } else if (inv[impconst.sgst] != null && inv[impconst.sgst].length == 0) {
                inv[impconst.sgst] = null;
            }
            if (inv[impconst.igst_paid] != null && inv[impconst.igst_paid].length == 0) {
                inv[impconst.igst_paid] = null;
            }
        }
    } else {
        if (inv[impconst.igst] != null && inv[impconst.igst].length == 0) {
            inv[impconst.igst] = null;
        } else if (inv[impconst.cgst] != null && inv[impconst.cgst].length == 0) {
            inv[impconst.cgst] = null;
        } else if (inv[impconst.sgst] != null && inv[impconst.sgst].length == 0) {
            inv[impconst.sgst] = null;
        }
        if (inv[impconst.igst_paid] != null && inv[impconst.igst_paid].length == 0) {
            inv[impconst.igst_paid] = null;
        }
    }
    return inv;
}

let csvCheckForISCgst2 = function (inv) {
    console.log('inv igst paid : ', inv[impconst.igst_paid]);
    if (inv.hasOwnProperty(impconst.doc_type+'_1')) {
        if ((inv[impconst.doc_type+'_1'].toUpperCase()) === 'INVOICE') {
            if (inv[impconst.igst] != null && inv[impconst.igst].length >= 0) {
                inv[impconst.igst] = null;
            } else if (inv[impconst.cgst] != null && inv[impconst.cgst].length >= 0) {
                inv[impconst.cgst] = null;
            } else if (inv[impconst.sgst] != null && inv[impconst.sgst].length >= 0) {
                inv[impconst.sgst] = null;
            }
        } else {
            if (inv[impconst.igst] != null && inv[impconst.igst].length == 0) {
                inv[impconst.igst] = null;
            } else if (inv[impconst.cgst] != null && inv[impconst.cgst].length == 0) {
                inv[impconst.cgst] = null;
            } else if (inv[impconst.sgst] != null && inv[impconst.sgst].length == 0) {
                inv[impconst.sgst] = null;
            }
            if (inv[impconst.igst_paid] != null && inv[impconst.igst_paid].length == 0) {
                inv[impconst.igst_paid] = null;
            }
        }
    } else {
        if (inv[impconst.igst] != null && inv[impconst.igst].length == 0) {
            inv[impconst.igst] = null;
        } else if (inv[impconst.cgst] != null && inv[impconst.cgst].length == 0) {
            inv[impconst.cgst] = null;
        } else if (inv[impconst.sgst] != null && inv[impconst.sgst].length == 0) {
            inv[impconst.sgst] = null;
        }
        if (inv[impconst.igst_paid] != null && inv[impconst.igst_paid].length == 0) {
            inv[impconst.igst_paid] = null;
        }
    }
    return inv;
}

let chksupType = function(typ) {
    if(typ != null && typ.length == 0) {
        typ = null;
    }
    return typ;
}


//Check if Rate is one of the valid rates
function validateRates(iString) {
    const array = [0, 0.1, 0.25, 1, 1.5, 3, 5, 7.5, 12, 18, 28];
    if (array.indexOf(iString) != -1) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    getInv: getInv,
    getItm: getItm,
    formateNodePayload: formateNodePayload,
    preparePayloadFromExcel: preparePayloadFromExcel,
    validateShippingDetailsCombo: validateShippingDetailsCombo
}