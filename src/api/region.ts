import axios from 'axios';

// 区域管理新增/修改 Request VO
export interface RegionSaveReqVO {
  id?: number;
  regionCode: string;
  regionName: string;
  regionLevel: number;
  parentCode?: string;
  orderNum?: number;
  status: number;
}

// 区域分页查询参数
export interface RegionPageReqVO {
  pageNo?: number;
  pageSize?: number;
  regionCode?: string;
  regionName?: string;
  regionLevel?: string;
  parentCode?: string;
  orderNum?: string;
  status?: string;
  createTime?: string;
}

// 区域详情 Response VO
export interface RegionVO {
  id: number;
  regionCode: string;
  regionName: string;
  regionLevel: number;
  parentCode?: string;
  orderNum?: number;
  status: number;
  createTime?: string;
  children?: RegionVO[];
}

/**
 * 创建区域
 * @param data 区域信息
 */
export function createRegion(data: RegionSaveReqVO) {
  return axios.post('/system/region', data);
}

/**
 * 更新区域
 * @param data 区域信息
 */
export function updateRegion(data: RegionSaveReqVO) {
  return axios.put('/system/region', data);
}

/**
 * 删除区域
 * @param id 区域ID
 */
export function deleteRegion(id: number) {
  return axios.delete(`/system/region/${id}`);
}

/**
 * 获取区域分页
 * @param params 分页查询参数
 */
export function getRegionPage(params: RegionPageReqVO) {
  return axios.get('/system/region/page', { params });
}

/**
 * 获取区域详情
 * @param id 区域ID
 */
export function getRegion(id: number) {
  return axios.get(`/system/region/${id}`);
}

/**
 * 获取区域树列表
 * @param regionCode 区域编码（可选）
 */
export function getRegionTree(regionCode?: string) {
  return axios.get('/system/region/regionTree', {
    params: regionCode ? { regionCode } : {},
  });
}

/**
 * 获取区域下拉树列表
 * @param regionCode 区域编码（可选）
 */
export function getRegionTreeSelect(regionCode?: string) {
  return axios.get('/system/region/treeselect', {
    params: regionCode ? { regionCode } : {},
  });
}

/**
 * 获取区域树结构列表
 * @param params 查询参数
 */
export function getRegionTreeList(params?: any) {
  return axios.get('/system/region/treeList', { params });
}

/**
 * 导出区域管理 Excel
 * @param params 导出参数
 */
export function exportRegionExcel(params: RegionPageReqVO) {
  return axios.get('/system/region/export-excel', {
    params,
    responseType: 'blob',
  });
}
