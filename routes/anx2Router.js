var express = require('express');
var router = express.Router();
var anx2Service = require('../service/anx2Service');
var anx2JsonService = require('../service/anx2Service/generateanx2json');
const log  = require('../utility/logger.js');
const logger = log.logger;

router.post('/opndwnldjson', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /opndwnldjson");
  anx2Service.downldJson(req, res);
});

// to fetch data for tables 3B & 3E in document wise tab
router.get('/getDocData', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /getDocData");
  anx2Service.getDocWiseData(req, res);
});
router.get('/gettb5Data', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /gettb5Data");
  anx2Service.gettb5Data(req, res);
});

router.post('/resetactn', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /resetactn");
  anx2Service.resetAction(req, res);
});

router.get('/chkdatacnt', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /chkdatacnt");
  
  anx2Service.getCount(req, res);
});

router.get('/gethsndata', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /gethsndata");
  anx2Service.gethsndata(req, res);
});


router.post('/saveactiondata', function(req, res){
  var gstin = req.query.gstin;
  var tablename = req.query.tablename;
  logger.log("info", "Entering routes:: anx2Router :: /saveactiondata");
  logger.log("info","Inside Save Action Data for " + tablename);
  logger.log("debug","Gstin is:::::"+ gstin);
  anx2Service.saveAction(req, res);
});
router.get('/getTabsummary', function(req, res) {
  var gstin = req.query.gstin;
  logger.log("info", "Entering routes:: anx2Router :: /getTabsummary");
  logger.log("debug","Gstin is:::::"+ gstin);
  anx2Service.getTabsummary(req, res);
});
router.get('/exportCsv', function(req, res) {
  var gstin = req.query.gstin; 
  logger.log("info", "Entering routes:: anx2Router :: /exportCsv");
  logger.log("debug", "Gstin is:::::"+ gstin);
  anx2Service.exportCsv(req, res);
});

router.get('/exportUserProfile', function(req, res) {
  var gstin = req.query.gstin;
  logger.log('info', 'Entering routes:: anx2Router :: /exportUserProfile at : %s  ::  %s', new Date().getTime(), new Date().toString());
  logger.log("debug","Gstin is:::::"+ gstin);
  anx2Service.exportUserProfile(req, res);
});

router.get('/getIsdTabsummary', function(req, res) {
  var gstin = req.query.gstin;
  logger.log("info", "Entering routes:: anx2Router :: /getIsdTabsummary");
  logger.log("debug","Gstin is:::::"+ gstin);
  anx2Service.getIsdTabsummary(req, res);
});
router.get('/getsummrydata', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /getsummrydata");
  anx2Service.getSummryData(req, res);
});

router.get('/generateJson', function(req, res) {
  var gstin = req.query.gstin;
  logger.log("info", "Entering routes:: anx2Router :: /generateJson");
  logger.log("debug","Gstin is:::::"+ gstin);
  anx2JsonService.generateJson(req, res);
});
router.get('/deltabdata', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /deltabdata");
  anx2Service.deleteTableData(req, res);
});
router.get('/exportXls', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /exportXls");
  anx2Service.exportXls(req, res);
});
router.post('/openerrjson', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /openerrjson");
  anx2Service.openErrJson(req, res);
});
router.get('/getErrdashsummrydata', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /getErrdashsummrydata");
  anx2Service.getErrDashSummrydata(req, res);
});

router.get('/chkrecordcnt', function(req, res) {
  logger.log("info", "Entering routes:: anx2Router :: /chkrecordcnt");
  anx2Service.getRecordCount(req, res);
});

module.exports = router;
