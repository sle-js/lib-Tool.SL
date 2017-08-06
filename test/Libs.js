const Libs = require("../src/Libs");


module.exports = Object.assign({}, Libs, {
    Assertion: mrequire("core:Test.Unit.Assertion:1.1.0"),
    Array: mrequire("core:Native.Data.Array:1.0.0"),
    Unit: mrequire("core:Test.Unit:0.0.1")
});