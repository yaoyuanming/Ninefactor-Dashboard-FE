<template>
  <div class="enterprise-committee-container">
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

  const currentView = ref<'list' | 'detail' | 'create'>('list');
  const currentData = ref<any>(null);

  const handleView = (data: any) => {
    currentData.value = data;
    currentView.value = 'detail';
  };

  const handleCreate = (data?: any) => {
    currentData.value = data || null;
    currentView.value = 'create';
  };

  const handleBack = () => {
    currentView.value = 'list';
    currentData.value = null;
  };

  const handleSuccess = () => {
    currentView.value = 'list';
    currentData.value = null;
  };
</script>

<style scoped lang="less">
  .enterprise-committee-container {
    width: 100%;
    height: 100%;
  }
</style>
