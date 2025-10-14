# DeptSelect 部门选择组件

基于 Arco Design 的部门树形选择器组件，支持单选和多选。

## 使用示例

### 单选模式

```vue
<template>
  <DeptSelect 
    v-model="deptId" 
    placeholder="请选择部门"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DeptSelect from '../components/DeptSelect/index.vue';

const deptId = ref<number | null>(null);

const handleChange = (value: number | null, name?: string) => {
  console.log('选中部门:', value, name);
};
</script>
```

### 多选模式

```vue
<template>
  <DeptSelect 
    v-model="deptIds" 
    placeholder="请选择部门"
    :multiple="true"
    :max-tag-count="3"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DeptSelect from '../components/DeptSelect/index.vue';

const deptIds = ref<number[]>([]);

const handleChange = (value: number[] | null, names?: string) => {
  console.log('选中部门:', value, names);
};
</script>
```

## Props 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `string \| string[] \| number \| number[] \| null` | `null` |
| placeholder | 占位提示文字 | `string` | `'请选择部门'` |
| width | 组件宽度 | `string` | `'100%'` |
| size | 组件大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |
| clearable | 是否可以清除 | `boolean` | `true` |
| allowSearch | 是否支持搜索 | `boolean` | `true` |
| multiple | 是否支持多选 | `boolean` | `false` |
| maxTagCount | 多选时最多显示的标签数量 | `number` | `3` |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 绑定值变化时触发 | `(value: string \| string[] \| number \| number[] \| null)` |
| change | 选择变化时触发 | `(value: string \| string[] \| number \| number[] \| null, labels?: string)` |

## 注意事项

1. 组件会在挂载时自动加载部门树数据
2. 多选模式下，`change` 事件的第二个参数 `labels` 为逗号分隔的部门名称字符串
3. 组件使用 `getDeptTreeSelect` API 获取部门树数据
4. 部门数据为树形结构，支持展开/收起操作
5. 支持通过搜索快速定位部门

