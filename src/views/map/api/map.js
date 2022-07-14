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
  "terrainprovider": "https://www.supermapol.com/realspace/services/3D-stk_terrain/rest/realspace/datas/info/data/path",
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

export function getProject(data) {
  return JSON.parse(testproject);
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
    "name": "flymanager",
    "title": "飞行漫游",
    "icon": "iconxuanqumoxing",
    "checked": false,
    "component": "flypathRoam/flypathtool.vue",
    "description": "飞行漫游",
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
