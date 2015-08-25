require('../config/logging');
var expect      = require('chai').expect;
var nock        = require('nock');
var aBridge     = require('../config/config').aBridge;
var mockPost    = require('../modules/mock-post');

describe('receivePost', function () {
  var server = require('../index');

  it('successfully receives post to a-bridge', function (done) {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
      timeStamp: (new Date()).toString()
    };
    headers = aBridge.headers;
    headers['Content-Length'] = testMessage.length;
    server.inject({
      method: aBridge.method,
      url: aBridge.path,
      headers: headers,
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('returns a 400 error if the post body contains extra data', function (done) {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
      timeStamp: (new Date()).toString(),
      otherValue: "foo"
    };
    headers = aBridge.headers;
    headers['Content-Length'] = testMessage.length;
    server.inject({
      method: aBridge.method,
      url: aBridge.path,
      headers: headers,
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('returns a 400 error if the post body is missing required data', function (done) {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
    };
    headers = aBridge.headers;
    headers['Content-Length'] = testMessage.length;
    server.inject({
      method: aBridge.method,
      url: aBridge.path,
      headers: headers,
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });

  it('returns a 404 error if the path is incorrect', function (done) {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
      timeStamp: (new Date()).toString(),
    };
    headers = aBridge.headers;
    headers['Content-Length'] = testMessage.length;
    server.inject({
      method: aBridge.method,
      url: '/incoming',
      headers: headers,
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(404);
      done();
    });
  });
});
