import { InvalidId, InvalidSyntax } from "../../exceptions/common";
import { InvalidAttribute } from "../../exceptions/editHub";
import Base from "./base";

export default class World extends Base {
    protected updatableAttribute: string[] = ["id", "description"];

    /**
     * Validates command syntax
     *
     * @return {Boolean}
     */
    public isSyntaxValid(): boolean {
        // Syntax should be /edit <id/description> <value>
        if (this.pieces.length !== 3) {
            throw new InvalidSyntax();
        }

        const attribute = this.pieces[1].toLowerCase();
        if (!this.updatableAttribute.includes(attribute)) {
            throw new InvalidAttribute();
        }

        if (attribute === "id") {
            // To do: Abstract ID validation
            if (!this.pieces[2].match(/^[a-zA-Z0-9!@#$%^&*()-=+?]{12}$/)) {
                throw new InvalidId();
            }
        }

        return true;
    }

    public getUpdatedInfo(): { [key: string]: string } {
        return { [this.pieces[1]]: this.pieces[2] };
    }

    public commandHelpEmbedField(commandName: string): { name: string; value: string } {
        return {
            name: `:arrow_forward: MHW: \`${commandName} <ID/Description> <New value>\``,
            value: `Example:\n\`${commandName} ID pppCCC456JKl\`\n`,
        };
    }
}
