var injector = require('electrolyte');

injector.loader(injector.node('config'));
injector.loader(injector.node('handlers'));
injector.loader(injector.node('models/db'));
injector.loader(injector.node('modules'));
injector.loader(injector.node('routes'));
injector.loader(injector.node('server'));

var server = injector.create('server');
var logger = injector.create('logger');
var config = injector.create('config');

server.start(function(){
  logger.info(config.env);
  logger.info('Server running at:', server.info.uri);
});
