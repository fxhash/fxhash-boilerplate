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
      console.log("FXPREVIEW");
    }
    const searchParams = window2.location.hash;
    const initialInputBytes = searchParams?.replace("#0x", "");
    const getParamValue = (param, def, processor) => {
      if (typeof param !== "undefined")
        return param;
      if (typeof def.default !== "undefined")
        return def.default;
      return processor.random(def);
    };
    const serializeParams = (params, definition) => {
      let hexString = "";
      if (!definition)
        return hexString;
      for (const def of definition) {
        const { id, type } = def;
        const processor = (void 0)[type];
        const paramValue = getParamValue(params[id], def, processor);
        const serializedParam = processor.serialize(paramValue, def);
        hexString += serializedParam;
      }
      return hexString;
    };
    const deserializeParams = (bytes, definition) => {
      const params = {};
      for (const def of definition) {
        const processor = (void 0)[def.type];
        if (!bytes) {
          let v;
          if (typeof def.default === "undefined")
            v = processor.random(def);
          else
            v = def.default;
          params[def.id] = processor.constrain?.(v, def) || v;
          continue;
        }
        const valueBytes = bytes.substring(
          0,
          processor.bytesLength(def?.options) * 2
        );
        bytes = bytes.substring(processor.bytesLength(def?.options) * 2);
        const value = processor.deserialize(valueBytes, def);
        params[def.id] = processor.constrain?.(value, def) || value;
      }
      return params;
    };
    const processParam = (paramId, value, definitions, transformer) => {
      const definition = definitions.find((d) => d.id === paramId);
      const processor = (void 0)[definition.type];
      return processor[transformer]?.(value, definition) || value;
    };
    const processParams = (values, definitions, transformer) => {
      const paramValues = {};
      for (const definition of definitions) {
        const processor = (void 0)[definition.type];
        const value = values[definition.id];
        paramValues[definition.id] = processor[transformer]?.(value, definition) || value;
      }
      return paramValues;
    };
    const $fx = {
      _version: "3.3.0",
      _processors: void 0,
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
        this._params = definition;
        this._rawValues = deserializeParams(initialInputBytes, definition);
        this._paramValues = processParams(this._rawValues, definition, "transform");
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
        const processor = (void 0)[definition.type];
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

  // src/browser.ts
  if (typeof window !== "undefined") {
    ;
    window.$fx = createFxhashSdk(window, {});
  }
})();
//# sourceMappingURL=browser.global.js.map