# CompanySelect 企业选择组件

基于 Arco Design 的企业选择器组件，支持单选和多选。

## 使用示例

### 单选模式

```vue
<template>
  <CompanySelect 
    v-model="companyId" 
    placeholder="请选择企业"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CompanySelect from '../components/CompanySelect/index.vue';

const companyId = ref<string | null>(null);

const handleChange = (value: string | null, name?: string) => {
  console.log('选中企业:', value, name);
};
</script>
```

### 多选模式

```vue
<template>
  <CompanySelect 
    v-model="companyIds" 
    placeholder="请选择企业"
    :multiple="true"
    :max-tag-count="3"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CompanySelect from '../components/CompanySelect/index.vue';

const companyIds = ref<string[]>([]);

const handleChange = (value: string[] | null, names?: string) => {
  console.log('选中企业:', value, names);
};
</script>
```

## Props 属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| modelValue | 绑定值 | `string \| string[] \| null` | `null` |
| placeholder | 占位提示文字 | `string` | `'请选择企业'` |
| width | 组件宽度 | `string` | `'100%'` |
| size | 组件大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |
| clearable | 是否可以清除 | `boolean` | `true` |
| allowSearch | 是否支持搜索 | `boolean` | `true` |
| multiple | 是否支持多选 | `boolean` | `false` |
| maxTagCount | 多选时最多显示的标签数量 | `number` | `3` |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| update:modelValue | 绑定值变化时触发 | `(value: string \| string[] \| null)` |
| change | 选择变化时触发 | `(value: string \| string[] \| null, labels?: string)` |

## 注意事项

1. 组件会在挂载时自动加载企业列表
2. 多选模式下，`change` 事件的第二个参数 `labels` 为逗号分隔的企业名称字符串
3. 组件使用 `getCompanyPage` API 获取企业数据，默认获取前 1000 条记录

