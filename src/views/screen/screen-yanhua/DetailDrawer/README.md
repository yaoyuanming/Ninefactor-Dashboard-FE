# DetailDrawer 抽屉组件系统

## 📁 目录结构

```
DetailDrawer/
├── statistics/              # 统计分析相关抽屉
│   ├── CreateRegionalTask.vue
│   └── CreateEnterpriseTask.vue
├── CompanyDetail.vue        # 企业详情
├── WarehouseDetail.vue      # 仓库详情
├── types.ts                 # 类型定义（重要）
├── index.vue                # 抽屉主组件
└── README.md                # 说明文档
```

## 🔧 如何添加新的抽屉类型

### 1. 在 `types.ts` 中添加新类型

```typescript
export enum DrawerType {
  // 现有类型
  COMPANY = 'company',
  WAREHOUSE = 'warehouse',
  REGIONAL_TASK = 'regional-task',
  ENTERPRISE_TASK = 'enterprise-task',
  
  // 添加新类型
  ALARM_DETAIL = 'alarm-detail',  // ← 新增
}
```

### 2. 创建新的抽屉组件

如果是某个模块专用，建议创建子文件夹：

```
DetailDrawer/
├── alarm/                    # 报警相关抽屉
│   └── AlarmDetail.vue      # ← 新组件
```

### 3. 在 `index.vue` 中注册组件

```vue
<script lang="ts" setup>
  import AlarmDetail from './alarm/AlarmDetail.vue';  // 导入组件
  
  // ... 其他代码
</script>

<template>
  <div class="drawer-content">
    <!-- 添加条件渲染 -->
    <AlarmDetail 
      v-if="type === DrawerType.ALARM_DETAIL" 
      :data="data"
      @close="handleClose"
      @success="handleSuccess"
    />
  </div>
</template>
```

### 4. 在业务组件中使用

```vue
<script setup>
  import { inject } from 'vue';
  import { DrawerType } from '../../DetailDrawer/types';
  
  const openDrawer = inject('openDrawer');
  
  const handleViewAlarm = (record: any) => {
    openDrawer(DrawerType.ALARM_DETAIL, '报警详情', record);
  };
</script>
```

## 💡 使用示例

### 打开抽屉

```typescript
// 方式1: 带数据
openDrawer(DrawerType.COMPANY, '企业详情', companyData);

// 方式2: 无数据
openDrawer(DrawerType.REGIONAL_TASK, '新建地区巡查任务');
```

### 关闭抽屉并刷新数据

```vue
<script setup>
  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;  // 成功后触发，父组件会刷新数据
  }>();
  
  const handleSubmit = async () => {
    // 提交数据...
    emit('success');  // 触发成功回调
    emit('close');    // 关闭抽屉
  };
</script>
```

## ✅ 优势

1. **类型安全** - 使用枚举，避免拼写错误
2. **集中管理** - 所有类型在一个文件中定义
3. **易于扩展** - 只需三步即可添加新类型
4. **代码提示** - IDE 自动提示所有可用类型
5. **模块化** - 按功能模块组织抽屉组件

## 📝 注意事项

1. 新增类型必须在 `types.ts` 中的 `DrawerType` 枚举中定义
2. 建议按功能模块创建子文件夹（如 `statistics/`、`alarm/` 等）
3. 所有抽屉组件都应该接收 `@close` 和 `@success` 事件
4. 使用 `DrawerType` 枚举而不是字符串字面量 