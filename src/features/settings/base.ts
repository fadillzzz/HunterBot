import { SettingsStrategy } from "../../interfaces/settings.interface";
import { InvalidOption } from "../../exceptions/settings";

export default abstract class Base {
    /**
     * Return a list of valid options
     *
     * @return {String[]}
     */
    protected abstract validOptions(): string[];

    public isOptionValid(option: string): boolean {
        // To do: This looks weird. Figure out a better way to handle this, yeah?
        if (this.validOptions().includes(option.toLowerCase())) {
            return true;
        } else {
            throw new InvalidOption();
        }
    }
}
