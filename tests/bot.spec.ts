import Bot from 'bot';

describe("Bot", () => {
    it("should accept new features", () => {
        const bot = new Bot({}, { listenChannel: "" });
        bot.addFeatures({});
        expect(bot.features.length).toBe(1);
    });

    it("should initialise message & ready handlers", () => {
        const client = {
            on: jest.fn()
        };

        const bot = new Bot(client, { listenChannel: "" });
        bot.init();

        expect(client.on).toHaveBeenCalledTimes(2);
        // We're validating the strings like this because we don't want the order of
        // operation to potentially cause the test to fail
        expect(client.on.mock.calls.map(x => x[0])).toEqual(expect.arrayContaining(["message", "ready"]));
        expect(client.on).toHaveBeenNthCalledWith(1, expect.any(String), expect.any(Function));
        expect(client.on).toHaveBeenNthCalledWith(2, expect.any(String), expect.any(Function));
    });

    it("should return true if the message is 'understandable'", () => {
        const bot = new Bot({}, { listenChannel: "1", prefix: "/" });
        expect(bot.understandable({ author: { bot: false }, channel: { id: "1" }, content: "/delete" })).toBe(true);
    });

    it("should return false if the message is not 'understandable'", () => {
        let bot = new Bot({}, { listenChannel: "1", prefix: "/" });
        expect(bot.understandable({ author: { bot: true }, channel: { id: "1" }, content: "/delete" })).toBe(false);

        bot = new Bot({}, { listenChannel: "1", prefix: "/" });
        expect(bot.understandable({ author: { bot: false }, channel: { id: "2" }, content: "/delete" })).toBe(false);

        bot = new Bot({}, { listenChannel: "1", prefix: "!" });
        expect(bot.understandable({ author: { bot: false }, channel: { id: "1" }, content: "/delete" })).toBe(false);

        bot = new Bot({}, { listenChannel: "1", prefix: "!" });
        expect(bot.understandable({ author: { bot: true }, channel: { id: "2" }, content: "/delete" })).toBe(false);
    });

    it("should broadcast events to all features", () => {
        const bot = new Bot({}, { listenChannel: "" });
        const featureOne = jest.fn();
        const featureTwo = jest.fn();
        bot.addFeatures([{ on: featureOne }, { on: featureTwo }]);

        bot.broadcast('test', { hi: true });

        expect(featureOne).toHaveBeenCalledTimes(1);
        expect(featureOne).toBeCalledWith('test', expect.objectContaining({ hi: true }), bot);
        expect(featureTwo).toHaveBeenCalledTimes(1);
        expect(featureTwo).toBeCalledWith('test', expect.objectContaining({ hi: true }), bot);
    });
});
