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

  import drawBoundaryWithCanvas from './boundary';
  import {
    emergencyIcons,
    targetArea,
    centerPoint,
    targetAreaLevel,
    strokeType,
    mapZoom,
    mapZooms,
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

  // 显示应急资源信息窗口
  const showEmergencyInfo = (data: any, marker: any) => {
    // 关闭之前的信息窗口
    if (globalInfoWindow.value.instance) {
      globalInfoWindow.value.instance.close();
    }

    let content = `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${data.name}</h3>
    `;

    switch (data.type) {
      case 'rescue':
        content += `
          <p style="margin: 5px 0;"><strong>人员：</strong>${data.personnel}人</p>
          <p style="margin: 5px 0;"><strong>车辆：</strong>${data.vehicles}辆</p>
        `;
        break;
      case 'medical':
        content += `
          <p style="margin: 5px 0;"><strong>床位：</strong>${data.beds}张</p>
          <p style="margin: 5px 0;"><strong>急诊：</strong>${
            data.emergency ? '是' : '否'
          }</p>
        `;
        break;
      case 'supplies':
        content += `
          <p style="margin: 5px 0;"><strong>类别：</strong>${data.category}</p>
          <p style="margin: 5px 0;"><strong>容量：</strong>${data.capacity}</p>
        `;
        break;
      case 'equipment':
        content += `
          <p style="margin: 5px 0;"><strong>装备：</strong>${data.equipment}</p>
          <p style="margin: 5px 0;"><strong>数量：</strong>${data.quantity}</p>
        `;
        break;
      case 'govt':
        content += `
          <p style="margin: 5px 0;"><strong>级别：</strong>${data.level}</p>
          <p style="margin: 5px 0;"><strong>联系：</strong>${data.contact}</p>
        `;
        break;
      default:
        content += `<p style="margin: 5px 0;">暂无详细信息</p>`;
        break;
    }

    content += '</div>';

    globalInfoWindow.value.instance = new aMap.value.InfoWindow({
      content,
      offset: new aMap.value.Pixel(0, -30),
      closeWhenClickMap: true,
    });

    globalInfoWindow.value.instance.open(map.value, data.position);
    globalInfoWindow.value.currentMarker = marker;
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

      // 添加点击事件
      labelMarker.on('click', () => {
        showEmergencyInfo(item, labelMarker);
      });

      labelMarkerLayer.value.add(labelMarker);
    });
  };

  // 设置搜索关键词（供外部调用）
  const setSearchKeyword = (keyword: string) => {
    currentSearchKeyword.value = keyword;
    updateMarkers();
  };

  // 设置筛选条件（供外部调用）
  const setFilterTypes = (filterTypes: Record<string, boolean>) => {
    currentFilterTypes.value = { ...filterTypes };
    updateMarkers();
  };

  // 清除搜索（供外部调用）
  const clearSearch = () => {
    currentSearchKeyword.value = '';
    updateMarkers();
  };

  // 初始化应急资源标记点
  const initEmergencyMarkers = () => {
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

    // 模拟应急资源数据
    const mockEmergencyData = [
      // 救援力量
      {
        type: 'rescue',
        name: '福州市消防救援支队',
        position: [119.356, 26.061],
        personnel: 120,
        vehicles: 15,
      },
      {
        type: 'rescue',
        name: '鼓楼区应急救援队',
        position: [119.303, 26.082],
        personnel: 50,
        vehicles: 8,
      },
      // 医疗机构
      {
        type: 'medical',
        name: '福建省立医院',
        position: [119.291, 26.099],
        beds: 2000,
        emergency: true,
      },
      {
        type: 'medical',
        name: '福州市第一医院',
        position: [119.321, 26.047],
        beds: 1500,
        emergency: true,
      },
      // 应急物资
      {
        type: 'supplies',
        name: '福州市应急物资储备库',
        position: [119.377, 26.041],
        category: '综合物资',
        capacity: '5000吨',
      },
      {
        type: 'supplies',
        name: '仓山区应急物资仓库',
        position: [119.273, 26.038],
        category: '医疗物资',
        capacity: '1000吨',
      },
      // 应急装备
      {
        type: 'equipment',
        name: '福州市应急装备中心',
        position: [119.415, 26.074],
        equipment: '重型机械',
        quantity: 50,
      },
      {
        type: 'equipment',
        name: '台江区装备储备点',
        position: [119.309, 26.058],
        equipment: '通信设备',
        quantity: 200,
      },
      // 政府机构
      {
        type: 'govt',
        name: '福州市应急管理局',
        position: [119.302, 26.074],
        level: '市级',
        contact: '0591-12345',
      },
      {
        type: 'govt',
        name: '晋安区应急管理局',
        position: [119.324, 26.082],
        level: '区级',
        contact: '0591-67890',
      },
    ];

    // 保存所有数据
    allMarkers.value = mockEmergencyData;

    // 初始化显示标记
    updateMarkers();
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
