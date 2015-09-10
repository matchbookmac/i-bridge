var env     = require('./config.json');
var ip      = require('ip');
var argv    = require('minimist')(process.argv.slice(2));

function port() {
  return argv.p || argv.port || process.env.PORT || 80;
}

function environment() {
  var
    argvEnv = argv.E || argv.env,
    node_env
  ;
  if (argvEnv === 'production' || argvEnv === 'prod') {
    node_env = process.env.NODE_ENV = 'production';
  } else if (argvEnv === 'test') {
    node_env = process.env.NODE_ENV = 'test';
  } else {
    node_env = process.env.NODE_ENV = 'development';
  }
  return node_env;
}

function envVars() {
  if (process.env.NODE_ENV) {
    return env[process.env.NODE_ENV];
  } else {
    var node_env = environment();
    return env[node_env];
  }
}

function iBridge() {
  var tmpIBridge = env.iBridge;
  if (environment() === 'test') tmpIBridge.hostname = ip.address();
  return tmpIBridge;
}

var bridges = env.bridges;

module .exports = {
  port: port(),
  env: environment(),
  envVars: envVars(),
  iBridge: iBridge(),
  bridges: bridges
};
