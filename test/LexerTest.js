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
    Unit.Test("given an empty lexer should be at EOF")(
        assertLexerState(
            Assertion,
            lexerDefinition.fromString(""),
            0, "", [1, 1], 0)
    )
]);


// Test.newSuite("Lexer Suite")
//     .case("given an empty lexer should be at EOF", () => {
//         const lexer = lexerDefinition.fromString("");
//
//         assertLexerState(
//             lexer,
//             0, "", [1, 1], 0);
//     })
//
//     .case("given a lexer with a defined token should return that token", () => {
//         const lexer = lexerDefinition.fromString("2912 hello");
//
//         assertLexerState(
//             lexer,
//             1, 2912, Tuple(1)(1), 0);
//     })
//
//     .case("given a lexer with a defined token should return that token and the next token whilst skipping whitespace", () => {
//         const lexer = lexerDefinition.fromString("2912 hello");
//
//         assertLexerState(
//             lexer,
//             1, 2912, Tuple(1)(1), 0);
//
//         assertLexerState(
//             lexer.next(),
//             2, "hello", Tuple(6)(1), 5);
//     })
//
//     .case("given a lexer with a character that the lexer does not recognise then the error token is returned and the lexer is advanced onto the next character", () => {
//         const lexer = lexerDefinition.fromString("2912*hello");
//
//         assertLexerState(
//             lexer,
//             1, 2912, Tuple(1)(1), 0);
//
//         assertLexerState(
//             lexer.next(),
//             -1, "*", Tuple(5)(1), 4);
//
//         assertLexerState(
//             lexer.next().next(),
//             2, "hello", Tuple(6)(1), 5);
//     })
//
//     .case("given a lexer with an input of only whitespace", () => {
//         const lexer = lexerDefinition.fromString("   ");
//
//         assertLexerState(
//             lexer,
//             0, "", Tuple(4)(1), 3);
//     })
//
//     .case("given a lexer with input contain non-nested comments should ignore the comments", () => {
//         const lexer = lexerDefinition.fromString("123\n// some comments\nabc");
//
//         assertLexerState(
//             lexer,
//             1, 123, Tuple(1)(1), 0);
//
//         assertLexerState(
//             lexer.next(),
//             2, "abc", Tuple(1)(3), 21);
//     });


function assertLexerState(assertion, lexer, id, value, position, index) {
    return assertion
        .equals(lexer.token().id)(id)
        .equals(lexer.token().value)(value)
        .equals(lexer.position()[0])(position[0])
        .equals(lexer.position()[1])(position[1])
        .equals(lexer.index())(index);
}
