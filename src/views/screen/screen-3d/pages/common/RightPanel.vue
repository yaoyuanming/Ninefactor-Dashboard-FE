<template>
  <section
    class="side-panel side-panel--right"
    :style="`z-index: ${baseConfig.rightConfig.zIndex}`"
  >
    <div class="side-panel__body">
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

    &--right {
      right: 24px;
    }
  }

  .side-panel__body {
    min-height: calc(100% - 140px);
    margin-top: 140px;
    padding: 0 16px;
  }
</style>
