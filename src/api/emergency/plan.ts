import axios from 'axios';

// 应急预案数据传输对象
export interface EmergencyPlanVO {
  id?: number; // 主键ID
  planName: string; // 预案名称
  planType: number; // 预案类型（1政府预案，2企业预案）
  orgId?: number; // 所属机构ID（关联sys_dept表或company_info表）
  orgType: number; // 机构类型（1部门，2企业）
  orgName?: string; // 所属单位/企业名称
  planContent?: string; // 预案内容（富文本）
  status?: number; // 状态（0未发布，1已发布，2已失效）
  expireTime?: string; // 失效时间
  areaCodes?: string; // 适用区域编码（多个以逗号分隔）
  version?: string; // 版本号
  approver?: string; // 审批人
  approvalTime?: string; // 审批时间
  remark?: string; // 备注
}

// 应急预案查询请求对象
export interface EmergencyPlanListReqVO {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数量
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: any; // 额外字段
  planName?: string; // 预案名称
  planType?: number; // 预案类型（1政府预案，2企业预案）
  orgId?: number; // 所属机构ID
  orgType?: number; // 机构类型（1部门，2企业）
  status?: number; // 状态（0未发布，1已发布，2已失效）
}

// 应急预案保存请求参数
export interface EmergencyPlanSaveReqVO {
  id?: number; // 主键ID
  planName: string; // 预案名称
  planType: number; // 预案类型（1政府预案，2企业预案）
  orgId?: number; // 所属机构ID（关联sys_dept表或company_info表）
  orgType: number; // 机构类型（1部门，2企业）
  orgName?: string; // 所属单位/企业名称
  planContent?: string; // 预案内容（富文本）
  status?: number; // 状态（0未发布，1已发布，2已失效）
  expireTime?: string; // 失效时间
  areaCodes?: string; // 适用区域编码（多个以逗号分隔）
  version?: string; // 版本号
  approver?: string; // 审批人
  approvalTime?: string; // 审批时间
  remark?: string; // 备注
}

/**
 * 查询应急预案列表
 * @param data 查询参数
 */
export function getEmergencyPlanList(data: EmergencyPlanListReqVO) {
  return axios.post('/biz/emergency/plan/list', data);
}

/**
 * 获得应急预案详情
 * @param id 预案ID
 */
export function getEmergencyPlan(id: number) {
  return axios.get(`/biz/emergency/plan/${id}`);
}

/**
 * 新增应急预案
 * @param data 预案信息
 */
export function createEmergencyPlan(data: EmergencyPlanSaveReqVO) {
  return axios.post('/biz/emergency/plan', data);
}

/**
 * 更新应急预案
 * @param data 预案信息
 */
export function updateEmergencyPlan(data: EmergencyPlanSaveReqVO) {
  return axios.put('/biz/emergency/plan', data);
}

/**
 * 删除应急预案
 * @param ids 预案ID数组
 */
export function deleteEmergencyPlan(ids: number[]) {
  return axios.delete(`/biz/emergency/plan/${ids.join(',')}`);
}

/**
 * 根据预案类型查询预案列表
 * @param planType 预案类型（1政府预案，2企业预案）
 */
export function getEmergencyPlanByType(planType: number) {
  return axios.get(`/biz/emergency/plan/type/${planType}`);
}
