<template>
  <div class="content-left" :style="`z-index: ${baseConfig.leftConfig.zIndex}`">
    <div class="content-left-main">
      <img
        style="width: 460px; cursor: pointer"
        src="@/assets/screen/left2.png"
        @click="handleOpenEmergency"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject } from 'vue';
  import { baseConfig } from '../config';
  import { DrawerType } from '../DetailDrawer/types';

  // 注入打开抽屉的方法
  const openDrawer =
    inject<(type: DrawerType, title: string, data?: any) => void>('openDrawer');

  // 打开应急管理抽屉
  const handleOpenEmergency = () => {
    if (openDrawer) {
      openDrawer(DrawerType.EMERGENCY_MANAGEMENT, '应急管理');
    }
  };
</script>

<style scoped lang="less">
  .content-left {
    position: absolute;
    top: 0;
    left: 0;
    width: 700px;
    min-width: 440px;
    height: 100%;
    pointer-events: auto; // 恢复点击事件

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
