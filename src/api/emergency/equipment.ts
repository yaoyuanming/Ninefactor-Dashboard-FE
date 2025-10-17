import axios from 'axios';

// 应急装备数据传输对象
export interface EmergencyEquipmentVO {
  id?: number; // 主键ID
  equipmentName: string; // 装备名称（必需）
  warehouseName: string; // 仓库名称（必需）
  equipmentType: number; // 装备类型（1消防器材，2侦检设备，3救生器材，4通信设备，5工程机械，6其他）
  quantity?: number; // 数量
  areaCodes?: string; // 所属区域编码（多个以逗号分隔）
  storageLocation?: string; // 存放位置
  longitude?: number; // 经度
  latitude?: number; // 纬度
  imageUrls?: string; // 图片路径（多个以逗号分隔）
  remark?: string; // 备注
  areaNames?: string; // 区域名称（用于显示）
}

// 应急装备查询请求对象
export interface EmergencyEquipmentListReqVO {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数量
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: Record<string, any>; // 额外字段
  equipmentName?: string; // 装备名称
  warehouseName?: string; // 仓库名称
  areaCodes?: string; // 所属区域编码
  equipmentType?: number; // 装备类型
}

// 查询应急装备列表
export function getEmergencyEquipmentList(data: EmergencyEquipmentListReqVO) {
  return axios.post('/biz/emergency/equipment/list', data);
}

// 获得应急装备详情
export function getEmergencyEquipment(id: number) {
  return axios.get(`/biz/emergency/equipment/${id}`);
}

// 新增应急装备
export function createEmergencyEquipment(data: EmergencyEquipmentVO) {
  return axios.post('/biz/emergency/equipment', data);
}

// 修改应急装备
export function updateEmergencyEquipment(data: EmergencyEquipmentVO) {
  return axios.put('/biz/emergency/equipment', data);
}

// 删除应急装备
export function deleteEmergencyEquipment(ids: number[]) {
  return axios.delete(`/biz/emergency/equipment/${ids.join(',')}`);
}

// 根据装备类型查询装备列表
export function getEmergencyEquipmentByType(equipmentType: number) {
  return axios.get(`/biz/emergency/equipment/type/${equipmentType}`);
}
