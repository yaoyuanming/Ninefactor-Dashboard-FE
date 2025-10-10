<template>
  <div class="rescue-force-container">
    <List
      v-if="currentView === 'list'"
      @view="handleView"
      @create="handleCreate"
    />
    <Detail
      v-if="currentView === 'detail'"
      :data="currentData"
      @back="handleBack"
    />
    <Create
      v-if="currentView === 'create'"
      :edit-data="currentData"
      @back="handleBack"
      @success="handleSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { type RescueTeamVO } from '@/api/emergency';
  import List from './List.vue';
  import Detail from './Detail.vue';
  import Create from './Create.vue';

  const currentView = ref<'list' | 'detail' | 'create'>('list');
  const currentData = ref<RescueTeamVO | null>(null);

  const handleView = (data: RescueTeamVO) => {
    currentData.value = data;
    currentView.value = 'detail';
  };

  const handleCreate = (data?: RescueTeamVO) => {
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
  .rescue-force-container {
    width: 100%;
    height: 100%;
  }
</style>
