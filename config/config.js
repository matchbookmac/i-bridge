var
  env  = require('./config.json'),
  argv = require('minimist')(process.argv.slice(2))
;

function port() {
  return argv.p || argv.port || 80;
}

function environment() {
  var
    argvEnv = argv.E || argv.env,
    node_env
  ;
  if (argvEnv === 'production' || argvEnv === 'prod') {
    node_env = process.env.NODE_ENV = 'production';
  } else if (argvEnv === 'dev' || argvEnv === 'development') {
    node_env = process.env.NODE_ENV = 'development';
  } else {
    node_env = process.env.NODE_ENV = 'test';
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

function mySQL() {
  return env.mySQL;
}

function bridges() {
  return env.bridges;
}

module .exports = {
  port: port(),
  env: environment(),
  envVars: envVars(),
  mySQL: mySQL(),
  bridges: bridges()
};
