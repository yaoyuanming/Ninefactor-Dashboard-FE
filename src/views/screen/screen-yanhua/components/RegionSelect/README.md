# RegionSelect 区域选择组件

基于 Arco Design 的树形区域选择器组件。

## 使用示例

```vue
<template>
  <RegionSelect 
    v-model="regionId" 
    placeholder="请选择区域"
    width="300px"
    :default-first="true"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RegionSelect from '../components/RegionSelect/index.vue';

const regionId = ref<string | number | null>(null);

const handleChange = (value: string | number | null, label?: string) => {
  console.log('选中区域:', value, label);
};
</script>
```

## Props 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `string \| number \| null` | `null` |
| placeholder | 占位提示文字 | `string` | `'请选择区域'` |
| width | 组件宽度 | `string` | `'200px'` |
| clearable | 是否可以清除 | `boolean` | `true` |
| checkStrictly | 是否严格模式（父子节点不关联） | `boolean` | `true` |
| defaultFirst | 是否默认选择第一个选项 | `boolean` | `false` |
| allowSearch | 是否支持搜索 | `boolean` | `true` |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 绑定值变化时触发 | `(value: string \| number \| null)` |
| change | 选择变化时触发 | `(value: string \| number \| null, label?: string)` |
