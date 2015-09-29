var injector = require('electrolyte');

injector.loader(injector.node('config'));
injector.loader(injector.node('handlers'));
injector.loader(injector.node('models/db'));
injector.loader(injector.node('modules'));
injector.loader(injector.node('server'));

var logger = injector.create('logger');
var config = injector.create('config');
logger.info('NODE_ENV: '+ config.env);

var server = injector.create('server');
server.start(function(){
  logger.info('Server running at:', server.info.uri);
});
