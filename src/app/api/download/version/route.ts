import { NextResponse } from 'next/server';

const UPDATE_SERVER_URL = 'https://smaihub-1301925107.cos.accelerate.myqcloud.com/stable';

export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-static';

/**
 * Parse electron-builder's YAML manifest to extract version info
 */
function parseYaml(yamlText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = yamlText.split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(\S.*)$/);
    if (match) {
      result[match[1]] = match[2].trim();
    }
  }

  return result;
}

export async function GET() {
  try {
    const response = await fetch(`${UPDATE_SERVER_URL}/stable.yml`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch version info: ${response.status}` },
        { status: response.status },
      );
    }

    const yamlText = await response.text();
    const parsed = parseYaml(yamlText);

    const version = parsed.version || '';
    const releaseDate = parsed.releaseDate || new Date().toISOString();

    return NextResponse.json({
      downloadUrl: `${UPDATE_SERVER_URL}/${version}/smai.ai-${version}-setup.exe`,
      releaseDate,
      version,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
