const PROVIDER_LOGO_MAP: Record<string, string> = {
  newapi: '/smallai.png',
  openai: '/smallai.png',
  smai: '/logo.png',
};

export const getProviderLogoUrl = (id?: string, name?: string): string => {
  const idLower = (id || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  // 精确匹配 id
  if (PROVIDER_LOGO_MAP[idLower]) {
    return PROVIDER_LOGO_MAP[idLower];
  }

  // 精确匹配 name
  if (PROVIDER_LOGO_MAP[nameLower]) {
    return PROVIDER_LOGO_MAP[nameLower];
  }

  // 模糊匹配 (id 或 name 包含 key)
  for (const [key, logo] of Object.entries(PROVIDER_LOGO_MAP)) {
    if (idLower.includes(key) || nameLower.includes(key)) {
      return logo;
    }
  }

  return '/logo.png';
};
