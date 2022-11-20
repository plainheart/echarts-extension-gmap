[![NPM version](https://img.shields.io/npm/v/echarts-extension-gmap.svg?style=flat)](https://www.npmjs.org/package/echarts-extension-gmap)
[![Build Status](https://github.com/plainheart/echarts-extension-gmap/actions/workflows/build.yml/badge.svg)](https://github.com/plainheart/echarts-extension-gmap/actions/workflows/build.yml)
[![NPM Downloads](https://img.shields.io/npm/dm/echarts-extension-gmap.svg)](https://npmcharts.com/compare/echarts-extension-gmap?minimal=true)
[![jsDelivr Downloads](https://data.jsdelivr.com/v1/package/npm/echarts-extension-gmap/badge?style=rounded)](https://www.jsdelivr.com/package/npm/echarts-extension-gmap)
[![License](https://img.shields.io/npm/l/echarts-extension-gmap.svg)](https://github.com/plainheart/echarts-extension-gmap/blob/master/LICENSE)

## Apache ECharts 谷歌地图扩展

[README_EN](https://github.com/plainheart/echarts-extension-gmap/blob/master/README.md)

[在线示例](https://codepen.io/plainheart/pen/VweLGbR) (示例中使用了谷歌地图API，国内访问需要代理)

[ECharts](https://echarts.apache.org/zh/index.html) 谷歌地图扩展，可以在高德地图上展现 [点图](https://echarts.apache.org/zh/option.html#series-scatter)，[线图](https://echarts.apache.org/zh/option.html#series-lines)，[热力图](https://echarts.apache.org/zh/option.html#series-heatmap) 等可视化。

### 示例

[Scatter 散点图](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/scatter_zh_CN.html)

[Lines 线图](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/lines_zh_CN.html)

[Heatmap 热力图](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/heatmap_zh_CN.html)

[Pie 饼图](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/pie_zh_CN.html)

![示例](https://user-images.githubusercontent.com/26999792/202892350-5a7df14e-18ea-4f98-9a62-f55d29ad9a49.png)

### 安装

```shell
npm install echarts-extension-gmap --save
```

### 引入

可以直接引入打包好的扩展文件和谷歌地图的 Javascript API

```html
<!-- 引入谷歌地图的Javascript API，这里需要使用你在谷歌地图开发者平台申请的key -->
<script src="https://maps.googleapis.com/maps/api/js?key={key}"></script>
<!-- 引入 ECharts -->
<script src="/path/to/echarts.min.js"></script>
<!-- 引入谷歌地图扩展 -->
<script src="dist/echarts-extension-gmap.min.js"></script>
```

如果是 `webpack` 打包，也可以 `require` 或者 `import` 引入

```js
require('echarts');
require('echarts-extension-gmap');
```

使用 CDN

[jsdelivr](https://www.jsdelivr.com/)

```html
<script src="https://cdn.jsdelivr.net/npm/echarts-extension-gmap/dist/echarts-extension-gmap.min.js"></script>
```

[unpkg](https://unpkg.com/)

```html
<script src="https://unpkg.com/echarts-extension-gmap/dist/echarts-extension-gmap.min.js"></script>
```

插件会自动注册相应的组件。

### 使用

扩展主要提供了跟 geo 一样的坐标系和底图的绘制，因此配置方式非常简单，如下

```js
option = {
  // 加载 gmap 组件
  gmap: {
    // 地图中心 支持数组或JSON对象
    //center: [108.39, 39.9],
    center: { lng: 108.39, lat: 39.9 },
    // 缩放级别
    zoom: 4,
    // 其他地图初始化参数...
    // https://developers.google.cn/maps/documentation/javascript/reference/map#MapOptions

    // 移动过程中实时渲染。默认为 true。如数据量较大，建议置为 false。
    renderOnMoving: true,
    // 谷歌地图 ECharts 图层的 zIndex。默认为 2000。
    echartsLayerZIndex: 2019,
    // 是否启用手势事件处理，如拖拽等。默认为 true。
    // 此配置项从 v1.4.0 起支持
    roam: true
  },
  series: [
    {
      type: 'scatter',
      // 使用高德地图坐标系
      coordinateSystem: 'gmap',
      // 数据格式跟在 geo 坐标系上一样，每一项都是 [经度，纬度，数值大小，其它维度...]
      data: [[120, 30, 8], [120.1, 30.2, 20]],
      encode: {
        value: 2,
        lng: 0,
        lat: 1
      }
    }
  ]
};

// 获取谷歌地图实例
var gmap = chart
  .getModel()
  .getComponent('gmap')
  .getGoogleMap();
// 添加一个Marker
var marker = new google.maps.Marker({ position: gmap.getCenter() });
marker.setMap(gmap);
// 添加交通图层
// var trafficLayer = new google.maps.TrafficLayer();
// trafficLayer.setMap(gmap);
```
