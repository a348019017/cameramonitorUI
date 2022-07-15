import { gettheme } from "../api/map"
import { GUID, stringFormat, plane_from_points } from "./util"
import { drawWater } from "./cesium/water"
import { Octree } from "./cesium/octree"
import _3dtilesetshader from "./cesium/_3dtilesetshader"

/**
 * 三维球操作
 * @classdesc 三维球操作
 */
var mapHelper = {}

export let myprimitives = new Cesium.PrimitiveCollection();

export let octree = new Octree();

//样式处理
mapHelper.stylehandle = { water: drawWater }


//缓存的instance，这支持多个url。
mapHelper.cachemodel = []

//多边形裁切模型(3dtileset),geojson
mapHelper.clipbypolygons = function (polygons) {

}


//封装的飞行定位的方法，传入的是destination以及heading pitch roll
mapHelper.flyto = function (viewer, camera, completecallback) {
  //获取指定图层
  if (viewer && camera) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(camera[0], camera[1], camera[2]),
      orientation: {
        heading: Cesium.Math.toRadians(camera[3]),
        pitch: Cesium.Math.toRadians(camera[4]),
        roll: Cesium.Math.toRadians(camera[5]),
      },
      complete: completecallback
    });
  }

}


//处理坐标点的变换 1 offset 2 ESPG:4326 3 其余不处理
let coordinatestopositions = function (coordinates, transform, element) {
  let position = coordinates.map(i => {
    var x = i[0];
    var y = i[1];
    var z = i[2];
    let p3 = undefined;
    if (!element.isoffset && element.prj === "EPSG:4326") {
      p3 = Cesium.Cartesian3.fromDegrees(x, y, z);
      return p3;
    } else {
      //暂未处理EPSG:等其它投影库的情况，这里可用考虑使用proj4来处理投影的转换，转换成4326然后加载进去
      p3 = Cesium.Cartesian3.fromElements(x, y, z);
      return Cesium.Matrix4.multiplyByPoint(transform, p3, new Cesium.Cartesian3());
    }
  });
  return position;
}

//默认的pin样式
const pinBuilder = new Cesium.PinBuilder();
const defaultbillboardimageurl = pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL();

//处理点位的加载
let handlepointtoenty = function (element, feature, modelMatrix, viewer) {

  var ifeature = feature.geometry.coordinates;
  var x = ifeature[0];
  var y = ifeature[1];
  var z = ifeature[2];

  let p3 = undefined;
  let p4 = undefined;
  //额外处理isoffset为false,prj为EPSG:4326的情况
  if (!element.isoffset && element.prj === "EPSG:4326") {
    p3 = Cesium.Cartesian3.fromDegrees(x, y, z);
  } else {
    //暂未处理EPSG:等其它投影库的情况，这里可用考虑使用proj4来处理投影的转换，转换成4326然后加载进去
    p3 = Cesium.Cartesian3.fromElements(x, y, z);
  }

  p4 = modelMatrix ? Cesium.Matrix4.multiplyByPoint(modelMatrix, p3, new Cesium.Cartesian3()) : p3;

  //根据样式信息生成不同的实体，暂只支持一种样式，默认样式为point
  let defaultstyle = {
    color: Cesium.Color.Red,
    pixelSize: 5,
    outlineColor: Cesium.Color.YELLOW,
    outlineWidth: 3,
  };

  //没有keyproperty的情况下默认创建guid作为id
  let id = element.keyproperty ? feature.properties[element.keyproperty] : GUID();

  let defaultentity = {
    id: element.name + '_' + id,
    properties: feature.properties,
    position: p4,
    //enty的名称和element的名称一致，这就起到了标识分组的作用
    name: element.name
  };

  if (element.style && element.style.name === "billboard") {
    //暂时只暴露scale参数和image参数，其余固定
    defaultentity.billboard = {
      image: element.style.image ? element.style.image : defaultbillboardimageurl,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      scale: element.style.scale ? element.style.scale : 1.0,
      // color = new Cesium.Color(1.0, 1.0, 1.0, 0.5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
  }
  //以modelinstance的形式将点模型渲染成模型 ,在style中制定url
  else if (element.style && element.style.name === "modelinstance") {
    let modelurl = element.style.gltfurl;
    //获取点的
    let instances = mapHelper.cachemodel.find(i => i.url == modelurl);
    if (!instances) {
      mapHelper.cachemodel.add({ ulr: modelurl, instances: [] })
    } else {
      var tmodelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        p4,
        //模型的默认姿态，姿态可以从feature的属性中获取
        new Cesium.HeadingPitchRoll(0, 0, 0)
      );
      Cesium.Matrix4.multiplyByUniformScale(
        tmodelMatrix,
        scale,
        tmodelMatrix
      );
      instances.push({
        modelMatrix: tmodelMatrix,
      });
    }
    //返回instance，并在外侧处理model
  }
  else {
    defaultentity.point = defaultstyle;
  }


  var enty = viewer.entities.add(defaultentity);
  return enty;
}

//处理添加数据到八叉树，主要添加的是cubic立方体范围,shpere等
let handleentytooctree = function (element, entity, sphere) {
  if (element.isindex) {
    octree.addData(undefined, entity, sphere)
  }
}

//处理几何体的法向量计算，主要用于定位功能
let handlegeometrynormalcomputer = function (element, entity, positions) {
  if (positions) {
    var plane = plane_from_points(positions);

    entity.properties.addProperty("plane", plane);
  }
}

let handlepolylinetoenty = function (element, feature, modelMatrix, viewer) {
  var ifeature = feature.geometry.coordinates;
  var positions = coordinatestopositions(ifeature, modelMatrix, element);
  var tboudingsphere = Cesium.BoundingSphere.fromPoints(positions);
  //var tboudingbox = Cesium.AxisAlignedBoundingBox.fromPoints(positions);
  var polyCenter = tboudingsphere.center;

  let defaultcolor = Cesium.Color.RED;
  let defaultwidth = 3;
  let defaultclampToGround = false;

  //默认不穿透
  let defaultdepthfailshow = false;

  if (element.style && element.style.color) {
    defaultcolor = Cesium.Color.fromCssColorString(curlegend.style.color);
  }
  if (element.style && element.style.width) {
    defaultwidth = element.style.width;
  }
  if (element.style && element.style.depthfailshow) {
    defaultdepthfailshow = element.style.depthfailshow;
  }
  if (element.style && element.style.clampToGround) {
    defaultclampToGround = element.style.clampToGround;
  }

  //对于材质可能的修改
  if (element.style && element.style.type == "trail") {
    defaultcolor = new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.CYAN, undefined, 3000);
  }

  //判断可能出现的专题图配置
  if (element.islegend && element.theme) {

    let fieldname = element.theme.fieldname;
    let fieldvalue = feature.properties[fieldname];
    let curlegend = element.theme.legends.find(i => i.value === fieldvalue);
    if (curlegend && curlegend.style.color) {
      defaultcolor = Cesium.Color.fromCssColorString(curlegend.style.color);
    }
    if (curlegend && curlegend.style.width) {
      defaultwidth = curlegend.style.width;
    }
    if (curlegend && curlegend.style.depthfailshow) {
      defaultdepthfailshow = curlegend.style.depthfailshow;
    }
  }


  //let dimensions = Cesium.Cartesian3.subtract(tboudingbox.maximum, tboudingbox.minimum, new Cesium.Cartesian3())
  var enty = viewer.entities.add({
    id: element.name + '_' + feature.properties[element.keyproperty],
    properties: feature.properties,
    position: polyCenter,
    polyline: {
      positions: positions,
      material: defaultcolor,
      width: defaultwidth,
      clampToGround: defaultclampToGround,
      depthFailMaterial: defaultdepthfailshow ? defaultcolor : undefined
    },
    //enty的名称和element的名称一致，这就起到了标识分组的作用
    name: element.name,
    // ellipsoid: {
    //     radii: new Cesium.Cartesian3(tboudingsphere.radius, tboudingsphere.radius, tboudingsphere.radius),
    //     material: Cesium.Color.BLUE,
    //     fill: false,
    //     outline: true,
    // }
  });

  //处理矢量数据的索引
  handleentytooctree(element, enty, tboudingsphere);
  //handlegeometrynormalcomputer(element, enty, positions)
  return enty;
}



//根据参数自定义加载geojson格式的数据，主要是处理坐标转换
//当element.isoffset=true时表示要特殊处理
mapHelper.loadgeojsonex = function (element, viewer) {
  //处理isoffset为false的情况
  let modelMatrix = undefined;
  if (element.isoffset) {
    var longitude = element.offset[0];
    var latitude = element.offset[1];
    var height = element.offset[2];
    var position = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );

    modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    );
  }
  let eurl = element.url;
  if (window.config && window.config.api && eurl.indexOf('http') == -1) {
    eurl = new URL(eurl, window.config.api).href
  }
  //如果是动态图层，一般随时间线动态获取数据，则动态构造一个拼接的url
  if (element.isdynamic && element.datetime) {
    eurl += ("&datetime=" + element.datetime);
  }
  //如果指定了tablename就使用tablename作为传参
  if (element.tablename) {
    eurl += "&tablename=" + element.tablename;
  }
  //特殊处理项目文件的加载方式，暂未使用token对用户进行识别,最佳的做法是全部隐藏到后台处理user->tablename的映射
  if (element.username) {
    eurl += eurl.indexOf("?") < 0 ? ("?user=" + element.username) : ("&user=" + element.username);
  }
  if (element.rolename) {
    //如果包含问号直接进行拼接
    eurl += eurl.indexOf("?") < 0 ? ("?role=" + element.rolename) : ("&role=" + element.rolename);
  }
  //这里尝试偏移世界坐标系，看加载模型的时候是不是以世界参考系为参考进行转换
  Cesium.Resource.fetchJson({ url: eurl }).then(function (jsonData) {

    //判读是feature还是geometry，feature显示属性表,变换每个点的位置坐标，如果之前有数据记得清空，在请求到数据之后清除
    if (element.entities && element.entities.length > 0) {
      element.entities.forEach((ele) => {
        viewer.entities.remove(ele);
      });
    }

    let loadentities = [];
    if (jsonData.features) {
      for (var i = 0; i < jsonData.features.length; i++) {
        var enty = null;
        if (jsonData.features[i].geometry.type == "LineString") {
          enty = handlepolylinetoenty(element, jsonData.features[i], modelMatrix, viewer);
        } else if (jsonData.features[i].geometry.type == "Point") {
          enty = handlepointtoenty(element, jsonData.features[i], modelMatrix, viewer);
        } else if (jsonData.features[i].geometry.type == "Polygon") {
          enty = handlepolygontoenty(element, jsonData.features[i], modelMatrix, viewer);
        }
        loadentities.push(enty);
      }
      element.entities = loadentities;
      if (element.ready) {
        element.ready(element);
      }
    }
    handlelabelshow(element, viewer);
    handleiconshow(element, viewer);
  });
  //这里返回一个集合记录加载的entities   

}


//处理面的加载,有点麻烦暂未处理
export let handlepolygontoenty = function (element, feature, modelMatrix, viewer) {
  var ifeature = feature.geometry.coordinates;
  //数组内处理
  var coordinates = ifeature.map(i => coordinatestopositions(i, modelMatrix, element));

  //仅计算一个linestring的中点，不全部计算
  var polyCenter = Cesium.BoundingSphere.fromPoints(coordinates[0]).center;


  var holes = [];
  for (var i = 1, len = coordinates.length; i < len; i++) {
    holes.push(
      new Cesium.PolygonHierarchy(
        coordinates[i]
      )
    );
  }
  var positions = coordinates[0];
  let hierarchy = new Cesium.PolygonHierarchy(
    positions,
    holes
  );

  let defaultmat = Cesium.Color.WHITE;
  let defaultoutline = Cesium.Color.BLACK;
  let defaultoutlineWidth = 1;
  defaultmat = Cesium.Color.fromAlpha(defaultmat, 0.6);
  let defaultoutlineshow = false;
  let defaultfillshow = true;


  if (element.style && element.style.fillcolor) {
    defaultmat = Cesium.Color.fromCssColorString(element.style.fillcolor);
  }
  if (element.style && element.style.outlinecolor) {
    defaultoutline = Cesium.Color.fromCssColorString(element.style.outlinecolor);
  }
  if (element.style && element.style.width) {
    defaultoutlineWidth = element.style.width;
  }
  if (element.style && element.style.outline) {
    defaultoutlineshow = element.style.outline;
  }
  if (element.style && (element.style.fill != undefined)) {
    defaultfillshow = element.style.fill;
  }


  //处理专题图的显示,这里需要在图层指定所配置的专题名称，反之则默认返回
  if (element.islegend && element.theme) {


    let fieldname = element.theme.fieldname;
    let fieldvalue = feature.properties[fieldname];
    let curlegend = element.theme.legends.find(i => i.value === fieldvalue);
    if (curlegend && curlegend.style.fillcolor) {
      defaultmat = Cesium.Color.fromCssColorString(curlegend.style.fillcolor);
    }
    if (curlegend && curlegend.style.outlinecolor) {
      defaultoutline = Cesium.Color.fromCssColorString(curlegend.style.outlinecolor);
    }
    if (curlegend && curlegend.style.width) {
      defaultoutlineWidth = curlegend.style.width;
    }
    if (curlegend && curlegend.style.outline) {
      defaultoutlineshow = curlegend.style.outline;
    }
    if (curlegend && (curlegend.style.fill != undefined)) {
      defaultfillshow = curlegend.style.fill;
    }
  }

  //特别处理style
  if (element.style && element.style.type && mapHelper.stylehandle[element.style.type]) {
    return myprimitives.add(mapHelper.stylehandle[element.style.type](hierarchy, element));
  }

  //
  var enty = viewer.entities.add({
    id: element.name + '_' + feature.properties[element.keyproperty],
    properties: feature.properties,
    position: polyCenter,
    //暂不赋值给entity，看是否能成功定位
    polygon: {
      hierarchy: hierarchy,
      material: defaultmat,
      //是否填充
      fill: defaultfillshow,
      outlineWidth: defaultoutlineWidth,
      height: element.style.height,
      extrudedHeight: element.style.extrudedHeight != undefined ? element.style.extrudedHeight : undefined,
      perPositionHeight: element.style.perPositionHeight != undefined ? element.style.perPositionHeight : true,
      outlineColor: defaultoutline,
      outline: defaultoutlineshow,
      //arcType: Cesium.ArcType.GEODESIC,
      //arcType: Cesium.ArcType.NONE
    },
    //enty的名称和element的名称一致，这就起到了标识分组的作用
    name: element.name,
  });


  return enty;
}



///包装一个加载专题图的服务
mapHelper.loadgeojsonentry = function (element, viewer, userInfo) {
  //处理需要使用用户或token进行数据加载的问题
  if (element.useuser) {
    element.username = userInfo.userName;
  }
  if (element.islegend) {

    gettheme(element.legendname).then(data => {
      //将专题图对象，绑定在指定的图层内容中
      if (data.data.isSuccess) {
        element.theme = data.data.data;
      }
      mapHelper.loadgeojsonex(element, viewer)
    })
  } else {
    mapHelper.loadgeojsonex(element, viewer)
  }
  //额外处理label的初始化
  //handlelabelshow(element);
}

let handlelabelshow = function (item, viewer) {
  if (item.entities) {
    if (item.labelshow) {
      item.entities.forEach((i) => {
        i.label = {
          text: i.properties[item.labelproperty]._value + "",
          color: Cesium.Color.fromCssColorString("#fff"),
          font: "normal 16px MicroSoft YaHei",
          showBackground: true,
          scale: 1,
          eyeOffset: new Cesium.Cartesian3(0, 0, -0.1),
          /*horizontalOrigin : Cesium.HorizontalOrigin.LEFT_CLICK,*/
          /*verticalOrigin : Cesium.VerticalOrigin.BOTTOM,*/
          // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          //   0,
          //   500
          // ),
          /*disableDepthTestDistance : 1000*/

          /*Represents a scalar value's lower and upper bound at a near distance and far distance in eye space.
        Name    Type    Default Description
        near    Number  0.0 optional The lower bound of the camera range.
            nearValue   Number  0.0 optional The value at the lower bound of the camera range.
        far Number  1.0 optional The upper bound of the camera range.
            farValue    Number  0.0 optional The value at the upper bound of the camera range.*/
          //scaleByDistance: new Cesium.NearFarScalar(100, 2, 500, 0.0),
        };
      });
    } else {
      item.entities.forEach((i) => (i.label = undefined));
    }
    viewer.scene.requestRender();
  }
}


//处理要素图标的显示
let handleiconshow = function (item, viewer) {
  if (item.entities) {
    if (item.iconshow && item.iconproperty) {
      let defaultwidth = 96;
      let defaultheight = 96;
      if (item.iconstyle) {
        defaultwidth = item.iconstyle.width;
        defaultheight = item.iconstyle.height;
      }
      item.entities.forEach((i) => {
        i.billboard = {
          image: (i.properties[item.iconproperty] && i.properties[item.iconproperty]._value) ? i.properties[item.iconproperty]._value : "/static/images/icons/待定.svg",
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          //scale: 1.0,
          width: defaultwidth, height: defaultheight,
          color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
      });
    } else {
      item.entities.forEach((i) => (i.billboard = undefined));
    }
    viewer.scene.requestRender();
  }
}





var tmpboundingSphere = null;

//相机跟踪3dtileentity的
mapHelper.track3dtileEnty = function (enty, viewer) {
  if (enty) {
    var tileset = mapHelper.gettilesetfromentity(enty.id, viewer);
    tmpboundingSphere = tileset.tilesetPrimitive.boundingSphere;
    viewer.camera.viewBoundingSphere(tileset.tilesetPrimitive.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0));
  } else {
    //还原到上次的视角
    if (tmpboundingSphere) {
      viewer.camera.flyToBoundingSphere(tmpboundingSphere);
      tmpboundingSphere = null;
    }

  }

}


//换个方式加载模型
mapHelper.loadmodel = function (element, viewer) {
  let longitude = 111;
  let latitude = 23;
  let height = 0;
  //debugglatitudeer;
  if (element.offset) {
    longitude = element.offset[0];
    latitude = element.offset[1];
    height = element.offset[2];
  }

  var heading = 2;
  var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  );
  var position = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height
  );
  // var heading = Cesium.Math.toRadians(135);
  // var pitch = 0;
  // var roll = 0;
  // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  // var orientation = Cesium.Transforms.headingPitchRollQuaternion(
  //     position,
  //     hpr
  // );
  var entity = viewer.entities.add({
    //这里id也使用name，方便检索
    id: element.name,
    name: element.name,
    position: position,
    model: {
      upAxis: Cesium.Axis.Y,
      uri: element.url,
      minimumPixelSize: 128,
      maximumScale: 20000,
      scale: element.scale ? element.scale : 1.0
      //modelMatrix: translationMaxtrix4,
    },
  });
  element.entities = [];
  element.entities.push(entity);
  return entity;
}

//loadmodel2接口将不写入entities到element，默认也不应该写入
mapHelper.loadmodel2 = function (element, viewer) {
  let longitude = 111;
  let latitude = 23;
  let height = 0;
  //debugglatitudeer;
  if (element.offset) {
    longitude = element.offset[0];
    latitude = element.offset[1];
    height = element.offset[2];
  }

  var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  );
  var position = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height
  );
  //这里需要设置一个headingpitchroll
  var heading = Cesium.Math.toRadians(0);
  var pitch = 0;
  var roll = 0;
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr
  );
  var entity = viewer.entities.add({
    //这里id也使用name，方便检索
    id: element.name,
    name: element.name,
    position: position,
    orientation: orientation,
    model: {
      uri: element.url,
      minimumPixelSize: 128,
      maximumScale: 20000,
      scale: element.scale ? element.scale : 1,
    },
  });
  //element.entities = [];
  //element.entities.push(entity);
  return entity;
}




mapHelper.gettilesetfromentity = function (name, viewer) {
  return viewer.dataSourceDisplay._defaultDataSource._visualizers[4]
    ._tilesetHash[name];
}

//初始化viewer
mapHelper.initviewer = function (id) {



  var viewer = new Cesium.Viewer(id, {
    //和透明度相关的设置
    orderIndependentTranslucency: false,
    contextOptions: {
      webgl: {
        alpha: true,
      }
    },
    //需要进行可视化的数据源的集合
    animation: false, //是否显示动画控件
    shouldAnimate: true,
    homeButton: false, //是否显示Home按钮
    fullscreenButton: false, //是否显示全屏按钮
    baseLayerPicker: false, //是否显示图层选择控件
    geocoder: false, //是否显示地名查找控件
    timeline: true, //是否显示时间线控件
    sceneModePicker: false, //是否显示投影方式控件
    navigationHelpButton: false, //是否显示帮助信息控件
    infoBox: false, //是否显示点击要素之后显示的信息
    requestRenderMode: true, //启用请求渲染模式
    scene3DOnly: false, //每个几何实例将只能以3D渲染以节省GPU内存
    sceneMode: 3, //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
    fullscreenElement: document.body, //全屏时渲染的HTML元素 暂时没发现用处
    selectionIndicator: false,
    // imageryProvider: new Cesium.UrlTemplateImageryProvider({
    //     url: defaultimageproviderurl,
    //     // url: "https://khms3.google.com/kh/v=874?x={x}&y={y}&z={z}"
    //     //                layer: "tdtVecBasicLayer",
    //     //                style: "default",
    //     //                format: "image/png",
    //     //                tileMatrixSetID: "GoogleMapsCompatible",
    //     //                show: false
    // }),
    // terrainProvider: new Cesium.CesiumTerrainProvider({
    //     //url:'https://lab.earthsdk.com/terrain/42752d50ac1f11e99dbd8fd044883638'//CesiumLab提供的世界12级地形
    //     url: defaultterrainprovider//CesiumLab提供的中国14级地形
    // })
  }
  );
  //开启抗锯齿
  viewer.scene.postProcessStages.fxaa.enabled = true
  //增加太阳光的亮度
  //viewer.scene.light.intensity = 10;

  viewer._cesiumWidget._creditContainer.style.display = "none";
  // 启用地球照明
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
  //默认关闭太阳光
  viewer.scene.globe.enableLighting = false;

  // //调整光照随相机变化，而非随太阳变化。
  // viewer.scene.light = new Cesium.DirectionalLight({
  //     direction: new Cesium.Cartesian3(1, 0, 0)
  // });

  // viewer.scene.preRender.addEventListener(function (scene, time) {
  //     viewer.scene.light.direction = Cesium.Cartesian3.clone(scene.camera.directionWC, viewer.scene.light.direction);
  // });

  //创建一个primitivecollection用于放置一些如动态水的对象
  viewer.scene.primitives.add(myprimitives);


  return viewer;
}

//前一个高亮的颜色样式等信息
var preEntyColor = null;
//前一个高亮的实体
var preEnty = null;

//高亮实体对象，需要写很多呀，只要存在子对象均需要处理
mapHelper.highlightEntyPolyline = function (enty) {
  this.unhighlightEntyPolyline();
  if (enty) {
    preEntyColor = enty.polyline.material;
    preEnty = enty;
    enty.polyline.material = Cesium.Color.WHITE;
  }
}
mapHelper.unhighlightEntyPolyline = function () {
  if (preEntyColor && preEnty) {
    preEnty.polyline.material = preEntyColor;
  }
}

//获取当前的camera
mapHelper.getcurrentcamera = function () {
  var position = viewer.camera.position;
  var orientation = viewer.camera.orientation;
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var cartographic = ellipsoid.cartesianToCartographic(position);
  var lat = Cesium.Math.toDegrees(cartographic.latitude);
  var lng = Cesium.Math.toDegrees(cartographic.longitude);
  var alt = cartographic.height;
  var heading = Cesium.Math.toDegrees(viewer.camera.heading);
  var pitch = Cesium.Math.toDegrees(viewer.camera.pitch);
  var roll = Cesium.Math.toDegrees(viewer.camera.roll);
  return [lng, lat, alt, heading, pitch, roll]
}


//将degree转换成变换矩阵
mapHelper.degreesToTransform = function (element) {
  var longitude = element.offset[0];
  var latitude = element.offset[1];
  var height = element.offset[2];
  var position = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height
  );

  var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  );
  return modelMatrix;
}


//通用的处理矢量对象的自动定位，传入矢量对象和图层对象,之前的版本
mapHelper.handlegeolocationDeprecated = function (item, layeritem, viewer) {
  //box需要考虑到变换值，因此还需要图层对象
  if (item.box && layeritem) {
    //如果是字符串需要转换成array
    if (typeof item.box === "string") {
      item.box = JSON.parse(item.box);
    }
    //获取offset变换值
    if (layeritem.isoffset) {
      let offset = layeritem.offset;
      //计算偏移矩阵
      let matrix = mapHelper.degreesToTransform(layeritem);
      let mincorner = new Cesium.Cartesian3(
        item.box[0],
        item.box[1],
        item.box[2]
      );
      mincorner = Cesium.Matrix4.multiplyByPoint(
        matrix,
        mincorner,
        new Cesium.Cartesian3()
      );

      let maxcorner = new Cesium.Cartesian3(
        item.box[3],
        item.box[4],
        item.box[5]
      );
      maxcorner = Cesium.Matrix4.multiplyByPoint(
        matrix,
        maxcorner,
        new Cesium.Cartesian3()
      );
      let spherebounding = Cesium.BoundingSphere.fromCornerPoints(
        mincorner,
        maxcorner
      );

      //默认参考角度为从下往上，如果指定了locationoffset按照此值进行设定
      let viewoffset = new Cesium.HeadingPitchRange(0, +1.57, 0);
      if (layeritem.viewoffset && layeritem.viewoffset.length == 3) {
        viewoffset = new Cesium.HeadingPitchRange(layeritem.viewoffset[0], layeritem.viewoffset[1], layeritem.viewoffset[2]);
      }

      //飞行到视角
      viewer.camera.flyToBoundingSphere(spherebounding, { offset: viewoffset });


      // //高亮指定要素，关闭后还原,通过名称查找enty，设置颜色为白色
      //暂时不处理enty的高亮
      // let entyname = this.layeritem.name + "_" + item.name;
      // let enty=viewer.ent
    }
  }
}


//通用的处理矢量对象的自动定位，传入矢量对象和图层对象，最新的处理版本
mapHelper.handlegeolocation = function (item, layeritem, viewer) {
  //autolocation的支持
  if (!layeritem.autolocation) {
    mapHelper.handlegeolocationDeprecated(item, layeritem, viewer);
    return;
  }
  //如果已经计算好了plane的信息，可以据此来定位,否则重新计算
  var idname = layeritem.name + "_" + item.id;
  var enty = viewer.entities.getById(idname);
  if (enty) {
    var plane = enty.properties.getValue(viewer.clock.currentTime).plane;
    var sphere = undefined;
    if (!plane) {
      var positions = [];
      if (enty.polyline) {
        positions = enty.polyline.positions._value;
      } else if (enty.polygon) {
        positions = enty.polygon.hierarchy._value.positions;
      } else {
        return;
      }
      plane = plane_from_points(positions, viewer, layeritem);
      sphere = Cesium.BoundingSphere.fromPoints(positions);
      //console.log("plane center is equal to shpere center", sphere.center.equals(plane.center))
      enty.properties.addProperty("plane")
    }
    if (plane && sphere) {

      //根据中心点几点northeastframe的变换
      var center = sphere.center;
      var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      //获取Z坐标的一个变换
      var zcoord = Cesium.Matrix4.multiplyByPoint(
        transform,
        Cesium.Cartesian3.UNIT_Z,
        new Cesium.Cartesian3()
      );
      //归一化此坐标，表示世界坐标系空间向量
      zcoord = Cesium.Cartesian3.normalize(zcoord, new Cesium.Cartesian3())
      //此为面的法向量
      var dir = plane.dir;
      var right = Cesium.Cartesian3.cross(zcoord, dir, new Cesium.Cartesian3());
      //
      var up = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(dir, right, new Cesium.Cartesian3()), new Cesium.Cartesian3());

      var offset = Cesium.Cartesian3.multiplyByScalar(dir, sphere.radius * 1.5, new Cesium.Cartesian3())
      var position = Cesium.Cartesian3.add(center, offset, new Cesium.Cartesian3())

      viewer.camera.flyTo({
        destination: position,
        orientation: {
          direction: Cesium.Cartesian3.negate(dir, new Cesium.Cartesian3()),
          up: up,
        }
      });
    } else {
      //回退到之前的定位
      mapHelper.handlegeolocationDeprecated(item, layeritem, viewer)
    }
  }
}



var tmpException = undefined;
//开启定点环绕,传入一个外包圆，还有一个当前的pitch参数，其中range参数应该是参考计算
mapHelper.startfixedrotatecamera = function (viewer, option) {
  if (!viewer) {
    console.log("没有指定viewer不能进行定点漫游");
    return;
  }



  //获取视点，用于lookat,这里有个bug，当试图中心没有物体时，将pick不到ellisoid的此时采用pickposition捕获物体，如果还不行传入；一个center进来
  const canvas = viewer.scene.canvas;
  const center = new Cesium.Cartesian2(canvas.clientWidth / 2.0, canvas.clientHeight / 2.0);
  //const ellipsoid = viewer.scene.globe.ellipsoid;
  let result = viewer.scene.pickPosition(center);
  if (option && option.center) {
    result = option.center;
  }

  if (!result) {
    console.log("当前视角下没有视点，无法定点漫游！")
    return;
  }
  //var position = viewer.camera.position;
  //不确定是否是flyto的pitch参数
  var pitch = viewer.camera.pitch;
  var range = Cesium.Cartesian3.distance(result, viewer.camera.position);
  //var roll = Cesium.Math.toDegrees(viewer.camera.roll);
  //var heading=Cesium.Math.toDegrees(viewer.camera.heading);
  //仅仅只变动heading进行环绕

  var angle = 360 / 30;
  var startTime = Cesium.JulianDate.fromDate(new Date());
  viewer.clock.startTime = startTime.clone();
  viewer.clock.currentTime = startTime.clone(); // 当前时间
  viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
  viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置

  var initialHeading = viewer.camera.heading;
  //防止重复添加

  var Exection = function TimeExecution() {
    // 当前已经过去的时间，单位s
    var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
    var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
    //测试使用zoomto
    var offset = new Cesium.HeadingPitchRange(heading, pitch, range);
    viewer.camera.lookAt(result, offset);
    viewer.camera.isfixedroam = true;
    viewer.camera.lookAtParams = { target: result, offset: offset };
    // viewer.scene.camera.setView({
    //     destination :position, // 点的坐标
    //     orientation:{
    //         heading: heading,
    //         pitch : pitch,

    //     }
    // });
    // viewer.scene.camera.moveBackward(distance);

    if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
      viewer.clock.onTick.removeEventListener(Exection);

    }
  };

  //防止重复
  mapHelper.stopfixedrotatecamera(viewer);
  viewer.clock.onTick.addEventListener(Exection);
  tmpException = Exection;


  //添加任意键取消的功能
  var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (click) {
    //结束漫游并释放handler
    mapHelper.stopfixedrotatecamera(viewer);
    handler.destroy();
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    viewer.camera.isfixedroam = false;
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}


//手动关闭定点环绕
mapHelper.stopfixedrotatecamera = function (viewer) {
  if (tmpException) {
    viewer.clock.onTick.removeEventListener(tmpException);
    tmpException = undefined;
  }
}




//其它helper文件的合并引用
mapHelper.set3dtileset = _3dtilesetshader;

import addpoststage from "./cesium/postproccessstage/circlepoststatges"
//测试后处理效果，以圆形扩散为例子
mapHelper.testaddpoststages = function () {
  let longitude = 2.127973853130549;
  let latitude = 0.7137879643532461;
  let height = 19.497283130953686;

  let centerp = new Cesium.Cartographic(longitude, latitude, 19);
  //最大区域
  let maxraiud = 500;
  let scanColor = Cesium.Color.RED;
  addpoststage(viewer, centerp, maxraiud, scanColor, 4000);
}
export default mapHelper
