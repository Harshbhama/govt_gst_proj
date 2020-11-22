var express = require('express');
var router = express.Router();
const log  = require('../../utility/logger');
var anx1Service = require('../../service/anx1Service');
var anx14Service = require('../../service/anx1Service/anx14Service');
var anx13iService = require('../../service/anx1Service/anx13iService');
var anx1ImpService = require('../../service/anx1Service/anx1ImpService');
var anx13efService = require('../../service/anx1Service/anx13efService');
var anx13gService = require('../../service/anx1Service/anx13gService');
var anx13kService = require('../../service/anx1Service/anx13kService');
var anx13lService = require('../../service/anx1Service/anx13lService');
var anx1B2baoService = require('../../service/anx1Service/anx1b2baoservice');
var anx1B2baService = require('../../service/anx1Service/anx1B2baService');
const logger  = require('../../utility/logger').logger;
var anx13jService = require('../../service/anx1Service/anx13jService');
var anx13HService = require('../../service/anx1Service/anx13HService');
var anx1ImpExcelService = require('../../service/anx1Service/anx1ImpExcelService');
var anx1excelcsvService = require('../../service/anx1Service/anx1ExpExcelcsvservice');
var markForDeleteService = require('../../service/anx1Service/markForDeleteService');
var anx13efaService = require('../../service/anx1Service/anx13efaService');
var anx13gaService = require('../../service/anx1Service/anx13gaService');


/**Export Excel */
router.get('/exportXls/:gstin/:rtnprd/:taxperiod/:fp/:profile/:flag/:orgrtnprd', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /exportXls");
  anx1excelcsvService.exportXls(req, res);
});

/**Export Amend Excel */
router.get('/exportXlsA/:gstin/:rtnprd/:taxperiod/:fp/:profile/:flag/:orgrtnprd', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /exportXlsA");
  anx1excelcsvService.exportXlsA(req, res);
});

/**Export CSV */
   router.get('/exportCsv/:gstin/:rtnprd/:taxperiod/:fp/:profile/:flag/:orgrtnprd/:selectedTable', function(req, res) {
   logger.log("info", "Entering routes::: anx1Router :: /exportCsv");
   anx1excelcsvService.exportCsv(req, res);
  });

  /**Export Amend CSV */
  router.get('/exportCsvA/:gstin/:rtnprd/:taxperiod/:fp/:profile/:flag/:orgrtnprd/:selectedTable', function(req, res) {
    logger.log("info", "Entering routes::: anx1Router :: /exportCsvA");
    anx1excelcsvService.exportCsvA(req, res);
   });

/**Download ErrJson Excel*/

router.post('/DownloaderrJson', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /DownloaderrJson");
  anx1excelcsvService.DownloaderrJson(req, res);
 });

 /**Download ErrJson Excel*/

router.post('/DownloaderrJsonA', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /DownloaderrJsonA");
  anx1excelcsvService.DownloaderrJsonA(req, res);
 });

/**  table4  routes - START*/
//Save function for table 4
router.post('/savetab4', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab4");
    anx14Service.saveTab4Txn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab4");

});

//Get all details of table 4
router.get('/gettab4details', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /gettab4details");
  anx14Service.getTab4details(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /gettab4details");
});

//delete by doc_id function for table 4
router.post('/deletetab4bydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /deletetab4bydocids");
  anx14Service.deleteTab4BydocidsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /deletetab4bydocids");
});

//edit function for table 4
router.post('/edittab4', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /edittab4");
  anx14Service.editTab4Txn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edittab4");
});
/**  table4  routes - END*/



/**  3I table  routes - START*/
//save function for table3I
router.post('/savetab3i', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab3i");
  // anx13iService.saveTab3i(req, res);
  anx13iService.saveTab3iTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab3i");

});

// Get all details of Table 3I
router.get('/getalltab3i', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getalltab3i");
  anx13iService.getTab3idetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getalltab3i");

});

// Edit function of Table3I with Transaction code .
router.post('/edittabtran3i', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edittabtran3i");
  // anx13iService.editTabtran3i(req, res);
  anx13iService.editTab3iTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edittabtran3i");
});


// delete function by doc_id for table 3I
router.post('/deletetab3ibydocids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3ibydocids");
  // anx13iService.deleteTab3iBydocids(req, res);
  anx13iService.deleteTab3iBydocidsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /deletetab3ibydocids");

});

// delete function by item_id for table 3I
router.post('/deletetab3ibyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3ibyitemids");
  // anx13iService.deleteTab3iByItemId(req, res);
  anx13iService.deleteTab3iByItemIdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /deletetab3ibyitemids");
});

/**   Table 3I  routes - END*/


// Import Json function for anx1
router.post('/importjson', function (req, res) {
  logger.log("info","Entering anx1Router.post");
  anx1ImpService.importJson(req,res);
  logger.log("info","Exiting anx1Router.post");
});

/* Added for Import Excel -Prakash */
router.post('/saveExcel', function(req, res){
  logger.log("info","Entering anx1Router.saveExcel");
  anx1ImpExcelService.saveExcelData(req, res);
  logger.log("info","Exiting anx1Router.saveExcel");
});

router.post('/saveExcelA', function(req, res){
  logger.log("info","Entering anx1Router.saveExcelA");
  anx1ImpExcelService.saveExcelAData(req, res);
  logger.log("info","Exiting anx1Router.saveExcelA");
});

/* Added for Import Excel History -Prakash */
router.get('/getHistory', function(req, res){
  logger.log("info","Entering anx1Router.getFileHistory");
  anx1ImpExcelService.getFileHistory(req, res);
  logger.log("info","Exiting anx1Router.getFileHistory");
});

router.post('/saveBlobService', function(req, res){
  logger.log("info","Entering anx1Router.saveBlobService");
  anx1ImpExcelService.saveBlobService(req, res);
  logger.log("info","Exiting anx1Router.saveBlobService");
});
/* Added for Create Json Object -Prakash */
router.post('/createJson', function(req, res){
  logger.log("info","Entering anx1Router.createJson");
 
  anx1ImpExcelService.createJsonObject(req, res);

  logger.log("info","Exiting anx1Router.createJson");
});

router.post('/createJsona', function(req, res){
  logger.log("info","Entering anx1Router.createJsonA");
 
  anx1ImpExcelService.createJsonObjectA(req, res);

  logger.log("info","Exiting anx1Router.createJsonA");
});

/** 3EF table routes - START*/
router.post('/save3ef', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3ef");
  anx13efService.save3EFdetails(req,res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3ef");
});

router.get('/get3ef', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3ef");
  anx13efService.get3efDetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3ef");
});

// Edit function of Table3EF
router.post('/edit3eftable', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3eftable");
  anx13efService.edit3eftable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3eftable");
});

// delete function by doc_id for table 3EF
router.post('/delete3efbydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3efbydocids");
  anx13efService.delete3efBydocIds(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3efbydocids");
});

// delete function by item_id for table 3EF
router.post('/delete3efbyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3efbyitemids");
  anx13efService.delete3efItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3efbyitemids");
});

/** 3EF table routes - END*/

/** 3G table routes - START*/
router.post('/save3g', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3g");
  anx13gService.save3Gdetails(req,res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3g");
});

router.get('/get3g', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3g");
  anx13gService.get3GDetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3g");
});

// Edit function of Table3G
router.post('/edit3Gtable', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3Gtable");
  anx13gService.edit3Gtable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3Gtable");
});

// delete function by doc_id for table 3G
router.post('/delete3gbydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3gbydocids");
  anx13gService.delete3GBydocIds(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3gbydocids");
});

// delete function by item_id for table 3G
router.post('/delete3gbyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3gbyitemids");
  anx13gService.delete3gByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3gbyitemids");
});

/** 3G table routes - END*/


/**  3J table  routes - START*/
//save function for table3J
router.post('/savetab3j', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab3j");
  anx13jService.saveTab3jTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab3j");
});

// Get all details of Table 3j
router.get('/getalltab3j', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /getalltab3j");
  anx13jService.getTab3jdetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /getalltab3j");

});

// Edit function of Table3j
router.post('/edittab3j', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edittab3j");
  anx13jService.editTab3jTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edittab3j");
});

// delete function by doc_id for table 3j
router.post('/deletetab3jbydocids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3jbydocids");
  anx13jService.deleteTab3jBydocidsTxn(req, res);
  logger.log("info", "Exiing routes::: anx1Router :: /deletetab3jbydocids");
});

// delete function by item_id for table 3j
router.post('/deletetab3jbyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /deletetab3jbydocids");
   anx13jService.deleteTab3jByItemIdTxn(req, res);
   logger.log("info", "Exiting routes::: anx1Router :: /deletetab3jbydocids");
});
/**   Table 3J  routes - END*/

/**  3K table  routes - START*/
router.post('/save3k', function(req, res) {
  anx13kService.save3K(req,res);
});

router.get('/get3k', function(req, res) {
  anx13kService.get3K(req, res);
});

// Edit function of Table3K
router.post('/edit3Ktable', function(req, res) {
  // console.log('Entering router');
  anx13kService.edit3Ktable(req, res);
});

// delete function by doc_id for table 3K
router.post('/delete3kbydocids', function(req, res){
  // console.log('Entering router');
  anx13kService.delete3KBydocIds(req, res);
});

// delete function by item_id for table 3K
router.post('/delete3kbyitemids', function(req, res){
  anx13kService.delete3kByItemId(req, res);
});
/**  3K table  routes - END*/

/**Router to Import Error Json  */
router.post('/importerrjson', function (req, res) {
  logger.log("info","Entering anx1Router.post");
  anx1ImpService.importJson(req,res);
  logger.log("info","Exiting anx1Router.post");
});

/**Router to Import Error Json ends */

/**  3H table  routes - START*/

router.post('/save3Hdetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /save3Hdetails");
  anx13HService.saveTab3HTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /save3Hdetails");
});

router.post('/edit3HItemDetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3HItemDetails");
  anx13HService.editTab3HTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3HItemDetails");
});
 
router.get('/get3Hdetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3Hdetails");
  anx13HService.getTab3Hdetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3Hdetails");
});


router.post('/delete3hbydocids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3hbydocids");
  anx13HService.delete3HBydocIdsTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3hbydocids");
});

router.post('/delete3hbyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3HItemsByItemId");
  anx1Service.delete3HItemsByItemId(req, res);
  // anx13HService.delete3HItemsByItemIdTxn(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3HItemsByItemId");
}); 

/**  3H table  routes - END*/

/**  table3L  routes - START*/
//Save function for table 3L
router.post('/savetab3L', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /savetab3L");
    anx13lService.save3Ldetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /savetab3L");

});

//Get all details of table 3L
router.get('/get3Ldetails', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /gettab3Ldetails");
  anx13lService.get3LDetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /gettab3Ldetails");
});


// delete function by doc_id for table 3L
router.post('/delete3lbydocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3lbydocids");
  anx13lService.delete3LBydocIds(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3lbydocids");
});

// delete function by item_id for table 3L
router.post('/delete3lbyitemids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3lbyitemids");
  anx13lService.delete3lByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3lbyitemids");
});


// Edit function of Table3L
router.post('/edit3Ltable', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /edit3Ltable");
  anx13lService.edit3Ltable(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /edit3Ltable");
});
/**  3L table  routes - END*/

 //** Mark for delete routers */
 router.post('/iseligible' , function(req,res){
   markForDeleteService.isEligible(req,res)
 })

 router.post('/markfordelete' , function(req,res){
  markForDeleteService.markForDelete(req,res)
})

/**  B2BAO table  routes - START*/
router.post('/saveB2BAO', function(req, res) {
  anx1B2baoService.saveB2BAO(req,res);
});


router.post('/edit3B2BAOtable', function(req, res) {
  anx1B2baoService.edit3B2BAOtable(req, res);
 });


/**  B2BAO table  routes - END*/


/**  B2BA table  routes - START*/

//router.post('/edit3B2BA', function(req, res) {
 // logger.log("info", "Entering routes::: anx1Router :: /edit3B2BA");
  //anx1B2baService.edit3B2BA(req,res);
//});


router.get('/get3ba', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3ba");
  anx1B2baService.get3ba(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3ba");
});


router.post('/delete3badocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3badocids");
  anx1B2baService.delete3babydocId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3badocids");
});

router.post('/delete3babyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3babyitemids");
  anx1B2baService.delete3BAItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3babyitemids");
});
/**  B2BA table  routes - END*/

/** SEZA(3EA and 3FA routes ---begin) */
router.get('/get3efa', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3efa");
  console.log("Here1")
  anx13efaService.get3efaDetails(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3efa");
});

router.post('/delete3efadoc', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3efadoc");
  anx13efaService.delete3EFAdoc(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3efadoc");
});

router.post('/delete3efaitem', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3EFAItem");
  anx13efaService.delete3EFAItem(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3EFAItem");
});


/** SEZA(3EA and 3FA routes ---end) */

/** DEA(3GA routes ---begin) */
router.get('/get3ga', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /get3ga");
  anx13gaService.get3ga(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /get3ga");
});

router.post('/editDEA', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /editDEA");
  anx13gaService.editDEA(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /editDEA");
});



router.post('/delete3gadocids', function(req, res){
  logger.log("info", "Entering routes::: anx1Router :: /delete3gadocids");
  anx13gaService.delete3gabydocId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3gadocids");
});

router.post('/delete3gabyitemids', function(req, res) {
  logger.log("info", "Entering routes::: anx1Router :: /delete3gabyitemids");
  anx13gaService.delete3GAItemsByItemId(req, res);
  logger.log("info", "Exiting routes::: anx1Router :: /delete3gabyitemids");
});
/** DEA(3GA routes ---end) */


module.exports = router;
