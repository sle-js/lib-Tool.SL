const Maybe = mrequire("core:Native.Data.Maybe:1.0.0");


//- Reads a Float from a `String` value. The number must parse as a float and fall within the valid range of values
//- for the `Float` type, otherwise `Nothing` is returned.
//-
//- fromString :: String -> Maybe Float
const fromString = s => {
    const result = parseFloat(s);

    if (isNaN(result)) {
        return Maybe.Nothing;
    } else {
        return Maybe.Just(result);
    }
};
assumption(fromString("123.0").withDefault(0.0) === 123.0);
assumption(fromString("12abc").withDefault(0.0) === 12.0);
assumption(fromString("abc").withDefault(0.0) === 0.0);


module.exports = {
    fromString
};
