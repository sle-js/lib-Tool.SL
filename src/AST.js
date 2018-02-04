module.exports = $importAll([
    "use:./SLAST.estree core:Tool.ESTree:1.0.3"
]).then($imports => {
    const SLAST = $imports[0];


    SLAST.apply = subst => ast =>
        Promise.resolve(ast);


    return SLAST;
});