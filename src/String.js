//- The native string operations rewritten as functions.


const Maybe = mrequire("core:Native.Data.Maybe:1.0.0");


//= at :: Int -> String -> Maybe Char
const at = i => s =>
    i >= 0 && i < s.length
        ? Maybe.Just(s.charCodeAt(i))
        : Maybe.Nothing;
assumptionEqual(at(0)("Hello"), Maybe.Just("H".charCodeAt(0)));
assumptionEqual(at(1)("Hello"), Maybe.Just("e".charCodeAt(0)));
assumptionEqual(at(5)("Hello"), Maybe.Nothing);


//= indexOfFrom :: Int -> String -> String  -> Maybe Int
const indexOfFrom = pattern => start => s => {
    const index = s.indexOf(pattern, start);

    return index === -1
        ? Maybe.Nothing
        : Maybe.Just(index);
};
assumptionEqual(indexOfFrom("world")(2)("hello"), Maybe.Nothing);
assumptionEqual(indexOfFrom("hello")(2)("hello"), Maybe.Nothing);
assumptionEqual(indexOfFrom("ll")(2)("hello"), Maybe.Just(2));


//= indexOf :: String -> String -> Maybe Int
const indexOf = pattern => s => {
    const index = s.indexOf(pattern);

    return index === -1
        ? Maybe.Nothing
        : Maybe.Just(index);
};
assumptionEqual(indexOf("world")("hello"), Maybe.Nothing);
assumptionEqual(indexOf("hello")("hello"), Maybe.Just(0));
assumptionEqual(indexOf("ll")("hello"), Maybe.Just(2));


//= length :: String -> Int
const length = s =>
    s.length;


//= match :: RegExp -> String -> Maybe (Array String)
const match = regexp => s => {
    const match = s.match(regexp);
    return match
        ? Maybe.Just(match)
        : Maybe.Nothing;
};


//= split :: RegExp -> String -> Array String
const split = regex => s =>
    s.split(regex);


//= startsWith :: String -> String -> Bool
const startsWith = prefix => s =>
    s.startsWith(prefix);


//= substring :: Int -> Int -> String -> String
const substring = start => end => s =>
    s.substring(start, end);


//= drop :: Int -> String -> String
const drop = start => s =>
    s.substring(start);


//= trim :: String -> String
const trim = s =>
    s.trim();


//- Replaces the first occurrence of the first argument with the second argument.
//= replace :: String -> String -> String
const replace = pattern => replacement => s =>
    s.replace(pattern, replacement);
assumptionEqual(replace("l")("L")("hello"), "heLlo");
assumptionEqual(replace("*")("=")("he**o"), "he=*o");


//- Replaces all occurrence of the first argument with the second argument.
//= replaceAll :: String -> String -> String
const replaceAll = pattern => replacement => s => {
    const quoteRegExp = str =>
        str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");

    return s.replace(new RegExp(quoteRegExp(pattern), "g"), replacement);
};
assumptionEqual(replaceAll("l")("L")("hello"), "heLLo");
assumptionEqual(replaceAll("*")("=")("he**o"), "he==o");


//- Reduce a string from the left.
//= foldl :: a -> (a -> Char -> a) -> a
const foldl = z => f => s => {
    let result = z;
    for (let i = 0; i < s.length; i += 1) {
        result = f(result)(s.charCodeAt(i));
    }

    return result;
};
assumptionEqual(foldl(0)(acc => _ => acc + 1)(""), 0);
assumptionEqual(foldl(0)(acc => _ => acc + 1)("Hello"), 5);
assumptionEqual(foldl("")(acc => item => String.fromCharCode(item) + acc)("Hello"), "olleH");


//- Converts the string to all lowercase letters.
//= lowerCase :: String -> String
const lowerCase = s =>
    s.toLowerCase();
assumptionEqual(lowerCase("Hello World"), "hello world");


//- Converts the string to all uppercase letters.
//= upperCase :: String -> String
const upperCase = s =>
    s.toUpperCase();
assumptionEqual(upperCase("Hello World"), "HELLO WORLD");


//- Converts a Character into a String
//= fromChar :: Char -> String
const fromChar =
    String.fromCharCode;


module.exports = {
    at,
    drop,
    foldl,
    fromChar,
    indexOf,
    indexOfFrom,
    length,
    lowerCase,
    match,
    replace,
    replaceAll,
    split,
    startsWith,
    substring,
    trim,
    upperCase
};