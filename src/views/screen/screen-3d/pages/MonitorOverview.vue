<template>
  <div class="monitor-overview">
    <LeftPanel v-if="baseConfig.leftConfig.show" />
    <RightPanel v-if="baseConfig.rightConfig.show" />
  </div>
</template>

<script lang="ts" setup>
  import LeftPanel from './common/LeftPanel.vue';
  import RightPanel from './common/RightPanel.vue';
  import { baseConfig } from '../config';
</script>

<style scoped lang="less">
  .monitor-overview {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
