var env     = require('./config.json');
var argv    = require('minimist')(process.argv.slice(2));

function port() {
  return argv.p || argv.port || env.aBridge.port || 80;
}

function aBridge() {
  var tmpABridge = env.aBridge;
  if (environment() === 'test') tmpABridge.hostname = ip.address();
  return tmpABridge;
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

// function mySQL() {
//   if (environment() === 'production') {
//     return env.production.mySQL;
//   } else {
//     return env.development.mySQL;
//   }
// }
//
function bridges() {
  return env.bridges;
}

module .exports = {
  port: port(),
  env: environment(),
  envVars: envVars(),
  aBridge: aBridge(),
  // mySQL: mySQL(),
  bridges: bridges()
};
