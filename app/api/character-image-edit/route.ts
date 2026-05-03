import { NextRequest, NextResponse } from "next/server"
import { requestArkImageGeneration, resolveArkSizeForPreset } from "@/lib/ark-image"

type CharacterImageEditRequestBody = {
  drawingDataUrl: string
  species?: string | null
  name?: string | null
  age?: string | null
  traits?: string[]
  background?: string | null
  emotional?: string | null
  symbolic?: string | null
  userId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ARK_API_KEY?.trim()) {
      console.error("[character-image-edit] ARK_API_KEY not configured")
      return NextResponse.json(
        { error: "character_unavailable", message: "Character painter is resting. Try again later." },
        { status: 200 }
      )
    }

    const body = (await request.json()) as CharacterImageEditRequestBody
    const {
      drawingDataUrl,
      species,
      name,
      age,
      traits = [],
      background,
      emotional,
      symbolic,
      userId,
    } = body

    if (!drawingDataUrl || typeof drawingDataUrl !== "string" || !drawingDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "bad_request", message: "Missing valid drawing image." },
        { status: 400 }
      )
    }

    const safeSpecies = (species || "unknown creature").trim()
    const safeName = (name || "Unnamed").trim()
    const safeAge = (age || "").trim()
    const safeTraits = Array.isArray(traits) && traits.length > 0 ? traits.join(", ") : "friendly"
    const safeBackground = (background || "").trim()
    const safeEmotional = (emotional || "").trim()
    const safeSymbolic = (symbolic || "").trim()

    const prompt = `
You are editing a student's hand-drawn character sketch into a polished character image.

Keep from the sketch:
- Overall silhouette and pose
- Main recognizable shape and costume idea

Character context:
- Species: ${safeSpecies}
- Name: ${safeName}
- Age: ${safeAge || "not specified"}
- Traits: ${safeTraits}
- Background detail: ${safeBackground || "not specified"}
- Emotional tone: ${safeEmotional || "not specified"}
- Symbolic objects: ${safeSymbolic || "not specified"}

Style target:
- Cute and premium children's story illustration
- Soft but rich lighting, clean details, elegant rendering
- Keep one main character as visual focus
- Use a clean pure white background only (solid #FFFFFF)

Output rules:
- Use the uploaded sketch image as the base reference (image-to-image)
- Do not add text, logos, watermark, or UI
- No transparent background, no scene/background elements, white backdrop only
- Return one final character image only
`.trim()

    const size = resolveArkSizeForPreset("character_edit")
    /** 方舟图生图：官方示例为公网 URL；此处传 data URL，若接口报错可缩小画布或改用 URL 托管方案 */
    const ark = await requestArkImageGeneration({
      prompt,
      image: drawingDataUrl,
      size,
    })

    if (!ark.ok) {
      console.error("[character-image-edit] Ark error:", ark.status, ark.error)
      return NextResponse.json(
        {
          error: "character_unavailable",
          message:
            ark.status === 504
              ? "Image generation timed out. Please try again with a simpler sketch."
              : "Could not generate character image. If the sketch is very large, try a smaller drawing.",
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      imageUrl: ark.imageUrl,
      description: ark.description || "",
      species: safeSpecies,
      userId: userId || "default-user",
    })
  } catch (error) {
    console.error("[character-image-edit] Error:", {
      message: (error as Error)?.message || "unknown",
    })
    return NextResponse.json(
      {
        error: "character_unavailable",
        message: "Something went wrong generating the character image.",
      },
      { status: 200 }
    )
  }
}
