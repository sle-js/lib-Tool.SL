const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Int = require("./Int");


module.exports = Unit.Suite("Native.Data.Init")([
    Unit.Suite("fromString")([
        Unit.Test("'123' equals 123")(Assertion
            .equals(Int.fromString("123").withDefault(0))(123)),
        Unit.Test("'12abc' equals 12")(Assertion
            .equals(Int.fromString("12abc").withDefault(0))(12)),
        Unit.Test("'abc' with default -10 equals -10")(Assertion
            .equals(Int.fromString("abc").withDefault(-10))(-10))
    ])
]);