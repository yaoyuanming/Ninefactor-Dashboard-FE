// 部门选项类型
export interface DeptOption {
  id: string | number; // 部门ID
  label: string; // 部门名称（树形选择器使用label）
  children?: DeptOption[]; // 子部门
  [key: string]: any; // 其他扩展字段
}
