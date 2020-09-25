(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("echarts"));
	else if(typeof define === 'function' && define.amd)
		define("gmap", ["echarts"], factory);
	else if(typeof exports === 'object')
		exports["gmap"] = factory(require("echarts"));
	else
		root["echarts"] = root["echarts"] || {}, root["echarts"]["gmap"] = factory(root["echarts"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_echarts__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/lodash.debounce/index.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash.debounce/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
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
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

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

module.exports = debounce;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, description, main, scripts, repository, keywords, author, license, bugs, homepage, devDependencies, dependencies, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"echarts-extension-gmap\",\"version\":\"1.2.0\",\"description\":\"An Google Map(https://www.google.com/maps) extension for Apache ECharts (incubating) (https://github.com/apache/incubator-echarts)\",\"main\":\"dist/echarts-extension-gmap.min.js\",\"scripts\":{\"build\":\"webpack --env=production --optimize-minimize --progress --colors\",\"dev\":\"webpack --env=development\",\"watch\":\"webpack --env=development --watch\",\"test\":\"echo \\\"Error: no test specified\\\" && exit 1\"},\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/plainheart/echarts-extension-gmap.git\"},\"keywords\":[\"echarts\",\"google-maps\",\"google\",\"echarts-extention\",\"data-visualization\",\"map\",\"echarts-gmap\",\"echarts-google-map\",\"echarts4\",\"echarts5\",\"gmap\"],\"author\":\"plainheart\",\"license\":\"MIT\",\"bugs\":{\"url\":\"https://github.com/plainheart/echarts-extension-gmap/issues\"},\"homepage\":\"https://github.com/plainheart/echarts-extension-gmap#readme\",\"devDependencies\":{\"webpack\":\"^4.29.5\",\"webpack-cli\":\"^3.2.3\"},\"dependencies\":{\"lodash.debounce\":\"^4.0.8\"}}");

/***/ }),

/***/ "./src/GMapCoordSys.js":
/*!*****************************!*\
  !*** ./src/GMapCoordSys.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! echarts */ "echarts");
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(echarts__WEBPACK_IMPORTED_MODULE_0__);
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
  if (px) {
    var mapOffset = this._mapOffset;
    return [px.x - mapOffset[0], px.y - mapOffset[1]];
  }
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
  return new echarts__WEBPACK_IMPORTED_MODULE_0__["graphic"].BoundingRect(0, 0, api.getWidth(), api.getHeight());
};

GMapCoordSysProto.getRoamTransform = function() {
  return echarts__WEBPACK_IMPORTED_MODULE_0__["matrix"].create();
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
      coord: echarts__WEBPACK_IMPORTED_MODULE_0__["util"].bind(this.dataToPoint, this),
      size: echarts__WEBPACK_IMPORTED_MODULE_0__["util"].bind(dataToCoordSize, this)
    }
  };
};

function dataToCoordSize(dataSize, dataItem) {
  dataItem = dataItem || [0, 0];
  return echarts__WEBPACK_IMPORTED_MODULE_0__["util"].map(
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
      gmapRoot.style.cssText = 'width:100%;height:100%';
      // Not support IE8
      gmapRoot.classList.add('ec-extension-google-map');
      root.appendChild(gmapRoot);

      var options = echarts__WEBPACK_IMPORTED_MODULE_0__["util"].clone(gmapModel.get());
      var echartsLayerZIndex = options.echartsLayerZIndex;
      // delete excluded options
      echarts__WEBPACK_IMPORTED_MODULE_0__["util"].each(excludedOptions, function(key) {
        delete options[key];
      });
      var center = options.center;
      // normalize center
      if (echarts__WEBPACK_IMPORTED_MODULE_0__["util"].isArray(center)) {
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
    return;
  }

  return projection.fromLatLngToContainerPixel(latLng);
}

function pixelToLatLng(pixel, map) {
  var projection = map.__overlayProjection;
  if (!projection) {
    return;
  }

  return projection.fromContainerPixelToLatLng(pixel);
}

/* harmony default export */ __webpack_exports__["default"] = (GMapCoordSys);


/***/ }),

/***/ "./src/GMapModel.js":
/*!**************************!*\
  !*** ./src/GMapModel.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! echarts */ "echarts");
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(echarts__WEBPACK_IMPORTED_MODULE_0__);


function v2Equal(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

/* harmony default export */ __webpack_exports__["default"] = (echarts__WEBPACK_IMPORTED_MODULE_0__["extendComponentModel"]({
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
}));


/***/ }),

/***/ "./src/GMapView.js":
/*!*************************!*\
  !*** ./src/GMapView.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! echarts */ "echarts");
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(echarts__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_debounce__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash.debounce */ "./node_modules/lodash.debounce/index.js");
/* harmony import */ var lodash_debounce__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_debounce__WEBPACK_IMPORTED_MODULE_1__);
/* global google */




/* harmony default export */ __webpack_exports__["default"] = (echarts__WEBPACK_IMPORTED_MODULE_0__["extendComponentView"]({
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
      echarts__WEBPACK_IMPORTED_MODULE_0__["getInstanceByDom"](api.getDom()).resize();
    };

    this._oldRenderHandler && this._oldRenderHandler.remove();

    if (!renderOnMoving) {
      renderHandler = lodash_debounce__WEBPACK_IMPORTED_MODULE_1___default()(renderHandler, 100);
      resizeHandler = lodash_debounce__WEBPACK_IMPORTED_MODULE_1___default()(resizeHandler, 100);
    }

    this._oldRenderHandler = google.maps.event.addListener(gmap, 'gmaprender', renderHandler);

    rendering = false;
  },

  dispose: function(ecModel, api) {
    this._oldRenderHandler && this._oldRenderHandler.remove();
    this._oldRenderHandler = null;

    var component = ecModel.getComponent('gmap');
    var gmapInstance = component.getGoogleMap();

    // remove injected projection
    delete gmapInstance.__overlayProjection;

    // clear all listeners of map instance
    google.maps.event.clearInstanceListeners(gmapInstance);

    // remove DOM of map instance
    var mapDiv = gmapInstance.getDiv();
    mapDiv.parentNode.removeChild(mapDiv);

    component.setGoogleMap(null);
    component.setEChartsLayer(null);
    component.coordinateSystem.setGoogleMap(null);
    component.coordinateSystem = null;
  }
}));


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: version, name */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _package_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../package.json */ "./package.json");
var _package_json__WEBPACK_IMPORTED_MODULE_0___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../package.json */ "./package.json", 1);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "version", function() { return _package_json__WEBPACK_IMPORTED_MODULE_0__["version"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "name", function() { return _package_json__WEBPACK_IMPORTED_MODULE_0__["name"]; });

/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! echarts */ "echarts");
/* harmony import */ var echarts__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(echarts__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _GMapCoordSys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./GMapCoordSys */ "./src/GMapCoordSys.js");
/* harmony import */ var _GMapModel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./GMapModel */ "./src/GMapModel.js");
/* harmony import */ var _GMapView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./GMapView */ "./src/GMapView.js");
/**
 * Google Map component extension
 */









echarts__WEBPACK_IMPORTED_MODULE_1__["registerCoordinateSystem"]('gmap', _GMapCoordSys__WEBPACK_IMPORTED_MODULE_2__["default"]);

// Action
echarts__WEBPACK_IMPORTED_MODULE_1__["registerAction"](
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




/***/ }),

/***/ "echarts":
/*!**************************!*\
  !*** external "echarts" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_echarts__;

/***/ })

/******/ });
});
//# sourceMappingURL=echarts-extension-gmap.js.map