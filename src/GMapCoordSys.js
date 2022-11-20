/* global google */

import { util as zrUtil, graphic, matrix } from 'echarts/lib/echarts'
import { COMPONENT_TYPE } from './helper'

function GMapCoordSys(gmap, api) {
  this._gmap = gmap
  this.dimensions = ['lng', 'lat']
  this._mapOffset = [0, 0]
  this._api = api
}

const GMapCoordSysProto = GMapCoordSys.prototype

// exclude private and unsupported options
const excludedOptions = [
  'echartsLayerZIndex',
  'renderOnMoving'
]

GMapCoordSysProto.setZoom = function(zoom) {
  this._zoom = zoom
}

GMapCoordSysProto.setCenter = function(center) {
  const latlng = new google.maps.LatLng(center[1], center[0])
  this._center = latLngToPixel(latlng, this._gmap)
}

GMapCoordSysProto.setMapOffset = function(mapOffset) {
  this._mapOffset = mapOffset
}

GMapCoordSysProto.setGoogleMap = function(gmap) {
  this._gmap = gmap
}

GMapCoordSysProto.getGoogleMap = function() {
  return this._gmap
}

GMapCoordSysProto.dataToPoint = function(data) {
  const latlng = new google.maps.LatLng(data[1], data[0])
  const px = latLngToPixel(latlng, this._gmap)
  const mapOffset = this._mapOffset
  return [px.x - mapOffset[0], px.y - mapOffset[1]]
}

GMapCoordSysProto.pointToData = function(pt) {
  const mapOffset = this._mapOffset
  const latlng = pixelToLatLng(
    new google.maps.Point(pt[0] + mapOffset[0], pt[1] + mapOffset[1]),
    this._gmap
  )
  return [latlng.lng(), latlng.lat()]
}

GMapCoordSysProto.getViewRect = function() {
  const api = this._api
  return new graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
}

GMapCoordSysProto.getRoamTransform = function() {
  return matrix.create()
}

GMapCoordSysProto.prepareCustoms = function() {
  const rect = this.getViewRect()
  return {
    coordSys: {
      type: COMPONENT_TYPE,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    },
    api: {
      coord: zrUtil.bind(this.dataToPoint, this),
      size: zrUtil.bind(dataToCoordSize, this)
    }
  }
}

function dataToCoordSize(dataSize, dataItem) {
  dataItem = dataItem || [0, 0]
  return zrUtil.map(
    [0, 1],
    function(dimIdx) {
      const val = dataItem[dimIdx]
      const halfSize = dataSize[dimIdx] / 2
      const p1 = []
      const p2 = []
      p1[dimIdx] = val - halfSize
      p2[dimIdx] = val + halfSize
      p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx]
      return Math.abs(
        this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]
      )
    },
    this
  )
}

// For deciding which dimensions to use when creating list data
GMapCoordSys.dimensions = GMapCoordSysProto.dimensions

GMapCoordSys.create = function(ecModel, api) {
  let gmapCoordSys
  const root = api.getDom()

  ecModel.eachComponent(COMPONENT_TYPE, function(gmapModel) {
    const painter = api.getZr().painter
    const viewportRoot = painter.getViewportRoot()
    if (typeof google === 'undefined' || !google.maps || !google.maps.Map) {
      throw new Error('Google Map API is not loaded')
    }
    Overlay = Overlay || createOverlayCtor()
    if (gmapCoordSys) {
      throw new Error('Only one google map component is allowed')
    }
    let gmap = gmapModel.getGoogleMap()
    if (!gmap) {
      // Not support IE8
      const className = 'ec-extension-google-map'
      let gmapRoot = root.querySelector('.' + className)
      if (gmapRoot) {
        // Reset viewport left and top, which will be changed
        // in moving handler in GMapView
        viewportRoot.style.left = '0'
        viewportRoot.style.top = '0'
        root.removeChild(gmapRoot)
      }
      gmapRoot = document.createElement('div')
      gmapRoot.className = className
      gmapRoot.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0'
      root.appendChild(gmapRoot)

      const options = zrUtil.clone(gmapModel.get())
      const echartsLayerZIndex = options.echartsLayerZIndex
      // delete excluded options
      zrUtil.each(excludedOptions, function(key) {
        delete options[key]
      })
      const center = options.center
      // normalize center
      if (zrUtil.isArray(center)) {
        options.center = {
          lng: center[0],
          lat: center[1]
        }
      }

      gmap = new google.maps.Map(gmapRoot, options)
      gmapModel.setGoogleMap(gmap)

      gmapModel.__projectionChangeListener && gmapModel.__projectionChangeListener.remove()
      gmapModel.__projectionChangeListener = google.maps.event.addListener(gmap, 'projection_changed',
        function() {
          const layer = gmapModel.getEChartsLayer()
          layer && layer.setMap(null)

          const overlay = new Overlay(viewportRoot, gmap)
          overlay.setZIndex(echartsLayerZIndex)
          gmapModel.setEChartsLayer(overlay)
        }
      )

      // Override
      painter.getViewportRootOffset = function() {
        return { offsetLeft: 0, offsetTop: 0 }
      }
    }

    const center = gmapModel.get('center')
    const normalizedCenter = [
      center.lng != null ? center.lng : center[0],
      center.lat != null ? center.lat : center[1]
    ]
    const zoom = gmapModel.get('zoom')
    if (center && zoom) {
      const gmapCenter = gmap.getCenter()
      const gmapZoom = gmap.getZoom()
      const centerOrZoomChanged = gmapModel.centerOrZoomChanged([gmapCenter.lng(), gmapCenter.lat()], gmapZoom)
      if (centerOrZoomChanged) {
        const pt = new google.maps.LatLng(normalizedCenter[1], normalizedCenter[0])
        gmap.setOptions({
          center: pt,
          zoom: zoom
        })
      }
    }

    gmapCoordSys = new GMapCoordSys(gmap, api)
    gmapCoordSys.setMapOffset(gmapModel.__mapOffset || [0, 0])
    gmapCoordSys.setZoom(zoom)
    gmapCoordSys.setCenter(normalizedCenter)

    gmapModel.coordinateSystem = gmapCoordSys
  })

  ecModel.eachSeries(function(seriesModel) {
    if (seriesModel.get('coordinateSystem') === COMPONENT_TYPE) {
      seriesModel.coordinateSystem = gmapCoordSys
    }
  })
}

let Overlay

function createOverlayCtor() {
    function Overlay(root, gmap) {
      this._root = root
      this.setMap(gmap)
    }

    Overlay.prototype = new google.maps.OverlayView()

    Overlay.prototype.onAdd = function() {
      const gmap = this.getMap()
      gmap.__overlayProjection = this.getProjection()
      gmap.getDiv().querySelector('.gm-style > div').appendChild(this._root)
    }

    /**
     * @override
     */
    Overlay.prototype.draw = function() {
      google.maps.event.trigger(this.getMap(), 'gmaprender')
    }

    Overlay.prototype.onRemove = function() {
      this._root.parentNode.removeChild(this._root)
      this._root = null
    }

    Overlay.prototype.setZIndex = function(zIndex) {
      this._root.style.zIndex = zIndex
    }

    Overlay.prototype.getZIndex = function() {
      return this._root.style.zIndex
    }

    return Overlay
}

function latLngToPixel(latLng, map) {
  const projection = map.__overlayProjection
  if (!projection) {
    return new google.maps.Point(-Infinity, -Infinity)
  }

  return projection.fromLatLngToContainerPixel(latLng)
}

function pixelToLatLng(pixel, map) {
  const projection = map.__overlayProjection
  if (!projection) {
    return new google.maps.Point(-Infinity, -Infinity)
  }

  return projection.fromContainerPixelToLatLng(pixel)
}

GMapCoordSysProto.dimensions = GMapCoordSys.dimensions = ['lng', 'lat']

GMapCoordSysProto.type = COMPONENT_TYPE

export default GMapCoordSys
