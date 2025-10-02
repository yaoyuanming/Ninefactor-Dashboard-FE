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

// 企业报警统计参数类型
export interface AlarmStatisticsByCompanyParams {
  pageNo?: number; // 页码
  pageSize?: number; // 每页大小
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  params?: string; // 参数
  enterpriseName?: string; // 企业名称
  areaCode?: string; // 区域编码
  year?: number; // 年份
  month?: number; // 月份
  dismissRateSort?: boolean; // 消警率是否DESC排序，true desc false asc 默认不排序
  totalSort?: boolean; // 总数是否DESC排序，true desc false asc 默认不排序
}

/**
 * 获取企业报警统计
 * @param params 查询参数
 */
export function getAlarmStatisticsByCompany(
  params?: AlarmStatisticsByCompanyParams
) {
  return axios.get('/mws/alarm/statistics/comp', { params });
}
