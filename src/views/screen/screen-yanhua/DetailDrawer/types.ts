// 抽屉类型枚举
// eslint-disable-next-line no-shadow
export enum DrawerType {
  // 企业和仓库详情
  COMPANY = 'company',
  WAREHOUSE = 'warehouse',

  // 统计分析 - 巡查任务（创建）
  REGIONAL_TASK = 'regional-task',
  ENTERPRISE_TASK = 'enterprise-task',

  // 统计分析 - 巡查任务（查看）
  VIEW_REGIONAL_TASK = 'view-regional-task',
  VIEW_ENTERPRISE_TASK = 'view-enterprise-task',

  // 应急管理
  EMERGENCY_MANAGEMENT = 'emergency-management',

  // 报警监控
  ALARM_DETAIL = 'alarm-detail',

  // 可以继续添加其他类型...
  // RISK_DETAIL = 'risk-detail',
}

// 抽屉类型的联合类型
export type DrawerTypeValue = DrawerType;

// 抽屉组件配置
export interface DrawerConfig {
  type: DrawerTypeValue;
  title: string;
  data?: any;
}
