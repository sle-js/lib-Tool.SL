const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Tokens = require("../src/Tokens");
const LexerConfiguration = require("../src/LexerConfiguration");
const Parser = require("../src/Parser");


module.exports = Unit.Suite("Tool.SL")([
    Unit.Suite("Parser")([
        Unit.Suite("parseId")([
            Unit.Test("hello")(Promise
                .resolve(LexerConfiguration.fromString("hello"))
                .then(lexer => Parser.parseId(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(result.content[1].result.token().id)(Tokens.lowerID)
                )),
            Unit.Test("World")(Promise
                .resolve(LexerConfiguration.fromString("World"))
                .then(lexer => Parser.parseId(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(result.content[1].result.token().id)(Tokens.upperID)
                )),
            Unit.Test("-error-")(Promise
                .resolve(LexerConfiguration.fromString("-error-"))
                .then(lexer => Parser.parseId(lexer))
                .then(result => Assertion
                    .isTrue(result.isError())
                    .equals(result.content[1].content[1].position()[0])(1)
                    .equals(result.content[1].content[1].position()[1])(1)
                ))
        ]),
        Unit.Test("use core:Native.Data.Array:1.1.0 as Array")(Promise
            .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0 as Array"))
            .then(lexer => Assertion
                .equals(Parser.parseModule(lexer))(Parser.parseModule(lexer))
            ))
    ])
])
;