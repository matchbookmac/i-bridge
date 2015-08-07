For "deploying" on a-bridge (a-bridge.internal.mcix.us)

if starting from scratch:

```console
sudo apt-get nodejs
git clone https://multco.git.beanstalkapp.com/a-bridgeapp.git
cd a-bridgeapp
npm install
npm install -g forever
```

Start server:

*Production:*
```console
forever start index.js
```
*Development:*
```console
nodemon index.js
```
