module.exports = $importAll([
    "core:Native.Data.Array:1.2.0",
    "core:Native.Data.Maybe:1.0.0"
]).then($imports => {
    const Array =
        $imports[0];

    const Maybe =
        $imports[1];


    Array.last = a =>
        (a.length === 0)
            ? Maybe.Nothing
            : Maybe.Just(a[a.length - 1]);


    Array.zip =
        Array.zipWith(a => b => [a, b]);


    return Array;
});


