const tiny = require('tiny-json-http')

//in prod, run on same machine as rest api
const URL = process.env.NODE_ENV === "production" ? "http://127.0.0.1:8000" : "http://moode.local:8000"

const switchCommand = process.env.NODE_ENV === "test" ? {
    "AdjustVolume": () => Promise.reject(),
    "TurnOn": () => Promise.reject(),
    "TurnOff": () => Promise.reject(),
    "SelectInput": () => Promise.resolve("hi"),
} : {
    "AdjustVolume": async value => {
        const { volume: volumePercentChange } = value
        const volumeChange = volumePercentChange > 0 ? 5 : -5
        const { volume } = await tiny.get(`${URL}/info`)
        await tiny.post({ url: `${URL}/volume/${volume + volumeChange}` })
    },
    "TurnOn": async () => await tiny.post({ url: `${URL}/power/on` }),
    "TurnOff": async () => await tiny.post({ url: `${URL}/power/off` }),
    "SelectInput": async value => {
        const { input: rawInput } = value
        if (rawInput.startsWith("HDMI")) {
            const [_, input] = rawInput.split(" ")
            await tiny.post({ url: `${URL}/hdmi/${input}` })
        }
    }
}

const parseJson = (msg, switchCommand) => {
    return switchCommand[msg.payload.directive](msg.payload.rawDirective.directive.payload)
}

module.exports = function (RED) {
    function ParseCommandsToXMC(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.on('input', function (msg) {
            parseJson(msg, switchCommand).then(r => {
                msg.payload = r
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType("parse-commands-to-xmc", ParseCommandsToXMC);
}