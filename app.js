'use strict';
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var http = require('http');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
const winston_logger = require('./utility/logger');
var constants = require('./utility/constants');
var errorConstant = require('./utility/errorconstants');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var app = express();

var cors = require('cors');
app.use(cors());

const NodeCache = require("node-cache");
var async = require('async');
app.set('myCache', new NodeCache({ stdTTL: 200, checkperiod: 120 }));

var userProfileRouter = require('./routes/userProfileRouter');
var anx1Router = require('./routes/anx1Router');
var anx1Routeroffline =require('./routes/anx1Router/anx1Router');
var anx1aRouteroffline =require('./routes/anx1ARouter');
var anx2Router = require('./routes/anx2Router');
var matchRouter = require('./routes/matchRouter');

const { getRatesFromDb, getHSNCodesFromDb } = require('./service/anx1Service/anx1ImpService');
const { getStateMap } = require('./dao/anx1Dao/Anx1expDao');

getRatesData();
getHSNCodesData();
getStateMaps();

async function getRatesData() {
    return new Promise(async function (resolve) {
        let dbCache = app.get('myCache');
        await getRatesFromDb().then((result) => {
            dbCache.set("ratesKey", result); //can set ttl which is configurable => myCache.set( key, val, [ ttl ] ) If the key expires based on it's ttl (configurable) it will be deleted entirely from the internal data object.
            resolve(result);
        }).catch((err)=>{
            logger.log("error","app.js :: getRatesData ::%s",err);
            reject(err);
        })
    });
}

async function getHSNCodesData() {
    return new Promise(async function (resolve) {
        let dbCache = app.get('myCache');
        await getHSNCodesFromDb().then((result) => {
            dbCache.set("hsnKey", result);
            resolve(result);
        }).catch((err)=>{
            logger.log("error","app.js :: getHSNCodesData ::%s",err);
            reject(err);
        })
    });
}

async function getStateMaps() {
    return new Promise(async function (resolve) {
        let dbCache = app.get('myCache');
        await getStateMap().then((result) => {
            dbCache.set("statemap", result, 17000);
            resolve(result);
        })
    });
}

async.waterfall([
    function (callback) {
        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
        app.use(cookieParser());
        app.use(morgan('combined', { stream: winston_logger.stream }));
        app.use('/', indexRouter);
        app.use('/', userProfileRouter);
        app.use('/login', userProfileRouter);
        app.use('/anx1', anx1Router);
        app.use('/anx1', anx1Routeroffline);
        app.use('/anx1', anx1aRouteroffline);
        app.use('/anx2', anx2Router);
        app.use('/matchingtool',matchRouter);
        app.use(express.static(path.join(__dirname, 'public')));
        app.set('port', process.env.PORT || +constants.NODE_PORT);
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
        app.use('*', function (req, res) {
            res.status(404).send(
                errorConstant.BAD_URL);
            res.end();
        });
        callback(null, true);
    }
], function (error, response) {
    var log = require('./utility/logger'), logger = log.logger;
    if (error) {
        logger.log("error", "Error while starting server. Please check error log %s", error.message)
    } else {
        process.on('uncaughtException', function (e) {
            logger.log("error", "UnCaught Exception :: ", e);
        }
        )
        http.createServer(app).listen(
            app.get('port'),
            function () {
                logger.log("info", "Started NodeJS server For Offline Utility , listening on port :: %s , :: %s", app.get('port'), new Date().getTime(), new Date().toString());

                logger.level = constants.LOG_LEVEL;
            });
    }


})
