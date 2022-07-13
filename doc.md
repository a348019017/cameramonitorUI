
# 代码结构

-  主干功能代码位于components中
-  restful服务请求代码位于api文件夹中


# 功能对应代码
 
- 图层树 common/layers.vue
- 工具条 common/toolbar.vue
   - 模型选中 js/command/selectedmodel.js
   - 矢量选中 js/command/selectedlinetool.js
   - 裂缝面速览 common/linespannel.vue
   - 查询  function/querycondition.vue   querycondition-jcm.vue （检测面） querycondition-lf.vue (裂缝) 
   - 统计  function/querycount.vue (入口) querycount-ls(单裂缝) querycount-dc.vue (裂缝)  querycount-jcm (检测面)  querycount-djcm (单检测面)
   - 时间轴 common/timeslder.vue       

- 地图组件  map.vue
- 主界面 home.vue
- 地图加载帮助类  js/maphelper.js   cesiumloader.js
- 登录 login.vue



# 配置文件详解

- 项目文件
```
{
    id: 3,
    enableLighting:false                                             //是否开启太阳光，默认不开启动，设置为false需要指定光源，light属性，不再使用根据相机打光的方式。
    light: {
                direction: [-0.4315008980869479, 0.7361461316704321, 0.521436331469928], intensity: 1.5}    // 描述当前场景的光源方向，支持但暂时不必使用，目前仍然采用摄像头采光的形式
                ,  
            name: "宜宾普和金沙江特大桥桥梁检测1",
            camera: [104.54869090958435, 28.695857388176826, -43.380684262098306, 355.6662699541319, 76.40302943452616, 359.9485977379713],   //当前项目加载时切换的相机位置
            layers: []               //当前项目加载的图层，
            "polygonlayername": "testpeer",               //当前项目的检测面图层名称，是图层名，不是表名，layer.name。此参数指定当前项目分析的图层是哪一个，功能依赖必须指定。
            "timelinelayername": "baoshui"             //当前项目的裂缝图层名称，是图层名，不是表名，layer.name。此参数指定当前项目分析的图层是哪一个，功能依赖必须指定。
            "modelview":"model"                         //模型视图,normal表示地球视图
            "imageprovider":[
        {
            "url": "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}",
            "maximumLevel": 21,
            "minimumLevel": 0,
            "rectangle": [
                -180,
                -90,
                180,
                90
            ]
        },
        {
            "url": "https://crack.jyaitech.com/geoserver/gwc/service/tms/1.0.0/cite%3AhuishuiDOM@EPSG%3A900913@png/{z}/{x}/{reverseY}.png",
            "maximumLevel": 23,
            "minimumLevel": 15,
            "rectangle": [
                106.63881936497881,
                26.09438695246856,
                106.64910277579331,
                26.098266121922062
            ]
        }
    ]        //影像地图默认加载，如不指定采用默认地址，可为空,一旦不为空，需要自己定义默认加载的图层
            "terrainprovider:"https://lab.earthsdk.com/terrain/577fd5b0ac1f11e99dbd8fd044883638"       //地形默认不加载，如需添加请如此指定或自定义
    }
```

- 3dtileset图层
```
{
                    backfaceculling: false,                                                 //有些面片模型仅显示单面，如需显示双面，请修改此参数
                    name: "ybmodel",
                    url: "http://10.1.1.92/data/YB/model/1/tileset.json",                   //3dtileurl
                    type: "3dtile",                               
                    isoffset: false,                                                         //处理模型的偏移，配合offset参数使用
                    checked: true,   
                    "locationparams": {
                        "headingpitchrange": [0,0,0],                                 //点击图层树中的模型组件名飞行到指定模型组件的飞行参数,参考cesium文档       
                         "duration": 0                                                //flytoboundingsphere函数，例如[0,1.57,0] 相机从上往下看  
                    },                                                        //当前图层是否显示
                    offset: [104.548537, 28.695939, 0, 30],
                    scale: 1.0,                                                              //模型的缩放比例
                    //选取展示的页面的字段定义
                    columns: [{                                                              //模型选中的展示属性内容
                        name: "name",
                        title: "名称"
                    },
                    "selectedstyle":{color:"rgba(1,1,1,0.2)",reversecolor:"#FF00FF"}        //选中的样式，reversecolor为反向选中的样式,透明度使用白色加透明度来体现
                    ]
                     "children": [                                                             //描述3dtileset的结构内容，嵌套使用
                    {
                    "id": "258",                                                                
                    "name": "跨1",                                                             //注意这里定位使用的是3dtileset属性中的坐标信息进行定位通过id进行索引
                    "type": "3dtilefeature",
                    "parent": "bsqtile",                                                      //父亲图层的名称
                    "geocode": "0101",
                    "isfixedroam":true,                                                        //是否采用定点漫游
                    "fixedroamparams":{},                                                      //定点漫游的参数，后续待补充
                       
                    }
                }
```

- gltf图层

参考3dtileset图层的参数，type为gltf

- 矢量图层
```
{
            "url": "http://crack.whu.link/Line/GetLinesLatest?key=name",             //如果从数据库服务读取，请输入固定的地址配合tablename进行使用，不再支持固定json文件的展示
            "name": "baoshui",
            "type": "geojson",
            "style": {                                                                //样式的手动指定，暂时没有支持，在maohelper.js文件中制定其默认加载的样式，此处略
                "name": "point"
            },
            "component":"bridge/targetpointview.vue"                                 //默认情况下不输入为属性表展示，当需要定制化选取矢量要素弹出的界面时，填写预先配置的组件，
                                                                                     //浏览源码找到system下可复用的组件，并输入组件名称即可
            "camera": [                                                                //图层的定位参数
                114.47915893699627,
                30.42791035555768,
                -36.29354835607415,
                254.71034231853088,
                87.27186480304266,
                176.54687207181826
            ],
            "offset": [                                                                //偏移参数，暂时只支持以正北x朝上z参考系的偏移，方位角的偏移暂未支持，在maphepler中拓展
                114.47932416666667,
                30.427866944444446,
                0
            ],
            "checked": true,
            "columns": [
                {
                    "name": "name",
                    "title": "名称"
                } 
            ],
            "islegend": true,                                                         //是否以专题图的形式展示配合legendname制定其专题名称，数据库中legend的表默认配置了两个专题
            "isoffset": true, 
            "labelshow": true,                                                         //是否默认显示标签。配合labelproperty制定显示标签的内容
            "tablename": "line1",                                                      //如果是数据库中读取，必填，很多功能都依赖于此表名
            "keyproperty": "id",                                                       //主键的属性名称，必须正确，不然报错
            "labelproperty": "id"                                                      //标签的属性名称,
            "iconshow": true,                                                          //是否显示图标
      "iconproperty": "iconurl",                                                       //图标的属性来源
      "iconstyle": {                                                                   //图标的长宽，默认128
        "width": 128,
        "height": 128
      }
        }
```

- 矢量的样式和专题图配置

默认情况下，矢量将按照style中的样式进行配置，这是矢量的默认样式，对于面矢量，目前支持width(线宽),fillcolor,outlinecolor三个属性。
如某图层的style配置为

```
"style": {                                                               
                "name": "test",
                "fillcolor": "#aa0000",
                "outlinecolor": "#aa0000",
                "width":1,
                "outline":false
            }
```


矢量图层可以自定义专题图的配置，通过图层属性的islegend 和 legendname 属性指定，其中专题图的信息在数据库的legend表中

以下是专题图的配置信息，如level 字段值为1的面将使用{"width": 3, "fillcolor": "#aa0000"}的样式渲染,`如果level为空将使用默认的图层样式`。
fillcolor:值可以是 #ffccdd, rgb(255，255，255)，rgba(255，0，255，0.5)
```
[{"name": "等级1", "style": {"width": 3, "fillcolor": "#aa0000"}, "value": "1"}, 
{"name": "等级2", "style": {"width": 3, "fillcolor": "#00aa00"}, "value": "2"},
 {"name": "等级3", "style": {"width": 3, "fillcolor": "#0000aa"}, "value": "3"}, 
 {"name": "等级4", "style": {"width": 3, "fillcolor": "#00aaaa"}, "value": "4"}]
```





- 项目总览项目

此项目提供了多项目的全局预览和查看操作，并提供跳转到指定项目的功能，此时图层管理和工具栏按钮均不可用。

注意几个细节
- project添加属性isoverview:true
- layer添加属性useuser:true  (原因是每个角色可能返回不同的总览数据)
- 使用此功能，需要设置project表中数据的latitude，longitude，altitude，name，descriptor等字段用于展示项目位置和基本信息
- 请确保project 的name字段和content中的name字段保持一致，（这是重复字段的bug，name用于查找项目）
```
{
    "id": 0,
    "name": "总览",
    "camera": [
        89.69463663755154,
        46.71487575985857,
        20000000,
        0.0,
        -90.0,
        0.0
    ],
    "layers": [
        {
            "id": 0,
            "prj": "EPSG:4326",
            "useuser": true,
            "url": "http://localhost:25901/Project/GetProjectsGeoByUser",
            "name": "项目总览",
            "type": "geojson",
            "style": {
                "name": "billboard",
                "image": "/static/images/楼盘.png",
                "scale": 2
            },
            "checked": true,
            "isoffset": false
        }
    ],
    "isoverview": true
}

```



# 几个需要强调的细节
- 关于矢量数据坐标系加载的问题
重写了cesium加载矢量geo的代码，现规律如下。

   - 独立空间参考系
    isoffset=true ,offset为原点的实际经纬度坐标
   - 4326经纬度坐标
    isoffset=false ,prj="EPSG:4326"
    - 3857墨卡托投影坐标
    isoffset=false ,prj=EPSG:3857
    - 暂只支持独立空间参考系和4326参考系，其它暂未得到支持






