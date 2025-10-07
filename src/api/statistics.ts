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

// 巡查任务列表参数类型
export interface InspectionTaskListParams {
  pageNo?: number; // 页码
  pageSize?: number; // 每页大小
}

/**
 * 查询企业抽查任务列表
 * @param params 查询参数
 */
export function getCompanyInspectionTaskList(
  params?: InspectionTaskListParams
) {
  return axios.get('/api/inspection/task/list/company', { params });
}

/**
 * 查询地区巡查任务列表
 * @param params 查询参数
 */
export function getAreaInspectionTaskList(params?: InspectionTaskListParams) {
  return axios.get('/api/inspection/task/list/area', { params });
}

// 巡查任务数据传输对象
export interface InspectionTaskVO {
  id?: number; // 主键ID
  taskName: string; // 任务名称 (必需)
  taskType: number; // 任务类型：1-地区巡查，2-企业抽查 (必需)
  areaCodes?: string; // 巡查区域编码（多个逗号分隔，地区巡查使用）
  areaNames?: string; // 巡查区域名称（地区巡查使用）
  scheduleFrequency?: number; // 调度频率：1-每天，2-每周，3-每月（地区巡查使用）
  scheduleDay?: number; // 执行日期：频率为每周时表示周几(1-7)，频率为每月时表示几号(1-31)（地区巡查使用）
  scheduleTime?: string; // 执行时间：24小时制时间（地区巡查使用）
  executeImmediately?: number; // 是否立即执行：0-否，1-是（地区巡查使用）
  targetCompanyIds?: string; // 目标企业ID列表（多个逗号分隔，企业抽查使用）
  targetCompanyNames?: string; // 目标企业名称列表（企业抽查使用）
  description?: string; // 任务描述
  status?: number; // 状态：1-待执行，2-执行中，3-已完成，4-已暂停
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

/**
 * 新增巡查任务
 * @param data 任务数据
 */
export function createInspectionTask(data: InspectionTaskVO) {
  return axios.post('/api/inspection/task', data);
}

/**
 * 修改巡查任务
 * @param data 任务数据
 */
export function updateInspectionTask(data: InspectionTaskVO) {
  return axios.put('/api/inspection/task', data);
}

/**
 * 删除巡查任务
 * @param id 任务ID
 */
export function deleteInspectionTask(id: number | string) {
  return axios.delete(`/api/inspection/task/${id}`);
}

/**
 * 获取巡查任务详情
 * @param id 任务ID
 */
export function getInspectionTask(id: number | string) {
  return axios.get(`/api/inspection/task/${id}`);
}
