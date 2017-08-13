const Array = require("./Libs").Array;
const AST = require("./AST");
const C = require("./ParseCombinators");
const Tokens = require("./Tokens");


// type ParseError :: Errors
// type Parser b :: Stream Lexer -> Result ParseError { lexer :: Stream Lexer, result :: b }

parseModule =
    C.and([
        C.many(parseImport),
        C.many1(parseDeclaration)
    ]);


// parseId :: Parser AST.Import
function parseImport(lexer) {
    return C.andMap([
        C.token(Tokens.USE),
        tokenValue(Tokens.importReference),
        C.optional(
            C.or([
                C.andMap([
                    C.token(Tokens.AS),
                    parseId])(s => urn => AST.QualifiedImport({urn: urn, name: s[1]})),
                C.andMap([
                    C.token(Tokens.IMPORT),
                    C.or([
                        C.andMap([
                            parseId,
                            C.optional(
                                C.andMap([
                                    C.token(Tokens.AS),
                                    parseId
                                ])(a => a[1]))
                        ])(a => urn => AST.QualifiedNameImport({urn: urn, names: [{name: a[0], qualified: a[1]}]})),
                        C.andMap([
                            C.token(Tokens.LPAREN),
                            C.chainl1(
                                C.andMap([
                                    parseId,
                                    C.optional(
                                        C.andMap([
                                            C.token(Tokens.AS),
                                            parseId
                                        ])(a => a[1]))
                                ])(a => ({name: a[0], qualified: a[1]})))(C.token(Tokens.COMMA)),
                            C.token(Tokens.RPAREN)
                        ])(a => urn => AST.QualifiedNameImport({urn: urn, names: a[1]}))
                    ])
                ])(a => a[1])
            ]))
    ])(a => a[2].isJust()
        ? a[2].content[1](a[1])
        : AST.UnqualifiedImport({urn: a[1]}))(lexer);
}


// parseId :: Parser String
function parseId(lexer) {
    return C.or([
        tokenValue(Tokens.upperID),
        tokenValue(Tokens.lowerID)
    ])(lexer);
}


function parseDeclaration(x) {
    return x;
}


function parseType(lexer) {
    return parseTypeReference(lexer);
}


function parseTypeReference(lexer) {
    return parseTypeReference2(lexer);
}


function parseTypeReference2(lexer) {
    return C.or([
        C.andMap([
            tokenValue(Tokens.upperID),
            C.many1(parseTypeReference3)
        ])(a => AST.DataReference(a[0])(a[1])),
        parseTypeReference3
    ])(lexer);
}


function parseTypeReference3(lexer) {
    return C.or([
        C.andMap([
            tokenValue(Tokens.upperID)
        ])(a => {
            if (a[0] === "Int") {
                return AST.Int;
            } else if (a[0] === "String") {
                return AST.String;
            } else if (a[0] === "Bool") {
                return AST.Bool;
            } else if (a[0] === "Char") {
                return AST.Char;
            } else if (a[0] === "Self") {
                return AST.Self;
            } else {
                return AST.DataReference(a[0])([]);
            }
        }),
        C.tokenMap(Tokens.lowerID)(t => AST.Reference(t.token().value)),
        C.tokenMap(Tokens.LPAREN_RPAREN)(_ => AST.Unit),
        C.andMap([
            C.token(Tokens.LPAREN),
            parseTypeReference,
            C.token(Tokens.RPAREN)
        ])(a => a[1])
    ])(lexer);
}


const tokenValue = token =>
    C.tokenMap(token)(t => t.token().value);


module.exports = {
    parseDeclaration,
    parseId,
    parseImport,
    parseModule,
    parseTypeReference2,
    parseTypeReference3
};