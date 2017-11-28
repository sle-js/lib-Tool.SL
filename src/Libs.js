module.exports = $importAll([
    "core:Native.Data.Array:1.2.0",
    "core:Native.System.IO.FileSystem:1.1.0",
    "./Float",
    "core:Native.Data.Int:1.0.0",
    "core:Text.Parsing.Lexer:1.0.0",
    "core:Native.Data.Maybe:1.0.0",
    "core:Text.Parsing.Combinators:1.0.0",
    "core:Native.Data.Result:1.0.0",
    "use:./SLAST.estree core:Tool.ESTree:1.0.3",
    "core:Data.Collection.InfiniteStream:1.0.0",
    "core:Native.Data.String:1.0.0"
]).then($imports => ({
    Array: $imports[0],
    FileSystem: $imports[1],
    Float: $imports[2],
    Int: $imports[3],
    Lexer: $imports[4],
    Maybe: $imports[5],
    ParsingCombinators: $imports[6],
    Result: $imports[7],
    SLAST: $imports[8],
    Stream: $imports[9],
    String: $imports[10]
}));