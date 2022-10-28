const tiny = require('tiny-json-http')

//in prod, run on same machine as rest api
const URL = process.env.NODE_ENV === "production" ? "http://127.0.0.1:8000" : "http://moode.local:8000"
const switchCommand = process.env.NODE_ENV === "test" ? {
    "AdjustVolume": () => Promise.reject(),
    "TurnOn": () => Promise.reject(),
    "TurnOff": () => Promise.reject(),
    "SelectInput": () => Promise.resolve("hi"),
} : {
    "AdjustVolume": async (node, value) => {
        const { volume: volumePercentChange } = value
        const volumeChange = volumePercentChange > 0 ? 5 : -5
        node.log(`Changing volume by ${volumeChange}`);
        try {
            const { volume } = await tiny.get(`${URL}/info`)
            await tiny.post({ url: `${URL}/volume/${volume + volumeChange}` })
        }
        catch (e) {
            node.error(e)
        }
    },
    "TurnOn": async (node) => {
        node.log("Powering on")
        try {
            await tiny.post({ url: `${URL}/power/on` })
        }
        catch (e) {
            node.error(e)
        }
    },
    "TurnOff": async (node) => {
        node.log("Powering off")
        try {
            await tiny.post({ url: `${URL}/power/off` })
        }
        catch (e) {
            node.error(e)
        }
    },
    "SelectInput": async (node, value) => {
        const { input: rawInput } = value
        node.log(`Changing input to ${rawInput}`);
        if (rawInput.startsWith("HDMI")) {
            const [_, input] = rawInput.split(" ")
            try {
                await tiny.post({ url: `${URL}/hdmi/${input}` })
            } catch (e) {
                node.error(e)
            }
        }
    }
}

const parseJson = (msg, node, switchCommand) => {
    return switchCommand[msg.payload.directive](node, msg.payload.rawDirective.directive.payload)
}

module.exports = function (RED) {
    function ParseCommandsToXMC(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.log(`Url is ${URL}`)
        node.log(`Enviroment is ${process.env.NODE_ENV}`)
        node.on('input', function (msg) {
            node.log("Message received, processing");
            parseJson(msg, node, switchCommand).then(r => {
                msg.payload = r
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType("parse-commands-to-xmc", ParseCommandsToXMC);
}