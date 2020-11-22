var express = require('express');
var router = express.Router();
var matchService = require('../service/matchToolService');
// to fetch data for tables progress bar status
router.get('/getPrgBar', function(req, res) {
  console.log('info', 'Entering routes:: matchRouter :: /getPrgBar');
  matchService.getData(req, res);
});
router.get('/purchaseReg', function(req, res){
  console.log('Info', 'Enter routes:: matchRouter :: /purchaseReg');
  matchService.getPRSupplierWise(req, res);
});
router.get('/recordsByGstn', function(req, res){
  console.log('Info', 'Enter routes:: matchRouter :: /recordsByGstn');
  matchService.getRecordsByIds(req, res);
});
router.post('/saveProgress', function(req, res){
  console.log('Info', 'Enter routes:: matchRouter :: /saveProgress');
  matchService.saveData(req, res);
});
router.post('/deleteProgress', function(req, res){
  console.log('Info', 'Enter routes:: matchRouter :: /deleteProgress');
  matchService.deleteData(req, res);
});
router.get('/getDocRecords', function(req, res){
  console.log('Info', 'Enter routes:: matchRouter :: /getDocRecords');
  matchService.getDocRecords(req, res);
});
router.post('/savesummary', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /savesummary");
	matchService.saveSummary(req, res);
});
router.post('/saveprdetails', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /saveprdetails");
	matchService.savePRDetails(req, res);
});
router.get('/getprsummary', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /getprsummary");
	matchService.getPRSummary(req, res);
});
router.get('/getMatchResults',function(req,res){
   console.log("info", "Entering routes:: getMatchResults :: /getMatchResults");
	 matchService.getMatchResults(req, res);
})


router.post('/deleteprdetails', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /deleteprdetails");
	matchService.deletePrDetails(req, res);
});
router.post('/saveMatchSummary', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /saveMatchSummary");
	matchService.saveMatchSummary(req, res);
});
router.post('/saveMrDetails',function(req,res){
  console.log("info", "Entering routes:: matchRouter :: /saveMrDetails");
	matchService.saveMrDetails(req, res);
})
router.get('/getMatchSummary', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /getMatchSummary");
	matchService.getMatchSummary(req, res);
});
router.get('/getMatchWiseResult',function(req,res){
    console.log("info","Entering routes:: matchRouter :: /getMatchWiseResult");
    matchService.getMatchWiseResult(req,res)
});
router.post('/saveActions',function(req,res){
  console.log("info","Entering routes:: matchRouter :: /saveActions");
  matchService.saveActions(req,res);
});
router.get('/getRefineData',function(req,res){
  console.log("info","Entering routes:: matchRouter :: /getRefineData");
  matchService.getRefineData(req,res)
})

router.post('/updateMrDetails',function(req,res){
  console.log("info","Entering routes:: updateMrDetails :: /updateMrDetails");
  matchService.updateMrDetails(req,res)
})

router.post('/updateAnx2Tables',function(req,res){
  console.log("info","Entering routes:: updateAnx2Tables :: /updateAnx2Tables");
  matchService.updateAnx2Tables(req,res)
})

router.get('/getRefineMatchSummary',function(req,res){
  console.log("info","Entering routes:: getRefineMatchSummary :: /getRefineMatchSummary");
  matchService.getRefineMatchSummary(req,res)
})
router.post('/deleteMatchSummaryTables', function (req, res) {
	console.log("info", "Entering routes:: matchRouter :: /deleteMatchSummaryTables");
	matchService.deleteMatchSummaryTables(req, res);
});
router.post('/updateMatchingSummary',function(req,res){
  console.log("info", "Entering routes:: matchRouter :: /updateMatchingSummary");
	matchService.updateMatchingSummary(req, res);
})
router.get('/getApprxTolerance',function(req,res){
  console.log("info","Entering routes:: getApprxTolerance :: /getApprxTolerance");
  matchService.getApprxTolerance(req,res)
})

router.post("/resetRefineData",function(req,res){
  console.log("info","Entering routes:: resetRefineData :: /resetRefineData");
  matchService.resetRefineData(req,res)
})

router.get("/geterrorfile",function(req,res){
  console.log("info","Entering routes:: getErrorFile :: /geterrorfile");
  matchService.getErrorFile(req,res)
})

router.post("/saveerrorfile",function(req,res){
  console.log("info","Entering routes:: saveErrorFile :: /saveerrorfile");
  matchService.saveErrorFile(req,res)
})

router.post("/updatematchstatus",function(req,res){
  console.log("info","Entering routes:: saveErrorFile :: /saveerrorfile");
  matchService.updateMatchStatus(req,res)
})
router.post("/updatePrmRecords",function(req,res){
  console.log("info","Entering routes:: updatePrmRecords :: /saveerrorfile");
  matchService.updatePrmRecords(req,res)
})
router.get("/getMatchNumber",function(req,res){
  console.log("info","Entering routes:: getErrorFile :: /geterrorfile");
  matchService.getMaxMatchNumber(req,res)
})
module.exports = router;
