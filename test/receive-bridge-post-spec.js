require('../config/logging');
var
  expect      = require('chai').expect,
  nock        = require('nock'),
  ip          = require('ip'),
  mockPost    = require('../modules/mock-post')
;

describe('receivePost', function () {
  var server = require('../index');

  it('successfully receives post to a-bridge', function () {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
      timeStamp: (new Date()).toString()
    };
    server.inject({
      method: 'POST',
      url: '/incoming-snmp',
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(200);
    });
  });

  it('returns a 400 error if the post body contains extra data', function () {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
      timeStamp: (new Date()).toString(),
      otherValue: "foo"
    };
    server.inject({
      method: 'POST',
      url: '/incoming-snmp',
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(400);
    });
  });

  it('returns a 400 error if the post body is missing required data', function () {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
    };
    server.inject({
      method: 'POST',
      url: '/incoming-snmp',
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(400);
    });
  });

  it('returns a 404 error if the path is incorrect', function () {
    var testMessage = {
      bridge:    "bailey's bridge",
      status:    true,
      timeStamp: (new Date()).toString(),
    };
    server.inject({
      method: 'POST',
      url: '/incoming',
      payload: testMessage
    },
    function (res) {
      expect(res.statusCode).to.equal(404);
    });
  });
});
