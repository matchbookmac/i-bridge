## Requirements

- Node.js >= 0.10.x
  - `sudo apt-get nodejs` on ubuntu
- npm >= 1.4.28
- mySQL 5.6

## Deployment

For "deploying" on a-bridge (a-bridge.internal.mcix.us)

if starting from scratch:

```console
git clone https://multco.git.beanstalkapp.com/a-bridgeapp.git
cd a-bridgeapp
npm install
npm install -g forever nodemon jshint sequelize-cli
```

### Start server:

*Production (no jshint):*
```console
npm run-script prod-start
```

*Development (with jshint):*
```console
npm start
```

### Testing:

#### Run test suite:
```console
npm test
```

#### To send a test post to a-bridge:

*Bridge Up*
```console
node modules/send-test-post.js
```

*Bridge Down*
```console
node modules/send-test-post.js -s false
```

*Options*
```console
~~ http post body options ~~
-b | --bridge    : The bridge you are mocking. Default is "bailey's bridge".
-s | --status    : Specify up or down. true: bridge is raising, false: bridge
                   is down. Default is up (true).
-t | --timeStamp : Timestamp for the bridge event, in `new Date().toString()`
                   format. Default is the moment the post is sent.

~~ http post request optionst ~~
-h | --hostname  : IP Address for where a-bridge instance is located. Default is
                   `52.26.186.75`.
-p | --port      : Port at `hostname` to send to. Default is `80`.
-P | --path      : Path at `hostname:port` to send to. Default is
                   `/incoming-snmp`.
-m | --method    : HTTP method to use for request. Default is `POST`.
-H | --headers   : Headers for HTTP method. Defaults are:

                    {
                      "Content-Type":   "application/json",
                      "Content-Length": bridgeData.length
                    }

Any other arguments without `-` or `--` will be sent as an array of values assigned to the property `othMsgVals` on the http post body:

  > node modules/send-test-post.js -b "cuevas crossing" -s false foo bar
  {
    "bridge":    "cuevas crossing",
    "status":    "false",
    "timeStamp": "Thu Aug 13 2015 15:44:08 GMT-0700 (PDT)",
    "othMsgVals": ["foo", "bar"]
  }

Extraneous options with `-` or `--` that are not listed above will be ignored.
```
