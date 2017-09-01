const Array = require("./Libs").Array;
const Char = require("./Char");
const Result = require("./Result");
const String = require("./String");


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
        urn[1].split(".");

    return markupName(name[name.length - 1]);
};


// translate :: AST.Module -> Result ParseError String
const translate = ast => {
    // imports :: AST.Import -> String
    const imports = compose([
        arrayToString,
        Array.map(i => i.reduce(
            c => "const " + extractImportNameFromURN(c.urn) + " = mrequire(\"" + c.urn.join(":") + "\");")(
            c => "const " + markupName(c.name) + " = mrequire(\"" + c.urn.join(":") + "\");")(
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
                    c => [markupName(c.name)])(
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
    markupName,
    translate
};