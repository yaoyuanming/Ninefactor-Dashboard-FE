<template>
  <div class="screen-container">
    <div class="screen-base">
      <div class="screen-base-canvas">
        <Map />
      </div>
    </div>
    <div id="max-screen-content" class="screen-content">
      <Top />
      <div class="content-left">
        <div class="content-left-main">
          <!-- <Info @clickAction="(type) => openModal('company', type)" />
          <Info2 @click="openModal('level')" /> -->
        </div>
      </div>
      <div class="content-right">
        <div class="content-right-main">
          <!-- <Info3 />
          <Info4 @click="openModal('check')" /> -->
        </div>
      </div>
      <div class="content-bottom"> </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import Top from '@/views/screen/Top/index.vue';
  import { baseConfig } from './config';
  // import Info2 from './Info2.vue';
  // import Info3 from './Info3.vue';
  // import Info4 from './Info4.vue';
  // import Map from './Map.vue';

  function adjustScale() {
    const designWidth = 1920;
    const designHeight = 1080;
    const scaleX = window.innerWidth / designWidth;
    const scaleY = window.innerHeight / designHeight;
    const scaleMax = Math.max(scaleX, scaleY);
    const scaleMin = Math.min(scaleX, scaleY);
    const screenContent = document.getElementById('max-screen-content');
    if (screenContent) {
      if (scaleMax >= 1) {
        screenContent.style.transform = `scale(${scaleMax})`;
      } else {
        screenContent.style.transform = `scale(${scaleMin})`;
      }
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
    background: linear-gradient(180deg, #265d96 0%, #0f2038 100%);
    user-select: none;

    /* Safari */
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
    height: 100%;
    transform-origin: 0 0;
    pointer-events: none;
  }

  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 60;
    width: 100%;
    height: 100vh;
    background: rgb(0 0 0 / 60%);
  }
</style>
