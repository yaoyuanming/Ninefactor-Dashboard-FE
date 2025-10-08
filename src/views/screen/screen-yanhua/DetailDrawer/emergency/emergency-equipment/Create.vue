<template>
  <div class="equipment-create">
    <div class="create-header">
      <a-button @click="emit('back')"><icon-arrow-left />返回列表</a-button>
      <div class="header-title">{{ data ? '编辑装备' : '新增装备' }}</div>
    </div>
    <div class="create-content">
      <a-form ref="formRef" :model="formData" :label-col-props="{ span: 6 }">
        <a-form-item label="装备名称" field="name" required>
          <a-input v-model="formData.name" placeholder="请输入装备名称" />
        </a-form-item>
        <a-form-item label="装备类型" field="type" required>
          <a-input v-model="formData.type" placeholder="请输入装备类型" />
        </a-form-item>
        <a-form-item label="数量" field="quantity" required>
          <a-input-number
            v-model="formData.quantity"
            placeholder="请输入数量"
          />
        </a-form-item>
        <a-form-item label="状态" field="status" required>
          <a-select v-model="formData.status" placeholder="请选择状态">
            <a-option value="正常">正常</a-option>
            <a-option value="维修">维修</a-option>
            <a-option value="报废">报废</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="存放位置" field="location" required>
          <a-input v-model="formData.location" placeholder="请输入存放位置" />
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
    type: '',
    quantity: 0,
    status: '',
    location: '',
  });
</script>

<style scoped lang="less">
  .equipment-create {
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

        .arco-input,
        .arco-input-number,
        .arco-select {
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
