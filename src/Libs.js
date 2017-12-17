module.exports = $importAll([
    "core:Native.Data.Array:1.2.0",
    "./Char",
    "use:./Errors.estree core:Tool.ESTree:1.0.3",
    "core:Native.System.IO.FileSystem:1.1.0",
    "./Float",
    "core:Native.Data.Int:1.0.0",
    "core:Text.Parsing.Lexer:1.0.0",
    "core:Native.Data.Maybe:1.0.0",
    "core:Text.Parsing.Combinators:1.1.0",
    "core:Native.Data.Result:1.0.0",
    "use:./SLAST.estree core:Tool.ESTree:1.0.3",
    "core:Data.Collection.InfiniteStream:1.0.0",
    "core:Native.Data.String:1.0.0"
]).then($imports => ({
    Array: $imports[0],
    Char: $imports[1],
    Errors: $imports[2],
    FileSystem: $imports[3],
    Float: $imports[4],
    Int: $imports[5],
    Lexer: $imports[6],
    Maybe: $imports[7],
    ParserCombinator: $imports[8],
    Result: $imports[9],
    SLAST: $imports[10],
    Stream: $imports[11],
    String: $imports[12]
}));