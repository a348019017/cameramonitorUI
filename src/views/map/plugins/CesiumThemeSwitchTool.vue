
<style lang="scss" scoped>
.toolbarstyle {
  top: 0px;
  left: 0px;
  width: 140px;
  position: absolute;

  .iconstyle {
    font-size: 24px;
    width: 32px;
    height: 32px;
    display: inline-block;
    vertical-align: middle
  }

  .selectstyle {
    width: 100px;
  }

  .el-checkbox__input {
    background: rgba(13, 71, 161, 0.7);
  }

  .el-button {
    border: 1px solid #00dad8;
    background: rgba(13, 71, 161, 0.7);
  }

  .el-button {
    color: #ffffff;
    font-size: 18px;
  }

  .el-checkbox {
    color: #ffffff;
  }
}
</style>
<template>
  <div v-if="ishowtools" class="toolbarstyle">
    <span>
      <img class="iconstyle" src="static/images/logo70.png" />
    </span>
    <!-- <el-checkbox v-model="clampToGround">贴地</el-checkbox> -->

    <el-select v-model="selectedvalues" class="selectstyle" @change="handleimageschanged" placeholder="请选择">
      <el-option v-for="(item, index) in preimgaes" :key="item.name" :label="item.title" :value="item.name">
      </el-option>
    </el-select>


  </div>
</template>

<script>
// import "../../components/js/command/cesium-measure.js";
// import { CesiumDrawPointTool } from "../../components/js/command/drawpointtool";
// import { stringFormat } from "../../components/js/util.js";
//管理主题切换的主页面，切换常规地图和带特效的额地图

import { preDefineTMSUrl, default as imageprovider } from "../js/maphelperEx"

export default {
  name: "CesiumImagesManagerTool",
  extends: "",
  components: {},
  props: {
    titem: { type: Object },
  },
  computed: {},
  methods: {
    //基本方法,以此来处理每个功能的点击响应操作
    onclick: function (item) {
      item.checked = !item.checked;
      this.ishowtools = item.checked;
    },
    handleimageschanged: function (item) {
      let curlayer = this.preimgaes.find(i => i.name == item);
      if (curlayer) {
        imageprovider.addimagelayer(viewer, curlayer)
      }
    }
  },
  mounted() {
    this.preimgaes = preDefineTMSUrl;
    // //每次切换项目的时候，会清楚所有的datasource，造成其datasource不可用，因此，项目切换的时候需要重新实例化此对象
    // this.measure = new Cesium.Measure(viewer);
    // this.ishowtools = this.titem.checked;
    // //创建一个
    // this.pointmeasure = new CesiumDrawPointTool(
    //   undefined,
    //   this.handlepointclick,
    //   { isclearwhencomplete: false }
    // );
  },
  created() { },
  data() {
    return {
      ishowtools: false,
      preimgaes: [],
      selectedvalues: "google影像",
    };
  },
  watch: {

  },
};
</script>

 