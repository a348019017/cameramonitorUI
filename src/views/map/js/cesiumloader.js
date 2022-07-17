import mapHelper from './mapHelper'
import { myprimitives, octree } from './mapHelper'
import { handlepointsloadbygeojson } from "./cesium/handlepointcluster";
import { getgeojson } from "../api/query"
var cesiumloader = {}

let curproject = undefined;
let userinfo = undefined;

//帮助加载cesium对象的函数

cesiumloader.load3dtileset = function (element, viewer) {

  if (element.type == "3dtile") {
    // var palaceTileset = new Cesium.Cesium3DTileset({
    //     url: element.url,
    // });

    var longitude = element.offset[0];
    var latitude = element.offset[1];
    var height = element.offset[2];
    //标准变换矩阵，暂未考虑heading
    var position = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );
    var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);

    var tilesetEntity = viewer.entities.add({
      tileset: {
        uri: element.url
      },
      id: element.name,
      //position: position
    });

    //如果有偏移的设定
    if (element.isoffset) {
      tilesetEntity.position = position;
    }

    // // var heading = 2;
    // palaceTileset.readyPromise.then(function (argument) {
    //     //经纬度、高转笛卡尔坐标

    //     // var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    //     // var rotationX = Cesium.Matrix4.fromRotationTranslation(
    //     //     Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(heading))
    //     // );
    //     // Cesium.Matrix4.multiply(mat, rotationX, mat);

    //     if (element.isoffset) {
    //         var longitude = element.offset[0];
    //         var latitude = element.offset[1];
    //         var height = element.offset[2];
    //         //标准变换矩阵，暂未考虑heading
    //         var position = Cesium.Cartesian3.fromDegrees(
    //             longitude,
    //             latitude,
    //             height
    //         );
    //         var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    //         palaceTileset._root.transform = mat;
    //     }


    // });
    // viewer.scene.primitives.add(palaceTileset);
    element.entities = [tilesetEntity]
    //返回placeTileset对象
    return tilesetEntity;
  }


}


//加载项目
cesiumloader.loadproject = function (project, _userinfo, _defaultcfg, viewer) {
  //这里需要传入用户信息
  userinfo = _userinfo;
  if (project) {
    initproject(project, viewer);

    if (typeof (_defaultcfg) == 'string') {
      _defaultcfg = JSON.parse(_defaultcfg);
    }
    //初始化影像和地形,影像兼容默认加载，地形可选加载
    let viewerLayers = viewer.scene.imageryLayers;
    viewerLayers.removeAll();
    let defaultimageurl = _defaultcfg.defaultimageprovider;
    //处理imageprovider数组的加载，兼容原始配置
    if (project.imageprovider) {
      if (project.imageprovider instanceof Array) {
        //有些相关的配置需要设置例如值加载指定范围
        project.imageprovider.forEach(j => {
          let tmplayer = new Cesium.UrlTemplateImageryProvider({
            url: j.url,
            maximumLevel: j.maximumLevel ? j.maximumLevel : 21,
            minimumLevel: j.minimumLevel ? j.minimumLevel : 0,
            rectangle: j.rectangle ? Cesium.Rectangle.fromDegrees(j.rectangle[0], j.rectangle[1], j.rectangle[2], j.rectangle[3]) : Cesium.Rectangle.MAX_VALUE
          });
          viewerLayers.addImageryProvider(tmplayer);
        })
      }
    } else {
      let imglayer = new Cesium.UrlTemplateImageryProvider({
        url: defaultimageurl,
      });
      viewerLayers.addImageryProvider(imglayer);
    }

    //地形
    if (project.terrainprovider) {
      let defualtterrainurl = project.terrainprovider;
      var terrainProvider = new Cesium.CesiumTerrainProvider({ url: defualtterrainurl });
      viewer.terrainProvider = terrainProvider;
    }
  }





}


//提供GeoJSONdatasource加载
cesiumloader.loadGeojsonBySource = function (element) {
  //如果是自定义的api接口，如何处理呢,这里提供了一个方法
  if (element.customapi) {
    getgeojson(element.url).then(geojson => {
      var source = Cesium.GeoJsonDataSource.load(geojson, { clampToGround: true }).then((data, err) => {
        handlepointsloadbygeojson(data, element)
        if (element.styles) {
          var modelstyle = element.styles.find(j => j.type == "model");
          if (modelstyle) {
            let mindistance = modelstyle.mindistance ? modelstyle.mindistance : 0;
            let maxdistance = modelstyle.maxdistance ? modelstyle.maxdistance : Number.MAX_VALUE;
            data.entities._entities._array.forEach(enty => {
              enty.model = {
                uri: modelstyle.url, minimumPixelSize: 128,
                maximumScale: 20000, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, distanceDisplayCondition: new Cesium.DistanceDisplayCondition(mindistance, maxdistance)
              }
            })
          }
          var billboardstyle = element.styles.find(j => j.type == "billboard");
          if (billboardstyle) {
            let mindistance = billboardstyle.mindistance ? billboardstyle.mindistance : 0;
            let maxdistance = billboardstyle.maxdistance ? billboardstyle.maxdistance : Number.MAX_VALUE;
            data.entities._entities._array.forEach(enty => {
              if (enty.billboard) {
                enty.billboard.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(mindistance, maxdistance);
              }
            })
          }
        }
        viewer.dataSources.add(
          data
        );
        data.show = element.checked;
        element.entities = [data];
      });
    });
    return;
  }
  var source = Cesium.GeoJsonDataSource.load(element.url, { clampToGround: true }).then((data, err) => {
    handlepointsloadbygeojson(data, element);
    //额外添加汽车模型
    viewer.dataSources.add(
      data
    );

    element.entities = [data];
  });
}

function initService(mapservices, viewer) {
  // 移除掉场景的所有内容,这里因为没有添加Datasource，所以暂时屏蔽掉
  viewer.dataSources.removeAll(false);
  //移除所有的entity
  viewer.entities.removeAll();
  myprimitives.removeAll();
  //移除场景树挂接的数据
  octree.clear();
  //scene的primitives不能清空，不然会有未知问题,这里创建一个primitivecollection来记录
  //viewer.scene.primitives.removeAll();

  if (mapservices) {
    let count = 0;
    let that = this;

    mapservices.forEach((element) => {
      count++;
      switch (element.type) {
        case "3dtile":
          {
            cesiumloader.load3dtileset(element, viewer);
          }
          break;
        case "geojson":
          {
            //处理矢量数据也即是geojson格式的加载
            mapHelper.loadgeojsonentry(
              element,
              viewer,
              userinfo
            );
          }
          break;
        case "geojsonx":
          {
            //处理矢量数据也即是geojson格式的加载
            cesiumloader.loadGeojsonBySource(element);
          }
          break;
        case "Terrain":
          {
            terrainManger.setTerrain({
              url: element.url,
            });
          }
          break;
        case "gltf":
          {
            mapHelper.loadmodel(element, viewer);
          }
          break;
        case "TMSImage":
          {
            imageryLayerManager.addTMSImageLayer({
              url: element.url,
              id: "TMSImageryLayer" + count,
            });
          }
          break;
        case "WMSImage":
          {
            imageryLayerManager.addWMSImageLayer({
              url: element.url,
              id: "WMSImageryLayer" + count,
            });
          }
          break;
        default:
          break;
      }
    });
  }
}
//初始化项目
function initproject(project, viewer) {
  curproject = project;
  initService(project.layers, viewer);
  if (project && project.camera) {
    mapHelper.flyto(viewer, project.camera, extramodify3dtileset);
  }
  initscenesetting(project.light, viewer);
}


let setfuc = function (scene, time) {
  scene.light.direction = Cesium.Cartesian3.clone(scene.camera.directionWC, scene.light.direction);
}

//初始化场景设置，如灯光
function initscenesetting(light, viewer) {

  // //reset太阳
  // if (viewer.timeline) {
  //     viewer.timeline.container.style.display = "none";
  // }

  viewer.scene.preRender.removeEventListener(setfuc);

  if (light && light.type == "sunlight") {
    viewer.scene.light = undefined
    viewer.scene.globe.enableLighting = true;
    //viewer.shadows = true;
    //同时开启timeline
    viewer.timeline.container.style.display = "block";


  } else if (light && light.type == "fixedlight") {
    //默认固定光源
    viewer.scene.globe.enableLighting = false;
    //viewer.shadows = false;
    viewer.timeline.container.style.display = "none";

    let option = {
      direction: Cesium.Cartesian3.fromArray(
        light.direction
      ),
      intensity: light.intensity
        ? light.intensity
        : 1.0,
    };
    viewer.scene.light = new Cesium.DirectionalLight(option);

  } else {
    viewer.scene.globe.enableLighting = false;
    //viewer.shadows = false;
    viewer.timeline.container.style.display = "none";

    //
    //调整光照随相机变化，而非随太阳变化。
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: new Cesium.Cartesian3(1, 0, 0),
      intensity: light && light.intensity ? light.intensity : 1.0
    });

    viewer.scene.preRender.addEventListener(setfuc);
  }



}


//额外对3dtileset的primitive进行修改
function extramodify3dtileset() {
  //获取类型为3dtile的对象;
  let lyr = curproject.layers.find((i) => i.type == "3dtile");
  if (lyr && lyr.name) {
    let tileset = mapHelper.gettilesetfromentity(lyr.name, viewer);
    if (lyr.backfaceculling != undefined) {
      tileset.tilesetPrimitive.backFaceCulling = lyr.backfaceculling;
    }
    //处理3dtile模型加载的特效
    mapHelper.set3dtileset(tileset.tilesetPrimitive, lyr)
  }
}


//设置全局变换值，在已有坐标变换的基础上，再次进行变换
function settransform(layer, transform, viewer) {
  if (layer.type == "3dtile") {
    //记录原始的modelmatrix
    let tileset = mapHelper.gettilesetfromentity(layer.name, viewer);
    layer.modelmatrix = tileset.tilesetPrimitive.root.transform.clone();
    //
    tileset.tilesetPrimitive.root.transform = gettransform(layer.modelmatrix, transform);
  } else if (layer.type == "geojson") { }
}


function gettransform(modelmatrix, transform) {
  let rotatex = transform.rotatex;
  let rotatey = transform.rotatey;
  let rotatez = transform.rotatez;
  let transx = transform.transx;
  let transy = transform.transy;
  let transz = transform.transz;

  let m = modelmatrix.clone();
  //先偏移，再缩放，最后旋转，按顺序

  var tm = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(transx, transy, transz));

  Cesium.Matrix4.multiply(m, tm, m);


  var rx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotatex));
  rx = Cesium.Matrix4.fromRotationTranslation(rx);

  Cesium.Matrix4.multiply(m, rx, m);

  var ry = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotatey));
  ry = Cesium.Matrix4.fromRotationTranslation(ry);

  Cesium.Matrix4.multiply(m, ry, m);

  var rz = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotatez));
  rz = Cesium.Matrix4.fromRotationTranslation(rz);


  Cesium.Matrix4.multiply(m, rz, m);

  return m;
}

cesiumloader.initscenesetting = initscenesetting;

export default cesiumloader

