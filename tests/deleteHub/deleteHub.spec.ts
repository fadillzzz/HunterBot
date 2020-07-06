import { getHubByAuthor } from "helpers/hub";
import { DeleteHub } from "features";
import { MessageEmbed } from "discord.js";

jest.mock("helpers/hub");

describe("Delete Hub", () => {
    it("should reply with a message if the user has not posted a hub", () => {
        const message = { content: "delete", channel: { send: jest.fn() } };
        getHubByAuthor.mockReturnValueOnce(undefined);
        new DeleteHub().respond({}, message);
        expect(message.channel.send).toHaveBeenCalledTimes(1);
        expect(message.channel.send).toHaveBeenCalledWith("You have not posted a hub", { "reply": undefined });
    });

    it("should delete hub when the user uses the /delete command", () => {
        const message = { content: "delete", react: jest.fn() };
        getHubByAuthor.mockReturnValueOnce({ post: { id: 1 } });
        new DeleteHub().respond({}, message);
        // There's currently no good way to check this functionality because of private modifiers
        // This is the best we can do for now
        expect(message.react).toHaveBeenCalledTimes(1);
    });

    it.skip("should delete hub when the user click on the trash icon", () => {
        // How the heck do I event test this?
    });

    it("should have an embed for the help message", () => {
        expect(new DeleteHub({prefix: ""}).commandHelpEmbed).toBeInstanceOf(MessageEmbed);
    });
});
