import { ComponentModel } from 'echarts/lib/echarts'
import { COMPONENT_TYPE, isNewEC, v2Equal } from './helper'

const GMapModel = {
  type: COMPONENT_TYPE,

  setGoogleMap(gmap) {
    this.__gmap = gmap
  },

  getGoogleMap() {
    // __gmap is set when creating GMapCoordSys
    return this.__gmap
  },

  setEChartsLayer(layer) {
    this.__echartsLayer = layer
  },

  getEChartsLayer() {
    return this.__echartsLayer
  },

  setCenterAndZoom(center, zoom) {
    this.option.center = center
    this.option.zoom = zoom
  },

  centerOrZoomChanged(center, zoom) {
    const option = this.option
    return !(v2Equal(center, option.center) && zoom === option.zoom)
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
}

export default isNewEC
  ? ComponentModel.extend(GMapModel)
  : GMapModel
