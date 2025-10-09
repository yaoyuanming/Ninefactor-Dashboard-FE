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
      <!-- 政府应急预案 -->
      <GovernmentPlan v-if="activeNav === 'government-plan'" />

      <!-- 企业应急预案 -->
      <EnterprisePlan v-if="activeNav === 'enterprise-plan'" />

      <!-- 应急专家 -->
      <EmergencyExpert v-if="activeNav === 'emergency-expert'" />

      <!-- 救援力量 -->
      <RescueForce v-if="activeNav === 'rescue-force'" />

      <!-- 医疗机构 -->
      <MedicalInstitution v-if="activeNav === 'medical-institution'" />

      <!-- 应急装备 -->
      <EmergencyEquipment v-if="activeNav === 'emergency-equipment'" />

      <!-- 应急物资 -->
      <EmergencySupplies v-if="activeNav === 'emergency-supplies'" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import GovernmentPlan from './government-plan/index.vue';
  import EnterprisePlan from './enterprise-plan/index.vue';
  import EmergencyExpert from './emergency-expert/index.vue';
  import RescueForce from './rescue-force/index.vue';
  import MedicalInstitution from './medical-institution/index.vue';
  import EmergencyEquipment from './emergency-equipment/index.vue';
  import EmergencySupplies from './emergency-supplies/index.vue';

  // 导航配置
  const navList = [
    { label: '政府应急预案', value: 'government-plan' },
    { label: '企业应急预案', value: 'enterprise-plan' },
    { label: '应急专家', value: 'emergency-expert' },
    { label: '救援力量', value: 'rescue-force' },
    { label: '医疗机构', value: 'medical-institution' },
    { label: '应急装备', value: 'emergency-equipment' },
    { label: '应急物资', value: 'emergency-supplies' },
  ];

  // 当前激活的导航
  const activeNav = ref('government-plan');

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
