module.exports = $importAll([
    "core:Native.Data.Maybe:1.0.0"
]).then($imports => {
    const Maybe = $imports[0];


    const empty =
        {};


    const insert = k => v => d => {
        const t =
            {};

        t[k] = v;

        return Object.assign({}, d, t)
    };


    const get = k => d => {
        const value =
            d[k];

        return value === undefined
            ? Maybe.Nothing
            : Maybe.Just(value);
    };


    return {
        empty,
        get,
        insert
    };
});
