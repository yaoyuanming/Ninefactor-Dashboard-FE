<template>
  <div
    class="content-bottom"
    :style="`z-index: ${baseConfig.leftConfig.zIndex}`"
  >
    <div class="content-bottom-main">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { baseConfig } from '../config';
</script>

<style scoped lang="less">
  .content-bottom {
    position: absolute;
    top: 150px;
    left: 0;
    width: 100%;
    height: calc(100% - 150px);
    background: #0c1e35;
    pointer-events: auto;

    .content-bottom-main {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 0;
      overflow: hidden;
      background: transparent;
    }
  }
</style>
