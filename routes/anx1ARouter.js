var express = require('express');
var router = express.Router();
var anx1Service = require('../service/anx1AService/anx1AService');
var anx13cdaService = require('../service/anx1AService/anx13CDAService');
var anx1ImpService = require('../service/anx1Service/anx1ImpService');
var anx14Service = require('../service/anx1AService/anx14AService');
var anx13HService = require('../service/anx1AService/anx13HAService');
var anx13IService = require('../service/anx1AService/anx13IAService');
var anx13JService = require('../service/anx1AService/anx13JAService');
var anx13KService = require('../service/anx1AService/anx13KAService');
var markasinvalidService = require('../service/anx1AService/markAsInvalidService');
// var anx1SummaryService = require('../service/anx1SummaryService');
const logger  = require('../utility/logger').logger;

router.post('/save3aadetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /save3aadetails");
  anx1Service.save3aatable(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /save3aadetails");
});

router.get('/get3aadetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /get3aadetails");
  anx1Service.getTable3aa(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /get3aadetails");
});

router.post('/edit3aadetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /edit3aadetails");
  anx1Service.editTable3aa(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /edit3aadetails");
});

router.post('/markfordelete3aa', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /markfordelete3aa");
  anx1Service.markforDeleteTable(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /markfordelete3aa");
});

router.post('/delete3aabydocid', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /delete3aabydocid");
  anx1Service.delete3aaBydocIds(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /delete3aabydocid");
});

router.post('/delete3aabyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /delete3aabyitemids");
  anx1Service.delete3aaItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /delete3aabyitemids");
});

router.post('/removeAllDataA', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /removeAllData");
  anx1Service.removeDataFromAllATables(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /removeAllData");
});

router.post('/save3cda', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /save3cda");
  anx13cdaService.save3cdaTxn(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /save3cda");
});
router.get('/get3cda', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /get3cda");
  anx13cdaService.get3CDADetailsService(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /get3cda");
});

router.post('/edit3cda', function(req, res) {
  logger.log("info", "Entering routes::: anx1ARouter :: /edit3cd");
  anx13cdaService.edit3cdaTxn(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /edit3cd");
});

router.post('/delete3cdabydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1ARouter :: /delete3cdbydocids");
  anx13cdaService.delete3cdaBydocIdsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /delete3cdbydocids");
});

router.post('/delete3cdabyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1ARouter :: /delete3cdbyitemids");
  anx13cdaService.delete3cdaItemsByItemIdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1ARouter :: /delete3cdbyitemids");
});


router.post('/importjsona', function (req, res) {
  logger.log("info","Entering anx1Router.post");
  anx1ImpService.importJsonA(req,res);
  logger.log("info","Exiting anx1Router.post");
});

/**Router to Import Error Json  */
router.post('/importerrjsona', function (req, res) {
  logger.log("info","Entering anx1Router.post");
  anx1ImpService.importJsonA(req,res);
  logger.log("info","Exiting anx1Router.post");
});

/**  3H table  routes - START*/

router.post('/save3HAdetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3HAdetails");
  anx13HService.saveTab3HTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3HAdetails");
});

router.post('/edit3HAItemDetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3HAItemDetails");
  anx13HService.editTab3HTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3HAItemDetails");
});
 
router.get('/get3HAdetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3HAdetails");
  anx13HService.getTab3Hdetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3HAdetails");
});


router.post('/delete3habydocids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3habydocids");
  anx13HService.delete3HBydocIdsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3habydocids");
});

router.post('/delete3habyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3HAItemsByItemId");
  anx13HService.delete3HItemsByItemIdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3HAItemsByItemId");
}); 

/**  3H table  routes - END*/

/**  table4  routes - START*/
//Save function for table 4
router.post('/savetab4a', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab4a");
    anx14Service.saveTab4Txn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab4a");

});

//Get all details of table 4
router.get('/gettab4adetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /gettab4adetails");
  anx14Service.getTab4details(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /gettab4adetails");
});

//delete by doc_id function for table 4
router.post('/deletetab4abydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /deletetab4abydocids");
  anx14Service.deleteTab4BydocidsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /deletetab4abydocids");
});

//edit function for table 4
router.post('/edittab4a', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /edittab4a");
  anx14Service.editTab4Txn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edittab4a");
});
/**  table4  routes - END*/

/**  3I table  routes - START*/
//save function for table3I
router.post('/savetab3ia', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab3i");
  // anx13iService.saveTab3i(req, res);
  anx13IService.saveTab3IATxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab3i");

});

// Get all details of Table 3I
router.get('/getalltab3ia', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getalltab3i");
  anx13IService.getTab3IAdetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getalltab3i");

});

// Edit function of Table3I with Transaction code .
router.post('/edittabtran3ia', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edittabtran3i");
  // anx13iService.editTabtran3i(req, res);
  anx13IService.editTab3IATxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edittabtran3i");
});


// delete function by doc_id for table 3I
router.post('/deletetab3iabydocids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3ibydocids");
  // anx13iService.deleteTab3iBydocids(req, res);
  anx13IService.deleteTab3IABydocidsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /deletetab3ibydocids");

});

// delete function by item_id for table 3I
router.post('/deletetab3iabyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3ibyitemids");
  // anx13iService.deleteTab3iByItemId(req, res);
  anx13IService.deleteTab3IAByItemIdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /deletetab3ibyitemids");
});

/**   Table 3I  routes - END*/

/**  3J table  routes - START*/
//save function for table3J
router.post('/savetab3ja', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab3j");
  anx13JService.saveTab3jaTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab3j");
});

// Get all details of Table 3j
router.get('/getalltab3ja', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getalltab3j");
  anx13JService.getTab3jadetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getalltab3j");

});

// Edit function of Table3j
router.post('/edittab3ja', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edittab3j");
  anx13JService.editTab3jaTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edittab3j");
});

// delete function by doc_id for table 3j
router.post('/deletetab3jabydocids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3jbydocids");
  anx13JService.deleteTab3jaBydocidsTxn(req, res);
  logger.log("info", "Exiing routes::: anx1Router :: /deletetab3jbydocids");
});

// delete function by item_id for table 3j
router.post('/deletetab3jabyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3jbydocids");
  anx13JService.deleteTab3jaByItemIdTxn(req, res);
   logger.log("info", "Exiting routes::: anx1Router :: /deletetab3jbydocids");
});
/**   Table 3J  routes - END*/

/**  3K table  routes - START*/
router.post('/save3ka', function(req, res) {
  anx13KService.save3KA(req,res);
});

router.get('/get3ka', function(req, res) {
  anx13KService.get3KA(req, res);
});

// Edit function of Table3K
router.post('/edit3Katable', function(req, res) {
  // console.log('Entering router');
  anx13KService.edit3KAtable(req, res);
});

// delete function by doc_id for table 3K
router.post('/delete3kabydocids', function(req, res){
  // console.log('Entering router');
  anx13KService.delete3KABydocIds(req, res);
});

// delete function by item_id for table 3K
router.post('/delete3kabyitemids', function(req, res){
  anx13KService.delete3kaByItemId(req, res);
});
/**  3K table  routes - END*/

router.post('/markasinvalid' , function(req,res){
  markasinvalidService.markasinvalid(req,res)
})

router.get('/getamd' , function(req,res){
  markasinvalidService.getAmdNo(req,res)
})

router.post('/markfordeletea' , function(req,res){
  markasinvalidService.markForDeletea(req,res)
})

router.post('/iseligiblea' , function(req,res){
  markasinvalidService.isEligible(req,res)
})
module.exports = router;
