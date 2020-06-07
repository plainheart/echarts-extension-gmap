import * as echarts from "echarts";
import debounce from 'lodash.debounce';

export default echarts.extendComponentView({
  type: "gmap",

  render: function(gmapModel, ecModel, api) {
    var rendering = true;

    var gmap = gmapModel.getGoogleMap();
    var viewportRoot = api.getZr().painter.getViewportRoot();
    var coordSys = gmapModel.coordinateSystem;
    var offsetEl = gmap.getDiv();
    var renderOnMoving = gmapModel.get('renderOnMoving');
    var oldWidth = offsetEl.clientWidth;
    var oldHeight = offsetEl.clientHeight;

    var renderHandler = function() {
      if (rendering) {
        return;
      }

      // need resize?
      var width = offsetEl.clientWidth;
      var height = offsetEl.clientHeight;
      if (width !== oldWidth || height !== oldHeight) {
        return resizeHandler.call(this);
      }

      var mapOffset = [
        -parseInt(offsetEl.style.left, 10) || 0,
        -parseInt(offsetEl.style.top, 10) || 0
      ];
      viewportRoot.style.left = mapOffset[0] + "px";
      viewportRoot.style.top = mapOffset[1] + "px";

      coordSys.setMapOffset(mapOffset);
      gmapModel.__mapOffset = mapOffset;

      api.dispatchAction({
        type: "gmapRoam"
      });
    };

    var resizeHandler = function() {
      echarts.getInstanceByDom(api.getDom()).resize();
    };

    this._oldRenderHandler && this._oldRenderHandler.remove();

    if (!renderOnMoving) {
      renderHandler = debounce(renderHandler, 100);
      resizeChart = debounce(resizeChart, 100);
    }

    this._oldRenderHandler = google.maps.event.addListener(gmap, "gmaprender", renderHandler);

    rendering = false;
  },

  dispose: function(ecModel, api) {
    var component = ecModel.getComponent("gmap");
    var gmapInstance = component.getGoogleMap();
    google.maps.event.clearInstanceListeners(gmapInstance);
    var mapDiv = gmapInstance.getDiv();
    mapDiv.parentNode.remove(mapDiv);
    component.setGoogleMap(null);
    component.setEChartsLayer(null);
    component.coordinateSystem.setGoogleMap(null);
  }
});
