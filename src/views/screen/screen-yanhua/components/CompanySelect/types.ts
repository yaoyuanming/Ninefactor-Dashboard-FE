// 企业选项类型
export interface CompanyOption {
  id: string | number; // 企业ID
  enterpriseName: string; // 企业名称
  [key: string]: any; // 其他扩展字段
}
