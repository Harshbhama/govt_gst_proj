var express = require('express');
var constant = require('../utility/constants.js');
var error = require('../utility/errorconstants.js');
var anx2Dao = require('../dao/anx2Dao');
var userProfileDao = require('../dao/userProfileDao');
var fs = require('fs');
const log  = require('../utility/logger.js');
const logger = log.logger;
var anx2const = require('../utility/anx2Constant.js');
var anx2errDao=require('../dao/anx2Dao/anx2ErrDao');
const { OFFLINE_TOOL_DB, STATUS_CD_ZERO, STATUS_CD_ONE, DB_PATH } = require('../utility/constants');


/**
 * TO GET all 3B,3E,3F,3G tables data
 * @param {*} req
 * @param {*} res
 */
function getDocWiseData (req, res) {
    logger.log("info","Entering anx2Service.js :: getDocWiseData");
    let actn = req.query.actn;
    if(actn != ''){
        anx2Dao.getDataWithActn(req,res).
    then(function (data) {
        for(let i=0; i<data.length;i++){
            data[i].isSelected=false;
        }
        logger.log("debug", "anx2service.js :: getDocWiseData :: exporting data to UI");
        logger.log("info","Exiting anx2Service.js :: getDocWiseData");
        res.status(201).send(data)
    }).catch(function (err) {
        logger.log("error", "anx2Service.js ::  getDocWiseData :: Error in fetching data:: %s",err);
        res.status(500).send(err)
    })
}else{
    anx2Dao.getData(req,res).
    then(function (data) {
        for(let i=0; i<data.length;i++){
            data[i].isSelected=false;
        }
        res.status(201).send(data)
    }).catch(function (err) {
        logger.log("error", "anx2Service.js ::  getDocWiseData :: Error in fetching data:: %s",err);
        res.status(500).send(err)
    })
}
};
/**
 * to get table5(ISDC) data
 * @param {*} req
 * @param {*} res
 */
function gettb5Data(req,res){
    logger.log("info","Entering anx2Service.js :: gettb5Data");
    anx2Dao.gettb5Data(req,res).
    then(function (data) {
        for(let i=0; i<data.length;i++){
            data[i].isSelected=false;
        }
        logger.log("debug", "anx2service.js :: gettb5Data :: exporting data to UI");
        logger.log("info","Exiting anx2Service.js :: gettb5Data");
        res.status(201).send(data)
    }).catch(function (err) {
        logger.log("error", "anx2Service.js :: gettb5Data :: Error in fetching table5 data  :: %s",err);
        res.status(500).send(err)
    })
};
/**
 * to open downloaded Json file
 * @param {*} req
 * @param {*} res
 */
function downldJson(req, res) {
    logger.log("info","Entering anx2Service.js :: downldJson START TIME");
    logger.log("debug", " Inside anx2Service :: %s",req.body);
    var fileData = req.body;
        anx2Dao.persistData(fileData, fileData.gstin).then((result) => {
                logger.log("debug"," Inside success :: %s",result);
                logger.log("info","Exiting anx2Service.js :: downldJson END TIME");
                res.status(200).send("File Processed Successfully");
            }).catch((err) => {
                logger.log("error","error occured :: %s",err)
                res.status(500).send({ message: 'Unable to process file', statusCd: STATUS_CD_ZERO });
            });

}

/**
 * to reset Action for the selected gstins
 * @param {*} req
 * @param {*} res
 */
function resetAction(req,res){
   logger.log("info","Entering anx2Service.js ::resetAction");
    anx2Dao.saveActionData(req).then((result)=>{
        logger.log("info","Exiting anx2Service.js ::resetAction");
        res.status(200).send("Reset done successfully");
    }).catch((err)=>{
        logger.log("error", "anx2Service.js :: resetAction :: Error in action reset :: %s",err);
        res.status(500).send(err);
    })


}
/**
 * to get data count
 * @param {*} req
 * @param {*} res
 */
function getCount(req,res){
    logger.log("info","Entering anx2Service.js ::getCount");
    let prd = req.query.itcprd;
    let gstin = req.query.gstin;
    let iserractn=req.query.iserractn;
    anx2Dao.getDataCount(prd,gstin,iserractn).then((result)=>{
        logger.log("info","Exiting anx2Service.js ::getCount");
        res.status(200).send(result);
    }).catch((err)=>{
        logger.log("error", "anx2Service.js :: getCount :: Error in fetching count  :: %s",err);
        res.status(500).send("Error in fetching count");
    });
}
/**
 *this is to fetch hsn data
 * @param {*} req
 * @param {*} res
 */
function gethsndata(req, res) {
    logger.log("info","Entering anx2Service.js :: gethsndata");
    let itemref = req.query.itemref;
    let itcperiod = req.query.itcperiod;
    let gstin = req.query.gstin;
    logger.log("debug","Inside getHsnData the ItemRef:::ItcPeriod:::Gstin:::",itemref+" "+itcperiod+" "+gstin);
    anx2Dao.gethsndata(itemref,itcperiod,gstin).
    then(function (data) {
        logger.log("debug","sending Hsn Data Response to UI");
        logger.log("info","Exiting anx2Service.js :: gethsndata");
        res.status(201).send(data); 
    }).catch(function (err) {
      res.status(500).send(err)
    })
  };
/**
 * to delete table data
 * @param {*} req
 * @param {*} res
 */
function deleteTableData(req,res){
    logger.log("info","Entering anx2Service.js :: deleteTableData");
    let gstin = req.query.gstin;
    let rtnprd=req.query.rtnprd;
    let flg=req.query.flg;
    let matchflg=req.query.matchflg;
    let fp=req.query.fp;
    let taxperiod=req.query.taxperiod;
    logger.log("debug",flg);
    if(flg==='X'){
    anx2Dao.deleteErrTableData(gstin,rtnprd).then((result)=>{
        logger.log("info","Exiting anx2Service.js :: deleteTableData");
        res.status(200).send(result);
    }).catch((err)=>{
        logger.log("error", "anx2Service.js ::  deleteTableData :: Error in deleting table data :: %s",err);
        res.status(500).send("Error occurred while deleting");
    });}
    else{
        anx2Dao.deleteNrmTableData(gstin,rtnprd,fp,taxperiod,matchflg).then((result)=>{
            logger.log("info","Exiting anx2Service.js :: deleteTableData");
            res.status(200).send(result);
        }).catch((err)=>{
            logger.log("error", "anx2Service.js ::  deleteTableData :: Error in deleting table data :: %s",err);
            res.status(500).send("Error occurred while deleting");
        });
    }
}
/**
 *to save the action confirmed by the user
 * @param {*} req
 * @param {*} res
 */
function saveAction(req, res){
    logger.log("info","Entering anx2Service.js :: saveAction");
    anx2Dao.saveActionData(req)
    .then(
        (result)=>{
        logger.log("debug","action saved successfully")
        logger.log("info","Exiting anx2Service.js :: saveAction");
        res.status(200).send(result)
        }
        ).catch(
            (error)=>{
            logger.log("error", "anx2Service.js :: saveAction :: Error occured in saving Action :: %s",error);
            res.status(500).send("error occured while saving action")})

    }

/**
 *TO GET table summary data
 * @param {*} req
 * @param {*} res
 */
function getTabsummary (req, res) {
  logger.log("info","Entering anx2Service.js :: getTabsummary");
  anx2Dao.getTabsummary(req,res).
  then(function (data) {
      logger.log("debug","sending table summary data to UI");
      logger.log("info","Exiting anx2Service.js :: getTabsummary");
      res.status(201).send(data)
  }).catch(function (err) {
      logger.log("error", "anx2Service.js :: getTabSummary :: Error in fetching table summary :: %s",err);
      res.status(500).send(err)
  })
};
/**
 *fetches userprofiledata, downloads the table data into csvfile
 *
 * @param {*} req
 * @param {*} res
 */
function exportCsv (req, res) {
    logger.log("info","Entering anx2Service.js :: exportCsv");
    let data={};
    let type=req.query.type;    
	anx2Dao.getProfileData(req,res).
    then(function (result) {
    	data.userProfile=result;
    	logger.log("info","Retrieveing data for :: %s",type);
    	processData(req,res,type).then((result)=>{
    	data.exportCsv=result
	    logger.log("info","Exiting anx2Service.js :: exportCsv");
	    res.status(201).send(data)})
	}).catch(function (err) {
		logger.log("error", "anx2Service.js :: exportCsv :: Error in catch block :: %s",err);
		res.status(500).send(err)
	})   
}
/**
 *fetches userprofiledata, downloads the table data into excelfile
 * @param {*} req
 * @param {*} res
 */
function exportXls (req, res) {
    logger.log("info","Entering anx2Service.js :: exportXls");
    let data={};
    let exportXls={};
	anx2Dao.getProfileData(req,res).
    then(function (result) {
    	data.userProfile=result;
    	processData(req,res,anx2const.TABLE_AOISB2B).then((result)=>{
    		exportXls.b2b=result
    		processData(req,res,anx2const.TABLE_SEZWP).then((result)=>{
    			exportXls.sezwp=result
    			processData(req,res,anx2const.TABLE_SEZWOP).then((result)=>{
    				exportXls.sezwop=result
    				processData(req,res,anx2const.TABLE_DE).then((result)=>{
    					exportXls.de=result
    					processData(req,res,anx2const.TABLE_ISD).then((result)=>{
        					exportXls.isdc=result
        					logger.log("info","Exiting anx2Service.js :: exportXls");
        					data.exportXls=exportXls;
        					res.status(201).send(data);
    					})
    				})
    			})
    		})
	    })
	}).catch(function (err) {
		logger.log("error", "anx2Service.js :: exportXls :: Error in catch block :: %s",err);
		res.status(500).send(err)
	})   
}
/**
 *this is to process the data
 * @param {*} req
 * @param {*} res
 * @param {*} type
 */
function processData (req, res, type) {
    logger.log("info","Entering anx2Service.js :: processData");
    let txprd;
    return new Promise((resolve,reject)=>{
	    anx2Dao.exportCsv(req,res,type).
	    then(function (anx2Data) {
	        userProfileDao.getStatMstrList(req,res).
	        then(function (stateList) {        
	            for(var i=0;i<anx2Data.length;i++){
	            	if(req.query.filingstat==='NF')
	            		delete anx2Data[i]['Rejection after filing'];
	            	if(req.query.iserractn==='N')
	            		delete anx2Data[i]['GST portal validation error'];
	            	if(req.query.ismatchresult==='N'){
	            		delete anx2Data[i]['Matching result'];
	            		delete anx2Data[i]['Reason(s) of Matching result'];
	            	}
	                if (anx2Data[i][anx2const.PLACE_OF_SUPPLY] !== null && anx2Data[i][anx2const.PLACE_OF_SUPPLY] !== undefined){
	                    for (var j=0;j<stateList.length;j++){                   
	                        if(parseInt(anx2Data[i][anx2const.PLACE_OF_SUPPLY])===parseInt(stateList[j][anx2const.STATE_CD])){
	                            anx2Data[i][anx2const.PLACE_OF_SUPPLY]=stateList[j][anx2const.STATE_NAME];
	                            break;
	                        }
	                    }
	                }
	                if (anx2Data[i][anx2const.TAXPRD_SUPPLIER] === undefined)
	                    txprd=anx2const.TAXPRD_DISTRIBUTOR;
	                else
                        txprd=anx2const.TAXPRD_SUPPLIER;
                    if (anx2Data[i][txprd] !== undefined){
                        let month =anx2Data[i][txprd].substr(0,2);  
                        let year =anx2Data[i][txprd].substr(4,2);
                        switch(month){
                            case '01':
                                anx2Data[i][txprd]="Jan"+ "'" +year;
                                break;
                            case '02':
                                anx2Data[i][txprd]="Feb"+ "'" +year;
                                break;
                            case '03':
                                anx2Data[i][txprd]="Mar"+ "'" +year;
                                break;
                            case '04':
                                anx2Data[i][txprd]="Apr"+ "'" +year;
                                break;
                            case '05':
                                anx2Data[i][txprd]="May"+ "'" +year;
                                break;
                            case '06':
                                anx2Data[i][txprd]="Jun"+ "'" +year;
                                break;
                            case '07':
                                anx2Data[i][txprd]="Jul"+ "'" +year;
                                break;
                            case '08':
                                anx2Data[i][txprd]="Aug"+ "'" +year;
                                break;
                            case '09':
                                anx2Data[i][txprd]="Sep"+ "'" +year;
                                break;
                            case '10':
                                anx2Data[i][txprd]="Oct"+ "'" +year;
                                break;
                            case '11':
                                anx2Data[i][txprd]="Nov"+ "'" +year;
                                break;
                            case '12':
                                anx2Data[i][txprd]="Dec"+ "'" +year;
                                break;
                            }   
                        }         
	            }
	            logger.log("info","Exiting anx2Service.js :: processData");
		        resolve(anx2Data);
            })
            
	     })
    }).catch(function (err) {
        logger.log("error", "anx2Service.js :: exportCsv :: Error in catch block :: %s",err);
        reject(err);
    })
};
/**
 *to get table 5(ISDC) summary data
 * @param {*} req
 * @param {*} res
 */

function getIsdTabsummary (req, res) {
    logger.log("info","Entering anx2Service.js :: getIsdTabsummary");
	let summaryData={};
    anx2Dao.getIsdTabsummary(req,res).
    then(function (data) {
    	if(data!='' && data!=null && data!=undefined)
 	        summaryData[anx2const.SUMM_COUNT] = data;
    	anx2Dao.getIsdDashSummary(req,res).
        then(function (data) {
        	if(data!='' && data!=null && data!=undefined)
     	        summaryData[anx2const.SUMM_summ] = data;
            logger.log("debug","fetching table5 summary");
            logger.log("info","Exiting anx2Service.js :: getIsdTabsummary");
            res.status(201).send(summaryData)
        })
    }).catch(function (err) {
        logger.log("error", "anx2Service.js :: getIsdTabsummary :: Error in fetching table5 summary :: %s",err);
        res.status(500).send(err)
    })
  };

/**
 * to get dashboard summary data
 * @param {*} req
 * @param {*} res
 */
  function getSummryData (req,res){
     logger.log("info","Entering anx2Service.js :: getSummryData");
	    let summaryData={};
	    anx2Dao.getSummryData(req,anx2const.TABLE_B2B).
	    then(function (data) {
	        if(data!='' && data!=null && data!=undefined && (data.accept!=undefined || data.pending!=undefined || data.reject!=undefined))
	        summaryData[anx2const.FLAG_3b] = data;
	        anx2Dao.getSummryData(req,anx2const.TABLE_SEZWP).
	        then(function (data) {
	            if(data!='' && data!=null && data!=undefined &&  (data.accept!=undefined || data.pending!=undefined || data.reject!=undefined))
	            summaryData[anx2const.FLAG_3e] = data;
	            anx2Dao.getSummryData(req,anx2const.TABLE_SEZWOP).
	            then(function (data) {
	                if(data!='' && data!=null && data!=undefined && (data.accept.count!=anx2const.FLAG_0 || data.reject.count!=anx2const.FLAG_0 || data.pending.count!=anx2const.FLAG_0))
	                summaryData[anx2const.FLAG_3f] = data;
	                anx2Dao.getSummryData(req,anx2const.TABLE_DE).
	                    then(function (data) {
	                        if(data!='' && data!=null && data!=undefined &&  (data.accept!=undefined || data.pending!=undefined || data.reject!=undefined))
	                         summaryData[anx2const.FLAG_3g] = data;
	                        anx2Dao.getIsdDashSummary(req,res).
	                        then(function (data) {
	                            if(data!='' && data!=null && data!=undefined && data.count!=anx2const.FLAG_0)
	                             summaryData[anx2const.TABLE_ISDC] = data;
                                 logger.log("debug","inside ANX2 summary");
                                 logger.log("info","Exiting anx2Service.js :: getSummryData");
	                             res.status(201).send(summaryData)
	                     })
	                 })
	            })
	        })
	    }).catch(function (err) {
	        logger.log("error", "anx2Service.js :: getSummryData:: Error in fetching summary data :: %s",err);
	        res.status(500).send(err)
	    })
    };

/**
 *to open downloaded Error Json file
 * @param {*} req
 * @param {*} res
 */
function openErrJson(req, res) {
    logger.log("info", "Entering anx2Service.js :: openErrJson");
    logger.log("debug", " Inside anx2Service :: %s", req.body);
    var fileData = req.body;
    var gstin = req.headers["gstin"];
    var rtnprd = req.headers["rtnprd"];
        anx2errDao.persistData(fileData, gstin,rtnprd).then((result) => {
            logger.log("debug", " Inside success :: %s", result);
            logger.log("info", "Exiting anx2Service.js :: downldJson");
            res.status(200).send("File Processed Successfully");
    }).catch((err) => {
            logger.log("error", "error occured :: %s", err)
            res.status(500).send({ message: 'Unable to process file', statusCd: '0' });
        });

}


/**
 *  to get count of table wise data
 * @param {*} req
 * @param {*} res
 */
function getRecordCount(req,res){
    logger.log("info", "Entering anx2Service.js ::getRecordCount");
    let docref = req.query.docref;
    let tablename = req.query.tablename;
    let docrefcount = req.query.docrefcount;
    let gstin = req.query.gstin;
    let prd = req.query.rtnprd;
    anx2Dao.getRecordCount(docref, gstin, prd, tablename,docrefcount).then((result) => {
        logger.log("info", "Exiting anx2Service.js ::getRecordCount");
        res.status(200).send(result);
    }).catch((err) => {
        logger.log("error", "anx2Service.js :: getRecordCount :: Error in fetching count  :: %s", err);
        res.status(500).send("Error in fetching count");
    });
}
function getErrDashSummrydata(req,res){
    logger.log("info","Entering anx2Service.js :: getErrdashSummryData");
	    let errdashsummardata={};
	    anx2Dao.getErrDashSummryData(req,anx2const.TABLE_B2B).
	      then(function (data) {
             if(data!='' && data!=null && data!=undefined && (data.dasherrorCount!=undefined || data.dashcrtrecCount!=undefined))
             errdashsummardata[anx2const.FLAG_3b] = data;
        anx2Dao.getErrDashSummryData(req,anx2const.TABLE_SEZWP).
	        then(function (data) {
	            if(data!='' && data!=null && data!=undefined && (data.dasherrorCount!=undefined || data.dashcrtrecCount!=undefined))
                errdashsummardata[anx2const.FLAG_3e] = data;
        anx2Dao.getErrDashSummryData(req,anx2const.TABLE_SEZWOP).
            then(function (data) {
                if(data!='' && data!=null && data!=undefined && (data.dasherrorCount!=undefined || data.dashcrtrecCount!=undefined))
                    errdashsummardata[anx2const.FLAG_3f] = data;
        anx2Dao.getErrDashSummryData(req,anx2const.TABLE_DE).
                then(function (data) {
                    if(data!='' && data!=null && data!=undefined && (data.dasherrorCount!=undefined || data.dashcrtrecCount!=undefined))
                        errdashsummardata[anx2const.FLAG_3g] = data;
            logger.log("debug","inside ANX2 summary");
            logger.log("info","Exiting anx2Service.js :: getErrdashSummryData");
	    res.status(201).send(errdashsummardata)
                        })
                    })
                })
            })
	    .catch(function (err) {
	        logger.log("error", "anx2Service.js :: getSummryData:: Error in fetching summary data :: %s",err);
	        res.status(500).send(err)
	    })

}

module.exports = {
    downldJson: downldJson,
    getDocWiseData:getDocWiseData,
    resetAction:resetAction,
    getCount:getCount,
    gethsndata:gethsndata,
    saveAction:saveAction,
    getTabsummary:getTabsummary,
    exportCsv:exportCsv,
    gettb5Data:gettb5Data,
    getIsdTabsummary:getIsdTabsummary,
    getSummryData:getSummryData,
    deleteTableData:deleteTableData,
    processData:processData,
    exportXls:exportXls,
    openErrJson:openErrJson,
    getRecordCount:getRecordCount,
    getErrDashSummrydata:getErrDashSummrydata
};