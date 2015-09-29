exports = module.exports = function (logger) {
  var addServerPlugins = function (server) {
    var plugins = [
      { register: require('inert') },
      { register: require('vision') },
      { register: require('hapi-auth-bearer-token') },
      { register: require('lout'),
        options: {
          endpoint: '/bridges/docs'
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
exports['@require'] = [ 'logger' ];
