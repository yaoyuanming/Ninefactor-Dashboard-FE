<template>
  <div v-loading="loading" class="screen-map" style="position: relative; width: 100%; height: 100%">
    <div class="search-box"> </div>
    <div id="mapElement" style="position: relative; width: 100%; height: 100%"></div>
    <DetailDrawer ref="openDrawer" v-model:visible="visible" :type="DrawerType.COMPANY"/>
  </div>
</template>

<script lang="ts" setup>
import mapLoader from '@/utils/aMap.js';
import { ref, onMounted, onUnmounted, nextTick ,inject} from 'vue';
import { getEnterPageList } from '@/api/compmonitoring';
// 直接引入图片资源
import Risk02 from '@/assets/screen/map/risk02.png';
import Risk05 from '@/assets/screen/map/risk05.png';
import Risk08 from '@/assets/screen/map/risk08.png';
import Risk010 from '@/assets/screen/map/risk010.png';
import drawBoundaryWithCanvas from './boundary';
import DetailDrawer from '../DetailDrawer/index.vue'
import { DrawerType, type DrawerTypeValue } from '../DetailDrawer/types';
import {
  targetArea,
  centerPoint,
  targetAreaLevel,
  strokeType,
  mapZoom,
  mapZooms,
} from './config';
// 弹窗方法
const openDrawer = ref(null)
const visible = ref(false)

const companyList = ref<any[]>([]);

const map = ref<any>(null);
const aMap = ref<any>(null);
const mapLoca = ref<any>(null);
// 新增遮罩相关变量
const maskPolygon = ref<any>(null);

const boundaries = ref<any>(null);
const allBoundaries = ref<any>(null);
const labelMarkerLayer = ref<any>(null); // LabelMarker图层
const dangerousTrade = ref<string[]>([]);
const loading = ref(true);
const INFO_WINDOW_CLOSE_DELAY = 1000;
const pageSize = 1000;

// 全局单例InfoWindow实例
const globalInfoWindow = ref<any>({
  instance: null,
  currentMarker: null,
});

// 字符串类型riskLevel与图片的映射
const riskLevelIconMap = {
  '0': Risk02,
  '1': Risk05,
  '2': Risk08,
  '3': Risk010,
};

// 图标尺寸配置
const iconSize = [30, 36];

// 创建遮罩层（使用 DistrictSearch 边界）
const createMaskLayer = () => {
  // 清除旧遮罩
  if (maskPolygon.value && map.value) {
    map.value.remove(maskPolygon.value);
  }

  // 使用高德坐标范围
  const outer = [
    new aMap.value.LngLat(70, 55, true), // 西北
    new aMap.value.LngLat(70, 15, true), // 西南
    new aMap.value.LngLat(140, 15, true), // 东南
    new aMap.value.LngLat(140, 55, true), // 东北
  ];
  const pathArray = [outer, ...boundaries.value];
  maskPolygon.value = new aMap.value.Polygon({
    path: pathArray,
    fillColor: '#192F44',
    fillOpacity: 0.8,
    strokeWeight: 0,
    zIndex: 1,
    bubble: true,
    clickable: false,
  });
  map.value.add(maskPolygon.value);
};

// 绘制区域内遮罩
const areaBoundaries = (
  boundariesArray = boundaries.value,
  fillOpacity = 0.45
) => {
  // 主体
  boundariesArray?.forEach((boundaryItem) => {
    return new aMap.value.Polygon({
      path: boundaryItem,
      strokeColor: '#9BCCFF',
      strokeWeight: 3,
      strokeStyle: 'solid',
      fillColor: '#1796FA',
      fillOpacity,
      strokeOpacity: 0.66,
      map: map.value,
      zIndex: 3,
    });
  });
};

// 创建极光围栏效果（使用 DistrictSearch 边界）
const createAuroraFence = () => {
  const vloca = new window.Loca.Container({
    map: map.value,
  });
  mapLoca.value = vloca;

  // 使用行政区查询返回的全部边界路径构建 GeoJSON
  if (!boundaries.value || !boundaries.value.length) return;

  // 创建面状GeoJSON（为每个边界生成一个 Feature）
  const features = boundaries.value.map((boundary: any) => {
    const polygonCoords = (boundary || []).map((p: any) =>
      Array.isArray(p) ? [p[0], p[1]] : [p.lng, p.lat]
    );
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonCoords],
      },
    };
  });
  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  const dirLight = new window.Loca.DirectionalLight({
    intensity: 0.9,
    color: 'rgb(255, 250, 240)',
    target: [0, 1, 0],
    position: [0, -1, 0],
    castShadow: true,
  });
  mapLoca.value.addLight(dirLight);

  const geo = new window.Loca.GeoJSONSource({ data: geojson });
  const auroraLayer = new window.Loca.PolygonLayer({
    zIndex: 3,
    cullface: 'none',
    shininess: 1,
    hasBottom: false,
    blockHide: false,
    hasSide: true,
    hasTop: false,
    depth: true,
  });
  auroraLayer.setSource(geo);
  auroraLayer.setStyle({
    topColor: () => '#1796FA',
    sideTopColor: () => '#1796FA',
    sideBottomColor: () => '#1796FA',
    height: 1450,
    altitude: -1400,
    glow: { color: '#1796FA', intensity: 0.7, radius: 20 },
  });
  mapLoca.value.add(auroraLayer);
};

// 新增：查询区级边界
const queryDistrictBoundaries = (districtName: any, level: string) => {
  return new Promise((resolve) => {
    const district = new aMap.value.DistrictSearch({
      subdistrict: 0,
      extensions: 'all',
      level,
    });

    district.search(
      districtName,
      (status: string, result: { districtList: string | any[] }) => {
        if (status === 'complete' && result.districtList.length > 0) {
          const boundaries1 = result.districtList[0].boundaries || [];
          resolve(boundaries1.length > 0 ? boundaries1 : null);
        } else {
          resolve(null);
        }
      }
    );
  });
};

// 高亮LabelMarker
const highlightLabelMarker = (labelMarker: any, isHighlight: boolean) => {
  const company = labelMarker.getExtData();
  const riskLevel = company.riskLevel || '0';
  const iconUrl = riskLevelIconMap[riskLevel] || Risk02;

  if (isHighlight) {
    // 放大效果
    labelMarker.setIcon({
      type: 'image',
      image: iconUrl,
      size: [iconSize[0] * 1.2, iconSize[1] * 1.2],
      anchor: 'bottom-center',
    });
  } else {
    // 恢复正常大小
    labelMarker.setIcon({
      type: 'image',
      image: iconUrl,
      size: iconSize,
      anchor: 'bottom-center',
    });
  }
};

// 创建信息窗口内容
const createInfoWindowContent = (company: any) => {
  const div = document.createElement('div');
  div.className = 'custom-info-window';

  div.innerHTML = `
    <div class="info-title">${company.enterpriseName || '企业名称'}</div>
    <div class="info-item">
      <span class="item-label">统一社会信用代码：</span>
      <span>${company.creditCode || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">企业生产经营地址：</span>
      <span>${company.enterprisesBusinessAddress || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">管控行业类型：</span>
      <span>${company.controlName || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">企业规模：</span>
      <span>${company.enterpriseScale || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">动态风险等级：</span>
      <span>${company.riskLevel || '暂无数据'}</span>
    </div>
    <div class="info-item">
      <span class="item-label">是否涉及高危环境：</span>
      <span>暂无数据</span>
    </div>
    <div class="info-footer" >
      <button class="company-detail-btn">查看企业详情</button>
    </div>
  `;

  return div;
};


// 查看企业详情
function ViewEnterpriseDetails(rows: any) {
  visible.value = true
  openDrawer.value.desiShow(rows,false)
}

// 使用LabelMarker创建企业标记
const addCompanyLabelMarkers = (newCompanies: any) => {
  if (!map.value || !aMap.value || !labelMarkerLayer.value) {
    return;
  }

  const AMap = aMap.value;
  const markers: any = [];

  newCompanies.forEach((company: any) => {
    const lng = parseFloat(company.longitude);
    const lat = parseFloat(company.latitude);
    if (
      !company.longitude ||
      !company.latitude ||
      Number.isNaN(lng) ||
      Number.isNaN(lat)
    ) {
      return;
    }

    const riskLevel = company.riskLevel || '0';
    const iconUrl = riskLevelIconMap[riskLevel] || Risk02;

    const labelMarker = new AMap.LabelMarker({
      position: new AMap.LngLat(lng, lat),
      icon: {
        type: 'image',
        image: iconUrl,
        size: iconSize,
        anchor: 'bottom-center',
      },
      zIndex: 200,
      extData: company,
      opacity: 1,
    });

    labelMarker.on('mouseover', (e: any) => {
      const marker = e.target;
      const companyData = marker.getExtData();

      if (
        globalInfoWindow.value.currentMarker &&
        globalInfoWindow.value.currentMarker !== marker
      ) {
        clearTimeout(globalInfoWindow.value.currentMarker.closeTimer);
        globalInfoWindow.value.currentMarker.closeTimer = null;
      }

      globalInfoWindow.value.currentMarker = marker;
      highlightLabelMarker(marker, true);

      globalInfoWindow.value.instance.setContent(
        createInfoWindowContent(companyData)
      );
      globalInfoWindow.value.instance.open(map.value, marker.getPosition());

      const content = globalInfoWindow.value.instance.getContent();
      if (content) {
        content.addEventListener('mouseenter', () => {
          if (marker.closeTimer) clearTimeout(marker.closeTimer);
        });

        content.addEventListener('mouseleave', () => {
          marker.closeTimer = setTimeout(() => {
            if (globalInfoWindow.value.instance?.getIsOpen()) {
              globalInfoWindow.value.instance.close();
            }
          }, INFO_WINDOW_CLOSE_DELAY);
        });
      }

      nextTick(() => {
        const detailBtn = document.querySelector('.company-detail-btn');
        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            // pushToEnterpriseDetail(companyData);
            // 调用查看企业详情函数
            ViewEnterpriseDetails(companyData);
          });
        }
      });
    });

    labelMarker.on('mouseout', (e: any) => {
      const marker = e.target;
      highlightLabelMarker(marker, false);
      marker.closeTimer = setTimeout(() => {
        const content = globalInfoWindow.value.instance.getContent();
        if (
          !content?.matches(':hover') &&
          globalInfoWindow.value.instance?.getIsOpen()
        ) {
          globalInfoWindow.value.instance.close();
        }
      }, INFO_WINDOW_CLOSE_DELAY);
    });

    markers.push(labelMarker);
  });

  labelMarkerLayer.value.add(markers);
};

// 清理标记
const clearLabelMarkers = () => {
  if (labelMarkerLayer.value) {
    labelMarkerLayer.value?.clear();
  }

  if (
    globalInfoWindow.value.instance &&
    globalInfoWindow.value.instance?.getIsOpen()
  ) {
    globalInfoWindow.value.instance.close();
  }
};

// 获取企业列表
const getCompanyListIfo = async () => {
  try {
    loading.value = true;
    companyList.value = [];
    clearLabelMarkers();

    const loadAllDataIncremental = async (pageNo = 1) => {
      const res = await getEnterPageList({
        pageNo,
        pageSize,
        riskEnvTypes: dangerousTrade.value?.join(','),
      });

      if (res.success && res.data && res.data.records) {
        const newCompanies = res.data.records;
        companyList.value = [...companyList.value, ...newCompanies];
        addCompanyLabelMarkers(newCompanies);

        if (res.data.total > companyList.value.length) {
          await nextTick();
          await loadAllDataIncremental(pageNo + 1);
        }
      }
    };

    await loadAllDataIncremental(1);
  } catch (error) {
    // 忽略错误，可根据业务需求添加错误处理
  } finally {
    loading.value = false;
  }
};

// 初始化地图
const initMap = async () => {
  mapLoader().then((AMap: any) => {
    aMap.value = AMap;

    map.value = new AMap.Map('mapElement', {
      viewMode: strokeType === '发光边缘' ? '2D' : '3D',
      rotateEnable: false,
      pitchEnable: false,
      pitch: 30,
      rotation: 0,
      zooms: mapZooms,
      zoom: mapZoom,
      center: centerPoint,
      mapStyle: 'amap://styles/grey',
    });

    labelMarkerLayer.value = new AMap.LabelsLayer({
      zooms: mapZooms,
      zIndex: 200,
      collision: false,
    });
    map.value.add(labelMarkerLayer.value);

    const canvas = document.createElement('canvas');
    canvas.width = map.value.getSize().width;
    canvas.height = map.value.getSize().height;

    const customLayer = new AMap.CustomLayer(canvas, {
      zIndex: 12,
      zooms: mapZooms,
    });
    map.value.add(customLayer);

    const drawBoundaryCanvas = () => {
      drawBoundaryWithCanvas(canvas, map.value, AMap, boundaries.value);
    };

    map.value.on('complete', () => {
      globalInfoWindow.value.instance = new AMap.InfoWindow({
        isCustom: true,
        offset: new AMap.Pixel(260, 100),
        closeWhenClickMap: true,
      });
      globalInfoWindow.value.currentMarker = null;

      const district = new AMap.DistrictSearch({
        subdistrict: 1,
        extensions: 'all',
        level: targetAreaLevel,
      });

      district.search(targetArea, async (status: string, result: any) => {
        if (status === 'complete' && result.districtList.length > 0) {
          const cityData = result.districtList[0];
          const boundariesItems = result.districtList[0].boundaries || [];
          boundaries.value =
            boundariesItems.length > 0 ? boundariesItems : null;
          const districtBoundaries: any[] = [];
          if (cityData.districtList && cityData.districtList.length > 0) {
            const districtQueries = cityData.districtList.map(
              async (districtItem: { name: any }) => {
                const boundaries2 = await queryDistrictBoundaries(
                  districtItem.name,
                  'district'
                );
                return boundaries2;
              }
            );

            const results = await Promise.all(districtQueries);
            results.forEach((boundary) => {
              if (boundary) {
                districtBoundaries.push(...boundary);
              }
            });
          }

          allBoundaries.value = [
            ...(boundaries.value || []),
            ...districtBoundaries,
          ];

          createMaskLayer();
          areaBoundaries(boundaries.value, 0.55);
          areaBoundaries(districtBoundaries, 0);
          if (strokeType === '发光边缘' && boundaries.value) {
            customLayer.render = drawBoundaryCanvas;
            customLayer.render();
          }
          if (strokeType === '光栅') {
            createAuroraFence();
          }
        }
      });

      loading.value = false;
      getCompanyListIfo();
    });
  });
};

onMounted(async () => {
  await initMap();
});

onUnmounted(() => {
  clearLabelMarkers();
  if (globalInfoWindow.value.instance) {
    globalInfoWindow.value.instance.destroy();
    globalInfoWindow.value.instance = null;
  }
  if (mapLoca.value) {
    mapLoca.value.destroy();
    mapLoca.value = null;
  }
  if (map.value) {
    map.value.destroy();
    map.value = null;
  }
});
</script>

<style lang="less">
/* 隐藏高德Logo */
.amap-logo {
  display: none !important;
}

/* 隐藏版权信息（版本号） */
.amap-copyright {
  display: none !important;
  opacity: 0 !important;
}

/* 信息窗口样式 */
.custom-info-window {
  position: relative;
  width: 420px;
  overflow: hidden;
  background: linear-gradient(180deg,
      rgb(0 0 0 / 60%) 0%,
      rgb(0 0 0 / 0%) 100%),
    rgb(8 30 64 / 84%);

  .info-title {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 44px;
    margin-bottom: 10px;
    padding-left: 20px;
    color: #fff;
    font-weight: bold;
    font-size: 16px;
    line-height: 44px;
    background: radial-gradient(77% 77% at 50% 100%,
        rgb(72 146 243 / 31%) 0%,
        rgb(72 146 243 / 0%) 100%),
      linear-gradient(270deg,
        rgb(62 86 124 / 33%) 0%,
        rgb(62 86 124 / 19%) 94%);
    border-style: solid;
    border-width: 0 0 2px;
    border-image: linear-gradient(270deg,
        rgb(48 106 141 / 0%) 0%,
        rgb(141 147 255 / 57.8%) 27%,
        #33b2ff 52%,
        rgb(108 147 255 / 55.8%) 75%,
        rgb(48 106 141 / 0%) 100%) 0 0 2 0;
    opacity: 1;
  }

  .info-item {
    width: 100%;
    margin-bottom: 10px;
    padding-left: 20px;
    color: #fff;
    font-size: 12px;
    line-height: 18px;

    .item-label {
      color: #8cbcff;
      letter-spacing: 0;
    }
  }

  .info-footer {
    display: flex;
    justify-content: flex-end;
    padding: 4px 20px;
    background: rgb(255 255 255 / 9%);

    button {
      color: #fff;
      line-height: 18px;
      background: #0000;
      border: none;
    }

    .company-detail-btn {
      cursor: pointer !important;
    }
  }
}
</style>

<style lang="less" scoped>
.screen-map {
  .search-box {
    position: absolute;
    top: 8.5%;
    left: 25.5%;
    z-index: 200;
  }
}
</style>
