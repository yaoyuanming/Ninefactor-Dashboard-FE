# MapPicker 地图选择器组件

基于高德地图和 Arco Design 的地图位置选择组件。

## 功能特性

- ✅ 点击地图选择位置
- ✅ 搜索地点快速定位
- ✅ 显示经纬度坐标
- ✅ 显示详细地址
- ✅ 一键复制经纬度
- ✅ 支持初始位置设置

## 使用示例

### 基础用法

```vue
<template>
  <div>
    <a-button @click="openMapPicker">选择位置</a-button>
    <MapPicker ref="mapPickerRef" @confirm="handleLocationConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapPicker from '@/views/screen/screen-yanhua/components/MapPicker/index.vue';

const mapPickerRef = ref();

const openMapPicker = () => {
  mapPickerRef.value?.open();
};

const handleLocationConfirm = (data: any) => {
  console.log('选择的位置:', data);
  console.log('经度:', data.position.lng);
  console.log('纬度:', data.position.lat);
  console.log('地址:', data.formattedAddress);
};
</script>
```

### 带初始位置

```vue
<template>
  <div>
    <a-button @click="openWithInitialLocation">选择位置</a-button>
    <MapPicker ref="mapPickerRef" @confirm="handleLocationConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapPicker from '@/views/screen/screen-yanhua/components/MapPicker/index.vue';

const mapPickerRef = ref();

const openWithInitialLocation = () => {
  // 传入初始经纬度
  mapPickerRef.value?.open({
    lng: 116.397428,
    lat: 39.90923
  });
};

const handleLocationConfirm = (data: any) => {
  console.log('选择的位置:', data);
};
</script>
```

## Methods

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| open | 打开地图选择器 | `(initialLocation?: { lng?: string \| number, lat?: string \| number }) => void` | - |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| confirm | 确认选择位置时触发 | `(data: { formattedAddress: string, position: { lng: number, lat: number } }) => void` |

## 返回数据结构

```typescript
interface MapResult {
  formattedAddress: string; // 详细地址
  position: {
    lng: number; // 经度
    lat: number; // 纬度
  };
}
```

## 依赖

- `@amap/amap-jsapi-loader` - 高德地图加载器
- `@/utils/aMap` - 地图工具类

## 注意事项

1. 确保已在 `@/utils/aMap.ts` 中配置了正确的高德地图 Key
2. 组件会在关闭时自动销毁地图实例，释放资源
3. 支持搜索功能，可快速定位到目标位置
4. 经纬度可一键复制到剪贴板

