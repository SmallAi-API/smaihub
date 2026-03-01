export interface VersionInfo {
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
