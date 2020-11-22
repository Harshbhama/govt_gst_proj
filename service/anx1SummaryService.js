const anx1SummaryDao = require("../dao/anx1SummaryDao");
const { sendResponse } = require("../utility/common");
const _ = require("lodash");
const { STATUS_CD_ZERO } = require("../utility/constants");
const anx14Dao = require("../dao/anx1Dao/anx14Dao");

/**
 * To get the summary for the tables mentioned in the url params
 * @param {*} req 
 * @param {*} res 
 */
function getTableWiseSummary (req, res) {  
    let tableTyp;
    // if request body sent Null
    if (req.params === undefined || req.params.tableType === null || req.params.tableType === undefined) {
      res.status(500).send('{ message: "Table type is required",statusCd: STATUS_CD_ZERO}');
      return 0;
    } else {
      tableTyp = req.params.tableType.toUpperCase();
    }
   // console.log("Inside getTableWiseSummary for table :" + tableTyp);
      
    let gstin = req.headers["gstin"]; 
    let fp = req.headers["fp"];
    let taxperiod = req.headers["taxperiod"];
    let isErrorSum = req.headers["iserrorsum"];
  
    let error;
    if ( gstin === undefined || gstin === "" || gstin === null || fp === undefined || fp === "" || fp === null || taxperiod === undefined || taxperiod === "" || taxperiod === null) {
      error = true;
    }  
    
    if(error === true){
      sendResponse(res, 500, {message: "GSTIN, Financial Year, Taxperiod are required in Request header", statusCd: 0});
      return 0;
    } else {
      if(tableTyp === "3A" || tableTyp === "3H" || tableTyp === "3I" || tableTyp ==="3J" || tableTyp === "3AA" || tableTyp === "3HA" || tableTyp === "3IA" || tableTyp === "3JA"){
        anx1SummaryDao.get3Aor3HSummary(gstin, fp, taxperiod, tableTyp, isErrorSum).
        then(function (data) {
          res.status(200).send(data);
          // sendResponse(res, 200, {message: "GSTIN, Financial Year, Taxperiod are required in Request header", statusCd: 0});

          return 1;
        }).catch(function (err) {
        
          sendResponse(res, 500, {message: "GSTIN, Financial Year, Taxperiod are required in Request header", statusCd: 0});
          // res.status(500).send(err);
          return 0;
        })
      } 
      else if(tableTyp === "3CD" || tableTyp === "3CDA" ){
        anx1SummaryDao.get3CDSummary(gstin, fp, taxperiod, tableTyp,isErrorSum).
        then(function (data) {
          res.status(201).send(data);
          return 1;
        }).catch(function (err) {
          res.status(500).send(err)
          return 0;
        }) 
      }
      else if(tableTyp === "3B" || tableTyp === "3K" || tableTyp === "3L" || tableTyp === "3BA" || tableTyp === "3BAO" || tableTyp === "3KA"){
        anx1SummaryDao.get3Bor3KSummary(gstin, fp, taxperiod, tableTyp, isErrorSum).
        then(function (data) {
          res.status(201).send(data)
          return 1;
        }).catch(function (err) {
          res.status(500).send(err)
          return 0;
        })
      }
      else if(tableTyp === "4" || tableTyp === "4A"){
        anx14Dao.get4Summary(gstin, fp, taxperiod,isErrorSum, tableTyp).
        then(function (data) {
          res.status(201).send(data);
          return 1;
        }).catch(function (err) {
          res.status(500).send(err)
          return 0;
        })
      }
      else if(tableTyp === "3EF" || tableTyp === "3EFA"){
        //console.log("Inside get3EFSummary for table :" + tableTyp);
        anx1SummaryDao.get3EFSummary(gstin, fp, taxperiod,isErrorSum,tableTyp).
        then(function (data) {
         // console.log("summ:err:", data);
          res.status(201).send(data);
          return 1;
        }).catch(function (err) {
        
          res.status(500).send(err)
          return 0;
        })
      }
      else if(tableTyp === "3G" || tableTyp === "3GA"){
       // console.log("Inside get3GSummary for table :" + tableTyp);
        anx1SummaryDao.get3GSummary(gstin, fp, taxperiod,isErrorSum,tableTyp).
        then(function (data) {
          res.status(201).send(data)
          return 1;
        }).catch(function (err) {
          console.log(err)
          res.status(500).send(err)
          return 0;
        })
      }
    }
  };
  
 
  /**
   * This method will return the consolidated summary for all anx1 tables
   * @param {*} req 
   * @param {*} res 
   */
function getConsildatedSummary (req, res) {
  
   // console.log("Inside getConsildatedSummary");
      
    let gstin = req.headers["gstin"]; 
    let fp = req.headers["fp"];
    let taxperiod = req.headers["taxperiod"];
     
    let error;
    if ( gstin === undefined || gstin === "" || gstin === null || fp === undefined || fp === "" || fp === null || taxperiod === undefined || taxperiod === "" || taxperiod === null) {
      error = true;
    }  
    
    if(error === true){
      sendResponse(res, 500, {message: "GSTIN, Financial Year, Taxperiod are required in Request header", statusCd: STATUS_CD_ZERO});
    } else {
        anx1SummaryDao.getConsolidatedSummary(gstin, fp, taxperiod).
        then(function (data) {
            res.status(201).send(data);
       }).catch(function (err) {
          res.status(500).send(err)
        })
    }
  };
  


module.exports = {
    
    getTableWiseSummary : getTableWiseSummary,
    getConsildatedSummary : getConsildatedSummary
    
   
    
  }