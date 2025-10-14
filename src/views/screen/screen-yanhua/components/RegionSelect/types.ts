// 区域树节点类型
export interface RegionTreeNode {
  id: string | number; // 区域ID
  label: string; // 区域名称
  name?: string; // 备用名称字段
  title?: string; // 备用标题字段
  children?: RegionTreeNode[]; // 子区域列表
  [key: string]: any; // 其他扩展字段
}
