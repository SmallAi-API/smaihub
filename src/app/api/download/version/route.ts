import { NextResponse } from 'next/server';

const UPDATE_SERVER_URL = 'https://smaihub-1301925107.cos.accelerate.myqcloud.com/stable';

export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-static';

interface Manifest {
  files: { url: string }[];
  releaseDate: string;
  version: string;
}

/**
 * Parse electron-builder's YAML manifest to extract version info and the file list.
 * Handles both single-file manifests (stable.yml) and multi-arch ones (stable-mac.yml).
 */
function parseManifest(yamlText: string): Manifest {
  const manifest: Manifest = { files: [], releaseDate: '', version: '' };

  for (const line of yamlText.split('\n')) {
    const fileUrl = line.match(/^\s+-\s+url:\s*(\S.*)$/);
    if (fileUrl) {
      manifest.files.push({ url: fileUrl[1].trim() });
      continue;
    }

    const top = line.match(/^(\w+):\s*(\S.*)$/);
    if (!top) continue;
    if (top[1] === 'version') manifest.version = top[2].trim();
    else if (top[1] === 'releaseDate')
      manifest.releaseDate = top[2].trim().replaceAll(/^['"]|['"]$/g, '');
  }

  return manifest;
}

/**
 * Fetch and parse a channel manifest. Returns null when the manifest is missing
 * (e.g. no macOS release published yet) so the caller can degrade gracefully.
 */
async function fetchManifest(name: string): Promise<Manifest | null> {
  try {
    const response = await fetch(`${UPDATE_SERVER_URL}/${name}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;

    const text = await response.text();
    // COS returns an XML error body for missing keys; ignore non-YAML responses
    if (text.trimStart().startsWith('<')) return null;

    return parseManifest(text);
  } catch {
    return null;
  }
}

const toUrl = (relativePath: string) => `${UPDATE_SERVER_URL}/${relativePath}`;

export async function GET() {
  const windows = await fetchManifest('stable.yml');

  if (!windows) {
    return NextResponse.json({ error: 'Failed to fetch version info' }, { status: 502 });
  }

  const mac = await fetchManifest('stable-mac.yml');

  const exe = windows.files.find((file) => file.url.endsWith('.exe'));
  const macArm64 = mac?.files.find((file) => file.url.endsWith('-arm64.dmg'));
  const macX64 = mac?.files.find((file) => file.url.endsWith('-x64.dmg'));

  const downloads: { arch?: 'arm64' | 'x64'; platform: 'mac' | 'windows'; url: string }[] = [];
  if (exe) downloads.push({ platform: 'windows', url: toUrl(exe.url) });
  if (macArm64) downloads.push({ arch: 'arm64', platform: 'mac', url: toUrl(macArm64.url) });
  if (macX64) downloads.push({ arch: 'x64', platform: 'mac', url: toUrl(macX64.url) });

  return NextResponse.json({
    // Kept for backward compatibility (Windows installer URL)
    downloadUrl: exe ? toUrl(exe.url) : '',
    downloads,
    releaseDate: windows.releaseDate || new Date().toISOString(),
    version: windows.version,
  });
}
