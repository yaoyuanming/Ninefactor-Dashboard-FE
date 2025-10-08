<template>
  <div class="expert-create">
    <div class="create-header">
      <a-button @click="emit('back')"><icon-arrow-left />返回列表</a-button>
      <div class="header-title">{{ data ? '编辑专家' : '新增专家' }}</div>
    </div>
    <div class="create-content">
      <a-form ref="formRef" :model="formData" :label-col-props="{ span: 6 }">
        <a-form-item label="姓名" field="name" required>
          <a-input v-model="formData.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="专业领域" field="field" required>
          <a-input v-model="formData.field" placeholder="请输入专业领域" />
        </a-form-item>
        <a-form-item label="职称" field="title">
          <a-input v-model="formData.title" placeholder="请输入职称" />
        </a-form-item>
        <a-form-item label="联系电话" field="phone" required>
          <a-input v-model="formData.phone" placeholder="请输入联系电话" />
        </a-form-item>
      </a-form>
    </div>
    <div class="create-footer">
      <a-space>
        <a-button @click="emit('back')">取消</a-button>
        <a-button type="primary" @click="emit('success')">提交</a-button>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';

  defineProps<{ data?: any }>();
  const emit = defineEmits<{ (e: 'back'): void; (e: 'success'): void }>();

  const formData = reactive({
    name: '',
    field: '',
    title: '',
    phone: '',
  });
</script>

<style scoped lang="less">
  .expert-create {
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
      padding: 20px;
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
