const Assertion = require("./Libs").Assertion;
const Array = require("./Libs").Array;
const AST = require("../src/AST");
const FileSystem = require("../src/FileSystem");
const Maybe = require("./Libs").Maybe;
const String = require("./Libs").String;
const Unit = require("./Libs").Unit;

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


const parseFile = content => {
    const newLine = acc => item => {
        if (String.startsWith("--")(item)) {
            const name =
                String.trim(String.drop(2)(item));

            const result =
                Object.assign({}, acc, {current: name});

            result[name] = [];

            return result;
        } else {
            const result =
                Object.assign({}, acc);

            result[result["current"]] = Array.append(item)(result[result["current"]]);

            return result;
        }
    };

    return Array.foldl({
        current: "src",
        name: String.trim(String.drop(2)(content[0])),
        src: []
    })(newLine)(Array.drop(1)(content));
};


const processFile = content => assertion => {
    const ast =
        Parser.parseModule(LexerConfiguration.fromString(content.src.join("\n")));

    if (content.ast) {
        return assertion
            .isTrue(ast.isOkay())
            .equals(asString(ast.content[1].result).trim())(content.ast.join("\n").trim());
    } else {
        return assertion
            .isTrue(ast.isOkay());
    }
};


module.exports = Unit.Suite("Tool.SL")([
    Unit.Suite("Parser")([
        Unit.Suite("parseModule")([
           Unit.Suite("import")([
               Unit.Test("001: Simple import")(FileSystem
                   .readFile("./test/parser/001.txt")
                   .then(content => processFile(parseFile(content.split("\n")))(Assertion)))
           ])
        ]),
        Unit.Suite("parseDataDeclaration")([
            Unit.Test("data List a = Nil | Cons a List a")(assertParseInput(
                "data List a = Nil | Cons a List a",
                Parser.parseDataDeclaration,
                AST.DataDeclaration("List")(["a"])([])
                ([
                    {name: "Nil", typeReferences: []},
                    {
                        name: "Cons",
                        typeReferences: [AST.Reference("a"), AST.DataReference("List")([AST.Reference("a")])]
                    }
                ])
                ([])
            )),
            Unit.Test("data List a = a :: Parity & Show, Self :: Parity & Show => Nil | Cons a List a")(assertParseInput(
                "data List a = a :: Parity & Show, Self :: Parity & Show => Nil | Cons a List a",
                Parser.parseDataDeclaration,
                AST.DataDeclaration("List")(["a"])([
                    AST.TypeConstraint("a")(AST.ComposedType([AST.DataReference("Parity")([]), AST.DataReference("Show")([])])),
                    AST.TypeConstraint("Self")(AST.ComposedType([AST.DataReference("Parity")([]), AST.DataReference("Show")([])]))
                ])
                ([
                    {name: "Nil", typeReferences: []},
                    {
                        name: "Cons",
                        typeReferences: [AST.Reference("a"), AST.DataReference("List")([AST.Reference("a")])]
                    }
                ])
                ([])
            ))
        ]),
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
        Unit.Suite("parseName")([
            Unit.Test("bob")(assertParseInput(
                "bob",
                Parser.parseName,
                "bob")),
            Unit.Test("(+)")(assertParseInput(
                "(+)",
                Parser.parseName,
                "(+)")),
        ]),
        Unit.Suite("parseNameSignatureDeclaration")([
            Unit.Test("bob :: a :: Parity => (List Int -> String) -> List a")(assertParseInput(
                "bob :: a :: Parity => (List Int -> String) -> List a",
                Parser.parseNameSignatureDeclaration,
                AST.NameSignatureDeclaration("bob")(AST.Type([AST.TypeConstraint("a")(AST.ReferencedType(AST.DataReference("Parity")([])))])(AST.ReferencedType(AST.Function(AST.Function(AST.DataReference("List")([AST.Int]))(AST.String))(AST.DataReference("List")([AST.Reference("a")]))))))),
            Unit.Test("(+) :: List a -> List a")(assertParseInput(
                "(+) :: List a -> List a",
                Parser.parseNameSignatureDeclaration,
                AST.NameSignatureDeclaration("(+)")(AST.Type([])(AST.ReferencedType(AST.Function(AST.DataReference("List")([AST.Reference("a")]))(AST.DataReference("List")([AST.Reference("a")])))))))
        ]),
        Unit.Suite("parseTypeConstraint")([
            Unit.Test("a :: Parity & Bounded & Show")(assertParseInput(
                "a :: Parity & Bounded & Show",
                Parser.parseTypeConstraint,
                AST.TypeConstraint("a")(AST.ComposedType([AST.DataReference("Parity")([]), AST.DataReference("Bounded")([]), AST.DataReference("Show")([])]))))
        ]),
        Unit.Suite("parseTypeConstraints")([
            Unit.Test("a :: Parity & Show, b :: Bounded")(assertParseInput(
                "a :: Parity & Show, b :: Bounded",
                Parser.parseTypeConstraints,
                [
                    AST.TypeConstraint("a")(AST.ComposedType([AST.DataReference("Parity")([]), AST.DataReference("Show")([])])),
                    AST.TypeConstraint("b")(AST.ReferencedType(AST.DataReference("Bounded")([])))
                ]
            ))
        ]),
        Unit.Suite("parseTypeDeclaration")([
            Unit.Test("type Names = List String")(assertParseInput(
                "type Names = List String",
                Parser.parseTypeDeclaration,
                AST.TypeDeclaration("Names")([])(AST.Type([])(AST.ReferencedType(AST.DataReference("List")([AST.String])))))),
            Unit.Test("type Names a = Parity & List a")(assertParseInput(
                "type Names a = Parity & List a",
                Parser.parseTypeDeclaration,
                AST.TypeDeclaration("Names")(["a"])(AST.Type([])(AST.ComposedType([AST.DataReference("Parity")([]), AST.DataReference("List")([AST.Reference("a")])]))))),
            Unit.Test("type Names a = a :: Parity => Parity & List a")(assertParseInput(
                "type Names a = a :: Parity => Parity & List a",
                Parser.parseTypeDeclaration,
                AST.TypeDeclaration("Names")(["a"])(AST.Type([AST.TypeConstraint("a")(AST.ReferencedType(AST.DataReference("Parity")([])))])(AST.ComposedType([AST.DataReference("Parity")([]), AST.DataReference("List")([AST.Reference("a")])])))))
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


