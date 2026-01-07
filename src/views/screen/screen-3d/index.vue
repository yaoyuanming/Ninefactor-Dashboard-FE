<template>
  <div class="screen-container">
    <div id="screen-base" class="screen-base">
      <div class="screen-base-canvas">
        <component :is="backgroundComponent" />
      </div>
    </div>
    <div
      id="max-screen-content"
      class="screen-content"
      :class="{ 'is-panel-mode': !isMapMode }"
    >
      <Top v-if="baseConfig.topConfig.show" />
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          class="screen-panel"
          :class="isMapMode ? 'screen-panel--map' : 'screen-panel--panel'"
        />
      </router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import Top from './Top/index.vue';
  import Map from './Map/index.vue';
  import PanelBackground from './Background/PanelBackground.vue';
  import { baseConfig } from './config';

  const route = useRoute();
  const backgroundComponent = computed(() => {
    const activeRecord = route.matched[route.matched.length - 1];
    return activeRecord?.meta?.background === 'map' ? Map : PanelBackground;
  });
  const isMapMode = computed(() => {
    const activeRecord = route.matched[route.matched.length - 1];
    return activeRecord?.meta?.background !== 'panel';
  });

  function adjustScale() {
    const designWidth = 1920;
    const designHeight = 1080;
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    const scaleX = currentWidth / designWidth;
    const scaleY = currentHeight / designHeight;
    const scaleContain = Math.min(scaleX, scaleY);
    const baseScale = scaleContain;

    const minScale = 0.6;
    const finalScale = Math.max(baseScale, minScale);

    const offsetX = Math.max((currentWidth - designWidth * finalScale) / 2, 0);
    const offsetY = Math.max(
      (currentHeight - designHeight * finalScale) / 2,
      0
    );
    const stageElements = ['screen-base', 'max-screen-content'];

    stageElements.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.width = `${designWidth}px`;
      el.style.height = `${designHeight}px`;
      el.style.transform = `scale(${finalScale})`;
      el.style.transformOrigin = '0 0';
      el.style.left = `${offsetX}px`;
      el.style.top = `${offsetY}px`;
    });
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
    background: linear-gradient(180deg, #265d96 0%, #0f2038 100%);
    user-select: none;
  }

  .screen-base {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1920px;
    height: 1080px;
    transform-origin: 0 0;

    .screen-base-canvas {
      position: relative;
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

    &.is-panel-mode {
      pointer-events: auto;
    }
  }

  .screen-panel {
    width: 100%;
    height: 100%;
  }

  .screen-panel--map {
    pointer-events: none;
  }

  .screen-panel--panel {
    padding: 0 48px 48px;
    pointer-events: auto;
  }
</style>
