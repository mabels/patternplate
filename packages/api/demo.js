const loadConfig = require("@patternplate/load-config");
const loadMeta = require("@patternplate/load-meta");
const AggregateError = require("aggregate-error");
const unindent = require("unindent");
const upperFirst = require("lodash.upperfirst");
const camelCase = require("lodash.camelcase");

const pascalCase = (...args) => upperFirst(camelCase(...args));

module.exports = demo;

async function demo(options) {
  return async function demoRoute(req, res) {
    try {
      const result = await loadConfig({ cwd: options.cwd });
      const { config = {} } = result;
      const { entry = [] } = config;

      const id = req.params[0];

      const patterns = await loadMeta({
        cwd: options.cwd,
        entry
      });

      const pattern = patterns.find(pattern => pattern.id === id);

      if (!pattern) {
        return res.sendStatus(404);
      }

      res.send(html({
        pattern,
        config,
        content: {}
      }));
    } catch (err) {
      const error = Array.isArray(err) ? new AggregateError(err) : err;
      console.error(error);
      res.status(500).send(error.message);
    }
  };
}

function html({content, config, pattern}) {
  const data = encodeURIComponent(JSON.stringify(pattern));
  const LocalName = pascalCase(pattern.manifest.name);

  return unindent(`
    <!doctype html>
    <html lang="en">
      <head>
        <!-- content.head -->
        ${content.head || ""}
        <!-- content.css -->
        ${content.css || ""}
      </head>
      <body>
        <textarea style="display: none;" data-patternplate-vault="data-pattedrnplate-vault">${data}</textarea>
        <!-- content.before -->
        ${content.before || ""}
        <!-- content.html -->
        <div data-patternplate-mount="data-patternplate-mount">${content.html || ""}</div>
        <!-- content.after -->
        ${content.after || ""}
        <script type="module">
          import mount from "/api/modules/node_modules/${config.mount}.js";
          import ${LocalName} from "/api/modules/${pattern.artifact}";

          const element = document.querySelector('[data-patternplate-mount]');
          const data = getData();
          mount(component, element);

          function getData() {
            var vault = document.querySelector('[data-patternplate-vault]');
            if (!vault) {
              return {};
            }
            var encodedJson = vault.textContent;
            if (!encodedJson) {
              return {};
            }
            var json = decodeURIComponent(encodedJson);
            if (!json) {
              return {};
            }
            return JSON.parse(json);
          }
        </script>
      </body>
    </html>
  `);
}

