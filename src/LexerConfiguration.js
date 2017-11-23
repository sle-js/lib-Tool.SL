const Float = require("./Libs").Float;
const Int = require("./Libs").Int;
const Lexer = require("./Libs").Lexer;
const Maybe = require("./Libs").Maybe;
const Regex = require("./Regex");
const Tokens = require("./Tokens");


const identifiers = {
    o: Tokens.O,
    as: Tokens.AS,
    case: Tokens.CASE,
    data: Tokens.DATA,
    else: Tokens.ELSE,
    false: Tokens.FALSE,
    if: Tokens.IF,
    import: Tokens.IMPORT,
    in: Tokens.IN,
    let: Tokens.LET,
    of: Tokens.OF,
    self: Tokens.SELF,
    then: Tokens.THEN,
    true: Tokens.TRUE,
    type: Tokens.TYPE,
    use: Tokens.USE,
    where: Tokens.WHERE
};


const resolveIdentifier = text => defaultToken => {
    const identifier = identifiers[text];

    return identifier === undefined
        ? {id: defaultToken, value: text}
        : {id: identifier, value: text};
};


module.exports = Lexer.setup({
    eof: {id: Tokens.eof, value: ""},
    err: text => ({id: Tokens.err, value: text}),
    whitespacePattern: Maybe.Just(Regex.from(/\s+/iy)),
    tokenPatterns: [
        [Regex.from(/'(\\.|.)'/iy), text => ({id: Tokens.constantChar, value: text.length === 3 ? text.charCodeAt(1) : text.charCodeAt(2)})],
        [Regex.from(/\d+\.\d/iy), text => ({id: Tokens.constantFloat, value: Float.fromString(text).withDefault(0.0)})],
        [Regex.from(/\d+/iy), text => ({id: Tokens.constantInteger, value: Int.fromString(text).withDefault(0)})],
        [Regex.from(/"(\\.|[^"\\])*"/iy), text => ({id: Tokens.constantString, value: text.substring(1, text.length - 1)})],

        [Regex.from(/(file|core|github):(\\.|[^\s])+/iy), text => ({id: Tokens.importReference, value: text.split(":")})],

        [Regex.from(/&&/iy), text => ({id: Tokens.AMPERSAND_AMPERSAND, value: text})],
        [Regex.from(/&/iy), text => ({id: Tokens.AMPERSAND, value: text})],
        [Regex.from(/\\/iy), text => ({id: Tokens.BACKSLASH, value: text})],
        [Regex.from(/!=/iy), text => ({id: Tokens.BANG_EQUAL, value: text})],
        [Regex.from(/\|\|/iy), text => ({id: Tokens.BAR_BAR, value: text})],
        [Regex.from(/\|>/iy), text => ({id: Tokens.BAR_GREATER, value: text})],
        [Regex.from(/\|/iy), text => ({id: Tokens.BAR, value: text})],
        [Regex.from(/::/iy), text => ({id: Tokens.COLON_COLON, value: text})],
        [Regex.from(/,/iy), text => ({id: Tokens.COMMA, value: text})],
        [Regex.from(/==/iy), text => ({id: Tokens.EQUAL_EQUAL, value: text})],
        [Regex.from(/=>/iy), text => ({id: Tokens.EQUAL_GREATER, value: text})],
        [Regex.from(/=/iy), text => ({id: Tokens.EQUAL, value: text})],
        [Regex.from(/>=/iy), text => ({id: Tokens.GREATER_EQUAL, value: text})],
        [Regex.from(/>/iy), text => ({id: Tokens.GREATER, value: text})],
        [Regex.from(/{/iy), text => ({id: Tokens.LCURLY, value: text})],
        [Regex.from(/<\|/iy), text => ({id: Tokens.LESS_BAR, value: text})],
        [Regex.from(/<=/iy), text => ({id: Tokens.LESS_EQUAL, value: text})],
        [Regex.from(/</iy), text => ({id: Tokens.LESS, value: text})],
        [Regex.from(/\(\)/iy), text => ({id: Tokens.LPAREN_RPAREN, value: text})],
        [Regex.from(/\(/iy), text => ({id: Tokens.LPAREN, value: text})],
        [Regex.from(/->/iy), text => ({id: Tokens.MINUS_GREATER, value: text})],
        [Regex.from(/-/iy), text => ({id: Tokens.MINUS, value: text})],
        [Regex.from(/\+/iy), text => ({id: Tokens.PLUS, value: text})],
        [Regex.from(/}/iy), text => ({id: Tokens.RCURLY, value: text})],
        [Regex.from(/\)/iy), text => ({id: Tokens.RPAREN, value: text})],
        [Regex.from(/\//iy), text => ({id: Tokens.SLASH, value: text})],
        [Regex.from(/\*/iy), text => ({id: Tokens.STAR, value: text})],
        [Regex.from(/\./iy), text => ({id: Tokens.PERIOD, value: text})],

        [Regex.from(/[A-Z][A-Za-z0-9_]*'*\??/y), text => resolveIdentifier(text)(Tokens.upperID)],
        [Regex.from(/[a-z_][A-Za-z0-9_]*'*\??/y), text => resolveIdentifier(text)(Tokens.lowerID)]
    ],
    comments: [
        {open: Regex.from(/\/\//my), close: Regex.from(/\n/my), nested: false},
        {open: Regex.from(/\/\*/my), close: Regex.from(/\*\//my), nested: true}
    ]
});
