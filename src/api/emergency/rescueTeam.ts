import axios from 'axios';

// 救援力量数据传输对象
export interface RescueTeamVO {
  id?: number; // 主键ID
  teamName: string; // 队伍名称 (必需)
  supervisingUnit?: string | number; // 主管单位（部门ID）
  teamSize?: number; // 人员数量
  areaCodes?: string; // 所在区域编码（多个以逗号分隔）
  teamLeader?: string; // 负责人
  contactPhone?: string; // 联系电话
  officeAddress?: string; // 办公地址
  longitude?: number; // 经度
  latitude?: number; // 纬度
  images?: string; // 照片URL（多个逗号分隔）
  remark?: string; // 备注
  areaNames?: string; // 区域名称（用于显示）
}

// 救援力量查询请求对象
export interface RescueTeamListReqVO {
  pageNo?: number; // 页码
  pageSize?: number; // 每页数量
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: Record<string, any>; // 额外字段
  teamName?: string; // 队伍名称
  areaCodes?: string; // 所在区域编码（多个以逗号分隔）
  supervisingUnit?: string; // 主管单位
  availabilityStatus?: number; // 可用状态（1可用，0不可用）
}

// 查询救援力量列表
export function getRescueTeamList(data: RescueTeamListReqVO) {
  return axios.post('/biz/emergency/rescueTeam/list', data);
}

// 获得救援力量详情
export function getRescueTeam(id: number) {
  return axios.get(`/biz/emergency/rescueTeam/${id}`);
}

// 新增救援力量
export function createRescueTeam(data: RescueTeamVO) {
  return axios.post('/biz/emergency/rescueTeam', data);
}

// 修改救援力量
export function updateRescueTeam(data: RescueTeamVO) {
  return axios.put('/biz/emergency/rescueTeam', data);
}

// 删除救援力量
export function deleteRescueTeam(ids: number[]) {
  return axios.delete(`/biz/emergency/rescueTeam/${ids.join(',')}`);
}
