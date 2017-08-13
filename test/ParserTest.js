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


const assertParseInput = (input, parser, ast) => Promise
    .resolve(LexerConfiguration.fromString(input))
    .then(lexer => parser(lexer))
    .then(result => Assertion
        .isTrue(result.isOkay())
        .equals(asString(result.content[1].result))(asString(ast))
    );


module.exports = Unit.Suite("Tool.SL")([
    Unit.Suite("Parser")([
        Unit.Suite("parseId")([
            Unit.Test("hello")(assertParseInput(
                "hello",
                Parser.parseId,
                "hello")),
            Unit.Test("World")(assertParseInput(
                "World",
                Parser.parseId,
                "World")),
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
            Unit.Test("use core:Native.Data.Array:1.1.0")(assertParseInput(
                "use core:Native.Data.Array:1.1.0",
                Parser.parseImport,
                AST.UnqualifiedImport({urn: "core:Native.Data.Array:1.1.0"}))),
            Unit.Test("use core:Native.Data.Array:1.1.0 as Array")(assertParseInput(
                "use core:Native.Data.Array:1.1.0 as Array",
                Parser.parseImport,
                AST.QualifiedImport({
                    urn: "core:Native.Data.Array:1.1.0",
                    name: "Array"
                }))),
            Unit.Test("use core:Native.Data.Array:1.1.0 import length")(assertParseInput(
                "use core:Native.Data.Array:1.1.0 import length",
                Parser.parseImport,
                AST.QualifiedNameImport({
                    urn: "core:Native.Data.Array:1.1.0",
                    names: [{name: "length", qualified: Maybe.Nothing}]
                }))),
            Unit.Test("use core:Native.Data.Array:1.1.0 import length as arrayLength")(assertParseInput(
                "use core:Native.Data.Array:1.1.0 import length as arrayLength",
                Parser.parseImport,
                AST.QualifiedNameImport({
                    urn: "core:Native.Data.Array:1.1.0",
                    names: [{name: "length", qualified: Maybe.Just("arrayLength")}]
                }))),
            Unit.Test("use core:Native.Data.Array:1.1.0 import (length, substring as subs)")(assertParseInput(
                "use core:Native.Data.Array:1.1.0 import (length, substring as subs)",
                Parser.parseImport,
                AST.QualifiedNameImport({
                    urn: "core:Native.Data.Array:1.1.0",
                    names: [
                        {name: "length", qualified: Maybe.Nothing},
                        {name: "substring", qualified: Maybe.Just("subs")}
                    ]
                })))
        ]),
        Unit.Suite("parseTypeReference")([
            Unit.Test("Int -> String")(assertParseInput(
                "Int -> String",
                Parser.parseTypeReference,
                AST.Function(AST.Int)(AST.String))),
            Unit.Test("(List Int -> String) -> List a")(assertParseInput(
                "(List Int -> String) -> List a",
                Parser.parseTypeReference,
                AST.Function(AST.Function(AST.DataReference("List")([AST.Int]))(AST.String))(AST.DataReference("List")([AST.Reference("a")]))))
        ]),
        Unit.Suite("parseTypeReference1")([
            Unit.Test("Int * String")(assertParseInput(
                "Int * String",
                Parser.parseTypeReference1,
                AST.NTuple([AST.Int, AST.String]))),
            Unit.Test("Char * List (Int * Bool * List String)")(assertParseInput(
                "Char * List (Int * Bool * List String)",
                Parser.parseTypeReference1,
                AST.NTuple([AST.Char, AST.DataReference("List")([AST.NTuple([AST.Int, AST.Bool, AST.DataReference("List")([AST.String])])])])))
        ]),
        Unit.Suite("parseTypeReference2")([
            Unit.Test("Int")(assertParseInput(
                "Int",
                Parser.parseTypeReference2,
                AST.Int)),
            Unit.Test("String")(assertParseInput(
                "String",
                Parser.parseTypeReference2,
                AST.String)),
            Unit.Test("Bool")(assertParseInput(
                "Bool",
                Parser.parseTypeReference2,
                AST.Bool)),
            Unit.Test("Char")(assertParseInput(
                "Char",
                Parser.parseTypeReference2,
                AST.Char)),
            Unit.Test("Self")(assertParseInput(
                "Self",
                Parser.parseTypeReference2,
                AST.Self)),
            Unit.Test("Map Int a")(assertParseInput(
                "Map Int a",
                Parser.parseTypeReference2,
                AST.DataReference("Map")([AST.Int, AST.Reference("a")]))),
        ]),
        Unit.Suite("parseTypeReference3")([
            Unit.Test("()")(assertParseInput(
                "()",
                Parser.parseTypeReference3,
                AST.Unit)),
            Unit.Test("(Int)")(assertParseInput(
                "(Int)",
                Parser.parseTypeReference3,
                AST.Int)),
            Unit.Test("a")(assertParseInput(
                "a",
                Parser.parseTypeReference3,
                AST.Reference("a")))
        ])
    ])
]);


