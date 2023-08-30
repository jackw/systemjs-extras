System.register(["lodash"], function (_export, _context) {
  "use strict";
  var lodash;
  return {
    setters: [
      function (module) {
        lodash = module;
      },
    ],
    execute: function () {
      const el = document.createElement("h1");
      const words = "hello, world";
      const text = document.createTextNode(lodash.startCase(words));
      el.appendChild(text);

      document.body.appendChild(el);
      _export({
        name: "value",
        lodash,
      });
    },
  };
});
