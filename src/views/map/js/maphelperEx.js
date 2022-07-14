//maphelper的扩展方法，挂接到maphelper主方法中


export let preDefineTMSUrl = [
  {
    name: "gaodedom",
    title: "高德影像",
    url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    minimumLevel: 3,
    maximumLevel: 18,
    value: false,
  },
  {
    name: "gaodemap",
    title: "高德地图",
    url: "http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=2&scale=1&style=8",
    minimumLevel: 3,
    maximumLevel: 18,
    value: false
  },
  {
    name: "google影像",
    title: "谷歌影像",
    url: "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}",
    minimumLevel: 3,
    maximumLevel: 18,
    value: true
  }
];


export default {
  //预定义的TMS

  addimagelayer: function (viewer, j) {
    let viewerLayers = viewer.scene.imageryLayers;
    viewerLayers.removeAll();
    let tmplayer = new Cesium.UrlTemplateImageryProvider({
      url: j.url,
      maximumLevel: j.maximumLevel ? j.maximumLevel : 21,
      minimumLevel: j.minimumLevel ? j.minimumLevel : 0,
      rectangle: j.rectangle ? Cesium.Rectangle.fromDegrees(j.rectangle[0], j.rectangle[1], j.rectangle[2], j.rectangle[3]) : Cesium.Rectangle.MAX_VALUE
    });
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




