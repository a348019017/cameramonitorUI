

import request from '@/utils/request'
import axios from 'axios'


const tokekey = "x*zp-57dc46b0767d4cce8e4276fce1276f0b"

//根据角色id查询指定
export function getFlyPath(data) {
  let url = "http://crack.jyaitech.com/FlyPath/GetFlyPath"
  return request.get(url, { params: data }
  )
}


export function saveFlyPath(data) {
  let url = "http://crack.jyaitech.com/FlyPath/SaveFlyPath"
  return request.post(url, data)
}

export function deleteFlyPath(id) {
  let url = "http://crack.jyaitech.com/FlyPath/deleteFlyPath"
  return request.delete(url, { params: { id: id } })
}


//一个额外封装的接口用来请求非geojson,这里内部封装了token等，参数暂未放开
export function getgeojson(url) {
  //使用自定义的Instance去执行操作
  var baseURL = "http://221.235.53.36:28207";
  const instance = axios.create({
    timeout: 10000,
    headers: {
      'Content-Type': "application/json",
      "token": "x*zp-57dc46b0767d4cce8e4276fce1276f0b"
    },
  })
  //let url = 'realtimeMonitoring/queryVehicleGpsList?mediaType=-1'
  return instance.get(url).then(d => {
    if (d.data.msg == "操作成功") {
      return parsejsontogeojson(d.data.data);
    }
  });
}


export function gettrackline() {
  var baseURL = "http://221.235.53.36:28207";
  const instance = axios.create({
    timeout: 10000,
    headers: {
      'Content-Type': "application/json",
      "token": tokekey
    },
  })
  let url = "http://221.235.53.36:28207/hisTrace/queryGpsRelationList?dvo=020200427420&startTime=2022-07-17+00:00:00&endTime=2022-07-17+22:55:26"
  return instance.get(url).then(d => {
    if (d.data.msg == "操作成功") {
      return parsepointsToFlyPath(d.data.data);
    }
  });

}

//将json转换成geojson进行加载,这里仅支持点矢量
function parsejsontogeojson(items, option) {
  let latfield = "lat";
  let longfield = "lng";
  let heightfield = "height";
  return { type: "FeatureCollection", features: items.map(i => parsejsontosingelgeojson(i, latfield, longfield, heightfield)) }
}

//默认转换成3d坐标
function parsejsontosingelgeojson(item, latfield, longfield, heightfield) {
  item["title"] = "1";
  item["marker-symbol"] = "1";
  item["marker-color"] = "#C49D22";
  // , item[heightfield] ? item[heightfield] : 0
  return { type: "Feature", properties: item, geometry: { type: "Point", coordinates: [item[longfield], item[latfield]] } };
}


//将点位信息转换成飞行轨迹，以供飞行
function parsepointsToFlyPath(data) {
  let routes = data.map(i => { return { lat: i.lat, lng: i.lng, height: i.hgt, time: i.pte } });
  for (let index = 1; index < routes.length; index++) {
    const element = routes[index];
    const preelement = routes[index - 1];
    element.flytime = (new Date(element.time).getTime() - new Date(preelement.time).getTime()) / 1000;
  }
  routes[0].flytime = 0;


  let errorroute = routes.filter(i => i.flytime <= 0.0);

  let path = {
    name: "测试路径",
    routes: routes,
    option: { "speed": 31, "modelinfo": { "url": "static/models/test.gltf", "name": "小车", "roll": 0, "type": "gltf", "pitch": 0, "scale": 0.5, "heading": -1.57 }, "modelname": "小车", "viewAngle": 2, "viewHeight": 0, "altitudemode": "相对高程", "changeCameraTime": 1 }
  }
  return path;
}

