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
      <a-form-item field="regionName" label="区域名称">
        <a-input v-model="formData.regionName" placeholder="请输入区域名称" />
      </a-form-item>
      <a-form-item field="regionCode" label="区域编码">
        <a-input
          v-model="formData.regionCode"
          placeholder="请输入区域编码"
          :disabled="formType === 'update'"
        />
      </a-form-item>
      <a-form-item field="parentCode" label="上级区域">
        <a-tree-select
          v-model="formData.parentCode"
          :data="regionTree"
          :field-names="{
            key: 'id',
            title: 'label',
            children: 'children',
          }"
          placeholder="请选择上级区域"
          allow-clear
          allow-search
        />
      </a-form-item>
      <a-form-item field="regionLevel" label="区域层级">
        <a-select v-model="formData.regionLevel" placeholder="请选择区域层级">
          <a-option :value="1">省</a-option>
          <a-option :value="2">市</a-option>
          <a-option :value="3">区/县</a-option>
          <a-option :value="4">乡镇/街道</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-select v-model="formData.status" placeholder="请选择状态">
          <a-option :value="1">启用</a-option>
          <a-option :value="0">停用</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="orderNum" label="排序">
        <a-input-number
          v-model="formData.orderNum"
          :min="0"
          :max="999"
          placeholder="请输入排序"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import * as RegionApi from '@/api/region';
  import type { FormInstance } from '@arco-design/web-vue';

  const emit = defineEmits(['success']);

  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const formLoading = ref(false);
  const formType = ref('');
  const formRef = ref<FormInstance>();
  const regionTree = ref<any[]>([]);

  const formData = reactive({
    id: undefined as number | undefined,
    regionCode: '',
    regionName: '',
    regionLevel: 1,
    parentCode: '0', // 默认为 "0"，表示没有父级
    orderNum: 0,
    status: 1,
  });

  const formRules = {
    regionName: [
      { required: true, message: '区域名称不能为空', trigger: 'blur' },
    ],
    regionCode: [
      { required: true, message: '区域编码不能为空', trigger: 'blur' },
    ],
    regionLevel: [
      { required: true, message: '区域层级不能为空', trigger: 'change' },
    ],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  };

  // 重置表单
  const resetForm = () => {
    formData.id = undefined;
    formData.regionCode = '';
    formData.regionName = '';
    formData.regionLevel = 1;
    formData.parentCode = '0'; // 没有父级时传 "0"
    formData.orderNum = 0;
    formData.status = 1;
    formRef.value?.resetFields();
  };

  // 获得区域树
  const getTree = async () => {
    try {
      const response = await RegionApi.getRegionTreeSelect();
      if (response.data) {
        regionTree.value = response.data;
      } else {
        regionTree.value = [];
      }
    } catch (error) {
      console.error('获取区域树失败:', error);
      regionTree.value = [];
    }
  };

  // 打开弹窗
  const open = async (type: string, id?: number) => {
    dialogVisible.value = true;
    dialogTitle.value = type === 'create' ? '新增区域' : '修改区域';
    formType.value = type;
    resetForm();

    // 获得区域树
    await getTree();

    // 修改时，设置数据
    if (id) {
      formLoading.value = true;
      try {
        const response = await RegionApi.getRegion(id);
        const { data } = response;
        formData.id = data.id;
        formData.regionCode = data.regionCode;
        formData.regionName = data.regionName;
        formData.regionLevel = data.regionLevel || 1;
        formData.parentCode = data.parentCode || '0'; // 没有父级时设为 "0"
        formData.orderNum = data.orderNum || 0;
        formData.status = data.status;
      } catch (error) {
        console.error('获取区域详情失败:', error);
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
      const data = { ...formData } as RegionApi.RegionSaveReqVO;

      if (formType.value === 'create') {
        await RegionApi.createRegion(data);
        Message.success('创建成功');
      } else {
        await RegionApi.updateRegion(data);
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
