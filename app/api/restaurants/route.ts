import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "40.7128"
  const lng = searchParams.get("lng") || "-74.0060"
  const radius = searchParams.get("radius") || "1500"

  // Using Geoapify API key
  const apiKey = process.env.GEOAPIFY_API_KEY || "YOUR_GEOAPIFY_API_KEY"

  try {
    // Geoapify Places API endpoint for restaurants
    const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=20&apiKey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && Array.isArray(data.features)) {
      return NextResponse.json({
        success: true,
        restaurants: data.features.map((place: any) => ({
          id: place.properties.place_id || place.properties.osm_id,
          name: place.properties.name || "Unknown Restaurant",
          address: place.properties.formatted || place.properties.address_line1 || "Address not available",
          rating: place.properties.rating || 0,
          userRatingsTotal: place.properties.rating_count || 0,
          priceLevel: place.properties.price_level,
          isOpen: place.properties.opening_hours?.open_now,
          types: place.properties.categories || [],
          coordinates: place.geometry.coordinates,
          distance: place.properties.distance,
          phone: place.properties.contact?.phone,
          website: place.properties.contact?.website,
          cuisine: place.properties.cuisine,
          facilities: place.properties.facilities || [],
        })),
      })
    } else {
      // Return mock data if API fails or key is invalid
      return NextResponse.json({
        success: true,
        restaurants: getMockRestaurants(),
        isMockData: true,
      })
    }
  } catch (error) {
    console.error("Error fetching restaurants from Geoapify:", error)

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      restaurants: getMockRestaurants(),
      isMockData: true,
    })
  }
}

function getMockRestaurants() {
  return [
    {
      id: "1",
      name: "Joe's Pizza",
      address: "7 Carmine St, New York, NY 10014, United States",
      rating: 4.5,
      userRatingsTotal: 1250,
      priceLevel: 2,
      isOpen: true,
      types: ["catering.restaurant", "catering.fast_food"],
      coordinates: [-74.0034, 40.7303],
      distance: 245,
      phone: "+1 212-366-1182",
      cuisine: ["pizza", "italian"],
      facilities: ["takeaway", "delivery"],
    },
    {
      id: "2",
      name: "Katz's Delicatessen",
      address: "205 E Houston St, New York, NY 10002, United States",
      rating: 4.3,
      userRatingsTotal: 8900,
      priceLevel: 3,
      isOpen: true,
      types: ["catering.restaurant", "catering.deli"],
      coordinates: [-73.9873, 40.7223],
      distance: 890,
      phone: "+1 212-254-2246",
      cuisine: ["deli", "american"],
      facilities: ["takeaway", "dine_in"],
    },
    {
      id: "3",
      name: "Xi'an Famous Foods",
      address: "81 St Marks Pl, New York, NY 10003, United States",
      rating: 4.2,
      userRatingsTotal: 2100,
      priceLevel: 2,
      isOpen: false,
      types: ["catering.restaurant", "catering.fast_food"],
      coordinates: [-73.9857, 40.7282],
      distance: 1200,
      phone: "+1 212-786-2068",
      cuisine: ["chinese", "noodles"],
      facilities: ["takeaway", "delivery"],
    },
    {
      id: "4",
      name: "The Halal Guys",
      address: "307 E 14th St, New York, NY 10003, United States",
      rating: 4.1,
      userRatingsTotal: 3400,
      priceLevel: 1,
      isOpen: true,
      types: ["catering.restaurant", "catering.fast_food"],
      coordinates: [-73.9857, 40.7331],
      distance: 650,
      phone: "+1 347-527-1505",
      cuisine: ["halal", "middle_eastern"],
      facilities: ["takeaway", "delivery", "outdoor_seating"],
    },
    {
      id: "5",
      name: "Lombardi's Pizza",
      address: "32 Spring St, New York, NY 10012, United States",
      rating: 4.4,
      userRatingsTotal: 5600,
      priceLevel: 2,
      isOpen: true,
      types: ["catering.restaurant", "catering.pizza"],
      coordinates: [-73.9958, 40.7214],
      distance: 1100,
      phone: "+1 212-941-7994",
      cuisine: ["pizza", "italian"],
      facilities: ["dine_in", "takeaway"],
    },
  ]
}
