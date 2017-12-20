module.exports = $import(
    "./Libs"
).then($imports => {
    const Array = $imports.Array;
    const Assertion = $imports.Assertion;
    const ASTTranslator = $imports.ASTTranslator;
    const ES2015Translator = $imports.ES2015Translator;
    const FileSystem = $imports.FileSystem;
    const Path = $imports.Path;
    const String = $imports.String;
    const Unit = $imports.Unit;

    const LexerConfiguration = $imports.LexerConfiguration;
    const Parser = $imports.Parser;


    const asString = o =>
        typeof o === "string"
            ? o
            : JSON.stringify(o, null, 2);


    const parseFile = content => {
        const newLine = acc => item => {
            if (String.startsWith("--")(item)) {
                const name =
                    String.trim(String.drop(2)(item));

                const result =
                    Object.assign({}, acc, {current: name});

                result[name] = [];

                return result;
            } else {
                const result =
                    Object.assign({}, acc);

                result[result["current"]] = Array.append(item)(result[result["current"]]);

                return result;
            }
        };

        return Array.foldl({
            current: "src",
            name: String.trim(String.drop(2)(content[0])),
            src: []
        })(newLine)(Array.drop(1)(content));
    };


    const processFile = suiteName => content => assertion => {
        const astKey =
            Array.find(String.startsWith("ast"))(Object.keys(content));

        if (astKey.map(v => v === "ast").withDefault(false) || content.js || content.jsast) {
            const ast =
                Parser.parseModule(LexerConfiguration.fromNamedString(suiteName)(content.src.join("\n")));

            const astAssertion =
                content.ast
                    ? assertion
                        .isTrue(ast.isOkay())
                        .equals(asString(ast.content[1].result).trim())(content.ast.join("\n").trim())
                    : assertion
                        .isTrue(ast.isOkay());

            const jsASTAssertion = content.jsast
                ? astAssertion.equals(asString(ASTTranslator.translate(ast.content[1].result)))(content.jsast.join("\n").trim())
                : astAssertion;

            if (content.js) {
                const output =
                    ast.map(x => x.result).andThen(ast => ES2015Translator.translate(ASTTranslator.translate(ast)));

                return jsASTAssertion
                    .equals(output.trim())(content.js.join("\n").trim());
            } else {
                return jsASTAssertion;
            }
        } else if (astKey.isJust()) {
            const parseName =
                astKey.withDefault("ast parseModule").split(" ")[1];

            const ast =
                Parser[parseName](LexerConfiguration.fromNamedString(suiteName)(content.src.join("\n")));

            return assertion
                .equals(asString(ast.content[1].result).trim())(content[astKey.withDefault("ast parseModule")].join("\n").trim());
        } else {
            return assertion;
        }
    };


    const loadSuite = suiteName => fileSystemName =>
        FileSystem
            .lstat(fileSystemName)
            .then(lstat =>
                lstat.isFile()
                    ? FileSystem
                        .readFile(fileSystemName)
                        .then(content => parseFile(content.split("\n")))
                        .then(content => Unit.Test(suiteName + ": " + content.name)(processFile(suiteName)(content)(Assertion.AllGood)))
                        .catch(error => Unit.Test(suiteName)(Assertion.fail(error)))

                    : FileSystem
                        .readdir(fileSystemName)
                        .then(directoryContents => Unit.Suite(suiteName)(directoryContents.map(file => loadSuite(file)(fileSystemName + "/" + file)))));


    const dirname = name =>
        Path.resolve(__dirname, name);


    return Unit.Suite("Translator Suite")([
        loadSuite("parseModule")(dirname("./translator")),
        loadSuite("parse")(dirname("./parser"))
    ]);
});
