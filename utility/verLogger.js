const winston = require('winston');

// define the custom settings for each transport (file, console)
var options = {
	file: {
    level: 'debug',
    filename: "./logs/version.log",
    handleExceptions: true,
    json: true,
    maxsize : "5242880",
    maxFiles : "10",
    colorize: true,
  },
  console: {
    level: 'info',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// instantiate a new Winston Logger with the settings defined above
const  logger = new winston.Logger({
  transports: [
		new winston.transports.File(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

exports.logger = logger;