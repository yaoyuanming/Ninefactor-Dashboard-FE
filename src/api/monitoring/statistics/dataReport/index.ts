import request from '@/config/axios'

/**
 * 获取数据报表
 * @returns Promise<Blob>
 */
export const getDataReport = () => {
  return request.download<Blob>({
    url: '/mws/analysis/base-info/getReport'
  })
}
