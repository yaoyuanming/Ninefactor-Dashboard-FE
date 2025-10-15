<template>
  <a-modal
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :mask-closable="false"
    @before-ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-col-flex="80px"
      layout="vertical"
    >
      <a-form-item label="角色名称" field="roleName">
        <a-input
          v-model="formData.roleName"
          placeholder="请输入角色名称"
          :max-length="30"
          show-word-limit
        />
      </a-form-item>
      <a-form-item label="角色标识" field="roleKey">
        <a-input
          v-model="formData.roleKey"
          placeholder="请输入角色标识"
          :max-length="100"
          show-word-limit
        />
      </a-form-item>
      <a-form-item label="显示顺序" field="roleSort">
        <a-input-number
          v-model="formData.roleSort"
          placeholder="请输入显示顺序"
          :min="0"
          mode="button"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="状态" field="status">
        <a-radio-group v-model="formData.status">
          <a-radio value="0">正常</a-radio>
          <a-radio value="1">停用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="备注" field="remark">
        <a-textarea
          v-model="formData.remark"
          placeholder="请输入备注"
          :max-length="500"
          show-word-limit
          :auto-size="{
            minRows: 3,
            maxRows: 5,
          }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import {
    addRole,
    editRole,
    getRoleDetail,
    type RoleReqDTO,
  } from '@/api/system/role';

  interface Props {
    visible: boolean;
    mode: 'add' | 'edit';
    data?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:visible', 'success']);

  const formRef = ref<FormInstance>();
  const loading = ref(false);
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  const dialogTitle = computed(() => {
    return props.mode === 'add' ? '新增角色' : '编辑角色';
  });

  const formData = ref<RoleReqDTO>({
    id: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    remark: '',
  });

  const formRules = {
    roleName: [
      { required: true, message: '请输入角色名称' },
      { max: 30, message: '角色名称长度不能超过30个字符' },
    ],
    roleKey: [
      { required: true, message: '请输入角色标识' },
      { max: 100, message: '角色标识长度不能超过100个字符' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '角色标识必须以字母开头，只能包含字母、数字和下划线',
      },
    ],
    roleSort: [{ required: true, message: '请输入显示顺序' }],
    status: [{ required: true, message: '请选择状态' }],
  };

  // 监听对话框显示状态
  watch(
    () => props.visible,
    async (val) => {
      if (val) {
        if (props.mode === 'edit' && props.data?.id) {
          // 编辑模式，获取详情
          loading.value = true;
          try {
            const res = await getRoleDetail(props.data.id);
            const data = res.data || res; // 兼容不同的响应格式
            formData.value = {
              id: data.id,
              roleName: data.roleName,
              roleKey: data.roleKey,
              roleSort: data.roleSort || 0,
              status: data.status,
              remark: data.remark || '',
            };
          } catch (error) {
            // console.error(error);
          } finally {
            loading.value = false;
          }
        } else {
          // 新增模式，重置表单
          formData.value = {
            id: undefined,
            roleName: '',
            roleKey: '',
            roleSort: 0,
            status: '0',
            remark: '',
          };
        }
      }
    }
  );

  // 提交表单
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (!valid) {
      loading.value = true;
      try {
        if (props.mode === 'add') {
          await addRole(formData.value);
          Message.success('新增成功');
        } else {
          await editRole(formData.value);
          Message.success('修改成功');
        }
        dialogVisible.value = false;
        emit('success');
      } catch (error) {
        // console.error(error);
      } finally {
        loading.value = false;
      }
    }
    return false;
  };

  // 取消
  const handleCancel = () => {
    formRef.value?.resetFields();
  };
</script>

<style scoped lang="less"></style>
