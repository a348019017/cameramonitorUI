
</style>
<style lang="scss" scoped>
.maproot {
  .easyearthContainer {
    width: 100%;
    height: calc(100vh -115px);
  }
}
</style>
<template>
  <div class="maproot">
    <div id="easyearthContainer" :style="mapSelect"
      :class="[enableMultiView ? 'easyearthMultiContainer' : 'easyearthContainer']"></div>
    <toolbar v-if="showtoolbar"></toolbar>
  </div>

</template>

<script>
import mapHelper from "./js/mapHelper.js";
import cesiumloader from "./js/cesiumloader";
import { getProject, getDefaultcfg } from "./api/map"
import toolbar from "./toolbar2.vue"

export default {
  components: { toolbar },
  methods: {
    //根据system信息初始化中间的地图组件，threejs初始化和ceiusm初始化
    initprojectx(project, viewer) {
      if (project) {
        //解析同一个项目使用不同的引擎，这里的userinfo在特定情况下会被使用
        cesiumloader.loadproject(
          project,
          { username: "test", rolename: "test" },
          getDefaultcfg(),
          viewer)
      }
    },
    //额外的初始化工作
    init() {
      const viewer = mapHelper.initviewer("easyearthContainer");
      window.viewer = viewer;
      window.mapHelper = mapHelper;
    },
  },
  beforeDestroy() {
    if (viewer) {
      viewer.destroy();
      viewer = undefined;
    }
  },
  created() { },
  mounted() {
    this.init();
    //加载项目，加载的内容暂时记录在project中，详细的project描述请参考文档
    this.curproject = getProject();
    this.initprojectx(this.curproject, viewer);


    //获取三维球的全局配置，写入到全局中用于相关调用，然后再初始化地球
    // var layer = new Cesium.MapboxStyleImageryProvider({
    //   styleId: 'dark-v10',
    //   accessToken: 'pk.eyJ1IjoicG9uZ3hpZSIsImEiOiJjbDVrdmtndHowZHY3M2pxcjdrZzZsZTVoIn0.3PpdH5rSURGGtrfp90iIOw',
    // });
    // viewer.imageryLayers.addImageryProvider(layer);

  },
  data() {
    return {
      showtoolbar: true,
      currentUser: {},
      enableMultiView: false,
      mapSelect: { cursor: "" },
      //curproject: {},
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

