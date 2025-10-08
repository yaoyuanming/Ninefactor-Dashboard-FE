<template>
  <div class="emergency-committee-create">
    <div class="create-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">{{ isEdit ? '编辑成员' : '新增成员' }}</div>
    </div>

    <div class="create-content">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item label="姓名" field="name">
          <a-input v-model="formData.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="单位" field="unit">
          <a-input v-model="formData.unit" placeholder="请输入单位" />
        </a-form-item>
        <a-form-item label="职务" field="position">
          <a-input v-model="formData.position" placeholder="请输入职务" />
        </a-form-item>
        <a-form-item label="联系电话" field="phone">
          <a-input v-model="formData.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea
            v-model="formData.remark"
            placeholder="请输入备注"
            :rows="4"
            :max-length="200"
            show-word-limit
          />
        </a-form-item>
      </a-form>
    </div>

    <div class="create-footer">
      <a-space>
        <a-button @click="handleBack">取消</a-button>
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';

  const props = defineProps<{
    data?: any;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'success'): void;
  }>();

  const isEdit = computed(() => !!props.data);

  // 表单引用
  const formRef = ref();

  // 表单数据
  const formData = reactive({
    name: '',
    unit: '',
    position: '',
    phone: '',
    remark: '',
  });

  // 表单验证规则
  const formRules = {
    name: [{ required: true, message: '请输入姓名' }],
    unit: [{ required: true, message: '请输入单位' }],
    position: [{ required: true, message: '请输入职务' }],
    phone: [
      { required: true, message: '请输入联系电话' },
      { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
    ],
  };

  // 监听数据变化，用于编辑时回显
  watch(
    () => props.data,
    (newData) => {
      if (newData) {
        Object.assign(formData, {
          name: newData.name || '',
          unit: newData.unit || '',
          position: newData.position || '',
          phone: newData.phone || '',
          remark: newData.remark || '',
        });
      }
    },
    { immediate: true }
  );

  // 返回
  const handleBack = () => {
    emit('back');
  };

  // 提交
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (!valid) {
      try {
        // TODO: 调用接口提交数据
        // if (isEdit.value) {
        //   await updateEmergencyCommittee({ id: props.data.id, ...formData });
        // } else {
        //   await createEmergencyCommittee(formData);
        // }
        Message.success(isEdit.value ? '编辑成功' : '新增成功');
        emit('success');
      } catch (error) {
        Message.error('操作失败');
      }
    }
  };
</script>

<style scoped lang="less">
  .emergency-committee-create {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .create-header {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;

      .header-title {
        color: #fff;
        font-weight: 600;
        font-size: 18px;
      }
    }

    .create-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: rgb(10 30 60 / 20%);
      border: 1px solid rgb(23 150 250 / 10%);
      border-radius: 8px;

      :deep(.arco-form) {
        max-width: 800px;

        .arco-form-item-label-col {
          color: rgb(255 255 255 / 85%);
        }

        .arco-input,
        .arco-textarea {
          color: rgb(255 255 255 / 85%);
          background: rgb(10 30 60 / 30%);
          border-color: rgb(23 150 250 / 20%);

          &::placeholder {
            color: rgb(255 255 255 / 30%);
          }
        }
      }
    }

    .create-footer {
      display: flex;
      justify-content: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgb(23 150 250 / 10%);
    }
  }
</style>
