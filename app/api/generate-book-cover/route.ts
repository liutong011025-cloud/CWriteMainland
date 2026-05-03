import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'
import { requestArkImageGeneration, resolveArkSizeForPreset } from '@/lib/ark-image'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const bookTitle = body.bookTitle
    const userId = body.user_id

    if (!bookTitle || typeof bookTitle !== 'string' || bookTitle.trim() === '') {
      return NextResponse.json(
        { error: 'Book title cannot be empty' },
        { status: 400 }
      )
    }

    const prompt = `Professional book cover for "${bookTitle}". Realistic hardcover book, front view, straight perspective, no tilt or angle. Elegant typography on front cover, realistic textures, bookstore quality, professional book design.`

    const size = resolveArkSizeForPreset('book_cover')
    const result = await requestArkImageGeneration({
      prompt: prompt.trim(),
      size,
    })

    if (!result.ok) {
      if (result.status === 503) {
        return NextResponse.json(
          { error: 'Image generation is not configured (ARK_API_KEY).' },
          { status: 503 }
        )
      }
      if (result.status === 504) {
        return NextResponse.json(
          { error: 'Image generation timeout. Please try again.' },
          { status: 504 }
        )
      }
      console.error('Ark book cover error:', result.status, result.error)
      return NextResponse.json(
        { error: `Failed to generate book cover (${result.status}): ${result.error}` },
        { status: result.status >= 400 && result.status < 600 ? result.status : 502 }
      )
    }

    await logApiCall(
      userId,
      'bookReviewWriting',
      '/api/generate-book-cover (Volcengine Ark)',
      { bookTitle },
      { imageUrl: result.imageUrl }
    )

    return NextResponse.json({
      imageUrl: result.imageUrl,
    })
  } catch (error) {
    console.error('Error generating book cover:', error)
    return NextResponse.json(
      { error: 'Server error. Please try again later.' },
      { status: 500 }
    )
  }
}
