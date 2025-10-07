<template>
  <div class="screen-container">
    <div class="screen-base">
      <div class="screen-base-canvas">
        <Map />
      </div>
    </div>
    <div id="max-screen-content" class="screen-content">
      <Top @action="(index) => (operationTab = index)" />

      <!-- 左右面板布局（综合、应急） -->
      <Left v-if="operationTab === 0" />
      <Left2 v-if="operationTab === 1" />
      <Right v-if="operationTab === 0" />

      <!-- 底部全屏布局（报警、风险、统计、监控） -->
      <Bottom v-if="operationTab === 2">
        <Alarm />
      </Bottom>

      <Bottom v-if="operationTab === 3">
        <Risk />
      </Bottom>

      <Bottom v-if="operationTab === 4">
        <Statistics />
      </Bottom>

      <Bottom v-if="operationTab === 5">
        <Monitor />
      </Bottom>
    </div>

    <!-- 底部抽屉 -->
    <DetailDrawer
      v-model:visible="drawerVisible"
      :title="drawerTitle"
      :type="drawerType"
      :data="drawerData"
      @success="handleDrawerSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref, provide } from 'vue';
  import Top from './Top/index.vue';
  import Map from './Map/index.vue';
  import Left from './Left/index.vue';
  import Left2 from './Left2/index.vue';
  import Right from './Right/index.vue';
  import Bottom from './Bottom/index.vue';
  import Alarm from './Bottom/Alarm.vue';
  import Risk from './Bottom/Risk.vue';
  import Statistics from './Bottom/Statistics.vue';
  import Monitor from './Bottom/Monitor.vue';
  import DetailDrawer from './DetailDrawer/index.vue';
  import { type DrawerTypeValue, DrawerType } from './DetailDrawer/types';
  import { baseConfig } from './config';

  const operationTab = ref(0);

  // 底部抽屉相关
  const drawerVisible = ref(false);
  const drawerTitle = ref('');
  const drawerType = ref<DrawerTypeValue>(DrawerType.COMPANY);
  const drawerData = ref<any>(null);

  // 提供给子组件调用的方法
  const openDrawer = (type: DrawerTypeValue, title: string, data?: any) => {
    drawerType.value = type;
    drawerTitle.value = title;
    drawerData.value = data;
    drawerVisible.value = true;
  };

  provide('openDrawer', openDrawer);

  // 抽屉成功回调（通知子组件刷新数据）
  const drawerSuccessCallback = ref<(() => void) | null>(null);

  const handleDrawerSuccess = () => {
    if (drawerSuccessCallback.value) {
      drawerSuccessCallback.value();
    }
  };

  provide('setDrawerSuccessCallback', (callback: () => void) => {
    drawerSuccessCallback.value = callback;
  });

  function adjustScale() {
    const designWidth = 1920;
    const designHeight = 1080;
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    // 计算宽高缩放比例，取最小值保证内容完整显示
    const scaleX = currentWidth / designWidth;
    const scaleY = currentHeight / designHeight;
    const scale = Math.min(scaleX, scaleY);

    // 设置最小缩放比例，避免内容过小
    const minScale = 0.6;
    const finalScale = Math.max(scale, minScale);

    const screenContent = document.getElementById('max-screen-content');
    if (screenContent) {
      screenContent.style.transform = `scale(${finalScale})`;
      screenContent.style.transformOrigin = '0 0';

      // 计算偏移量使内容居中
      const offsetX = (currentWidth - designWidth * finalScale) / 2;
      // const offsetY = (currentHeight - designHeight * finalScale) / 2;
      screenContent.style.left = `${offsetX}px`;
      screenContent.style.top = `0px`;
    }
  }

  onMounted(async () => {
    adjustScale();
    window.addEventListener('resize', adjustScale);
  });
  onBeforeUnmount(() => {});
</script>

<style scoped lang="less">
  .screen-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    overflow-y: auto;
    background: linear-gradient(180deg, #265d96 0%, #0f2038 100%);
    user-select: none;
  }

  .screen-base {
    position: relative;
    display: flex;
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
    width: 100%;
    min-width: 1920px;
    height: 100vh;
    min-height: 920px;

    .screen-base-canvas {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }

  .screen-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    transform-origin: 0 0;
    pointer-events: none;
  }
</style>
