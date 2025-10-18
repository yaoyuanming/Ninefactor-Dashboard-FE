// 应急管理地图配置
import govtIcon from '@/assets/screen/emergency/govt-marker.png';
import rescueIcon from '@/assets/screen/emergency/rescue-force-marker.png';
import medicalIcon from '@/assets/screen/emergency/medical-institution-marker.png';
import suppliesIcon from '@/assets/screen/emergency/emergency-supplies-marker.png';
import equipmentIcon from '@/assets/screen/emergency/emergency-equipment-marker.png';
import accidentIcon from '@/assets/screen/emergency/Consequences.png';

// 应急资源图标配置
export const emergencyIcons: Record<string, any> = {
  govt: {
    url: govtIcon,
    size: [32, 32],
    anchor: 'center',
  },
  rescue: {
    url: rescueIcon,
    size: [32, 32],
    anchor: 'center',
  },
  medical: {
    url: medicalIcon,
    size: [32, 32],
    anchor: 'center',
  },
  supplies: {
    url: suppliesIcon,
    size: [32, 32],
    anchor: 'center',
  },
  equipment: {
    url: equipmentIcon,
    size: [32, 32],
    anchor: 'center',
  },
  accident: {
    url: accidentIcon,
    size: [32, 32],
    anchor: 'center',
  },
};

// 地图中心点（福州）
export const centerPoint = [119.18, 25.85];

// 目标区域
export const targetArea = '福州市';

// 行政区域级别
export const targetAreaLevel = 'district';

// 边框样式 - 使用光栅效果
export const strokeType = ['光栅', '发光边缘'][0];

// 动态缩放函数
export const dynamicZoom = (zoom: number) => {
  const designWidth = 1920;
  const scaleX = window.innerWidth / designWidth;
  if (scaleX > 1) {
    const newZoom = Number(zoom) + Number((scaleX - 1).toFixed(2));
    return newZoom;
  }
  return zoom;
};

export const dynamicZooms = (zoom: number) => {
  const newZoom = dynamicZoom(zoom);
  return [newZoom - 1, 20];
};

// 地图缩放级别
export const mapZoom = dynamicZoom(9.8);
export const mapZooms = dynamicZooms(9.8);

// 应急资源类型
export const emergencyTypes = {
  GOVT: 'govt', // 政府机构
  RESCUE: 'rescue', // 救援力量
  MEDICAL: 'medical', // 医疗机构
  SUPPLIES: 'supplies', // 应急物资
  EQUIPMENT: 'equipment', // 应急装备
};

// 应急资源类型名称映射
export const emergencyTypeNames: Record<string, string> = {
  govt: '政府机构',
  rescue: '救援力量',
  medical: '医疗机构',
  supplies: '应急物资',
  equipment: '应急装备',
};

// infoType 类型映射（对应后端枚举）
export const INFO_TYPE_MAP = {
  company: 1, // 企业
  rescue: 2, // 救援队
  medical: 3, // 医疗机构
  supplies: 4, // 应急物资
  equipment: 5, // 应急装备
  accident: 6, // 事故后果
};

// 前端筛选类型 -> 后端 infoType 映射
export const FILTER_TYPE_TO_INFO_TYPE: Record<string, number> = {
  govt: INFO_TYPE_MAP.company,
  rescue: INFO_TYPE_MAP.rescue,
  medical: INFO_TYPE_MAP.medical,
  supplies: INFO_TYPE_MAP.supplies,
  equipment: INFO_TYPE_MAP.equipment,
  accident: INFO_TYPE_MAP.accident,
};
