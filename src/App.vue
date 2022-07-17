<template>
  <div id="vue-admin-beautiful">
    <!-- <router-view /> -->
    <mapctl></mapctl>
  </div>
</template>

<script>
import mapctl from "./views/map/map.vue"
export default {
  name: 'App',
  components: { mapctl },
  mounted() { },
}
</script>
