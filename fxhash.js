"use strict";
(() => {
  // src/sdk/math.ts
  var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  function b58dec(str) {
    return [...str].reduce(function(p, c) {
      return p * alphabet.length + alphabet.indexOf(c) | 0;
    }, 0);
  }
  function sfc32(seed) {
    let a = seed[0] | 0;
    let b = seed[1] | 0;
    let c = seed[2] | 0;
    let d = seed[3] | 0;
    return function() {
      a |= 0;
      b |= 0;
      c |= 0;
      d |= 0;
      const t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  function matcher(str, start) {
    return str.slice(start).match(new RegExp(".{" + (str.length - start >> 2) + "}", "g")).map(function(substring) {
      return b58dec(substring);
    });
  }
  function getRandomHash(n) {
    return Array(n).fill(0).map(function(_) {
      return alphabet[Math.random() * alphabet.length | 0];
    }).join("");
  }
  function createFxRandom(fxhash, start) {
    return sfc32(matcher(fxhash, start));
  }

  // ../fxhash-params/dist/chunk-FZWZHHQ2.js
  function completeHexColor(hexCode) {
    let hex = hexCode.replace("#", "");
    if (hex.length === 6) {
      hex = `${hex}ff`;
    }
    if (hex.length === 3) {
      hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}ff`;
    }
    return hex;
  }
  var stringToHex = function(s) {
    let rtn = "";
    for (let i = 0; i < s.length; i++) {
      rtn += s.charCodeAt(i).toString(16).padStart(4, "0");
    }
    return rtn;
  };
  var hexToString = function(h) {
    const hx = h.match(/.{1,4}/g) || [];
    let rtn = "";
    for (let i = 0; i < hx.length; i++) {
      const int = parseInt(hx[i], 16);
      if (int === 0)
        break;
      rtn += String.fromCharCode(int);
    }
    return rtn;
  };
  var MIN_SAFE_INT64 = BigInt("-9223372036854775808");
  var MAX_SAFE_INT64 = BigInt("9223372036854775807");
  var ParameterProcessors = {
    number: {
      serialize: (input) => {
        const view = new DataView(new ArrayBuffer(8));
        view.setFloat64(0, input);
        return view.getBigUint64(0).toString(16).padStart(16, "0");
      },
      deserialize: (input) => {
        const view = new DataView(new ArrayBuffer(8));
        for (let i = 0; i < 8; i++) {
          view.setUint8(i, parseInt(input.substring(i * 2, i * 2 + 2), 16));
        }
        return view.getFloat64(0);
      },
      bytesLength: () => 8,
      constrain: (value, definition) => {
        let min = Number.MIN_SAFE_INTEGER;
        if (typeof definition.options?.min !== "undefined")
          min = Number(definition.options.min);
        let max = Number.MAX_SAFE_INTEGER;
        if (typeof definition.options?.max !== "undefined")
          max = Number(definition.options.max);
        max = Math.min(max, Number.MAX_SAFE_INTEGER);
        min = Math.max(min, Number.MIN_SAFE_INTEGER);
        const v = Math.min(Math.max(value, min), max);
        if (definition?.options?.step) {
          const t = 1 / definition?.options?.step;
          return Math.round(v * t) / t;
        }
        return v;
      },
      random: (definition) => {
        let min = Number.MIN_SAFE_INTEGER;
        if (typeof definition.options?.min !== "undefined")
          min = Number(definition.options.min);
        let max = Number.MAX_SAFE_INTEGER;
        if (typeof definition.options?.max !== "undefined")
          max = Number(definition.options.max);
        max = Math.min(max, Number.MAX_SAFE_INTEGER);
        min = Math.max(min, Number.MIN_SAFE_INTEGER);
        const v = Math.random() * (max - min) + min;
        if (definition?.options?.step) {
          const t = 1 / definition?.options?.step;
          return Math.round(v * t) / t;
        }
        return v;
      }
    },
    bigint: {
      serialize: (input) => {
        const view = new DataView(new ArrayBuffer(8));
        view.setBigInt64(0, BigInt(input));
        return view.getBigUint64(0).toString(16).padStart(16, "0");
      },
      deserialize: (input) => {
        const view = new DataView(new ArrayBuffer(8));
        for (let i = 0; i < 8; i++) {
          view.setUint8(i, parseInt(input.substring(i * 2, i * 2 + 2), 16));
        }
        return view.getBigInt64(0);
      },
      bytesLength: () => 8,
      random: (definition) => {
        let min = MIN_SAFE_INT64;
        let max = MAX_SAFE_INT64;
        if (typeof definition.options?.min !== "undefined")
          min = BigInt(definition.options.min);
        if (typeof definition.options?.max !== "undefined")
          max = BigInt(definition.options.max);
        const range = max - min;
        const bits = range.toString(2).length;
        let random;
        do {
          random = BigInt(
            "0b" + Array.from(
              crypto.getRandomValues(new Uint8Array(Math.ceil(bits / 8)))
            ).map((b) => b.toString(2).padStart(8, "0")).join("")
          );
        } while (random > range);
        return random + min;
      }
    },
    boolean: {
      serialize: (input) => {
        return typeof input === "boolean" ? input ? "01" : "00" : typeof input === "string" ? input === "true" ? "01" : "00" : "00";
      },
      deserialize: (input) => {
        return input === "00" ? false : true;
      },
      bytesLength: () => 1,
      random: () => Math.random() < 0.5
    },
    color: {
      serialize: (input) => {
        return completeHexColor(input);
      },
      deserialize: (input) => {
        return input;
      },
      bytesLength: () => 4,
      transform: (input) => {
        const color = completeHexColor(input);
        const r = parseInt(color.slice(0, 2), 16);
        const g = parseInt(color.slice(2, 4), 16);
        const b = parseInt(color.slice(4, 6), 16);
        const a = parseInt(color.slice(6, 8), 16);
        return {
          hex: {
            rgb: "#" + input.slice(0, 6),
            rgba: "#" + input
          },
          obj: {
            rgb: { r, g, b },
            rgba: { r, g, b, a }
          },
          arr: {
            rgb: [r, g, b],
            rgba: [r, g, b, a]
          }
        };
      },
      constrain: (value) => {
        const hex = value.replace("#", "");
        return hex.slice(0, 8).padEnd(8, "f");
      },
      random: () => `${[...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")}`
    },
    string: {
      serialize: (input, def) => {
        if (!def.version) {
          let hex2 = stringToHex(input.substring(0, 64));
          hex2 = hex2.padEnd(64 * 4, "0");
          return hex2;
        }
        let max = 64;
        if (typeof def.options?.maxLength !== "undefined")
          max = Number(def.options.maxLength);
        let hex = stringToHex(input.substring(0, max));
        hex = hex.padEnd(max * 4, "0");
        return hex;
      },
      deserialize: (input) => {
        return hexToString(input);
      },
      bytesLength: (def) => {
        if (!def.version) {
          return 64 * 2;
        }
        if (typeof def.options?.maxLength !== "undefined")
          return Number(def.options.maxLength) * 2;
        return 64 * 2;
      },
      random: (definition) => {
        let min = 0;
        if (typeof definition.options?.minLength !== "undefined")
          min = definition.options.minLength;
        let max = 64;
        if (typeof definition.options?.maxLength !== "undefined")
          max = definition.options.maxLength;
        const length = Math.round(Math.random() * (max - min) + min);
        return [...Array(length)].map((i) => (~~(Math.random() * 36)).toString(36)).join("");
      },
      constrain: (value, definition) => {
        let min = 0;
        if (typeof definition.options?.minLength !== "undefined")
          min = definition.options.minLength;
        let max = 64;
        if (typeof definition.options?.maxLength !== "undefined")
          max = definition.options.maxLength;
        const v = value.slice(0, max);
        if (v.length < min) {
          return v.padEnd(min);
        }
        return v;
      }
    },
    bytes: {
      serialize: (input, def) => {
        return Array.from(input).map((i) => i.toString(16).padStart(2, "0")).join("");
      },
      deserialize: (input, def) => {
        const len = input.length / 2;
        const uint8 = new Uint8Array(len);
        let idx;
        for (let i = 0; i < len; i++) {
          idx = i * 2;
          uint8[i] = parseInt(`${input[idx]}${input[idx + 1]}`, 16);
        }
        return uint8;
      },
      bytesLength: (def) => def.options.length,
      random: (def) => {
        const len = def.options?.length || 0;
        const uint8 = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          uint8[i] = Math.random() * 255 | 0;
        }
        return uint8;
      }
    },
    select: {
      serialize: (input, def) => {
        return Math.min(255, def.options?.options?.indexOf(input) || 0).toString(16).padStart(2, "0");
      },
      deserialize: (input, def) => {
        const idx = parseInt(input, 16);
        return def.options?.options?.[idx] || def.options?.options?.[0] || "";
      },
      bytesLength: () => 1,
      // index between 0 and 255
      constrain: (value, definition) => {
        if (definition.options.options.includes(value)) {
          return value;
        }
        return definition.options.options[0];
      },
      random: (definition) => {
        const index = Math.round(
          Math.random() * (definition.options.options.length - 1) + 0
        );
        return definition?.options?.options[index];
      }
    }
  };
  function serializeParams(params, definition) {
    let bytes = "";
    if (!definition)
      return bytes;
    for (const def of definition) {
      const { id, type } = def;
      const processor = ParameterProcessors[type];
      const v = params[id];
      const val = typeof v !== "undefined" ? v : typeof def.default !== "undefined" ? def.default : processor.random(def);
      const serialized = processor.serialize(val, def);
      bytes += serialized;
    }
    return bytes;
  }
  function deserializeParams(bytes, definition, options) {
    const params = {};
    for (const def of definition) {
      const processor = ParameterProcessors[def.type];
      const transformer = options.withTransform && processor[options.transformType || "transform"];
      if (!bytes) {
        let v;
        if (typeof def.default === "undefined")
          v = processor.random(def);
        else
          v = def.default;
        params[def.id] = transformer ? transformer(v, def) : v;
        continue;
      }
      const bytesLen = processor.bytesLength(def);
      const valueBytes = bytes.substring(0, bytesLen * 2);
      bytes = bytes.substring(bytesLen * 2);
      const val = processor.deserialize(valueBytes, def);
      params[def.id] = transformer ? transformer(val, def) : val;
    }
    return params;
  }
  var processParam = (paramId, value, definitions, transformType) => {
    const definition = definitions.find((d) => d.id === paramId);
    const processor = ParameterProcessors[definition.type];
    const transformer = processor[transformType];
    return transformer?.(value, definition) || value;
  };
  var processParams = (values, definitions, transformType) => {
    const paramValues = {};
    for (const definition of definitions) {
      const processor = ParameterProcessors[definition.type];
      const value = values[definition.id];
      const transformer = processor[transformType];
      paramValues[definition.id] = transformer?.(value, definition) || value;
    }
    return paramValues;
  };

  // src/sdk/index.ts
  function createFxhashSdk(window2, options) {
    const { parent } = window2;
    const search = new URLSearchParams(window2.location.search);
    const fxhash = search.get("fxhash") || "oo" + getRandomHash(49);
    let fxrand = createFxRandom(fxhash, 2);
    const fxminter = search.get("fxminter") || "tz1" + getRandomHash(33);
    let fxrandminter = createFxRandom(fxminter, 3);
    const isFxpreview = search.get("preview") === "1";
    function fxpreview() {
      window2.dispatchEvent(new Event("fxhash-preview"));
      setTimeout(() => fxpreview(), 500);
    }
    const searchParams = window2.location.hash;
    const initialInputBytes = searchParams?.replace("#0x", "");
    const $fx = {
      _version: "3.3.0",
      _processors: ParameterProcessors,
      // where params def & features will be stored
      _params: void 0,
      _features: void 0,
      // where the parameter values are stored
      _paramValues: {},
      _listeners: {},
      _receiveUpdateParams: async function(newRawValues, onDefault) {
        const handlers = await this.propagateEvent("params:update", newRawValues);
        handlers.forEach(([optInDefault, onDone]) => {
          if (!(typeof optInDefault == "boolean" && !optInDefault)) {
            this._updateParams(newRawValues);
            onDefault?.();
          }
          onDone?.(optInDefault, newRawValues);
        });
        if (handlers.length === 0) {
          this._updateParams(newRawValues);
          onDefault?.();
        }
      },
      _updateParams: function(newRawValues) {
        const constrained = processParams(
          { ...this._rawValues, ...newRawValues },
          this._params,
          "constrain"
        );
        Object.keys(constrained).forEach((paramId) => {
          this._rawValues[paramId] = constrained[paramId];
        });
        this._paramValues = processParams(
          this._rawValues,
          this._params,
          "transform"
        );
        this._updateInputBytes();
      },
      _updateInputBytes: function() {
        const bytes = serializeParams(this._rawValues, this._params);
        this.inputBytes = bytes;
      },
      _emitParams: function(newRawValues) {
        const constrainedValues = Object.keys(newRawValues).reduce(
          (acc, paramId) => {
            acc[paramId] = processParam(
              paramId,
              newRawValues[paramId],
              this._params,
              "constrain"
            );
            return acc;
          },
          {}
        );
        this._receiveUpdateParams(constrainedValues, () => {
          parent.postMessage(
            {
              id: "fxhash_emit:params:update",
              data: {
                params: constrainedValues
              }
            },
            "*"
          );
        });
      },
      hash: fxhash,
      rand: fxrand,
      minter: fxminter,
      randminter: fxrandminter,
      iteration: Number(search.get("fxiteration")) || 1,
      context: search.get("fxcontext") || "standalone",
      preview: fxpreview,
      isPreview: isFxpreview,
      params: function(definition) {
        this._params = definition.map((def) => ({ ...def, version: this._version }));
        this._rawValues = deserializeParams(initialInputBytes, this._params, {
          withTransform: true,
          transformType: "constrain"
        });
        this._paramValues = processParams(
          this._rawValues,
          this._params,
          "transform"
        );
        this._updateInputBytes();
      },
      features: function(features) {
        this._features = features;
      },
      getFeature: function(id) {
        return this._features[id];
      },
      getFeatures: function() {
        return this._features;
      },
      getParam: function(id) {
        return this._paramValues[id];
      },
      getParams: function() {
        return this._paramValues;
      },
      getRawParam: function(id) {
        return this._rawValues[id];
      },
      getRawParams: function() {
        return this._rawValues;
      },
      getRandomParam: function(id) {
        const definition = this._params.find((d) => d.id === id);
        const processor = ParameterProcessors[definition.type];
        return processor.random(definition);
      },
      getDefinitions: function() {
        return this._params;
      },
      stringifyParams: function(params) {
        return JSON.stringify(
          params || this._rawValues,
          (key, value) => {
            if (typeof value === "bigint")
              return value.toString();
            return value;
          },
          2
        );
      },
      on: function(name, callback, onDone) {
        if (!this._listeners[name]) {
          this._listeners[name] = [];
        }
        this._listeners[name].push([callback, onDone]);
        return () => {
          const index = this._listeners[name].findIndex(([c]) => c === callback);
          if (index > -1) {
            this._listeners[name].splice(index, 1);
          }
        };
      },
      propagateEvent: async function(name, data) {
        const results = [];
        if (this._listeners?.[name]) {
          for (const [callback, onDone] of this._listeners[name]) {
            const result = callback(data);
            results.push([
              result instanceof Promise ? await result : result,
              onDone
            ]);
          }
        }
        return results;
      },
      emit: function(id, data) {
        switch (id) {
          case "params:update":
            this._emitParams(data);
            break;
          default:
            console.log("$fx.emit called with unknown id:", id);
            break;
        }
      }
    };
    const resetFxRand = () => {
      fxrand = createFxRandom(fxhash, 2);
      $fx.rand = fxrand;
      fxrand.reset = resetFxRand;
    };
    fxrand.reset = resetFxRand;
    const resetFxRandMinter = () => {
      fxrandminter = createFxRandom(fxminter, 3);
      $fx.randminter = fxrandminter;
      fxrandminter.reset = resetFxRandMinter;
    };
    fxrandminter.reset = resetFxRandMinter;
    window2.addEventListener("message", (event) => {
      if (event.data === "fxhash_getInfo") {
        parent.postMessage(
          {
            id: "fxhash_getInfo",
            data: {
              version: window2.$fx._version,
              hash: window2.$fx.hash,
              iteration: window2.$fx.iteration,
              features: window2.$fx.getFeatures(),
              params: {
                definitions: window2.$fx.getDefinitions(),
                values: window2.$fx.getRawParams()
              },
              minter: window2.$fx.minter
            }
          },
          "*"
        );
      }
      if (event.data?.id === "fxhash_params:update") {
        const { params } = event.data.data;
        if (params)
          window2.$fx._receiveUpdateParams(params);
      }
    });
    return $fx;
  }

  // src/index.ts
  window.$fx = createFxhashSdk(window, {});
})();
//# sourceMappingURL=fxhash.js.map