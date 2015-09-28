var injector = require('electrolyte');

exports = module.exports = function (
  notifyUsers,
  postToParse,
  getSSE,
  getBridge,
  getBridges,
  getBridgeEvents,
  getBridgeActual,
  getBridgesActual,
  getBridgeScheduled,
  getBridgesScheduled
) {
  var handlers = {
    notifyUsers: notifyUsers,
    postToParse: postToParse,
    getSSE: getSSE,
    getBridge: getBridge,
    getBridges: getBridges,
    getBridgeEvents: getBridgeEvents,
    getBridgeActual: getBridgeActual,
    getBridgesActual: getBridgesActual,
    getBridgeScheduled: getBridgeScheduled,
    getBridgesScheduled: getBridgesScheduled
  };
  return handlers;
};

exports['@singleton'] = true;
exports['@require'] = [
  'notify-users',
  'post-to-parse',
  'get-sse',
  'get-bridge',
  'get-bridges',
  'get-bridge-events',
  'get-bridge-actual',
  'get-bridges-actual',
  'get-bridge-scheduled',
  'get-bridges-scheduled',
];
