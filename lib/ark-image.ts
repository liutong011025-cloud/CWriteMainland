/**
 * 火山方舟 · 图片生成 API（文生图 / 图生图）共用客户端
 * 文档：https://www.volcengine.com/docs/82379/1666945
 */

const ARK_ENDPOINT_DEFAULT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
const ARK_MODEL_DEFAULT = 'doubao-seedream-5-0-260128'

export function extractImageUrlFromArkResponse(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null
  const root = result as Record<string, unknown>

  const tryFromDataArray = (data: unknown) => {
    if (!Array.isArray(data) || data.length === 0) return null
    const first = data[0]
    if (!first || typeof first !== 'object') return null
    const row = first as Record<string, unknown>
    if (typeof row.url === 'string' && row.url.trim()) return row.url.trim()
    if (typeof row.b64_json === 'string' && row.b64_json.trim()) {
      return `data:image/png;base64,${row.b64_json}`
    }
    return null
  }

  const fromData = tryFromDataArray(root.data)
  if (fromData) return fromData

  const output = root.output
  if (output && typeof output === 'object') {
    const o = output as Record<string, unknown>
    const u = tryFromDataArray(o.data) ?? (typeof o.url === 'string' ? o.url : null)
    if (u) return u
  }

  if (typeof root.url === 'string' && root.url.trim()) return root.url.trim()
  return null
}

/** 与 /api/generate-image 一致的 aspect_ratio → size 映射 */
export function resolveArkSizeFromAspectRatio(aspectRatio: string): string {
  const ar = (aspectRatio || '1:1').trim()
  if (process.env.ARK_IMAGE_SIZE) return process.env.ARK_IMAGE_SIZE

  if (ar === '1:1' || ar === '1 / 1') {
    return process.env.ARK_IMAGE_SIZE_1_1 || '1024x1024'
  }
  if (ar === '16:9' || ar === '16 / 9') {
    return process.env.ARK_IMAGE_SIZE_16_9 || '1792x1024'
  }
  if (ar === '9:16' || ar === '9 / 16') {
    return process.env.ARK_IMAGE_SIZE_9_16 || '1024x1792'
  }
  if (ar === '2:3' || ar === '2 / 3') {
    return process.env.ARK_IMAGE_SIZE_2_3 || '1024x1536'
  }
  return process.env.ARK_IMAGE_SIZE_DEFAULT || '2K'
}

export type ArkImageSizePreset =
  | 'map_initial'
  | 'map_edit'
  | 'character_edit'
  | 'book_cover'
  | 'from_aspect'

export function resolveArkSizeForPreset(
  preset: ArkImageSizePreset,
  aspectRatioWhenFromAspect?: string
): string {
  if (process.env.ARK_IMAGE_SIZE?.trim()) return process.env.ARK_IMAGE_SIZE.trim()

  switch (preset) {
    case 'map_initial':
      return (
        process.env.ARK_IMAGE_SIZE_MAP_INITIAL?.trim() ||
        process.env.ARK_IMAGE_SIZE_MAP?.trim() ||
        '2K'
      )
    case 'map_edit':
      return (
        process.env.ARK_IMAGE_SIZE_MAP_EDIT?.trim() ||
        process.env.ARK_IMAGE_SIZE_MAP?.trim() ||
        '2K'
      )
    case 'character_edit':
      return process.env.ARK_IMAGE_SIZE_CHARACTER_EDIT?.trim() || '1024x1024'
    case 'book_cover':
      return process.env.ARK_IMAGE_SIZE_2_3?.trim() || '1024x1536'
    case 'from_aspect':
    default:
      return resolveArkSizeFromAspectRatio(aspectRatioWhenFromAspect || '1:1')
  }
}

export type ArkImageGenerationOk = { ok: true; imageUrl: string; description?: string }
export type ArkImageGenerationFail = { ok: false; status: number; error: string }

/**
 * 调用方舟 images/generations（文生图或图生图）。
 * @param image 图生图：公网 HTTPS URL，或 data:image/...;base64,...（视模型支持而定）
 */
export async function requestArkImageGeneration(params: {
  prompt: string
  image?: string
  size: string
}): Promise<ArkImageGenerationOk | ArkImageGenerationFail> {
  const arkKey = process.env.ARK_API_KEY?.trim()
  if (!arkKey) {
    return { ok: false, status: 503, error: 'ARK_API_KEY not configured' }
  }

  const endpoint = process.env.ARK_IMAGE_ENDPOINT?.trim() || ARK_ENDPOINT_DEFAULT
  const model = process.env.ARK_IMAGE_MODEL?.trim() || ARK_MODEL_DEFAULT
  const watermark = process.env.ARK_IMAGE_WATERMARK !== 'false'

  const body: Record<string, unknown> = {
    model,
    prompt: params.prompt,
    sequential_image_generation: 'disabled',
    response_format: 'url',
    size: params.size,
    stream: false,
    watermark,
  }
  const img = params.image?.trim()
  if (img) body.image = img

  const timeoutMs = Number(process.env.ARK_IMAGE_TIMEOUT_MS || 120000)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${arkKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (e: unknown) {
    clearTimeout(timeoutId)
    const name = e instanceof Error ? e.name : ''
    if (name === 'AbortError') {
      return { ok: false, status: 504, error: 'Image generation timeout' }
    }
    return { ok: false, status: 502, error: e instanceof Error ? e.message : 'Network error' }
  } finally {
    clearTimeout(timeoutId)
  }

  const rawText = await response.text()
  let parsed: unknown
  try {
    parsed = rawText ? JSON.parse(rawText) : {}
  } catch {
    return {
      ok: false,
      status: response.status || 502,
      error: `Ark API returned non-JSON (${response.status}): ${rawText.slice(0, 500)}`,
    }
  }

  if (!response.ok) {
    const errMsg =
      typeof parsed === 'object' && parsed !== null && 'error' in parsed
        ? JSON.stringify((parsed as { error?: unknown }).error)
        : rawText.slice(0, 800)
    return { ok: false, status: response.status, error: errMsg }
  }

  const imageUrl = extractImageUrlFromArkResponse(parsed)
  if (!imageUrl) {
    return {
      ok: false,
      status: 500,
      error: `No image URL in Ark response: ${rawText.slice(0, 600)}`,
    }
  }

  const desc =
    typeof parsed === 'object' && parsed !== null && 'description' in parsed
      ? String((parsed as { description?: unknown }).description || '')
      : ''

  return { ok: true, imageUrl, description: desc }
}
