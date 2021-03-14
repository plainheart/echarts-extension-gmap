/*!
 * echarts-extension-gmap 
 * @version 1.3.1
 * @author plainheart
 * 
 * MIT License
 * 
 * Copyright (c) 2020 Zhongxiang.Wang
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('echarts')) :
  typeof define === 'function' && define.amd ? define(['exports', 'echarts'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.echarts = global.echarts || {}, global.echarts.gmap = {}), global.echarts));
}(this, (function (exports, echarts) { 'use strict';

  var name = "echarts-extension-gmap";
  var version = "1.3.1";

  /* global google */

  function GMapCoordSys(gmap, api) {
    this._gmap = gmap;
    this.dimensions = ['lng', 'lat'];
    this._mapOffset = [0, 0];
    this._api = api;
  }

  var GMapCoordSysProto = GMapCoordSys.prototype;

  // exclude private and unsupported options
  var excludedOptions = [
    'echartsLayerZIndex',
    'renderOnMoving'
  ];

  GMapCoordSysProto.dimensions = ['lng', 'lat'];

  GMapCoordSysProto.setZoom = function(zoom) {
    this._zoom = zoom;
  };

  GMapCoordSysProto.setCenter = function(center) {
    var latlng = new google.maps.LatLng(center[1], center[0]);
    this._center = latLngToPixel(latlng, this._gmap);
  };

  GMapCoordSysProto.setMapOffset = function(mapOffset) {
    this._mapOffset = mapOffset;
  };

  GMapCoordSysProto.setGoogleMap = function(gmap) {
    this._gmap = gmap;
  };

  GMapCoordSysProto.getGoogleMap = function() {
    return this._gmap;
  };

  GMapCoordSysProto.dataToPoint = function(data) {
    var latlng = new google.maps.LatLng(data[1], data[0]);
    var px = latLngToPixel(latlng, this._gmap);
    var mapOffset = this._mapOffset;
    return [px.x - mapOffset[0], px.y - mapOffset[1]];
  };

  GMapCoordSysProto.pointToData = function(pt) {
    var mapOffset = this._mapOffset;
    var latlng = pixelToLatLng(
      new google.maps.Point(pt[0] + mapOffset[0], pt[1] + mapOffset[1]),
      this._gmap
    );
    return [latlng.lng(), latlng.lat()];
  };

  GMapCoordSysProto.getViewRect = function() {
    var api = this._api;
    return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
  };

  GMapCoordSysProto.getRoamTransform = function() {
    return echarts.matrix.create();
  };

  GMapCoordSysProto.prepareCustoms = function(data) {
    var rect = this.getViewRect();
    return {
      coordSys: {
        // The name exposed to user is always 'cartesian2d' but not 'grid'.
        type: 'gmap',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      api: {
        coord: echarts.util.bind(this.dataToPoint, this),
        size: echarts.util.bind(dataToCoordSize, this)
      }
    };
  };

  function dataToCoordSize(dataSize, dataItem) {
    dataItem = dataItem || [0, 0];
    return echarts.util.map(
      [0, 1],
      function(dimIdx) {
        var val = dataItem[dimIdx];
        var halfSize = dataSize[dimIdx] / 2;
        var p1 = [];
        var p2 = [];
        p1[dimIdx] = val - halfSize;
        p2[dimIdx] = val + halfSize;
        p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
        return Math.abs(
          this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]
        );
      },
      this
    );
  }

  // For deciding which dimensions to use when creating list data
  GMapCoordSys.dimensions = GMapCoordSysProto.dimensions;

  GMapCoordSys.create = function(ecModel, api) {
    var gmapCoordSys;
    var root = api.getDom();

    ecModel.eachComponent('gmap', function(gmapModel) {
      var painter = api.getZr().painter;
      var viewportRoot = painter.getViewportRoot();
      if (typeof google === 'undefined'
        || typeof google.maps === 'undefined'
        || typeof google.maps.Map === 'undefined') {
        throw new Error('It seems that Google Map API has not been loaded completely yet.');
      }
      Overlay = Overlay || createOverlayCtor();
      if (gmapCoordSys) {
        throw new Error('Only one google map component can exist');
      }
      var gmap = gmapModel.getGoogleMap();
      if (!gmap) {
        // Not support IE8
        var gmapRoot = root.querySelector('.ec-extension-google-map');
        if (gmapRoot) {
          // Reset viewport left and top, which will be changed
          // in moving handler in GMapView
          viewportRoot.style.left = '0px';
          viewportRoot.style.top = '0px';
          viewportRoot.style.width = '100%';
          viewportRoot.style.height = '100%';
          root.removeChild(gmapRoot);
        }
        gmapRoot = document.createElement('div');
        gmapRoot.className = 'ec-extension-google-map';
        gmapRoot.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;';
        root.appendChild(gmapRoot);

        var options = echarts.util.clone(gmapModel.get());
        var echartsLayerZIndex = options.echartsLayerZIndex;
        // delete excluded options
        echarts.util.each(excludedOptions, function(key) {
          delete options[key];
        });
        var center = options.center;
        // normalize center
        if (echarts.util.isArray(center)) {
          options.center = {
            lng: center[0],
            lat: center[1]
          };
        }

        gmap = new google.maps.Map(gmapRoot, options);
        gmapModel.setGoogleMap(gmap);

        gmapModel.__projectionChangeListener && gmapModel.__projectionChangeListener.remove();
        gmapModel.__projectionChangeListener = google.maps.event.addListener(gmap, 'projection_changed',
          function() {
            var layer = gmapModel.getEChartsLayer();
            layer && layer.setMap(null);

            var overlay = new Overlay(viewportRoot, gmap);
            overlay.setZIndex(echartsLayerZIndex);
            gmapModel.setEChartsLayer(overlay);
          }
        );

        // Override
        painter.getViewportRootOffset = function() {
          return { offsetLeft: 0, offsetTop: 0 };
        };
      }

      var center = gmapModel.get('center');
      var normalizedCenter = [
        center.lng != null ? center.lng : center[0],
        center.lat != null ? center.lat : center[1]
      ];
      var zoom = gmapModel.get('zoom');
      if (center && zoom) {
        var gmapCenter = gmap.getCenter();
        var gmapZoom = gmap.getZoom();
        var centerOrZoomChanged = gmapModel.centerOrZoomChanged([gmapCenter.lng(), gmapCenter.lat()], gmapZoom);
        if (centerOrZoomChanged) {
          var pt = new google.maps.LatLng(normalizedCenter[1], normalizedCenter[0]);
          gmap.setOptions({
            center: pt,
            zoom: zoom
          });
        }
      }

      gmapCoordSys = new GMapCoordSys(gmap, api);
      gmapCoordSys.setMapOffset(gmapModel.__mapOffset || [0, 0]);
      gmapCoordSys.setZoom(zoom);
      gmapCoordSys.setCenter(normalizedCenter);

      gmapModel.coordinateSystem = gmapCoordSys;
    });

    ecModel.eachSeries(function(seriesModel) {
      if (seriesModel.get('coordinateSystem') === 'gmap') {
        seriesModel.coordinateSystem = gmapCoordSys;
      }
    });
  };

  var Overlay;

  function createOverlayCtor() {
      function Overlay(root, gmap) {
        this._root = root;
        this.setMap(gmap);
      }

      Overlay.prototype = new google.maps.OverlayView();

      Overlay.prototype.onAdd = function() {
        var gmap = this.getMap();
        gmap.__overlayProjection = this.getProjection();
        gmap.getDiv().querySelector('.gm-style > div').appendChild(this._root);
      };

      /**
       * @override
       */
      Overlay.prototype.draw = function() {
        google.maps.event.trigger(this.getMap(), 'gmaprender');
      };

      Overlay.prototype.onRemove = function() {
        this._root.parentNode.removeChild(this._root);
        this._root = null;
      };

      Overlay.prototype.setZIndex = function(zIndex) {
        this._root.style.zIndex = zIndex;
      };

      Overlay.prototype.getZIndex = function() {
        return this._root.style.zIndex;
      };

      return Overlay;
  }

  function latLngToPixel(latLng, map) {
    var projection = map.__overlayProjection;
    if (!projection) {
      return new google.maps.Point(-Infinity, -Infinity);
    }

    return projection.fromLatLngToContainerPixel(latLng);
  }

  function pixelToLatLng(pixel, map) {
    var projection = map.__overlayProjection;
    if (!projection) {
      return new google.maps.Point(-Infinity, -Infinity);
    }

    return projection.fromContainerPixelToLatLng(pixel);
  }

  function v2Equal(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }

  echarts.extendComponentModel({
    type: 'gmap',

    setGoogleMap: function(gmap) {
      this.__gmap = gmap;
    },

    getGoogleMap: function() {
      // __gmap is set when creating GMapCoordSys
      return this.__gmap;
    },

    setEChartsLayer: function(layer) {
      this.__echartsLayer = layer;
    },

    getEChartsLayer: function() {
      return this.__echartsLayer;
    },

    setCenterAndZoom: function(center, zoom) {
      this.option.center = center;
      this.option.zoom = zoom;
    },

    centerOrZoomChanged: function(center, zoom) {
      var option = this.option;
      return !(v2Equal(center, option.center) && zoom === option.zoom);
    },

    defaultOption: {
      center: { lat: 39.90923, lng: 116.397428 },
      zoom: 5,

      // extension options
      echartsLayerZIndex: 2000,
      renderOnMoving: true
    }
  });

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now = function() {
    return root.Date.now();
  };

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          result = wait - timeSinceLastCall;

      return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var lodash_debounce = debounce;

  /* global google */

  echarts.extendComponentView({
    type: 'gmap',

    render: function(gmapModel, ecModel, api) {
      var rendering = true;

      var gmap = gmapModel.getGoogleMap();
      var viewportRoot = api.getZr().painter.getViewportRoot();
      var coordSys = gmapModel.coordinateSystem;
      var offsetEl = gmap.getDiv();
      var renderOnMoving = gmapModel.get('renderOnMoving');
      var oldWidth = offsetEl.clientWidth;
      var oldHeight = offsetEl.clientHeight;

      var renderHandler = function() {
        if (rendering) {
          return;
        }

        // need resize?
        var width = offsetEl.clientWidth;
        var height = offsetEl.clientHeight;
        if (width !== oldWidth || height !== oldHeight) {
          return resizeHandler.call(this);
        }

        var mapOffset = [
          -parseInt(offsetEl.style.left, 10) || 0,
          -parseInt(offsetEl.style.top, 10) || 0
        ];
        viewportRoot.style.left = mapOffset[0] + 'px';
        viewportRoot.style.top = mapOffset[1] + 'px';

        coordSys.setMapOffset(mapOffset);
        gmapModel.__mapOffset = mapOffset;

        api.dispatchAction({
          type: 'gmapRoam',
          animation: {
            // in ECharts 5.x,
            // we can set animation duration as 0
            // to ensure no delay when moving or zooming
            duration: 0
          }
        });
      };

      var resizeHandler = function() {
        echarts.getInstanceByDom(api.getDom()).resize();
      };

      this._oldRenderHandler && this._oldRenderHandler.remove();

      if (!renderOnMoving) {
        renderHandler = lodash_debounce(renderHandler, 100);
        resizeHandler = lodash_debounce(resizeHandler, 100);
      }

      this._oldRenderHandler = google.maps.event.addListener(gmap, 'gmaprender', renderHandler);

      rendering = false;
    },

    dispose: function(ecModel, api) {
      this._oldRenderHandler && this._oldRenderHandler.remove();
      this._oldRenderHandler = null;

      var component = ecModel.getComponent('gmap');
      if (!component) {
        return;
      }

      var gmapInstance = component.getGoogleMap();

      if (gmapInstance) {
        // remove injected projection
        delete gmapInstance.__overlayProjection;

        // clear all listeners of map instance
        google.maps.event.clearInstanceListeners(gmapInstance);

        // remove DOM of map instance
        var mapDiv = gmapInstance.getDiv();
        mapDiv.parentNode && mapDiv.parentNode.removeChild(mapDiv);
      }

      component.setGoogleMap(null);
      component.setEChartsLayer(null);

      if (component.coordinateSystem) {
        component.coordinateSystem.setGoogleMap(null);
        component.coordinateSystem = null;
      }
    }
  });

  /**
   * Google Map component extension
   */

  echarts.registerCoordinateSystem('gmap', GMapCoordSys);

  // Action
  echarts.registerAction(
    {
      type: 'gmapRoam',
      event: 'gmapRoam',
      update: 'updateLayout'
    },
    function(payload, ecModel) {
      ecModel.eachComponent('gmap', function(gmapModel) {
        var gmap = gmapModel.getGoogleMap();
        var center = gmap.getCenter();
        gmapModel.setCenterAndZoom([center.lng(), center.lat()], gmap.getZoom());
      });
    }
  );

  exports.name = name;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=echarts-extension-gmap.js.map
