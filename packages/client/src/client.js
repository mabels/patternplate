require("dom4"); // eslint-disable-line import/no-unassigned-import

const ARSON = require("arson");
const url = require("url");
const fetch = require("isomorphic-fetch");
const platform = require("platform");
const router = require("./app/client").default;
const { merge } = require("lodash");

const { document } = global;

main().catch(err => {
  console.error(err);
});

async function main() {
  const slot = document.query('[data-application-el="patternplate"]');
  const vault = document.query('[data-application-state="patternplate"]');
  const data = await getData(vault);

  if (data.isStatic) {
    slot.innerHTML = '';
  }

  router(data, slot);
}

async function getData(vault) {
  const data = ARSON.parse(decodeURIComponent(vault.textContent));
  const schema = await getStateData(data.base);

  return merge(data, getPlatformData(), getWindowData(), {
    schema,
    navigation: schema.meta
  });
}

async function getStateData(base) {
  return (await fetch(`${prefix(base)}/api/state.json`)).json();
}

function prefix(base) {
  return base.charAt(base.length - 1) === "/"
    ? base.slice(0, base.length - 1)
    : base;
}

function getPlatformData() {
  return {
    clientRuntimeName: platform.name,
    clientRuntimeVersion: platform.version,
    clientOsName: platform.os.name,
    clientOsVersion: platform.os.version
  };
}

function getWindowData() {
  return {
    window: {
      width: global.innerWidth,
      height: global.innerHeight
    }
  };
}
