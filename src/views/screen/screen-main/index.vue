<template>
  <div class="screen-container">
    <div class="screen-base">
      <div class="screen-base-canvas">
        <Map />
      </div>
    </div>
    <div id="max-screen-content" class="screen-content">
      <Top v-if="baseConfig.topConfig.show" />
      <Left v-if="baseConfig.leftConfig.show" />
      <Right v-if="baseConfig.rightConfig.show" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import Top from './Top/index.vue';
  import Map from './Map/index.vue';
  import Left from './Left/index.vue';
  import Right from './Right/index.vue';
  import { baseConfig } from './config';
  // import Info2 from './Info2.vue';
  // import Info3 from './Info3.vue';
  // import Info4 from './Info4.vue';
  // import Map from './Map.vue';

  function adjustScale() {
    const designWidth = 1920;
    const scaleX = window.innerWidth / designWidth;
    const screenContent = document.getElementById('max-screen-content');

    if (screenContent) {
      screenContent.style.transform = `scale(${scaleX})`;
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
