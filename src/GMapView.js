/* global google */

import { ComponentView, getInstanceByDom, throttle } from 'echarts/lib/echarts'
import { isNewEC, COMPONENT_TYPE } from './helper'

const GMapView = {
  type: COMPONENT_TYPE,

  render(gmapModel, ecModel, api) {
    let rendering = true

    const gmap = gmapModel.getGoogleMap()
    const viewportRoot = api.getZr().painter.getViewportRoot()
    const coordSys = gmapModel.coordinateSystem
    const offsetEl = gmap.getDiv()
    const renderOnMoving = gmapModel.get('renderOnMoving')
    const oldWidth = offsetEl.clientWidth
    const oldHeight = offsetEl.clientHeight

    gmap.setOptions({
      gestureHandling: gmapModel.get('roam') ? 'auto' : 'none'
    })

    let renderHandler = function() {
      if (rendering) {
        return
      }

      // need resize?
      const width = offsetEl.clientWidth
      const height = offsetEl.clientHeight
      if (width !== oldWidth || height !== oldHeight) {
        return resizeHandler.call(this)
      }

      const mapOffset = [
        -parseInt(offsetEl.style.left, 10) || 0,
        -parseInt(offsetEl.style.top, 10) || 0
      ]
      viewportRoot.style.left = mapOffset[0] + 'px'
      viewportRoot.style.top = mapOffset[1] + 'px'

      coordSys.setMapOffset(mapOffset)
      gmapModel.__mapOffset = mapOffset

      api.dispatchAction({
        type: COMPONENT_TYPE + 'Roam',
        animation: {
          // in ECharts 5.x,
          // we can set animation duration as 0
          // to ensure no delay when moving or zooming
          duration: 0
        }
      })
    }

    let resizeHandler = function() {
      const width = offsetEl.firstChild.clientWidth
      const height = offsetEl.firstChild.clientHeight
      getInstanceByDom(api.getDom()).resize({ width, height })
    }

    this._oldRenderHandler && this._oldRenderHandler.remove()

    if (!renderOnMoving) {
      // TODO hide layer when moving
      renderHandler = throttle(renderHandler, 100, true)
      resizeHandler = throttle(resizeHandler, 100, true)
    }

    this._oldRenderHandler = google.maps.event.addListener(gmap, 'gmaprender', renderHandler)

    rendering = false
  },

  dispose() {
    this._oldRenderHandler && this._oldRenderHandler.remove()
    this._oldRenderHandler = null

    const component = this.__model
    if (!component) {
      return
    }

    const gmapInstance = component.getGoogleMap()

    if (gmapInstance) {
      // remove injected projection
      delete gmapInstance.__overlayProjection

      // clear all listeners of map instance
      google.maps.event.clearInstanceListeners(gmapInstance)

      // remove DOM of map instance
      const mapDiv = gmapInstance.getDiv()
      mapDiv.parentNode && mapDiv.parentNode.removeChild(mapDiv)
    }

    component.setGoogleMap(null)
    component.setEChartsLayer(null)

    if (component.coordinateSystem) {
      component.coordinateSystem.setGoogleMap(null)
      component.coordinateSystem = null
    }
  }
}

export default isNewEC
  ? ComponentView.extend(GMapView)
  : GMapView
