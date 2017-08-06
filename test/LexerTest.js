const Assertion = require("./Libs").Assertion;
const Maybe = require("./Libs").Maybe;
const Unit = require("./Libs").Unit;

const Int = require("./Int");
const Regex = require("./Regex");


const Lexer = require("../src/Lexer");


const lexerDefinition = Lexer.setup({
    eof: {id: 0, value: ""},
    err: text => ({id: -1, value: text}),
    whitespacePattern: Maybe.Just(Regex.from(/\s+/iy)),
    tokenPatterns: [
        [Regex.from(/[0-9]+/iy), text => ({id: 1, value: Int.fromString(text).withDefault(0)})],
        [Regex.from(/[A-Za-z_][A-Za-z0-9_]*/iy), text => ({id: 2, value: text})]
    ],
    comments: [
        {open: Regex.from(/\/\//my), close: Regex.from(/\n/my), nested: false}
    ]
});


module.exports = Unit.Suite("Lexer Suite")([
    Unit.Test("given an empty lexer should be at EOF")(Promise
        .resolve(lexerDefinition.fromString(""))
        .then(lexer =>
            assertLexerState(
                Assertion,
                lexer,
                0, "", [1, 1], 0)
        )),

    Unit.Test("given a lexer with a defined token should return that token")(Promise
        .resolve(lexerDefinition.fromString("2912 hello"))
        .then(lexer =>
            assertLexerState(
                Assertion,
                lexer,
                1, 2912, [1, 1], 0)
        )),

    Unit.Test("given a lexer with a defined token should return that token and the next token whilst skipping whitespace")(Promise
        .resolve(lexerDefinition.fromString("2912 hello"))
        .then(lexer => {
            const assertion1 = assertLexerState(
                Assertion,
                lexer,
                1, 2912, [1, 1], 0);

            return assertLexerState(
                assertion1,
                lexer.tail(),
                2, "hello", [6, 1], 5);
        })),

    Unit.Test("given a lexer with a character that the lexer does not recognise then the error token is returned and the lexer is advanced onto the next character")(Promise
        .resolve(lexerDefinition.fromString("2912*hello"))
        .then(lexer => {
            const assertion1 = assertLexerState(
                Assertion,
                lexer,
                1, 2912, [1, 1], 0);

            const assertion2 = assertLexerState(
                assertion1,
                lexer.tail(),
                -1, "*", [5, 1], 4);

            return assertLexerState(
                assertion2,
                lexer.drop(2),
                2, "hello", [6, 1], 5);
        })),


    Unit.Test("given a lexer with an input of only whitespace")(Promise
        .resolve(lexerDefinition.fromString("   "))
        .then(lexer =>
            assertLexerState(
                Assertion,
                lexer,
                0, "", [4, 1], 3)
        )),

    Unit.Test("given a lexer with input contain non-nested comments should ignore the comments")(Promise
        .resolve(lexerDefinition.fromString("123\n// some comments\nabc"))
        .then(lexer => {
            const assertion1 = assertLexerState(
                Assertion,
                lexer,
                1, 123, [1, 1], 0);

            return assertLexerState(
                assertion1,
                lexer.tail(),
                2, "abc", [1, 3], 21);

        }))
]);


function assertLexerState(assertion, lexer, id, value, position, index) {
    const hd = lexer.head();

    return assertion
        .equals(hd.token().id)(id)
        .equals(hd.token().value)(value)
        .equals(hd.position()[0])(position[0])
        .equals(hd.position()[1])(position[1])
        .equals(hd.index())(index);
}
