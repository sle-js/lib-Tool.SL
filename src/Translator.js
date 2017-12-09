module.exports = $importAll([
    "./Libs",
    "./Char"
]).then($imports => {
    const Array = $imports[0].Array;
    const Char = $imports[1];
    const Result = $imports[0].Result;
    const String = $imports[0].String;


    const compose = ffs => a => {
        let result = a;

        for (let lp = ffs.length - 1; lp >= 0; lp -= 1) {
            result = ffs[lp](result);
        }

        return result;
    };


    const markupName = name => {
        const markupChar = c =>
            (c === 95) || Char.alphaDigit$63(c)
                ? String.fromChar(c)
                : "$" + c;

        return String.foldl("")(acc => item => acc + markupChar(item))(name);
    };


    // arrayToString :: Array String -> String
    const arrayToString =
        Array.join("\n");


    // flattenArray :: Array Array a -> Array a
    const flattenArray =
        Array.foldl([])(Array.concat);


    // type URN = Array String
    // extractImportNameFromURN :: URN -> String
    const extractImportNameFromURN = urn => {
        const name =
            urn[0] === "file"
                ? urn[1].split("/")
                : urn[1].split(".");

        return markupName(name[name.length - 1]);
    };


    const publicNames = moduleAST =>
        Array.concat(
            compose([
                flattenArray,
                Array.map(
                    i => i.kind === "UnqualifiedImport" ? [extractImportNameFromURN(i.urn.value)] :
                        i.kind === "QualifiedImport" ? (i.public ? [markupName(i.name.value)] : []) : (i.reduce(
                            c => [extractImportNameFromURN(c.urn)])(
                            c => c.public ? [markupName(c.name.value)] : [])(
                            c => Array.map(n => markupName(n.qualified.value))(Array.filter(n => n.public)(c.names)))))
            ])(moduleAST.imports))(
            moduleAST.declarations.filter(x => x.kind === "NameDeclaration").map(x => x.name.value)
        );


    // translate :: AST.Module -> Result ParseError String
    const translate = ast => {
        // imports :: AST.Import -> String
        const imports = compose([
            arrayToString,
            flattenArray,
            Array.indexedMap(index => i =>
                i.kind === "UnqualifiedImport" ? [`const ${extractImportNameFromURN(i.urn.value)} = mrequire("${i.urn.value.join(":")}");`] :
                    i.kind === "QualifiedImport" ? [`const ${markupName(i.name.value)} = mrequire("${i.urn.value.join(":")}");`] : i.reduce(
                        c => [`const ${extractImportNameFromURN(c.urn)} = mrequire("${c.urn.join(":")}");`])(
                        c => [`const ${markupName(c.name.value)} = mrequire("${c.urn.join(":")}");`])(
                        c => Array.length(c.names) === 1
                            ? [`const ${markupName(c.names[0].qualified.value)} = mrequire("${c.urn.join(":")}").${c.names[0].name.value};`]
                            : Array.concat(
                                [`const $$${index} = mrequire("${c.urn.join(":")}");`])(
                                c.names.map(n => `const ${n.qualified.value} = $$${index}.${n.name.value};`)
                            )))
        ]);

        // exports :: AST.Import -> String
        const exports = ast => {
            const names =
                publicNames(ast);

            return (Array.length(names) === 0)
                ? arrayToString([
                    "module.exports = {",
                    "};"
                ])
                : arrayToString([
                    "module.exports = {",
                    compose([
                        Array.join(",\n"),
                        Array.map(i => "    " + i)
                    ])(names),
                    "};"
                ]);
        };

        const jsExpression = (expression) =>
            expression.value;

        const jsDeclarations = () => {
            const declarations =
                Array.filter(x => x.kind === "NameDeclaration")(ast.declarations);

            return declarations.map(declaration => {
                if (Array.length(declaration.arguments) === 0) {
                    return Array.concat([`const ${declaration.name.value} =`])(`    ${jsExpression(declaration.expression)};`);
                } else {
                    return [];
                }
            });
        };


        const jsI =
            flattenArray(imports(ast.imports));

        const jsD =
            flattenArray(jsDeclarations());


        // TODO Return an error in the event that there are duplicates within the exports list.
        return compose([
            Result.Okay,
            arrayToString
        ])(Array.concat(
            Array.length(jsI) === 0
                ? []
                : [imports(ast.imports), ""])(
            Array.concat(
                Array.length(jsD) === 0
                    ? []
                    : Array.append("")(jsD))(
                exports(ast)
            )));
    };


    return {
        markupName,
        translate
    };
});
