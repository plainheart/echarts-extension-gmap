/*!
 * echarts-extension-gmap 
 * @version 1.4.0
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

  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var echarts__namespace = /*#__PURE__*/_interopNamespace(echarts);

  var name = "echarts-extension-gmap";
  var version = "1.4.0";

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

  echarts__namespace.extendComponentModel({
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
      // since v1.4.0
      roam: true,
      echartsLayerZIndex: 2000,
      renderOnMoving: true
    }
  });

  /* global google */

  echarts__namespace.extendComponentView({
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

      gmap.setOptions({
        gestureHandling: gmapModel.get('roam') ? 'auto' : 'none'
      });

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
        echarts__namespace.getInstanceByDom(api.getDom()).resize();
      };

      this._oldRenderHandler && this._oldRenderHandler.remove();

      if (!renderOnMoving) {
        renderHandler = echarts__namespace.throttle(renderHandler, 100, true);
        resizeHandler = echarts__namespace.throttle(resizeHandler, 100, true);
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

  echarts__namespace.registerCoordinateSystem('gmap', GMapCoordSys);

  // Action
  echarts__namespace.registerAction(
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
