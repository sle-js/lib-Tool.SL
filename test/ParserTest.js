const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Tokens = require("../src/Tokens");
const LexerConfiguration = require("../src/LexerConfiguration");
const Parser = require("../src/Parser");


module.exports = Unit.Suite("Tool.SL")([
    Unit.Suite("Parser")([
        Unit.Test("use core:Native.Data.Array:1.1.0 as Array")(Promise
            .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0 as Array"))
            .then(lexer => Assertion
                .equals(Parser.parseModule(lexer))(Parser.parseModule(lexer))
            ))
    ])
]);