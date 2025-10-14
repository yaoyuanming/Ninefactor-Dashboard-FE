<template>
  <div class="regional-task-form">
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
        <div class="form-label required">巡查时间</div>
        <div class="time-selector">
          <a-select
            v-model="formHelper.frequency"
            placeholder="请选择"
            style="width: 100px"
            size="large"
            @change="updateScheduleTime"
          >
            <a-option value="monthly">每月</a-option>
            <a-option value="weekly">每周</a-option>
            <a-option value="daily">每天</a-option>
          </a-select>
          <a-select
            v-if="formHelper.frequency === 'monthly'"
            v-model="formHelper.day"
            placeholder="请选择"
            style="width: 100px"
            size="large"
            @change="updateScheduleTime"
          >
            <a-option
              v-for="day in 31"
              :key="day"
              :value="day"
              :label="`${day}日`"
            />
          </a-select>
          <a-select
            v-if="formHelper.frequency === 'weekly'"
            v-model="formHelper.weekday"
            placeholder="请选择"
            style="width: 100px"
            size="large"
            @change="updateScheduleTime"
          >
            <a-option value="1">周一</a-option>
            <a-option value="2">周二</a-option>
            <a-option value="3">周三</a-option>
            <a-option value="4">周四</a-option>
            <a-option value="5">周五</a-option>
            <a-option value="6">周六</a-option>
            <a-option value="7">周日</a-option>
          </a-select>
          <a-time-picker
            v-model="formHelper.time"
            format="HH:mm"
            placeholder="选择时间"
            style="width: 120px"
            size="large"
            @change="updateScheduleTime"
          />
        </div>
      </div>

      <div class="form-item">
        <div class="form-label required">巡查区域</div>
        <RegionSelect
          v-model="formData.areaCodes"
          placeholder="请选择巡查区域"
          :default-first="false"
          size="large"
          style="max-width: 600px"
          @change="handleRegionChange"
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
  import RegionSelect from '../../components/RegionSelect/index.vue';

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;
  }>();

  const submitting = ref(false);

  const formData = reactive({
    taskName: '',
    areaCodes: '',
    areaNames: '',
    scheduleFrequency: 2,
    scheduleDay: 1,
    scheduleTime: '09:00:00',
    executeImmediately: 0,
    description: '',
  });

  // 辅助表单数据（用于界面展示）
  const formHelper = reactive({
    frequency: 'weekly',
    day: 1,
    weekday: '1',
    time: '09:00',
  });

  // 处理区域变化
  const handleRegionChange = (
    value: string | number | null,
    label?: string
  ) => {
    formData.areaCodes = String(value || '');
    formData.areaNames = label || '';
  };

  // 更新 scheduleTime 字段
  const updateScheduleTime = () => {
    // 转换频率
    if (formHelper.frequency === 'daily') {
      formData.scheduleFrequency = 1;
    } else if (formHelper.frequency === 'weekly') {
      formData.scheduleFrequency = 2;
    } else if (formHelper.frequency === 'monthly') {
      formData.scheduleFrequency = 3;
    }

    // 转换执行日期
    if (formHelper.frequency === 'weekly') {
      formData.scheduleDay = Number(formHelper.weekday) || 1;
    } else if (formHelper.frequency === 'monthly') {
      formData.scheduleDay = Number(formHelper.day) || 1;
    }

    // 转换时间为 HH:mm:ss 格式
    if (formHelper.time) {
      formData.scheduleTime = `${formHelper.time}:00`;
    }
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
    if (!formData.areaCodes) {
      Message.error('请选择巡查区域');
      return;
    }

    submitting.value = true;
    try {
      const params: InspectionTaskVO = {
        taskName: formData.taskName,
        taskType: 1,
        areaCodes: formData.areaCodes,
        areaNames: formData.areaNames,
        scheduleFrequency: formData.scheduleFrequency,
        scheduleDay: formData.scheduleDay,
        scheduleTime: formData.scheduleTime,
        executeImmediately: formData.executeImmediately,
        description: formData.description,
      };
      await createInspectionTask(params);

      Message.success('创建地区巡查任务成功');
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
  .regional-task-form {
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
    :deep(.arco-select-size-large),
    :deep(.arco-picker-size-large) {
      height: 40px;
      font-size: 14px;
    }

    :deep(.arco-select-view-suffix),
    :deep(.arco-picker-suffix) {
      color: rgb(255 255 255 / 50%);
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

    :deep(.arco-picker) {
      color: rgb(255 255 255 / 85%);
      background: rgb(0 0 0 / 30%) !important;
      border-color: rgb(255 255 255 / 15%);
      transition: all 0.3s ease;

      &:hover {
        background: rgb(0 0 0 / 40%) !important;
        border-color: rgb(23 150 250 / 50%);
      }

      input {
        color: rgb(255 255 255 / 85%) !important;
        background: transparent !important;

        &::placeholder {
          color: rgb(255 255 255 / 40%) !important;
        }
      }
    }

    :deep(.arco-select-dropdown),
    :deep(.arco-picker-panel-container) {
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

      .arco-picker-cell {
        color: rgb(255 255 255 / 85%);

        &:hover {
          background: rgb(23 150 250 / 20%);
        }

        &.arco-picker-cell-selected {
          color: #1796fa;
          background: rgb(23 150 250 / 30%);
        }

        &.arco-picker-cell-disabled {
          color: rgb(255 255 255 / 30%);
        }
      }

      .arco-picker-header {
        color: rgb(255 255 255 / 85%);
        border-bottom-color: rgb(255 255 255 / 10%);
      }
    }

    .time-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
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
