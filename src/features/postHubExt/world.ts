import { Games } from "../../enums/hub.enum";
import { InvalidId, InvalidSyntax } from "../../exceptions/common";
import { InvalidPlatform } from "../../exceptions/postHub";
import { HubPrototype } from "../../interfaces/hub.interface";
import { MHWConfig, PostHubStrategy } from "../../interfaces/postHub.interface";
import Base from "./base";

export default class World extends Base implements PostHubStrategy {
    private config: MHWConfig;

    constructor(config: MHWConfig) {
        super();
        this.config = config;
    }

    public isSyntaxValid(): boolean {
        // Syntax should be /post GAME ID PLATFORM [DESCRIPTION]
        if (this.pieces.length < 4) {
            throw new InvalidSyntax();
        }

        if (!this.pieces[2].match(/^[a-zA-Z0-9]{12}$/)) {
            throw new InvalidId();
        }

        return true;
    }

    public parsePassword(): string | null {
        return null;
    }

    public extractHubInfo(): HubPrototype {
        const partial = super.extractHubInfo() as HubPrototype;

        return {
            ...partial,
            game: Games.MHW,
        };
    }

    public getTargetChannelId(): string {
        const platform = this.pieces[3].toLowerCase() as "xbox" | "ps4" | "pc";

        if (this.config.channels[platform]) {
            return this.config.channels[platform];
        }

        throw new InvalidPlatform();
    }
}
