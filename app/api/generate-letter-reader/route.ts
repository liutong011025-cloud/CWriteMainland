import { NextRequest, NextResponse } from 'next/server'
import { requestArkImageGeneration, resolveArkSizeFromAspectRatio } from '@/lib/ark-image'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipient, occasion } = body

    console.log('=== Generating Letter Reader Image ===')
    console.log('Recipient:', recipient)
    console.log('Occasion:', occasion)

    if (!recipient || !occasion) {
      console.error('Missing recipient or occasion')
      return NextResponse.json(
        { error: 'Recipient and occasion are required' },
        { status: 400 }
      )
    }

    const prompt = `${recipient} reading a letter, occasion: ${occasion}, realistic photo, sharp focus`
    const size = resolveArkSizeFromAspectRatio('1:1')

    const result = await requestArkImageGeneration({
      prompt: prompt.trim(),
      size,
    })

    if (!result.ok) {
      if (result.status === 503) {
        return NextResponse.json(
          { error: 'Letter reader image is not configured (ARK_API_KEY).', imageUrl: null },
          { status: 503 }
        )
      }
      if (result.status === 504) {
        return NextResponse.json(
          { error: 'Image generation timeout. Please try again.', imageUrl: null },
          { status: 504 }
        )
      }
      console.error('Ark letter reader error:', result.status, result.error)
      return NextResponse.json(
        { error: `Failed to generate image (${result.status}): ${result.error}`, imageUrl: null },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
      )
    }

    console.log('Letter reader image URL:', result.imageUrl)
    return NextResponse.json({ imageUrl: result.imageUrl })
  } catch (error) {
    console.error('Error generating letter reader image:', error)
    return NextResponse.json({ imageUrl: null })
  }
}
