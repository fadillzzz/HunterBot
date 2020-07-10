import { SettingsStrategy } from "../../interfaces/settings.interface";
import { Config } from "../../interfaces/bot.interface";
import { InvalidSyntax } from "../../exceptions/common";
import Base from "./base";

export default class CommonGame extends Base implements SettingsStrategy {
    public isSyntaxValid(pieces: string[]): boolean {
        if (pieces.length >= 2) {
            this.isOptionValid(pieces[0]);
            return true;
        } else {
            throw new InvalidSyntax();
        }
    }

    public updateConfig(config: Config, pieces: string[]): Config {
        const key = pieces[0] as "mh4u" | "mhgen" | "mhgu" | "mhxx";
        const value = pieces[1];

        config.games[key].channel = value;

        return config;
    }

    protected validOptions(): string[] {
        return ["mh4u", "mhgen", "mhgu", "mhxx"];
    }

    public commandHelpEmbedField(commandName: string): { name: string; value: string } {
        return {
            name: `:arrow_forward: Previous MH: \`${commandName} <mh4u/mhgen/mhgu/mhxx> <value>\``,
            value: `Example:\n\`${commandName} mh4u 437459194312917003\`\n`,
        };
    }
}
