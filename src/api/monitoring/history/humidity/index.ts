import request from '@/config/axios'

/**
 * 湿度信息查询参数
 */
export interface HumidityParams {
  /** 设备编码 */
  deviceKey?: string;
  /** 设备名称 */
  storeKey?: string;
  /** 仓库名称 */
  storeName?: string;
}

/**
 * 获得湿度信息查询接口
 * @param params 湿度查询参数
 * @returns Promise<any>
 */
export const getHumidity = (params: HumidityParams) => {
  return request.get({
    url: '/mws/device-sensor-info/humidity',
    params,
  })
}

/**
 * 获得湿度信息详情接口
 * @param id 湿度记录编号
 * @returns Promise<any>
 */
export const getHumidityDetail = (id: string) => {
  return request.get({
    url: '/mws/humidity-info/get',
    params: { id },
  })
}

/**
 * 删除湿度信息接口
 * @param id 湿度记录编号
 * @returns Promise<any>
 */
export const deleteHumidity = (id: string) => {
  return request.delete({
    url: '/mws/humidity-info/delete',
    params: { id },
  })
}

/**
 * 导出湿度信息Excel接口
 * @param params 导出参数，参考分页查询参数
 * @returns Promise<Blob>
 */
export const exportHumidityExcel = (params: HumidityParams) => {
  return request.get({
    url: '/mws/humidity-info/export-excel',
    params,
    responseType: 'blob', // 返回文件流
  })
}
