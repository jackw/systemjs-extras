import {
  AMD_MODULE_REGEX,
  CJS_EXPORTS_REGEX,
  CJS_FILEDIR_REGEX,
  CJS_REQUIRE_REGEX,
} from "./constants";

export function isCJSFormat(source) {
  return (
    !AMD_MODULE_REGEX.test(source) &&
    (CJS_REQUIRE_REGEX.test(source) ||
      CJS_EXPORTS_REGEX.test(source) ||
      CJS_FILEDIR_REGEX.test(source))
  );
}

export function getPathVars(url) {
  const filename = url.substring(url.lastIndexOf("/") + 1);
  let dirname = url.split("/");
  dirname.pop();
  dirname = dirname.join("/");

  return {
    filename,
    dirname,
  };
}

export function extractDepsFromSource(source) {
  // TODO: improve this to handle commented code
  const foundDeps = source.match(CJS_REQUIRE_REGEX);
  const depIndentifiers = foundDeps
    ?.map((requireStatement) => {
      const match = requireStatement.match(/\srequire\(["|'](.+)["|']\)/);
      if (match && match[1]) {
        return match[1];
      }
      return "";
    })
    .filter(Boolean);
  return depIndentifiers?.length ? depIndentifiers : [];
}

export function template(source) {
  return `(function (module,exports,require,__filename,__dirname, global, GLOBAL) {
${source}
}).apply(__cjsWrapper.exports, __cjsWrapper.args)`;
}

export function createRequire(loader, parentUrl) {
  return function require(id) {
    const resolvedUrl = loader.resolve(id, parentUrl);
    const module = loader.get(resolvedUrl);

    if (!module)
      throw new Error(
        'Module not already loaded loading "' +
          id +
          '" as ' +
          resolvedUrl +
          (parentUrl ? ' from "' + parentUrl + '".' : ".")
      );

    return "__useDefault" in module ? module.default : module;
  };
}
