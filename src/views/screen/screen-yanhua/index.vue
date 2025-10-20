<template>
  <div class="screen-container">
    <div class="screen-base">
      <div class="screen-base-canvas">
        <!-- 使用 v-show 避免重复加载，首次加载使用 v-if 延迟初始化 -->
        <Map v-if="mapLoaded.map1" v-show="operationTab === 0" />
        <Map2 v-if="mapLoaded.map2" v-show="operationTab === 1" ref="map2Ref" />
        <!-- 其他模式（报警、风险、统计、监控）显示渐变背景 -->
        <div v-if="operationTab >= 2" class="default-background"></div>
      </div>
    </div>
    <div id="max-screen-content" class="screen-content">
      <Top @action="(index) => (operationTab = index)" ref="topTabs"/>

      <!-- 左右面板布局（综合、应急） -->
      <Left v-if="operationTab === 0" />
      <Left2 v-if="operationTab === 1" />
      <Right v-if="operationTab === 0" @handelTabs="handelTabsFast"/>
      <!-- 应急管理模式下的搜索和筛选 -->
      <SearchBox
        v-if="operationTab === 1"
        @search="handleSearch"
        @clear="handleClearSearch"
      />
      <Right2 v-if="operationTab === 1" @filter-change="handleFilterChange" />

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
  import {
    onBeforeUnmount,
    onMounted,
    ref,
    provide,
    watch,
    nextTick,
  } from 'vue';
  import Top from './Top/index.vue';
  import Map from './Map/index.vue';
  import Map2 from './Map2/index.vue';
  import Left from './Left/index.vue';
  import Left2 from './Left2/index.vue';
  import Right from './Right/index.vue';
  import Right2 from './Right2/index.vue';
  import SearchBox from './SearchBox/index.vue';
  import Bottom from './Bottom/index.vue';
  import Alarm from './Bottom/Alarm.vue';
  import Risk from './Bottom/Risk.vue';
  import Statistics from './Bottom/Statistics.vue';
  import Monitor from './Bottom/Monitor.vue';
  import DetailDrawer from './DetailDrawer/index.vue';
  import { type DrawerTypeValue, DrawerType } from './DetailDrawer/types';

  const operationTab = ref(0);
  const map2Ref = ref<any>(null);

  // 控制地图组件的延迟加载
  const mapLoaded = ref({
    map1: false, // Map 组件加载状态
    map2: false, // Map2 组件加载状态
  });

  // 底部抽屉相关
  const drawerVisible = ref(false);
  const drawerTitle = ref('');
  const drawerType = ref<DrawerTypeValue>(DrawerType.COMPANY);
  const drawerData = ref<any>(null);

  const topTabs = ref(null)

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

  // 处理搜索
  const handleSearch = (keyword: string) => {
    if (map2Ref.value) {
      map2Ref.value.setSearchKeyword(keyword);
    }
  };

  // 处理清除搜索
  const handleClearSearch = () => {
    if (map2Ref.value) {
      map2Ref.value.clearSearch();
    }
  };

  // 处理筛选变化
  const handleFilterChange = (filterTypes: Record<string, boolean>) => {
    if (map2Ref.value) {
      map2Ref.value.setFilterTypes(filterTypes);
    }
  };

  // 监听 tab 切换，实现地图组件的按需加载
  watch(
    operationTab,
    async (newVal) => {
      // 首次切换到综合监测（Map）
      if (newVal === 0 && !mapLoaded.value.map1) {
        await nextTick();
        mapLoaded.value.map1 = true;
      }
      // 首次切换到应急管理（Map2）
      if (newVal === 1 && !mapLoaded.value.map2) {
        await nextTick();
        mapLoaded.value.map2 = true;
      }
    },
    { immediate: true }
  ); // immediate: true 确保初始时加载第一个地图

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


  // 切换导航
  function handelTabsFast(rows:any){
    nextTick(()=>{
      topTabs.value.actionChange(rows.tabsIndex)
    })
  }
  onMounted(async () => {
    adjustScale();
    window.addEventListener('resize', adjustScale);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustScale);
  });
</script>

<style scoped lang="less">
  .screen-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    overflow-y: auto;
    background: #061834 !important;
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
    background: transparent; /* 确保基础层透明，显示容器背景 */

    .screen-base-canvas {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: transparent; /* 画布层也保持透明 */
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

  .default-background {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0; /* 确保在最底层 */
    width: 100%;
    height: 100%;
    background: #061834;
  }
</style>
