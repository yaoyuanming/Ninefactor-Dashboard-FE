import axios from 'axios';

/**
 * 图片上传接口（单个文件）
 * @param file 文件对象
 * @param uploadDict 上传字典类型（必填）
 * @returns 上传结果
 */
// eslint-disable-next-line import/prefer-default-export
export function uploadImage(file: File, uploadDict: string) {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/common/open/upload', formData, {
    params: {
      uploadDict,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 字典
 * @param dictType 上传字典类型
 * @returns 上传结果
 */

export function DictType(params: string) {
  return axios.get(`/system/dict/data/type/${params}`);
}

/**
 * 获取行业下拉列表
 */
export function getIndustrySelect() {
  return axios.get(`/system/industry/treeselect`);
}
