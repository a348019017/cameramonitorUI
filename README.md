
# 项目简介

此项目从已有GIS系统中提取并整理，包含一个应用级别的Cesium地图组件封装，封装了常用的一些GIS功能。可参考其中的封装并移植到其它系统，暂时未打包成单独的文件进行引用，因此需要拷贝其中的源码进行移植。


# 地图组件简介

  src\views\map包含全部封装好的通用的地图组件

  其中map.vue为主地图视图
  toolbar.vue为地图上悬浮的工具栏UI

  
  index.html中需引用cesium.js  ceiusm.css详见index.html

## Map组件

Map组件采用project数据驱动管理加载数据详见api/map/getproject中的配置，并参看doc.md文件


## toolbar组件

toolbar采用了plugin插件机制加载所需功能api/map/gettoolbar中进行配置。


