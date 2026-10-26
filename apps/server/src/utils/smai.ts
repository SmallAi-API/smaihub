/** Keep gateway path prefixes, removing only the model API's trailing version. */
export const normalizeSmaiBaseURL = (baseURL?: string): string => {
  const url = new URL(baseURL?.trim() || 'https://api.smai.ai');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Unsupported provider URL');
  }
  url.search = '';
  url.hash = '';
  url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/v\d+[a-z]*$/i, '');
  return url.toString().replace(/\/$/, '');
};
