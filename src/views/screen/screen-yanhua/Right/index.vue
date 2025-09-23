<template>
  <div
    class="content-right"
    :style="`z-index: ${baseConfig.rightConfig.zIndex}`"
  >
    <div class="content-right-main">
      <R1 />
      <R2 />
      <R3 />
      <!-- <Info @clickAction="(type) => openModal('company', type)" />
          <Info2 @click="openModal('level')" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { baseConfig } from '../config';
  import R1 from './R1.vue';
  import R2 from './R2.vue';
  import R3 from './R3.vue';
</script>

<style scoped lang="less">
  .content-right {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    justify-content: end;
    width: 700px;
    min-width: 440px;
    height: 100%;

    .content-right-main {
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 460px;
      margin-top: 80px;
      padding-right: 20px;
    }
  }
</style>
