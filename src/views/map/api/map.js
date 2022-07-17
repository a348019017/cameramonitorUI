import request from '@/utils/request'

const testproject = `
{
  "id": 0,
  "name": "贵阳普安县",
  "light": {
      "direction": [
          0.0,
          -90.0,
          0.0
      ],
      "intensity": 0.5
  },
  "camera": [121.92871239524351, 40.88857977244281, 717.2317566480032, 334.11191710192395, -30.90855164693353, 359.9029586440633],
  "layers": [{
      "name":"ytlhz",
      "url": "http://data.marsgis.cn/3dtiles/max-ytlhz/tileset.json",
      "type":"3dtile",
      "scale": 1,
      "offset": [
        0.0,
        0.0,
        0.0
      ],
      "style":{
         "type":"graduaflash",
         "minheight":0,
         "maxheight": 12.1,
         "gltfUpAxis":"y"
      },
      "checked": true,
      "columns": [
        {
          "name": "name",
          "title": "名称"
        }
      ],
      "isoffset": false
  }
  ],
  "polygonlayername": "缺陷面",
  "timelinelayername": "裂缝",
  "inputcolumns": [
      {
          "name": "name",
          "type": "string",
          "title": "名称"
      },
      {
          "name": "description",
          "type": "string",
          "title": "描述",
          "eltype": "textarea"
      }
  ],
  "spacearecolums": [
      {
          "name": "name",
          "title": "名称"
      }
  ]
}`

const testproject2 = `
{
  "id": 0,
  "name": "太原市",
  "light": {
      "direction": [
          0.0,
          -90.0,
          0.0
      ],
      "intensity": 0.5
  },
  "camera": [112.54216627280427, 37.7606077669049, 12000, -15.11191710192395, -90.90855164693353, 0.9029586440633],
  "layers": [{
      "name":"ytlhz",
      "url": "http://192.168.2.189:6583/Taiyuan/3dTile/Building/tileset.json",
      "type":"3dtile",
      "scale": 1,
      "offset": [
        0.0,
        0.0,
        0.0
      ],
      "style":{
         "type":"graduaflash",
         "minheight":751.01,
         "maxheight": 1093.02,
         "gltfUpAxis":"y"
      },
      "checked": true,
      "columns": [
        {
          "name": "name",
          "title": "名称"
        }
      ],
      "isoffset": false
  },
  {
    "customapi":true,
    "url": "http://221.235.53.36:28207/realtimeMonitoring/queryVehicleGpsList?mediaType=-1",
    "name": "车辆数据",
    "cluster":true,
    "type": "geojsonx",
    "prj":"EPSG:4326",
    "styles": [{"type":"billboard","mindistance":500},{"type":"model","url":"static/models/test.gltf","mindistance":0,"maxdistance":500}],
    "camera": [112.54216627280427, 37.7606077669049, 12000, -15.11191710192395, -90.90855164693353, 0.9029586440633],
    "offset": [
        112.40843958156897,
        32.964263795753968,
        0.0
    ],
    "checked": true,
    "columns": [
        {
            "name": "name",
            "title": "名称"
        }
    ],
    "islegend": false,
    "isoffset": false,
    "keyproperty": "id"
   },
   {
    "url": "static/taiyuanroad.geojson",
    "name": "路网",
    "type": "geojson",
    "prj":"EPSG:4326",
    "style": {
        "type":"trail",
        "depthfailshow": true,
        "clampToGround":true,
        "width":10
    },
    "camera": [112.54216627280427, 37.7606077669049, 12000, -15.11191710192395, -90.90855164693353, 0.9029586440633],
    "offset": [
        112.40843958156897,
        32.964263795753968,
        0.0
    ],
    "checked": true,
    "columns": [
        {
            "name": "name",
            "title": "名称"
        }
    ],
    "islegend": false,
    "isoffset": false,
    "labelshow": false,
    "keyproperty": "id",
    "labelproperty": "id"
   }
  ],
  "polygonlayername": "缺陷面",
  "timelinelayername": "裂缝"
}
`


export function getProject(data) {
  return JSON.parse(testproject2);
}


//获取数据库记录专题信息
export function gettheme(legendname) {
  let themeurl = "line/getlegend"
  return request.get(themeurl, {
    params: {
      themename: legendname
    }
  })
}

const testdefaultcfg = `{"flymanagermodels": [{"url": "static/models/test.gltf", "name": "汽车1", "roll": 0, "type": "gltf", "pitch": 0, "scale": 0.5, "heading": -1.57}], "defaultimageprovider": "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}", "defaultterrainprovider": "https://lab.earthsdk.com/terrain/577fd5b0ac1f11e99dbd8fd044883638"}`
export function getDefaultcfg() {
  return JSON.parse(testdefaultcfg);
}


const toolbar = `[
  {
    "id": "af66ae8e-129d-4861-ac1b-60efb8ec68a8",
    "name": "measure",
    "title": "测量工具",
    "icon": "iconxuanqumoxing",
    "checked": false,
    "component": "CesiumMeasureTool.vue",
    "description": "测量工具",
    "hide": false,
    "params": null
  }, {
    "id": "af66ae8e-129d-4861-ac1b-60efb8ec6878",
    "name": "trackRoam",
    "title": "轨迹漫游",
    "icon": "iconxuanqumoxing",
    "checked": false,
    "component": "flypathRoam/trackRoam.vue",
    "description": "轨迹漫游",
    "hide": false,
    "params": null
  },
  {
    "id": "af66ae8e-129d-4861-ac1b-60efb8ed6878",
    "name": "flymanager",
    "title": "影像图层管理",
    "icon": "iconxuanqumoxing",
    "checked": false,
    "component": "CesiumImagesManager.vue",
    "description": "影像图层管理",
    "hide": false,
    "params": null
  }
]`




//返回需要加载的插件
export function gettoolbar() {
  return JSON.parse(toolbar);
}
