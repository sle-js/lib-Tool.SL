module.exports = $import(
    "./Libs"
).then($imports => {
    const Array = $imports.Array;
    const Assertion = $imports.Assertion;
    const FileSystem = $imports.FileSystem;
    const Path = $imports.Path;
    const String = $imports.String;
    const Unit = $imports.Unit;

    const LexerConfiguration = $imports.LexerConfiguration;
    const Parser = $imports.Parser;
    const Translator = $imports.Translator;


    const asString = o =>
        JSON.stringify(o, null, 2);


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


    const processFile = content => assertion => {
        const ast =
            Parser.parseModule(LexerConfiguration.fromString(content.src.join("\n")));

        const astAssertion =
            content.ast
                ? assertion
                    .isTrue(ast.isOkay())
                    .equals(asString(ast.content[1].result).trim())(content.ast.join("\n").trim())
                : assertion
                    .isTrue(ast.isOkay());

        if (content.js) {
            const output =
                ast.map(x => x.result).andThen(ast => Translator.translate(ast));

            return astAssertion
                .isTrue(output.isOkay())
                .equals(output.content[1])(content.js.join("\n").trim());
        } else {
            return astAssertion;
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
                        .then(content => Unit.Test(suiteName + ": " + content.name)(processFile(content)(Assertion)))
                        .catch(error => Unit.Test(suiteName)(Assertion.fail(error)))

                    : FileSystem
                        .readdir(fileSystemName)
                        .then(directoryContents => Unit.Suite(suiteName)(directoryContents.map(file => loadSuite(file)(fileSystemName + "/" + file)))));


    const dirname = name =>
        Path.resolve(__dirname, name);


    return Unit.Suite("Translator Suite")([
        Unit.Suite("markup name")([
            Unit.Test("hello")(Assertion
                .equals("hello")(Translator.markupName("hello"))),
            Unit.Test("hello'")(Assertion
                .equals("hello$39")(Translator.markupName("hello'"))),
            Unit.Test("hello?")(Assertion
                .equals("hello$63")(Translator.markupName("hello?"))),
            Unit.Test("==")(Assertion
                .equals("$61$61")(Translator.markupName("==")))
        ]),
        loadSuite("parseModule")(dirname("./translator"))
    ]);
});
