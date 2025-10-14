<template>
  <div class="enterprise-plan-create">
    <div class="create-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">{{ isEdit ? '编辑预案' : '新增预案' }}</div>
      <div class="header-actions">
        <a-button @click="handleBack">取消</a-button>
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '保存' }}
        </a-button>
      </div>
    </div>

    <a-spin :loading="dataLoading" style="flex: 1; width: 100%">
      <div class="create-content">
        <!-- 左侧：表单 -->
        <div class="form-section">
          <a-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            layout="vertical"
          >
            <a-form-item label="预案名称" field="planName" required>
              <a-input
                v-model="formData.planName"
                placeholder="请输入预案名称"
              />
            </a-form-item>

            <a-form-item label="所属企业" field="orgId" required>
              <CompanySelect
                v-model="formData.orgId"
                placeholder="请选择企业"
                :multiple="false"
                @change="handleCompanyChange"
              />
            </a-form-item>

            <a-form-item label="失效时间" field="expireTime">
              <a-date-picker
                v-model="formData.expireTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择失效时间"
                style="width: 100%"
              />
            </a-form-item>

            <a-form-item label="备注" field="remark">
              <a-textarea
                v-model="formData.remark"
                placeholder="请输入备注"
                :max-length="500"
                show-word-limit
                :auto-size="{ minRows: 4, maxRows: 8 }"
              />
            </a-form-item>
          </a-form>
        </div>

        <!-- 右侧：内容编辑区 -->
        <div class="editor-section">
          <div class="section-title">预案内容</div>
          <div class="editor-wrap">
            <a-textarea
              v-model="formData.planContent"
              placeholder="请输入预案内容"
              :auto-size="{ minRows: 20 }"
              :max-length="10000"
              show-word-limit
            />
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    createEmergencyPlan,
    updateEmergencyPlan,
    getEmergencyPlan,
    type EmergencyPlanVO,
  } from '@/api/emergency/plan';
  import CompanySelect from '../../../components/CompanySelect/index.vue';

  const props = defineProps<{
    data?: EmergencyPlanVO;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'success'): void;
  }>();

  const isEdit = computed(() => !!props.data?.id);
  const loading = ref(false);
  const dataLoading = ref(false);
  const formRef = ref();

  // 表单数据
  const formData = reactive<Partial<EmergencyPlanVO>>({
    planName: '',
    planType: 2, // 企业预案
    orgType: 2, // 企业
    orgId: undefined,
    orgName: '',
    planContent: '',
    expireTime: '',
    remark: '',
  });

  // 表单验证规则
  const formRules = {
    planName: [{ required: true, message: '请输入预案名称' }],
    orgId: [{ required: true, message: '请选择所属企业' }],
  };

  // 处理企业选择变化
  const handleCompanyChange = (value: number, companyNames?: string) => {
    formData.orgId = value;
    formData.orgName = companyNames || '';
  };

  // 加载预案详情（编辑模式）
  const loadDetail = async () => {
    if (props.data?.id) {
      dataLoading.value = true;
      try {
        const response: any = await getEmergencyPlan(props.data.id);
        const detail = response.data;

        // 回显数据
        formData.planName = detail.planName || '';
        formData.planType = detail.planType || 2;
        formData.orgType = detail.orgType || 2;
        formData.orgId = detail.orgId ? Number(detail.orgId) : undefined;
        formData.orgName = detail.orgName || '';
        formData.planContent = detail.planContent || '';
        formData.expireTime = detail.expireTime || '';
        formData.remark = detail.remark || '';
      } catch (error: any) {
        Message.error(error?.message || '加载预案详情失败');
        emit('back');
      } finally {
        dataLoading.value = false;
      }
    } else {
      // 新建模式，重置表单
      formData.planName = '';
      formData.planType = 2;
      formData.orgType = 2;
      formData.orgId = undefined;
      formData.orgName = '';
      formData.planContent = '';
      formData.expireTime = '';
      formData.remark = '';
    }
  };

  // 返回
  const handleBack = () => {
    emit('back');
  };

  // 组件挂载时加载详情（编辑模式）或重置表单（新建模式）
  onMounted(() => {
    loadDetail();
  });

  // 提交
  const handleSubmit = async () => {
    try {
      const valid = await formRef.value?.validate();
      if (valid) {
        return;
      }

      if (!formData.planContent) {
        Message.warning('请填写预案内容');
        return;
      }

      loading.value = true;

      const submitData = {
        ...formData,
        id: props.data?.id,
      };

      if (isEdit.value) {
        await updateEmergencyPlan(submitData as any);
        Message.success('更新成功');
      } else {
        await createEmergencyPlan(submitData as any);
        Message.success('保存成功');
      }

      emit('success');
    } catch (error: any) {
      Message.error(error?.message || '操作失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    // CompanySelect 组件会自动加载企业数据
  });
</script>

<style scoped lang="less">
  .enterprise-plan-create {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .create-header {
      display: flex;
      flex-shrink: 0;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;

      .header-title {
        flex: 1;
        color: rgb(255 255 255 / 95%);
        font-weight: 600;
        font-size: 18px;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      :deep(.arco-btn) {
        color: rgb(255 255 255 / 85%);
        background: rgb(255 255 255 / 8%);
        border-color: rgb(255 255 255 / 15%);

        &:hover {
          background: rgb(255 255 255 / 12%);
          border-color: rgb(23 150 250 / 50%);
        }
      }

      :deep(.arco-btn-primary) {
        color: #fff;
        background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
        border: none;
        box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

        &:hover {
          background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
          box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
        }
      }
    }

    .create-content {
      display: grid;
      flex: 1;
      grid-template-columns: 380px 1fr;
      gap: 16px;
      min-height: 0;
      overflow: hidden;

      .form-section {
        padding: 20px;
        overflow-y: auto;
        background: rgb(10 30 60 / 30%);
        border: 1px solid rgb(23 150 250 / 15%);
        border-radius: 4px;

        :deep(.arco-form) {
          .arco-form-item-label-col {
            color: rgb(255 255 255 / 85%);
            font-weight: 500;
          }

          .arco-input-wrapper,
          .arco-input,
          .arco-textarea-wrapper,
          .arco-textarea,
          .arco-picker {
            color: rgb(255 255 255 / 85%);
            background: rgb(0 0 0 / 30%) !important;
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }

            &::placeholder {
              color: rgb(255 255 255 / 40%);
            }

            input,
            textarea {
              color: rgb(255 255 255 / 85%);
              background: transparent !important;

              &::placeholder {
                color: rgb(255 255 255 / 40%);
              }
            }
          }

          .arco-form-item-message {
            color: #f53f3f;
          }
        }
      }

      .editor-section {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .section-title {
          flex-shrink: 0;
          margin-bottom: 12px;
          color: rgb(255 255 255 / 95%);
          font-weight: 600;
          font-size: 16px;
        }

        .editor-wrap {
          flex: 1;
          overflow: hidden;

          :deep(.arco-textarea-wrapper),
          :deep(.arco-textarea) {
            height: 100%;
            color: rgb(255 255 255 / 85%);
            background: rgb(10 30 60 / 20%) !important;
            border-color: rgb(23 150 250 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }

            textarea {
              height: 100% !important;
              color: rgb(255 255 255 / 85%);
              background: transparent !important;

              &::placeholder {
                color: rgb(255 255 255 / 40%);
              }
            }
          }
        }
      }
    }
  }
</style>
