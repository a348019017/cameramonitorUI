
<style scoped>
.toolbarstyle {
  top: 100px;
  right: 140px;
  position: absolute;
}
.toolbarstyle .el-checkbox__input {
  background: rgba(13, 71, 161, 0.7);
}
.toolbarstyle .el-checkbox {
  color: #ffffff;
}
.toolbarstyle .el-button {
  border: 1px solid #00dad8;
  background: rgba(13, 71, 161, 0.7);
}
.toolbarstyle .eeIconfont,
.toolbarstyle .el-button {
  color: #ffffff;
  font-size: 18px;
}
</style>
<template>
  <div v-if="ishowtools" class="toolbarstyle">
    <!-- <el-checkbox v-model="clampToGround">贴地</el-checkbox> -->
    <el-tooltip
      class="item"
      effect="dark"
      content="长度测量"
      placement="bottom"
    >
      <el-button
        icon=" eeIconfont icondibiaojuli"
        @click="onclickmeaurelength"
        circle
      ></el-button>
    </el-tooltip>
    <el-tooltip
      class="item"
      effect="dark"
      content="面积测量"
      placement="bottom"
    >
      <el-button
        icon=" eeIconfont iconmianbiaohui"
        @click="onclickmeaurearea"
        circle
      ></el-button>
    </el-tooltip>
    <el-tooltip
      class="item"
      effect="dark"
      content="三角测量"
      placement="bottom"
    >
      <el-button
        icon=" eeIconfont iconsanjiaoceliang"
        @click="onclickmeaureTriangles"
        circle
      ></el-button>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="点测量" placement="bottom">
      <el-button
        icon=" eeIconfont iconsanjiaoceliang"
        @click="onclickmeaurePoint"
        circle
      ></el-button>
    </el-tooltip>
    <el-tooltip
      class="item"
      effect="dark"
      content="清除测量"
      placement="bottom"
    >
      <el-button
        icon=" eeIconfont iconshanchu"
        @click="onclickmeasureclear"
        circle
      ></el-button>
    </el-tooltip>
  </div>
</template>

<script>
import "../js/command/cesium-measure.js";
import { CesiumDrawPointTool } from "../js/command/drawpointtool";
import { stringFormat } from "../js/util.js";
//桥梁系统，统计功能
export default {
  name: "CesiumMeasureLineSpaceTool",
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
    onclickmeasureclear: function () {
      // 清除
      this.measure._drawLayer.entities.removeAll();

      //清除点测量结果
      if (this.pointmeasure) {
        this.pointmeasure.deactive();
        this.pointmeasure.clear();
      }
    },
    //单点测量
    onclickmeaurePoint: function () {
      this.pointmeasure.active();
    },
    onclickmeaureTriangles: function () {
      // 三维量测
      this.pointmeasure.deactive();
      this.measure.drawTrianglesMeasureGraphics({ callback: () => {} });
    },
    onclickmeaurearea: function () {
      // 空间面积
      this.pointmeasure.deactive();
      this.measure.drawAreaMeasureGraphics({
        clampToGround: this.clampToGround,
        callback: () => {},
      });
    },
    //处理点击操作，额外添加label用于显示经纬度高程
    handlepointclick: function (params) {
      let pointEnty = params.pointEnty;
      if (pointEnty) {
        var cartopoint = Cesium.Cartographic.fromCartesian(
          pointEnty.position._value
        );
        let strlabel = stringFormat(
          "经度:{0} 纬度:{1} 高程:{2}",
          ((cartopoint.longitude / Math.PI) * 180).toFixed(2),
          ((cartopoint.latitude / Math.PI) * 180).toFixed(2),
          cartopoint.height.toFixed(2)
        );
        pointEnty.billboard = {
          image: "/static/images/label.png",
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 1.0,
          // color = new Cesium.Color(1.0, 1.0, 1.0, 0.5),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        };
        pointEnty.label = {
          text: strlabel,
          color: Cesium.Color.fromCssColorString("#fff"),
          font: "normal 16px MicroSoft YaHei",
          showBackground: true,
          scale: 1,
          eyeOffset: new Cesium.Cartesian3(0, 0, -0.1),
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
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
      }
    },
    onclickmeaurelength: function () {
      // 空间距离
      this.pointmeasure.deactive();
      this.measure.drawLineMeasureGraphics({
        clampToGround: this.clampToGround,
        callback: () => {},
      });
    },
    deactive: function () {
      if (this.pointmeasure) {
        this.pointmeasure.deactive();
      }
    },
  },
  mounted() {
    //每次切换项目的时候，会清楚所有的datasource，造成其datasource不可用，因此，项目切换的时候需要重新实例化此对象
    this.measure = new Cesium.Measure(viewer);
    this.ishowtools = this.titem.checked;
    //创建一个
    this.pointmeasure = new CesiumDrawPointTool(
      undefined,
      this.handlepointclick,
      { isclearwhencomplete: false }
    );
  },
  created() {},
  data() {
    return {
      measure: null,
      ishowtools: false,
      clampToGround: false,
      pointmeasure: undefined,
    };
  },
  watch: {
    "$store.state.app.projects": {
      handler: function (newValue, oldValue) {
        //切换项目的时候是否需要重新初始化
        this.measure._drawLayer.entities.removeAll();
      },
    },
  },
};
</script>

 