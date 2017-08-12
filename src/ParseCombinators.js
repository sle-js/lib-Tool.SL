const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const identity = i =>
    i;


const okayResult = lexer => result =>
    Result.Okay({lexer: lexer, result: result});


const andMap = parsers => f => lexer => {
    let resultArray = [];
    let tmpLexer = lexer;

    for (let lp = 0; lp < parsers.length; lp += 1){
        const parserResult = parsers[lp](tmpLexer);

        if (parserResult.isOkay()) {
            tmpLexer = parserResult.content[1].lexer;
            resultArray.push(parserResult.content[1].result);
        } else {
            return parserResult;
        }
    }

    return okayResult(tmpLexer)(f(resultArray));
};


const and = parsers =>
    andMap(parsers)(identity);


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


const tokenMap = tokenID => f => lexer =>
    lexer.head().token().id === tokenID
        ? okayResult(lexer.tail())(f(lexer.head()))
        : Result.Error(Errors.tokenExpected(lexer.head())(tokenID));


const token = tokenID =>
    tokenMap(tokenID)(identity);


module.exports = {
    and,
    andMap,
    many,
    manyOne,
    or,
    token,
    tokenMap
};