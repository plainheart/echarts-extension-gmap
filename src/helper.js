import { version } from 'echarts/lib/echarts'

export const ecVer = version.split('.')

export const isNewEC = ecVer[0] > 4

export const COMPONENT_TYPE = 'gmap'

export function v2Equal(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1]
}
