const empty =
    {};


const insert = k => v => d => {
    const t =
        {};

    t[k] = v;

    return Object.assign({}, d, t)
};


module.exports = Promise.resolve({
    empty,
    insert
});