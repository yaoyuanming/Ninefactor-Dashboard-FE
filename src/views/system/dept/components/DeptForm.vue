<template>
  <a-modal
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    :width="600"
    @ok="submitForm"
    @cancel="dialogVisible = false"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      layout="vertical"
    >
      <a-form-item field="parentId" label="上级部门">
        <a-tree-select
          v-model="formData.parentId"
          :data="deptTree"
          :field-names="{
            key: 'id',
            title: 'label',
            children: 'children',
          }"
          placeholder="请选择上级部门"
          allow-clear
          allow-search
        />
      </a-form-item>
      <a-form-item field="deptName" label="部门名称">
        <a-input v-model="formData.deptName" placeholder="请输入部门名称" />
      </a-form-item>
      <a-form-item field="status" label="部门状态">
        <a-select v-model="formData.status" placeholder="请选择状态">
          <a-option value="0">正常</a-option>
          <a-option value="1">停用</a-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import * as DeptApi from '@/api/system/dept';
  import type { FormInstance } from '@arco-design/web-vue';

  const emit = defineEmits(['success']);

  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const formLoading = ref(false);
  const formType = ref('');
  const formRef = ref<FormInstance>();
  const deptTree = ref<any[]>([]);

  const formData = reactive({
    deptId: undefined,
    parentId: undefined,
    deptName: '',
    orderNum: 0,
    status: '0',
  });

  const formRules = {
    parentId: [
      { required: true, message: '上级部门不能为空', trigger: 'change' },
    ],
    deptName: [
      { required: true, message: '部门名称不能为空', trigger: 'blur' },
    ],
    status: [
      { required: true, message: '部门状态不能为空', trigger: 'change' },
    ],
  };

  // 重置表单
  const resetForm = () => {
    formData.deptId = undefined;
    formData.parentId = undefined;
    formData.deptName = '';
    formData.orderNum = 0;
    formData.status = '0';
    formRef.value?.resetFields();
  };

  // 获得部门树
  const getTree = async () => {
    try {
      const response = await DeptApi.getDeptTreeSelect();
      // API已经返回了正确格式的数据，直接使用
      if (response.data) {
        deptTree.value = response.data;
      } else {
        deptTree.value = [];
      }
    } catch (error) {
      // 获取部门树失败
      deptTree.value = [];
    }
  };

  // 打开弹窗
  const open = async (type: string, id?: number) => {
    dialogVisible.value = true;
    dialogTitle.value = type === 'create' ? '新增部门' : '修改部门';
    formType.value = type;
    resetForm();

    // 获得部门树
    await getTree();

    // 修改时，设置数据
    if (id) {
      formLoading.value = true;
      try {
        const response = await DeptApi.getDept(id);
        const { data } = response;
        formData.deptId = data.deptId;
        formData.parentId = data.parentId;
        formData.deptName = data.deptName;
        formData.orderNum = data.orderNum || 0;
        formData.status = String(data.status);
      } catch (error) {
        // 获取部门详情失败
      } finally {
        formLoading.value = false;
      }
    }
  };

  // 提供 open 方法
  defineExpose({ open });

  // 提交表单
  const submitForm = async () => {
    // validate() 返回 undefined 表示验证通过，返回错误对象表示验证失败
    try {
      const errors = await formRef.value?.validate();
      if (errors) {
        return; // 如果有错误，不继续提交
      }
    } catch (error) {
      return; // 验证出错，不继续提交
    }

    formLoading.value = true;
    try {
      const data = { ...formData } as any;

      if (formType.value === 'create') {
        await DeptApi.createDept(data);
        Message.success('创建成功');
      } else {
        await DeptApi.updateDept(data);
        Message.success('更新成功');
      }

      dialogVisible.value = false;
      emit('success');
    } catch (error) {
      Message.error('操作失败，请重试');
      console.error('提交失败:', error);
    } finally {
      formLoading.value = false;
    }
  };
</script>
