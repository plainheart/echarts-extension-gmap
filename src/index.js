/**
 * Google Map component extension
 */

import GMapCoordSys from './GMapCoordSys'
import GMapModel from './GMapModel'
import GMapView from './GMapView'
import { isNewEC, ecVer, COMPONENT_TYPE } from './helper'

export { version, name } from '../package.json';

/**
 * @typedef {import('../export').EChartsExtensionRegisters} EChartsExtensionRegisters
 */

/**
 * Google Map extension installer
 * @param {EChartsExtensionRegisters} registers
 */
 export function install(registers) {
  // add coordinate system support for pie series for ECharts < 5.4.0
  if (!isNewEC || (ecVer[0] == 5 && ecVer[1] < 4)) {
    registers.registerLayout(function(ecModel) {
      ecModel.eachSeriesByType('pie', function (seriesModel) {
        const coordSys = seriesModel.coordinateSystem
        const data = seriesModel.getData()
        const valueDim = data.mapDimension('value')
        if (coordSys && coordSys.type === COMPONENT_TYPE) {
          const center = seriesModel.get('center')
          const point = coordSys.dataToPoint(center)
          const cx = point[0]
          const cy = point[1]
          data.each(valueDim, function (value, idx) {
            const layout = data.getItemLayout(idx)
            layout.cx = cx
            layout.cy = cy
          })
        }
      })
    })
  }
  // Model
  isNewEC
    ? registers.registerComponentModel(GMapModel)
    : registers.extendComponentModel(GMapModel)
  // View
  isNewEC
    ? registers.registerComponentView(GMapView)
    : registers.extendComponentView(GMapView)
  // Coordinate System
  registers.registerCoordinateSystem(COMPONENT_TYPE, GMapCoordSys)
  // Action
  registers.registerAction(
    {
      type: COMPONENT_TYPE + 'Roam',
      event: COMPONENT_TYPE + 'Roam',
      update: 'updateLayout'
    },
    function(payload, ecModel) {
      ecModel.eachComponent(COMPONENT_TYPE, function(gmapModel) {
        const gmap = gmapModel.getGoogleMap()
        const center = gmap.getCenter()
        gmapModel.setCenterAndZoom([center.lng(), center.lat()], gmap.getZoom())
      })
    }
  )
}
