export class Exception {} // Adding this, because support for extending native classes is shit
export class InvalidSyntax extends Exception {}
export class InvalidConfig extends Exception {}
export class InvalidGame extends Exception {}
export class InvalidId extends Exception {}
