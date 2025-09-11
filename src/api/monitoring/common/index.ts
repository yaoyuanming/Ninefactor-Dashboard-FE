import request from '@/config/axios'

// 获取部门列表
export const getlist = () => {
  return request.get({
    url: '/system/dept/list'
  })
}

// 获取ICC授权信息
export const getOauthInfo = () => {
  return request.get({ url: '/mws/oauth-info/info' })
}


// 上传文件/图片接口
export function uploadImage(formData: FormData) {
  return request.post({
    url: '/infra/file/upload',
    data: formData,
    headersType: 'multipart/form-data',
  });
}

/**
 * ICC专用上传图片接口
 *
 */
export function iccUploadImage(formData: FormData) {
  return request.post({
    url: '/mws/icc-common/uploadImage',
    data: formData,
    headersType: 'multipart/form-data',
  });
}

