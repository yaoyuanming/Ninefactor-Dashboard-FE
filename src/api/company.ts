import axios from 'axios';

// 企业列表查询参数类型
export interface CompanyPageParams {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  enterpriseName?: string;
  areaCode?: string;
  industryCode?: string;
  riskLevel?: string;
  riskEnvTypes?: string;
}

// 仓库列表查询参数类型
export interface WarehousePageParams {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  companyId?: number;
  keyword?: string;
  dangerLevel?: string;
}

// 库房列表查询参数类型
export interface StoreroomPageParams {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  companyId?: number;
  keyword?: string;
  dangerLevel?: string;
}

// 人员列表查询参数类型
export interface PersonPageParams {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  companyId?: number;
  personname?: string;
}

// 车辆列表查询参数类型
export interface CarPageParams {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  companyId?: number;
  plateNumber?: string;
  ownerName?: string;
}

/**
 * 获取企业列表
 * @param params 查询参数
 */
export function getCompanyPage(params?: CompanyPageParams) {
  return axios.get('/mws/company/page', { params });
}

/**
 * 获取企业统计
 */
export function getCompanyStatistics() {
  return axios.get('/mws/company/statistics');
}

/**
 * 根据ID获取企业信息
 * @param id 企业ID
 */
export function getCompanyById(id: number | string) {
  return axios.get(`/mws/company/${id}`);
}

/**
 * 获取仓库统计信息
 */
export function getWarehouseStatistics() {
  return axios.get('/mws/warehouse/statistics');
}

/**
 * 获取仓库列表
 * @param params 查询参数
 */
export function getWarehousePage(params?: WarehousePageParams) {
  return axios.get('/mws/warehouse/page', { params });
}

/**
 * 获取库房列表
 * @param params 查询参数
 */
export function getStoreroomPage(params?: StoreroomPageParams) {
  return axios.get('/mws/storeroom/page', { params });
}

/**
 * 获取人员列表
 * @param params 查询参数
 */
export function getPersonPage(params?: PersonPageParams) {
  return axios.get('/mws/person/page', { params });
}

/**
 * 获取车辆列表
 * @param params 查询参数
 */
export function getCarPage(params?: CarPageParams) {
  return axios.get('/mws/car/page', { params });
}
