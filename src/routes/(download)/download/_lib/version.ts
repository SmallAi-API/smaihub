export interface DownloadItem {
  arch?: 'arm64' | 'x64';
  platform: 'mac' | 'windows';
  url: string;
}

export interface VersionInfo {
  downloads: DownloadItem[];
  /** @deprecated Windows installer URL, kept for backward compatibility. Use `downloads`. */
  downloadUrl: string;
  releaseDate: string;
  version: string;
}

export async function getLatestVersion(): Promise<VersionInfo> {
  const response = await fetch('/api/download/version', {
    cache: 'no-store',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `Failed to fetch version info: ${response.status}`);
  }

  return response.json();
}
