<template>
  <div
    v-loading="loading"
    class="screen-map"
    style="position: relative; width: 100%; height: 100%"
  >
    <div class="search-box"> </div>
    <div
      id="mapElement"
      style="position: relative; width: 100%; height: 100%"
    ></div>
  </div>
</template>

<script lang="ts" setup>
  import mapLoader from '@/utils/aMap.js';
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import {
    companyIcon,
    targetArea,
    centerPoint,
    mockData,
    targetAreaLevel,
    strokeType,
    mapZoom,
    mapZooms,
  } from './config';
  import drawBoundaryWithCanvas from './boundary';

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
  // const { push } = useRouter();

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
        strokeWeight: 3, // 增加边框宽度以便查看
        strokeStyle: 'solid',
        fillColor: '#1796FA', // 填充色
        fillOpacity,
        strokeOpacity: 0.66, // 将边框透明度设置为1，使其可见
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
      intensity: 0.9, // 提高强度增强立体感
      color: 'rgb(255, 250, 240)', // 暖白色模拟自然阳光
      target: [0, 1, 0], // 保持Y轴正方向
      position: [0, -1, 0], // 调整位置创造斜射效果
      castShadow: true, // 启用阴影增强立体切割感
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

  // 在initMap函数顶部添加
  const initMap = async () => {
    mapLoader().then((AMap: any) => {
      aMap.value = AMap;

      // 创建地图实例（3D模式）- 直接使用石狮市中心坐标
      map.value = new AMap.Map('mapElement', {
        viewMode: strokeType === '发光边缘' ? '2D' : '3D', // 使用3D模式
        rotateEnable: false, // 禁用旋转
        pitchEnable: false, // 禁用俯仰
        pitch: 30, // 俯仰角度
        rotation: 0, // 旋转角度
        zooms: mapZooms,
        zoom: mapZoom,
        center: centerPoint, // 石狮市中心坐标
        mapStyle: 'amap://styles/grey', // 深色底图增强极光效果
      });

      // 创建LabelMarker图层
      labelMarkerLayer.value = new AMap.LabelsLayer({
        zooms: mapZooms,
        zIndex: 200,
        collision: false, // 避免碰撞
      });
      map.value.add(labelMarkerLayer.value);

      const canvas = document.createElement('canvas');
      // 将 canvas 宽高设置为地图实例的宽高
      canvas.width = map.value.getSize().width;
      canvas.height = map.value.getSize().height;

      // 创建一个自定义图层
      const customLayer = new AMap.CustomLayer(canvas, {
        zIndex: 12,
        zooms: mapZooms, // 设置可见级别，[最小级别，最大级别]
      });

      map.value.add(customLayer);

      const drawBoundaryCanvas = () => {
        drawBoundaryWithCanvas(canvas, map.value, AMap, boundaries.value);
      };

      // 将Loca初始化移到地图complete事件中
      map.value.on('complete', () => {
        // 创建全局单例InfoWindow
        globalInfoWindow.value.instance = new AMap.InfoWindow({
          isCustom: true,
          offset: new AMap.Pixel(260, 100),
          closeWhenClickMap: true,
        });
        globalInfoWindow.value.currentMarker = null;

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
          }
        });

        loading.value = false;
      });
    });
  };

  // 高亮LabelMarker
  const highlightLabelMarker = (labelMarker: any, isHighlight: boolean) => {
    const company = labelMarker.getExtData();
    const riskType =
      dangerousTrade.value?.[0] || company.riskEnvTypes?.split(',')?.[0] || 0;
    const riskLvl = company.dynamicRiskLevel || 0;
    const iconUrl =
      companyIcon.image[riskType]?.[riskLvl] || companyIcon.image[0][0];
    if (isHighlight) {
      // 放大效果
      labelMarker.setIcon({
        type: 'image',
        image: iconUrl,
        size: [companyIcon.size[0] * 1.2, companyIcon.size[1] * 1.2],
        anchor: 'bottom-center',
      });
    } else {
      // 恢复正常大小
      labelMarker.setIcon({
        type: 'image',
        image: iconUrl,
        size: companyIcon.size,
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
      <span>暂无数据</span>
    </div>
    <div class="info-item">
      <span class="item-label">是否涉及高危环境：</span>
      <span>暂无数据</span>
    </div>
    <div class="info-footer" style="display: none;">
      <button class="company-detail-btn">查看企业详情</button>
    </div>
  `;

    return div;
  };
  // 使用LabelMarker创建企业标记
  const addCompanyLabelMarkers = (newCompanies: any) => {
    if (!map.value || !aMap.value || !labelMarkerLayer.value) {
      console.log('地图或LabelMarker图层未准备好，无法添加标记');
      return;
    }

    const AMap = aMap.value;
    let newMarkersCount = 0;

    console.log(`开始添加新标记，新增 ${newCompanies.length} 个公司`);

    const markers: any = [];
    newCompanies.forEach((company, index) => {
      if (!company.longitude || !company.latitude) {
        console.log(
          `公司 ${company.enterpriseName || '未知'} 缺少坐标信息，跳过`
        );
        return;
      }

      const riskType =
        dangerousTrade.value?.[0] ||
        company.isHasLimitedSpaceTask ||
        company.isHasDust ||
        company.isHasAmmonia ||
        0;
      const riskLvl = company.dynamicRiskLevel || 0;
      const iconUrl =
        companyIcon?.image?.[riskType]?.[riskLvl] || companyIcon.image[0][0];

      // 创建LabelMarker
      const labelMarker = new AMap.LabelMarker({
        position: new AMap.LngLat(
          parseFloat(company.longitude),
          parseFloat(company.latitude)
        ),
        icon: {
          type: 'image',
          image: iconUrl,
          size: companyIcon.size,
          anchor: 'bottom-center',
        },
        zIndex: 200,
        extData: company,
        opacity: 1,
      });

      // 添加鼠标事件
      labelMarker.on('mouseover', (e: any) => {
        const marker = e.target;
        const companyData = marker.getExtData();

        // 切换节点时清空上一个节点的计时器
        if (
          globalInfoWindow.value.currentMarker &&
          globalInfoWindow.value.currentMarker !== marker
        ) {
          clearTimeout(globalInfoWindow.value.currentMarker.closeTimer);
          globalInfoWindow.value.currentMarker.closeTimer = null;
        }

        globalInfoWindow.value.currentMarker = marker;

        // 高亮标记
        highlightLabelMarker(marker, true);

        // 设置全局InfoWindow内容并打开
        globalInfoWindow.value.instance.setContent(
          createInfoWindowContent(companyData)
        );
        globalInfoWindow.value.instance.open(map.value, marker.getPosition());

        // 绑定InfoWindow内容的鼠标事件
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

        // 绑定详情按钮事件
        nextTick(() => {
          const detailBtn = document.querySelector('.company-detail-btn');
          if (detailBtn) {
            detailBtn.addEventListener('click', () => {
              // pushToEnterpriseDetail(companyData);
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

      // 添加到LabelMarker图层
      markers.push(labelMarker);
      newMarkersCount += 1;
    });

    labelMarkerLayer.value.add(markers);
    console.log(`成功添加 ${newMarkersCount} 个新标记到LabelMarker图层`);
    console.log(
      `当前标记数量: ${labelMarkerLayer.value.getAllOverlays()?.length}`
    );
  };

  // 清理标记
  const clearLabelMarkers = () => {
    if (labelMarkerLayer.value) {
      labelMarkerLayer.value?.clear();
    }

    // 关闭全局InfoWindow
    if (
      globalInfoWindow.value.instance &&
      globalInfoWindow.value.instance?.getIsOpen()
    ) {
      globalInfoWindow.value.instance.close();
    }
  };

  const getCompanyListIfo = async () => {
    try {
      loading.value = true;
      // 清空现有数据
      companyList.value = [];
      clearLabelMarkers();
      // 使用增量加载
      // 添加自动分页加载所有数据的辅助函数，支持增量显示
      const loadAllDataIncremental = async (params: any) => {
        const newParams = {
          pageNo: 1,
          ...params,
          pageSize,
        };
        console.log('开始增量加载数据，参数:', params);
        // 请求数据
        const getData = () => {
          return mockData;
        };
        const res = getData();
        companyList.value = [...companyList.value, ...res.records];
        addCompanyLabelMarkers(res.records);
        nextTick(() => {
          if (res.total > companyList.value.length) {
            loadAllDataIncremental({
              ...newParams,
              pageNo: 1 + newParams.pageNo,
            });
          }
        });

        console.log('数据加载完成，总计:', companyList.value.length);
      };

      loadAllDataIncremental({
        riskEnvTypes: dangerousTrade.value?.join(','),
      });
    } catch (error) {
      console.error('获取企业列表失败:', error);
    } finally {
      loading.value = false; // 确保loading状态正确
    }
  };

  onMounted(async () => {
    await initMap();
    setTimeout(() => {
      getCompanyListIfo();
    }, 3000);
  });

  onUnmounted(() => {
    clearLabelMarkers();
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
    background: linear-gradient(
        180deg,
        rgb(0 0 0 / 60%) 0%,
        rgb(0 0 0 / 0%) 100%
      ),
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
      background: radial-gradient(
          77% 77% at 50% 100%,
          rgb(72 146 243 / 31%) 0%,
          rgb(72 146 243 / 0%) 100%
        ),
        linear-gradient(
          270deg,
          rgb(62 86 124 / 33%) 0%,
          rgb(62 86 124 / 19%) 94%
        );
      border-style: solid;
      border-width: 0 0 2px;
      border-image: linear-gradient(
          270deg,
          rgb(48 106 141 / 0%) 0%,
          rgb(141 147 255 / 57.8%) 27%,
          #33b2ff 52%,
          rgb(108 147 255 / 55.8%) 75%,
          rgb(48 106 141 / 0%) 100%
        )
        0 0 2 0;
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
