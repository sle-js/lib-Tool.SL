const Array = mrequire("core:Native.Data.Array:1.1.0");


//- Folds all of the elements from the right.
//= foldr :: b -> (a -> b -> b) -> Array a -> b
Array.foldr = z => f => a => {
    let result = z;
    for (let lp = a.length - 1; lp >= 0; lp -= 1) {
        result = f(a[lp])(result);
    }
    return result;
};


// Same as map but the function is also applied to the index of each element (starting at zero).
//= indexedMap :: (Int -> a -> b) -> Array a -> Array b
Array.indexedMap = f => a => {
    const adaptor = (value, index) =>
        f(index)(value);

    return a.map(adaptor);
};


module.exports = Array;