<template>
  <div class="content-left" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="content-left-main">
      <!-- <Info @clickAction="(type) => openModal('company', type)" />
          <Info2 @click="openModal('level')" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { baseConfig } from '../config';
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
      margin-top: 80px;
      padding-left: 20px;
    }
  }
</style>
