var markasInvalidDao = require('../../dao/anx1ADao/markAsInvalidDao');
const logger  = require('../../utility/logger').logger;
const anx1aImpDao = require("../../dao/anx1ADao/anx1AImpDao");
const { getConnection } = require("../../db/dbUtil");

function markasinvalid(req,res){
    logger.log("info", "Entering markAsInvalidService.js:: markAsInvalid ");
    let tablename = req.body.tablename;
    let rtnprd = req.body.rtnprd;
    let gstin = req.headers["gstin"];
    let docid = req.body.docid;
    let docref = req.body.docref
    let flag = req.body.flag;
    let status = req.body.status;
    let fp = req.headers["fp"];
    markasInvalidDao.markAsInvalid(tablename,rtnprd,fp,docid,flag,gstin,status, docref)
    .then(function(data){
        res.status(201).send(data);
    })
    .catch(function(err){
        res.status(500).send(err);
    })
}

function markForDeletea(req,res){
    logger.log("info", "Entering markForDeleteService.js:: markForDelete ");
    let tablename = req.body.tablename;
    let rtnprd = req.body.rtnprd;
    let gstin = req.headers["gstin"];
    let docid = req.body.docid;
    let flag = req.body.flag;
    let fp = req.headers["fp"];
    markasInvalidDao.markForDeletea(tablename,rtnprd,fp,docid,flag,gstin)
    .then(function(data){
        res.status(201).send(data);
    })
    .catch(function(err){
        res.status(500).send(err);
    })
}

function isEligible(req, res) {
    logger.log("info", "Entering markAsInvalidService.js:: isEligible ");
    let tablename = req.body.tablename;
    let rtnprd = req.body.rtnprd;
    let gstin = req.headers["gstin"];
    markasInvalidDao.isEligible(tablename, rtnprd , gstin)
    .then(function(data){
        res.status(201).send(data);
    })
    .catch(function(err){
        res.status(500).send(err);
    })
}

function getAmdNo(req,res){
    let rtnprd = req.headers["rtnprd"];
    let fp = req.headers["fp"];
    let dbObj = getConnection(req.headers["gstin"]);
    anx1aImpDao.getamdno(fp, rtnprd, 'AMD', dbObj) 
    .then(function(data){
        console.log('DATA', data);
        res.status(201).send(data);
    })
    .catch(function(err){
        res.status(500).send(err);
    })
}

module.exports={
    isEligible : isEligible,
    markasinvalid:markasinvalid,
    markForDeletea:markForDeletea,
    getAmdNo:getAmdNo
}