const C = require("./ParseCombinators");

// Parser a b :: Stream Lexer -> Result a { lexer :: Stream Lexer, result :: b }


parseModule =
    C.and([
        C.many(parseImport),
        C.manyOne(parseDeclaration)
    ]);


function parseImport(x) {
    return x;
}


function parseDeclaration(x) {
    return x;
}


module.exports = {
    parseModule,
    parseImport,
    parseDeclaration
};