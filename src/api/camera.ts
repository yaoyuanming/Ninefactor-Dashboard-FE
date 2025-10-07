import axios from 'axios';

// 监控树参数类型
export interface CameraTreeParams {
  id?: string | number;
  menu?: number;
  vendorType?: string;
}

// 实时预览参数类型
export interface CameraStreamPreviewParams {
  id: string; // 监控点编码（必需）
  vendorType: string; // 厂商类型（必需）
  startTime?: string; // 可选
  endTime?: string; // 可选
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
