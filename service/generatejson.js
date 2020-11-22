const { get3B2cjSON } = require("../dao/anx1Dao");
const { get3B2cajSON } = require("../dao/anx1ADao/anx1ADao");
const { get3CDAjSON } = require("../dao/anx1ADao/anx1ADao");
const { get3HAjSON } = require("../dao/anx1ADao/anx1ADao");
const { get3IAjSON } = require("../dao/anx1ADao/anx13IADao");
const { getTab4aJson } = require("../dao/anx1ADao/anx14ADao");
const { get3JAjSON } = require("../dao/anx1ADao/anx13JADao");
const { get3KAjSON } = require("../dao/anx1ADao/anx13KADao");
const { get3HjSON } = require("../dao/anx1Dao");
const { get3CDjSON } = require("../dao/anx13cdDao");
const { get3bDetailsjSON } = require("../dao/anx13bDao")
const { get3EFjSON } = require("../dao/anx1Dao/anx13efDao");
const { get3GjSON } = require("../dao/anx1Dao/anx13gDao");
const { get3KjSON } = require("../dao/anx1Dao/anx13kDao");
const { get3IjSON } = require("../dao/anx1Dao/anx13iDao");
const { get3JjSON } = require("../dao/anx1Dao/anx13jDao");
const { getTab4Json } = require("../dao/anx1Dao/anx14Dao");
const { get3LjSON } = require("../dao/anx1Dao/anx13lDao");
const { get3BAjSON } = require("../dao/anx1Dao/Anx1b2baDao");
const { get3BAOjSON } = require("../dao/anx1Dao/Anx1b2baoDao");
const { get3EFAjSON } = require("../dao/anx1Dao/anx13efaDao");
const { get3GAjSON } = require("../dao/anx1Dao/anx13gaDao");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const Promise = require("bluebird");
const regex = new RegExp('/', 'g');
const max_size = 5138030;
const chunked = require('../service/chunkService');
const chunkedA = require('../service/chunkAService');
const jsonsize = require('json-size');


/**
 * The below function is used to generate JSON response for the given gstin 
 * @param {*} request 
 * @param {*} response 
 */
async function generateJson(request, response) {

  logger.log("info", "Entering generatejson.generateJson :: %s :: %s", new Date().getTime(), new Date().toString());
  let profile = request.query.profile || null;
  let issez = request.query.issez || null;
  let fp = request.query.fp || null;
  let jsonResponse = [];
  let genobj = [];
  let flag = request.query.flag || null;


  // The below function is used to generate JSON response table3A
  logger.log("info", "Entering generatejson.get3B2cjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let b2cData = await get3B2cjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let b2cb2cItemsArr = {}, b2cjsonObj = {}, b2cdocobject = {};
  let b2cItems = [], b2cArray = [];
  let b2cPrevDocId = "";

  await Promise.map(b2cData, (row) => {
    b2cb2cItemsArr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json`, statusCd: 0 });
    }

    if (row.DOC_ID != b2cPrevDocId) {
      b2cItems = [];
      b2cdocobject = {
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        pos: String(row.PLACE_OF_SUPPLY).length == 1 ? ("0" + String(row.PLACE_OF_SUPPLY)) : String(row.PLACE_OF_SUPPLY),
        rfndelg: "Y"
      };
    }

    b2cjsonObj = {
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? "" : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? "" : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? "" : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? "" : row.CESS
    };

    Object.keys(b2cjsonObj).forEach(function (key) {
      if (b2cjsonObj[key] != null && b2cjsonObj[key] !== "")
        b2cb2cItemsArr[key] = b2cjsonObj[key];
    });
    b2cItems.push(b2cb2cItemsArr);

    if (row.DOC_ID != b2cPrevDocId) {
      b2cdocobject.items = b2cItems;
      b2cArray.push(b2cdocobject);
      b2cPrevDocId = row.DOC_ID;
    }
  });
  logger.log("info", "Exiting  generatejson.get3B2cjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table3H           
  logger.log("info", "Entering generatejson.get3HjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let tab3hData = await get3HjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let revItemsArr = {}, revObj = {}, revdocobject = {}, itemsObj = {};
  let revItems = [], revDocs = [];
  let revPrevDocId = "", prevCtin = "";
  let revdetails = [];

  await Promise.map(tab3hData, (row) => {
    revItemsArr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != prevCtin) {
      revDocs = [];
      revObj = {
        ctin: row.CTIN,
        type: (row.CTIN.length == 15) ? "G" : "P"

      }
    }

    if (row.DOC_ID != revPrevDocId) {
      revItems = [];
      revdocobject = {
        suptyp: (row.CTIN.length == 10) ? (row.SUPPLY_TYPE == "Inter-State" ? "inter" : "intra") : undefined,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        rfndelg: "Y"
      }
    }

    itemsObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };

    Object.keys(itemsObj).forEach(function (key) {
      if (itemsObj[key] != null && itemsObj[key] !== "")
        revItemsArr[key] = itemsObj[key];
    });

    revItems.push(revItemsArr);

    if (row.DOC_ID != revPrevDocId) {
      revdocobject.items = revItems;
      //revdetails.push(revdocobject);
      revDocs.push(revdocobject);
    }

    if (row.CTIN != prevCtin && row.DOC_ID != revPrevDocId) {
      revObj.docs = revDocs;
      revdetails.push(revObj);
    }

    prevCtin = (row.CTIN != prevCtin) ? row.CTIN : prevCtin;
    revPrevDocId = (row.DOC_ID != revPrevDocId) ? row.DOC_ID : revPrevDocId;
  });

  logger.log("info", "Exiting  generatejson.get3HjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3CD export with payment 

  logger.log("info", "Entering generatejson.get3CDjSON::dataWP:: %s :: %s", new Date().getTime(), new Date().toString());
  let dataWP = await get3CDjSON(request.query.rtnprd, "EXPWP", request.query.gstin, request.query.flag) || []

  let doc = {};
  let sb = {};
  let expwpdetails = [];
  let wpdocsobject = {};
  let wpItemsArr = {};
  let wpprevDocId = "";
  let wpItems = [];
  let wpjsonObj = {};
  await Promise.map(dataWP, (row) => {
    wpItemsArr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }
    if (row.DOC_ID != wpprevDocId) {
      wpItems = [];
      doc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }
      sb = {
        num: row.SHIPNG_BILL_NUM ? row.SHIPNG_BILL_NUM : undefined,
        dt: row.SHIPNG_BILL_DATE ? String(row.SHIPNG_BILL_DATE).replace(regex, '-') : undefined,
        pcode: row.PORT_CODE ? row.PORT_CODE : undefined,
      }
      if (sb.num === undefined && sb.dt === undefined && sb.val === undefined) {

        wpdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          flag: row.FLAG != 'D' ? undefined : row.FLAG,
          rfndelg: "Y",
          doc: doc
        }
      }
      else {
        wpdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          flag: row.FLAG != 'D' ? undefined : row.FLAG,
          rfndelg: "Y",
          doc: doc,
          sb: sb
        }
      }
    }
    wpjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? undefined : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? undefined : row.CESS
    };

    Object.keys(wpjsonObj).forEach(function (key) {
      if (wpjsonObj[key] != null && wpjsonObj[key] !== "")
        wpItemsArr[key] = wpjsonObj[key];
    });
    wpItems.push(wpItemsArr);

    if (row.DOC_ID != wpprevDocId) {
      wpdocsobject.items = wpItems;
      expwpdetails.push(wpdocsobject);
      wpprevDocId = row.DOC_ID;
    }
  })
  logger.log("info", "Exiting generatejson.get3CDjSON::dataWP:: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3CD export without payment
  logger.log("info", "Entering  generatejson.get3CDjSON::dataWOP:: %s :: %s", new Date().getTime(), new Date().toString());
  let dataWOP = await get3CDjSON(request.query.rtnprd, "EXPWOP", request.query.gstin, request.query.flag) || []

  let expwopdetails = [];
  let wopdocsobject = {}, wopjsonObj = {};
  let wopItemsarr = {}, wopdoc = {}, wopsb = {};
  let wopprevDocId = "";
  let wopItms = [];
  await Promise.map(dataWOP, (row) => {
    wopItemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }
    if (row.DOC_ID != wopprevDocId) {
      wopItms = [];
      wopdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }
      wopsb = {
        num: row.SHIPNG_BILL_NUM ? row.SHIPNG_BILL_NUM : undefined,
        dt: row.SHIPNG_BILL_DATE ? String(row.SHIPNG_BILL_DATE).replace(regex, '-') : undefined,
        pcode: row.PORT_CODE ? row.PORT_CODE : undefined,
      }
      if (wopsb.num === undefined && wopsb.dt === undefined && wopsb.val === undefined) {
        wopdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          flag: row.FLAG != 'D' ? undefined : row.FLAG,
          rfndelg: "Y",
          doc: wopdoc
        }
      }
      else {
        wopdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          flag: row.FLAG != 'D' ? undefined : row.FLAG,
          rfndelg: "Y",
          doc: wopdoc,
          sb: wopsb
        }
      }
    }

    wopjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
    };

    Object.keys(wopjsonObj).forEach(function (key) {
      if (wopjsonObj[key] != null && wopjsonObj[key] !== "")
        wopItemsarr[key] = wopjsonObj[key];
    });
    wopItms.push(wopItemsarr);

    if (row.DOC_ID != wopprevDocId) {
      wopdocsobject.items = wopItms;
      expwopdetails.push(wopdocsobject);
      wopprevDocId = row.DOC_ID;
    }
  })
  logger.log("info", "Exiting generatejson.get3CDjSON::dataWOP:: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3B             
  logger.log("info", "Entering generatejson.get3bDetailsjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let b2bData = await get3bDetailsjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let b2bjsonObj = {}, b2bdoc = {}, b2bdocsobj = {}, b2bItemsarr = {};
  let b2bArray = [];
  let b2bItems = [], b2bDocs = [];
  let b2bPrevDocId = "", b2bprevCtin = "";

  await Promise.map(b2bData, (row) => {
    b2bItemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != b2bprevCtin) {
      b2bDocs = [];
      b2bobj = {
        ctin: row.CTIN,

      }
    }

    if (row.DOC_ID != b2bPrevDocId) {
      b2bItems = [];
      b2bdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }

      b2bdocsobj = {
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        rfndelg: "Y",
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        doc: b2bdoc
      }
    }
    b2bjsonObj = {
      hsn: ((row.HSN === "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };

    Object.keys(b2bjsonObj).forEach(function (key) {
      if (b2bjsonObj[key] != null && b2bjsonObj[key] !== "")
        b2bItemsarr[key] = b2bjsonObj[key];
    });

    b2bItems.push(b2bItemsarr);

    if (row.DOC_ID != b2bPrevDocId) {
      b2bdocsobj.items = b2bItems;
      b2bDocs.push(b2bdocsobj);
    }
    if (row.CTIN != b2bprevCtin && row.DOC_ID != b2bPrevDocId) {
      b2bobj.docs = b2bDocs;
      b2bArray.push(b2bobj);
    }

    b2bprevCtin = (row.CTIN != b2bprevCtin) ? row.CTIN : b2bprevCtin;
    b2bPrevDocId = (row.DOC_ID != b2bPrevDocId) ? row.DOC_ID : b2bPrevDocId;
  })
  logger.log("info", "Exiting generatejson.get3bDetailsjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 4 of anx1
  logger.log("info", "Entering generatejson.getTab4Json :: %s :: %s", new Date().getTime(), new Date().toString());
  let tab4Data = await getTab4Json(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let ecomdetails = [], ecomItems = [];
  let ecomitemsarr = {}, ecomObj = {};
  let ecomPrevId = "";

  await Promise.map(tab4Data, (row) => {
    ecomitemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.DOC_ID != ecomPrevId) {
      //ecomItems = [];
      ecomObj = {
        etin: row.ETIN,
        sup: row.SUPPLY_VAL,
        supr: row.SUPPLY_VAL_RETURNED,
        nsup: row.NET_SUPPLY_VAL,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
        sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
        cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
        cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
      }

      Object.keys(ecomObj).forEach(function (key) {
        if (ecomObj[key] != null && ecomObj[key] !== "")
          ecomitemsarr[key] = ecomObj[key];
      });

      // ecomItems.push(ecomitemsarr);

      if (row.DOC_ID != ecomPrevId) {
        ecomdetails.push(ecomitemsarr);
        ecomPrevId = row.DOC_ID;
      }
    }
  })
  logger.log("info", "Exiting generatejson.getTab4Json :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3EF sez with payment
  logger.log("info", "Entering generatejson.get3EFjSON :: sezWP :: %s :: %s", new Date().getTime(), new Date().toString());
  let sezWP = await get3EFjSON(request.query.rtnprd, "SEZWP", request.query.gstin, flag) || []

  let sezwpdetails = [];
  let sezwpitemsarr = {};
  let sezwpprevDocId = "", sezwpPrevCtin = "";
  let sezwpitems = [], sezwpDocs = [];
  let sezwpObj = {}, sezwpdoc = {}, sezwpdocsobj = {}, sezwpjsonObj = {};

  await Promise.map(sezWP, (row) => {
    sezwpitemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != sezwpPrevCtin) {
      sezwpDocs = [];
      sezwpObj = {
        ctin: row.CTIN,

      }
    }

    if (row.DOC_ID != sezwpprevDocId) {
      sezwpitems = [];
      sezwpdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }

      sezwpdocsobj = {
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        clmrfnd: (row.CLAIM_REFUND == "" || row.CLAIM_REFUND == null) ? undefined : row.CLAIM_REFUND,
        rfndelg: "Y",
        doc: sezwpdoc
      }
    }
    sezwpjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? undefined : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? undefined : row.CESS
    };

    Object.keys(sezwpjsonObj).forEach(function (key) {
      if (sezwpjsonObj[key] != null && sezwpjsonObj[key] !== "")
        sezwpitemsarr[key] = sezwpjsonObj[key];
    });
    sezwpitems.push(sezwpitemsarr);

    if (row.DOC_ID != sezwpprevDocId) {
      sezwpdocsobj.items = sezwpitems;
      //sezwpdetails.push(sezwpdocsobj);
      sezwpDocs.push(sezwpdocsobj);
    }

    if (row.CTIN != sezwpPrevCtin && row.DOC_ID != sezwpprevDocId) {
      sezwpObj.docs = sezwpDocs;
      sezwpdetails.push(sezwpObj);
    }

    sezwpPrevCtin = (row.CTIN != sezwpPrevCtin) ? row.CTIN : sezwpPrevCtin;
    sezwpprevDocId = (row.DOC_ID != sezwpprevDocId) ? row.DOC_ID : sezwpprevDocId;

  })
  logger.log("info", "Exiting generatejson.getTab4Json :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3EF sez without payment
  let sezWOP = await get3EFjSON(request.query.rtnprd, "SEZWOP", request.query.gstin, request.query.flag) || []
  logger.log("info", "Entering generatejson.get3EFjSON :: sezWOP :: %s :: %s", new Date().getTime(), new Date().toString());

  let sezwopdetails = [];
  let sezwopitemsarr = {};
  let sezwopprevDocId = "", sezwopPrevCtin = "";
  let sezwopitems = [], sezwopDocs = [];
  let sezwopObj = {}, sezwopdoc = {}, sezwopdocsobj = {}, sezwopjsonObj = {};

  await Promise.map(sezWOP, (row) => {
    sezwopitemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != sezwopPrevCtin) {
      sezwopDocs = [];
      sezwopObj = {
        ctin: row.CTIN,

      }
    }

    if (row.DOC_ID != sezwopprevDocId) {
      sezwopitems = [];
      sezwopdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }

      sezwopdocsobj = {
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        clmrfnd: (row.CLAIM_REFUND == "" || row.CLAIM_REFUND == null) ? undefined : row.CLAIM_REFUND,
        rfndelg: "Y",
        doc: sezwopdoc
      }
    }

    sezwopjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
    };
    Object.keys(sezwopjsonObj).forEach(function (key) {
      if (sezwopjsonObj[key] != null && sezwopjsonObj[key] !== "")
        sezwopitemsarr[key] = sezwopjsonObj[key];
    });
    sezwopitems.push(sezwopitemsarr);

    if (row.DOC_ID != sezwopprevDocId) {
      sezwopdocsobj.items = sezwopitems;
      //sezwopdetails.push(sezwopdocsobj);
      sezwopDocs.push(sezwopdocsobj);
    }

    if (row.CTIN != sezwopPrevCtin && row.DOC_ID != sezwopprevDocId) {
      sezwopObj.docs = sezwopDocs;
      sezwopdetails.push(sezwopObj);
    }

    sezwopPrevCtin = (row.CTIN != sezwopPrevCtin) ? row.CTIN : sezwopPrevCtin;
    sezwopprevDocId = (row.DOC_ID != sezwopprevDocId) ? row.DOC_ID : sezwopprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3EFjSON :: sezWOP :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3G           

  logger.log("info", "Entering generatejson.get3GjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let deData = await get3GjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let dedetails = [];
  let deitemsarr = {};
  let deprevDocId = "", dePrevCtin = "";
  let deitems = [], deDocs = [];
  let dedoc = {}, dedocsobj = {}, dejsonObj = {}, deObj = {};

  await Promise.map(deData, (row) => {
    deitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != dePrevCtin) {
      deDocs = [];
      deObj = {
        ctin: row.CTIN,

      }
    }

    if (row.DOC_ID != deprevDocId) {
      deitems = [];
      dedoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }
      dedocsobj = {
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        clmrfnd: (row.CLAIM_REFUND == "" || row.CLAIM_REFUND == null) ? undefined : row.CLAIM_REFUND,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        rfndelg: "Y",
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        doc: dedoc
      }
    }

    dejsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };

    Object.keys(dejsonObj).forEach(function (key) {
      if (dejsonObj[key] != null && dejsonObj[key] !== "")
        deitemsarr[key] = dejsonObj[key];
    });

    deitems.push(deitemsarr);

    if (row.DOC_ID != deprevDocId) {
      dedocsobj.items = deitems;
      deDocs.push(dedocsobj);
    }

    if (row.CTIN != dePrevCtin && row.DOC_ID != deprevDocId) {
      deObj.docs = deDocs;
      dedetails.push(deObj);
    }

    dePrevCtin = (row.CTIN != dePrevCtin) ? row.CTIN : dePrevCtin;
    deprevDocId = (row.DOC_ID != deprevDocId) ? row.DOC_ID : deprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3GjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3K           
  logger.log("info", "Entering generatejson.get3KjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let impgsezData = await get3KjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let boe = {};
  let impgsezdetails = [];
  let impgsezitemsarr = {};
  let impgsezprevDocId = "", impgsezPrevCtin = "";
  let impgsezitems = [], impgsezDocs = [];
  let impgsezdocsobj = {}, impgsezjsonObj = {}, impgsezObj = {};

  await Promise.map(impgsezData, (row) => {
    impgsezitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != impgsezPrevCtin) {
      impgsezDocs = [];
      impgsezObj = {
        ctin: row.CTIN
      }
    }

    if (row.DOC_ID != impgsezprevDocId) {
      impgsezitems = [];
      boe = {
        num: row.BOE_NUM,
        pcode: row.PORT_CODE,
        dt: String(row.BOE_DATE).replace(regex, '-'),
        val: row.BOE_VALUE,
      }
      impgsezdocsobj = {
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : (row.DOCTYPE == "BOE") ? "B" : row.DOCTYPE,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        rfndelg: "Y",
        boe: boe

      }
    }
    impgsezjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };
    Object.keys(impgsezjsonObj).forEach(function (key) {
      if (impgsezjsonObj[key] != null && impgsezjsonObj[key] !== "")
        impgsezitemsarr[key] = impgsezjsonObj[key];
    });
    impgsezitems.push(impgsezitemsarr);

    if (row.DOC_ID != impgsezprevDocId) {
      impgsezdocsobj.items = impgsezitems;
      //impgsezdetails.push(impgsezdocsobj);
      impgsezDocs.push(impgsezdocsobj);
    }

    if (row.CTIN != impgsezPrevCtin && row.DOC_ID != impgsezprevDocId) {
      impgsezObj.docs = impgsezDocs;
      impgsezdetails.push(impgsezObj);
    }

    impgsezPrevCtin = (row.CTIN != impgsezPrevCtin) ? row.CTIN : impgsezPrevCtin;
    impgsezprevDocId = (row.DOC_ID != impgsezprevDocId) ? row.DOC_ID : impgsezprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3KjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3I          
  let impsData = await get3IjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  logger.log("info", "Entering generatejson.get3IjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  let impsdetails = [];
  let impsitemsarr = {};
  let impsprevDocId = "";
  let impsitems = [];
  let impsdocsobj = {}, impsjsonObj = {};

  await Promise.map(impsData, (row) => {
    impsitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });

    }
    if (row.DOC_ID != impsprevDocId) {
      impsitems = [];
      impsdocsobj = {
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        rfndelg: "Y",
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
      };
    }
    impsjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? "" : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? "" : row.CESS
    };
    Object.keys(impsjsonObj).forEach(function (key) {
      if (impsjsonObj[key] != null && impsjsonObj[key] !== "")
        impsitemsarr[key] = impsjsonObj[key];
    });
    impsitems.push(impsitemsarr);

    if (row.DOC_ID != impsprevDocId) {
      impsdocsobj.items = impsitems;
      impsdetails.push(impsdocsobj);
      impsprevDocId = row.DOC_ID;
    }
  })
  logger.log("info", "Exiting generatejson.get3IjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3J          

  logger.log("info", "Entering generatejson.get3JjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let impgData = await get3JjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let impgdetails = [];
  let impgitemsarr = {};
  let impgprevDocId = "", prevPOS = "";
  let impgitems = [], impgDocs = [];
  let impgboe = {}, impgdocsobj = {}, impgjsonObj = {};

  await Promise.map(impgData, (row) => {
    impgitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });

    }

    if (row.POS != prevPOS) {
      impgDocs = [];
      impgObj = {
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS)
      }
    }

    if (row.DOC_ID != impgprevDocId) {
      impgitems = [];
      impgboe = {
        num: String(row.BOENUM),
        pcode: String(row.BOEPCD),
        dt: String(row.BOEDT).replace(regex, '-'),
        val: row.BOEVAL
      }
      impgdocsobj = {
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : (row.DOCTYPE == "BOE") ? "B" : row.DOCTYPE,
        boe: impgboe
      }
    }
    impgjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? "" : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? "" : row.CESS
    };

    Object.keys(impgjsonObj).forEach(function (key) {
      if (impgjsonObj[key] != null && impgjsonObj[key] !== "")
        impgitemsarr[key] = impgjsonObj[key];
    });
    impgitems.push(impgitemsarr);

    if (row.DOC_ID != impgprevDocId) {
      impgdocsobj.items = impgitems;
      impgDocs.push(impgdocsobj);
    }

    if (row.POS != prevPOS && row.DOC_ID != impgprevDocId) {
      impgObj.docs = impgDocs;
      impgdetails.push(impgObj);
    }

    prevPOS = (row.POS != prevPOS) ? row.POS : prevPOS;
    impgprevDocId = (row.DOC_ID != impgprevDocId) ? row.DOC_ID : impgprevDocId;
  })
  logger.log("info", "Exiting generatejson.get3JjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3L           

  logger.log("info", "Entering generatejson.get3LjSON");
  let misdata = await get3LjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let misdetails = [];
  let misitemsarr = {};
  let misprevDocId = "", misPrevCtin = "";
  let misitems = [], misDocs = [];
  let misdoc = {}, misdocsobj = {}, misjsonObj = {}, misObj = {};

  await Promise.map(misdata, (row) => {
    misitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != misPrevCtin) {
      misDocs = [];
      misObj = {
        ctin: row.CTIN,
        tblref: row.TABLE_TYPE
      }
    }

    if (row.DOC_ID != misprevDocId) {
      misitems = [];
      misdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }
      misdocsobj = {
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        clmrfnd: (row.CLAIM_REFUND == "" || row.CLAIM_REFUND == null) ? undefined : row.CLAIM_REFUND,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        doc: misdoc,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
      }
      if (misdocsobj.sec7act == 'NA')
        delete misdocsobj.sec7act
    }

    misjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };

    Object.keys(misjsonObj).forEach(function (key) {
      if (misjsonObj[key] != null && misjsonObj[key] !== "")
        misitemsarr[key] = misjsonObj[key];
    });

    misitems.push(misitemsarr);

    if (row.DOC_ID != misprevDocId) {
      misdocsobj.items = misitems;
      misDocs.push(misdocsobj);
    }

    if (row.CTIN != misPrevCtin && row.DOC_ID != misprevDocId) {
      misObj.docs = misDocs;
      //  console.log("misObj ::",misObj)
      misdetails.push(misObj);
    }
    // console.log("misdet",JSON.stringify(misdetails))

    misPrevCtin = (row.CTIN != misPrevCtin) ? row.CTIN : misPrevCtin;
    misprevDocId = (row.DOC_ID != misprevDocId) ? row.DOC_ID : misprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3LjSON");


  // The below function is used to generate JSON response table 3BA            
  logger.log("info", "Entering generatejson.get3bDetailsjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let b2baData = await get3BAjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  console.log("json data check", b2baData);
  let b2bajsonObj = {}, b2baodoc = {}, b2badocsobj = {}, b2baItemsarr = {};
  let b2baArray = [];
  let b2baItems = [];
  let b2baPrevDocId = "", b2baprevCtin = "";

  await Promise.map(b2baData, (row) => {
    b2baItemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }


    if (row.DOC_ID != b2baPrevDocId) {
      b2baItems = [];
      b2badoc = {
        num: row.REV_DOC_NUM,
        dt: row.REV_DOC_DATE ? String(row.REV_DOC_DATE).replace(regex, '-') : row.REV_DOC_DATE,
        val: row.REV_DOC_VAL,
      }
      b2baodoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
      }
      //if (row.CTIN != b2baprevCtin) {/
       
        b2badocsobj = {
          octin: row.CTIN,
          ctin: row.REV_CTIN,
          odoctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
          doctyp: (row.REV_DOCTYPE == "CR") ? "C" : (row.REV_DOCTYPE == "DR") ? "D" : row.REV_DOCTYPE,
          flag: (row.FLAG != 'D' && row.FLAG != 'M' && row.FLAG != 'I') ? undefined : (row.FLAG === 'M' ? 'C' : row.FLAG),
          diffprcnt: row.REV_DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
          sec7act: row.REV_SEC7_ACT,
          rfndelg: "Y",
          pos: String(row.REV_POS).length == 1 ? ("0" + String(row.REV_POS)) : String(row.REV_POS),
          doc: b2badoc,
          odoc: b2baodoc
        }
      //}
    }

    b2bajsonObj = {
      hsn: ((row.HSN === "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };



    Object.keys(b2bajsonObj).forEach(function (key) {
      if (b2bajsonObj[key] != null && b2bajsonObj[key] !== "")
        b2baItemsarr[key] = b2bajsonObj[key];
    });


    b2baItems.push(b2baItemsarr);

    if (row.DOC_ID != b2baPrevDocId || row.CTIN != b2baprevCtin && row.DOC_ID != b2baPrevDocId) {
      b2badocsobj.items = b2baItems;
      b2baArray.push(b2badocsobj);
    }


    b2baprevCtin = (row.CTIN != b2baprevCtin) ? row.CTIN : b2baprevCtin;
    b2baPrevDocId = (row.DOC_ID != b2baPrevDocId) ? row.DOC_ID : b2baPrevDocId;
  })
  logger.log("info", "Exiting generatejson.get3BAjSON :: %s :: %s", new Date().getTime(), new Date().toString());


  // The below function is used to generate JSON response table 3BAO            
  logger.log("info", "Entering generatejson.get3baojSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let b2baoData = await get3BAOjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []


  let b2baojsonObj = {}, b2baorgdoc = {}, b2baodocsobj = {}, b2baoItemsarr = {};
  let b2baoArray = [];
  let b2baoItems = [];
  let b2baoPrevDocId = "", b2baoprevCtin = "";

  await Promise.map(b2baoData, (row) => {
    b2baoItemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }


    if (row.DOC_ID != b2baoPrevDocId) {
      b2baoItems = [];
      b2baotabdoc = {
        num: row.REV_DOC_NUM,
        dt: row.REV_DOC_DATE ? String(row.REV_DOC_DATE).replace(regex, '-') : row.REV_DOC_DATE,
        val: row.REV_DOC_VAL
      }
      b2baorgdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE
      }

      //if (row.CTIN != b2baoprevCtin) {
        b2baodocsobj = {
          typ: "O",
          octin: row.CTIN,
          ctin: row.REV_CTIN,
          odoctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
          doctyp: (row.REV_DOCTYPE == "CR") ? "C" : (row.REV_DOCTYPE == "DR") ? "D" : row.REV_DOCTYPE,
          flag: (row.FLAG != 'D' && row.FLAG != 'M' && row.FLAG != 'I') ? undefined : (row.FLAG === 'M' ? 'C' : row.FLAG),
          diffprcnt: row.REV_DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
          sec7act: row.REV_SEC7_ACT,
          rfndelg: "Y",
          pos: String(row.REV_POS).length == 1 ? ("0" + String(row.REV_POS)) : String(row.REV_POS),
          doc: b2baotabdoc,
          odoc: b2baorgdoc
        }
      //}
    }

    b2baojsonObj = {
      hsn: ((row.HSN === "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };


    Object.keys(b2baojsonObj).forEach(function (key) {
      if (b2baojsonObj[key] != null && b2baojsonObj[key] !== "")
        b2baoItemsarr[key] = b2baojsonObj[key];
    });

    b2baoItems.push(b2baoItemsarr);

    if (row.DOC_ID != b2baoPrevDocId || row.CTIN != b2baoprevCtin && row.DOC_ID != b2baoPrevDocId) {
      b2baodocsobj.items = b2baoItems;
      b2baoArray.push(b2baodocsobj);
    }


    b2baoprevCtin = (row.CTIN != b2baoprevCtin) ? row.CTIN : b2baoprevCtin;
    b2baoPrevDocId = (row.DOC_ID != b2baoPrevDocId) ? row.DOC_ID : b2baoPrevDocId;
    //b2baArray.push(b2baoArray[0])
  })
  logger.log("info", "Exiting generatejson.get3BAOjSON :: %s :: %s", new Date().getTime(), new Date().toString());


  // The below function is used to generate JSON response table 3EFA seza with payment
  logger.log("info", "Entering generatejson.get3EFAjSON :: sezwpaA :: %s :: %s", new Date().getTime(), new Date().toString());
  let sezwpa = await get3EFAjSON(request.query.rtnprd, "SEZWPA", request.query.gstin, flag) || []

  let sezwpadetails = [];
  let sezwpaitemsarr = {};
  let sezwpaprevDocId = "", sezwpaPrevCtin = "";
  let sezwpaitems = [], sezwpaDocs = [];
  let sezwpaObj = {}, sezwpadoc = {}, sezwpadocsobj = {}, sezwpajsonObj = {};

  await Promise.map(sezwpa, (row) => {
    sezwpaitemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }


    if (row.DOC_ID != sezwpaprevDocId) {
      sezwpaitems = [];
      sezwpadoc = {
        num: row.REV_DOC_NUM,
        dt: row.REV_DOC_DATE ? String(row.REV_DOC_DATE).replace(regex, '-') : row.REV_DOC_DATE,
        val: row.REV_DOC_VAL
      }
      sezwpaorgdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
      }

      //if (row.CTIN != sezwpaPrevCtin) {
        sezwpadocsobj = {
          octin: row.CTIN,
          ctin: row.REV_CTIN,
          diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
          odoctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
          doctyp: (row.REV_DOCTYPE == "CR") ? "C" : (row.REV_DOCTYPE == "DR") ? "D" : row.REV_DOCTYPE,
           flag: (row.FLAG != 'D' && row.FLAG != 'M' && row.FLAG != 'I') ? undefined : (row.FLAG === 'M' ? 'C' : row.FLAG),
          pos: String(row.REV_POS).length == 1 ? ("0" + String(row.REV_POS)) : String(row.REV_POS),
          clmrfnd: (row.CLAIM_REFUND == "" || row.CLAIM_REFUND == null) ? undefined : row.CLAIM_REFUND,
          rfndelg: "Y",
          doc: sezwpadoc,
          odoc: sezwpaorgdoc
        }
      //}
    }
    sezwpajsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? undefined : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? undefined : row.CESS
    };

    Object.keys(sezwpajsonObj).forEach(function (key) {
      if (sezwpajsonObj[key] != null && sezwpajsonObj[key] !== "")
        sezwpaitemsarr[key] = sezwpajsonObj[key];
    });
    sezwpaitems.push(sezwpaitemsarr);

    if (row.DOC_ID != sezwpaprevDocId && row.CTIN != sezwpaPrevCtin && row.DOC_ID != sezwpaprevDocId) {
      sezwpadocsobj.items = sezwpaitems;
      sezwpadetails.push(sezwpadocsobj);
    }

    // if (row.CTIN != sezwpaPrevCtin && row.DOC_ID != sezwpaprevDocId) {
    //   sezwpaObj.docs = sezwpaDocs;
    //   sezwpadetails.push(sezwpaDocs);
    // }



    sezwpaPrevCtin = (row.CTIN != sezwpaPrevCtin) ? row.CTIN : sezwpaPrevCtin;
    sezwpaprevDocId = (row.DOC_ID != sezwpaprevDocId) ? row.DOC_ID : sezwpaprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3EFAjSON :: %s :: %s", new Date().getTime(), new Date().toString());




  // The below function is used to generate JSON response table 3EFA seza with payment
  logger.log("info", "Entering generatejson.get3EFAjSON :: sezwopa :: %s :: %s", new Date().getTime(), new Date().toString());
  let sezwopa = await get3EFAjSON(request.query.rtnprd, "SEZWOPA", request.query.gstin, flag) || []

  let sezwopadetails = [];
  let sezwopaitemsarr = {};
  let sezwopaprevDocId = "", sezwopaPrevCtin = "";
  let sezwopaitems = [], sezwopaDocs = [];
  let sezwopaObj = {}, sezwopadoc = {}, sezwopadocsobj = {}, sezwopajsonObj = {};

  await Promise.map(sezwopa, (row) => {
    sezwopaitemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }


    if (row.DOC_ID != sezwopaprevDocId) {
      sezwopaitems = [];
      sezwopadoc = {
        num: row.REV_DOC_NUM,
        dt: row.REV_DOC_DATE ? String(row.REV_DOC_DATE).replace(regex, '-') : row.REV_DOC_DATE,
        val: row.REV_DOC_VAL
      }
      sezwopaorgdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
      }

      //if (row.CTIN != sezwopaPrevCtin) {
        sezwopadocsobj = {
          octin: row.CTIN,
          ctin: row.REV_CTIN,
          diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
          odoctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
          doctyp: (row.REV_DOCTYPE == "CR") ? "C" : (row.REV_DOCTYPE == "DR") ? "D" : row.REV_DOCTYPE,
           flag: (row.FLAG != 'D' && row.FLAG != 'M' && row.FLAG != 'I') ? undefined : (row.FLAG === 'M' ? 'C' : row.FLAG),
          pos: String(row.REV_POS).length == 1 ? ("0" + String(row.REV_POS)) : String(row.REV_POS),
          clmrfnd: (row.CLAIM_REFUND == "" || row.CLAIM_REFUND == null) ? undefined : row.CLAIM_REFUND,
          rfndelg: "Y",
          doc: sezwopadoc,
          odoc: sezwopaorgdoc
        }
      //}
    }
    sezwopajsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? undefined : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? undefined : row.CESS
    };

    Object.keys(sezwopajsonObj).forEach(function (key) {
      if (sezwopajsonObj[key] != null && sezwopajsonObj[key] !== "")
        sezwopaitemsarr[key] = sezwopajsonObj[key];
    });
    sezwopaitems.push(sezwopaitemsarr);

    if (row.DOC_ID != sezwopaprevDocId && row.CTIN != sezwopaPrevCtin && row.DOC_ID != sezwopaprevDocId) {
      sezwopadocsobj.items = sezwopaitems;
      sezwopadetails.push(sezwopadocsobj);
    }

    // if (row.CTIN != sezwopaPrevCtin && row.DOC_ID != sezwopaprevDocId) {
    //   sezwopaObj.docs = sezwopaDocs;
    //   sezwopadetails.push(sezwopaObj);
    // }

    console.log("sezwopadetails test json ::", sezwopadetails)

    sezwopaPrevCtin = (row.CTIN != sezwopaPrevCtin) ? row.CTIN : sezwopaPrevCtin;
    sezwopaprevDocId = (row.DOC_ID != sezwopaprevDocId) ? row.DOC_ID : sezwopaprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3EFAjSON :: %s :: %s", new Date().getTime(), new Date().toString());


  // The below function is used to generate JSON response table 3DEA           
  logger.log("info", "Entering generatejson.get3GAjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let deaData = await get3GAjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  console.log("json data check", deaData);
  let deajsonObj = {}, deaodoc = {}, deadocsobj = {}, deaItemsarr = {};
  let deaJson = [];
  let deaItems = [];
  let deaPrevDocId = "", deaprevCtin = "";

  await Promise.map(deaData, (row) => {
    deaItemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }


    if (row.DOC_ID != deaPrevDocId) {
      deaItems = [];
      deadoc = {
        num: row.REV_DOC_NUM,
        dt: row.REV_DOC_DATE ? String(row.REV_DOC_DATE).replace(regex, '-') : row.REV_DOC_DATE,
        val: row.REV_DOC_VAL
      }
      deaodoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE
      }

      //if (row.CTIN != deaprevCtin) {
        deadocsobj = {
          octin: row.CTIN,
          ctin: row.REV_CTIN,
          odoctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : row.DOCTYPE,
          doctyp: (row.REV_DOCTYPE == "CR") ? "C" : (row.REV_DOCTYPE == "DR") ? "D" : row.REV_DOCTYPE,
           flag: (row.FLAG != 'D' && row.FLAG != 'M' && row.FLAG != 'I') ? undefined : (row.FLAG === 'M' ? 'C' : row.FLAG),
          diffprcnt: row.REV_DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
          sec7act: row.REV_SEC7_ACT,
          rfndelg: "Y",
          pos: String(row.REV_POS).length == 1 ? ("0" + String(row.REV_POS)) : String(row.REV_POS),
          doc: deadoc,
          odoc: deaodoc
        }
      //}
    }

    deajsonObj = {
      hsn: ((row.HSN === "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };



    Object.keys(deajsonObj).forEach(function (key) {
      if (deajsonObj[key] != null && deajsonObj[key] !== "")
        deaItemsarr[key] = deajsonObj[key];
    });


    deaItems.push(deaItemsarr);

    if (row.DOC_ID != deaPrevDocId || row.CTIN != deaprevCtin && row.DOC_ID != deaPrevDocId) {
      deadocsobj.items = deaItems;
      deaJson.push(deadocsobj);
    }


    deaprevCtin = (row.CTIN != deaprevCtin) ? row.CTIN : deaprevCtin;
    deaPrevDocId = (row.DOC_ID != deaPrevDocId) ? row.DOC_ID : deaPrevDocId;



  })
  logger.log("info", "Exiting generatejson.get3BAOjSON :: %s :: %s", new Date().getTime(), new Date().toString());



  // Based on profile type forming the json object .
  if (profile === "SM") {
    b2baArray = b2baArray.concat(b2baoArray);
    // b2baArray = b2baArray.length>0?[{ "docs": b2baArray }]:[];
    b2baArray = b2baArray.length > 0 ? b2baArray : [];
    jsonResponse = {
      gstin: request.query.gstin,
      rtnprd: request.query.rtnprd,
      profile: profile,
      issez: issez,
      b2c: b2cArray,
      b2b: b2bArray,
      rev: revdetails,
      b2ba: b2baArray,
      mis: misdetails,
      sezwpa: sezwpadetails,
      sezwopa: sezwopadetails
    }

    Object.keys(jsonResponse).forEach(function (key) {
      if (jsonResponse[key].length == 0 && delete jsonResponse[key])
        genobj[key] = jsonResponse[key];
    });
    await Promise.resolve(genobj);

  }
  else {
    if (profile === "SJ") {
      b2baArray = b2baArray.concat(b2baoArray);
      b2baArray = b2baArray.length > 0 ? b2baArray : [];
      jsonResponse = {
        gstin: request.query.gstin,
        rtnprd: request.query.rtnprd,
        issez: issez,
        profile: profile,
        b2c: b2cArray,
        rev: revdetails,
        mis: misdetails,
        b2ba: b2baArray,
      }
      Object.keys(jsonResponse).forEach(function (key) {
        if (jsonResponse[key].length == 0 && delete jsonResponse[key])
          genobj[key] = jsonResponse[key];
      });
      await Promise.resolve(genobj);
    }
    else {
      if (profile === "MN" || profile === "QN") {

        b2baArray = b2baArray.concat(b2baoArray);
        b2baArray = b2baArray.length > 0 ? b2baArray : [];
        jsonResponse = {
          gstin: request.query.gstin,
          rtnprd: request.query.rtnprd,
          profile: profile,
          issez: issez,
          b2c: b2cArray,
          b2b: b2bArray,
          rev: revdetails,
          expwp: expwpdetails,
          expwop: expwopdetails,
          ecom: ecomdetails,
          sezwp: sezwpdetails,
          sezwop: sezwopdetails,
          de: dedetails,
          impgsez: impgsezdetails,
          imps: impsdetails,
          impg: impgdetails,
          mis: misdetails,
          b2ba: b2baArray,
          sezwpa: sezwpadetails,
          sezwopa: sezwopadetails,
          dea: deaJson

        }

        Object.keys(jsonResponse).forEach(function (key) {
          if (jsonResponse[key].length == 0 && delete jsonResponse[key])
            genobj[key] = jsonResponse[key];
        });
        await Promise.resolve(genobj);
      }
    }
  }

  //Writing Json File
  let sizeofJson = jsonsize(jsonResponse);
  logger.log("info", "Size of Json %s", sizeofJson);
  if (sizeofJson > max_size) {
    let fyear = Buffer.from(fp);
    let finyr = fyear.slice(0, 4) + "-" + fyear.slice(7, 9);
    let final_data = await chunked.getChunkedData({ 'data': jsonResponse, 'headers': request, 'sizeofJson': sizeofJson, 'max_size': max_size });
    await chunked.createChunks({ 'final_data': final_data, 'headers': request }).then(() => {
      let zippath = `json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.zip`;
      chunked.zipDirectory(zippath).then(respPath => { response.status(201).download(respPath), zipath = respPath });
    });
  } else {
    if (_.isEmpty(jsonResponse.b2c) && _.isEmpty(jsonResponse.rev) && _.isEmpty(jsonResponse.b2b) && _.isEmpty(jsonResponse.expwp) && _.isEmpty(jsonResponse.expwop) && _.isEmpty(jsonResponse.ecom) && _.isEmpty(jsonResponse.sezwp) && _.isEmpty(jsonResponse.sezwop) && _.isEmpty(jsonResponse.de) && _.isEmpty(jsonResponse.impgsez) && _.isEmpty(jsonResponse.imps) && _.isEmpty(jsonResponse.impg) && _.isEmpty(jsonResponse.mis) && _.isEmpty(jsonResponse.b2ba) && _.isEmpty(jsonResponse.sezwpa) && _.isEmpty(jsonResponse.sezwopa) && _.isEmpty(jsonResponse.dea)) {
      logger.log("info", "Entering generatejson.isEmpty :: %s :: %s", new Date().getTime(), new Date().toString());

      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `No data found for given GSTIN ${request.query.gstin}`, statusCd: 0 });
      logger.log("info", "Exiting generatejson.isEmpty :: %s :: %s", new Date().getTime(), new Date().toString());

    } else {
      let jsoncontent = JSON.stringify(jsonResponse)

      var fyear = Buffer.from(fp);
      var finyr = fyear.slice(0, 4) + "-" + fyear.slice(7, 9);
      // console.log(finyr.toString());

      fs.access(`json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.json`, fs.F_OK, (err) => {
        if (err) {
          fs.writeFileSync(`json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.json`, jsoncontent, "utf8",
            function (err) {
              if (err) {
                // console.log("An error while writing json");
                return console.log(err);
              }
            }

          )
          response.set('Content-Type', 'application/msword')

          response.download(path.resolve(`json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.json`));


        } else {

          fs.unlink(`json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.json`, function (err) {
            if (err) {
              // console.log("Error while unlinking");
            } else {
              fs.writeFileSync(`json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.json`, jsoncontent, "utf8",
                function (err) {
                  if (err) {
                    // console.log("An error while writing json");
                    return console.log(err);
                  }
                }

              );

              response.download(path.resolve(`json/anx1/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1.json`));

            }
          })

        }
      })

    }
  }
  logger.log("info", "Exiting generatejson.generateJson :: %s :: %s", new Date().getTime(), new Date().toString());
}

/**
 * The below function is used to generate JSON response for the given gstin 
 * @param {*} request 
 * @param {*} response 
 */
async function generateJsonA(request, response) {
  logger.log("info", "Entering generatejson.generateJsonA :: %s :: %s", new Date().getTime(), new Date().toString());
  let profile = request.query.profile || null;
  let issez = request.query.issez || null;
  let fp = request.query.fp || null;
  let jsonResponse = [];
  let genobj = [];
  let flag = request.query.flag || null;
  // console.log('profile', profile);
  let frq = (profile === 'MN') ? 'M' : 'Q';
  let amdmo = 0; // amdno is hardcoded - optional to be sent

  // The below function is used to generate JSON response table3AA
  logger.log("info", "Entering generatejson.get3B2cajSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let b2cData = await get3B2cajSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []
  // console.log('B2CA data ===> ', b2cData);

  let b2cb2cItemsArr = {}, b2cjsonObj = {}, b2cdocobject = {};
  let b2cItems = [], b2cArray = [];
  let b2cPrevDocId = "";

  await Promise.map(b2cData, (row) => {
    b2cb2cItemsArr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json`, statusCd: 0 });
    }

    if (row.DOC_ID != b2cPrevDocId) {
      b2cItems = [];
      b2cdocobject = {
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        pos: String(row.PLACE_OF_SUPPLY).length == 1 ? ("0" + String(row.PLACE_OF_SUPPLY)) : String(row.PLACE_OF_SUPPLY),
        rfndelg: "Y"
      };
    }

    b2cjsonObj = {
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? "" : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? "" : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? "" : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? "" : row.CESS
    };

    Object.keys(b2cjsonObj).forEach(function (key) {
      if (b2cjsonObj[key] != null && b2cjsonObj[key] !== "")
        b2cb2cItemsArr[key] = b2cjsonObj[key];
    });
    b2cItems.push(b2cb2cItemsArr);

    if (row.DOC_ID != b2cPrevDocId) {
      b2cdocobject.items = b2cItems;
      b2cArray.push(b2cdocobject);
      b2cPrevDocId = row.DOC_ID;
    }
  });
  logger.log("info", "Exiting  generatejson.get3B2cajSON :: %s :: %s", new Date().getTime(), new Date().toString());



  logger.log("info", "Entering generatejson.get3CDAjSON::dataWP:: %s :: %s", new Date().getTime(), new Date().toString());
  let dataWP = await get3CDAjSON(request.query.rtnprd, "EXPWP", request.query.gstin, request.query.flag) || []

  let doc = {};
  let odoc = {};
  let sb = {};
  let expwpdetails = [];
  let wpdocsobject = {};
  let wpItemsArr = {};
  let wpprevDocId = "";
  let wpItems = [];
  let wpjsonObj = {};
  await Promise.map(dataWP, (row) => {
    wpItemsArr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }
    if (row.FLAG !== "I" && row.FLAG !== "D") {
      row.FLAG = undefined
    } 
    if (row.STATUS == "Marked as Undo Invalid") {
      row.FLAG = "D"
    }
    if (row.DOC_ID != wpprevDocId) {
      wpItems = [];
      doc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }
      odoc = {
        num: row.ODOC_NUM,
        dt: row.ODOC_DATE ? String(row.ODOC_DATE).replace(regex, '-') : row.ODOC_DATE
      }
      sb = {
        num: row.SHIPNG_BILL_NUM ? row.SHIPNG_BILL_NUM : undefined,
        dt: row.SHIPNG_BILL_DATE ? String(row.SHIPNG_BILL_DATE).replace(regex, '-') : undefined,
        pcode: row.PORT_CODE ? row.PORT_CODE : undefined,
      }
      if (sb.num === undefined && sb.dt === undefined && sb.val === undefined) {

        wpdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          odoctyp: (row.ODOC_TYPE == "CR") ? "C" : (row.ODOC_TYPE == "DR") ? "D" : row.ODOC_TYPE,
          flag: row.FLAG,
          rfndelg: "Y",
          doc: doc,
          odoc: odoc
        }
      }
      else {
        wpdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          odoctyp: (row.ODOC_TYPE == "CR") ? "C" : (row.ODOC_TYPE == "DR") ? "D" : row.ODOC_TYPE,
          flag: row.FLAG,
          rfndelg: "Y",
          doc: doc,
          odoc: odoc,
          sb: sb
        }
      }
    }
    wpjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? undefined : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? undefined : row.CESS
    };

    Object.keys(wpjsonObj).forEach(function (key) {
      if (wpjsonObj[key] != null && wpjsonObj[key] !== "")
        wpItemsArr[key] = wpjsonObj[key];
    });
    wpItems.push(wpItemsArr);

    if (row.DOC_ID != wpprevDocId) {
      wpdocsobject.items = wpItems;
      expwpdetails.push(wpdocsobject);
      wpprevDocId = row.DOC_ID;
    }
  })
  logger.log("info", "Exiting generatejson.get3CDjSON::dataWP:: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3CD export without payment
  logger.log("info", "Entering  generatejson.get3CDjSON::dataWOP:: %s :: %s", new Date().getTime(), new Date().toString());
  let dataWOP = await get3CDAjSON(request.query.rtnprd, "EXPWOP", request.query.gstin, request.query.flag) || []

  let expwopdetails = [];
  let wopdocsobject = {}, wopjsonObj = {};
  let wopItemsarr = {}, wopdoc = {}, wopodoc = {}, wopsb = {};
  let wopprevDocId = "";
  let wopItms = [];
  await Promise.map(dataWOP, (row) => {
    wopItemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }
    if (row.FLAG !== "I" && row.FLAG !== "D") {
      row.FLAG = undefined
    } 
    if (row.STATUS == "Marked as Undo Invalid") {
      row.FLAG = "D"
    }
    if (row.DOC_ID != wopprevDocId) {
      wopItms = [];
      wopdoc = {
        num: row.DOC_NUM,
        dt: row.DOC_DATE ? String(row.DOC_DATE).replace(regex, '-') : row.DOC_DATE,
        val: row.DOC_VAL,
      }
      wopodoc = {
        num: row.ODOC_NUM,
        dt: row.ODOC_DATE ? String(row.ODOC_DATE).replace(regex, '-') : row.ODOC_DATE
      }
      wopsb = {
        num: row.SHIPNG_BILL_NUM ? row.SHIPNG_BILL_NUM : undefined,
        dt: row.SHIPNG_BILL_DATE ? String(row.SHIPNG_BILL_DATE).replace(regex, '-') : undefined,
        pcode: row.PORT_CODE ? row.PORT_CODE : undefined,
      }
      if (wopsb.num === undefined && wopsb.dt === undefined && wopsb.val === undefined) {
        wopdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          odoctyp: (row.ODOC_TYPE == "CR") ? "C" : (row.ODOC_TYPE == "DR") ? "D" : row.ODOC_TYPE,
          flag: row.FLAG,
          rfndelg: "Y",
          doc: wopdoc,
          odoc: wopodoc
        }
      }
      else {
        wopdocsobject = {
          doctyp: (row.DOC_TYPE == "CR") ? "C" : (row.DOC_TYPE == "DR") ? "D" : row.DOC_TYPE,
          odoctyp: (row.ODOC_TYPE == "CR") ? "C" : (row.ODOC_TYPE == "DR") ? "D" : row.ODOC_TYPE,
          flag: row.FLAG,
          rfndelg: "Y",
          doc: wopdoc,
          odoc: wopodoc,
          sb: wopsb
        }
      }
    }

    wopjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
    };

    Object.keys(wopjsonObj).forEach(function (key) {
      if (wopjsonObj[key] != null && wopjsonObj[key] !== "")
        wopItemsarr[key] = wopjsonObj[key];
    });
    wopItms.push(wopItemsarr);

    if (row.DOC_ID != wopprevDocId) {
      wopdocsobject.items = wopItms;
      expwopdetails.push(wopdocsobject);
      wopprevDocId = row.DOC_ID;
    }
  })
  logger.log("info", "Exiting generatejson.get3CDjSON::dataWOP:: %s :: %s", new Date().getTime(), new Date().toString());
  // The below function is used to generate JSON response table3H           
  logger.log("info", "Entering generatejson.get3HjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let tab3hData = await get3HAjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let revItemsArr = {}, revObj = {}, revdocobject = {}, itemsObj = {};
  let revItems = [], revDocs = [];
  let revPrevDocId = "", prevCtin = "";
  let revdetails = [];

  await Promise.map(tab3hData, (row) => {
    revItemsArr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.CTIN != prevCtin) {
      revDocs = [];
      revObj = {
        ctin: row.CTIN,
        type: (row.CTIN.length == 15) ? "G" : "P"

      }
    }

    if (row.DOC_ID != revPrevDocId) {
      revItems = [];
      revdocobject = {
        suptyp: (row.CTIN.length == 10) ? (row.SUPPLY_TYPE == "Inter-State" ? "inter" : "intra") : undefined,
        diffprcnt: row.DIFF_PERCENTAGE == 65 ? 0.65 : undefined,
        sec7act: row.SEC7_ACT,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        rfndelg: "Y"
      }
    }

    itemsObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
      cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };

    Object.keys(itemsObj).forEach(function (key) {
      if (itemsObj[key] != null && itemsObj[key] !== "")
        revItemsArr[key] = itemsObj[key];
    });

    revItems.push(revItemsArr);

    if (row.DOC_ID != revPrevDocId) {
      revdocobject.items = revItems;
      //revdetails.push(revdocobject);
      revDocs.push(revdocobject);
    }

    if (row.CTIN != prevCtin && row.DOC_ID != revPrevDocId) {
      revObj.docs = revDocs;
      revdetails.push(revObj);
    }

    prevCtin = (row.CTIN != prevCtin) ? row.CTIN : prevCtin;
    revPrevDocId = (row.DOC_ID != revPrevDocId) ? row.DOC_ID : revPrevDocId;
  });

  logger.log("info", "Exiting  generatejson.get3HjSON :: %s :: %s", new Date().getTime(), new Date().toString());



  // The below function is used to generate JSON response table 4 of anx1
  logger.log("info", "Entering generatejson.getTab4Json :: %s :: %s", new Date().getTime(), new Date().toString());
  let tab4Data = await getTab4aJson(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let ecomdetails = [], ecomItems = [];
  let ecomitemsarr = {}, ecomObj = {};
  let ecomPrevId = "";

  await Promise.map(tab4Data, (row) => {
    ecomitemsarr = {};
    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.DOC_ID != ecomPrevId) {
      //ecomItems = [];
      ecomObj = {
        etin: row.ETIN,
        sup: row.SUPPLY_VAL,
        supr: row.SUPPLY_VAL_RETURNED,
        nsup: row.NET_SUPPLY_VAL,
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
        sgst: ((row.SGST == "" && row.SGST != 0) || (row.SGST == null && row.SGST != 0)) ? null : row.SGST,
        cgst: ((row.CGST == "" && row.CGST != 0) || (row.CGST == null && row.CGST != 0)) ? null : row.CGST,
        cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
      }

      Object.keys(ecomObj).forEach(function (key) {
        if (ecomObj[key] != null && ecomObj[key] !== "")
          ecomitemsarr[key] = ecomObj[key];
      });

      // ecomItems.push(ecomitemsarr);

      if (row.DOC_ID != ecomPrevId) {
        ecomdetails.push(ecomitemsarr);
        ecomPrevId = row.DOC_ID;
      }
    }
  })
  logger.log("info", "Exiting generatejson.getTab4Json :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3I          
  let impsData = await get3IAjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  logger.log("info", "Entering generatejson.get3IjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  let impsdetails = [];
  let impsitemsarr = {};
  let impsprevDocId = "";
  let impsitems = [];
  let impsdocsobj = {}, impsjsonObj = {};

  await Promise.map(impsData, (row) => {
    impsitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });

    }
    if (row.DOC_ID != impsprevDocId) {
      impsitems = [];
      impsdocsobj = {
        flag: row.FLAG != 'D' ? undefined : row.FLAG,
        rfndelg: "Y",
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
      };
    }
    impsjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? "" : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? "" : row.CESS
    };
    Object.keys(impsjsonObj).forEach(function (key) {
      if (impsjsonObj[key] != null && impsjsonObj[key] !== "")
        impsitemsarr[key] = impsjsonObj[key];
    });
    impsitems.push(impsitemsarr);

    if (row.DOC_ID != impsprevDocId) {
      impsdocsobj.items = impsitems;
      impsdetails.push(impsdocsobj);
      impsprevDocId = row.DOC_ID;
    }
  })
  logger.log("info", "Exiting generatejson.get3IjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3JA         

logger.log("info", "Entering generatejson.get3JAjSON :: %s :: %s", new Date().getTime(), new Date().toString());
let impgData = await get3JAjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

let impgdetails = [];
let impgitemsarr = {};
let impgprevDocId = "", prevPOS = "";
let impgitems = [], impgDocs = [];
let impgboe = {}, impgdocsobj = {}, impgjsonObj = {}; let impgoboe = {}

await Promise.map(impgData, (row) => {
  impgitemsarr = {};

  if (row.FLAG === "F") {
    response.set('Content-Type', 'text/plain');
    response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });

  }

  if (row.FLAG !== "I" && row.FLAG !== "D") {
    row.FLAG = undefined
  } 
  if (row.STATUS == "Marked as Undo Invalid") {
    row.FLAG = "D"
  }

  if (row.POS != prevPOS) {
    impgDocs = [];
    impgObj = {
      pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS)
    }
  }

  if (row.DOC_ID != impgprevDocId) {
    impgitems = [];
    impgboe = {
      num: String(row.BOENUM),
      pcode: String(row.BOEPCD),
      dt: String(row.BOEDT).replace(regex, '-'),
      val: row.BOEVAL
    }
    impgoboe = {
      num: String(row.OBOENUM),
      pcode: String(row.OBOEPCD),
      dt: String(row.OBOEDT).replace(regex, '-'),
    }
    impgdocsobj = {
      flag: row.FLAG,
      doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : (row.DOCTYPE == "BOE") ? "B" : row.DOCTYPE,
      odoctyp: (row.ODOCTYPE == "CR") ? "C" : (row.ODOCTYPE == "DR") ? "D" : (row.ODOCTYPE == "BOE") ? "B" : row.ODOCTYPE,
      boe: impgboe,
      oboe: impgoboe
    }
  }
  impgjsonObj = {
    hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
    txval: row.TAXVAL,
    rate: row.TAXRATE,
    igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? "" : row.IGST,
    cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? "" : row.CESS
  };

  Object.keys(impgjsonObj).forEach(function (key) {
    if (impgjsonObj[key] != null && impgjsonObj[key] !== "")
      impgitemsarr[key] = impgjsonObj[key];
  });
  impgitems.push(impgitemsarr);

  if (row.DOC_ID != impgprevDocId) {
    impgdocsobj.items = impgitems;
    impgDocs.push(impgdocsobj);
  }

  if (row.POS != prevPOS && row.DOC_ID != impgprevDocId) {
    impgObj.docs = impgDocs;
    impgdetails.push(impgObj);
  }

  prevPOS = (row.POS != prevPOS) ? row.POS : prevPOS;
  impgprevDocId = (row.DOC_ID != impgprevDocId) ? row.DOC_ID : impgprevDocId;
})
logger.log("info", "Exiting generatejson.get3JjSON :: %s :: %s", new Date().getTime(), new Date().toString());

  // The below function is used to generate JSON response table 3K           
  logger.log("info", "Entering generatejson.get3KAjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  let impgsezData = await get3KAjSON(request.query.gstin, request.query.rtnprd, request.query.flag) || []

  let boe = {};
  let oboe = {};
  let impgsezdetails = [];
  let impgsezitemsarr = {};
  let impgsezprevDocId = "", impgsezPrevCtin = "";
  let impgsezitems = [], impgsezDocs = [];
  let impgsezdocsobj = {}, impgsezjsonObj = {}, impgsezObj = {};

  await Promise.map(impgsezData, (row) => {
    impgsezitemsarr = {};

    if (row.FLAG === "F") {
      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `Please correct all the records before generating the json `, statusCd: 0 });
    }

    if (row.FLAG !== "I" && row.FLAG !== "D") {
      row.FLAG = undefined
    }
    if (row.STATUS == "Marked as Undo Invalid") {
      row.FLAG = "D"
    }

    if (row.CTIN != impgsezPrevCtin) {
      impgsezDocs = [];
      impgsezObj = {
        ctin: row.CTIN,
        octin: row.OCTIN
      }
    }

    if (row.DOC_ID != impgsezprevDocId) {
      impgsezitems = [];
      boe = {
        num: row.BOE_NUM,
        pcode: row.PORT_CODE,
        dt: String(row.BOE_DATE).replace(regex, '-'),
        val: row.BOE_VALUE,
      }
      oboe = {
        num: row.OBOE_NUM,
        pcode: row.OPORT_CODE,
        dt: String(row.OBOE_DATE).replace(regex, '-')
      }
      impgsezdocsobj = {
        doctyp: (row.DOCTYPE == "CR") ? "C" : (row.DOCTYPE == "DR") ? "D" : (row.DOCTYPE == "BOE") ? "B" : row.DOCTYPE,
        odoctyp: (row.ODOCTYPE == "CR") ? "C" : (row.ODOCTYPE == "DR") ? "D" : (row.ODOCTYPE == "BOE") ? "B" : row.ODOCTYPE,
        flag: row.FLAG,
        pos: String(row.POS).length == 1 ? ("0" + String(row.POS)) : String(row.POS),
        rfndelg: "Y",
        boe: boe,
        oboe: oboe

      }
    }
    impgsezjsonObj = {
      hsn: ((row.HSN == "" && row.HSN != 0) || (row.HSN == null && row.HSN != 0)) ? "" : row.HSN,
      txval: row.TAXVAL,
      rate: row.TAXRATE,
      igst: ((row.IGST == "" && row.IGST != 0) || (row.IGST == null && row.IGST != 0)) ? null : row.IGST,
      cess: ((row.CESS == "" && row.CESS != 0) || (row.CESS == null && row.CESS != 0)) ? null : row.CESS
    };
    Object.keys(impgsezjsonObj).forEach(function (key) {
      if (impgsezjsonObj[key] != null && impgsezjsonObj[key] !== "")
        impgsezitemsarr[key] = impgsezjsonObj[key];
    });
    impgsezitems.push(impgsezitemsarr);

    if (row.DOC_ID != impgsezprevDocId) {
      impgsezdocsobj.items = impgsezitems;
      //impgsezdetails.push(impgsezdocsobj);
      impgsezDocs.push(impgsezdocsobj);
    }

    if (row.CTIN != impgsezPrevCtin && row.DOC_ID != impgsezprevDocId) {
      impgsezObj.docs = impgsezDocs;
      impgsezdetails.push(impgsezObj);
    }

    impgsezPrevCtin = (row.CTIN != impgsezPrevCtin) ? row.CTIN : impgsezPrevCtin;
    impgsezprevDocId = (row.DOC_ID != impgsezprevDocId) ? row.DOC_ID : impgsezprevDocId;

  })
  logger.log("info", "Exiting generatejson.get3KjSON :: %s :: %s", new Date().getTime(), new Date().toString());
  // console.log('jsonResponse ==> ',jsonResponse);

  // Based on profile type forming the json object .
  if (profile === "SM") {
    jsonResponse = {
      gstin: request.query.gstin,
      rtnprd: request.query.rtnprd,
      profile: profile,
      issez: issez,
      frq: frq,
      amdno: 0,
      b2ca: b2cArray,
      reva: revdetails,
    }

    Object.keys(jsonResponse).forEach(function (key) {
      if (jsonResponse[key].length == 0 && delete jsonResponse[key])
        genobj[key] = jsonResponse[key];
    });
    await Promise.resolve(genobj);

  }
  else {
    if (profile === "SJ") {
      jsonResponse = {
        gstin: request.query.gstin,
        rtnprd: request.query.rtnprd,
        issez: issez,
        profile: profile,
        frq: frq,
        amdno: 0,
        b2ca: b2cArray,
        reva: revdetails
      }
      Object.keys(jsonResponse).forEach(function (key) {
        if (jsonResponse[key].length == 0 && delete jsonResponse[key])
          genobj[key] = jsonResponse[key];
      });
      await Promise.resolve(genobj);
    }
    else {
      if (profile === "MN" || profile === "QN") {
        // console.log("De :::", jsonResponse)
        jsonResponse = {
          gstin: request.query.gstin,
          rtnprd: request.query.rtnprd,
          profile: profile,
          issez: issez,
          frq: frq,
          amdno: 0,
          b2ca: b2cArray,
          expwpa: expwpdetails,
          expwopa: expwopdetails,
          reva: revdetails,
          ecoma: ecomdetails,
          impsa: impsdetails,
          impgseza: impgsezdetails,
          impga: impgdetails,
        }

        Object.keys(jsonResponse).forEach(function (key) {
          if (jsonResponse[key].length == 0 && delete jsonResponse[key])
            genobj[key] = jsonResponse[key];
        });
        await Promise.resolve(genobj);
      }
    }
  }

  //Writing Json File
  let sizeofJson = jsonsize(jsonResponse);
  logger.log("info", "Size of Json %s", sizeofJson);
  if (sizeofJson > max_size) {
    let fyear = Buffer.from(fp);
    let finyr = fyear.slice(0, 4) + "-" + fyear.slice(7, 9);
    let final_data = await chunkedA.getChunkedData({ 'data': jsonResponse, 'headers': request, 'sizeofJson': sizeofJson, 'max_size': max_size });
    await chunkedA.createChunks({ 'final_data': final_data, 'headers': request }).then(() => {
      let zippath = `json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.zip`;
      chunkedA.zipDirectory(zippath).then(respPath => { response.status(201).download(respPath), zipath = respPath });
    });
  } else {
    if (_.isEmpty(jsonResponse.b2ca) && _.isEmpty(jsonResponse.expwpa) && _.isEmpty(jsonResponse.expwopa)
      && _.isEmpty(jsonResponse.reva) && _.isEmpty(jsonResponse.ecoma) && _.isEmpty(jsonResponse.impgseza)
      && _.isEmpty(jsonResponse.impsa) && _.isEmpty(jsonResponse.impga)) {


      logger.log("info", "Entering generatejson.isEmpty :: %s :: %s", new Date().getTime(), new Date().toString());

      response.set('Content-Type', 'text/plain');
      response.status(500).send({ message: `No data found for given GSTIN ${request.query.gstin}`, statusCd: 0 });
      logger.log("info", "Exiting generatejson.isEmpty :: %s :: %s", new Date().getTime(), new Date().toString());

    } else {
      let jsoncontent = JSON.stringify(jsonResponse)

      var fyear = Buffer.from(fp);
      var finyr = fyear.slice(0, 4) + "-" + fyear.slice(7, 9);
      // console.log(finyr.toString());
      // console.log('jsoncontent ==> ', jsoncontent);

      fs.access(`json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.json`, fs.F_OK, (err) => {
        if (err) {
          fs.writeFileSync(`json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.json`, jsoncontent, "utf8",
            function (err) {
              if (err) {
                // console.log("An error while writing json");
                return console.log(err);
              }
            }

          )
          response.set('Content-Type', 'application/msword')

          response.download(path.resolve(`json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.json`));


        } else {

          fs.unlink(`json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.json`, function (err) {
            if (err) {
              // console.log("Error while unlinking");
            } else {
              fs.writeFileSync(`json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.json`, jsoncontent, "utf8",
                function (err) {
                  if (err) {
                    // console.log("An error while writing json");
                    return console.log(err);
                  }
                }

              );

              response.download(path.resolve(`json/${request.query.taxperiod.toUpperCase()}_${finyr}_${request.query.gstin}_ANX1A.json`));

            }
          })

        }
      })

    }
  }
  logger.log("info", "Exiting generatejson.generateJson :: %s :: %s", new Date().getTime(), new Date().toString());
}



module.exports = {
  generateJson: generateJson,
  generateJsonA: generateJsonA
};

