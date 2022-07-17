
<style scoped>
.trackControl {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translate(-50%);
  height: 4.8rem;
  background: #fff;
  border-radius: 2.4rem;
  padding: 0 1rem;
  box-sizing: border-box;
  font-size: 1.4rem;
  color: #424242;
  box-shadow: 0 0.8rem 0.8rem rgb(0 0 0 / 15%);
  display: flex;
  align-items: center;
  justify-content: left;
}
</style>
<template>
  <div v-if="isshowflypath">
    <div data-v-7472a140="" disabled="disabled" class="trackControl">
      <img data-v-7472a140="" @click="startplay"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAMAAAAocOYLAAAAflBMVEVHcExQgP9QgPdQfPdPfvdPfPdPffdQgPdPffdPffZRfvpPfPhPffhQfPVQfPZOfvdQgPpQffZQffdOfPZPffdQgO9QfvhOfPVQfPlQgPRPffhQfflQfPlQfPdOf/hPfvZQfvZPfPZQf/lQffdOffhQffZPffZQevpPfvhPfffSxRCyAAAAKXRSTlMAEEBA37+/IN/vX8+vUJB/MHC/kJ8Qb6BQMO+ff4CPz8/Pn2CPr68wzwJZTa0AAADFSURBVCjPvZPXFoIwDIZTKC0VEWS49877v6AiFNNx8Mbjf5d86ckswM8UZEIhqqQKvFRgr3jk4B0aqqRBWYKWYiPAwWbABj0SPZboVV9k1DkeV4Ov7Od3kJwGhC2farup6EwiTi0fUw719tNCy48Gf+Wbawd727HFAVLD4fJ8kLNMdQ5ffTDTFLmnP7rmtTUfCfJG55Na8xUXRTHX5YZf9gMTHy7IfUQu5vSA6v0gdlMUzD7gnOTgC98PWJZR8z8OZQj/0xMSD0d14DbCcQAAAABJRU5ErkJggg=="
        title="播放">
      <img data-v-7472a140=""
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAMAAAAocOYLAAAAaVBMVEVHcExQgP9QfvhPffdPfvdQgPdQffdQfvdQgPdQffdQfPdPffZPffdPffhQfPdOfvVOfvdPffdQffZQgPpPffZQevpPfvhQgO9PfPdQfflPfPhOfPZPfvZOfPVQffhNffRQfPVNfPVPfffLONjAAAAAInRSTlMAEG/f30CfgCBggO+/70CAf59wMK8wzxC/n8+Qz6BwYFBQhrM37QAAALpJREFUKM+9k9cagyAMRlktqGhRu3fz/g/ZfkKsLOtV/7twQgIZhCyXejApX30aUsPBihsVY1bBV7UJL2vwpb0Q9AyhOJ3wLcTSk9yQ0mb8Fk/yGjPcAWYD4HWxthIYwOIe/aXzL/BgN5jPLC8GU2a5XMS7H7zI8s6WJ8sba2Nn25VVi/Vw/mWmfifHD1WajyNQzvePkGMCi+ngihh7A6auAd6HI+y/oaTxctwwSXVR6RVpPusjWUP+qTcn9TtMTpq50AAAAABJRU5ErkJggg=="
        title="停止">
      <div data-v-7472a140="" class="timeText">00:00:00</div>
      <div data-v-7472a140="" role="slider" aria-valuemin="1" aria-valuemax="294" aria-orientation="horizontal"
        class="el-slider slider" aria-valuetext="1" aria-label="slider between 1 and 1">
        <!---->
        <div class="el-slider__runway">
          <div class="el-slider__bar" style="left: 0%; width: 100%;"></div>
          <div tabindex="0" class="el-slider__button-wrapper" style="left: 100%;">
            <div class="el-tooltip el-slider__button" aria-describedby="el-tooltip-6926" tabindex="0"></div>
          </div>
          <!---->
          <!---->
        </div>
      </div>
      <div data-v-7472a140="" class="timeText">22:46:41</div>
      <div data-v-7472a140="" class="el-select el-select--mini" style="width: 13rem; margin-left: 2rem;">
        <!---->
        <div class="el-input el-input--mini el-input--suffix">
          <!----><input type="text" readonly="readonly" autocomplete="off" placeholder="请选择" class="el-input__inner">
          <!----><span class="el-input__suffix"><span class="el-input__suffix-inner"><i
                class="el-select__caret el-input__icon el-icon-arrow-up"></i>
              <!---->
              <!---->
              <!---->
              <!---->
              <!---->
            </span>
            <!---->
          </span>
          <!---->
          <!---->
        </div>
      </div><label data-v-7472a140="" class="el-checkbox my-checkbox"><span class="el-checkbox__input"><span
            class="el-checkbox__inner"></span><input type="checkbox" aria-hidden="false" class="el-checkbox__original"
            value=""></span><span class="el-checkbox__label">气泡
          <!---->
        </span></label><label data-v-7472a140="" class="el-checkbox my-checkbox is-checked"><span
          class="el-checkbox__input is-checked"><span class="el-checkbox__inner"></span><input type="checkbox"
            aria-hidden="false" class="el-checkbox__original" value=""></span><span class="el-checkbox__label">轨迹点
          <!---->
        </span></label>
    </div>
  </div>
</template>

<script>
import { gettrackline } from "../../api/query"
import { CesiumFlyManager, flyPath2Entity } from "../../js/command/flymanager";
//测试trackRoam
export default {
  name: "flypathroamtest",
  extends: "",
  components: {},
  props: { titem: { type: Object } },
  computed: {},
  methods: {
    //基本方法,以此来处理每个功能的点击响应操作
    onclick: function (item) {
      debugger
      item.checked = !item.checked;
      this.isshowflypath = item.checked;
      if (this.isshowflypath) {
        this.init();
      }
    },
    startplay: function () {
      if (this.curSelFlyLineData) {
        this.CesiumFlyManagers.startFly();
        this.currFlyFlag = "pause";
      }
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
    init() {
      //记录路线的实体
      this.lineEntities = [];
      this.CesiumFlyManagers = new CesiumFlyManager();
      gettrackline().then(i => {
        this.curSelFlyLineData = i;
        //初始化
        this.CesiumFlyManagers.init(
          this.curSelFlyLineData.routes,
          this.curSelFlyLineData.option
        );
        if (this.lineEntities && this.lineEntities.length != 0) {
          for (let index = 0; index < this.lineEntities.length; index++) {
            const element = this.lineEntities[index];
            viewer.entities.remove(element);
          }
        }
        //渲染新的路径
        this.lineEntities = flyPath2Entity(this.curSelFlyLineData);
      })
    },
  },
  mounted() {

  },
  beforeDestroy() {
    this.clearOp();
  },
  created() { },
  data() {
    return {
      isshowflypath: false,
      curSelFlyLineData: {},
    };
  },
  watch: {},
};
</script>

 