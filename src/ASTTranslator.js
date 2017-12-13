module.exports = $importAll([
    "./Libs",
    "./es2015"
]).then($imports => {
    const Array = $imports[0].Array;
    const ES2015 = $imports[1];


    const xExpression = expression => {
        return ES2015.Literal(undefined, expression.value);
    };


    const xDeclaration = declaration => {
        const xNameDeclaration = declaration =>
            ES2015.VariableDeclaration(
                undefined,
                [
                    ES2015.VariableDeclarator(
                        undefined,
                        ES2015.Identifier(undefined, declaration.name.value),
                        xExpression(declaration.expression))
                ],
                "const");

        return xNameDeclaration(declaration);
    };


    const translate = slAST => {
        const exportNames =
            Array.map(d => d.name.value)(slAST.declarations);

        const moduleExports =
            ES2015.AssignmentExpression(
                undefined,
                ES2015.AssignmentOperator("="),
                ES2015.MemberExpression(
                    undefined,
                    ES2015.Identifier(undefined, "module"),
                    ES2015.Identifier(undefined, "exports"),
                    false),
                ES2015.CallExpression(
                    undefined,
                    ES2015.MemberExpression(
                        undefined,
                        ES2015.Identifier(undefined, "Promise"),
                        ES2015.Identifier(undefined, "resolve"),
                        false),
                    [
                        ES2015.ObjectExpression(
                            undefined,
                            Array.map(n => ES2015.Property(undefined, ES2015.Literal(undefined, n), ES2015.Identifier(undefined, n), "init"))(exportNames))
                    ]));

        return ES2015.Program(
            undefined,
            Array.append(moduleExports)(Array.map(xDeclaration)(slAST.declarations)));
    };


    return {
        translate
    };
});

