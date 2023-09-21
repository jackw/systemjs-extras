import {
  AMD_MODULE_REGEX,
  CJS_EXPORTS_REGEX,
  CJS_FILEDIR_REGEX,
  CJS_REQUIRE_REGEX,
  COMMENT_REGEX,
  STRING_REGEX,
} from "./constants";

export function isCJSFormat(source) {
  return (
    !AMD_MODULE_REGEX.test(source) &&
    (CJS_REQUIRE_REGEX.test(source) ||
      CJS_EXPORTS_REGEX.test(source) ||
      CJS_FILEDIR_REGEX.test(source))
  );
}

export function errMsg(errCode, msg) {
  return (
    (msg || "") +
    " (SystemJS Error#" +
    errCode +
    " " +
    "https://github.com/systemjs/systemjs/blob/main/docs/errors.md#" +
    errCode +
    ")"
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
  CJS_REQUIRE_REGEX.lastIndex =
    COMMENT_REGEX.lastIndex =
    STRING_REGEX.lastIndex =
      0;
  let depIndentifiers = [];
  let stringLocations = [];
  let commentLocations = [];
  let match;

  if (source.length / source.split("\n").length < 200) {
    while ((match = STRING_REGEX.exec(source))) {
      stringLocations.push([match.index, match.index + match[0].length]);
    }

    while ((match = COMMENT_REGEX.exec(source))) {
      // only track comments not starting in strings
      if (!inLocation(stringLocations, match)) {
        commentLocations.push([
          match.index + match[1].length,
          match.index + match[0].length - 1,
        ]);
      }
    }
  }

  while ((match = CJS_REQUIRE_REGEX.exec(source))) {
    // ensure we're not within a string or comment location
    if (
      !inLocation(stringLocations, match) &&
      !inLocation(commentLocations, match)
    ) {
      var dep = match[1].substring(1, match[1].length - 1);
      // skip cases like require('" + file + "')
      if (dep.match(/"|'/)) {
        continue;
      }
      depIndentifiers.push(dep);
    }
  }

  return depIndentifiers;
}

function inLocation(locations, match) {
  for (var i = 0; i < locations.length; i++) {
    if (locations[i][0] < match.index && locations[i][1] > match.index) {
      return true;
    }
  }
  return false;
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

    if (!module) {
      throw new Error(
        'Module not already loaded loading "' +
          id +
          '" as ' +
          resolvedUrl +
          (parentUrl ? ' from "' + parentUrl + '".' : "."),
      );
    }

    return "__useDefault" in module ? module.default : module;
  };
}
