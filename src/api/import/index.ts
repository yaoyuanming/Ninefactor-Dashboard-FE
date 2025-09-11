import request from '@/config/axios'

// 导出 API
export const RiskApi = {
  // 导出 Excel
  getTemplate: async (url: string) => {
    return await request.download({ url: url })
  },
  // 上传 Excel
  uploadTemplate: async (file: File, url: string) => {
    const formData = new FormData()
    formData.append('file', file) // 假设服务器期望的字段名为 'file'
    return await request.upload({
      url: url,
      data: formData
    })
  }
}
