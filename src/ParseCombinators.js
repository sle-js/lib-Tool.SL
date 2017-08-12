const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const and = parsers => lexer =>
    lexer;


const many = parsers => lexer =>
    lexer;


const manyOne = parsers => lexer =>
    lexer;


const or = parsers => lexer => {
    const parseOption = parser => {
        const optionResult = parser(lexer);

        return optionResult.isOkay()
            ? Maybe.Just(optionResult)
            : Maybe.Nothing;
    };

    return Array.findMap(parseOption)(parsers).withDefault(Result.Error(Errors.orFailed(lexer.head())));
};


const token = tokenID => lexer =>
    lexer.head().token().id === tokenID
        ? Result.Okay({lexer: lexer.tail(), result: lexer.head()})
        : Result.Error(Errors.tokenExpected(lexer.head())(tokenID));


module.exports = {
    and,
    many,
    manyOne,
    or,
    token
};