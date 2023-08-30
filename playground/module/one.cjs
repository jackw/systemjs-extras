"use strict";

const { phrase } = require("./deps/two.cjs");

function add(a, b) {
  return a + b;
}

exports.a = "b";
exports.add = add;
exports.phrase = phrase;

console.log({ dirname: __dirname, filename: __filename });
