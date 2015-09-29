var Hapi = require('hapi');

exports = module.exports = function (serverConfig, routes, methods, sockets, plugins, onResponse, auth) {
  // Setup new Hapi server
  var server = new Hapi.Server({
    cache: {
      engine: require('catbox-redis'),
      host: serverConfig.redis.host,
      port: serverConfig.redis.port,
      partition: 'cache'
    }
  });

  server.connection({
    port: serverConfig.port,
    uri: 'https://'+serverConfig.iBridge.hostname+':'+serverConfig.port+'',
    routes: {
      cors: true,
      cache: {
        expiresIn: 30 * 1000,
        privacy: 'private'
      }
    }
  });

  // Setup server with modular components. The order of these does matter
  sockets(server);
  plugins(server);
  onResponse(server);
  auth(server);
  methods(server);
  routes(server);

  return server;
};

exports['@singleton'] = true;
exports['@require'] = [ 'config', 'routes', 'methods', 'sockets', 'plugins', 'response-log', 'auth' ];
