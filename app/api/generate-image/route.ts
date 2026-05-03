import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'
import { requestArkImageGeneration, resolveArkSizeFromAspectRatio } from '@/lib/ark-image'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = body.prompt
    const aspectRatio = body.aspect_ratio || '1:1'
    const userId = body.user_id
    const sourceImageUrl =
      typeof body.image === 'string' && body.image.trim() !== '' ? body.image.trim() : undefined

    let stage = body.stage
    if (!stage && body.type === 'background') stage = 'dramaBackground'
    if (!stage && body.type === 'character') stage = 'dramaCharacter'
    if (!stage) stage = 'character'

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 })
    }

    let finalPrompt = prompt.trim()
    if (stage === 'dramaCharacter') {
      finalPrompt = `${finalPrompt}, cute cartoon style, friendly children's illustration, full-body character sprite only, isolated subject, clean cutout edges, sticker style, suitable for children`
    } else if (stage === 'dramaBackground') {
      finalPrompt = `${finalPrompt}, painterly semi-realistic background art, natural lighting, detailed environment, background only, no people, no characters, empty scene background, clear negative space in the center for character placement`
    }

    const size =
      typeof body.size === 'string' && body.size.trim() ? body.size.trim() : resolveArkSizeFromAspectRatio(aspectRatio)

    const result = await requestArkImageGeneration({
      prompt: finalPrompt,
      image: sourceImageUrl,
      size,
    })

    if (!result.ok) {
      if (result.status === 503) {
        return NextResponse.json(
          {
            error:
              'Image generation is not configured. Set ARK_API_KEY in the server environment (e.g. Vercel → Settings → Environment Variables).',
          },
          { status: 503 }
        )
      }
      if (result.status === 504) {
        return NextResponse.json({ error: 'Image generation timeout. Please try again.' }, { status: 504 })
      }
      console.error('Volcengine Ark image API error:', result.status, result.error)
      return NextResponse.json(
        { error: `Failed to generate image (${result.status}): ${result.error}` },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
      )
    }

    await logApiCall(
      userId,
      stage,
      '/api/generate-image (Volcengine Ark)',
      { prompt, aspect_ratio: aspectRatio, size, image_to_image: !!sourceImageUrl },
      { imageUrl: result.imageUrl }
    )

    return NextResponse.json({
      imageUrl: result.imageUrl,
      description: result.description || '',
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 })
  }
}
