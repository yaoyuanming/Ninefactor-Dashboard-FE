<template>
  <div
    class="content-right"
    :style="`z-index: ${baseConfig.rightConfig.zIndex}`"
  >
    <div class="content-right-main">
      <R1 @handel-click="handelTitleClick" />
      <R2 @handel-click="handelTitleClick" />
      <R3 @handel-click="handelTitleClick" />
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

  const emits = defineEmits(['handelTabs']);

  function handelTitleClick(rows) {
    emits('handelTabs', rows);
  }
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
      height: calc(1080px - 80px);
      margin-top: 80px;
      padding-right: 20px;
      overflow-x: hidden;
      overflow-y: auto;

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgb(255 255 255 / 5%);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(255 255 255 / 20%);
        border-radius: 3px;

        &:hover {
          background: rgb(255 255 255 / 30%);
        }
      }
    }
  }
</style>
