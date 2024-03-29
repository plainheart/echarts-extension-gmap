[![NPM version](https://img.shields.io/npm/v/echarts-extension-gmap.svg?style=flat)](https://www.npmjs.org/package/echarts-extension-gmap)
[![Build Status](https://github.com/plainheart/echarts-extension-gmap/actions/workflows/build.yml/badge.svg)](https://github.com/plainheart/echarts-extension-gmap/actions/workflows/build.yml)
[![NPM Downloads](https://img.shields.io/npm/dm/echarts-extension-gmap.svg)](https://npmcharts.com/compare/echarts-extension-gmap?minimal=true)
[![jsDelivr Downloads](https://data.jsdelivr.com/v1/package/npm/echarts-extension-gmap/badge?style=rounded)](https://www.jsdelivr.com/package/npm/echarts-extension-gmap)
[![License](https://img.shields.io/npm/l/echarts-extension-gmap.svg)](https://github.com/plainheart/echarts-extension-gmap/blob/master/LICENSE)

## Google Map extension for Apache ECharts

[中文说明](https://github.com/plainheart/echarts-extension-gmap/blob/master/README.zh-CN.md)

[Online example on CodePen](https://codepen.io/plainheart/pen/VweLGbR)

This is a Google Map extension for [Apache ECharts](https://echarts.apache.org/en/index.html) which is used to display visualizations such as [Scatter](https://echarts.apache.org/en/option.html#series-scatter), [Lines](https://echarts.apache.org/en/option.html#series-lines), [Heatmap](https://echarts.apache.org/en/option.html#series-heatmap), and [Pie](https://echarts.apache.org/en/option.html#series-pie).

### Examples

[Scatter](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/scatter.html)

[Lines](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/lines.html)

[Heatmap](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/heatmap.html)

[Pie](https://github.com/plainheart/echarts-extension-gmap/tree/master/examples/pie.html)

![Preview](https://user-images.githubusercontent.com/26999792/202892350-5a7df14e-18ea-4f98-9a62-f55d29ad9a49.png)

### Installation

```shell
npm install echarts-extension-gmap --save
```

### Import

Import packaged distribution file `echarts-extension-gmap.min.js` and add Google Map API script and ECharts script.

```html
<!-- import JavaScript API of Google Map, please replace the key with your own key -->
<script src="https://maps.googleapis.com/maps/api/js?key={key}"></script>
<!-- import echarts -->
<script src="/path/to/echarts.min.js"></script>
<!-- import echarts-extension-gmap -->
<script src="dist/echarts-extension-gmap.min.js"></script>
```

You can also import this extension by `require` or `import` if you are using webpack or any other bundler.


```js
// use require
require('echarts');
require('echarts-extension-gmap');

// use import
import * as echarts from 'echarts';
import 'echarts-extension-gmap';
```

Or use a CDN

[jsdelivr](https://www.jsdelivr.com/)

```html
<script src="https://cdn.jsdelivr.net/npm/echarts-extension-gmap/dist/echarts-extension-gmap.min.js"></script>
```

[unpkg](https://unpkg.com/)

```html
<script src="https://unpkg.com/echarts-extension-gmap/dist/echarts-extension-gmap.min.js"></script>
```

This extension will register itself as a component of `echarts` after it is imported.

### Usage

This extension can be configured simply like [geo](https://echarts.apache.org/en/option.html#geo).

```js
option = {
  // load gmap component
  gmap: {
    // initial options of Google Map
    // See https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions for details
    // initial map center, accepts an array like [lng, lat] or an object like { lng, lat }
    center: [108.39, 39.9],
    // center: { lng: 108.39, lat: 39.9 },
    // initial map zoom
    zoom: 4,

    // whether echarts layer should be rendered when the map is moving. `true` by default.
    // if false, it will only be re-rendered after the map `moveend`.
    // It's better to set this option to false if data is large.
    renderOnMoving: true,
    // the zIndex of echarts layer for Google Map. `2000` by default.
    echartsLayerZIndex: 2019,
    // whether to enable gesture handling. `true` by default.
    // since v1.4.0
    roam: true

    // More initial options...
  },
  series: [
    {
      type: 'scatter',
      // use `gmap` as the coordinate system
      coordinateSystem: 'gmap',
      // data items [[lng, lat, value], [lng, lat, value], ...]
      data: [[120, 30, 8], [120.1, 30.2, 20]],
      encode: {
        // encode the third element of data item as the `value` dimension
        value: 2,
        lng: 0,
        lat: 1
      }
    }
  ]
};

// Get the instance of Google Map
var gmap = chart
  .getModel()
  .getComponent('gmap')
  .getGoogleMap();
// Add some markers to map
var marker = new google.maps.Marker({ position: gmap.getCenter() });
marker.setMap(gmap);
// Add TrafficLayer to map
// var trafficLayer = new google.maps.TrafficLayer();
// trafficLayer.setMap(gmap);
```
