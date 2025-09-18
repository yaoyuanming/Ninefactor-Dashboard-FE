<template>
  <div
    class="content-right"
    :style="`z-index: ${baseConfig.rightConfig.zIndex}`"
  >
    <div class="content-right-main">
      <!-- <Info @clickAction="(type) => openModal('company', type)" />
          <Info2 @click="openModal('level')" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { baseConfig } from '../config';
</script>

<style scoped lang="less">
  .content-right {
    position: absolute;
    top: 0;
    right: 0;
    width: 700px;
    min-width: 440px;
    height: 100%;

    .content-right-main {
      margin-top: 80px;
      padding-right: 20px;
    }
  }
</style>
