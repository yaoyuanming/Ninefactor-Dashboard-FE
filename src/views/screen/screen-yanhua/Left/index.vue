<template>
  <div class="enterprise-left-panel" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="panel-content-wrapper">
      <L3 />
      <L2 />
      <L4 />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { baseConfig } from '../config';
import L2 from './L2.vue';
import L3 from './L3.vue';
import L4 from './L4.vue';




</script>

<style scoped lang="less">
.enterprise-left-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 700px;
  min-width: 440px;
  height: 100%;
  pointer-events: all;

  .panel-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 460px;
    margin-top: 80px;
    padding-left: 20px;
  }
}
</style>
