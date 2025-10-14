<template>
  <a-modal
    :visible="visible"
    :title="mode === 'add' ? '新增角色' : '编辑角色'"
    :width="600"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
      <a-form-item field="name" label="角色名称">
        <a-input v-model="formData.name" placeholder="请输入角色名称" />
      </a-form-item>
      <a-form-item field="code" label="角色编码">
        <a-input
          v-model="formData.code"
          placeholder="请输入角色编码"
          :disabled="mode === 'edit'"
        />
      </a-form-item>
      <a-form-item field="description" label="描述">
        <a-textarea
          v-model="formData.description"
          placeholder="请输入角色描述"
          :rows="3"
        />
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-radio-group v-model="formData.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch } from 'vue';

  const props = defineProps<{
    visible: boolean;
    mode: 'add' | 'edit';
    data?: any;
  }>();

  const emit = defineEmits<{
    'update:visible': [value: boolean];
    'success': [];
  }>();

  const formRef = ref();
  const formData = reactive({
    name: '',
    code: '',
    description: '',
    status: 1,
  });

  const rules = {
    name: [{ required: true, message: '请输入角色名称' }],
    code: [{ required: true, message: '请输入角色编码' }],
  };

  watch(
    () => props.data,
    (newVal) => {
      if (newVal && props.mode === 'edit') {
        Object.assign(formData, newVal);
      } else {
        formRef.value?.resetFields();
      }
    },
    { immediate: true }
  );

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (!valid) {
      emit('success');
    }
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };
</script>
