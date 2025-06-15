import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY

  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const address = data.features[0].properties
      return NextResponse.json({
        success: true,
        address: {
          formatted: address.formatted,
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          postcode: address.postcode,
        },
      })
    } else {
      return NextResponse.json({ error: "No address found for these coordinates" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error with reverse geocoding:", error)
    return NextResponse.json({ error: "Failed to get address" }, { status: 500 })
  }
}
