<template>
  <div class="equipment-create">
    <!-- 顶部操作栏 -->
    <div class="create-header">
      <a-button @click="emit('back')">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">
        {{ editData ? '编辑应急装备' : '新增应急装备' }}
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
            :label-col-props="{ span: 7 }"
            :wrapper-col-props="{ span: 17 }"
          >
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="装备名称" field="equipmentName" required>
                  <a-input
                    v-model="formData.equipmentName"
                    placeholder="请输入装备名称"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="仓库名称" field="warehouseName" required>
                  <a-input
                    v-model="formData.warehouseName"
                    placeholder="请输入仓库名称"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="装备类型" field="equipmentType" required>
                  <a-select
                    v-model="formData.equipmentType"
                    placeholder="请选择装备类型"
                  >
                    <a-option :value="1">消防器材</a-option>
                    <a-option :value="2">侦检设备</a-option>
                    <a-option :value="3">救生器材</a-option>
                    <a-option :value="4">通信设备</a-option>
                    <a-option :value="5">工程机械</a-option>
                    <a-option :value="6">其他</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="数量" field="quantity" required>
                  <a-input-number
                    v-model="formData.quantity"
                    :min="0"
                    placeholder="请输入数量"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="所在区域" field="areaCodes" required>
                  <RegionSelect
                    v-model="formData.areaCodes"
                    placeholder="请选择区域"
                    :clearable="true"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="存放位置" field="storageLocation">
                  <a-input
                    v-model="formData.storageLocation"
                    placeholder="请输入存放位置"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="经度" field="longitude">
                  <a-input-number
                    v-model="formData.longitude"
                    placeholder="可通过地图获取"
                    :precision="6"
                    style="width: 100%"
                  >
                    <template #append>
                      <a-button type="primary" @click="openMapPicker">
                        <icon-location />
                        地图获取
                      </a-button>
                    </template>
                  </a-input-number>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="纬度" field="latitude">
                  <a-input-number
                    v-model="formData.latitude"
                    placeholder="可通过地图获取"
                    :precision="6"
                    style="width: 100%"
                  >
                    <template #append>
                      <a-button type="primary" @click="openMapPicker">
                        <icon-location />
                        地图获取
                      </a-button>
                    </template>
                  </a-input-number>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="备注" field="remark">
                  <a-textarea
                    v-model="formData.remark"
                    :rows="3"
                    placeholder="请输入备注"
                    :max-length="500"
                    show-word-limit
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <!-- 右侧：图片上传 -->
        <div class="upload-section">
          <div class="section-title">装备图片</div>
          <ImageUpload
            v-model="formData.imageUrls"
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
  import ImageUpload from '@/views/screen/screen-yanhua/components/ImageUpload/index.vue';
  import MapPicker from '@/views/screen/screen-yanhua/components/MapPicker/index.vue';
  import {
    createEmergencyEquipment,
    updateEmergencyEquipment,
    getEmergencyEquipment,
    type EmergencyEquipmentVO,
  } from '@/api/emergency';

  const props = defineProps<{ editData?: EmergencyEquipmentVO }>();
  const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'success'): void;
  }>();

  const formRef = ref<FormInstance>();
  const loading = ref(false);
  const submitLoading = ref(false);
  const mapPickerRef = ref();

  const formData = reactive<EmergencyEquipmentVO>({
    equipmentName: '',
    warehouseName: '',
    equipmentType: 1,
    quantity: undefined,
    areaCodes: '',
    storageLocation: '',
    longitude: undefined,
    latitude: undefined,
    imageUrls: '',
    remark: '',
  });

  // 表单验证规则
  const rules = {
    equipmentName: [{ required: true, message: '请输入装备名称' }],
    warehouseName: [{ required: true, message: '请输入仓库名称' }],
    equipmentType: [{ required: true, message: '请选择装备类型' }],
    areaCodes: [{ required: true, message: '请选择所在区域' }],
    quantity: [{ required: true, message: '请输入数量' }],
  };

  // 加载详情数据
  const loadDetail = async () => {
    if (!props.editData?.id) {
      // 新建模式，重置表单
      Object.assign(formData, {
        equipmentName: '',
        warehouseName: '',
        equipmentType: 1,
        quantity: undefined,
        areaCodes: '',
        storageLocation: '',
        longitude: undefined,
        latitude: undefined,
        imageUrls: '',
        remark: '',
      });
      return;
    }

    // 编辑模式，加载详情
    loading.value = true;
    try {
      const response: any = await getEmergencyEquipment(props.editData.id);
      const detail = response.data;

      // 回显数据
      formData.equipmentName = detail.equipmentName || '';
      formData.warehouseName = detail.warehouseName || '';
      formData.equipmentType = detail.equipmentType || 1;
      formData.quantity = detail.quantity;
      formData.areaCodes = detail.areaCodes || '';
      formData.storageLocation = detail.storageLocation || '';
      formData.longitude = detail.longitude;
      formData.latitude = detail.latitude;
      formData.imageUrls = detail.imageUrls || '';
      formData.remark = detail.remark || '';
    } catch (error: any) {
      Message.error(error?.message || '加载装备详情失败');
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
        await updateEmergencyEquipment({ ...formData, id: props.editData.id });
        Message.success('更新成功');
      } else {
        await createEmergencyEquipment(formData);
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
    // 如果已有经纬度，传入初始位置
    let initialLocation;
    if (formData.longitude && formData.latitude) {
      initialLocation = {
        lng: formData.longitude,
        lat: formData.latitude,
      };
    }
    mapPickerRef.value?.open(initialLocation);
  };

  // 地图选择确认
  const handleMapConfirm = (data: any) => {
    // 保存经纬度
    formData.longitude = data.position.lng;
    formData.latitude = data.position.lat;
    // 自动填充地址信息到存放位置
    if (data.formattedAddress) {
      formData.storageLocation = data.formattedAddress;
      Message.success(`已选择位置：${data.formattedAddress}`);
    } else {
      Message.success(`已选择坐标：${data.position.lng}, ${data.position.lat}`);
    }
  };

  onMounted(() => {
    loadDetail();
  });
</script>

<style scoped lang="less">
  .equipment-create {
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
