// see https://jasmine.github.io/pages/faq.html#012-done-twice
const allowUnsafeMultipleDone = fn => done => {
    let called = false;
    fn(error => {
        if (!called) {
            done(error);
            called = true;
        }
    });
};

module.exports = allowUnsafeMultipleDone;