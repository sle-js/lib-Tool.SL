const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Translator = require("../src/Translator");


module.exports = Unit.Suite("Translator Suite")([
    Unit.Suite("markup name")([
        Unit.Test("hello")(Assertion
            .equals("hello")(Translator.markupName("hello"))),
    ])
]);