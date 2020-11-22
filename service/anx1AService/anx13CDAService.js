const {
  validate3cdExpwp,
  validate3cdExpwop,
  validateHeaders
} = require("../../utility/validate");
const anx13cdaDao = require("../../dao/anx1ADao/anx13CDADao");
const { sendResponse } = require("../../utility/common");
const _ = require("lodash");
const logger = require('../../utility/logger').logger;

function save3cda(req, res) {
  if (!validateHeaders(req, res)) {
    return;
  } else if (req.body.expwp === undefined && req.body.expwop === undefined) {
    sendResponse(res, 500, {
      message: "No data present",
      statusCd: 0
    });
    return 0;
  } else if (
    req.body.expwp != "null" &&
    req.body.expwp != "" &&
    req.body.expwp != undefined &&
    validate3cdExpwp(req, res)
  ) {

    let headerList = [];
    let gstin = req.headers["gstin"];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwp[0].docs[i].items[j].txval == "" ||
              req.body.expwp[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwp[0].docs[i].items[j].igst == "" ||
              req.body.expwp[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwp[0].docs[i].items[j].cess == "" ||
              req.body.expwp[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {

          headerList = {
            doctyp: req.body.expwp[0].docs[i].doctyp,
            exptype: req.body.expwp[0].docs[i].exptype,
            docref: req.body.expwp[0].docs[i].docref,
            odocref: req.body.expwp[0].docs[i].odocref,
            suptype: req.body.expwp[0].docs[i].suptype,
            flag: req.body.expwp[0].docs[i].flag || null,
            num: req.body.expwp[0].docs[i].doc.num,
            dt: req.body.expwp[0].docs[i].doc.dt,
            val: req.body.expwp[0].docs[i].doc.val,
            year: req.body.expwp[0].docs[i].doc.year,
            sbnum: req.body.expwp[0].docs[i].sb.num || null,
            sbpcode: req.body.expwp[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwp[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null
          };

          itemList = {
            hsn: req.body.expwp[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwp[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwp[0].docs[i].items[j].rate,
            igst: req.body.expwp[0].docs[i].items[j].igst || null,
            cess: req.body.expwp[0].docs[i].items[j].cess || null,
            itemref: req.body.expwp[0].docs[i].docref
          };

          fullItemList.push(itemList);
        }

      }

      anx13cdaDao
        .save3cda(headerList, fullItemList, gstin)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  } else if (
    req.body.expwop[0] != "null" &&
    req.body.expwop[0] != "" &&
    req.body.expwop[0] != undefined &&
    validate3cdExpwop(req, res)
  ) {
    let gstin = req.headers["gstin"];

    let headerList = [];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwop[0].docs[i].items[j].txval == "" ||
              req.body.expwop[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwop[0].docs[i].items[j].igst == "" ||
              req.body.expwop[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwop[0].docs[i].items[j].cess == "" ||
              req.body.expwop[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {

          headerList = {
            doctyp: req.body.expwop[0].docs[i].doctyp,
            exptype: req.body.expwop[0].docs[i].exptype,
            docref: req.body.expwop[0].docs[i].docref,
            odocref: req.body.expwop[0].docs[i].odocref,
            year: req.body.expwop[0].docs[i].doc.year,
            suptype: req.body.expwop[0].docs[i].suptype,
            flag: req.body.expwop[0].docs[i].flag || null,
            num: req.body.expwop[0].docs[i].doc.num,
            dt: req.body.expwop[0].docs[i].doc.dt,
            val: req.body.expwop[0].docs[i].doc.val,
            sbnum: req.body.expwop[0].docs[i].sb.num || null,
            sbpcode: req.body.expwop[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwop[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null
          };

          itemList = {
            hsn: req.body.expwop[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwop[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwop[0].docs[i].items[j].rate,
            igst: req.body.expwop[0].docs[i].items[j].igst || null,
            cess: req.body.expwop[0].docs[i].items[j].cess || null,
            itemref: req.body.expwop[0].docs[i].docref
          };

          fullItemList.push(itemList);
        }

      }

      anx13cdaDao
        .save3cda(headerList, fullItemList, gstin)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  }
}

/**
 * Edit 3CDA 
 */
function edit3cda(req, res) {
  if (!validateHeaders(req, res)) {
    return;
  } else if (req.body.expwp === undefined && req.body.expwop === undefined) {
    sendResponse(res, 500, {
      message: "No data present",
      statusCd: 0
    });
    return 0;
  } else if (
    req.body.expwp != "null" &&
    req.body.expwp != "" &&
    req.body.expwp != undefined &&
    validate3cdExpwp(req, res)
  ) {
    let headerList = [];
    let gstin = req.headers["gstin"];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwp[0].docs[i].items[j].txval == "" ||
              req.body.expwp[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwp[0].docs[i].items[j].igst == "" ||
              req.body.expwp[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwp[0].docs[i].items[j].cess == "" ||
              req.body.expwp[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
          headerList = {
            docid: req.body.expwp[0].docs[i].docid,
            doctyp: req.body.expwp[0].docs[i].doctyp,
            exptype: req.body.expwp[0].docs[i].exptype,
            docref: req.body.expwp[0].docs[i].docref,
            odocref: req.body.expwp[0].docs[i].odocref,
            suptype: req.body.expwp[0].docs[i].suptype,
            flag: req.body.expwp[0].docs[i].flag || null,
            num: req.body.expwp[0].docs[i].doc.num,
            dt: req.body.expwp[0].docs[i].doc.dt,
            val: req.body.expwp[0].docs[i].doc.val,
            year: req.body.expwp[0].docs[i].doc.year,
            sbnum: req.body.expwp[0].docs[i].sb.num || null,
            sbpcode: req.body.expwp[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwp[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null,
            oldexptyp: req.body.expwp[0].docs[i].oldexptyp,
            olddoctyp: req.body.expwp[0].docs[i].olddoctype
          };
          itemList = {
            hsn: req.body.expwp[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwp[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwp[0].docs[i].items[j].rate,
            igst: req.body.expwp[0].docs[i].items[j].igst || null,
            cess: req.body.expwp[0].docs[i].items[j].cess || null,
            itemref: req.body.expwp[0].docs[i].docref,
            itemid: req.body.expwp[0].docs[i].items[j].itemid
          };

          fullItemList.push(itemList);
        }
      }
      anx13cdaDao
        .edit3cda(headerList, fullItemList, gstin, headerList.fp, headerList.taxperiod)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          if (err.message.includes("UNIQUE constraint failed")) {
            reject({
              message: `Document Already exist`, docref: headerList.docref,
              statusCd: "0"
            });
          }
          else
            reject({
              message: err.message, docref: headerList.docref,
              statusCd: "0"
            });

        });
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  } else if (
    req.body.expwop[0] != "null" &&
    req.body.expwop[0] != "" &&
    req.body.expwop[0] != undefined &&
    validate3cdExpwop(req, res)
  ) {
    let gstin = req.headers["gstin"];
    let headerList = [];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwop[0].docs[i].items[j].txval == "" ||
              req.body.expwop[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwop[0].docs[i].items[j].igst == "" ||
              req.body.expwop[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwop[0].docs[i].items[j].cess == "" ||
              req.body.expwop[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {
          headerList = {
            docid: req.body.expwop[0].docs[i].docid,
            doctyp: req.body.expwop[0].docs[i].doctyp,
            exptype: req.body.expwop[0].docs[i].exptype,
            docref: req.body.expwop[0].docs[i].docref,
            odocref: req.body.expwop[0].docs[i].odocref,
            suptype: req.body.expwop[0].docs[i].suptype,
            flag: req.body.expwop[0].docs[i].flag || null,
            num: req.body.expwop[0].docs[i].doc.num,
            dt: req.body.expwop[0].docs[i].doc.dt,
            val: req.body.expwop[0].docs[i].doc.val,
            year: req.body.expwop[0].docs[i].doc.year,
            sbnum: req.body.expwop[0].docs[i].sb.num || null,
            sbpcode: req.body.expwop[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwop[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null,
            oldexptyp: req.body.expwop[0].docs[i].oldexptyp,
            olddoctyp: req.body.expwop[0].docs[i].olddoctype
          };
          itemList = {
            itemid: req.body.expwop[0].docs[i].items[j].itemid,
            hsn: req.body.expwop[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwop[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwop[0].docs[i].items[j].rate,
            igst: req.body.expwop[0].docs[i].items[j].igst || null,
            cess: req.body.expwop[0].docs[i].items[j].cess || null,
            itemref: req.body.expwop[0].docs[i].docref
          };

          fullItemList.push(itemList);
        }
      }
      anx13cdaDao
        .edit3cda(
          headerList,
          fullItemList,
          gstin,
          headerList.fp,
          headerList.taxperiod
        )
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          if (err.message.includes("UNIQUE constraint failed")) {
            reject({
              message: `Document Already exist`, docref: headerList.docref,
              statusCd: "0"
            });
          }
          else
            reject({
              message: err.message, docref: headerList.docref,
              statusCd: "0"
            });

        });
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  }
}


/**
 * Get 3CDA details
 * @param {*} req
 * @param {*} res
 */
function get3CDADetailsService(req, res) {
  /**
   * Header validation Check
   */
  if (validateHeaders(req, res)) {
    anx13cdaDao
      .get3CDADetailsDao(req.headers["rtnprd"], req.headers["gstin"], req.headers["flag"])
      .then(data => {
        sendResponse(res, 200, { tab3cdDetails: data, statusCd: 1 });
      })
      .catch(err => {
        sendResponse(res, 500, { message: err.message, statusCd: 0 });
      });
  }
};

/**
 *  Delete the ANX1A_3CDA table records based on array of docId in request body
 * @param {*} req
 * @param {*} res
 */
function delete3cdaBydocIds(req, res) {
  if (validateHeaders(req, res)) {
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if (
      !req.body ||
      !req.body.docids ||
      !Array.isArray(req.body.docids) ||
      req.body.docids === null
    ) {
      sendResponse(res, 500, {
        message: "Missing docIds array in body",
        statusCd: 0
      });
    } else {
      anx13cdaDao
        .delete3cdaBydocIds(req.body.docids, req.headers["gstin"], fp, rtnprd)
        .then(data => {
          sendResponse(res, 200, {
            message: `number of records:  ${data} deleted successfully`,
            statusCd: 1
          });
        })
        .catch(err => {
          sendResponse(res, 500, { message: err.message, statusCd: 0 });
        });
    }
  }
};

/**
 * Delete the ANX1A_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
function delete3cdaItemsByItemId(req, res) {
  if (validateHeaders(req, res)) {
    let rtnprd = req.headers["rtnprd"] || null;
    let fp = req.headers["fp"] || null;

    if (
      !req.body ||
      !req.body.itemids ||
      !Array.isArray(req.body.itemids) ||
      _.isEmpty(req.body.itemids)
    ) {
      sendResponse(res, 500, {
        message: "itemids array should not be Empty",
        statusCd: 0
      });
    } else {
      anx13cdaDao
        .delete3cdaItemsByItemId(
          req.body.itemids,
          req.headers["gstin"],
          fp,
          rtnprd
        )
        .then(data => {
          sendResponse(res, 200, { message: data, statusCd: 1 });
        })
        .catch(err => {
          sendResponse(res, 500, { message: err.message, statusCd: 0 });
        });
    }
  }
}

// with transactions
async function save3cdaTxn(req, res) {
  logger.log("info", "Entering anx13cdService.save3cdaTxn");
  if (!validateHeaders(req, res)) {
    return;
  } else if (req.body.expwp === undefined && req.body.expwop === undefined) {
    sendResponse(res, 500, {
      message: "No data present",
      statusCd: 0
    });
    return 0;
  } else if (
    req.body.expwp != "null" &&
    req.body.expwp != "" &&
    req.body.expwp != undefined &&
    validate3cdExpwp(req, res)
  ) {

    let headerList = [];
    let gstin = req.headers["gstin"];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise(async (resolve, reject) => {
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwp[0].docs[i].items[j].txval == "" ||
              req.body.expwp[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwp[0].docs[i].items[j].igst == "" ||
              req.body.expwp[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwp[0].docs[i].items[j].cess == "" ||
              req.body.expwp[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {

          headerList = {
            odoctyp: req.body.expwp[0].docs[i].odoctyp,
            odocnum: req.body.expwp[0].docs[i].odoc.num,
            odocdate: req.body.expwp[0].docs[i].odoc.dt,
            doctyp: req.body.expwp[0].docs[i].doctyp,
            exptype: req.body.expwp[0].docs[i].exptype,
            docref: req.body.expwp[0].docs[i].docref,
            odocref: req.body.expwp[0].docs[i].odocref,
            suptype: req.body.expwp[0].docs[i].suptype,
            flag: req.body.expwp[0].docs[i].flag || null,
            num: req.body.expwp[0].docs[i].doc.num,
            dt: req.body.expwp[0].docs[i].doc.dt,
            val: req.body.expwp[0].docs[i].doc.val,
            year: req.body.expwp[0].docs[i].doc.year,
            sbnum: req.body.expwp[0].docs[i].sb.num || null,
            sbpcode: req.body.expwp[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwp[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null
          };

          itemList = {
            hsn: req.body.expwp[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwp[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwp[0].docs[i].items[j].rate,
            igst: req.body.expwp[0].docs[i].items[j].igst || null,
            cess: req.body.expwp[0].docs[i].items[j].cess || null,
            itemref: req.body.expwp[0].docs[i].docref
          };

          fullItemList.push(itemList);
        }

      }


      try {
        let response = await anx13cdaDao.save3cdaTxn(headerList, fullItemList, gstin)
        resolve(response)

      } catch (error) {
        reject({ message: error.message, statusCd: 0 })
      }

    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  } else if (
    req.body.expwop[0] != "null" &&
    req.body.expwop[0] != "" &&
    req.body.expwop[0] != undefined &&
    validate3cdExpwop(req, res)
  ) {
    let gstin = req.headers["gstin"];

    let headerList = [];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise(async (resolve, reject) => {
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwop[0].docs[i].items[j].txval == "" ||
              req.body.expwop[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwop[0].docs[i].items[j].igst == "" ||
              req.body.expwop[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwop[0].docs[i].items[j].cess == "" ||
              req.body.expwop[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {

          headerList = {
            odoctyp: req.body.expwop[0].docs[i].odoctyp,
            odocnum: req.body.expwop[0].docs[i].odoc.num,
            odocdate: req.body.expwop[0].docs[i].odoc.dt,
            doctyp: req.body.expwop[0].docs[i].doctyp,
            exptype: req.body.expwop[0].docs[i].exptype,
            docref: req.body.expwop[0].docs[i].docref,
            odocref: req.body.expwop[0].docs[i].odocref,
            year: req.body.expwop[0].docs[i].doc.year,
            suptype: req.body.expwop[0].docs[i].suptype,
            flag: req.body.expwop[0].docs[i].flag || null,
            num: req.body.expwop[0].docs[i].doc.num,
            dt: req.body.expwop[0].docs[i].doc.dt,
            val: req.body.expwop[0].docs[i].doc.val,
            sbnum: req.body.expwop[0].docs[i].sb.num || null,
            sbpcode: req.body.expwop[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwop[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null
          };

          itemList = {
            hsn: req.body.expwop[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwop[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwop[0].docs[i].items[j].rate,
            igst: req.body.expwop[0].docs[i].items[j].igst || null,
            cess: req.body.expwop[0].docs[i].items[j].cess || null,
            itemref: req.body.expwop[0].docs[i].docref
          };

          fullItemList.push(itemList);
        }

      }
      logger.log("info", "calling dao");
      try {
        let response = await anx13cdaDao.save3cdaTxn(headerList, fullItemList, gstin)
        resolve(response)

      } catch (error) {
        reject({ message: error.message, statusCd: 0 })
      }
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  }
}


async function edit3cdaTxn(req, res) {
  if (!validateHeaders(req, res)) {
    return;
  } else if (req.body.expwp === undefined && req.body.expwop === undefined) {
    sendResponse(res, 500, {
      message: "No data present",
      statusCd: 0
    });
    return 0;
  } else if (
    req.body.expwp != "null" &&
    req.body.expwp != "" &&
    req.body.expwp != undefined &&
    validate3cdExpwp(req, res)
  ) {
    logger.log("info", "inside edit3cdTxn");
    let headerList = [];
    let gstin = req.headers["gstin"];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwp[0].docs[i].items[j].txval == "" ||
              req.body.expwp[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwp[0].docs[i].items[j].igst == "" ||
              req.body.expwp[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwp[0].docs[i].items[j].cess == "" ||
              req.body.expwp[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwp[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwp[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwp[0].docs[i].items.length; j++) {
          logger.log("info", "Headerlist object");
          headerList = {
            odoctyp: req.body.expwp[0].docs[i].odoctyp,
            odocnum: req.body.expwp[0].docs[i].odoc.num,
            odocdate: req.body.expwp[0].docs[i].odoc.dt,
            docid: req.body.expwp[0].docs[i].docid,
            doctyp: req.body.expwp[0].docs[i].doctyp,
            exptype: req.body.expwp[0].docs[i].exptype,
            docref: req.body.expwp[0].docs[i].docref,
            odocref: req.body.expwp[0].docs[i].odocref,
            suptype: req.body.expwp[0].docs[i].suptype,
            flag: req.body.expwp[0].docs[i].flag || null,
            num: req.body.expwp[0].docs[i].doc.num,
            dt: req.body.expwp[0].docs[i].doc.dt,
            val: req.body.expwp[0].docs[i].doc.val,
            year: req.body.expwp[0].docs[i].doc.year,
            sbnum: req.body.expwp[0].docs[i].sb.num || null,
            sbpcode: req.body.expwp[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwp[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null,
            oldexptyp: req.body.expwp[0].docs[i].oldexptyp,
            olddoctyp: req.body.expwp[0].docs[i].olddoctype
          };

          itemList = {
            hsn: req.body.expwp[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwp[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwp[0].docs[i].items[j].rate,
            igst: req.body.expwp[0].docs[i].items[j].igst || null,
            cess: req.body.expwp[0].docs[i].items[j].cess || null,
            itemref: req.body.expwp[0].docs[i].docref,
            itemid: req.body.expwp[0].docs[i].items[j].itemid
          };

          fullItemList.push(itemList);
        }
        logger.log("info", "fullItemList object");
      }

      anx13cdaDao
        .edit3cdaTxn(headerList, fullItemList, gstin, headerList.fp, headerList.taxperiod, req.headers["flag"])
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          if (err.message.includes("UNIQUE constraint failed")) {
            reject({
              message: `Document Already exist`, docref: headerList.docref,
              statusCd: "0"
            });
          }
          else
            reject({
              message: err.message, docref: headerList.docref,
              statusCd: "0"
            });

        });
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  } else if (
    req.body.expwop[0] != "null" &&
    req.body.expwop[0] != "" &&
    req.body.expwop[0] != undefined &&
    validate3cdExpwop(req, res)
  ) {
    let gstin = req.headers["gstin"];

    let headerList = [];
    let itemList = [];
    let fullItemList = [];
    let total_taxable_value = 0,
      total_igst = 0,
      total_cess = 0;
    return new Promise((resolve, reject) => {
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {
          total_taxable_value += parseFloat(
            req.body.expwop[0].docs[i].items[j].txval == "" ||
              req.body.expwop[0].docs[i].items[j].txval == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].txval
          );
          total_igst += parseFloat(
            req.body.expwop[0].docs[i].items[j].igst == "" ||
              req.body.expwop[0].docs[i].items[j].igst == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].igst
          );
          total_cess += parseFloat(
            req.body.expwop[0].docs[i].items[j].cess == "" ||
              req.body.expwop[0].docs[i].items[j].cess == null
              ? 0
              : req.body.expwop[0].docs[i].items[j].cess
          );
        }
      }
      for (var i = 0; i < req.body.expwop[0].docs.length; i++) {
        for (var j = 0; j < req.body.expwop[0].docs[i].items.length; j++) {

          headerList = {
            odoctyp: req.body.expwop[0].docs[i].odoctyp,
            odocnum: req.body.expwop[0].docs[i].odoc.num,
            odocdate: req.body.expwop[0].docs[i].odoc.dt,
            docid: req.body.expwop[0].docs[i].docid,
            doctyp: req.body.expwop[0].docs[i].doctyp,
            exptype: req.body.expwop[0].docs[i].exptype,
            docref: req.body.expwop[0].docs[i].docref,
            odocref: req.body.expwop[0].docs[i].odocref,
            suptype: req.body.expwop[0].docs[i].suptype,
            flag: req.body.expwop[0].docs[i].flag || null,
            num: req.body.expwop[0].docs[i].doc.num,
            dt: req.body.expwop[0].docs[i].doc.dt,
            val: req.body.expwop[0].docs[i].doc.val,
            year: req.body.expwop[0].docs[i].doc.year,
            sbnum: req.body.expwop[0].docs[i].sb.num || null,
            sbpcode: req.body.expwop[0].docs[i].sb.pcode || null,
            sbdt: req.body.expwop[0].docs[i].sb.dt || null,
            fp: req.headers["fp"],
            taxperiod: req.headers["rtnprd"],
            status: "",
            taxable_value: total_taxable_value,
            igst: total_igst,
            cess: total_cess,
            errorcode: null,
            error_detail: null,
            oldexptyp: req.body.expwop[0].docs[i].oldexptyp,
            olddoctyp: req.body.expwop[0].docs[i].olddoctype
          };

          itemList = {
            itemid: req.body.expwop[0].docs[i].items[j].itemid,
            hsn: req.body.expwop[0].docs[i].items[j].hsn,
            taxable_value: req.body.expwop[0].docs[i].items[j].txval || null,
            apptaxrate: req.body.expwop[0].docs[i].items[j].rate,
            igst: req.body.expwop[0].docs[i].items[j].igst || null,
            cess: req.body.expwop[0].docs[i].items[j].cess || null,
            itemref: req.body.expwop[0].docs[i].docref
          };

          fullItemList.push(itemList);
        }

        logger.log("info", "fullItemList");
      }

      anx13cdaDao
        .edit3cdaTxn(
          headerList,
          fullItemList,
          gstin,
          headerList.fp,
          headerList.taxperiod
        )
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          if (err.message.includes("UNIQUE constraint failed")) {

            reject({
              message: `Document Already exist`, docref: headerList.docref,
              statusCd: "0"
            });
          }
          else
            reject({
              message: err.message, docref: headerList.docref,
              statusCd: "0"
            });

        });
    })
      .then(data => {
        sendResponse(res, 200, data);
      })
      .catch(function (err) {
        sendResponse(res, 500, err);
      });
  }
}


/**
 *  Delete the ANX1_3H table records based on array of docId in request body
 * @param {*} req
 * @param {*} res
 */
async function delete3cdaBydocIdsTxn(req, res) {
  try {

    if (validateHeaders(req, res)) {
      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;

      if (
        !req.body ||
        !req.body.docids ||
        !Array.isArray(req.body.docids) ||
        req.body.docids === null
      ) {
        sendResponse(res, 500, {
          message: "Missing docIds array in body",
          statusCd: 0
        });
      } else {
        let data = await anx13cdaDao.delete3cdaBydocIdsTxn(req.body.docids, req.headers["gstin"], fp, rtnprd, req.headers["flag"], req.body.action)
        sendResponse(res, 200, { message: `number of records:  ${data} deleted successfully`, statusCd: 1 });
      }
    }

  } catch (error) {
    sendResponse(res, 500, { message: error.message, statusCd: 0 });
  }


}



/**
 * Delete the ANX1_ITEMDTLS table records based on array of itemId in request body
 * @param {*} req
 * @param {*} res
 */
async function delete3cdaItemsByItemIdTxn(req, res) {

  try {
    if (validateHeaders(req, res)) {

      let rtnprd = req.headers["rtnprd"] || null;
      let fp = req.headers["fp"] || null;

      if (!req.body || !req.body.itemids || !Array.isArray(req.body.itemids) || _.isEmpty(req.body.itemids)) {
        sendResponse(res, 500, { message: "itemids array should not be Empty", statusCd: 0 });
      } else {
        let data = await anx13cdaDao.delete3cdaItemsByItemIdTxn(req.body.itemids, req.headers["gstin"], fp, rtnprd, req.headers["flag"], req.body.status)
        sendResponse(res, 200, { message: data, statusCd: 1 });
      }
    }
  } catch (error) {
    sendResponse(res, 500, { message: (error.message.indexOf("Error:") > -1 ? ((error.message.split(":"))[1]).trim() : error.message), statusCd: 0 });
  }

}




module.exports = {
  save3cda: save3cda,
  edit3cda: edit3cda,
  get3CDADetailsService: get3CDADetailsService,
  delete3cdaBydocIds: delete3cdaBydocIds,
  delete3cdaItemsByItemId: delete3cdaItemsByItemId,
  save3cdaTxn: save3cdaTxn,
  edit3cdaTxn: edit3cdaTxn,
  delete3cdaBydocIdsTxn: delete3cdaBydocIdsTxn,
  delete3cdaItemsByItemIdTxn: delete3cdaItemsByItemIdTxn
};
