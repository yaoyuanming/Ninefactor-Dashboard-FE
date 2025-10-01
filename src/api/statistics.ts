import axios from 'axios';

// 态势感知统计参数类型
export interface SituationAwarenessParams {
  year: number; // 年（必需）
  month?: number; // 月（可选）
}

/**
 * 态势感知统计
 * @param params 查询参数
 */
export function getSituationAwareness(params: SituationAwarenessParams) {
  return axios.get('/mws/alarm/statistics/situation-awareness', { params });
}

// 区域报警统计参数类型
export interface RegionAlarmStatisticsParams {
  regionCode: string; // 区域编码（必需）
  year: number; // 年份（必需）
  month?: number; // 月份（可选）
}

/**
 * 获取区域报警统计
 * @param params 查询参数
 */
export function getRegionAlarmStatistics(params: RegionAlarmStatisticsParams) {
  return axios.get('/mws/alarm/statistics/region', { params });
}
