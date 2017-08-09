const Maybe = mrequire("core:Native.Data.Maybe:1.0.0");


//- Reads an Int from a `String` value. The number must parse as an integer and fall within the valid range of values
//- for the `Int` type, otherwise `Nothing` is returned.
//-
//- fromString :: String -> Maybe Int
const fromString = s => {
    const result = parseInt(s);

    if (isNaN(result)) {
        return Maybe.Nothing;
    } else {
        return Maybe.Just(result);
    }
};
assumption(fromString("123").withDefault(0) === 123);
assumption(fromString("12abc").withDefault(0) === 12);
assumption(fromString("abc").withDefault(0) === 0);


module.exports = {
    fromString
};
