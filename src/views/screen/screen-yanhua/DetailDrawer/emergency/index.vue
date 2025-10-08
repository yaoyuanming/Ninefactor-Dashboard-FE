<template>
  <div class="emergency-management">
    <!-- 顶部导航 -->
    <div class="emergency-nav">
      <div
        v-for="item in navList"
        :key="item.value"
        class="nav-item"
        :class="{ active: activeNav === item.value }"
        @click="handleNavChange(item.value)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="emergency-content">
      <!-- 应急委员会 -->
      <EmergencyCommittee v-if="activeNav === 'emergency-committee'" />

      <!-- 企业委员会 -->
      <EnterpriseCommittee v-if="activeNav === 'enterprise-committee'" />

      <!-- 应急专家 -->
      <EmergencyExpert v-if="activeNav === 'emergency-expert'" />

      <!-- 救援力量 -->
      <RescueForce v-if="activeNav === 'rescue-force'" />

      <!-- 应急物资 -->
      <EmergencySupplies v-if="activeNav === 'emergency-supplies'" />

      <!-- 应急装备 -->
      <EmergencyEquipment v-if="activeNav === 'emergency-equipment'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import EmergencyCommittee from './emergency-committee/index.vue';
  import EnterpriseCommittee from './enterprise-committee/index.vue';
  import EmergencyExpert from './emergency-expert/index.vue';
  import RescueForce from './rescue-force/index.vue';
  import EmergencySupplies from './emergency-supplies/index.vue';
  import EmergencyEquipment from './emergency-equipment/index.vue';

  // 导航配置
  const navList = [
    { label: '应急委员会', value: 'emergency-committee' },
    { label: '企业委员会', value: 'enterprise-committee' },
    { label: '应急专家', value: 'emergency-expert' },
    { label: '救援力量', value: 'rescue-force' },
    { label: '应急物资', value: 'emergency-supplies' },
    { label: '应急装备', value: 'emergency-equipment' },
  ];

  // 当前激活的导航
  const activeNav = ref('emergency-committee');

  // 导航切换
  const handleNavChange = (value: string) => {
    activeNav.value = value;
  };
</script>

<style scoped lang="less">
  .emergency-management {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    // 顶部导航栏
    .emergency-nav {
      display: flex;
      flex-shrink: 0;
      gap: 0;
      margin-bottom: 24px;
      padding: 0;
      border-bottom: 1px solid rgb(23 150 250 / 20%);

      .nav-item {
        position: relative;
        padding: 14px 28px;
        color: rgb(255 255 255 / 70%);
        font-weight: 500;
        font-size: 16px;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.3s ease;

        &::after {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: transparent;
          transition: all 0.3s ease;
          content: '';
        }

        &:hover {
          color: rgb(255 255 255 / 90%);
          background: rgb(23 150 250 / 5%);
        }

        &.active {
          color: #1796fa;

          &::after {
            background: linear-gradient(90deg, #1796fa 0%, #0d6fbe 100%);
          }
        }
      }
    }

    // 内容区域
    .emergency-content {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
