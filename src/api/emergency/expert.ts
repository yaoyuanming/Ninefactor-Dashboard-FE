import axios from 'axios';

// 应急专家数据传输对象
export interface EmergencyExpertVO {
  id?: number; // 主键ID
  expertName: string; // 专家姓名（必需）
  gender?: number; // 性别（0男，1女，2未知）
  age?: number; // 年龄
  specialtyField: number; // 专业领域（1烟花爆竹工艺，2安全管理，3消防救援，4化工，5环境监测，6其他）（必需）
  specialtyDescription?: string; // 专业描述
  technicalTitle?: string; // 技术职称
  education?: string; // 学历
  workUnit?: string; // 工作单位
  position?: string; // 职务
  contactPhone?: string; // 联系电话
  mobilePhone?: string; // 手机号码
  email?: string; // 邮箱
  officeAddress?: string; // 办公地址
  areaCodes?: string; // 服务区域编码（多个以逗号分隔）
  photoUrl?: string; // 照片路径
  idCard?: string; // 身份证号
  workExperience?: string; // 工作经历
  professionalCertificates?: string; // 专业证书
  emergencyCases?: string; // 应急处置案例
  availabilityStatus?: number; // 可用状态（1可用，0不可用）
  remark?: string; // 备注
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

// 应急专家查询请求对象
export interface EmergencyExpertListReqVO {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数量
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: Record<string, any>; // 额外字段
  expertName?: string; // 专家姓名
  specialtyField?: number; // 专业领域
  workUnit?: string; // 工作单位
  availabilityStatus?: number; // 可用状态（1可用，0不可用）
}

// 查询应急专家列表
export function getEmergencyExpertList(data: EmergencyExpertListReqVO) {
  return axios.post('/biz/emergency/expert/list', data);
}

// 获得应急专家详情
export function getEmergencyExpert(id: number) {
  return axios.get(`/biz/emergency/expert/${id}`);
}

// 新增应急专家
export function createEmergencyExpert(data: EmergencyExpertVO) {
  return axios.post('/biz/emergency/expert', data);
}

// 修改应急专家
export function updateEmergencyExpert(data: EmergencyExpertVO) {
  return axios.put('/biz/emergency/expert', data);
}

// 删除应急专家
export function deleteEmergencyExpert(ids: number[]) {
  return axios.delete(`/biz/emergency/expert/${ids.join(',')}`);
}
