import { InvalidId, InvalidSyntax } from "../../exceptions/common";
import { InvalidAttribute } from "../../exceptions/editHub";
import Base from "./base";

export default class Common extends Base {
    protected updatableAttributes: string[] = ["id", "pass", "password", "description"];

    /**
     * Validates command syntax
     *
     * @return {Boolean}
     */
    public isSyntaxValid(): boolean {
        // Syntax should be /edit <id/passw/description> <value>
        if (this.pieces.length !== 3) {
            throw new InvalidSyntax();
        }

        const attribute = this.pieces[1].toLowerCase();
        if (!this.updatableAttributes.includes(attribute)) {
            throw new InvalidAttribute();
        }

        if (attribute === "id") {
            if (!this.pieces[2].replace(/-/g, "").match(/^\d{14}$/)) {
                throw new InvalidId();
            }
        }

        return true;
    }

    public parsePassword(): string | null {
        // To do: Abstract away this validation
        if (this.pieces.length < 3 || !this.pieces[2].match(/^\d{4}$/)) {
            return null;
        }

        return this.pieces[2];
    }

    public getUpdatedInfo(): { [key: string]: string | null } {
        let attribute = this.pieces[1].toLowerCase();
        let newValue: string | null = this.pieces[2];

        if (["pass", "password"].includes(attribute)) {
            attribute = "pass";
            newValue = this.parsePassword();
        }

        return { [attribute]: newValue };
    }

    public commandHelpEmbedField(commandName: string): { name: string; value: string } {
        return {
            name: `:arrow_forward: Previous MH: \`${commandName} <ID/Password/Description> <New value>\``,
            value: `Example:\n\`${commandName} ID 22-3333-4444-5555\`\n`,
        };
    }
}
