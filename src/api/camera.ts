import axios from 'axios';

// 监控树参数类型
export interface CameraTreeParams {
  id?: string; // 节点id
}

// 树节点类型
export interface TreeNodeVO {
  id: string; // 节点ID
  name: string; // 节点名称
  nodeType: 'region' | 'company'; // 节点类型：region-区域目录, company-企业目录
  pid?: string; // 父节点ID
}

// 监控点类型
export interface CameraVO {
  id: string; // 监控点ID
  name: string; // 监控点名称
  isOnline: number; // 是否在线 1-在线 0-离线
  vendorType: string; // 厂商类型 DAHUA等
}

// 实时预览参数类型
export interface CameraStreamPreviewParams {
  id: string; // 监控点编码（必需）
  vendorType: string; // 厂商类型（必需）
  startTime?: string; // 可选
  endTime?: string; // 可选
}

// 实时预览响应类型
export interface CameraStreamPreviewResponse {
  url: string; // 拉流地址
  token: string; // token
  vendorType: string; // 厂商类型
  records?: any;
  list?: any;
}

// 录像回放参数类型
export interface CameraStreamPlaybackParams {
  id: string; // 监控点编码（必需）
  vendorType: string; // 厂商类型（必需）
  startTime?: string; // 可选
  endTime?: string; // 可选
}

/**
 * 监控树(获取子节点列表)
 * @param params 查询参数
 */
export function getCameraTree(params?: CameraTreeParams) {
  return axios.get('/mws/camera/tree', { params });
}

/**
 * 实时预览（或按时间段预览）
 * @param params 预览参数
 */
export function getCameraStreamPreview(params: CameraStreamPreviewParams) {
  return axios.get('/mws/camera/stream-preview', { params });
}

/**
 * 录像回放（按时间段回放）
 * @param params 回放参数
 */
export function getCameraStreamPlayback(params: CameraStreamPlaybackParams) {
  return axios.get('/mws/camera/stream-playback', { params });
}

/**
 * 根据企业节点id获取监控点列表
 * @param id 企业节点id
 */
export function getCamerasByCompId(id: string | number) {
  return axios.get(`/mws/camera/byCompId/${id}`);
}
