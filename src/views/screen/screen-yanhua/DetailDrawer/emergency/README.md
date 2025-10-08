# 应急管理模块

## 📁 目录结构

```text
emergency/
├── emergency-committee/      # 应急委员会
│   ├── index.vue             # 主容器（列表、详情、新增切换）
│   ├── List.vue              # 列表页
│   ├── Detail.vue            # 详情页
│   └── Create.vue            # 新增/编辑页
├── enterprise-committee/     # 企业委员会
│   ├── index.vue
│   ├── List.vue
│   ├── Detail.vue
│   └── Create.vue
├── emergency-expert/         # 应急专家
│   ├── index.vue
│   ├── List.vue
│   ├── Detail.vue
│   └── Create.vue
├── rescue-force/             # 救援力量
│   ├── index.vue
│   ├── List.vue
│   ├── Detail.vue
│   └── Create.vue
├── emergency-supplies/       # 应急物资
│   ├── index.vue
│   ├── List.vue
│   ├── Detail.vue
│   └── Create.vue
├── emergency-equipment/      # 应急装备
│   ├── index.vue
│   ├── List.vue
│   ├── Detail.vue
│   └── Create.vue
├── index.vue                 # 应急管理主入口（顶部导航切换）
└── README.md                 # 本文档
```

## 🚀 功能说明

### 主入口（index.vue）

- 顶部导航栏：6个tab切换（应急委员会、企业委员会、应急专家、救援力量、应急物资、应急装备）
- 每个tab对应一个模块，点击切换显示不同内容

### 各模块功能

每个模块都包含以下功能：

1. **列表页（List.vue）**
   - 搜索筛选
   - 分页展示
   - 查看详情
   - 编辑
   - 删除

2. **详情页（Detail.vue）**
   - 展示详细信息
   - 返回列表

3. **新增/编辑页（Create.vue）**
   - 表单录入
   - 数据验证
   - 提交保存
   - 取消返回

### 容器组件（各模块的index.vue）

负责管理三个视图的切换：

- `list` - 列表页
- `detail` - 详情页
- `create` - 新增/编辑页

## 💡 使用方式

### 打开应急管理抽屉

在任意组件中使用 `openDrawer` 方法：

```vue
<script setup>
import { inject } from 'vue';
import { DrawerType } from '../DetailDrawer/types';

const openDrawer = inject('openDrawer');

const handleOpenEmergency = () => {
  openDrawer(DrawerType.EMERGENCY_MANAGEMENT, '应急管理');
};
</script>
```

### 在Left2中的使用

点击应急管理图片时自动打开应急管理抽屉：

```vue
<img
  style="width: 460px; cursor: pointer"
  src="@/assets/screen/left2.png"
  @click="handleOpenEmergency"
/>
```

## 🔧 接口对接

目前各模块使用的是模拟数据，需要对接真实接口时，请在以下位置修改：

1. **List.vue** 的 `fetchData` 方法 - 获取列表数据
2. **List.vue** 的 `handleDelete` 方法 - 删除数据
3. **Create.vue** 的 `handleSubmit` 方法 - 新增/编辑数据

示例：

```typescript
// 在 List.vue 中
const fetchData = async () => {
  loading.value = true;
  try {
    // TODO: 替换为真实接口
    // const res = await getEmergencyCommitteeList({
    //   ...searchForm,
    //   page: pagination.current,
    //   pageSize: pagination.pageSize,
    // });
    // tableData.value = res.data.list;
    // pagination.total = res.data.total;
  } catch (error) {
    Message.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};
```

## 📝 数据结构示例

### 应急委员会

```typescript
{
  id: number;
  name: string;        // 姓名
  unit: string;        // 单位
  position: string;    // 职务
  phone: string;       // 联系电话
  createTime: string;  // 创建时间
  remark?: string;     // 备注
}
```

### 企业委员会

```typescript
{
  id: number;
  name: string;        // 企业名称
  principal: string;   // 负责人
  phone: string;       // 联系电话
  address: string;     // 地址
  createTime: string;  // 创建时间
}
```

### 应急专家

```typescript
{
  id: number;
  name: string;        // 姓名
  field: string;       // 专业领域
  title: string;       // 职称
  phone: string;       // 联系电话
}
```

### 救援力量

```typescript
{
  id: number;
  name: string;        // 队伍名称
  type: string;        // 队伍类型
  count: number;       // 人数
  contact: string;     // 联系人
  phone: string;       // 联系电话
}
```

### 应急物资

```typescript
{
  id: number;
  name: string;        // 物资名称
  type: string;        // 物资类型
  quantity: number;    // 数量
  unit: string;        // 单位
  location: string;    // 存放位置
}
```

### 应急装备

```typescript
{
  id: number;
  name: string;        // 装备名称
  type: string;        // 装备类型
  quantity: number;    // 数量
  status: string;      // 状态（正常/维修/报废）
  location: string;    // 存放位置
}
```

## 🎨 样式说明

所有组件采用统一的暗色主题样式：

- 背景色：`rgb(10 30 60 / 20%)`
- 边框色：`rgb(23 150 250 / 10%)`
- 文字色：`rgb(255 255 255 / 70%)`
- 激活色：`linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%)`

## 📌 注意事项

1. 所有模块的代码结构保持一致，便于维护
2. 表单验证规则已配置，根据实际需求调整
3. 图标资源位于 `src/assets/screen/emergency/` 目录
4. 导航图标可以根据需要更换为实际设计的图标
