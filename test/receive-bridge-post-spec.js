var
  expect      = require('chai').expect,
  nock        = require('nock'),
  ip          = require('ip'),
  mockPost    = require('../modules/mock-post')
;

describe('receivePost', function () {
  it('successfully receives post to a-bridge', function () {
    server = require('../index');
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
      // done();
    });
  });
});
