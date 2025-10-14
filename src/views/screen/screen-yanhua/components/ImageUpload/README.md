# ImageUpload 图片上传组件

基于 Arco Design 的图片上传组件，用于单张图片上传。

## 功能特性

- ✅ 单张图片上传
- ✅ 图片预览
- ✅ 图片删除
- ✅ 文件类型校验
- ✅ 文件大小校验
- ✅ 支持 v-model 双向绑定
- ✅ 自动区分展示 URL 和提交 URL
- ✅ 暗色主题适配

## 使用示例

### 基础用法

```vue
<template>
  <div>
    <ImageUpload v-model="imageUrl" />
    <p>提交的URL: {{ imageUrl }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUpload from '@/views/screen/screen-yanhua/components/ImageUpload/index.vue';

const imageUrl = ref('');
</script>
```

### 自定义配置

```vue
<template>
  <ImageUpload
    v-model="imageUrl"
    :max-size="10"
    accept="image/png,image/jpeg"
    upload-text="点击上传封面"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUpload from '@/views/screen/screen-yanhua/components/ImageUpload/index.vue';

const imageUrl = ref('');

const handleChange = (fileUrl: string, fileTemporaryUrl: string) => {
  console.log('永久URL（用于提交）:', fileUrl);
  console.log('临时URL（用于展示）:', fileTemporaryUrl);
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定的图片 URL（fileUrl） | `string` | `''` |
| accept | 接受的文件类型 | `string` | `'image/png,image/jpeg,image/jpg,image/gif'` |
| maxSize | 最大文件大小（MB） | `number` | `5` |
| uploadText | 上传按钮文字 | `string` | `'上传图片'` |
| disabled | 是否禁用 | `boolean` | `false` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | v-model 更新事件 | `(value: string) => void` |
| change | 图片改变事件 | `(fileUrl: string, fileTemporaryUrl: string) => void` |

## 接口返回数据结构

```typescript
{
  requestId: null,
  success: true,
  message: null,
  errorCode: null,
  data: {
    fileId: null,
    fileName: "微信图片_20250514154729.jpg",
    filePath: "qxg/system/activity/covercover7d44c6faf04042a9.jpg",
    fileUrl: "https://ninefactory-test-open.oss-cn-guangzhou.aliyuncs.com/...", // 用于提交
    fileTemporaryUrl: "http://ninefactory-test.oss-cn-guangzhou.aliyuncs.com/..." // 用于展示
  }
}
```

## 注意事项

1. **uploadDict 参数**：固定为 `'cover'`，已在组件内部设置
2. **URL 区分**：
   - `fileTemporaryUrl`：用于前端展示（临时签名 URL）
   - `fileUrl`：用于后端提交（永久 URL）
3. **文件校验**：
   - 默认限制文件大小为 5MB
   - 默认只接受常见图片格式
4. **样式适配**：组件已适配暗色主题，符合项目整体风格

