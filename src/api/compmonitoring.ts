import axios, { AxiosResponse } from 'axios';

// 基础选项类型
export interface OptionItem {
  value: string;
  label: string;
  count: number;
  date: string;
}

// 分页类型
export interface PageList {
  pageNo: number;
  pageSize: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  companyId?: number;
  keyword?: string;
  dangerLevel?: string;
}

// 仓库汇总数据类型
export interface StoreSummary {
  riskLevel: OptionItem[];
  drugCapacity: OptionItem[];
  areaStandard: OptionItem[];
}

// 房间汇总数据类型
export interface RoomSummary {
  riskLevel: OptionItem[];
  drugCapacity: OptionItem[];
  areaStandard: OptionItem[];
}

// 接口返回的核心数据类型（仓库）
export interface WarehouseStatisticsData {
  storeSummary: StoreSummary;
  roomSummary: RoomSummary;
}

// 接口返回的顶层数据结构（通用）
export interface BaseResponse<T> {
  requestId: string;
  success: boolean;
  message: string;
  errorCode: string;
  data: T;
}

/**
 * 获取仓库统计信息
 */
export function getObtainWarehouseInfor(): Promise<
  AxiosResponse<BaseResponse<WarehouseStatisticsData>>
> {
  return axios.get<BaseResponse<WarehouseStatisticsData>>(
    '/mws/warehouse/statistics'
  );
}

/**
 * 获取仓库信息列表
 */
export function getObtainWarehouseInforList(data: PageList) {
  return axios.get<BaseResponse<WarehouseStatisticsData>>(
    '/mws/warehouse/page',
    { params: data }
  );
}

// 企业统计数据类型
export interface EnterpriseStatisticsData {
  shouldAccessCount?: number; // 应接入数
  accessedCount?: number; // 已接入数
  accessRate?: number; // 接入率
  onlineCount?: number; // 在线数
  largeEnterpriseCount?: number; // 规上企业数量
  mediumEnterpriseCount?: number; // 中等企业数量
  smallEnterpriseCount?: number; // 小微企业数量
  notAccessedCount?: number; // 未接入企业数量
  videoDeviceStatus?: {
    totalAccessed?: number;
    onlineCount?: number;
    onlineRate?: number;
  };
  tempHumDeviceStatus?: {
    totalAccessed?: number;
    onlineCount?: number;
    onlineRate?: number;
  };
}

/**
 * 获取企业统计信息
 */
export function getEnterpriseInformation(): Promise<
  AxiosResponse<BaseResponse<EnterpriseStatisticsData>>
> {
  return axios.get<BaseResponse<EnterpriseStatisticsData>>(
    '/mws/company/statistics'
  );
}

/**
 * 获取企业列表
 */
export function getEnterPageList(
  data: PageList
): Promise<AxiosResponse<BaseResponse<EnterpriseStatisticsData>>> {
  return axios.get<BaseResponse<EnterpriseStatisticsData>>(
    '/mws/company/page',
    { params: data }
  );
}

/**
 * 获取企业详细信息
 */
export function getEnterpriseInfor(
  params: number
): Promise<AxiosResponse<BaseResponse<EnterpriseStatisticsData>>> {
  return axios.get<BaseResponse<EnterpriseStatisticsData>>(
    `/mws/company/${params}`
  );
}

// -------------------------- 统一报警/预警事件类型 --------------------------
export interface AlarmEventVo {
  alarmType?: string; // 报警/预警类型编码
  alarmTypeName?: string; // 报警/预警类型名称
  num?: number; // 数量
  [property: string]: any;
}

// -------------------------- 报警统计相关 --------------------------
export interface AlarmStatisticsData {
  alarmNum?: number; // 报警数量
  unresolvedNum?: number; // 未消警数量
  resolvedNum?: number; // 已消警数量
  dateType?: string; // 查询日期类型（年/月/日）
  alarmEvents?: AlarmEventVo[]; // 用统一的 AlarmEventVo 类型
}

/**
 * 获取报警统计信息
 */
export function getAlarmStatistics(): Promise<
  AxiosResponse<BaseResponse<AlarmStatisticsData>>
> {
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return axios.get<BaseResponse<AlarmStatisticsData>>(
    '/mws/alarm/statistics', // 报警接口路径
    { params: { date: getCurrentDate() } }
  );
}

// -------------------------- 预警统计相关 --------------------------
export interface EarlyWarningStatisticsData {
  alarmNum?: number; // 预警数量
  unresolvedNum?: number; // 未处理预警数量
  resolvedNum?: number; // 已处理预警数量
  dateType?: string; // 查询日期类型（年/月/日）
  alarmEvents?: AlarmEventVo[]; // 用统一的 AlarmEventVo 类型
  [property: string]: any;
}

/**
 * 获取预警统计信息
 */
export function getEarlyWarningStatistics(): Promise<
  AxiosResponse<BaseResponse<EarlyWarningStatisticsData>>
> {
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return axios.get<BaseResponse<EarlyWarningStatisticsData>>(
    '/wms/warning/statistics',
    { params: { date: getCurrentDate() } }
  );
}

/**
 * 获取仓库列表
 */
export function getRepositoryList(data: PageList) {
  return axios.get<BaseResponse<WarehouseStatisticsData>>(
    '/mws/warehouse/page',
    { params: data }
  );
}

/**
 * 获取库房列表
 */
export function getWarehouseList(data: PageList) {
  return axios.get<BaseResponse<WarehouseStatisticsData>>(
    '/mws/storeroom/page',
    { params: data }
  );
}
