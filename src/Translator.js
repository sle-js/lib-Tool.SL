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
        flattenArray,
        Array.indexedMap(index => i => i.reduce(
            c => ["const " + extractImportNameFromURN(c.urn) + " = mrequire(\"" + c.urn.join(":") + "\");"])(
            c => ["const " + markupName(c.name) + " = mrequire(\"" + c.urn.join(":") + "\");"])(
            c => Array.length(c.names) === 1
                ? ["const " + markupName(c.names[0].qualified) + " = mrequire(\"" + c.urn.join(":") + "\")." + c.names[0].name + ";"]
                : Array.concat(
                    ["const $$" + index + " = mrequire(\"" + c.urn.join(":") + "\");"])(
                    c.names.map(n => "const " + n.qualified + " = $$" + index + "." + n.name + ";")
                )))
    ]);

    // exports :: AST.Import -> String
    const exports = importAST => {
        const names =
            compose([
                flattenArray,
                Array.map(
                    i => i.reduce(
                        c => [extractImportNameFromURN(c.urn)])(
                        c => c.public ? [markupName(c.name)] : [])(
                        c => Array.map(n => markupName(n.qualified))(Array.filter(n => n.public)(c.names))))
            ])(importAST);

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