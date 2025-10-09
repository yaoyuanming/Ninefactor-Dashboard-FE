<template>
  <div class="expert-create">
    <!-- 顶部操作栏 -->
    <div class="create-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">
        {{ isEdit ? '编辑应急专家' : '新增应急专家' }}
      </div>
      <a-space>
        <a-button @click="handleBack">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '保存' }}
        </a-button>
      </a-space>
    </div>

    <!-- 表单内容区 -->
    <a-spin :loading="dataLoading" style="flex: 1; width: 100%">
      <div class="create-content">
        <!-- 左侧：表单 -->
        <div class="form-section">
          <a-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            layout="horizontal"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
          >
            <a-form-item label="专家姓名" field="expertName" required>
              <a-input
                v-model="formData.expertName"
                placeholder="请输入专家姓名"
              />
            </a-form-item>

            <a-form-item label="专业领域" field="specialtyField" required>
              <a-select
                v-model="formData.specialtyField"
                placeholder="请选择专业领域"
              >
                <a-option
                  v-for="opt in specialtyFieldOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </a-select>
            </a-form-item>

            <a-form-item label="技术职称" field="technicalTitle">
              <a-input
                v-model="formData.technicalTitle"
                placeholder="请输入技术职称"
              />
            </a-form-item>

            <a-form-item label="工作单位" field="workUnit" required>
              <DeptSelect
                v-model="formData.workUnit"
                placeholder="请选择工作单位"
                :multiple="false"
              />
            </a-form-item>

            <a-form-item label="联系电话" field="contactPhone" required>
              <a-input
                v-model="formData.contactPhone"
                placeholder="请输入联系电话"
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

        <!-- 右侧：图片上传 -->
        <div class="upload-section">
          <div class="section-title">专家照片</div>
          <ImageUpload
            v-model="formData.photoUrl"
            upload-text="上传照片"
            :max-size="5"
          />
          <div class="upload-tip">
            建议尺寸：200x200像素，支持 jpg、png 格式，大小不超过 5MB
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import {
    createEmergencyExpert,
    updateEmergencyExpert,
    getEmergencyExpert,
    type EmergencyExpertVO,
  } from '@/api/emergency/expert';
  import DeptSelect from '../../../components/DeptSelect/index.vue';
  import ImageUpload from '../../../components/ImageUpload/index.vue';

  const props = defineProps<{
    data?: EmergencyExpertVO;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'success'): void;
  }>();

  const formRef = ref<FormInstance>();
  const dataLoading = ref(false);
  const submitLoading = ref(false);

  // 判断是否为编辑模式
  const isEdit = computed(() => !!props.data?.id);

  // 表单数据
  const formData = reactive<Partial<EmergencyExpertVO>>({
    expertName: '',
    specialtyField: 1,
    technicalTitle: '',
    workUnit: '',
    contactPhone: '',
    photoUrl: '',
    remark: '',
  });

  // 专业领域选项
  const specialtyFieldOptions = [
    { value: 1, label: '烟花爆竹工艺' },
    { value: 2, label: '安全管理' },
    { value: 3, label: '消防救援' },
    { value: 4, label: '化工' },
    { value: 5, label: '环境监测' },
    { value: 6, label: '其他' },
  ];

  // 表单验证规则
  const formRules = {
    expertName: [
      { required: true, message: '请输入专家姓名', trigger: 'blur' },
    ],
    specialtyField: [
      { required: true, message: '请选择专业领域', trigger: 'change' },
    ],
    workUnit: [
      { required: true, message: '请选择工作单位', trigger: 'change' },
    ],
    contactPhone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
    ],
  };

  // 加载详情数据
  const loadDetail = async () => {
    if (!props.data?.id) {
      // 新建模式，重置表单
      Object.assign(formData, {
        expertName: '',
        specialtyField: 1,
        technicalTitle: '',
        workUnit: '',
        contactPhone: '',
        photoUrl: '',
        remark: '',
      });
      return;
    }

    // 编辑模式，加载详情
    dataLoading.value = true;
    try {
      const response: any = await getEmergencyExpert(props.data.id);
      const detail = response.data;

      // 回显数据
      formData.expertName = detail.expertName || '';
      formData.specialtyField = detail.specialtyField || 1;
      formData.technicalTitle = detail.technicalTitle || '';
      formData.workUnit = detail.workUnit || '';
      formData.contactPhone = detail.contactPhone || '';
      formData.photoUrl = detail.photoUrl || '';
      formData.remark = detail.remark || '';
    } catch (error: any) {
      Message.error(error?.message || '加载专家详情失败');
    } finally {
      dataLoading.value = false;
    }
  };

  // 返回
  const handleBack = () => {
    emit('back');
  };

  // 提交
  const handleSubmit = async () => {
    try {
      const valid = await formRef.value?.validate();
      if (valid) {
        return;
      }

      submitLoading.value = true;

      // 准备提交数据
      const submitData: EmergencyExpertVO = {
        expertName: formData.expertName || '',
        specialtyField: formData.specialtyField || 1,
        technicalTitle: formData.technicalTitle,
        workUnit: formData.workUnit,
        contactPhone: formData.contactPhone,
        photoUrl: formData.photoUrl,
        remark: formData.remark,
      };

      if (isEdit.value && props.data?.id) {
        // 编辑模式
        submitData.id = props.data.id;
        await updateEmergencyExpert(submitData);
        Message.success('更新成功');
      } else {
        // 新增模式
        await createEmergencyExpert(submitData);
        Message.success('新增成功');
      }

      emit('success');
      emit('back');
    } catch (error: any) {
      Message.error(error?.message || '保存失败');
    } finally {
      submitLoading.value = false;
    }
  };

  // 组件挂载时加载详情（编辑模式）或重置表单（新建模式）
  onMounted(() => {
    loadDetail();
  });
</script>

<style scoped lang="less">
  .expert-create {
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
        background: linear-gradient(135deg, rgb(23 150 250), rgb(20 120 200));
        border: none;

        &:hover {
          background: linear-gradient(135deg, rgb(40 160 255), rgb(30 130 210));
        }
      }
    }

    .create-content {
      display: grid;
      flex: 1;
      grid-template-columns: 1fr 320px;
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
          .arco-select-view-single,
          .arco-textarea-wrapper {
            color: rgb(255 255 255 / 85%);
            background: rgb(10 30 60 / 50%);
            border-color: rgb(23 150 250 / 30%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }

            &:focus-within {
              border-color: rgb(23 150 250 / 70%);
            }

            input,
            textarea,
            .arco-select-view-value {
              color: rgb(255 255 255 / 85%);
              background: transparent;

              &::placeholder {
                color: rgb(255 255 255 / 40%);
              }
            }

            .arco-input,
            .arco-textarea {
              background: transparent;
            }
          }
        }
      }

      .upload-section {
        padding: 20px;
        overflow-y: auto;
        background: rgb(10 30 60 / 30%);
        border: 1px solid rgb(23 150 250 / 15%);
        border-radius: 4px;

        .section-title {
          margin-bottom: 16px;
          color: rgb(255 255 255 / 95%);
          font-weight: 600;
          font-size: 16px;
        }

        .upload-tip {
          margin-top: 12px;
          color: rgb(255 255 255 / 50%);
          font-size: 12px;
          line-height: 1.6;
        }
      }
    }
  }
</style>
