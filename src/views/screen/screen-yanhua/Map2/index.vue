<template>
  <div
    v-loading="loading"
    class="screen-map"
    style="position: relative; width: 100%; height: 100%"
  >
    <div
      id="mapElement2"
      style="position: relative; width: 100%; height: 100%"
    ></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  import mapLoader from '@/utils/aMap';
  import { Message } from '@arco-design/web-vue';
  import { getEmergencyMapInfo } from '@/api/emergency';

  import drawBoundaryWithCanvas from './boundary';
  import {
    emergencyIcons,
    targetArea,
    centerPoint,
    targetAreaLevel,
    strokeType,
    mapZoom,
    mapZooms,
    FILTER_TYPE_TO_INFO_TYPE,
  } from './config';

  const map = ref<any>(null);
  const aMap = ref<any>(null);
  const mapLoca = ref<any>(null);
  // 新增遮罩相关变量
  const maskPolygon = ref<any>(null);

  const boundaries = ref<any>(null);
  const allBoundaries = ref<any>(null);
  const labelMarkerLayer = ref<any>(null); // LabelMarker图层
  const loading = ref(true);

  // 筛选条件（从外部传入）
  const currentFilterTypes = ref({
    govt: true,
    rescue: true,
    medical: true,
    supplies: false,
    equipment: false,
    accident: false,
  });

  // 搜索关键词（从外部传入）
  const currentSearchKeyword = ref('');

  // 存储所有标记数据
  const allMarkers = ref<any[]>([]);

  // 全局单例InfoWindow实例
  const globalInfoWindow = ref<any>({
    instance: null,
    currentMarker: null,
  });

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

  // 风险等级映射
  const getRiskLevelText = (riskLevel: string | number): string => {
    const level = String(riskLevel);
    const riskLevelMap: Record<string, string> = {
      '0': '无风险',
      '2': '低风险',
      '5': '一般风险',
      '8': '较大风险',
      '10': '重大风险',
    };
    return riskLevelMap[level] || '未知';
  };

  // 从接口加载应急资源数据
  const loadEmergencyData = async () => {
    try {
      // 根据筛选条件构建 infoType 参数
      const infoTypes: number[] = [];
      Object.keys(currentFilterTypes.value).forEach((key) => {
        if (currentFilterTypes.value[key]) {
          const infoType = FILTER_TYPE_TO_INFO_TYPE[key];
          if (infoType) {
            infoTypes.push(infoType);
          }
        }
      });

      // 如果没有选中任何类型，返回空数据
      if (infoTypes.length === 0) {
        allMarkers.value = [];
        return;
      }

      // 调用接口
      const response = await getEmergencyMapInfo({
        searchKey: currentSearchKeyword.value,
        infoType: infoTypes.join(','),
      });

      const { data } = response;
      const markers: any[] = [];

      // 处理企业数据
      if (data.companyData && Array.isArray(data.companyData)) {
        data.companyData.forEach((item: any) => {
          if (item.longitude && item.latitude) {
            markers.push({
              type: 'govt',
              name: item.enterpriseName || item.name || '未知企业',
              position: [item.longitude, item.latitude],
              riskLevel:
                item.riskLevel !== undefined
                  ? getRiskLevelText(item.riskLevel)
                  : '未知',
              contact: item.principal || '暂无',
              address: item.registerAddress || item.productionAddress || '',
              id: item.id,
            });
          }
        });
      }

      // 处理救援队数据
      if (data.rescueTeamData && Array.isArray(data.rescueTeamData)) {
        data.rescueTeamData.forEach((item: any) => {
          if (item.longitude && item.latitude) {
            markers.push({
              type: 'rescue',
              name: item.teamName || '未知救援队',
              position: [item.longitude, item.latitude],
              personnel: item.teamSize || 0,
              vehicles: item.vehicles || 0,
              leader: item.teamLeader,
              phone: item.contactPhone,
              id: item.id,
            });
          }
        });
      }

      // 处理医疗机构数据
      if (
        data.medicalInstitutionData &&
        Array.isArray(data.medicalInstitutionData)
      ) {
        data.medicalInstitutionData.forEach((item: any) => {
          if (item.longitude && item.latitude) {
            markers.push({
              type: 'medical',
              name: item.institutionName || item.name || '未知医疗机构',
              position: [item.longitude, item.latitude],
              beds: item.bedCount || 0,
              emergency: item.hasEmergency || false,
              phone: item.contactPhone,
              id: item.id,
            });
          }
        });
      }

      // 处理应急物资数据
      if (
        data.emergencySuppliesData &&
        Array.isArray(data.emergencySuppliesData)
      ) {
        data.emergencySuppliesData.forEach((item: any) => {
          if (item.longitude && item.latitude) {
            markers.push({
              type: 'supplies',
              name: item.suppliesName || item.name || '未知物资库',
              position: [item.longitude, item.latitude],
              category: item.category || '综合物资',
              capacity: item.storageCapacity || '未知',
              id: item.id,
            });
          }
        });
      }

      // 处理应急装备数据
      if (
        data.emergencyEquipmentData &&
        Array.isArray(data.emergencyEquipmentData)
      ) {
        data.emergencyEquipmentData.forEach((item: any) => {
          if (item.longitude && item.latitude) {
            markers.push({
              type: 'equipment',
              name: item.equipmentName || item.name || '未知装备库',
              position: [item.longitude, item.latitude],
              equipment: item.equipmentType || '应急装备',
              quantity: item.quantity || 0,
              id: item.id,
            });
          }
        });
      }

      // 处理事故后果数据
      if (
        data.accidentConsequenceData &&
        Array.isArray(data.accidentConsequenceData)
      ) {
        data.accidentConsequenceData.forEach((item: any) => {
          if (item.longitude && item.latitude) {
            markers.push({
              type: 'accident',
              name: item.accidentName || item.name || '未知事故',
              position: [item.longitude, item.latitude],
              level: item.accidentLevel || '未知',
              casualties: item.casualties || 0,
              description: item.description || '',
              id: item.id,
            });
          }
        });
      }

      allMarkers.value = markers;
    } catch (error: any) {
      Message.error(error?.message || '加载地图数据失败');
      allMarkers.value = [];
    }
  };

  // 更新标记显示
  const updateMarkers = () => {
    if (!labelMarkerLayer.value || !allMarkers.value.length) return;

    // 清除所有标记
    labelMarkerLayer.value.clear();

    // 根据筛选条件过滤数据
    const filteredData = allMarkers.value.filter((item) => {
      // 搜索过滤
      if (currentSearchKeyword.value) {
        const keyword = currentSearchKeyword.value.toLowerCase();
        if (!item.name.toLowerCase().includes(keyword)) {
          return false;
        }
      }

      // 类型筛选
      return currentFilterTypes.value[item.type];
    });

    // 重新添加符合条件的标记
    filteredData.forEach((item) => {
      const icon = emergencyIcons[item.type];
      if (!icon) return;

      const labelMarker = new aMap.value.LabelMarker({
        position: item.position,
        zIndex: 10,
        icon: {
          type: 'image',
          image: icon.url,
          size: icon.size,
          anchor: icon.anchor,
        },
        text: {
          content: item.name,
          direction: 'bottom',
          offset: [0, 5],
          style: {
            fontSize: 12,
            fontWeight: 'normal',
            fillColor: '#ffffff',
            strokeColor: '#004c99',
            strokeWidth: 2,
          },
        },
      });

      // 移除点击弹窗事件
      // labelMarker.on('click', () => {
      //   showEmergencyInfo(item, labelMarker);
      // });

      labelMarkerLayer.value.add(labelMarker);
    });
  };

  // 初始化应急资源标记点
  const initEmergencyMarkers = async () => {
    if (!labelMarkerLayer.value) {
      labelMarkerLayer.value = new aMap.value.LabelsLayer({
        collision: false,
        allowCollision: false,
        zIndex: 10,
      });
      map.value.add(labelMarkerLayer.value);
    }

    // 清除旧的标记
    labelMarkerLayer.value.clear();

    // 加载真实数据
    await loadEmergencyData();

    // 重新添加符合条件的标记
    updateMarkers();
  };

  // 设置搜索关键词（供外部调用）
  const setSearchKeyword = async (keyword: string) => {
    currentSearchKeyword.value = keyword;
    // 重新加载数据
    await initEmergencyMarkers();
  };

  // 设置筛选条件（供外部调用）
  const setFilterTypes = async (filterTypes: Record<string, boolean>) => {
    currentFilterTypes.value = { ...filterTypes };
    // 重新加载数据
    await initEmergencyMarkers();
  };

  // 清除搜索（供外部调用）
  const clearSearch = async () => {
    currentSearchKeyword.value = '';
    // 重新加载数据
    await initEmergencyMarkers();
  };

  // 初始化地图
  const initMap = async () => {
    loading.value = true;
    try {
      const AMap = await mapLoader();
      aMap.value = AMap;

      // 使用不同的容器ID避免冲突
      map.value = new AMap.Map('mapElement2', {
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

      // 创建LabelMarker图层
      labelMarkerLayer.value = new AMap.LabelsLayer({
        zooms: mapZooms,
        zIndex: 200,
        collision: false,
      });
      map.value.add(labelMarkerLayer.value);

      // 创建Canvas自定义图层（用于发光边缘效果）
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

      // 将Loca初始化移到地图complete事件中
      map.value.on('complete', () => {
        // 创建行政区查询实例
        const district = new AMap.DistrictSearch({
          subdistrict: 1,
          extensions: 'all',
          level: targetAreaLevel,
        });

        // 搜索边界
        district.search(targetArea, async (status: string, result: any) => {
          if (status === 'complete' && result.districtList.length > 0) {
            const cityData = result.districtList[0];
            // 获取市级边界
            const boundariesItems = result.districtList[0].boundaries || [];
            boundaries.value =
              boundariesItems.length > 0 ? boundariesItems : null;

            // 获取区级边界
            const districtBoundaries: any[] = [];
            if (cityData.districtList && cityData.districtList.length > 0) {
              // 并行查询所有区的边界
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

            // 合并市级和区级边界
            allBoundaries.value = [
              ...(boundaries.value || []),
              ...districtBoundaries,
            ];

            // 添加遮罩层
            createMaskLayer();
            // 绘制区域内遮罩
            areaBoundaries(boundaries.value, 0.55);
            areaBoundaries(districtBoundaries, 0);

            // 绘制边界
            if (strokeType === '发光边缘' && boundaries.value) {
              customLayer.render = drawBoundaryCanvas;
              customLayer.render();
            }
            if (strokeType === '光栅') {
              createAuroraFence();
            }

            // 初始化应急资源标记
            initEmergencyMarkers();

            loading.value = false;
          }
        });
      });
    } catch (error) {
      loading.value = false;
    }
  };

  // 计算缩放比例
  const calculateScale = () => {
    const designWidth = 1920;
    const designHeight = 1080;
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    // 计算缩放比例（取宽高比例的较小值）
    const scaleX = currentWidth / designWidth;
    const scaleY = currentHeight / designHeight;
    const scaleRatio = Math.min(scaleX, scaleY);

    // 设置CSS变量供样式使用
    document.documentElement.style.setProperty(
      '--scale-ratio',
      scaleRatio.toString()
    );
  };

  // 监听窗口大小变化
  const handleResize = () => {
    calculateScale();
  };

  onMounted(() => {
    // 初始计算缩放比例
    calculateScale();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    nextTick(() => {
      initMap();
    });
  });

  onUnmounted(() => {
    // 移除事件监听
    window.removeEventListener('resize', handleResize);

    // 销毁全局InfoWindow
    if (globalInfoWindow.value.instance) {
      globalInfoWindow.value.instance.destroy();
      globalInfoWindow.value.instance = null;
    }
    // 销毁Loca实例
    if (mapLoca.value) {
      mapLoca.value.destroy();
      mapLoca.value = null;
    }
    // 确保地图被销毁
    if (map.value) {
      map.value.destroy();
      map.value = null;
    }
  });

  // 暴露方法供外部调用
  defineExpose({
    refreshMarkers: initEmergencyMarkers,
    setSearchKeyword,
    setFilterTypes,
    clearSearch,
    updateMarkers,
  });
</script>

<style scoped lang="less">
  .screen-map {
    position: relative;
    width: 100%;
    height: 100%;
  }

  :deep(.amap-info-window) {
    background: rgb(255 255 255 / 95%);
    border-radius: 4px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  }

  :deep(.amap-info-window-content) {
    padding: 0;
  }

  /* 隐藏高德Logo */
  :deep(.amap-logo) {
    display: none !important;
  }

  /* 隐藏版权信息 */
  :deep(.amap-copyright) {
    display: none !important;
    opacity: 0 !important;
  }
</style>
