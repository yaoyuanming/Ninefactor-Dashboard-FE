<template>
  <div class="statistics-page">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div
        v-for="item in navList"
        :key="item.value"
        class="nav-item"
        :class="{ active: activeNav === item.value }"
        @click="handleNavChange(item.value)"
      >
        <div class="nav-icon">
          <icon-desktop v-if="item.value === 'dynamic'" />
          <icon-location v-if="item.value === 'area'" />
          <icon-apps v-if="item.value === 'company'" />
          <icon-calendar v-if="item.value === 'patrol'" />
        </div>
        <div class="nav-label">{{ item.label }}</div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 动态感知 -->
      <DynamicSensing v-if="activeNav === 'dynamic'" />

      <!-- 区域报警统计 -->
      <AreaAlarmStats v-if="activeNav === 'area'" />

      <!-- 企业报警统计 -->
      <CompanyAlarmStats v-if="activeNav === 'company'" />

      <!-- 巡查统计 -->
      <PatrolStats v-if="activeNav === 'patrol'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import DynamicSensing from './Statistics/DynamicSensing.vue';
  import AreaAlarmStats from './Statistics/AreaAlarmStats.vue';
  import CompanyAlarmStats from './Statistics/CompanyAlarmStats.vue';
  import PatrolStats from './Statistics/PatrolStats.vue';

  // 左侧导航配置
  const navList = [
    { label: '动态感知', value: 'dynamic' },
    { label: '区域报警统计', value: 'area' },
    { label: '企业报警统计', value: 'company' },
    { label: '巡查统计', value: 'patrol' },
  ];

  // 当前激活的导航
  const activeNav = ref('dynamic');

  // 导航切换
  const handleNavChange = (value: string) => {
    activeNav.value = value;
  };
</script>

<style scoped lang="less">
  .statistics-page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    overflow: hidden;
    background: transparent;

    // 顶部导航栏
    .top-nav {
      display: flex;
      flex-shrink: 0;
      gap: 10px;
      margin-bottom: 20px;
      padding: 10px 20px;
      background: rgb(10 30 60 / 30%);
      border: 1px solid rgb(23 150 250 / 10%);
      border-radius: 4px;

      .nav-item {
        display: flex;
        align-items: center;
        padding: 12px 24px;
        color: rgb(255 255 255 / 70%);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          font-size: 18px;
        }

        .nav-label {
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
        }

        &:hover {
          color: rgb(255 255 255 / 90%);
          background: rgb(23 150 250 / 10%);
        }

        &.active {
          color: #fff;
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);
        }
      }
    }

    // 内容区域
    .content-area {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
      background: rgb(10 30 60 / 30%);
      border: 1px solid rgb(23 150 250 / 10%);
      border-radius: 4px;
    }
  }
</style>
