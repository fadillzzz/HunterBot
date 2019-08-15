import { Games } from "../../enums/hub.enum";
import { InvalidConfig, InvalidId, InvalidSyntax } from "../../exceptions/common";
import { HubPrototype } from "../../interfaces/hub.interface";
import { CommonConfig, PostHubStrategy } from "../../interfaces/postHub.interface";
import Base from "./base";

export default class Common extends Base implements PostHubStrategy {
    protected config: CommonConfig;

    /**
     * Game identifier
     *
     * @var {String}
     */
    private game: Games;

    constructor(config: CommonConfig, game: Games) {
        super();
        this.config = config;
        this.game = game;
    }

    public isSyntaxValid(): boolean {
        // Syntax should be /post GAME ID [PASS] [DESCRIPTION]
        if (this.pieces.length < 3) {
            throw new InvalidSyntax();
        }

        if (!this.pieces[2].replace(/-/g, "").match(/^\d{14}$/)) {
            throw new InvalidId();
        }

        return true;
    }

    public parsePassword(): string | null {
        if (this.pieces.length <= 3 || !this.pieces[3].match(/^\d{4}$/)) {
            return null;
        }

        return this.pieces[3];
    }

    public extractHubInfo(): HubPrototype {
        const partial = super.extractHubInfo() as HubPrototype;
        const pass = this.parsePassword();

        // If we couldn't find a suitable password, we'll treat whatever
        // is in place of the password as the start of the description
        const sliceIndex = pass === null ? 3 : 4;

        const idDigits = this.pieces[2].replace(/-/g, "").split("");
        const formattedId = [[0, 2], [2, 6], [6, 10], [10, 14]]
            .map(indices => idDigits.slice(indices[0], indices[1]).join(""))
            .join("-");

        return {
            ...partial,
            game: this.game,
            description: this.pieces.slice(sliceIndex).join(" "),
            id: formattedId,
        };
    }

    public getTargetChannelId(): string {
        if (this.config.channel) {
            return this.config.channel;
        }

        throw new InvalidConfig();
    }

    public commandHelpEmbedField(commandName: string): { name: string; value: string } {
        return {
            name: `:arrow_forward: Previous MH: \`${commandName} <Game> <Hub ID> [Pass] [Description]\``,
            value: `Example:\n\`${commandName} GU 22-3333-4444-5555 6767 Let's hunt Fatalis\`\n`,
        };
    }
}
