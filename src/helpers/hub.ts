import { RichEmbed } from "discord.js";
import { Hub, HubPrototype } from "../interfaces/hub.interface";

/**
 * Tests a password and returns "N/A" if it fails
 *
 * @param {String} password
 * @return {String}
 */
export function parsePassword(password: string): string {
    return password.match(/^\d{4}$/) ? password : "N/A";
}

/**+
 * Generate the rich embed object for the hub
 *
 * @param {String} game
 * @param {String} id
 * @param {String} pass
 * @param {String} description
 * @param {String} author.tag
 * @param {String} author.displayAvatarURL
 * @return {RichEmbed}
 */
export function getEmbed({ game, id, pass, description = "", author }: HubPrototype): RichEmbed {
    const fields = [];

    if (pass) {
        fields.push({ name: "Password:", value: pass });
    }

    return new RichEmbed({
        title: `[${game}] ${id}`,
        description: description ? `\`\`\`${description}\`\`\`` : "",
        fields,
        footer: {
            text: author.tag,
            icon_url: author.displayAvatarURL,
        },
    }).setColor("RANDOM");
}

/**
 * Retrieves a hub, given a message author
 *
 * @param {Object} hubs
 * @param {Object} hubs[].author
 * @param {String} hubs[].author.id
 * @param {Object} author
 * @param {String} author.id
 * @return {Object}
 */
export function getHubByAuthor(hubs: { [propname: string]: Hub }, author: { id: string }): object | undefined {
    return Object.values(hubs).find(hub => {
        return hub.author.id === author.id;
    });
}
