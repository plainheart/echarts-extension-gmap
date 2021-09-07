import * as echarts from 'echarts';

function v2Equal(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

export default echarts.extendComponentModel({
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
