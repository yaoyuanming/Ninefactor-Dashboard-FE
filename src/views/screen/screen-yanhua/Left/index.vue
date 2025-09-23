<template>
  <div class="content-left" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="content-left-main">
      <img style="width: 460px" src="@/assets/screen/left1.png" />
      <L2 />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { baseConfig } from '../config';
  import AlarmBg from '../../../../assets/screen/imgs/alarm-bg.png';
  import L2 from './L2.vue';
</script>

<style scoped lang="less">
  .content-left {
    position: absolute;
    top: 0;
    left: 0;
    width: 700px;
    min-width: 440px;
    height: 100%;

    .content-left-main {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 460px;
      margin-top: 80px;
      padding-left: 20px;
    }
  }
</style>
