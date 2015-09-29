## Requirements

- Node.js >= 4.0.0
  - `sudo apt-get nodejs` on ubuntu
- npm >= 2.14.2
- mySQL 5.6
- Redis

## Deployment

For "deploying" on i-bridge (i-bridge.internal.mcix.us)

If i-bridge is already configured and has production code:

```console
cd /opt/i-bridge
sudo git pull
sudo chown -R www-data:www-data .
sudo npm i
npm restart
```
To make this a little easier, you can write a function in your ~/.profile to take car of this automatically:
```shell
deploy ()
{
  cd /opt/i-bridge
  sudo git pull
  sudo chown -R www-data:www-data .
  sudo npm i
  npm restart
}
```

If starting from scratch:

```console
cd /opt
git clone https://multco.git.beanstalkapp.com/i-bridgeapp.git i-bridge
sudo chown -R www-data:www-data i-bridge/
cd i-bridge/
sudo npm install
sudo npm install -g jshint sequelize-cli gulp
```

We are using upstart to run the node server as a daemon in production. Those commands are used for `npm run {start/stop/restart}`.

The upstart file is in `/etc/init/i-bridge.conf`
```shell
#!upstart
# using upstart http://upstart.ubuntu.com/getting-started.html and node forever  https://github.com/nodejitsu/forever/

description "i-bridge node app"
author      "Multnomah County"

start on runlevel [2345]
stop on runlevel [!2345]

respawn
respawn limit 20 5

limit nofile 32768 32768

script
    export HOME="/root"
    chdir /opt/i-bridge
    exec sudo -u www-data PORT=8080 NODE_ENV=production /usr/local/bin/node /opt/i-bridge/index.js >> /opt/i-bridge/logs/app.log 2>&1
end script

pre-start script
    echo "`date -u +%Y-%m-%dT%T.%3NZ`: starting" >> /opt/i-bridge/logs/app.log
end script

pre-stop script
    echo "[`date -u +%Y-%m-%dT%T.%3NZ`]: stopping" >> /opt/i-bridge/logs/app.log
end script
```

### Start server:

*Production:*
```console
sudo start i-bridge
```
or after making changes:
```console
sudo stop i-bridge
sudo start i-bridge
```
OR
```console
npm restart
```

*Development (with jshint and nodemon):*
```console
npm start
```

### Testing:

To hit an api endpoint in dev, you will need to authenticate.
Using either the access_token query approach `?access_token=user@example.com:1234`:
http://localhost:8000/bridges/hawthorne?access_token=user@example.com:1234
or as a header in your request:
```shell
{
  "Authorization": "Bearer user@example.com:1234"
}
```
i.e.:
```shell
curl -H "Authorization: Bearer user@example.com:1234" http://localhost:8000/bridges/hawthorne
```

In prod, the same will work at https://api.multco.us/bridges, but the auth email:token combo is:
multco-developer@multco.us:2966e6828420dae37f4f616e74941a7e

#### To send a test post to i-bridge:

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

-h | --hostname  : IP Address for where i-bridge instance is located.
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

curl -H "Content-Type: application/json" -H "Authorization: Bearer 1234" -X POST -d '{"bridge":"cuevas crossing","type":"testing","requestTime":"Tue Aug 25 2015 13:52:38 GMT-0700 (PDT)","estimatedLiftTime":"Tue Aug 25 2015 15:52:38 GMT-0700 (PDT)"}' http://52.26.186.75:80/bridges/events/scheduled
