<template>
  <div class="enterprise-plan-create">
    <div class="create-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">{{ isEdit ? '编辑预案' : '新增预案' }}</div>
    </div>

    <div class="create-content">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item label="企业名称" field="name">
          <a-input v-model="formData.name" placeholder="请输入企业名称" />
        </a-form-item>
        <a-form-item label="负责人" field="principal">
          <a-input v-model="formData.principal" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系电话" field="phone">
          <a-input v-model="formData.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="地址" field="address">
          <a-input v-model="formData.address" placeholder="请输入地址" />
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
  const formRef = ref();

  const formData = reactive({
    name: '',
    principal: '',
    phone: '',
    address: '',
  });

  const formRules = {
    name: [{ required: true, message: '请输入企业名称' }],
    principal: [{ required: true, message: '请输入负责人' }],
    phone: [
      { required: true, message: '请输入联系电话' },
      { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
    ],
    address: [{ required: true, message: '请输入地址' }],
  };

  watch(
    () => props.data,
    (newData) => {
      if (newData) {
        Object.assign(formData, newData);
      }
    },
    { immediate: true }
  );

  const handleBack = () => {
    emit('back');
  };

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (!valid) {
      Message.success(isEdit.value ? '编辑成功' : '新增成功');
      emit('success');
    }
  };
</script>

<style scoped lang="less">
  .enterprise-plan-create {
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

        .arco-input {
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
