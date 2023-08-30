import global from "global";
import { htmlTypeRegEx, htmlContentType } from "./constants";

const systemJSPrototype = global.System.constructor.prototype;
const originalShouldFetch =
  systemJSPrototype.shouldFetch.bind(systemJSPrototype);

systemJSPrototype.shouldFetch = function (url) {
  return originalShouldFetch(url) || htmlTypeRegEx.test(url);
};

const fetch = systemJSPrototype.fetch;
systemJSPrototype.fetch = function (url, options) {
  return fetch(url, options).then(function (res) {
    if (options.passThrough) return res;

    if (!res.ok) {
      return res;
    }
    const contentType = res.headers.get("content-type");
    if (htmlContentType.test(contentType))
      return res.text().then(function (text) {
        return new Response(
          new Blob(
            [
              'System.register([],function(e){return{execute:function(){e("default",' +
                JSON.stringify(text) +
                ")}}})",
            ],
            {
              type: "application/javascript",
            }
          )
        );
      });

    return res;
  });
};
