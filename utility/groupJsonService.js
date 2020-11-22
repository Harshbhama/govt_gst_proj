const logger = require('../utility/logger').logger;
const Promise = require("bluebird");
const _ = require("lodash");



function groupMltplDoc(incomingJsonObj) {
    let parentObj = incomingJsonObj;
    //console.log("parent Obeject::", parentObj)
    let targetObj = {};
    try {
        logger.log('info', 'Entering groupJsonService.js groupMltpDoc');
        return new Promise(function (resolve, reject) {


            Object.keys(parentObj).forEach((property) => {

                if (typeof parentObj[property] !== 'object')
                    targetObj[property] = parentObj[property];

                else {
                    switch (property) {
                        case "impgsez":
                            let newImpObj = {};
                            let newImpSezArray = [];
                            let impsezArry = parentObj[property];
                            impsezArry.forEach((element) => {
                                if (newImpObj.ctin !== undefined && newImpObj.ctin == element.ctin && newImpObj.trdnm !== undefined) {

                                    if (newImpObj.docs[0].pos !== element.docs[0].pos || newImpObj.docs[0].boe.num !== element.docs[0].boe.num || newImpObj.docs[0].boe.val !== element.docs[0].boe.val || newImpObj.docs[0].boe.dt !== element.docs[0].boe.dt)

                                        newImpObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newImpObj = element;
                                    newImpSezArray.push(newImpObj);
                                }
                            }
                            );
                            targetObj[property] = newImpSezArray;
                            break;
                        case "b2b":
                            let newB2BObj = {};
                            let newB2BArray = [];
                            let b2bArry = parentObj[property];
                            b2bArry.forEach((element) => {
                                if (newB2BObj.ctin !== undefined && newB2BObj.ctin == element.ctin && newB2BObj.trdnm !== undefined) {

                                    if (newB2BObj.docs[0].pos !== element.docs[0].pos || newB2BObj.docs[0].doc.num !== element.docs[0].doc.num || newB2BObj.docs[0].doc.val !== element.docs[0].doc.val || newB2BObj.docs[0].doc.dt !== element.docs[0].doc.dt)
                                        newB2BObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newB2BObj = element;
                                    newB2BArray.push(newB2BObj);
                                }
                            }
                            );

                            targetObj[property] = newB2BArray;
                            break;
                        case 'sezwp':
                        case 'sezwop':
                            let newSezObj = {};
                            let newSezArry = [];
                            let sezArry = parentObj[property];
                            sezArry.forEach((element) => {
                                if (newSezObj.ctin !== undefined && newSezObj.ctin == element.ctin && newSezObj.trdnm !== undefined) {

                                    if (newSezObj.docs[0].pos !== element.docs[0].pos || newSezObj.docs[0].doc.num !== element.docs[0].doc.num || newSezObj.docs[0].doc.val !== element.docs[0].doc.val || newSezObj.docs[0].doc.dt !== element.docs[0].doc.dt)
                                        newSezObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newSezObj = element;
                                    newSezArry.push(newSezObj);
                                }
                            }
                            );


                            targetObj[property] = newSezArry;
                            break;
                        case 'de':
                            let newDEObj = {};
                            let newDEArry = [];
                            let deArry = parentObj[property];
                            deArry.forEach((element) => {
                                if (newDEObj.ctin !== undefined && newDEObj.ctin == element.ctin && newDEObj.trdnm !== undefined) {

                                    if (newDEObj.docs[0].pos !== element.docs[0].pos || newDEObj.docs[0].doc.num !== element.docs[0].doc.num || newDEObj.docs[0].doc.val !== element.docs[0].doc.val || newDEObj.docs[0].doc.dt !== element.docs[0].doc.dt)
                                        newDEObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newDEObj = element;
                                    newDEArry.push(newDEObj);
                                }
                            }
                            );
                            targetObj[property] = newDEArry;
                            break;
                        case 'rev':
                            let newREVObj = {};
                            let newREVArry = [];
                            let revArry = parentObj[property];
                            revArry.forEach((element) => {
                                if (newREVObj.ctin !== undefined && newREVObj.ctin == element.ctin && newREVObj.trdnm !== undefined) {

                                    if (newREVObj.docs[0].pos !== element.docs[0].pos || newREVObj.docs[0].diffprcnt !== element.docs[0].diffprcnt || newREVObj.docs[0].sec7act !== element.docs[0].sec7act)
                                        newREVObj.docs.push(element.docs[0]);
                                    if (newREVObj !== null && newREVObj !== undefined && newREVObj !== "") {
                                        newREVObj.trdnm == element.trdnm;
                                    }
                                }
                                else {
                                    newREVObj = element;
                                    newREVArry.push(newREVObj);
                                }
                            }
                            );
                            targetObj[property] = newREVArry;
                            break;
                        case 'impg':
                            let newImpgObj = {};
                            let newImpgArray = [];
                            let impgArry = parentObj[property];
                            impgArry.forEach((element) => {
                                if (newImpgObj.pos !== undefined && newImpgObj.pos == element.pos) {
                                    if (newImpgObj.docs[0].boe.num !== element.docs[0].boe.num || newImpgObj.docs[0].boe.val !== element.docs[0].boe.val || newImpgObj.docs[0].boe.dt !== element.docs[0].boe.dt)
                                        newImpgObj.docs.push(element.docs[0]);

                                }
                                else {
                                    newImpgObj = element;
                                    newImpgArray.push(newImpgObj);
                                }
                            }
                            );
                            targetObj[property] = newImpgArray;
                            break;
                        case 'mis':
                            let newMisObj = {};
                            let newMisArray = [];
                            let misArry = parentObj[property];
                            misArry.forEach((element) => {
                                if (newMisObj.ctin !== undefined && newMisObj.ctin == element.ctin && newMisObj.tblref == element.tblref && newMisObj !== undefined) {

                                    if (newMisObj.docs[0].pos !== element.docs[0].pos || newMisObj.docs[0].doc.num !== element.docs[0].doc.num || newMisObj.docs[0].doc.val !== element.docs[0].doc.val || newMisObj.docs[0].doc.dt !== element.docs[0].doc.dt)
                                        newMisObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newMisObj = element;
                                    newMisArray.push(newMisObj);
                                }
                            }
                            );
                            targetObj[property] = newMisArray;
                            break;
                        case 'b2c':
                        case 'expwop':
                        case 'expwp':
                        case 'imps':
                        case 'ecom':
                            targetObj[property] = parentObj[property];

                            break;
                        case 'b2ba':
                            targetObj['b2ba'] = parentObj[property];
                            break;

                        case 'reva':
                            let newREVAObj = {};
                            let newREVAArry = [];
                            let revaArry = parentObj[property];
                            revaArry.forEach((element) => {
                                console.log('revaArry element', element);
                                if (newREVAObj.ctin !== undefined && newREVAObj.ctin == element.ctin && newREVAObj.trdnm !== undefined) {
                                    console.log('IF LOOP');
                                    if (newREVAObj.docs[0].pos !== element.docs[0].pos || newREVAObj.docs[0].diffprcnt !== element.docs[0].diffprcnt || newREVAObj.docs[0].sec7act !== element.docs[0].sec7act)
                                        newREVAObj.docs.push(element.docs[0]);
                                    if (newREVAObj !== null && newREVAObj !== undefined && newREVAObj !== "") {
                                        newREVAObj.trdnm == element.trdnm;
                                    }
                                }
                                else {
                                    console.log('ELSE LOOP');
                                    newREVAObj = element;
                                    newREVAArry.push(newREVAObj);
                                }
                            }
                            );
                            targetObj[property] = newREVAArry;
                            break;

                        case 'b2ca':
                        case 'expwopa':
                        case 'expwpa':
                        case 'impsa':
                        case 'ecoma':
                            targetObj[property] = parentObj[property];
                            break;
                        case 'impga':
                            let newImpgaObj = {};
                            let newImpgaArray = [];
                            let impgaArry = parentObj[property];
                            impgaArry.forEach((element) => {
                                if (newImpgaObj.pos !== undefined && newImpgaObj.pos == element.pos) {
                                    if (newImpgaObj.docs[0].boe.num !== element.docs[0].boe.num || newImpgaObj.docs[0].boe.val !== element.docs[0].boe.val ||
                                        newImpgaObj.docs[0].boe.dt !== element.docs[0].boe.dt || newImpgaObj.docs[0].oboe.num !== element.docs[0].oboe.num || 
                                        newImpgaObj.docs[0].oboe.dt !== element.docs[0].oboe.dt)
                                        newImpgaObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newImpgaObj = element;
                                    newImpgaArray.push(newImpgaObj);
                                }
                            }
                            );
                            targetObj[property] = newImpgaArray;
                            break;
                        case "impgseza":
                            let newImpsezaObj = {};
                            let newImpSezaArray = [];
                            let impsezaArry = parentObj[property];
                            impsezaArry.forEach((element) => {
                                if (newImpsezaObj.ctin !== undefined && newImpsezaObj.ctin == element.ctin && newImpsezaObj.octin == element.octin && newImpsezaObj.trdnm !== undefined) {
                                    if (newImpsezaObj.docs[0].pos !== element.docs[0].pos || newImpsezaObj.docs[0].boe.num !== element.docs[0].boe.num || newImpsezaObj.docs[0].boe.val !== element.docs[0].boe.val || newImpsezaObj.docs[0].boe.dt !== element.docs[0].boe.dt
                                        || newImpsezaObj.docs[0].oboe.num !== element.docs[0].oboe.num || newImpsezaObj.docs[0].oboe.dt !== element.docs[0].oboe.dt)

                                        newImpsezaObj.docs.push(element.docs[0]);
                                }
                                else {
                                    newImpsezaObj = element;
                                    newImpSezaArray.push(newImpsezaObj);
                                }
                            }
                            );
                            targetObj[property] = newImpSezaArray;
                            break;
                    }


                }


            }
            );
            logger.log('info', 'Exiting groupJsonService.js groupMltpDoc');
            resolve(targetObj);

        });
    } catch (error) {

        logger.log('error', 'Some error occured while processing json : %s', error.message)
    }

}

module.exports = {
    groupMltplDoc: groupMltplDoc
}