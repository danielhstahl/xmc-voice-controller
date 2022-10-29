const tiny = require('tiny-json-http')

const switchCommand = process.env.NODE_ENV === "test" ? () => ({
    "AdjustVolume": () => Promise.reject(),
    "TurnOn": () => Promise.reject(),
    "TurnOff": () => Promise.reject(),
    "SelectInput": () => Promise.resolve("hi"),
}) : (host) => ({
    "AdjustVolume": async (node, value) => {
        const { volume: volumePercentChange } = value
        const volumeChange = volumePercentChange > 0 ? 5 : -5
        node.log(`Changing volume by ${volumeChange}`);
        try {
            const info = await tiny.get({ url: `${host}/info` })
            const { volume } = info.body
            node.log(`Current volume: ${volume}`)
            return await tiny.post({ url: `${host}/volume/${volume + volumeChange}` })
        }
        catch (e) {
            node.error(e)
        }
    },
    "TurnOn": async (node) => {
        node.log("Powering on")
        try {
            const url = `${host}/power/on`
            node.log(`Sending request to endpoint ${url}`);
            return await tiny.post({ url })
        }
        catch (e) {
            node.error(e)
        }
    },
    "TurnOff": async (node) => {
        node.log("Powering off")
        try {
            const url = `${host}/power/off`
            node.log(`Sending request to endpoint ${url}`);
            return await tiny.post({ url })
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
            const url = `${host}/hdmi/${input}`
            node.log(`Sending request to endpoint ${url}`);
            try {
                return await tiny.post({ url })
            } catch (e) {
                node.error(e)
            }
        }
    }
})

const parseJson = (msg, node, switchCommand) => {
    return switchCommand[msg.payload.directive](node, msg.payload.rawDirective.directive.payload)
}

module.exports = function (RED) {
    function ParseCommandsToXMC(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const { host } = config
        const getCommand = switchCommand(host)
        node.log(`Url is ${host}`)
        //node.log(`Enviroment is ${process.env.NODE_ENV}`)
        node.on('input', function (msg) {
            node.log("Message received, processing");
            parseJson(msg, node, getCommand).then(r => {
                msg.payload = r
                node.send(msg);
            })
        });
    }
    RED.nodes.registerType("parse-commands-to-xmc", ParseCommandsToXMC);
}