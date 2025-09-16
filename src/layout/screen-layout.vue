<template>
  <router-view v-slot="{ Component, route }">
    <!-- <transition name="fade" mode="out-in" appear> -->
    <dev :key="$route.fullPath" class="page-body">
      <component :is="Component" :key="route.fullPath" />
      <!-- <keep-alive v-else :include="cacheList">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive> -->
    </dev>
    <!-- </transition> -->
  </router-view>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  // import { useTabBarStore } from '@/store';

  // const tabBarStore = useTabBarStore();
  // const cacheList = computed(() => tabBarStore.getCacheList);
</script>

<style lang="less" scoped>
  .page-body {
    height: 100%;
    overflow: auto;
  }
</style>
