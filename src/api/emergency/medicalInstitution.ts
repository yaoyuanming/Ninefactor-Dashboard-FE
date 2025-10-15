import axios from 'axios';

// 医疗机构数据传输对象
export interface MedicalInstitutionVO {
  id?: number; // 主键ID
  institutionName: string; // 机构名称 (必需)
  institutionLevel?: number; // 机构等级（1一级，2二级，3三级）
  institutionType?: number; // 类型（1综合医院，2专科医院）
  areaCodes?: string; // 所在区域编码（多个以逗号分隔）
  emergencyBeds?: number; // 急诊床位数
  emergencyPhone?: string; // 急诊电话
  longitude?: number; // 经度
  latitude?: number; // 纬度
  detailedAddress?: string; // 详细地址
  images?: string; // 照片URL（多个逗号分隔）
  remark?: string; // 备注
  areaNames?: string; // 区域名称（用于显示）
}

// 医疗机构查询请求对象
export interface MedicalInstitutionListReqVO {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数量
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: Record<string, any>; // 额外字段
  institutionName?: string; // 机构名称
  areaCodes?: string; // 所在区域编码（多个以逗号分隔）
  institutionLevel?: number; // 机构等级
  institutionType?: number; // 机构类型
}

// 查询医疗机构列表
export function getMedicalInstitutionList(data: MedicalInstitutionListReqVO) {
  return axios.post('/biz/emergency/medical/list', data);
}

// 获得医疗机构详情
export function getMedicalInstitution(id: number) {
  return axios.get(`/biz/emergency/medical/${id}`);
}

// 新增医疗机构
export function createMedicalInstitution(data: MedicalInstitutionVO) {
  return axios.post('/biz/emergency/medical', data);
}

// 修改医疗机构
export function updateMedicalInstitution(data: MedicalInstitutionVO) {
  return axios.put('/biz/emergency/medical', data);
}

// 删除医疗机构
export function deleteMedicalInstitution(ids: number[]) {
  return axios.delete(`/biz/emergency/medical/${ids.join(',')}`);
}
