module.exports = $importAll([
    "core:Native.Data.Array:1.2.0",
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
    Errors: $imports[1],
    FileSystem: $imports[2],
    Float: $imports[3],
    Int: $imports[4],
    Lexer: $imports[5],
    Maybe: $imports[6],
    ParserCombinator: $imports[7],
    Result: $imports[8],
    SLAST: $imports[9],
    Stream: $imports[10],
    String: $imports[11]
}));