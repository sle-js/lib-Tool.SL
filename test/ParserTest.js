const Array = require("./Libs").Array;
const Assertion = require("./Libs").Assertion;
const AST = require("../src/AST");
const Maybe = require("./Libs").Maybe;
const Unit = require("./Libs").Unit;

const Tokens = require("../src/Tokens");
const LexerConfiguration = require("../src/LexerConfiguration");
const Parser = require("../src/Parser");


const asString = o =>
    JSON.stringify(o, null, 2);


module.exports = Unit.Suite("Tool.SL")([
    Unit.Suite("Parser")([
        Unit.Suite("parseId")([
            Unit.Test("hello")(Promise
                .resolve(LexerConfiguration.fromString("hello"))
                .then(lexer => Parser.parseId(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(result.content[1].result)("hello")
                )),
            Unit.Test("World")(Promise
                .resolve(LexerConfiguration.fromString("World"))
                .then(lexer => Parser.parseId(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(result.content[1].result)("World")
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
        Unit.Suite("parseImport")([
            Unit.Test("use core:Native.Data.Array:1.1.0")(Promise
                .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0"))
                .then(lexer => Parser.parseImport(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(asString(result.content[1].result))(asString(AST.UnqualifiedImport({urn: "core:Native.Data.Array:1.1.0"})))
                )),
            Unit.Test("use core:Native.Data.Array:1.1.0 as Array")(Promise
                .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0 as Array"))
                .then(lexer => Parser.parseImport(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(asString(result.content[1].result))(asString(AST.QualifiedImport({
                        urn: "core:Native.Data.Array:1.1.0",
                        name: "Array"
                    })))
                )),
            Unit.Test("use core:Native.Data.Array:1.1.0 import length")(Promise
                .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0 import length"))
                .then(lexer => Parser.parseImport(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(asString(result.content[1].result))(asString(AST.QualifiedNameImport({
                        urn: "core:Native.Data.Array:1.1.0",
                        names: [{name: "length", qualified: Maybe.Nothing}]
                    })))
                )),
            Unit.Test("use core:Native.Data.Array:1.1.0 import length as arrayLength")(Promise
                .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0 import length as arrayLength"))
                .then(lexer => Parser.parseImport(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(asString(result.content[1].result))(asString(AST.QualifiedNameImport({
                        urn: "core:Native.Data.Array:1.1.0",
                        names: [{name: "length", qualified: Maybe.Just("arrayLength")}]
                    })))
                )),
            Unit.Test("use core:Native.Data.Array:1.1.0 import (length, substring as subs)")(Promise
                .resolve(LexerConfiguration.fromString("use core:Native.Data.Array:1.1.0 import (length, substring as subs)"))
                .then(lexer => Parser.parseImport(lexer))
                .then(result => Assertion
                    .isTrue(result.isOkay())
                    .equals(asString(result.content[1].result))(asString(AST.QualifiedNameImport({
                        urn: "core:Native.Data.Array:1.1.0",
                        names: [
                            {name: "length", qualified: Maybe.Nothing},
                            {name: "substring", qualified: Maybe.Just("subs")}
                        ]
                    })))
                ))
        ])
    ])
]);
