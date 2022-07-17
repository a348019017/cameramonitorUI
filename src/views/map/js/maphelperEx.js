//maphelper的扩展方法，挂接到maphelper主方法中
import { jsonToCesiumObject } from "./util";


export let preDefineTMSUrl = [
  {
    name: "gaodedom",
    title: "高德影像",
    url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    minimumLevel: 3,
    //这里需要设置原始瓦片所能支持的最高级别
    maximumLevel: 16,
    value: false,
  },
  {
    name: "gaodemap",
    title: "高德地图",
    url: "http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=2&scale=1&style=8",
    minimumLevel: 3,
    maximumLevel: 21,
    value: false
  },
  {
    name: "google影像",
    title: "谷歌影像",
    url: "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}",
    minimumLevel: 3,
    maximumLevel: 21,
    value: true
  },
  {
    name: "mapboxdark",
    title: "mapbox地图",
    url: "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}",
    minimumLevel: 3,
    maximumLevel: 21,
    value: true,
    type: "Cesium.MapboxStyleImageryProvider"
  }
];


export default {
  //预定义的TMS
  parseJsonToImageProvider: function (j) {
    if (j.type)
      return jsonToCesiumObject();
    else {
      let tmplayer = new Cesium.UrlTemplateImageryProvider({
        url: j.url,
        maximumLevel: j.maximumLevel ? j.maximumLevel : 21,
        minimumLevel: j.minimumLevel ? j.minimumLevel : 0,
        rectangle: j.rectangle ? Cesium.Rectangle.fromDegrees(j.rectangle[0], j.rectangle[1], j.rectangle[2], j.rectangle[3]) : Cesium.Rectangle.MAX_VALUE
      });
      return tmplayer;
    }
  },
  addimagelayer: function (viewer, j) {
    let viewerLayers = viewer.scene.imageryLayers;
    viewerLayers.removeAll();
    let tmplayer = this.parseJsonToImageProvider(j);
    var imglayer = viewerLayers.addImageryProvider(tmplayer);
    j.ref = imglayer;
  }
  ,
  removeimagelayer: function (viewer, j) {
    let viewerLayers = viewer.scene.imageryLayers;
    if (j.ref) {
      viewerLayers.remove(j.ref, true);
      j.ref = undefined;
    }
  }
}




