<template>
  <div class="map-wrapper">
    <CesiumViewer class="map-wrapper__viewer" />
  </div>
</template>

<script setup lang="ts">
  import CesiumViewer from '@/components/cesiumViewer/cesiumViewer.vue';
</script>

<style scoped lang="less">
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .map-wrapper__viewer {
    width: 100%;
    height: 100%;
  }
</style>
