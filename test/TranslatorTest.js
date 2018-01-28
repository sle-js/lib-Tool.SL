module.exports = $import(
    "./Libs"
).then($imports => {
    const Array = $imports.Array;
    const Assertion = $imports.Assertion;
    const ASTTranslator = $imports.ASTTranslator;
    const Dict = $imports.Dict;
    const ES2015Translator = $imports.ES2015Translator;
    const FileSystem = $imports.FileSystem;
    const Infer = $imports.Infer;
    const Path = $imports.Path;
    const Schema = $imports.Schema;
    const Solver = $imports.Solver;
    const String = $imports.String;
    const Type = $imports.Type;
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


    const showInferState = is =>
        Object.assign({}, is, {
            env: Dict.mapValue(Schema.show)(is.env),
            constraints: Array.map(Array.map(Type.show))(is.constraints)
        });


    const processFile = suiteName => content => assertion => {
        const astKey =
            Array.find(String.startsWith("ast"))(Object.keys(content));

        if (astKey.map(v => v === "ast").withDefault(false) || content.typeSolver || content.typeInference || content.js || content.jsast) {
            const ast =
                Parser.parseModule(_ => true)(LexerConfiguration.fromNamedString(suiteName)(content.src.join("\n")));

            const astAssertion =
                content.ast
                    ? assertion
                        .isTrue(ast.isOkay())
                        .equals(asString(ast.content[1].result).trim())(content.ast.join("\n").trim())
                    : assertion
                        .isTrue(ast.isOkay());

            const typeInference = content.typeInference
                ? Infer.inferModule(ast.content[1].result)(Infer.initialInferState)
                    .then(is => astAssertion.equals(asString(showInferState(is)))(content.typeInference.join("\n").trim()))
                    .catch(e => astAssertion.equals(asString(e))(content.typeInference.join("\n").trim()))
                : astAssertion;

            return content.typeSolver
                ? Infer.inferModule(ast.content[1].result)(Infer.initialInferState)
                    .then(is => Solver.solver(is.subst))
                    .then(r => typeInference.equals(asString(r))(content.typeSolver.join("\n").trim()))
                    .catch(e => astAssertion.equals(asString(e))(content.typeInference.join("\n").trim()))
                : typeInference;
        } else if (astKey.isJust()) {
            const parseName =
                astKey.withDefault("ast parseModule").split(" ")[1];

            const ast =
                Parser[parseName](_ => true)(LexerConfiguration.fromNamedString(suiteName)(content.src.join("\n")));

            return Promise.resolve(assertion
                .equals(asString(ast.content[1].result).trim())(content[astKey.withDefault("ast parseModule")].join("\n").trim()));
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
                        .then(content => processFile(suiteName)(content)(Assertion.AllGood)
                            .then(a => Unit.Test(suiteName + ": " + content.name)(a)))
                        .catch(error => Unit.Test(suiteName)(Assertion.fail(error)))

                    : FileSystem
                        .readdir(fileSystemName)
                        .then(directoryContents => Unit.Suite(suiteName)(directoryContents.map(file => loadSuite(file)(fileSystemName + "/" + file)))));


    const dirname = name =>
        Path.resolve(__dirname, name);


    return Unit.Suite("Translator Suite")([
        // loadSuite("parseModule")(dirname("./translator")),
        loadSuite("parse")(dirname("./parser")),
        loadSuite("Type Inference")(dirname("./typeInference")),
        loadSuite("Type Solver")(dirname("./typeSolver"))
    ]);
});
