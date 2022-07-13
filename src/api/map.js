import request from '@/utils/request'

const testproject =`
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
  "camera": [
      104.95529,
      25.78603,
      1500.0,
      0.0,
      -90.0,
      0.0
  ],
  "layers": [
      {
          "url": "Line/GetLinesLatest?key=name",
          "name": "裂缝",
          "type": "geojson",
          "style": {
              "name": "point",
              "depthfailshow": true
          },
          "camera": [
              112.40843958156897,
              32.964263795753968,
              -30.0,
              0.0,
              90.0,
              0.0
          ],
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
              },
              {
                  "name": "lengthformat",
                  "title": "长度"
              },
              {
                  "name": "widthformat",
                  "title": "宽度"
              },
              {
                  "name": "pdate",
                  "title": "日期"
              },
              {
                  "name": "purl",
                  "type": "picture",
                  "title": "图片"
              },
              {
                  "name": "descripts",
                  "title": "描述"
              },
              {
                  "name": "trend",
                  "title": "趋势"
              }
          ],
          "islegend": true,
          "isoffset": true,
          "labelshow": false,
          "tablename": "lhdcn13_test_20220619_crack",
          "keyproperty": "id",
          "labelproperty": "id"
      },
      {
          "url": "Polygon/GetPolygonLatest?key=name",
          "name": "缺陷面",
          "type": "geojson",
          "style": {
              "name": "point"
          },
          "camera": [
              112.40843958156897,
              32.964263795753968,
              -30.0,
              0.0,
              90.0,
              0.0
          ],
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
              },
              {
                  "name": "areaformat",
                  "title": "面积"
              },
              {
                  "name": "pdate",
                  "title": "日期"
              },
              {
                  "name": "purl",
                  "type": "picture",
                  "title": "图片"
              },
              {
                  "name": "descripts",
                  "title": "描述"
              }
          ],
          "islegend": true,
          "isoffset": true,
          "labelshow": false,
          "tablename": "lhdcn13_test_20220619_peel",
          "legendname": "uniqpolygontheme",
          "keyproperty": "id",
          "labelproperty": "id"
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

const  testdefaultcfg=`{"flymanagermodels": [{"url": "static/data/models/drone6.glb", "name": "无人机2", "roll": 0, "type": "gltf", "pitch": 0, "scale": 0.5, "heading": -1.57}], "defaultimageprovider": "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}", "defaultterrainprovider": "https://lab.earthsdk.com/terrain/577fd5b0ac1f11e99dbd8fd044883638"}`
export function getDefaultcfg(){
   return JSON.parse(testdefaultcfg);
}
