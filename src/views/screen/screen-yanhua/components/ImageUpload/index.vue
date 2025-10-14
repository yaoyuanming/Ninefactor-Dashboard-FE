<template>
  <div class="image-upload-wrapper">
    <a-upload
      :custom-request="handleUpload"
      :show-file-list="false"
      :accept="accept"
      :disabled="disabled"
      @before-upload="beforeUpload"
    >
      <template #upload-button>
        <div v-if="!imageUrl" class="upload-trigger">
          <div class="upload-icon">
            <icon-plus />
          </div>
          <div class="upload-text">{{ uploadText }}</div>
        </div>
        <div v-else class="image-preview">
          <img :src="imageUrl" alt="预览图" />
          <div class="image-overlay">
            <div class="overlay-actions">
              <icon-eye @click.stop="handlePreview" />
              <icon-delete @click.stop="handleRemove" />
            </div>
          </div>
        </div>
      </template>
    </a-upload>

    <!-- 图片预览弹窗 -->
    <a-modal
      v-model:visible="previewVisible"
      :footer="false"
      title="图片预览"
      width="800px"
    >
      <div class="preview-container">
        <img :src="imageUrl" alt="预览图" style="width: 100%" />
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { uploadImage } from '@/api/system';

  interface UploadResponse {
    requestId: null;
    success: boolean;
    message: null;
    errorCode: null;
    data: {
      fileId: null;
      fileName: string;
      filePath: string;
      fileUrl: string;
      fileTemporaryUrl: string;
    };
  }

  const props = withDefaults(
    defineProps<{
      modelValue?: string; // 绑定的 fileUrl
      accept?: string; // 接受的文件类型
      maxSize?: number; // 最大文件大小（MB）
      uploadText?: string; // 上传按钮文字
      disabled?: boolean; // 是否禁用
    }>(),
    {
      modelValue: '',
      accept: 'image/png,image/jpeg,image/jpg,image/gif',
      maxSize: 5,
      uploadText: '上传图片',
      disabled: false,
    }
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', fileUrl: string, fileTemporaryUrl: string): void;
  }>();

  const imageUrl = ref<string>(''); // 用于展示的临时 URL
  const fileUrl = ref<string>(''); // 用于提交的永久 URL
  const previewVisible = ref(false);

  // 监听 modelValue 变化，初始化图片
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        fileUrl.value = newVal;
        // 如果是完整的 URL，直接用于展示
        imageUrl.value = newVal;
      } else {
        fileUrl.value = '';
        imageUrl.value = '';
      }
    },
    { immediate: true }
  );

  // 上传前校验
  const beforeUpload = (file: File) => {
    // 校验文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      Message.error('只能上传图片文件！');
      return false;
    }

    // 校验文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize;
    if (!isLtMaxSize) {
      Message.error(`图片大小不能超过 ${props.maxSize}MB！`);
      return false;
    }

    return true;
  };

  // 自定义上传
  const handleUpload = async (option: any) => {
    const { fileItem, onError, onSuccess } = option;

    try {
      Message.loading('上传中...');

      // 调用上传接口，uploadDict 固定为 'cover'
      const response: any = await uploadImage(fileItem.file, 'cover');

      if (response.success && response.data) {
        const uploadData: UploadResponse['data'] = response.data;

        // 展示用临时 URL
        imageUrl.value = uploadData.fileTemporaryUrl;
        // 提交用永久 URL
        fileUrl.value = uploadData.fileUrl;

        // 触发更新
        emit('update:modelValue', uploadData.fileUrl);
        emit('change', uploadData.fileUrl, uploadData.fileTemporaryUrl);

        Message.success('上传成功');
        onSuccess();
      } else {
        Message.error(response.message || '上传失败');
        onError();
      }
    } catch (error: any) {
      Message.error(error?.message || '上传失败');
      onError();
    }
  };

  // 预览图片
  const handlePreview = () => {
    previewVisible.value = true;
  };

  // 删除图片
  const handleRemove = () => {
    imageUrl.value = '';
    fileUrl.value = '';
    emit('update:modelValue', '');
    emit('change', '', '');
    Message.success('已删除');
  };
</script>

<style scoped lang="less">
  .image-upload-wrapper {
    display: inline-block;

    :deep(.arco-upload) {
      .upload-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 148px;
        height: 148px;
        color: rgb(255 255 255 / 65%);
        background: rgb(10 30 60 / 20%);
        border: 1px dashed rgb(23 150 250 / 30%);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: rgb(23 150 250 / 60%);

          .upload-icon {
            color: rgb(23 150 250 / 90%);
          }
        }

        .upload-icon {
          margin-bottom: 8px;
          font-size: 32px;
          transition: color 0.3s;
        }

        .upload-text {
          font-size: 14px;
        }
      }

      .image-preview {
        position: relative;
        width: 148px;
        height: 148px;
        overflow: hidden;
        border: 1px solid rgb(23 150 250 / 30%);
        border-radius: 4px;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: rgb(0 0 0 / 0%);
          opacity: 0;
          transition: all 0.3s;

          .overlay-actions {
            display: flex;
            gap: 16px;
            font-size: 20px;

            .arco-icon {
              color: rgb(255 255 255 / 90%);
              cursor: pointer;
              transition: all 0.3s;

              &:hover {
                color: rgb(23 150 250);
                transform: scale(1.2);
              }
            }
          }
        }

        &:hover .image-overlay {
          background: rgb(0 0 0 / 50%);
          opacity: 1;
        }
      }
    }
  }

  .preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-height: 70vh;
    overflow: auto;

    img {
      max-width: 100%;
      height: auto;
    }
  }
</style>
