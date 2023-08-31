"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});

exports.phrase = undefined;

require("../styles/index.css");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var words = [
  "because",
  "it's",
  "like",
  "that",
  "and",
  "that's",
  "the",
  "way",
  "it",
  "is",
];

exports.phrase = _lodash2.default.reduce(
  words,
  (phrase, word, i) => {
    if (i === 0) {
      phrase = _lodash2.default.capitalize(word);
    } else {
      phrase += ` ${word}`;
    }
    if (i === words.length - 1) {
      phrase += "!";
    }
    return phrase;
  },
  ""
);
