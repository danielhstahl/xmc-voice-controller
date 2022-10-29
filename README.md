## How to install

`npm install @phillyfan1138/xmc-voice-controller`

`$(npm bin)/node-red`

Open a browser to [host]:1880 and add a "virtual smart home" node.  Set it as an entertainment system.  Then add the `parse-commands-to-xmc` node to the output of "virtual smart home".  Point the "host" parameter to the REST API running the [xmc1-rest-api](https://github.com/danielhstahl/xmc-1-rest-api).  If running the node-red server on the same device as the xmc1-rest-api, then simply use `http://127.0.0.1:[port]` as the host.

## Install as service

`sudo mkdir /usr/bin/xmc1NodeRed`
`cd /usr/bin/xmc1NodeRed`
`sudo npm install @phillyfan1138/xmc-voice-controller`

`sudo cp /home/pi/scripts/xmc1NodeRed.service /lib/systemd/system/`
`sudo systemctl start xmc1NodeRed.service`