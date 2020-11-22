const userProfileDao = require("../dao/userProfileDao");
const constants = require("../utility/constants.js");
//const logger = require("../utility/logger.js");
const Promise = require("bluebird");
const { STATUS_200, STATUS_500 } = require("../utility/errorconstants.js");
const { sendResponse } = require("../utility/common");
const _ = require("lodash");
const path = require("path");
const logger = require("../utility/logger").logger;

//********TO GET all GSTIN_MSTR data ***************************
function getGstMstrList(req, res) {
  userProfileDao
    .getGstMstrList(req, res)
    .then(function(data) {
      res.status(201).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

function getStatMstrList(req, res) {
  userProfileDao
    .getStatMstrList(req, res)
    .then(function(data) {
      res.status(201).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

/* To get the active profile details of the selected GSTIN*/
function getActiveUserProfile(req, res) {
  // if request body sent Null
  if (
    req.params === undefined ||
    req.params.gstin === null ||
    req.params.gstin === undefined
  ) {
    res.status(500).send('{ message: "GSTIN is required",statusCd: "0"}');
  }
  userProfileDao
    .getActiveUserProfile(req.params.gstin.toUpperCase())
    .then(function(data) {
      res.status(201).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

/* To check and update the taxperiod and fy in user profile during login   */
function updateProfileOnLogin(req, res) {
  // if request body sent Null
  if (
    req.body === undefined ||
    req.body === null ||
    !Object.keys(req.body).length > 0
  ) {
    res.status(500).send('{ message: "Request Body is Empty",statusCd: "0"}');
  }

  let profileObj = {
    gstin: req.body.gstin || `null`,
    fp: req.body.fp || "NA",
    taxperiod: req.body.taxperiod || "NA"
  };

  userProfileDao
    .updateProfileOnLogin(profileObj)
    .then(function(data) {
      res.status(201).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

/**
 * Create A user Profile using array of objects where each object contains below details
 * @param  {}   "gstin",
 * @param  {}   "legalname",
 * @param  {}   "issezunit",
 * @param  {}   "filingfrequency",
 * @param  {}   "returntype",
 * @param  {}   "fp",
 * @param  {}   "taxperiod"
 */
async function createProfile(req, res) {
  logger.log("info", "Entering routes::: userProfileService :: /createProfile");
  if (_.isEmpty(req.body)) {
    sendResponse(res, 500, { message: "Request Body is Empty", statusCd: "0" });
  } else {
    if (Array.isArray(req.body.userprofiles) && req.body.userprofiles.length) {
      let checkInput = _.map(req.body.userprofiles, userProfile => {
        return !userProfile.returntype.trim()
          ? "returntype"
          : !userProfile.filingfrequency.trim()
          ? "filingfrequency"
          : !userProfile.filingfrequency.length > 99
          ? "99"
          : !userProfile.issezdev.trim()
          ? "issezdev"
          : false;
      });

      let err = "";
      if (!checkInput.includes(false)) {
        sendResponse(res, 500, {
          stack: `${_.compact(checkInput)[0]} should not be null`,
          statusCd: "0"
        });
      } else if (checkInput.includes("99")) {
        sendResponse(res, 500, {
          stack: `Upto 99 chracters are allowed for legal or trade name`,
          statusCd: "0"
        });
      } else {
        let userProfiles = _.map(req.body.userprofiles, userProfile => {
          return {
            gstin: userProfile.gstin || null,
            lgltrdname: userProfile.lgltrdname || " ",
            issezdev: userProfile.issezdev || null,
            filingfrequency: userProfile.filingfrequency || null,
            returntype: userProfile.returntype,
            fp: userProfile.fp || `NA`,
            taxperiod: userProfile.taxperiod || `NA`,
            isactive: userProfile.isactive || "Y",
            matchngRsltAvbl: userProfile.matchngRsltAvbl || "N"
          };
        });

        await userProfileDao
          .createProfileDao(userProfiles)

          .then(result => {

           logger.log("info","Create User Profile Result : %s" ,  JSON.stringify(result));
            
            sendResponse(res, 200, result);
            // res.status(STATUS_200).send(result)
          })
          .catch(err => {
            
            logger.log("info","Create User Profile Error : %s" ,  JSON.stringify(err));
            let data = { message: err.stack, statusCd: "0" };
            sendResponse(res, 500, data);
            // res.status(500).send(err)
          });
      }
    } else {
      let data = {
        message: "UserProfile array should not be Empty",
        statusCd: "0"
      };
      sendResponse(res, 200, data);
      // res.status(STATUS_500).send()
    }
  }
}

function deleteProfile(req, res) {
  //console.log(req.params.gstin);
  if (req.body === undefined || req.body === null) {
    throw new Error("Request Body not Found");
  }
  var gstin = new Array();
  gstin = req.body.gstin;
  userProfileDao
    .deleteProfileDao(gstin)
    .then(function(data) {
      res.status(201).json(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

function selectallProfile(req, res) {
  userProfileDao
    .selectProfileDao()
    .then(function(data) {
      res.status(201).json(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

function modifyProfile(req, res) {
  if (req.body === undefined || req.body === null) {
    throw new Error("Request Body not Found");
  }
  var length = req.body.userprofiles.length;
  for (var i = 0; i < length; i++) {
    if (i != length - 1)
      userProfileDao.modifyProfileDao(
        req.body.userprofiles[i].lgltrdname,
        req.body.userprofiles[i].issezdev,
        req.body.userprofiles[i].filingfrequency,
        req.body.userprofiles[i].returntype,
        req.body.userprofiles[i].gstin
      );
    else {
      userProfileDao
        .modifyProfileDao(
          req.body.userprofiles[i].lgltrdname,
          req.body.userprofiles[i].issezdev,
          req.body.userprofiles[i].filingfrequency,
          req.body.userprofiles[i].returntype,
          req.body.userprofiles[i].gstin
        )

        .then(function(data) {
          res.status(201).json(data);
        })
        .catch(function(err) {
          res.status(500).send(err);
        });
    }
  }
}

// To get all hsn code and hsn description from hsn master table
function getHsnMasterList(req, res) {
  userProfileDao
    .getHsnMasterList(req, res)
    .then(function(data) {
      res.status(200).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

// To get all master rate from rate master table
function getrateMstrList(req, res) {
  userProfileDao
    .getrateMstrList(req, res)
    .then(function(data) {
      res.status(200).send(data);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}

module.exports = {
  createProfile: createProfile,
  getGstMstrList: getGstMstrList,
  getActiveUserProfile: getActiveUserProfile,
  updateProfileOnLogin: updateProfileOnLogin,
  modifyProfile: modifyProfile,
  selectallProfile: selectallProfile,
  deleteProfile: deleteProfile,
  getStatMstrList: getStatMstrList,
  getHsnMasterList: getHsnMasterList,
  getrateMstrList: getrateMstrList
};
