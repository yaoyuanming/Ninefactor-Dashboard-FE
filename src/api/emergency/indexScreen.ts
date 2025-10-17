import axios from 'axios';

// 应急管理数据地图查询请求参数
export interface EmergencyMapInfoReqVO {
  searchKey?: string; // 搜索key
  infoType?: number; // 信息类型（企业/救援队/医疗机构/应急物资/应急装备/事故后果）
}

// 应急管理预案/专家统计响应数据
export interface EmergencyPlanStatisticsVO {
  planCount?: number; // 预案数量
  expertCount?: number; // 专家数量
  [key: string]: any; // 其他统计数据
}

// 应急管理数据地图信息响应数据
export interface EmergencyMapInfoVO {
  id?: number; // ID
  name?: string; // 名称
  type?: number; // 类型
  latitude?: number; // 纬度
  longitude?: number; // 经度
  address?: string; // 地址
  [key: string]: any; // 其他地图信息
}

/**
 * 应急管理预案/专家统计
 * 获取应急管理首页大屏的预案和专家统计数据
 */
export function getEmergencyPlanStatistics() {
  return axios.get('/biz/emergency/index/plan/statistics');
}

/**
 * 应急管理数据地图统计数据
 * 根据查询条件获取各类应急资源的地图位置信息
 * @param data 查询参数
 */
export function getEmergencyMapInfo(data: EmergencyMapInfoReqVO) {
  return axios.post('/biz/emergency/index/map/info', data);
}
