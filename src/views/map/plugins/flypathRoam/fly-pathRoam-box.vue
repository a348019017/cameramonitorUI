
<style scoped>
.optTextClass {
  width: 110px;
  margin: 0 2px 0 0;
}
.el-form-item {
  margin-bottom: 5px;
}
.fromButton2 {
  background-image: linear-gradient(rgb(15 125 187), rgb(10 167 165));
  border: 1px solid rgba(43, 40, 40, 0.7);
  color: #ffffff;
  min-width: 115px;
}

.flyPathListBox {
  width: 95%;
  height: 360px;
  padding: 5px 0;
  overflow: auto;
  background: rgba(26, 26, 35, 0.5);
  border: 1px solid #000;
}
.flyPathList {
  text-align: left;
  padding: 0 5px;
  height: 25px;
  line-height: 25px;
  margin: 0;
  font-size: 12px;
  cursor: pointer;
}
.flyPathList .flyPathListName {
  color: #fff;
  width: 120px;
  float: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.flyPathNameChecked {
  color: #ff8d00;
}
.flyPathList .flyPathListIcon {
  margin: 0 0 0 3px;
  font-size: 12px;
  float: right;
  display: none;
}
.flyPathList .flyPathListIcon:hover {
  cursor: pointer;
  color: #458ff8;
}
.flyPathList:hover .flyPathListIcon {
  display: block;
}
.flyButtonBox {
  width: 48px;
  height: 48px;
  line-height: 48px;
  float: left;
  text-align: center;
  margin: 0;
  padding: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.5) 100%,
    rgba(23, 21, 21, 0.8) 0%
  );
  border-radius: 44px;
}
.flyButtonBox .eeIconfont {
  color: #fff;
}
.flyButtonBox:hover {
  cursor: pointer;
  background: linear-gradient(180deg, #2681ff 0%, rgba(1, 20, 46, 0.1) 100%);
}
</style>
<style>
#flyPathBox .el-form-item__label {
  color: #fff;
}
#flyPathBox .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #fff;
}
</style>
<template>
  <common-setting
    v-show="flyPathBoxShow"
    :title="currcompentTitle"
    :currFromTitle="currcompentTitle"
    :dragable="dragable"
    @ismax="handlemax"
    :styles="styles"
    :minable="true"
    minheight="120"
    @close="formClose"
  >
    <div slot="content" id="flyPathBox" style="padding: 10px">
      <el-row>
        <el-col v-show="ismax" :span="24">
          <el-button
            size="small"
            class="fromButton2"
            style="margin-left: 0px"
            @click="startFlyLine"
          >
            {{ isdrawingpath ? "结束绘制" : "绘制路径" }}
          </el-button>
          <el-button
            size="small"
            class="fromButton2"
            style="margin-left: 10px"
            @click="saveFlyLine"
            >保存路径</el-button
          >
          <!-- <el-button
            size="small"
            class="fromButton2"
            style="margin-left: 10px"
            @click="importFlyLine"
            >导入路径</el-button
          > -->
          <!-- <input
            type="file"
            id="uploadfile"
            @change="uploadfile"
            style="display: none"
            accept=".txt"
          /> -->
        </el-col>
        <el-col v-show="ismax" :span="24" style="margin: 15px 0 0 0">
          <el-col :span="11">
            <div class="flyPathListBox">
              <p
                class="flyPathList"
                v-for="(item, index) in currFlyLineData"
                :key="item.name"
              >
                <span
                  :class="[
                    'flyPathListName',
                    item.checked ? 'flyPathNameChecked' : '',
                  ]"
                  :title="item.name"
                  @click="selFlyLineClick(item, index)"
                  >{{ item.name }}</span
                >
                <span
                  class="eeIconfont iconshanchu flyPathListIcon"
                  @click="delFlyLineClick(item, index)"
                ></span>
                <!-- <span
                  class="eeIconfont iconxiugai flyPathListIcon"
                  @click="updataFlyLineClick(item, index)"
                ></span> -->
              </p>
            </div>
          </el-col>
          <el-col :span="13">
            <el-tabs v-model="activeName">
              <el-tab-pane label="路径设置" name="pathset">
                <el-form
                  label-position="left"
                  :model="formItem"
                  label-width="100px"
                  id="pathFlyFromId"
                >
                  <el-form-item label="名称：">
                    <el-input
                      v-model="curSelFlyLineData.name"
                      placeholder="名称"
                      size="small"
                      controls-position="right"
                      :disabled="isSetParm"
                      style="width: 100%"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="速度：">
                    <el-input-number
                      v-model="formItem.speed"
                      placeholder="60"
                      size="small"
                      controls-position="right"
                      class="optTextClass"
                      :disabled="isSetParm"
                    ></el-input-number
                    >m/s
                  </el-form-item>
                  <el-form-item label="高度：">
                    <el-input-number
                      v-model="formItem.viewHeight"
                      placeholder="60"
                      size="small"
                      controls-position="right"
                      class="optTextClass"
                      :disabled="isSetParm"
                    ></el-input-number
                    >m
                  </el-form-item>
                  <el-form-item label="高程模式:">
                    <el-select
                      v-model="formItem.altitudemode"
                      placeholder="绝对高程"
                      size="small"
                      style="width: 100%"
                      :disabled="isSetParm"
                    >
                      <el-option label="绝对高程" value="绝对高程"></el-option>
                      <el-option label="相对高程" value="相对高程"></el-option>
                      <el-option label="无" value="无"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="模型:">
                    <el-select
                      v-model="formItem.modelname"
                      placeholder="选择模型"
                      size="small"
                      style="width: 100%"
                      :disabled="isSetParm"
                    >
                      <el-option
                        v-for="mitems of preDefineModels"
                        :key="mitems.name"
                        :label="mitems.name"
                        :value="mitems.name"
                      ></el-option>
                      <el-option label="无" value=""></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- <el-form-item label="视角:">
                <el-select
                  v-model="formItem.viewType"
                  placeholder="第一人称视角"
                  size="small"
                  style="width: 100%"
                  @change="viewTypeChange"
                >
                  <el-option
                    label="第一人称视角"
                    value="第一人称视角"
                  ></el-option>
                  <el-option label="相机跟随" value="相机跟随"></el-option>
                  <el-option label="上帝视角" value="上帝视角"></el-option>
                </el-select>
              </el-form-item> -->
                  <el-form-item label="角度：">
                    <el-input-number
                      v-model="formItem.viewAngle"
                      placeholder="60"
                      size="small"
                      :min="-89"
                      :max="89"
                      controls-position="right"
                      class="optTextClass"
                      :disabled="isSetParm"
                    ></el-input-number
                    >°
                  </el-form-item>
                  <el-form-item label="转角时间：">
                    <el-input-number
                      v-model="formItem.changeCameraTime"
                      placeholder="1"
                      size="small"
                      controls-position="right"
                      class="optTextClass"
                      :disabled="isSetParm"
                    ></el-input-number>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
              <el-tab-pane label="模型设置" name="modelset">
                <el-form
                  label-position="left"
                  :model="formItem"
                  label-width="100px"
                  id="pathFlyFromId"
                >
                  <el-form-item v-show="showmodalset" label="scale：">
                    <el-input-number
                      v-model="modelinfo.scale"
                      placeholder="1"
                      size="small"
                      controls-position="right"
                      class="optTextClass"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item v-show="showmodalset" label="heading：">
                    <el-input-number
                      v-model="modelinfo.heading"
                      placeholder="0"
                      size="small"
                      :min="-180"
                      :max="180"
                      controls-position="right"
                      class="optTextClass"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item v-show="showmodalset" label="pitch：">
                    <el-input-number
                      v-model="modelinfo.pitch"
                      placeholder="0"
                      size="small"
                      :min="-180"
                      :max="180"
                      controls-position="right"
                      class="optTextClass"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item v-show="showmodalset" label="roll：">
                    <el-input-number
                      v-model="modelinfo.roll"
                      placeholder="0"
                      size="small"
                      :min="-180"
                      :max="180"
                      controls-position="right"
                      class="optTextClass"
                    ></el-input-number>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-col>
        <el-col :span="24" style="margin: 25px 0 20px 0px">
          <p
            class="flyButtonBox"
            v-if="currFlyFlag == 'start'"
            @click="startFly"
            style="margin: 0 0 0 100px"
          >
            <span class="eeIconfont iconziyuan"></span>
          </p>
          <p
            class="flyButtonBox"
            v-if="currFlyFlag == 'pause'"
            @click="pauseFly"
            style="margin: 0 0 0 100px"
          >
            <span class="eeIconfont iconpause-full"></span>
          </p>
          <p class="flyButtonBox" @click="stopFly" style="margin: 0 0 0 70px">
            <span class="eeIconfont iconlujing1"></span>
          </p>
        </el-col>
      </el-row>
    </div>
  </common-setting>
</template>
<script>
import commonSetting from "../common/common-setting.vue";
import { CesiumDrawTool } from "../../js/command/drawlinepolygontool";
import { CesiumFlyManager, flyPath2Entity } from "../../js/command/flymanager";
import { getFlyPath, saveFlyPath, deleteFlyPath } from "../../api/query";
import { getDefaultcfg } from "../../api/map";
import { GUID, clone } from "../../js/util";

//路径漫游主界面
export default {
  components: {
    commonSetting,
  },
  props: {
    compentTitle: {
      type: String,
      default: "路径漫游",
    },
    dragable: {
      type: Boolean,
      default: true,
    },
    styles: {
      type: Object,
      default: () => {
        return {
          width: "430px",
          height: "80%",
          right: "170px",
          top: "100px",
          position: "fixed",
        };
      },
    },
  },
  computed: {},
  beforeDestroy: function () {
    //清楚一些无关的
    this.clearOp();
  },
  watch: {
    curSelFlyLineData: {
      //深度监听当前选中路径的变化，变化后修改flymanager的状态
      handler(val, oldVal) {
        this.curSelFlyLineData.option.modelinfo = this.preDefineModels.find(
          (i) => i.name == this.curSelFlyLineData.option.modelname
        );
        if (this.curSelFlyLineData.option.modelinfo) {
          this.modelinfo = this.curSelFlyLineData.option.modelinfo;
        }
        //初始化flypath
        this.CesiumFlyManagers.init(
          this.curSelFlyLineData.routes,
          this.curSelFlyLineData.option
        );
        //同时渲染显示相应entity
        if (this.lineEntities && this.lineEntities.length != 0) {
          for (let index = 0; index < this.lineEntities.length; index++) {
            const element = this.lineEntities[index];
            viewer.entities.remove(element);
          }
        }
        //渲染新的路径
        this.lineEntities = flyPath2Entity(this.curSelFlyLineData);
      },
      deep: true, //true 深度监听
    },
    // modelinfo: {
    //   handler(val, oldval) {
    //     //设置模型参数
    //     if (this.CesiumFlyManagers) {
    //       this.CesiumFlyManagers.setModelInfo(val);
    //     }
    //   },
    //   deep: true,
    // },
  },
  methods: {
    //处理最大化最小化
    handlemax(ismax) {
      this.ismax = ismax;
    },
    clearOp() {
      if (this.lineEntities && this.lineEntities.length != 0) {
        for (let index = 0; index < this.lineEntities.length; index++) {
          const element = this.lineEntities[index];
          viewer.entities.remove(element);
        }
      }
      //强制结束飞行
      if (this.CesiumFlyManagers) {
        this.CesiumFlyManagers.stopFly();
        this.CesiumFlyManagers.dispose();
      }
      //清除掉绘制的线
      if (this.currDrawLineObj) {
        let id = this.currDrawLineObj.id;
        var getByIdBox = viewer.entities.getById(id);
        viewer.entities.remove(getByIdBox);
      }
    },
    isShowFlyLineChange: function (val) {},
    viewTypeChange: function (type) {},
    // 保存路径线
    saveFlyLine: function () {
      if (this.currFlyLineData)
        saveFlyPath(this.currFlyLineData).then((d) => {
          if (d.data.isSuccess) {
            this.$message("保存成功！");
            this.getFlypathall();
          } else {
            this.$message("保存失败！");
          }
        });
    },
    // 绘制路径线
    startFlyLine: function () {
      this.isdrawingpath = !this.isdrawingpath;
      if (this.isdrawingpath) {
        this.cesiumdrawtool.active({}, this.DrawLineEnd);
      } else {
        this.cesiumdrawtool.deactive();
      }
    },
    DrawLineEnd: function (obj) {
      this.currDrawLineObj = obj;
      //绘制完成后需要清除掉线
      let pos = this.currDrawLineObj.pos;
      let marks = [];
      for (const position of pos) {
        const latitude = this.toDegrees(
          Cesium.Cartographic.fromCartesian(position).latitude
        );
        const longitude = this.toDegrees(
          Cesium.Cartographic.fromCartesian(position).longitude
        );
        const altitude = Cesium.Cartographic.fromCartesian(position).height;
        marks.push({
          lat: latitude,
          lng: longitude,
          //
          flytime: 1,
          height: altitude,
        });
      }
      //绘制完毕后结束绘制
      this.isdrawingpath = false;
      this.cesiumdrawtool.deactive();

      let roleid = "58c68634-ac37-4cab-92ee-42ef92602e68";
      let projectid = "c9b4b3ec-97aa-4419-9079-0cec64b03c65";
      this.currFlyLineData.push({
        name: "新建路径" + GUID(),
        routes: marks,
        roleid: roleid,
        option: clone(this.defaultoption),
      });
    },
    flyLineLight: function () {},
    startFly: function () {
      if (this.curSelFlyLineData) {
        this.CesiumFlyManagers.startFly();
        this.currFlyFlag = "pause";
      }
    },
    pauseFly: function () {
      if (this.CesiumFlyManagers) {
        this.CesiumFlyManagers.startFly();
        this.currFlyFlag = "start";
      }
    },
    stopFly: function () {
      if (this.CesiumFlyManagers) {
        this.CesiumFlyManagers.stopFly();
        this.currFlyFlag = "start";
      }
    },
    selFlyLineClick: function (item, index) {
      this.curSelFlyLineData = item;
      this.formItem = this.curSelFlyLineData.option;
    },
    getFlypathall() {
      let roleid = "58c68634-ac37-4cab-92ee-42ef92602e68";
      getFlyPath({ roleid: roleid }).then((data) => {
        this.currFlyLineData = data.data.data;
      });
    },
    updataFlyLineClick: function (item, index) {},
    delFlyLineClick: function (item, index) {
      if (item.id) {
        deleteFlyPath(item.id).then((d) => {
          if (d.data.isSuccess) {
            this.$message("删除成功！");
            //
            this.removeflypath(item);
          } else {
            this.$message("删除失败！");
          }
        });
      } else {
        this.removeflypath(item);
        this.$message("删除成功！");
      }
    },
    removeflypath(item) {
      var a = this.currFlyLineData.indexOf(item);
      if (a >= 0) {
        this.currFlyLineData.splice(a, 1);
      }
    },

    formClose: function () {
      this.clearOp();
      this.flyPathBoxShow = false;
      this.$emit("close");
    },
    // 角度转弧度
    toRadians(degrees) {
      return (degrees * Math.PI) / 180;
    },
    // 弧度转角度
    toDegrees(radians) {
      return (radians * 180) / Math.PI;
    },
  },
  data() {
    return {
      ismax: true,
      activeName: "pathset",
      //模型高级设置
      showmodalset: true,
      isSetParm: false,
      defaultoption: {
        //视角高度
        viewHeight: 100,
        //90度向上，负数朝下
        viewAngle: 0,
        altitudemode: "绝对高程",
        speed: 10,
        changeCameraTime: 5,
      },
      preDefineModels: [],
      //当前飞行状态，决定控件的状态
      currFlyFlag: "start",
      lineEntities: [],
      //当前是否绘制路径
      cesiumdrawtool: undefined,
      isdrawingpath: false,
      currDrawLineObj: "", //当前绘制线的返回对象
      CesiumFlyManagers: null,

      currFlyLineData: [],
      //当前选择的飞行路径
      curSelFlyLineData: {},

      currcompentTitle: this.compentTitle,
      flyPathBoxShow: true,
      bInitialize: false,

      formItem: {},
      //模型参考设置
      modelinfo: {},
    };
  },
  mounted() {
    this.preDefineModels =
      getDefaultcfg().flymanagermodels;

    //初始化绘制多边形类,默认右键会清除路径
    this.cesiumdrawtool = new CesiumDrawTool(this.DrawLineEnd);
    //初始化飞行类
    this.CesiumFlyManagers = new CesiumFlyManager();
    let roleid = "58c68634-ac37-4cab-92ee-42ef92602e68";
    getFlyPath({ roleid: roleid }).then((data) => {
      this.currFlyLineData = data.data.data;
    });
  },
};
</script>
