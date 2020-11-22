var markForDeleteDao = require('../../dao/anx1Dao/markForDeleteDao');
const logger  = require('../../utility/logger').logger;

function isEligible(req, res) {
    logger.log("info", "Entering markForDeleteService.js:: isEligible ");
    let tablename = req.body.tablename;
    let rtnprd = req.body.rtnprd;
    let gstin = req.headers["gstin"];
    markForDeleteDao.isEligible(tablename, rtnprd , gstin)
    .then(function(data){
        res.status(201).send(data);
    })
    .catch(function(err){
        res.status(500).send(err);
    })
}

function markForDelete(req,res){
    logger.log("info", "Entering markForDeleteService.js:: markForDelete ");
    let tablename = req.body.tablename;
    let rtnprd = req.body.rtnprd;
    let gstin = req.headers["gstin"];
    let docid = req.body.docid;
    let flag = req.body.flag;
    let fp = req.headers["fp"];
   if(flag !== 'MFR'){ 
        markForDeleteDao.markForDelete(tablename,rtnprd,fp,docid,flag,gstin)
        .then(function(data){
            res.status(201).send(data);
        })
        .catch(function(err){
            res.status(500).send(err);
        })
   }else{
        markForDeleteDao.updateMFR(tablename,docid,rtnprd,gstin,fp).then(function(data){
            res.status(201).send(data);
        })
        .catch(function(err){
            res.status(500).send(err);
        })
   }
}

module.exports={
    isEligible : isEligible,
    markForDelete:markForDelete
}