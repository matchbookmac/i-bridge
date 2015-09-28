var injector = require('electrolyte');

injector.loader(injector.node('server'));
injector.loader(injector.node('config'));

var server = injector.create('server');
var logger = injector.create('logger');

server.start(function(){
  logger.info('Server running at:', server.info.uri);
});
