<style scoped>
.conBox {
  background: rgba(13, 71, 161, 0.5);
  position: absolute;
  z-index: 9;
  border-radius: 7px;
}
.headerBox {
  width: 100%;
  height: 36px;
  line-height: 36px;
  font-size: 15px;
  position: absolute;
  border-bottom: 1px solid #081a44;
  color: #00deff;
  font-weight: 400;
  font-family: 微软雅黑;
  letter-spacing: 2px;
}
.headerText {
  width: 80%;
  float: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 0 0 8px;
  margin: 0;
}
.headerIcon {
  color: #00deff;
  margin-right: 5px;
  line-height: 36px;
  float: right;
  cursor: pointer;
  font-size: 18px;
}
.content {
  position: absolute;
  width: 100%;
}
</style>
<template>
  <div class="conBox" :style="max ? styles : minStyle">
    <div
      v-show="showHeader"
      @mousedown="dragWindow"
      :style="{ cursor: dragable ? 'move' : 'default' }"
      class="headerBox"
    >
      <p class="headerText">{{ title }}</p>
      <i
        class="el-icon-close headerIcon"
        v-if="closeable"
        title="关闭"
        @click="formClose"
      ></i>
      <i
        class="el-icon-minus headerIcon"
        v-if="max && minable"
        title="最小化"
        @click="formMin"
      ></i>
      <i
        class="el-icon-full-screen headerIcon"
        v-if="!max && minable"
        title="还原"
        size="20"
        @click="formMax"
      ></i>
    </div>
    <div
      class="content"
      :style="{
        height: showHeader ? 'calc(100% - 32px)' : 'auto',
        'overflow-y': overflowY ? 'auto' : 'hidden',
        'overflow-x': overflowX ? 'auto' : 'hidden',
        top: showHeader ? '30px' : '0px',
      }"
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "标题",
    },
    dragable: {
      type: Boolean,
      default: false,
    },
    minable: {
      type: Boolean,
      default: false,
    },
    minheight: {
      type: Number,
      default: 30,
    },
    closeable: {
      type: Boolean,
      default: true,
    },
    overflowY: {
      type: Boolean,
      default: true,
    },
    overflowX: {
      type: Boolean,
      default: true,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    currFromTitle: {
      type: String,
      default: "",
    },
    styles: {
      type: Object,
      default: () => {
        return {
          width: "240px",
          height: "210px",
          right: "80px",
          top: "90px",
          float: "right",
        };
      },
    },
  },
  computed: {},
  methods: {
    formClose: function () {
      this.$emit("close");
    },
    formMin: function () {
      this.minStyle = JSON.parse(JSON.stringify(this.styles));
      //this.minStyle.width = "300px";
      this.minStyle.height = this.minheight + "px";
      this.max = false;
      this.$emit("ismax", this.max);
    },
    formMax: function () {
      this.max = true;
      this.$emit("ismax", this.max);
    },
    dragWindow: function (oevent) {
      if (!this.dragable) return;
      let div1 = this.$el;
      var distanceX = oevent.clientX - div1.offsetLeft;
      var distanceY = oevent.clientY - div1.offsetTop;
      document.onmousemove = function (ev) {
        var oevent = ev || event;
        let lefts = oevent.clientX - distanceX;
        let tops = oevent.clientY - distanceY;
        let clientX = document.body.clientWidth;
        let clientY = document.body.clientHeight;
        let currLayerWidth = div1.clientWidth;
        let currLayerHeight = div1.clientHeight;
        if (lefts < 0) lefts = 0;
        if (lefts > clientX - currLayerWidth) lefts = clientX - currLayerWidth;
        if (tops < 52) tops = 52;
        if (tops > clientY - currLayerHeight) tops = clientY - currLayerHeight;
        div1.style.left = lefts + "px";
        div1.style.top = tops + "px";
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
  },
  data() {
    return {
      max: true,
      minStyle: {
        width: "180px",
        height: "30px",
        right: "10px",
        top: "55px",
        float: "right",
      },
    };
  },
  mounted() {},
  created() {
    let _this = this;
    this.$eventHub.$on("closeAll", (param) => {
      if (param.excepts) {
        param.excepts.map(function (item) {
          if (item == _this.currFromTitle) {
            _this.formClose();
          }
        });
      }
      if (param.isClose) {
        this.formClose();
      }
    });
  },
  watch: {
    styles: function (newV, olderV) {
      this.minStyle = JSON.parse(JSON.stringify(this.styles));
      this.minStyle.width = "180px";
      this.minStyle.height = "30px";
    },
  },
};
</script>
