import { Message } from "discord.js";
import { Games } from "../enums/hub.enum";

export interface HubConfig {
    prefix: string;
}

export interface DeleteHubConfig extends HubConfig {
    timer: number;
}

export interface HubPrototype {
    game: Games;
    id: string;
    pass: string | null;
    description: string;
    author: {
        id: string;
        tag: string;
        displayAvatarURL: string;
    };
}

export interface Hub extends HubPrototype {
    expires: Date;
    post: Message;
    collector: any;
    timer: NodeJS.Timer;
    full: boolean;
}
