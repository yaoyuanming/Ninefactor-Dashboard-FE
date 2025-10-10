<template>
  <div class="rescue-force-create">
    <!-- 顶部操作栏 -->
    <div class="create-header">
      <a-button @click="emit('back')">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">
        {{ editData ? '编辑队伍' : '新增队伍' }}
      </div>
      <a-space>
        <a-button @click="emit('back')">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ editData ? '更新' : '保存' }}
        </a-button>
      </a-space>
    </div>

    <!-- 表单内容区 -->
    <a-spin :loading="loading" style="flex: 1; width: 100%; min-height: 0">
      <div class="create-content">
        <!-- 左侧：表单 -->
        <div class="form-section">
          <a-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            layout="horizontal"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
          >
            <a-form-item label="队伍名称" field="teamName" required>
              <a-input
                v-model="formData.teamName"
                placeholder="请输入队伍名称"
              />
            </a-form-item>
            <a-form-item label="主管单位" field="supervisingUnit" required>
              <DeptSelect
                v-model="formData.supervisingUnit"
                placeholder="请选择主管单位"
                :clearable="true"
              />
            </a-form-item>
            <a-form-item label="人员数量" field="teamSize">
              <a-input-number
                v-model="formData.teamSize"
                :min="0"
                placeholder="请输入人员数量"
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="负责人" field="teamLeader" required>
              <a-input
                v-model="formData.teamLeader"
                placeholder="请输入负责人"
              />
            </a-form-item>
            <a-form-item label="联系电话" field="contactPhone" required>
              <a-input
                v-model="formData.contactPhone"
                placeholder="请输入联系电话"
              />
            </a-form-item>
            <a-form-item label="所在区域" field="areaCodes" required>
              <RegionSelect
                v-model="formData.areaCodes"
                placeholder="请选择区域"
                :clearable="true"
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="位置" field="officeAddress">
              <a-input
                v-model="formData.officeAddress"
                placeholder="可自动带出，亦可补充"
                readonly
              >
                <template #append>
                  <a-button type="primary" @click="openMapPicker">
                    <icon-location />
                    地图获取
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item label="备注" field="remark">
              <a-textarea
                v-model="formData.remark"
                :rows="3"
                placeholder="请输入备注"
                :max-length="500"
                show-word-limit
              />
            </a-form-item>
          </a-form>
        </div>

        <!-- 右侧：图片上传 -->
        <div class="upload-section">
          <div class="section-title">队伍图片</div>
          <ImageUpload
            v-model="formData.images"
            upload-text="上传图片"
            :max-size="5"
          />
          <div class="upload-tip">
            建议尺寸：800x600像素，支持 jpg、png 格式，大小不超过 5MB
          </div>
        </div>
      </div>
    </a-spin>

    <!-- 地图选择器 -->
    <MapPicker ref="mapPickerRef" @confirm="handleMapConfirm" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { FormInstance, Message } from '@arco-design/web-vue';
  import RegionSelect from '@/views/screen/screen-yanhua/components/RegionSelect/index.vue';
  import DeptSelect from '@/views/screen/screen-yanhua/components/DeptSelect/index.vue';
  import ImageUpload from '@/views/screen/screen-yanhua/components/ImageUpload/index.vue';
  import MapPicker from '@/views/screen/screen-yanhua/components/MapPicker/index.vue';
  import {
    createRescueTeam,
    updateRescueTeam,
    getRescueTeam,
    type RescueTeamVO,
  } from '@/api/emergency';

  const props = defineProps<{ editData?: RescueTeamVO }>();
  const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'success'): void;
  }>();

  const formRef = ref<FormInstance>();
  const loading = ref(false);
  const submitLoading = ref(false);
  const mapPickerRef = ref();

  const formData = reactive<RescueTeamVO>({
    teamName: '',
    supervisingUnit: '',
    teamSize: undefined,
    teamLeader: '',
    contactPhone: '',
    areaCodes: '',
    officeAddress: '',
    images: '',
    remark: '',
  });

  // 表单验证规则
  const rules = {
    teamName: [{ required: true, message: '请输入队伍名称' }],
    supervisingUnit: [{ required: true, message: '请选择主管单位' }],
    teamLeader: [{ required: true, message: '请输入负责人' }],
    contactPhone: [
      { required: true, message: '请输入联系电话' },
      {
        match: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码',
      },
    ],
    areaCodes: [{ required: true, message: '请选择所在区域' }],
  };

  // 加载详情数据
  const loadDetail = async () => {
    if (!props.editData?.id) {
      // 新建模式，重置表单
      Object.assign(formData, {
        teamName: '',
        supervisingUnit: '',
        teamSize: undefined,
        teamLeader: '',
        contactPhone: '',
        areaCodes: '',
        officeAddress: '',
        images: '',
        remark: '',
      });
      return;
    }

    // 编辑模式，加载详情
    loading.value = true;
    try {
      const response: any = await getRescueTeam(props.editData.id);
      const detail = response.data;

      // 回显数据
      formData.teamName = detail.teamName || '';
      formData.supervisingUnit = detail.supervisingUnit || '';
      formData.teamSize = detail.teamSize;
      formData.teamLeader = detail.teamLeader || '';
      formData.contactPhone = detail.contactPhone || '';
      formData.areaCodes = detail.areaCodes || '';
      formData.officeAddress = detail.officeAddress || '';
      formData.images = detail.images || '';
      formData.remark = detail.remark || '';
    } catch (error: any) {
      Message.error(error?.message || '加载救援队伍详情失败');
    } finally {
      loading.value = false;
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    const errors = await formRef.value?.validate();
    if (errors) return;

    submitLoading.value = true;
    try {
      if (props.editData?.id) {
        await updateRescueTeam({ ...formData, id: props.editData.id });
        Message.success('更新成功');
      } else {
        await createRescueTeam(formData);
        Message.success('保存成功');
      }
      emit('success');
      emit('back');
    } catch (error: any) {
      Message.error(error?.message || '保存失败');
    } finally {
      submitLoading.value = false;
    }
  };

  // 打开地图选择器
  const openMapPicker = () => {
    // 如果已有地址，尝试从地址中解析经纬度
    let initialLocation;
    if (formData.officeAddress) {
      // 假设地址格式为 "经度,纬度" 或包含经纬度信息
      const coords = formData.officeAddress.split(',');
      if (
        coords.length === 2 &&
        !Number.isNaN(Number(coords[0])) &&
        !Number.isNaN(Number(coords[1]))
      ) {
        initialLocation = {
          lng: Number(coords[0]),
          lat: Number(coords[1]),
        };
      }
    }
    mapPickerRef.value?.open(initialLocation);
  };

  // 地图选择确认
  const handleMapConfirm = (data: any) => {
    // 保存经纬度和地址
    formData.officeAddress = `${data.position.lng},${data.position.lat}`;
    Message.success(`已选择位置：${data.formattedAddress}`);
  };

  onMounted(() => {
    loadDetail();
  });
</script>

<style scoped lang="less">
  .rescue-force-create {
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
          .arco-textarea-wrapper,
          .arco-input-number-wrapper {
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

          .arco-input-number-suffix {
            color: rgb(255 255 255 / 60%);
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
