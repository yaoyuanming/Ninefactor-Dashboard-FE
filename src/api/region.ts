import axios from 'axios';

// 区域下拉树参数类型
export interface RegionTreeSelectParams {
  regionCode?: string; // 区域编码（可选）
}

/**
 * 获取区域下拉树列表
 * @param regionCode 区域编码（可选）
 */
export function getRegionTreeSelect(regionCode?: string) {
  return axios.get('/system/region/treeselect', { params: { regionCode } });
}
