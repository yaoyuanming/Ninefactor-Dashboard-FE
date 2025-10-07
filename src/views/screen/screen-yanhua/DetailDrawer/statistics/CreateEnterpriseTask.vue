<template>
  <div class="enterprise-task-form">
    <div class="form-content">
      <div class="form-item">
        <div class="form-label required">任务名称</div>
        <a-input
          v-model="formData.taskName"
          placeholder="请输入任务名称"
          :max-length="50"
          size="large"
          style="max-width: 600px"
        />
      </div>

      <div class="form-item">
        <div class="form-label required">抽查企业</div>
        <CompanySelect
          v-model="formData.targetCompanyIds"
          placeholder="请选择抽查企业"
          :multiple="true"
          size="large"
          style="max-width: 600px"
          @change="handleCompanyChange"
        />
      </div>

      <div class="form-item">
        <div class="form-label">立即执行</div>
        <a-switch
          v-model="formData.executeImmediately"
          :checked-value="1"
          :unchecked-value="0"
        />
      </div>

      <div class="form-item">
        <div class="form-label">任务描述</div>
        <a-textarea
          v-model="formData.description"
          placeholder="请输入任务描述"
          :max-length="200"
          :auto-size="{ minRows: 4, maxRows: 6 }"
          show-word-limit
          style="max-width: 600px"
        />
      </div>
    </div>

    <div class="form-actions">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="submitting" @click="handleSubmit">
        提交
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    createInspectionTask,
    type InspectionTaskVO,
  } from '@/api/statistics';
  import CompanySelect from '../../components/CompanySelect/index.vue';

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;
  }>();

  const submitting = ref(false);

  const formData = reactive({
    taskName: '',
    targetCompanyIds: [] as string[],
    targetCompanyNames: '',
    executeImmediately: 0,
    description: '',
  });

  // 处理企业变化
  const handleCompanyChange = (
    value: string | string[] | null,
    names?: string
  ) => {
    if (Array.isArray(value)) {
      formData.targetCompanyIds = value;
    } else if (value) {
      formData.targetCompanyIds = [value];
    } else {
      formData.targetCompanyIds = [];
    }
    formData.targetCompanyNames = names || '';
  };

  const handleCancel = () => {
    emit('close');
  };

  const handleSubmit = async () => {
    // 手动验证
    if (!formData.taskName) {
      Message.error('请输入任务名称');
      return;
    }
    if (!formData.targetCompanyIds || formData.targetCompanyIds.length === 0) {
      Message.error('请选择抽查企业');
      return;
    }

    submitting.value = true;
    try {
      const params: InspectionTaskVO = {
        taskName: formData.taskName,
        taskType: 2,
        targetCompanyIds: formData.targetCompanyIds.join(','),
        targetCompanyNames: formData.targetCompanyNames,
        executeImmediately: formData.executeImmediately,
        description: formData.description,
      };
      await createInspectionTask(params);

      Message.success('创建企业抽查任务成功');
      emit('success');
      emit('close');
    } catch (error) {
      Message.error('创建失败，请重试');
    } finally {
      submitting.value = false;
    }
  };
</script>

<style scoped lang="less">
  .enterprise-task-form {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px 0;

    .form-content {
      flex: 1;
      padding-right: 10px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(23 150 250 / 30%);
        border-radius: 3px;

        &:hover {
          background: rgb(23 150 250 / 50%);
        }
      }
    }

    .form-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-label {
      margin-bottom: 8px;
      color: rgb(255 255 255 / 90%);
      font-weight: 500;
      font-size: 14px;

      &.required::before {
        margin-right: 4px;
        color: #ff6b6b;
        content: '*';
      }
    }

    :deep(.arco-input),
    :deep(.arco-select-view),
    :deep(.arco-textarea) {
      color: rgb(255 255 255 / 85%) !important;
      background: rgb(0 0 0 / 30%) !important;
      border-color: rgb(255 255 255 / 15%);
      transition: all 0.3s ease;

      &::placeholder {
        color: rgb(255 255 255 / 40%) !important;
      }

      &:hover {
        background: rgb(0 0 0 / 40%) !important;
        border-color: rgb(23 150 250 / 50%);
      }

      &:focus,
      &.arco-select-view-focus {
        background: rgb(0 0 0 / 50%) !important;
        border-color: #1796fa;
        box-shadow: 0 0 0 2px rgb(23 150 250 / 20%);
      }
    }

    :deep(.arco-input-wrapper) {
      background: transparent !important;
    }

    :deep(.arco-input-size-large),
    :deep(.arco-select-size-large) {
      height: 40px;
      font-size: 14px;
    }

    :deep(.arco-select-view-suffix) {
      color: rgb(255 255 255 / 50%);
    }

    :deep(.arco-select-view-tag) {
      color: rgb(255 255 255 / 85%);
      background: rgb(23 150 250 / 20%);
      border-color: rgb(23 150 250 / 30%);

      .arco-tag-icon-hover {
        color: rgb(255 255 255 / 70%);

        &:hover {
          color: #fff;
          background: rgb(23 150 250 / 30%);
        }
      }
    }

    :deep(.arco-textarea) {
      min-height: 100px !important;
      font-size: 14px;
      resize: none;
    }

    :deep(.arco-textarea-wrapper) {
      background: transparent !important;

      .arco-textarea-word-limit {
        color: rgb(255 255 255 / 50%);
        background: transparent;
      }
    }

    :deep(.arco-switch) {
      background: rgb(255 255 255 / 20%);
      border: 1px solid rgb(255 255 255 / 15%);

      &.arco-switch-checked {
        background: #1796fa;
        border-color: #1796fa;
      }

      .arco-switch-dot {
        background: #fff;
      }
    }

    :deep(.arco-select-dropdown) {
      background: #0a2744 !important;
      border-color: rgb(23 150 250 / 20%);
      box-shadow: 0 4px 16px rgb(0 0 0 / 40%);

      .arco-select-option {
        padding: 8px 12px;
        color: rgb(255 255 255 / 85%);
        transition: all 0.2s ease;

        &:hover {
          background: rgb(23 150 250 / 20%);
        }

        &.arco-select-option-selected {
          color: #1796fa;
          font-weight: 500;
          background: rgb(23 150 250 / 30%);
        }

        &.arco-select-option-disabled {
          color: rgb(255 255 255 / 30%);
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 16px;
      padding-top: 24px;
      background: transparent;
      border-top: 1px solid rgb(255 255 255 / 10%);

      .arco-btn {
        min-width: 80px;
        height: 36px;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .arco-btn-primary {
        background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
        border: none;
        box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

        &:hover {
          background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
          box-shadow: 0 4px 12px rgb(23 150 250 / 40%);
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }

      .arco-btn:not(.arco-btn-primary) {
        color: rgb(255 255 255 / 85%);
        background: rgb(0 0 0 / 30%);
        border-color: rgb(255 255 255 / 15%);

        &:hover {
          background: rgb(0 0 0 / 40%);
          border-color: rgb(23 150 250 / 50%);
        }
      }
    }
  }
</style>
