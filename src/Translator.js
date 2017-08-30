const Array = require("./Libs").Array;
const Result = require("./Result");


const compose = ffs => a => {
    let result = a;

    for (let lp = ffs.length - 1; lp >= 0; lp -= 1) {
        result = ffs[lp](result);
    }

    return result;
};


// arrayToString :: Array String -> String
const arrayToString =
    Array.join("\n");


// flattenArray :: Array Array a -> Array a
const flattenArray =
    Array.foldl([])(Array.concat);


// TODO Create a name to JavaScript name function to ensure that all names are properly marked up.
// type URN = Array String
// extractImportNameFromURN :: URN -> String
const extractImportNameFromURN = urn => {
    const name =
        urn[1].split(".");

    return name[name.length - 1];
};


// translate :: AST.Module -> Result ParseError String
const translate = ast => {
    // imports :: AST.Import -> String
    const imports = compose([
        arrayToString,
        Array.map(i => i.reduce(
            c => "const " + extractImportNameFromURN(c.urn) + " = mrequire(\"" + c.urn.join(":") + "\");")(
            c => "")(
            c => ""))
    ]);

    // exports :: AST.Import -> String
    const exports = importAST => {
        // publicNames :: AST.Import -> Array String
        const publicNames = compose([
            flattenArray,
            Array.map(
                i => i.reduce(
                    c => [extractImportNameFromURN(c.urn)])(
                    c => [])(
                    c => []))
        ]);

        return arrayToString([
            "module.exports = {",
            compose([
                Array.join(",\n"),
                Array.map(i => "    " + i),
                publicNames
            ])(importAST),
            "};"
        ]);
    };


    // TODO If there are no imports then the file opens with 2 blank lines.  Fix this without needing to trim the entire translated source code.
    // TODO Return an error in the event that there are duplicates within the exports list.
    return compose([
        Result.Okay,
        arrayToString
    ])([
        imports(ast.imports),
        "",
        exports(ast.imports)
    ]);
};


module.exports = {
    translate
};