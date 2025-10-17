import { getDeptPage } from '@/api/system/dept';

// 部门数据接口
interface DeptItem {
  deptId: number;
  deptName: string;
  parentId: number;
  ancestors: string;
  status: string;
  [key: string]: any;
}

// 部门列表缓存
let deptListCache: DeptItem[] = [];
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * 加载部门列表
 */
async function loadDeptList(): Promise<void> {
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      const res = await getDeptPage({});
      if (res.data && Array.isArray(res.data)) {
        deptListCache = res.data;
      }
    } catch (error) {
      console.error('获取部门列表失败:', error);
      deptListCache = [];
    } finally {
      isLoading = false;
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * 根据部门ID获取部门名称
 * @param deptId 部门ID（支持字符串或数字）
 * @returns 部门名称，找不到返回原ID或'-'
 */
export async function getDeptNameById(
  deptId?: string | number
): Promise<string> {
  if (!deptId) return '-';

  // 如果缓存为空，先加载部门列表
  if (deptListCache.length === 0) {
    await loadDeptList();
  }

  const dept = deptListCache.find((d) => d.deptId === Number(deptId));
  return dept?.deptName || String(deptId);
}

/**
 * 批量获取部门名称
 * @param deptIds 部门ID数组
 * @returns 部门ID和名称的映射对象
 */
export async function getDeptNamesByIds(
  deptIds: (string | number)[]
): Promise<Record<string | number, string>> {
  if (!deptIds || deptIds.length === 0) return {};

  // 如果缓存为空，先加载部门列表
  if (deptListCache.length === 0) {
    await loadDeptList();
  }

  const result: Record<string | number, string> = {};
  deptIds.forEach((id) => {
    const dept = deptListCache.find((d) => d.deptId === Number(id));
    result[id] = dept?.deptName || String(id);
  });

  return result;
}

/**
 * 获取完整的部门列表
 * @returns 部门列表数组
 */
export async function getDeptList(): Promise<DeptItem[]> {
  if (deptListCache.length === 0) {
    await loadDeptList();
  }
  return deptListCache;
}

/**
 * 清除部门列表缓存
 */
export function clearDeptCache(): void {
  deptListCache = [];
}
