import axios from 'axios';

// 应急物资数据传输对象
export interface EmergencySuppliesVO {
  id?: number; // 主键ID
  suppliesName: string; // 物资名称（必需）
  warehouseName: string; // 仓库名称（必需）
  suppliesType: number; // 物资类型（1防护用品，2生命救助，3生命支持，4救援运载，5临时食宿，6其他）
  quantity?: number; // 数量
  areaCodes?: string; // 所属区域编码（多个以逗号分隔）
  storageLocation?: string; // 存放位置
  longitude?: number; // 经度
  latitude?: number; // 纬度
  imageUrls?: string; // 图片路径（多个以逗号分隔）
  remark?: string; // 备注
  areaNames?: string; // 区域名称（用于显示）
}

// 应急物资查询请求对象
export interface EmergencySuppliesListReqVO {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数量
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: Record<string, any>; // 额外字段
  suppliesName?: string; // 物资名称
  warehouseName?: string; // 仓库名称
  areaCodes?: string; // 所属区域编码
  suppliesType?: number; // 物资类型
}

// 查询应急物资列表
export function getEmergencySuppliesList(data: EmergencySuppliesListReqVO) {
  return axios.post('/biz/emergency/supplies/list', data);
}

// 获得应急物资详情
export function getEmergencySupplies(id: number) {
  return axios.get(`/biz/emergency/supplies/${id}`);
}

// 新增应急物资
export function createEmergencySupplies(data: EmergencySuppliesVO) {
  return axios.post('/biz/emergency/supplies', data);
}

// 修改应急物资
export function updateEmergencySupplies(data: EmergencySuppliesVO) {
  return axios.put('/biz/emergency/supplies', data);
}

// 删除应急物资
export function deleteEmergencySupplies(ids: number[]) {
  return axios.delete(`/biz/emergency/supplies/${ids.join(',')}`);
}

// 根据物资类型查询物资列表
export function getEmergencySuppliesByType(suppliesType: number) {
  return axios.get(`/biz/emergency/supplies/type/${suppliesType}`);
}
