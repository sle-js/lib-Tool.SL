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


module.exports = Array;