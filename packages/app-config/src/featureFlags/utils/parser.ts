import { type IFeatureFlags } from '../schema';
import { FeatureFlagsSchema } from '../schema';

/**
 * 解析环境变量中的特性标志字符串。
 * @param flagString 从环境变量中读取的特性标志字符串。
 * @returns 解析后的特性标志对象。
 */
export function parseFeatureFlag(flagString?: string): Partial<IFeatureFlags> {
  const flags: Partial<IFeatureFlags> = {};

  if (!flagString) return flags;

  // 将中文逗号替换为英文逗号,并按逗号分割字符串
  const flagArray = flagString.trim().replaceAll('，', ',').split(',');

  for (let flag of flagArray) {
    flag = flag.trim();
    if (flag.startsWith('+') || flag.startsWith('-')) {
      const operation = flag[0];
      const key = flag.slice(1);

      const featureKey = key as keyof IFeatureFlags;
      const value = operation === '+';

      // Array-only flags (e.g. dev_dock_workspaces) reject the boolean and stay untouched.
      if (FeatureFlagsSchema.shape[featureKey]?.safeParse(value).success) {
        (flags as Record<string, boolean>)[featureKey] = value;
      }
    }
  }

  return flags;
}
