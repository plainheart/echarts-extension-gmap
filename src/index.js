/**
 * AMap component extension
 */

import { version, name } from "../package.json";

import * as echarts from "echarts";
import GMapCoordSys from "./GMapCoordSys";

import "./GMapModel";
import "./GMapView";

echarts.registerCoordinateSystem("gmap", GMapCoordSys);

// Action
echarts.registerAction(
  {
    type: "gmapRoam",
    event: "gmapRoam",
    update: "updateLayout"
  },
  function(payload, ecModel) {
    ecModel.eachComponent("gmap", function(gmapModel) {
      var gmap = gmapModel.getGoogleMap();
      var center = gmap.getCenter();
      gmapModel.setCenterAndZoom([center.lng(), center.lat()], gmap.getZoom());
    });
  }
);

export { version, name };
