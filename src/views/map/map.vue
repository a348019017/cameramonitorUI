<style scoped>
.easyearthContainer {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 !important;
  margin: 0 !important;
}

.easyearthMultiContainer {
  float: left;
  width: 50%;
  height: 100%;
}

</style>
<template>
  <div id="maproot">
    <div
      id="easyearthContainer"
      :style="mapSelect"
      :class="
        enableMultiView ? 'easyearthMultiContainer' : 'easyearthContainer'
      "
    ></div>
    <div
      v-show="enableMultiView"
      id="easyearthContainer2"
      :style="mapSelect"
      :class="
        enableMultiView ? 'easyearthMultiContainer' : 'easyearthContainer'
      "
    ></div>
  </div>
</template>

<script>
import mapHelper from "./js/mapHelper.js";
import cesiumloader from "./js/cesiumloader";
import {getProject,getDefaultcfg}  from "../../api/map"

var viewer = null;
export default {
  components: { },
  methods: {
    //根据system信息初始化中间的地图组件，threejs初始化和ceiusm初始化
    initprojectx(project, viewer) {
      if (project) {
        //解析同一个项目使用不同的引擎，这里的userinfo在特定情况下会被使用
          cesiumloader.loadproject(
            project,
            {username:"test",rolename:"test"},
            getDefaultcfg(),
            viewer)
      }
    },
    //额外的初始化工作
    init() {
        viewer = mapHelper.initviewer("easyearthContainer");
        window.viewer = viewer;
        window.mapHelper = mapHelper;
    },
    //设置双屏联动
    initHandler2(viewer0, viewer1) {
      viewer0.scene.postUpdate.addEventListener(() => {
        //当前高度
        let viewpoint = viewer0.camera.positionWC.clone();

        //暂时没有想到办法，只能用此方式解决，问题未知，连续性和流畅性待定
        if (viewer0.camera.isfixedroam) {
          viewer1.camera.lookAt(
            viewer0.camera.lookAtParams.target,
            viewer0.camera.lookAtParams.offset
          );
        } else {
          viewer1.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          viewer1.camera.position = viewpoint;
          viewer1.camera.up = viewer0.camera.up.clone();
          viewer1.camera.direction = viewer0.camera.direction.clone();
        }
      });
    },
  },
  beforeDestroy() {
    if(viewer)
    {
        viewer.destroy();
        viewer=undefined;
    }
  },
  created() {},
  mounted() {
    //获取三维球的全局配置，写入到全局中用于相关调用，然后再初始化地球
    this.init();
    //加载项目，加载的内容暂时记录在project中，详细的project描述请参考文档
    this.curproject= getProject();
    this.initprojectx(this.curproject,viewer);
  },
  data() {
    return {
      currentUser: {},
      enableMultiView: false,
      mapSelect: { cursor: "" },
      curproject: {},
    };
  },
  computed: {

  },
  watch: {
    // "$store.state.app.project": {
    //   handler: function (newValue, oldValue) {
    //     this.curproject = this.$store.state.app.project;
    //     this.initprojectx(this.curproject, viewer);
    //     //初始化项目之后除非projectchanged事件,这个也没办法保证是加载完毕了
    //     this.$eventHub.$emit("projectchanged", this.curproject);
    //   },
    // },
    // //处理切换为多视图模式
    // "$store.state.app.multiview": {
    //   handler: function (newValue, oldValue) {
    //     this.enableMultiView = newValue ? newValue.enable : false;
    //   },
    //   deep: true,
    // },
  },
};
</script>

