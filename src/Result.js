const identity = x => x;

const constant = c => _ => c;


function Result$(value) {
    this.content = value;
}


const Okay = value =>
    new Result$([0, value]);


const Error = value =>
    new Result$([1, value]);


Result$.prototype.reduce = function(fOkay) {
    return fError => this.content[0] === 0 ? fOkay(this.content[1]) : fError(this.content[1]);
};


Result$.prototype.withDefault = function (value) {
    return this.reduce(identity)(constant(value));
};
assumption(Okay(10).withDefault(1) === 10);
assumption(Error(10).withDefault(1) === 1);


Result$.prototype.errorWithDefault = function(okayValue) {
    return this.reduce(constant(okayValue))(identity);
};
assumptionEqual(Okay(10).errorWithDefault(0), 0);
assumptionEqual(Error(10).errorWithDefault(0), 10);


Result$.prototype.isOkay = function() {
    return this.reduce(constant(true))(constant(false));
};
assumption(Okay(10).isOkay());
assumption(!Error(10).isOkay());


Result$.prototype.isError = function() {
    return this.reduce(constant(false))(constant(true));
};
assumption(!Okay(10).isError());
assumption(Error(10).isError());


Result$.prototype.andThen = function(f) {
    return this.reduce(okay => f(okay))(error => Error(error));
};
assumption(Okay(10).andThen(n => Okay(n * 2)).isOkay());
assumption(Okay(10).andThen(n => Okay(n * 2)).withDefault(0) === 20);
assumption(Error(1).andThen(n => Okay(n * 2)).isError());
assumption(Error(1).andThen(n => Okay(n * 2)).reduce(identity)(identity) === 1);


Result$.prototype.map = function(f) {
    return this.reduce(okay => Okay(f(okay)))(error => Error(error));
};
assumptionEqual(Okay(10).map(n => n * 10), Okay(100));
assumptionEqual(Error(10).map(n => n * 10), Error(10));


Result$.prototype.mapError = function(f) {
    return this.reduce(okay => Okay(okay))(error => Error(f(error)));
};
assumptionEqual(Okay(10).mapError(n => n * 10), Okay(10));
assumptionEqual(Error(10).mapError(n => n * 10), Error(100));


module.exports = {
    Error,
    Okay,
    Result$
};
