var express = require('express');
var router = express.Router();
var serviceProfile = require('../service/userProfileService');
var jsonservice = require('../service/generatejson');


/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('index.html', { title: 'Express' });
});*/
router.get('/', function (req, res, next) {
  res.sendFile('index.html', { root: './public/' });
});


router.get('/generateJson', function (req, res) {
  console.log('Inside generate json ', req.query.gstin, req.query.rtnprd, req.query.taxperiod, req.query.fp, req.query.profile, req.query.flag, req.query.issez);
  jsonservice.generateJson(req, res);
}
);

router.get('/generateJsona', function (req, res) {
  console.log('Inside generate json ', req.query.gstin, req.query.rtnprd, req.query.taxperiod, req.query.fp, req.query.profile, req.query.flag, req.query.issez);
  jsonservice.generateJsonA(req, res);
}
);


router.post('/deleteProfile', function (req, res) {
  console.log('deleting');
  serviceProfile.deleteProfile(req, res);
});

router.get('/selectallProfile', function (req, res, next) {
  serviceProfile.selectallProfile(req, res);
}
);

router.post('/updateProfile', function (req, res, next) {
  serviceProfile.modifyProfile(req, res);
}
);

router.post('/upload', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    res.json({ error_code: 0, err_desc: null });
  });
});
router.get('/getStateMaster', function (req, res, next) {
  serviceProfile.getStatMstrList(req, res);
}
);

router.get('/gethsnmstrdetails', function (req, res, next) {
  serviceProfile.getHsnMasterList(req, res);
}
);
router.get('/getratemstrdetails', function (req, res, next) {
  serviceProfile.getrateMstrList(req, res);
}
);


module.exports = router;
