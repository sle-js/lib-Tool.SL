const empty =
    new Set();


const singleton = e =>
    new Set([e]);


const fromArray = a =>
    new Set(a);


const difference = s1 => s2 =>
    new Set([...s1].filter(e => !s2.has(e)));


const intersection = s1 => s2 =>
    new Set([...s1].filter(e => s2.has(e)));


const union = s1 => s2 =>
    new Set([...s1, ...s2]);


const asArray = s =>
    [...s];


const show = s =>
    `{${asArray(s).join(", ")}}`;


const equals = as => bs => {
    if (as.size !== bs.size) return false;
    for (let a of as) if (!bs.has(a)) return false;
    return true;
};


module.exports = Promise.resolve({
    asArray,
    difference,
    empty,
    equals,
    fromArray,
    intersection,
    show,
    singleton,
    union
});