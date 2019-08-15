import { Exception } from "../common";

export default abstract class Base {
    /**
     * A reference to the exception class that the child should process
     *
     * Really shit that I can't use my own class without `instanceof` complaining about invalid right-hand side
     * @var {Function}
     */
    protected errorType!: Function;

    public validError(error: Exception): boolean {
        if (error instanceof this.errorType) {
            return true;
        }

        return false;
    }
}
