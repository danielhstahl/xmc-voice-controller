var helper = require("node-red-node-test-helper");
var xmcNode = require("../index.js");

describe('parse-light-commands-to-xmc Node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "parse-commands-to-xmc", name: "test name" }];
        helper.load(xmcNode, flow, function () {
            var n1 = helper.getNode("n1");
            expect(n1).toHaveProperty('name', 'test name');
            done();
        });
    });

    it('should parse payload', function (done) {
        var flow = [{ id: "n1", type: "parse-commands-to-xmc", name: "test name", wires: [["n2"]] },
        { id: "n2", type: "helper" }];
        helper.load(xmcNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            expect(n1).toHaveProperty('name', 'test name');
            n2.on("input", function (msg) {
                console.log(msg)
                expect(msg.payload).toBe('hi')//should.have.property('payload', 'uppercase');
                done();
            });
            n1.receive({
                payload: {
                    powerState: 'OFF',
                    input: 'HDMI 2',
                    channel: 1,
                    volume: 50,
                    muted: false,
                    source: 'alexa',
                    directive: 'SelectInput',
                    name: 'XMC',
                    type: 'ENTERTAINMENT_DEVICE',
                    rawDirective: {
                        directive: {
                            header: {
                                namespace: 'Alexa.InputController',
                                name: 'SelectInput',
                                correlationToken: 'SUdTVEs6AAE6AAg6eyJpZCI6ImFlYTVlYWIzLTg3MTAtNDQ5Ni04MmVjLTJiMDM0ZGU1ZjdlZSIsInVyaSI6Imh0dHBzOi8vZC1hY3JzLW5hLXAtNWUyLTdhYTI5ZjVkLnVzLWVhc3QtMS5hbWF6b24uY29tOjk0NDQiLCJzZXNzaW9uSWQiOiI2ZjAzNGFmZS04MDE3LTQ4ZjktOGVlOC03N2VmNDQwZWRjNDUifQ=='
                            },
                            endpoint: { endpointId: 'vshd-c244a17f8b76ecd3' },
                            payload: { input: 'HDMI 2' }
                        }
                    }
                },
            });
        });
    });
});