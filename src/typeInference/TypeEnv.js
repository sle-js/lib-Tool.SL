module.exports = $importAll([
    "./../Dict"
]).then($imports => {
    const Dict = $imports[0];


    const empty =
        Dict.empty;


    const extend =
        Dict.insert;


    return {
        extend,
        empty
    };
});
