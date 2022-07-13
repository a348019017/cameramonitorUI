
<style scoped>
</style>
<template>
  <div>
    <flypathroam v-if="isshowflypath"></flypathroam>
  </div>
</template>

<script>
import flypathroam from "./fly-pathRoam-box.vue";
//桥梁系统，标靶展示功能拆分
export default {
  name: "flypath",
  extends: "",
  components: { flypathroam },
  props: { titem: { type: Object } },
  computed: {},
  methods: {
    //基本方法,以此来处理每个功能的点击响应操作
    onclick: function (item) {
      item.checked = !item.checked;
      this.isshowflypath = item.checked;
    },
  },
  mounted() {},
  created() {},
  data() {
    return {
      isshowflypath: false,
    };
  },
  watch: {},
};
</script>

 