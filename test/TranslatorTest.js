const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Translator = require("../src/Translator");


module.exports = Unit.Suite("Translator Suite")([
    Unit.Suite("markup name")([
        Unit.Test("hello")(Assertion
            .equals("hello")(Translator.markupName("hello"))),
        Unit.Test("hello'")(Assertion
            .equals("hello$39")(Translator.markupName("hello'"))),
        Unit.Test("hello?")(Assertion
            .equals("hello$63")(Translator.markupName("hello?"))),
        Unit.Test("==")(Assertion
            .equals("$61$61")(Translator.markupName("==")))
    ])
]);