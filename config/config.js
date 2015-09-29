var ip      = require('ip');
var argv    = require('minimist')(process.argv.slice(2));

var currentEnv = (function environment() {
  var argvEnv = argv.E || argv.env || process.env.NODE_ENV;
  var node_env;
  if (argvEnv === 'production' || argvEnv === 'prod') {
    node_env = process.env.NODE_ENV = 'production';
  } else if (argvEnv === 'test') {
    node_env = process.env.NODE_ENV = 'test';
  } else {
    node_env = process.env.NODE_ENV = 'development';
  }
  return node_env;
}
)();

var envVars = require('./config.json')[currentEnv];

function port() {
  return argv.p || argv.port || process.env.PORT || 8000;
}

function iBridge() {
  return envVars.iBridge;
}

function parse() {
  return envVars.parse;
}

function redis() {
  return envVars.redis;
}

var bridges = envVars.bridges;

exports = module.exports = function () {
  var config = {
    port: port(),
    env: currentEnv,
    envVars: envVars,
    iBridge: iBridge(),
    parse: parse(),
    redis: redis(),
    bridges: bridges
  };
  return config;
};

exports['@singleton'] = true;
