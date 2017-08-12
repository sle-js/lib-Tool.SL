const C = require("./ParseCombinators");
const Tokens = require("./Tokens");


// Parser a b :: Stream Lexer -> Result a { lexer :: Stream Lexer, result :: b }

parseModule =
    C.and([
        C.many(parseImport),
        C.manyOne(parseDeclaration)
    ]);


function parseImport(lexer) {
    return C.and([
        C.token(Tokens.USE),
        C.token(Tokens.importReference),
        C.token(Tokens.AS),
        parseId
    ])(lexer);
}


function parseId(lexer) {
    return C.or([
        C.token(Tokens.upperID),
        C.token(Tokens.lowerID)
    ])(lexer);
}


function parseDeclaration(x) {
    return x;
}


module.exports = {
    parseModule,
    parseId,
    parseImport,
    parseDeclaration
};