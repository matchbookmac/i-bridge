var injector = require('electrolyte');

exports = module.exports = function (handlers) {
  var addServerMethods = function (server) {
    server.method('getBridge', handlers.getBridge, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 }
    });
    server.method('getBridges', handlers.getBridges, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 }
    });
    server.method('getBridgeEvents', handlers.getBridgeEvents, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 },
      generateKey: function (request) {
        return request.path.split('/').join(',');
      }
    });
    server.method('getBridgeActual', handlers.getBridgeActual, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 },
      generateKey: function (request) {
        return request.path.split('/').join(',');
      }
    });
    server.method('getBridgesActual', handlers.getBridgesActual, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 },
      generateKey: function (request) {
        return request.path.split('/').join(',');
      }
    });
    server.method('getBridgeScheduled', handlers.getBridgeScheduled, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 },
      generateKey: function (request) {
        return request.path.split('/').join(',');
      }
    });
    server.method('getBridgesScheduled', handlers.getBridgesScheduled, {
      cache: { expiresIn: 30 * 1000, generateTimeout: 500 },
      generateKey: function (request) {
        return request.path.split('/').join(',');
      }
    });
  };
  return addServerMethods;
};

exports['@singleton'] = true;
exports['@require'] = [ 'handlers' ];
