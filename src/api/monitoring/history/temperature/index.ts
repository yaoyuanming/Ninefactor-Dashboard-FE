import request from '@/config/axios'

/**
 * 温度信息分页查询参数
 */
export interface TemperaturePageParams {
   /** 设备编码 */
   deviceKey?: string;
   /** 	仓库编号/名称 */
   storeKey?: string;
   /** 仓库名称 */
   storeName?: string;
}

/**
 * 获得温度信息分页查询接口
 * @param params 温度分页查询参数
 * @returns Promise<any>
 */
export const getTemperaturePage = (params: TemperaturePageParams) => {
  return request.get({
    url: '/mws/device-sensor-info/temperature',
    params,
  })
}

/**
 * 获得温度信息详情接口
 * @param id 温度记录编号
 * @returns Promise<any>
 */
export const getTemperatureDetail = (id: string) => {
  return request.get({
    url: '/mws/temperature-info/get',
    params: { id },
  })
}

/**
 * 删除温度信息接口
 * @param id 温度记录编号
 * @returns Promise<any>
 */
export const deleteTemperature = (id: string) => {
  return request.delete({
    url: '/mws/temperature-info/delete',
    params: { id },
  })
}

/**
 * 导出温度信息Excel接口
 * @param params 导出参数，参考分页查询参数
 * @returns Promise<Blob>
 */
export const exportTemperatureExcel = (params: TemperaturePageParams) => {
  return request.get({
    url: '/mws/temperature-info/export-excel',
    params,
    responseType: 'blob', // 返回文件流
  })
}


