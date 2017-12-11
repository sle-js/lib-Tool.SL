module.exports = $importAll([
    "./Libs",
    "./es2015"
]).then($imports => {
    const Array = $imports[0].Array;
    const ES2015 = $imports[1];


    const xExpression = expression => {
        return ES2015.Literal(expression.value);
    };


    const xDeclaration = declaration => {
        const xNameDeclaration = declaration =>
            ES2015.VariableDeclaration(
                undefined,
                ES2015.VariableDeclarator(
                    undefined,
                    ES2015.Identifier(
                        undefined,
                        declaration.name.value),
                    xExpression(declaration.expression)),
                "const");

        return xNameDeclaration(declaration);
    };


    const translate = slAST =>
        ES2015.Program(undefined, Array.map(xDeclaration)(slAST.declarations));


    return {
        translate
    };
});

