import {
  createRequire,
  extractDepsFromSource,
  getPathVars,
  template,
  isCJSFormat,
  errMsg,
} from "./utils";

import { JAVASCRIPT_REGEX, JS_CONTENT_TYPE_REGEX } from "./constants";

import global from "global";

const systemJSPrototype = global.System.constructor.prototype;
const originalInstantiate = systemJSPrototype.instantiate;
const originalShouldFetch =
  systemJSPrototype.shouldFetch.bind(systemJSPrototype);

systemJSPrototype.shouldFetch = function (url) {
  return originalShouldFetch(url) || JAVASCRIPT_REGEX.test(url);
};

systemJSPrototype.instantiate = function (url, parentUrl, meta) {
  const isJavascriptFile = JAVASCRIPT_REGEX.test(url);

  if (!this.shouldFetch(url)) {
    return originalInstantiate.call(this, url, parentUrl, meta);
  }

  if (isJavascriptFile) {
    return systemJSPrototype
      .fetch(url, {
        credentials: "same-origin",
        meta: meta,
      })
      .then((res) => {
        if (!res.ok) {
          throw Error(
            errMsg(
              7,
              res.status +
                " " +
                res.statusText +
                ", loading " +
                url +
                (parentUrl ? " from " + parentUrl : ""),
            ),
          );
        }
        const contentType = res.headers.get("content-type");

        if (!contentType || !JS_CONTENT_TYPE_REGEX.test(contentType)) {
          throw Error(
            errMsg(
              4,
              'Unknown Content-Type "' +
                contentType +
                '", loading ' +
                url +
                (parentUrl ? " from " + parentUrl : ""),
            ),
          );
        }

        return res.text().then((source) => {
          if (isCJSFormat(source)) {
            const exports = {};
            const module = { exports };
            const require = createRequire(this, parentUrl ?? url);
            const dependencies = extractDepsFromSource(source);

            // Import all dependencies into the SystemJS registry
            const depsPromises = dependencies.map((dep) =>
              global.System.import(dep, parentUrl ?? url),
            );

            // Make sure all deps are loaded before attempting to exec the module
            // otherwise "require" will fail at System.get
            return Promise.all(depsPromises).then(() => {
              let _src = template(source);

              if (_src.indexOf("//# sourceURL=") < 0) {
                _src += "\n//# sourceURL=" + url;
              }

              const { filename, dirname } = getPathVars(url);
              global.__cjsWrapper = {
                exports,
                args: [
                  module,
                  exports,
                  require,
                  filename,
                  dirname,
                  global,
                  global,
                ],
              };
              // exec the code to capture exports.
              (0, eval)(_src);

              global.__cjsWrapper = undefined;

              // Create a System.register format and pass the dependencies
              // and module exports.
              systemJSPrototype.register(dependencies, function (_export) {
                return {
                  setters: [],
                  execute: function () {
                    _export(module.exports);
                    _export("default", module.exports);
                  },
                };
              });

              // Return the new module
              return systemJSPrototype.getRegister(url);
            });
          } else {
            // If not a CommonJS module, use default behavior
            if (source.indexOf("//# sourceURL=") < 0) {
              source += "\n//# sourceURL=" + url;
            }
            (0, eval)(source);
            return systemJSPrototype.getRegister(url);
          }
        });
      });
  }

  // If not a JS file, use default behavior
  return originalInstantiate.call(this, url, parentUrl, meta);
};
