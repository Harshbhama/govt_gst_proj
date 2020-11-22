var express = require('express');
var router = express.Router();
var userProfileService = require('../service/userProfileService');
const logger  = require('../utility/logger').logger;

/**
 * Route create user Profile to Service layer
 * @param  {} req
 * @param  {} res
 * @param  {} next is middle call
 */
router.post('/createProfile', function(req, res, next) {
  logger.log("info", "Entering routes::: userProfileRouter :: /createProfile");
  userProfileService.createProfile(req, res);
  logger.log("info", "Exiting routes::: userProfileRouter :: /createProfile");
});

router.get('/getgstinlist', function(req, res) {
  logger.log("info", "Entering routes::: userProfileRouter :: /getgstinlist");
  userProfileService.getGstMstrList(req, res);
  logger.log("info", "Exiting routes::: userProfileRouter :: /getgstinlist");
});


router.get('/getprofile/:gstin', function(req, res) {
  logger.log("info", "Entering routes::: userProfileRouter :: /getprofile");
  userProfileService.getActiveUserProfile(req, res);
  logger.log("info", "Exiting routes::: userProfileRouter :: /getprofile");
});

router.post('/modifyprofile', function(req, res) {
  logger.log("info", "Entering routes::: userProfileRouter :: /modifyprofile");
  userProfileService.updateProfileOnLogin(req, res);
  logger.log("info", "Exiting routes::: userProfileRouter :: /modifyprofile");
});

module.exports = router;
