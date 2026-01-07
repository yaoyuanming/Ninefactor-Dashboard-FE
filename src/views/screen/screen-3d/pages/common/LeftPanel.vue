<template>
  <section
    class="side-panel side-panel--left"
    :style="`z-index: ${baseConfig.leftConfig.zIndex}`"
  >
    <div class="side-panel__body">
      1111
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { baseConfig } from '../../config';
</script>

<style scoped lang="less">
  .side-panel {
    position: absolute;
    top: 0;
    width: 520px;
    height: 100%;
    pointer-events: auto;

    &--left {
      left: 24px;
    }
  }

  .side-panel__body {
    min-height: calc(100% - 140px);
    margin-top: 140px;
    padding: 0 16px;
  }
</style>
