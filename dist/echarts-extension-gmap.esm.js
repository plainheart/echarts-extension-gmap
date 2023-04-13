/*!
 * echarts-extension-gmap 
 * @version 1.5.0
 * @author plainheart
 * 
 * MIT License
 * 
 * Copyright (c) 2020-2022 Zhongxiang Wang
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
import * as echarts from 'echarts/lib/echarts';
import { version as version$1, graphic, matrix, util, ComponentModel, ComponentView, throttle, getInstanceByDom } from 'echarts/lib/echarts';

var ecVer = version$1.split('.');
var isNewEC = ecVer[0] > 4;
var COMPONENT_TYPE = 'gmap';
function v2Equal(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

/* global google */
function dataToCoordSize(dataSize, dataItem) {
  dataItem = dataItem || [0, 0];
  return util.map([0, 1], function (dimIdx) {
    var val = dataItem[dimIdx];
    var halfSize = dataSize[dimIdx] / 2;
    var p1 = [];
    var p2 = [];
    p1[dimIdx] = val - halfSize;
    p2[dimIdx] = val + halfSize;
    p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
    return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
  }, this);
}
function GMapCoordSys(gmap, api) {
  this._gmap = gmap;
  this.dimensions = ['lng', 'lat'];
  this._mapOffset = [0, 0];
  this._api = api;
}
var GMapCoordSysProto = GMapCoordSys.prototype;

// exclude private and unsupported options
var excludedOptions = ['echartsLayerZIndex', 'renderOnMoving'];
GMapCoordSysProto.setZoom = function (zoom) {
  this._zoom = zoom;
};
GMapCoordSysProto.setCenter = function (center) {
  var latlng = new google.maps.LatLng(center[1], center[0]);
  this._center = latLngToPixel(latlng, this._gmap);
};
GMapCoordSysProto.setMapOffset = function (mapOffset) {
  this._mapOffset = mapOffset;
};
GMapCoordSysProto.setGoogleMap = function (gmap) {
  this._gmap = gmap;
};
GMapCoordSysProto.getGoogleMap = function () {
  return this._gmap;
};
GMapCoordSysProto.dataToPoint = function (data) {
  var latlng = new google.maps.LatLng(data[1], data[0]);
  var px = latLngToPixel(latlng, this._gmap);
  var mapOffset = this._mapOffset;
  return [px.x - mapOffset[0], px.y - mapOffset[1]];
};
GMapCoordSysProto.pointToData = function (pt) {
  var mapOffset = this._mapOffset;
  var latlng = pixelToLatLng(new google.maps.Point(pt[0] + mapOffset[0], pt[1] + mapOffset[1]), this._gmap);
  return [latlng.lng(), latlng.lat()];
};
GMapCoordSysProto.getViewRect = function () {
  var api = this._api;
  return new graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
};
GMapCoordSysProto.getRoamTransform = function () {
  return matrix.create();
};
GMapCoordSysProto.prepareCustoms = function () {
  var rect = this.getViewRect();
  return {
    coordSys: {
      type: COMPONENT_TYPE,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    api: {
      coord: util.bind(this.dataToPoint, this),
      size: util.bind(dataToCoordSize, this)
    }
  };
};
GMapCoordSysProto.convertToPixel = function (ecModel, finder, value) {
  // here we don't use finder as only one google map component is allowed
  return this.dataToPoint(value);
};
GMapCoordSysProto.convertFromPixel = function (ecModel, finder, value) {
  // here we don't use finder as only one google map component is allowed
  return this.pointToData(value);
};
GMapCoordSys.create = function (ecModel, api) {
  var gmapCoordSys;
  var root = api.getDom();
  ecModel.eachComponent(COMPONENT_TYPE, function (gmapModel) {
    var painter = api.getZr().painter;
    var viewportRoot = painter.getViewportRoot();
    if (typeof google === 'undefined' || !google.maps || !google.maps.Map) {
      throw new Error('Google Map API is not loaded');
    }
    Overlay = Overlay || createOverlayCtor();
    if (gmapCoordSys) {
      throw new Error('Only one google map component is allowed');
    }
    var gmap = gmapModel.getGoogleMap();
    if (!gmap) {
      // Not support IE8
      var className = 'ec-extension-google-map';
      var gmapRoot = root.querySelector('.' + className);
      if (gmapRoot) {
        // Reset viewport left and top, which will be changed
        // in moving handler in GMapView
        viewportRoot.style.left = '0';
        viewportRoot.style.top = '0';
        root.removeChild(gmapRoot);
      }
      gmapRoot = document.createElement('div');
      gmapRoot.className = className;
      gmapRoot.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0';
      root.appendChild(gmapRoot);
      var options = util.clone(gmapModel.get());
      var echartsLayerZIndex = options.echartsLayerZIndex;
      // delete excluded options
      util.each(excludedOptions, function (key) {
        delete options[key];
      });
      var _center = options.center;
      // normalize center
      if (util.isArray(_center)) {
        options.center = {
          lng: _center[0],
          lat: _center[1]
        };
      }
      gmap = new google.maps.Map(gmapRoot, options);
      gmapModel.setGoogleMap(gmap);
      gmapModel.__projectionChangeListener && gmapModel.__projectionChangeListener.remove();
      gmapModel.__projectionChangeListener = google.maps.event.addListener(gmap, 'projection_changed', function () {
        var layer = gmapModel.getEChartsLayer();
        layer && layer.setMap(null);
        var overlay = new Overlay(viewportRoot, gmap);
        overlay.setZIndex(echartsLayerZIndex);
        gmapModel.setEChartsLayer(overlay);
      });

      // Override
      painter.getViewportRootOffset = function () {
        return {
          offsetLeft: 0,
          offsetTop: 0
        };
      };
    }
    var center = gmapModel.get('center');
    var normalizedCenter = [center.lng != null ? center.lng : center[0], center.lat != null ? center.lat : center[1]];
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
  ecModel.eachSeries(function (seriesModel) {
    if (seriesModel.get('coordinateSystem') === COMPONENT_TYPE) {
      seriesModel.coordinateSystem = gmapCoordSys;
    }
  });

  // return created coordinate systems
  return gmapCoordSys && [gmapCoordSys];
};
var Overlay;
function createOverlayCtor() {
  function Overlay(root, gmap) {
    this._root = root;
    this.setMap(gmap);
  }
  Overlay.prototype = new google.maps.OverlayView();
  Overlay.prototype.onAdd = function () {
    var gmap = this.getMap();
    gmap.__overlayProjection = this.getProjection();
    gmap.getDiv().querySelector('.gm-style > div').appendChild(this._root);
  };

  /**
   * @override
   */
  Overlay.prototype.draw = function () {
    google.maps.event.trigger(this.getMap(), 'gmaprender');
  };
  Overlay.prototype.onRemove = function () {
    this._root.parentNode.removeChild(this._root);
    this._root = null;
  };
  Overlay.prototype.setZIndex = function (zIndex) {
    this._root.style.zIndex = zIndex;
  };
  Overlay.prototype.getZIndex = function () {
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
GMapCoordSysProto.dimensions = GMapCoordSys.dimensions = ['lng', 'lat'];
GMapCoordSysProto.type = COMPONENT_TYPE;

var GMapModel = {
  type: COMPONENT_TYPE,
  setGoogleMap: function setGoogleMap(gmap) {
    this.__gmap = gmap;
  },
  getGoogleMap: function getGoogleMap() {
    // __gmap is set when creating GMapCoordSys
    return this.__gmap;
  },
  setEChartsLayer: function setEChartsLayer(layer) {
    this.__echartsLayer = layer;
  },
  getEChartsLayer: function getEChartsLayer() {
    return this.__echartsLayer;
  },
  setCenterAndZoom: function setCenterAndZoom(center, zoom) {
    this.option.center = center;
    this.option.zoom = zoom;
  },
  centerOrZoomChanged: function centerOrZoomChanged(center, zoom) {
    var option = this.option;
    return !(v2Equal(center, option.center) && zoom === option.zoom);
  },
  defaultOption: {
    center: {
      lat: 39.90923,
      lng: 116.397428
    },
    zoom: 5,
    // extension options
    // since v1.4.0
    roam: true,
    echartsLayerZIndex: 2000,
    renderOnMoving: true
  }
};
var GMapModel$1 = isNewEC ? ComponentModel.extend(GMapModel) : GMapModel;

/* global google */
var GMapView = {
  type: COMPONENT_TYPE,
  render: function render(gmapModel, ecModel, api) {
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
    var renderHandler = function renderHandler() {
      if (rendering) {
        return;
      }

      // need resize?
      var width = offsetEl.clientWidth;
      var height = offsetEl.clientHeight;
      if (width !== oldWidth || height !== oldHeight) {
        return resizeHandler.call(this);
      }
      var mapOffset = [-parseInt(offsetEl.style.left, 10) || 0, -parseInt(offsetEl.style.top, 10) || 0];
      viewportRoot.style.left = mapOffset[0] + 'px';
      viewportRoot.style.top = mapOffset[1] + 'px';
      coordSys.setMapOffset(mapOffset);
      gmapModel.__mapOffset = mapOffset;
      api.dispatchAction({
        type: COMPONENT_TYPE + 'Roam',
        animation: {
          // in ECharts 5.x,
          // we can set animation duration as 0
          // to ensure no delay when moving or zooming
          duration: 0
        }
      });
    };
    var resizeHandler = function resizeHandler() {
      var width = offsetEl.firstChild.clientWidth;
      var height = offsetEl.firstChild.clientHeight;
      getInstanceByDom(api.getDom()).resize({
        width: width,
        height: height
      });
    };
    this._oldRenderHandler && this._oldRenderHandler.remove();
    if (!renderOnMoving) {
      // TODO hide layer when moving
      renderHandler = throttle(renderHandler, 100, true);
      resizeHandler = throttle(resizeHandler, 100, true);
    }
    this._oldRenderHandler = google.maps.event.addListener(gmap, 'gmaprender', renderHandler);
    rendering = false;
  },
  dispose: function dispose() {
    this._oldRenderHandler && this._oldRenderHandler.remove();
    this._oldRenderHandler = null;
    var component = this.__model;
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
};
var GMapView$1 = isNewEC ? ComponentView.extend(GMapView) : GMapView;

var name = "echarts-extension-gmap";
var version = "1.5.0";

/**
 * Google Map component extension
 */

/**
 * @typedef {import('../export').EChartsExtensionRegisters} EChartsExtensionRegisters
 */

/**
 * Google Map extension installer
 * @param {EChartsExtensionRegisters} registers
 */
function install(registers) {
  // add coordinate system support for pie series for ECharts < 5.4.0
  if (!isNewEC || ecVer[0] == 5 && ecVer[1] < 4) {
    registers.registerLayout(function (ecModel) {
      ecModel.eachSeriesByType('pie', function (seriesModel) {
        var coordSys = seriesModel.coordinateSystem;
        var data = seriesModel.getData();
        var valueDim = data.mapDimension('value');
        if (coordSys && coordSys.type === COMPONENT_TYPE) {
          var center = seriesModel.get('center');
          var point = coordSys.dataToPoint(center);
          var cx = point[0];
          var cy = point[1];
          data.each(valueDim, function (value, idx) {
            var layout = data.getItemLayout(idx);
            layout.cx = cx;
            layout.cy = cy;
          });
        }
      });
    });
  }
  // Model
  isNewEC ? registers.registerComponentModel(GMapModel$1) : registers.extendComponentModel(GMapModel$1);
  // View
  isNewEC ? registers.registerComponentView(GMapView$1) : registers.extendComponentView(GMapView$1);
  // Coordinate System
  registers.registerCoordinateSystem(COMPONENT_TYPE, GMapCoordSys);
  // Action
  registers.registerAction({
    type: COMPONENT_TYPE + 'Roam',
    event: COMPONENT_TYPE + 'Roam',
    update: 'updateLayout'
  }, function (payload, ecModel) {
    ecModel.eachComponent(COMPONENT_TYPE, function (gmapModel) {
      var gmap = gmapModel.getGoogleMap();
      var center = gmap.getCenter();
      gmapModel.setCenterAndZoom([center.lng(), center.lat()], gmap.getZoom());
    });
  });
}

isNewEC ? echarts.use(install) : install(echarts);

export { name, version };
