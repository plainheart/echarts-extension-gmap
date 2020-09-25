/* global google */

import { util as zrUtil, graphic, matrix } from 'echarts';

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
  return new graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
};

GMapCoordSysProto.getRoamTransform = function() {
  return matrix.create();
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
      coord: zrUtil.bind(this.dataToPoint, this),
      size: zrUtil.bind(dataToCoordSize, this)
    }
  };
};

function dataToCoordSize(dataSize, dataItem) {
  dataItem = dataItem || [0, 0];
  return zrUtil.map(
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

      var options = zrUtil.clone(gmapModel.get());
      var echartsLayerZIndex = options.echartsLayerZIndex;
      // delete excluded options
      zrUtil.each(excludedOptions, function(key) {
        delete options[key];
      });
      var center = options.center;
      // normalize center
      if (zrUtil.isArray(center)) {
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

export default GMapCoordSys;
