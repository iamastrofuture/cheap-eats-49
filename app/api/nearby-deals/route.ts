// /app/api/nearby-deals/route.ts

import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "40.7128"
  const lng = searchParams.get("lng") || "-74.0060"
  const radius = searchParams.get("radius") || "16000"

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.results && Array.isArray(data.results)) {
      const results = data.results.slice(0, 15).map((place: any, index: number) => {
        const restaurant = {
          id: place.place_id || `restaurant_${index}`,
          name: place.name,
          address: place.vicinity || "Address not available",
          rating: place.rating || 3.5 + Math.random() * 1.5,
          coordinates: place.geometry.location,
          phone: null,
          website: null,
          categories: place.types || [],
          image: getPhotoUrl(place.photos?.[0]?.photo_reference),
        }

        return generateDealForRestaurant(restaurant, index)
      }).filter(deal => deal !== null)

      return NextResponse.json({
        success: true,
        deals: results,
        isRealData: true,
      })
    }
  } catch (error) {
    console.error("Google Places API error:", error)
  }

  return NextResponse.json({
    success: true,
    deals: [],
    isRealData: false,
  })
}

function getPhotoUrl(photoReference?: string) {
  if (!photoReference) return "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80"
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
}
