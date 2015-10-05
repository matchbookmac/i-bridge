exports = module.exports = function (logger, config) {
  var addServerPlugins = function (server) {
    var plugins = [
      { register: require('inert') },
      { register: require('vision') },
      { register: require('hapi-auth-bearer-token') },
      { register: require('hapi-swaggered'),
        options: {
          schemes: ['https'],
          info: {
            title: "Multnomah County Bridges",
            description: "Lift Data API",
            version: config.version,
          }
        }
      },
      { register: require('hapi-swaggered-ui'),
        options: {
          title: "Multnomah County Bridges Lift Data API",
          path: '/bridges/docs',
          basePath: 'https://'+config.iBridge.hostname+'/bridges/docs',
          authorization: {
            scope: 'query',
            field: 'access_token',
            defaultValue: 'email:token',
            placeholder: 'Enter your API token here'
          }
        }
      }
    ];
    server.register(plugins, function (err) {
      if (err) logger.error(err);
    });
  };
  return addServerPlugins;
};

exports['@singleton'] = true;
exports['@require'] = [ 'logger', 'config' ];
