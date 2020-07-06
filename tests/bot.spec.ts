import Bot from 'bot';

describe("Bot", () => {
    it("should accept new features", () => {
        const bot = new Bot({}, {listenChannel: ""});
        bot.addFeatures({});
        expect(bot.features.length).toBe(1);
    });

    it("should initialise message & ready handlers", () => {
        const client = {
            on: jest.fn()
        };

        const bot = new Bot(client, {listenChannel: ""});
        bot.init();

        expect(client.on.mock.calls.length).toBe(2);
        expect(client.on.mock.calls.map(x => x[0])).toEqual(expect.arrayContaining(["message", "ready"]));
        expect(client.on.mock.calls[0][1]).toBeInstanceOf(Function);
        expect(client.on.mock.calls[1][1]).toBeInstanceOf(Function);
    });
});
