var express = require('express');
var router = express.Router();
var anx1Service = require('../service/anx1Service');
var anx13cdService = require('../service/anx13cdService');
var anx13bService = require('../service/anx13bService');
var anx1SummaryService = require('../service/anx1SummaryService');
var anx1b2baoservice = require('../service/anx1Service/anx1b2baoservice');
var anx1B2baService = require('../service/anx1Service/anx1B2baService');
var anx13efaService = require('../service/anx1Service/anx13efaService');
const logger  = require('../utility/logger').logger;
const path = require('path');
const app = express();
router.post('/save3adetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3adetails");
  anx1Service.save3atable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3adetails");
});

router.get('/get3adetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3adetails");
  anx1Service.getTable3a(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3adetails");
});

router.post('/edit3adetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3adetails");
  anx1Service.editTable3a(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3adetails");
});

router.post('/markfordelete3A', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /markfordelete3A");
  anx1Service.markforDeleteTable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /markfordelete3A");
});

router.post('/delete3adetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3adetails");
  anx1Service.delete3A(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3adetails");
});

router.get('/getSummary/:tableType', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getSummary");
  anx1SummaryService.getTableWiseSummary(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getSummary");
});
router.get('/getErrorSummary/:tableType', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getErrorSummary");
  anx1SummaryService.getTableWiseSummary(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getErrorSummary");
});
router.post('/getItemsForTable/:docref', function(req, res) {
  anx1Service.getItemDetails(req, res);
});

router.get('/getConsolidatedSummary', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getConsolidatedSummary");
  anx1SummaryService.getConsildatedSummary(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getConsolidatedSummary");
});

router.post('/delete3abydocid', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3abydocid");
  anx1Service.delete3ABydocIds(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3abydocid");
});

router.post('/delete3abyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3abyitemids");
  anx1Service.delete3AItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3abyitemids");
});

router.post('/removeAllData', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /removeAllData");
  anx1Service.removeDataFromAllTables(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /removeAllData");
});

router.get('/get3b', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3b");
  anx13bService.get3bDetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3b");
});
router.get('/get3bao', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3bao");
  anx1b2baoservice.get3baoDetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3bao");
});


router.post('/save3cd', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3cd");
 // anx13cdService.save3cd(req, res);
  anx13cdService.save3cdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3cd");
});
router.get('/get3cd', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3cd");
  anx13cdService.get3CDDetailsService(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3cd");
});

router.post('/edit3cd', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3cd");
  // anx13cdService.edit3cd(req, res);
  anx13cdService.edit3cdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3cd");
});

router.post('/delete3cdbydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3cdbydocids");
  //anx13cdService.delete3cdBydocIds(req, res);
  anx13cdService.delete3cdBydocIdsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3cdbydocids");
});

router.post('/delete3cdbyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3cdbyitemids");
  //anx13cdService.delete3cdItemsByItemId(req, res);
  anx13cdService.delete3cdItemsByItemIdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3cdbyitemids");
});


/** 3B table routes */
router.post('/save3b', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3b");
  anx13bService.save3Bdetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3b");
});

router.post('/saveB2BAO', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /saveB2BAO");
  anx1b2baoservice.saveB2BAO(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /saveB2BAO");
});

router.post('/edit3btable', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3btable");
  anx13bService.edit3btable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3btable");
});

router.post('/edit3baotable', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3baotable");
  anx1b2baoservice.edit3BAOtable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3baotable");
});

router.post('/delete3bdocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3bdocids");
  anx13bService.delete3bbydocId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3bdocids");
});
router.post('/delete3bbyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3bbyitemids");
  anx13bService.delete3BItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3bbyitemids");
});

router.post('/delete3baodocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3baodocids");
  anx1b2baoservice.delete3baobydocId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3baodocids");
});
router.post('/delete3baobyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3baobyitemids");
  anx1b2baoservice.delete3BAOItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3baobyitemids");
});

router.post('/edit3B2BA', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3B2BA");
  anx1B2baService.edit3B2BA(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3B2BA");
});

router.post('/edit3efatable', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3efatable");
  anx13efaService.edit3efatable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3efatable");
});

/** 3B table routes - END*/

router.get('/historyfiles', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /historyfiles");
  anx1Service.historyfiles(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /historyfiles");
});

 router.get('/downloadHistory',function(req,res,next){
  let gstin = req.headers.gstin;
  let rtnprd = req.headers.rtnprd;
  let filename = req.headers.filename;
  let ftype = req.headers.ftype;
  let folders = {
          'X' : 'excel',
          'C' : 'csv',
          'E' : 'error'
  }
  let findFolder = folders[ftype];
  let url = 'uploads/anx1/'+ gstin + '/'+ rtnprd + '/'+ findFolder+'/'+filename;
   var pathUrl = req.path;
   if(pathUrl !== '/') {
    res.setHeader('Content-disposition', 'attachment; filename='+filename);
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.download(path.resolve(url),filename,function(err){
            if(err){
                res.status(500).send({status:500, message: 'no such file available', type:'internal'}); 
            }else{
              console.log('downloading the file')
            }
      });
   } else {
       next();
   }
}) 
 

module.exports = router;
