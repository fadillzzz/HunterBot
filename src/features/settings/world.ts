import { SettingsStrategy } from "../../interfaces/settings.interface";
import { Config } from "../../interfaces/bot.interface";
import { InvalidSyntax } from "../../exceptions/common";
import Base from "./base";

export default class World extends Base implements SettingsStrategy {
    public isSyntaxValid(pieces: string[]): boolean {
        if (pieces.length >= 3) {
            this.isOptionValid(pieces[1]);
            return true;
        }

        throw new InvalidSyntax();
    }

    public updateConfig(config: Config, pieces: string[]): Config {
        const key = pieces[1] as "xbox" | "ps4" | "pc";
        const value = pieces[2];

        config.games.mhw.channels[key] = value;

        return config;
    }

    protected validOptions(): string[] {
        return ["xbox", "ps4", "pc"];
    }

    public commandHelpEmbedField(commandName: string): { name: string; value: string } {
        return {
            name: `:arrow_forward: MHW: \`${commandName} mhw <pc/xbox/ps4> <value>\``,
            value: `Example:\n\`${commandName} mhw pc 437459194312917003\`\n`,
        };
    }
}
