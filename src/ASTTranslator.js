module.exports = $importAll([
    "./Libs",
    "./es2015"
]).then($imports => {
    const Array = $imports[0].Array;
    const Char = $imports[0].Char;
    const ES2015 = $imports[1];
    const String = $imports[0].String;


    const markupIdentifier = name => {
        const markupChar = c =>
            (c === 36) || (c === 95) || Char.alphaDigit$63(c)
                ? String.fromChar(c)
                : "$" + c;

        return String.foldl("")(acc => item => acc + markupChar(item))(name);
    };


    const Identifier = (loc, name) =>
        ES2015.Identifier(loc, markupIdentifier(name));


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
                        Identifier(undefined, declaration.name.value),
                        xExpression(declaration.expression))
                ],
                "const");

        return xNameDeclaration(declaration);
    };


    const flatten = a =>
        Array.length(a) === 0
            ? []
            : Array.flatten(a);


    const translate = slAST => {
        const exportNameFromImport = $import => {
            const nameItems =
                $import.urn.value[1].split(".");

            return $import.kind === "QualifiedImport"
                ? $import.name.value
                : nameItems[nameItems.length - 1];
        };

        const exportNamesFromImport = $import =>
            $import.kind === "UnqualifiedImport" || $import.kind === "QualifiedImport" && $import.public
                ? [exportNameFromImport($import)]
                : $import.kind === "QualifiedNameImport" ? Array.map(i => i.qualified.value)(Array.filter(i => i.public)($import.names))
                : [];

        const exportNamesFromImports =
            flatten(Array.map(exportNamesFromImport)(slAST.imports));

        const exportNames =
            Array.concat(exportNamesFromImports)(Array.map(d => d.name.value)(slAST.declarations));


        if (Array.length(slAST.imports) === 0) {
            const moduleExports =
                ES2015.AssignmentExpression(
                    undefined,
                    ES2015.AssignmentOperator("="),
                    ES2015.MemberExpression(
                        undefined,
                        Identifier(undefined, "module"),
                        Identifier(undefined, "exports"),
                        false),
                    ES2015.CallExpression(
                        undefined,
                        ES2015.MemberExpression(
                            undefined,
                            Identifier(undefined, "Promise"),
                            Identifier(undefined, "resolve"),
                            false),
                        [
                            ES2015.ObjectExpression(
                                undefined,
                                Array.map(n => ES2015.Property(undefined, ES2015.Literal(undefined, n), Identifier(undefined, n), "init"))(exportNames))
                        ]));

            return ES2015.Program(
                undefined,
                Array.append(moduleExports)(Array.map(xDeclaration)(slAST.declarations)))
        } else {
            const importAssignments =
                flatten(Array.indexedMap(n => i => i.kind === "UnqualifiedImport"
                    ? [ES2015.VariableDeclaration(
                        undefined,
                        [
                            ES2015.VariableDeclarator(
                                undefined,
                                Identifier(undefined, exportNameFromImport(i)),
                                ES2015.MemberExpression(
                                    undefined,
                                    Identifier(undefined, "$imports"),
                                    ES2015.Literal(undefined, n),
                                    true
                                ))
                        ],
                        "const")]
                    : i.kind === "QualifiedImport" ?
                        [ES2015.VariableDeclaration(
                            undefined,
                            [
                                ES2015.VariableDeclarator(
                                    undefined,
                                    Identifier(undefined, i.name.value),
                                    ES2015.MemberExpression(
                                        undefined,
                                        Identifier(undefined, "$imports"),
                                        ES2015.Literal(undefined, n),
                                        true))
                            ],
                            "const")]
                        : Array.map(i =>
                            ES2015.VariableDeclaration(
                                undefined,
                                [
                                    ES2015.VariableDeclarator(
                                        undefined,
                                        Identifier(undefined, i.qualified.value),
                                        ES2015.MemberExpression(
                                            undefined,
                                            ES2015.MemberExpression(
                                                undefined,
                                                Identifier(undefined, "$imports"),
                                                ES2015.Literal(undefined, n),
                                                true),
                                            Identifier(undefined, i.name.value),
                                            false))
                                ],
                                "const")
                        )(i.names)
                )(slAST.imports));


            const returnExports =
                ES2015.ReturnStatement(
                    undefined,
                    ES2015.ObjectExpression(
                        undefined,
                        Array.map(n => ES2015.Property(undefined, ES2015.Literal(undefined, markupIdentifier(n)), Identifier(undefined, n), "init"))(exportNames)));

            return ES2015.Program(
                undefined,
                [
                    ES2015.AssignmentExpression(
                        undefined,
                        ES2015.AssignmentOperator("="),
                        ES2015.MemberExpression(
                            undefined,
                            Identifier(undefined, "module"),
                            Identifier(undefined, "exports"),
                            false),

                        ES2015.MemberExpression(
                            undefined,
                            ES2015.CallExpression(
                                undefined,
                                Identifier(undefined, "$importAll"),
                                [
                                    ES2015.SequenceExpression(
                                        undefined,
                                        Array.map(i => ES2015.Literal(undefined, i.urn.value.join(":")))(slAST.imports))
                                ]),
                            ES2015.CallExpression(
                                undefined,
                                Identifier(undefined, "then"),
                                [
                                    ES2015.FunctionExpression(
                                        undefined,
                                        null,
                                        [Identifier(undefined, "$imports")],
                                        ES2015.FunctionBody(
                                            undefined,
                                            Array.concat(importAssignments)(Array.append(returnExports)(Array.map(xDeclaration)(slAST.declarations)))))
                                ]),
                            false)),
                ]);
        }
    };


    return {
        translate
    };
});

