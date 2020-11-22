/**
 *  @author:   Prakash Kaphle
 *  @created:   July 2019
 *  @description: Anx1 Offline utility
 *  @copyright: (c) Copyright by Infosys technologies
 *  version GST1.00
 *  Last Updated:  Prakash Kaphle, July 23 2019
 **/
let extend = require('node.extend');

let angular = require('../utility/angularHelper');

const logger  = require('../utility/logger').logger;

const impconst=require('../utility/impConstants');

//This function calculates the tax amounts igst/cgst/sgst, if not added by user.
let getTaxAmount = function (inv, taxType, diffFactor) {
    logger.log('debug', 'Entering validateExcelImp.js :: getTaxAmount');
    let taxAmount;
    if (inv.hasOwnProperty(impconst.doc_type)) {
        
        if ((inv[impconst.doc_type].toUpperCase()) === 'INVOICE') {

            if (taxType == impconst.igst || taxType == impconst.igst_paid) {

                taxAmount = (parseFloat(Math.round(((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 100) / 100 ).toFixed(2)));
            }
            else {
                taxAmount = (parseFloat(Math.round((((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 0.5) * 100) /100).toFixed(2)));
            }

        }
        else {
            if (inv[taxType] != null && inv[taxType] != undefined && isNaN(inv[taxType])) {
                return inv[taxType];
            }
            if (taxType == impconst.igst || taxType == impconst.igst_paid) {
                taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat(parseFloat(Math.round((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 100 ) /100 ).toFixed(2))));
            }
            else {
                taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat((Math.round((parseFloat((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor)) * 0.5) * 100) / 100).toFixed(2))));
            }
        }
        console.log("Calculate taxamount -1  ::" , taxAmount)
    } 
     if (inv.hasOwnProperty(impconst.rev_doc_type)) {
       
        if ((inv[impconst.rev_doc_type].toUpperCase()) === 'INVOICE') {

            if (taxType == impconst.igst || taxType == impconst.igst_paid) {

                taxAmount = (parseFloat((Math.round((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 100) / 100 ).toFixed(2)));
            }
            else {
                taxAmount = (parseFloat((Math.round(((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 0.5) * 100) / 100 ).toFixed(2)));
            }

            // console.log("taxAmount :", taxAmount)
        } else {
            if (inv[taxType] != null && inv[taxType] != undefined && isNaN(inv[taxType])) {
                return inv[taxType];
            }
            if (taxType == impconst.igst || taxType == impconst.igst_paid) {
                taxAmount = (inv[taxType]) ? parseFloat(parseFloat((Math.round(inv[taxType]) * 100 ) / 100).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat(parseFloat(Math.round(((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor)) * 100) / 100).toFixed(2))));
            }
            else {
                taxAmount = (inv[taxType]) ? parseFloat(parseFloat((Math.round(inv[taxType]) * 100 ) / 100 ).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat((Math.round((parseFloat((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor)) * 0.5) * 100) / 100).toFixed(2))));
            }
        }
        console.log("Calculate taxamount -2 ::" , taxAmount)
    }
    else if (taxType == impconst.net_val_sup) {
        if (inv[impconst.val_of_sup] == 0 && inv[impconst.val_of_ret] == 0) {
            taxAmount = 0;
        }
        else {
            let valOfSup = inv[impconst.val_of_sup] ? inv[impconst.val_of_sup] : 0;
            let valOfRet = inv[impconst.val_of_ret] ? inv[impconst.val_of_ret] : 0;
            taxAmount = (parseFloat((Math.round(((valOfSup - valOfRet) * diffFactor) * 100) /100).toFixed(2)));
        }
    }
    else if (inv.hasOwnProperty(impconst.ctin_ecom)) {
        taxAmount = (inv[taxType]) ? parseFloat(parseFloat((Math.round(inv[taxType]) * 100) / 100).toFixed(2)) : 0;
    }
    else {
        
        if (inv[taxType] != null && inv[taxType] != undefined && isNaN(inv[taxType])) {
            return inv[taxType];
        }
        if (taxType == impconst.igst || taxType == impconst.igst_paid) {
            taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat(parseFloat(Math.round((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 100 ) /100).toFixed(2))));
        }
        else {
            taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat((Math.round((parseFloat(inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 0.5) * 100) / 100).toFixed(2))));
        }
    }
    logger.log('debug', 'Exiting validateExcelImp.js :: getTaxAmount');
    return taxAmount;
}

//This function validates the HSN 4,6 or 8 digit.
let validateHSN=function(hsn){
    logger.log('debug','Entering validateExcelImp.js :: validateHSN');
    let isValidHSN = false;
    let isval4 = /^\d{4}$/.test(hsn);
    let isval99 = /^99\d{2}$/.test(hsn);
    let isval6 = /^\d{6}$/.test(hsn);
    let isval8 = /^\d{8}$/.test(hsn);
    let is99 = /^99\d{6}$/.test(hsn);
    if (is99) {
      //"HSN code with 8 or 4 digits should not start with 99";
      isValidHSN = false;
    }
    if (isval4 || isval6 || isval8) {
      //"HSN should be of 4,6 or 8 digits only ."
      isValidHSN = true;

    }
    if (isval99) {
      //"HSN starting with 99 should be of 6 digits only"
      isValidHSN = false;
    }
    logger.log('debug','Exiting validateExcelImp.js :: validateHSN');
    return isValidHSN;
  }

//This function calculates the supply type based on ctin & pos
let calSupType = function(gstin, pos, sec7act, issez, suptype) {
    logger.log('debug','Entering validateExcelImp.js :: calSupType');
    pos = (pos.length == 1) ? ("0" + pos) : pos;
    if (gstin && pos) {
        if ((/^\d{2}$/).test(gstin.slice(0, 2))) {
            if ((pos.substring(0, 2) == gstin.slice(0, 2))) {
                
                return (sec7act == 'Yes' || pos == "97" || issez == 'Y') ? "Inter-State" : "Intra-State";
            } else {
                return "Inter-State";
            }
        } else {
            return (sec7act == 'Yes' || issez == 'Y') ? "Inter-State" : suptype;
        }
    } else {
        return suptype;
    }
}

//This function checks for a valid document date
let checkDocumentDate = function(docDate,rtn_prd) {
    logger.log('debug','Entering validateExcelImp.js :: checkDocumentDate');
    let minDate = '01-07-2017';// set to the start of GST
    let maxDate = new Date();
    
    let docdate = new Date(docDate.split('-').reverse().join('-'));
    let startDate = new Date(minDate.split('-').reverse().join('-'));

    let taxperiod = Number(rtn_prd.substr(0, 2))
    
    let taxperioderror = false;
    if (!docDate || docDate === "" || docDate == null) {

        logger.log('debug', 'This field cannot be left blank')
        return false;
    }
        
    if (docdate < startDate) {
        
        logger.log('debug','Document date cannot be prior to JULY 1,2017');
        
        return false;
        
    }
    if ((taxperiod < maxDate.getMonth() + 1) && maxDate.getFullYear() >= Number(rtn_prd.substr(2))) {
        
        let newDay = new Date()
        newDay.setMonth(taxperiod, 0);
        newDay.setFullYear(Number(rtn_prd.substr(2)))
        maxDate = newDay;
        taxperioderror = true;

    }
    maxDate.setHours(5, 30, 0, 0);
    if (docdate > maxDate) {
        if (taxperioderror) {

            logger.log('debug', 'Document date cannot be more than %s for the chosen taxperiod.', maxDate.toLocaleDateString("en-GB"))
            return false
        }

        else {
            logger.log('debug', 'Document date cannot be a future date');
            return false
        }
            
    }
    return true;

}
//This function returns the valid supplier type
let getSupplierType = function(input){
    logger.log('debug','Entering validateExcelImp.js :: getSupplierType');
    // if(input.toUpperCase() == 'REGISTERED'){
    //     return 'G';
    // }
    // else{
    //     return 'P';
    // }
    if (input.length == 15) {
        return 'G';
    }
    else if (input.length == 10) {
        return 'P';
    }
}

//This function checks whether taxable value is 0
let isValidTaxVal = function(input){
    logger.log('debug','Entering validateExcelImp.js :: isValidTaxVal');
    let isValid = false;
    let taxVal = input[impconst.taxable_value];
    let docType = input[impconst.doc_type];
    if(docType.toUpperCase()=='INVOICE'){
        if(parseFloat(taxVal).toFixed(2)>0)
        isValid = true;
    }
    else{
        isValid = true;
    }
    logger.log('debug','Exiting validateExcelImp.js :: isValidTaxVal :%s',isValid);
    return isValid;
}
//This function checks whether shipping bill no, shipping bill date and port code are mandatory
let isShippingMandatory = function(input){
    logger.log('debug','Entering validateExcelImp.js :: isShippingMandatory');
    let mandatory = false ;
    let ship_bill_num = input[impconst.ship_num];
    let ship_bill_date = input[impconst.ship_date];
    let port_code = input[impconst.pcode_opt];
    if((ship_bill_num && ship_bill_date && port_code) ||(ship_bill_num==undefined && ship_bill_date==undefined && port_code==undefined)){
        mandatory = true;
    }
    logger.log('debug','Exiting validateExcelImp.js :: isShippingMandatory :%s',mandatory);
    return mandatory;
}
//This function validates E-commerce gstin pattern
let validateEcomGSTIN = function(ecomGstin){
    logger.log('debug','Entering validateExcelImp.js :: validateEcomGSTIN');
    let GstinPttn = impconst.ecom_gstin_ptrn;
    // if(GstinPttn.test(ecomGstin)){
    //     return true;
    // }
    if(ecomGstin && ecomGstin.length==15){
        return true;
    }
    return false;
}
//This function validates refund claim for WPAY
let isClaimRef = function(input){
    logger.log('debug','Entering validateExcelImp.js :: isClaimRef');
    let payType=input[impconst.gst_pay_typ];
    if(payType=='WOPAY'){

        return true;
    }
    else if(payType=='WPAY' && input.hasOwnProperty(impconst.clm_rfnd)){
        return true;
    }
    return false;
}

let getTaxAmountA = function (inv, taxType, diffFactor) {
    logger.log('debug', 'Entering validateExcelImp.js :: getTaxAmountA');
    let taxAmount;
    if (inv.hasOwnProperty(impconst.doc_type + '_1')) {
        if ((inv[impconst.doc_type + '_1'].toUpperCase()) === 'INVOICE') {

            if (taxType == impconst.igst || taxType == impconst.igst_paid) {

                taxAmount = (parseFloat((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor).toFixed(2)));
            }
            else {
                taxAmount = (parseFloat(((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 0.5).toFixed(2)));
            }

        }
        else {
            if (inv[taxType] != null && inv[taxType] != undefined && isNaN(inv[taxType])) {
                return inv[taxType];
            }
            if (taxType == impconst.igst || taxType == impconst.igst_paid) {
                taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat(parseFloat((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor)).toFixed(2))));
            }
            else {
                taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat((parseFloat((inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor)) * 0.5).toFixed(2))));
            }
        }
    }
    else if (taxType == impconst.net_val_sup) {

        if (inv[impconst.val_of_sup] == 0 && inv[impconst.val_of_ret] == 0) {
            taxAmount = 0;
        }
        else {
            let valOfSup = inv[impconst.val_of_sup] ? inv[impconst.val_of_sup] : 0;
            let valOfRet = inv[impconst.val_of_ret] ? inv[impconst.val_of_ret] : 0;
            taxAmount = (parseFloat(((valOfSup - valOfRet) * diffFactor).toFixed(2)));
        }

    }
    else if (inv.hasOwnProperty(impconst.ctin_ecom)) {
        if (inv[taxType] && inv[taxType].length > 0) {
            taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : 0;
        }
    }
    else {
        if (inv[taxType] != null && inv[taxType] != undefined && isNaN(inv[taxType])) {
            return inv[taxType];
        }
        if (taxType == impconst.igst || taxType == impconst.igst_paid) {
            taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat(parseFloat(inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor).toFixed(2))));
        }
        else {
            taxAmount = (inv[taxType]) ? parseFloat(parseFloat(inv[taxType]).toFixed(2)) : (inv[taxType] == 0 ? 0 : (parseFloat((parseFloat(inv[impconst.taxable_value] * inv[impconst.rate] * 0.01 * diffFactor) * 0.5).toFixed(2))));
        }
    }
    logger.log('debug', 'Exiting validateExcelImp.js :: getTaxAmountA');
    // console.log('tax amt : ', taxAmount);
    return taxAmount;
}

module.exports = {
    getTaxAmount:getTaxAmount,
    validateHSN:validateHSN,
    calSupType:calSupType,
    checkDocumentDate:checkDocumentDate,
    getSupplierType:getSupplierType,
    isValidTaxVal:isValidTaxVal,
    isShippingMandatory:isShippingMandatory,
    validateEcomGSTIN:validateEcomGSTIN,
    isClaimRef:isClaimRef,
    getTaxAmountA:getTaxAmountA
};