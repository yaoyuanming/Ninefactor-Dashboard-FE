<template>
  <div class="statistics-page">
    <!-- 左侧导航栏 -->
    <div class="left-nav">
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

    <!-- 右侧内容区域 -->
    <div class="right-content">
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
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    overflow: hidden;
    background: transparent;

    // 左侧导航栏
    .left-nav {
      flex-shrink: 0;
      width: 180px;
      margin-right: 20px;
      padding: 10px 0;
      background: rgb(10 30 60 / 30%);
      border: 1px solid rgb(23 150 250 / 10%);
      border-radius: 4px;

      .nav-item {
        display: flex;
        align-items: center;
        margin: 4px 8px;
        padding: 16px 20px;
        color: rgb(255 255 255 / 70%);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 20px;
        }

        .nav-label {
          font-weight: 500;
          font-size: 14px;
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

    // 右侧内容区域
    .right-content {
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
