const Array = require("./Libs").Array;
const Errors = require("./Errors");
const Maybe = require("./Libs").Maybe;
const Result = require("./Result");


const identity = i =>
    i;


const okayResult = lexer => result =>
    Result.Okay({lexer: lexer, result: result});


const mapResult = f => result =>
    result.map(r => ({lexer: r.lexer, result: f(r.result)}));


const andMap = parsers => f => lexer => {
    let resultArray = [];
    let tmpLexer = lexer;

    for (let lp = 0; lp < parsers.length; lp += 1) {
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


const manyResult = parser => currentResult => {
    const nextResult =
        currentResult.andThen(s => mapResult(r => Array.append(r)(s.result))(parser(s.lexer)));

    return nextResult.isOkay()
        ? manyResult(parser)(nextResult)
        : currentResult;
};


const many = parser => lexer =>
    manyResult(okayResult(lexer)([]));


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


const chainl1 = parser => sep => lexer => {
    const currentResult =
        mapResult(r => [r])(parser(lexer));

    const tailParser =
        andMap([sep, parser])(a => a[1]);

    if (currentResult.isOkay()) {
        return manyResult(tailParser)(currentResult);
    } else {
        return currentResult;
    }
};


const tokenMap = tokenID => f => lexer =>
    lexer.head().token().id === tokenID
        ? okayResult(lexer.tail())(f(lexer.head()))
        : Result.Error(Errors.tokenExpected(lexer.head())(tokenID));


const token = tokenID =>
    tokenMap(tokenID)(identity);


const optional = parser => lexer => {
    const result = parser(lexer);

    return result.isOkay()
        ? mapResult(r => Maybe.Just(r))(result)
        : okayResult(lexer)(Maybe.Nothing);
};


module.exports = {
    and,
    andMap,
    chainl1,
    many,
    manyOne,
    optional,
    or,
    token,
    tokenMap
};