const Assertion = require("./Libs").Assertion;
const Unit = require("./Libs").Unit;

const Float = require("./Libs").Float;


module.exports = Unit.Suite("Native.Data.Float")([
    Unit.Suite("fromString")([
        Unit.Test("'123.0' equals 123.0")(Assertion
            .equals(Float.fromString("123.0").withDefault(0.0))(123.0)),
        Unit.Test("'12abc' equals 12.0")(Assertion
            .equals(Float.fromString("12abc").withDefault(0.0))(12.0)),
        Unit.Test("'abc' with default -10.0 equals -10.0")(Assertion
            .equals(Float.fromString("abc").withDefault(-10.0))(-10.0)),
        Unit.Test("'.123' equals 0.123")(Assertion
            .equals(Float.fromString(".123").withDefault(0.0))(0.123))
    ])
]);