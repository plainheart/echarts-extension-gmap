import * as echarts from 'echarts/lib/echarts'
import { install } from './src/index'
import { isNewEC } from './src/helper'

isNewEC ? echarts.use(install) : install(echarts)

export { name, version } from './src/index'
