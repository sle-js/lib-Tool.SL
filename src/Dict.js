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


    const getWithDefault = def => k => d => {
        const value =
            d[k];

        return value === undefined
            ? def
            : value;
    };


    const mapValue = f => d => {
        const result = {};

        for (const key of Object.keys(d)) {
            result[key] = f(d[key]);
        }

        return result;
    };


    const fromArray = a => {
        const result = {};

        for (const t in a) {
            result[t[0]] = t[1];
        }

        return result;
    };


    return {
        empty,
        fromArray,
        get,
        getWithDefault,
        insert,
        mapValue
    };
});
