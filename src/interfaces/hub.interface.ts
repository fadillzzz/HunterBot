import { Message } from "discord.js";
import { Games } from "../enums/hub.enum";

export interface HubConfig {
    prefix: string;
}

export interface PostHubConfig extends HubConfig {
    postHubChannel: string;
}

export interface DeleteHubConfig extends HubConfig {
    timer: number;
}

export interface Hub {
    game: Games;
    id: string;
    pass: string;
    description: string;
    author: {
        id: string;
        tag: string;
        displayAvatarURL: string;
    };
    expires: Date;
    post: Message;
    // Supresses error in EditHub because TS isn't smart enough
    [propname: string]: any;
}
