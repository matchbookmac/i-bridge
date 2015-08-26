## Requirements

- Node.js >= 0.10.x
  - `sudo apt-get nodejs` on ubuntu
- npm >= 1.4.28
- mySQL 5.6

## Deployment

For "deploying" on a-bridge (a-bridge.internal.mcix.us)

If starting from scratch:

```console
git clone https://multco.git.beanstalkapp.com/a-bridgeapp.git
cd a-bridgeapp
npm install
npm install -g forever nodemon jshint sequelize-cli gulp
```

### Setup Database
*development*
```console
gulp db:create
gulp db:migrate
gulp db:seed
```

*production*

The database should be already setup in prod. If it isn't, you can make a gulp task similar to the deve db:migrate that will set it up for you.
For changes to the db:
```console
gulp db:migrate:production
gulp db:seed:production
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

### Available Tasks
A list of tasks available to make your life easier

```console
npm test
npm start
npm run-script prod-start
npm stop
gulp db:create
gulp db:drop
gulp db:migrate
gulp db:migrate:production
gulp db:test:prepare
gulp db:seed
gulp db:seed:production
```

### Testing:

#### Run test suite:

If running for the first time, or on a new instance of the server:
```console
gulp db:test:prepare
```

Then

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

*Scheduled Lift*
```console
node modules/send-test-post.js -dS
```

*Options*
```console
                    ~~ HTTP POST body options ~~

-S | --scheduled   : Boolean flag. If included, the message sent will mock
                     a lift event being scheduled.

If not a scheduled lift, the post will mock an actual lift event, and the
following options will be available; otherwise, they will be ignored.

-s | --status      : Specify true or false. true: bridge is raising, false:
                     bridge is down. Default is up (true).

The following options are available for both scheduled mocks and actual
event mocks.

-b | --bridge      : The bridge you are mocking. Default is "bailey's
                     bridge".
-d | --defaultPath : Boolean flag. If true, it will send the message to the
                     default path for that message type. Default for
                     scheduled event is '/bridges/events/scheduled', default
                     for actual events is '/bridges/events/actual'. If not
                     passed, message will be sent to
                     '/bridges/events/actual'.
-t | --timeStamp   : Timestamp for the bridge event, in `new
                     Date().toString()` format. Default is the moment the
                     post is sent. If a scheduled event, this will be the
                     default requestTime.

The following options are available only for scheduled event mocks.

-T | --type        : The type of the scheduled lift event. Default is
                     `testing`.
-l | --liftTime    : If a scheduled event, the time at which the bridge will
                     lift

                    ~~ HTTP POST request options ~~

-h | --hostname  : IP Address for where a-bridge instance is located.
                   Default is the ip for your machine.
-H | --headers   : Headers for HTTP method. Defaults are:

                    {
                      "Content-Type":   "application/json",
                      "Content-Length": message.length,
                      "Authorization": "Bearer 1234"
                    }

-m | --method    : HTTP method to use for request. Default is `POST`.
-p | --port      : Port at `hostname` to send to. Default is `80`.
-P | --path      : Path at `hostname:port` to send to. If -d flag is passed,
                   this option will be ignored.

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


Testing auth strategy

curl -H "Content-Type: application/json" -H "Authorization: Bearer 1234" -X POST -d '{"bridge":"ian","status":true,"timeStamp":"Tue Aug 25 2015 09:18:38 GMT-0700 (PDT)"}' http://localhost:80/bridges/events/actual
