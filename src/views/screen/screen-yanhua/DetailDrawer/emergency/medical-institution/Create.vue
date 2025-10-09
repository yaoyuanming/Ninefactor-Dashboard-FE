<template>
  <div class="medical-institution-create">
    <div class="create-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">{{ isEdit ? '编辑机构' : '新增机构' }}</div>
    </div>

    <div class="create-content">
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item label="机构名称" field="name">
          <a-input v-model="formData.name" placeholder="请输入机构名称" />
        </a-form-item>
        <a-form-item label="机构类型" field="type">
          <a-select
            v-model="formData.type"
            placeholder="请选择机构类型"
            allow-clear
          >
            <a-option value="综合医院">综合医院</a-option>
            <a-option value="专科医院">专科医院</a-option>
            <a-option value="社区卫生服务中心">社区卫生服务中心</a-option>
            <a-option value="急救中心">急救中心</a-option>
            <a-option value="其他">其他</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="负责人" field="principal">
          <a-input v-model="formData.principal" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系电话" field="phone">
          <a-input v-model="formData.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="床位数" field="beds">
          <a-input-number
            v-model="formData.beds"
            placeholder="请输入床位数"
            :min="0"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="地址" field="address">
          <a-input v-model="formData.address" placeholder="请输入地址" />
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
    type: '',
    principal: '',
    phone: '',
    beds: undefined,
    address: '',
    remark: '',
  });

  // 表单验证规则
  const formRules = {
    name: [{ required: true, message: '请输入机构名称' }],
    type: [{ required: true, message: '请选择机构类型' }],
    principal: [{ required: true, message: '请输入负责人' }],
    phone: [
      { required: true, message: '请输入联系电话' },
      { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
    ],
    address: [{ required: true, message: '请输入地址' }],
  };

  // 监听数据变化，用于编辑时回显
  watch(
    () => props.data,
    (newData) => {
      if (newData) {
        Object.assign(formData, {
          name: newData.name || '',
          type: newData.type || '',
          principal: newData.principal || '',
          phone: newData.phone || '',
          beds: newData.beds || undefined,
          address: newData.address || '',
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
        //   await updateMedicalInstitution({ id: props.data.id, ...formData });
        // } else {
        //   await createMedicalInstitution(formData);
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
  .medical-institution-create {
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
        .arco-textarea,
        .arco-select-view,
        .arco-input-number {
          color: rgb(255 255 255 / 85%);
          background: rgb(10 30 60 / 30%);
          border-color: rgb(23 150 250 / 20%);

          &::placeholder {
            color: rgb(255 255 255 / 30%);
          }
        }

        .arco-select-view-value {
          color: rgb(255 255 255 / 85%);
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
