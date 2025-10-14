<template>
  <a-modal
    :visible="visible"
    title="权限配置"
    :width="700"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <div class="permission-container">
      <a-tree
        v-model:checked-keys="checkedKeys"
        :data="treeData"
        :checkable="true"
        :default-expand-all="true"
      />
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  const props = defineProps<{
    visible: boolean;
    data: any;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
    'success': [];
  }>();

  const checkedKeys = ref<string[]>([]);

  const treeData = ref([
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '部门管理', key: 'system-dept' },
        { title: '区域管理', key: 'system-region' },
        { title: '账号管理', key: 'system-account' },
        { title: '角色管理', key: 'system-role' },
      ],
    },
    {
      title: '应急管理',
      key: 'emergency',
      children: [
        { title: '政府应急预案', key: 'emergency-govt' },
        { title: '企业应急预案', key: 'emergency-ent' },
        { title: '应急专家', key: 'emergency-expert' },
        { title: '救援力量', key: 'emergency-rescue' },
        { title: '医疗机构', key: 'emergency-medical' },
        { title: '应急物资', key: 'emergency-supplies' },
        { title: '应急装备', key: 'emergency-equipment' },
      ],
    },
    {
      title: '监控报警',
      key: 'monitor',
      children: [
        { title: '实时监控', key: 'monitor-realtime' },
        { title: '报警管理', key: 'monitor-alarm' },
        { title: '视频回放', key: 'monitor-playback' },
      ],
    },
    {
      title: '统计分析',
      key: 'statistics',
      children: [
        { title: '综合统计', key: 'statistics-overview' },
        { title: '报警统计', key: 'statistics-alarm' },
        { title: '风险分析', key: 'statistics-risk' },
      ],
    },
  ]);

  watch(
    () => props.data,
    (newVal) => {
      if (newVal) {
        // 模拟已有权限
        if (newVal.code === 'admin') {
          // 管理员拥有所有权限
          checkedKeys.value = [
            'system-dept',
            'system-region',
            'system-account',
            'system-role',
            'emergency-govt',
            'emergency-ent',
            'emergency-expert',
            'emergency-rescue',
            'emergency-medical',
            'emergency-supplies',
            'emergency-equipment',
            'monitor-realtime',
            'monitor-alarm',
            'monitor-playback',
            'statistics-overview',
            'statistics-alarm',
            'statistics-risk',
          ];
        } else {
          checkedKeys.value = [];
        }
      }
    },
    { immediate: true }
  );

  const handleSubmit = () => {
    emit('success');
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };
</script>

<style scoped lang="less">
  .permission-container {
    max-height: 400px;
    padding: 10px;
    overflow-y: auto;
  }
</style>
