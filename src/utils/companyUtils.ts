import { getCompanyPage } from '@/api/company';

// 企业数据缓存
const companyCache: Map<number | string, string> = new Map();
let cachePromise: Promise<void> | null = null;

/**
 * 加载企业数据到缓存
 */
async function loadCompanyCache(): Promise<void> {
  if (cachePromise) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      const response = await getCompanyPage();

      companyCache.clear();

      if (response && response.data) {
        const records = response.data.records || response.data.list || [];
        records.forEach((item: any) => {
          companyCache.set(item.id, item.enterpriseName);
          companyCache.set(String(item.id), item.enterpriseName);
        });
      } else if (response && (response as any).records) {
        (response as any).records.forEach((item: any) => {
          companyCache.set(item.id, item.enterpriseName);
          companyCache.set(String(item.id), item.enterpriseName);
        });
      } else if (Array.isArray(response)) {
        response.forEach((item: any) => {
          companyCache.set(item.id, item.enterpriseName);
          companyCache.set(String(item.id), item.enterpriseName);
        });
      }
    } catch (error) {
      // 加载失败
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

/**
 * 根据企业ID获取企业名称
 * @param orgId 企业ID
 * @returns 企业名称，如果未找到返回 '-'
 */
export async function getCompanyNameById(
  orgId: number | string | undefined | null
): Promise<string> {
  if (!orgId) return '-';

  if (companyCache.size === 0) {
    await loadCompanyCache();
  }

  return companyCache.get(orgId) || companyCache.get(String(orgId)) || '-';
}

/**
 * 批量根据企业ID获取企业名称
 * @param orgIds 企业ID数组
 * @returns 企业名称Map
 */
export async function getCompanyNamesByIds(
  orgIds: (number | string)[]
): Promise<Map<number | string, string>> {
  if (orgIds.length === 0) return new Map();

  if (companyCache.size === 0) {
    await loadCompanyCache();
  }

  const result = new Map<number | string, string>();
  orgIds.forEach((id) => {
    const name = companyCache.get(id) || companyCache.get(String(id)) || '-';
    result.set(id, name);
  });

  return result;
}

/**
 * 刷新企业数据缓存
 */
export async function refreshCompanyCache(): Promise<void> {
  companyCache.clear();
  cachePromise = null;
  await loadCompanyCache();
}

/**
 * 清空企业数据缓存
 */
export function clearCompanyCache(): void {
  companyCache.clear();
  cachePromise = null;
}
