<template>
  <div class="government-plan-container">
    <!-- 列表页 -->
    <List
      v-if="currentView === 'list'"
      @view="handleView"
      @create="handleCreate"
    />

    <!-- 详情页 -->
    <Detail
      v-if="currentView === 'detail'"
      :data="currentData"
      @back="handleBack"
    />

    <!-- 新增/编辑页 -->
    <Create
      v-if="currentView === 'create'"
      :data="currentData"
      @back="handleBack"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import List from './List.vue';
  import Detail from './Detail.vue';
  import Create from './Create.vue';

  // 当前视图：list-列表, detail-详情, create-新增/编辑
  const currentView = ref<'list' | 'detail' | 'create'>('list');
  const currentData = ref<any>(null);

  // 查看详情
  const handleView = (data: any) => {
    currentData.value = data;
    currentView.value = 'detail';
  };

  // 新增
  const handleCreate = (data?: any) => {
    currentData.value = data || null;
    currentView.value = 'create';
  };

  // 返回列表
  const handleBack = () => {
    currentView.value = 'list';
    currentData.value = null;
  };

  // 操作成功
  const handleSuccess = () => {
    currentView.value = 'list';
    currentData.value = null;
  };
</script>

<style scoped lang="less">
  .government-plan-container {
    width: 100%;
    height: 100%;
  }
</style>
