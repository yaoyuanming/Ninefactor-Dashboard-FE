import request from '@/config/axios'

/**
 * 获得仓库列表接口（创建库房时用）
 * @returns Promise<any>
 */
export const getWarehouseList = () => {
  return request.get({
    url: '/mws/warehouse-info/list',
  })
}

/**
 * 获得库房列表接口
 * @param storeNum 仓库id
 * @returns Promise<any>
 */
export const getStoreRoomList = (storeNum: string) => {
  return request.get({
    url: '/mws/store-room-info/list',
    params: { storeNum },
  })
}
