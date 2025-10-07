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
      <CompanyDetail v-if="type === DrawerType.COMPANY" :data="data" />
      <WarehouseDetail v-if="type === DrawerType.WAREHOUSE" :data="data" />
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
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
  import CompanyDetail from './CompanyDetail.vue';
  import WarehouseDetail from './WarehouseDetail.vue';
  import CreateRegionalTask from './statistics/CreateRegionalTask.vue';
  import CreateEnterpriseTask from './statistics/CreateEnterpriseTask.vue';
  import ViewRegionalTask from './statistics/ViewRegionalTask.vue';
  import ViewEnterpriseTask from './statistics/ViewEnterpriseTask.vue';
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
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
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
