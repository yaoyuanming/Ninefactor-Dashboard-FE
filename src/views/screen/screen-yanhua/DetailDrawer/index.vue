<template>
  <a-drawer
    :visible="visible"
    :title="title"
    :width="1200"
    :footer="false"
    :mask-closable="true"
    :closable="true"
    placement="bottom"
    :height="'70vh'"
    unmount-on-close
    class="detail-drawer"
    @cancel="handleClose"
  >
    <div class="drawer-content">
      <CompanyTables
        v-if="type === DrawerType.COMPANY"
        ref="CompanyTable"
        :data="data"
      />
      <WarehouseTable v-if="type === DrawerType.WAREHOUSE" :data="data" />
      <CreateRegionalTask
        v-if="type === DrawerType.REGIONAL_TASK"
        @close="handleClose"
        @success="handleSuccess"
      />
      <CreateEnterpriseTask
        v-if="type === DrawerType.ENTERPRISE_TASK"
        @close="handleClose"
        @success="handleSuccess"
      />
      <ViewRegionalTask
        v-if="type === DrawerType.VIEW_REGIONAL_TASK"
        :task-id="data?.id || data"
      />
      <ViewEnterpriseTask
        v-if="type === DrawerType.VIEW_ENTERPRISE_TASK"
        :task-id="data?.id || data"
      />
      <EmergencyManagement v-if="type === DrawerType.EMERGENCY_MANAGEMENT" />
      <AlarmDetail v-if="type === DrawerType.ALARM_DETAIL" :data="data" />
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref, nextTick, watch } from 'vue';
  import CompanyTables from './Company/tables.vue';
  import WarehouseTable from './Warehouse/index.vue';
  import CreateRegionalTask from './statistics/CreateRegionalTask.vue';
  import CreateEnterpriseTask from './statistics/CreateEnterpriseTask.vue';
  import ViewRegionalTask from './statistics/ViewRegionalTask.vue';
  import ViewEnterpriseTask from './statistics/ViewEnterpriseTask.vue';
  import EmergencyManagement from './emergency/index.vue';
  import AlarmDetail from './alarm/AlarmDetail.vue';
  import { DrawerType, type DrawerTypeValue } from './types';

  const props = defineProps<{
    visible: boolean;
    title: string;
    type: DrawerTypeValue;
    data?: any;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'success'): void;
  }>();

  const handleClose = () => {
    emit('update:visible', false);
  };

  const handleSuccess = () => {
    emit('success');
  };

  // 企业
  const CompanyTable = ref(null) as any;

  function desiShow(records: any, show: boolean) {
    nextTick(() => {
      CompanyTable.value.handleEnterpriseInfo(records, show);
    });
  }

  // 监听抽屉打开，区分两种情况：
  // 1. 如果 data 只有 id 属性，直接显示企业详情（来自 Map 组件）
  // 2. 如果 data 没有 id 或有其他属性，显示企业列表（来自左侧面板）
  watch(
    () => [props.visible, props.type, props.data],
    ([visible, type, data]) => {
      if (visible && type === DrawerType.COMPANY) {
        nextTick(() => {
          // 检查是否只有 id 属性（来自 Map 组件的直接跳转）
          if (data?.id && Object.keys(data).length === 1) {
            // 等待 CompanyTable 组件加载完成
            const checkAndCall = () => {
              if (
                CompanyTable.value &&
                CompanyTable.value.goToEnterpriseDetail
              ) {
                CompanyTable.value.goToEnterpriseDetail(data.id);
              } else {
                // 如果组件还没准备好，继续等待
                setTimeout(checkAndCall, 100);
              }
            };
            checkAndCall();
          } else {
            // 显示企业列表（来自左侧面板或其他情况）
            // CompanyTable 组件会自动显示列表页面
          }
        });
      }
    },
    { immediate: true }
  );

  defineExpose({
    desiShow,
  });
</script>

<style lang="less">
  .detail-drawer {
    .arco-drawer-header {
      display: flex;
      align-items: center;
      height: 60px;
      padding: 0;
      background: #0a2744;
      border-bottom: 1px solid rgb(23 150 250 / 15%);

      .arco-drawer-title {
        padding-left: 24px;
        color: #fff;
        font-weight: 600;
        font-size: 28px;
        letter-spacing: 2px;
      }

      .arco-icon-close {
        padding: 0 24px;
        color: #fff;
        font-size: 16px;
        transition: all 0.3s;

        &:hover {
          color: #1796fa;
          background: rgb(23 150 250 / 10%);
        }
      }
    }

    .arco-drawer-body {
      padding: 30px 40px;
      overflow-y: auto;
      background: linear-gradient(180deg, #0a1929 0%, #0f2847 100%);

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgb(23 150 250 / 5%);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(23 150 250 / 30%);
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background: rgb(23 150 250 / 50%);
        }
      }
    }

    .drawer-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      animation: fadeInUp 0.4s ease-out;
    }

    @keyframes fadeInUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }

      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
</style>
