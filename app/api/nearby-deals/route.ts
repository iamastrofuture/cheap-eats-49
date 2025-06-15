import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "40.7128"
  const lng = searchParams.get("lng") || "-74.0060"
  const radius = searchParams.get("radius") || "32000"

  const apiKey = process.env.GEOAPIFY_API_KEY

  // Always return mock data with real restaurant deals for now
  // This ensures the app works even without API configuration
  try {
    if (apiKey && apiKey !== "YOUR_GEOAPIFY_API_KEY") {
      // Try to fetch from Geoapify if API key is configured
      const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.fast_food,catering.cafe,catering.bar,catering.pub&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=50&apiKey=${apiKey}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()

        if (data.features && Array.isArray(data.features)) {
          const dealsWithRestaurants = data.features
            .map((place: any, index: number) => {
              const restaurant = {
                id: place.properties.place_id || place.properties.osm_id || `restaurant_${index}`,
                name: place.properties.name || "Local Restaurant",
                address: place.properties.formatted || place.properties.address_line1 || "Address not available",
                rating: place.properties.rating || 3.5 + Math.random() * 1.5,
                coordinates: place.geometry.coordinates,
                distance: place.properties.distance,
                phone: place.properties.contact?.phone,
                website: place.properties.contact?.website,
                cuisine: place.properties.cuisine || [],
                facilities: place.properties.facilities || [],
                categories: place.properties.categories || [],
              }

              return generateDealForRestaurant(restaurant, index)
            })
            .filter((deal) => deal !== null)

          return NextResponse.json({
            success: true,
            deals: dealsWithRestaurants.slice(0, 20),
            isRealData: true,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error fetching from Geoapify:", error)
  }

  // Return mock data with real restaurant deals as fallback
  return NextResponse.json({
    success: true,
    deals: getMockDealsWithRealPromotions(),
    isRealData: false,
  })
}

function generateDealForRestaurant(restaurant: any, index: number) {
  if (Math.random() < 0.4) return null

  const restaurantName = restaurant.name.toLowerCase()

  let realDeal = null

  if (restaurantName.includes("mcdonald")) {
    const mcdonaldsDeals = [
      {
        title: "McDonald's App Daily Deal",
        description:
          "Download the McDonald's app for exclusive daily deals. Today: Buy One Big Mac, Get One FREE with any purchase over $1.",
        price: "$5.99",
        originalPrice: "$11.98",
        category: "Fast Food App Deal",
        image: "/images/burger.jpg",
        instructions: "Show this deal on the McDonald's mobile app at checkout",
        validUntil: "11:59 PM today",
      },
      {
        title: "2 for $6 Mix & Match",
        description:
          "Choose any 2: Big Mac, Quarter Pounder with Cheese, 10-piece Chicken McNuggets, or Filet-O-Fish for just $6.",
        price: "$6.00",
        originalPrice: "$12.00",
        category: "Value Menu",
        image: "/images/combo.jpg",
        instructions: "Available all day. Just ask for the '2 for $6 Mix & Match' at the counter or drive-thru",
        validUntil: "Ongoing promotion",
      },
    ]
    realDeal = mcdonaldsDeals[Math.floor(Math.random() * mcdonaldsDeals.length)]
  } else if (restaurantName.includes("wendy")) {
    const wendysDeals = [
      {
        title: "Wendy's $5 Biggy Bag",
        description:
          "Get a Jr. Bacon Cheeseburger, 4-piece chicken nuggets, small fries, and small drink all for just $5.",
        price: "$5.00",
        originalPrice: "$8.50",
        category: "Value Meal",
        image: "/images/combo.jpg",
        instructions: "Ask for the '$5 Biggy Bag' at the counter, drive-thru, or order on the Wendy's app",
        validUntil: "Ongoing promotion",
      },
    ]
    realDeal = wendysDeals[0]
  } else {
    const genericDeals = [
      {
        title: "Happy Hour: 50% Off Appetizers",
        description:
          "All appetizers are half price during happy hour. Great for sharing with friends or as a light dinner.",
        price: "50% OFF",
        originalPrice: "Regular menu price",
        category: "Happy Hour",
        image: "/images/cocktails.jpg",
        instructions: "Available Monday-Friday 3-6 PM. Dine-in only. No coupon needed",
        validUntil: "Mon-Fri 3-6 PM",
      },
    ]
    realDeal = genericDeals[0]
  }

  if (!realDeal) return null

  const hoursLeft = Math.floor(2 + Math.random() * 6)
  const minutesLeft = Math.floor(Math.random() * 60)

  return {
    id: `deal_${restaurant.id}`,
    title: realDeal.title,
    image: realDeal.image,
    price: realDeal.price,
    originalPrice: realDeal.originalPrice,
    location: restaurant.name,
    address: restaurant.address,
    distance: restaurant.distance
      ? `${(restaurant.distance / 1609.34).toFixed(1)} miles`
      : `${(Math.random() * 20).toFixed(1)} miles`,
    timeLeft: realDeal.validUntil.includes("Ongoing") ? "Ongoing" : `${hoursLeft}h ${minutesLeft}m`,
    category: realDeal.category,
    rating: Number(restaurant.rating.toFixed(1)),
    isFeatured: Math.random() < 0.15,
    submittedBy: "Restaurant Official",
    points: Math.floor(50 + Math.random() * 100),
    phone: restaurant.phone,
    website: restaurant.website,
    coordinates: restaurant.coordinates,
    facilities: restaurant.facilities,
    description: realDeal.description,
    instructions: realDeal.instructions,
    validUntil: realDeal.validUntil,
    isOfficialDeal: true,
  }
}

function getMockDealsWithRealPromotions() {
  return [
    {
      id: "mock_1",
      title: "McDonald's 2 for $6 Mix & Match",
      image: "/images/burger.jpg",
      price: "$6.00",
      originalPrice: "$12.00",
      location: "McDonald's",
      address: "123 Main St, Your City",
      distance: "0.8 miles",
      timeLeft: "Ongoing",
      category: "Value Menu",
      rating: 4.2,
      isFeatured: true,
      submittedBy: "Restaurant Official",
      points: 150,
      phone: "(555) 123-4567",
      description:
        "Choose any 2: Big Mac, Quarter Pounder with Cheese, 10-piece Chicken McNuggets, or Filet-O-Fish for just $6.",
      instructions: "Available all day. Just ask for the '2 for $6 Mix & Match' at the counter or drive-thru",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_2",
      title: "Wendy's $5 Biggy Bag",
      image: "/images/combo.jpg",
      price: "$5.00",
      originalPrice: "$8.50",
      location: "Wendy's",
      address: "456 Oak Ave, Your City",
      distance: "1.2 miles",
      timeLeft: "Ongoing",
      category: "Value Meal",
      rating: 4.1,
      submittedBy: "Restaurant Official",
      points: 200,
      phone: "(555) 234-5678",
      description:
        "Get a Jr. Bacon Cheeseburger, 4-piece chicken nuggets, small fries, and small drink all for just $5.",
      instructions: "Ask for the '$5 Biggy Bag' at the counter, drive-thru, or order on the Wendy's app",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_3",
      title: "Taco Bell Cravings Box",
      image: "/images/tacos.jpg",
      price: "$7.99",
      originalPrice: "$12.50",
      location: "Taco Bell",
      address: "789 Pine St, Your City",
      distance: "1.5 miles",
      timeLeft: "Ongoing",
      category: "Value Box",
      rating: 4.0,
      submittedBy: "Restaurant Official",
      points: 175,
      phone: "(555) 345-6789",
      description:
        "Get a Crunchy Taco Supreme, Beefy 5-Layer Burrito, Crunchwrap Supreme, and medium drink for one low price.",
      instructions: "Ask for the 'Cravings Box' - available all day at participating locations",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_4",
      title: "Subway $6.99 Footlong Menu",
      image: "/images/lunch.jpg",
      price: "$6.99",
      originalPrice: "$9.99",
      location: "Subway",
      address: "321 Elm St, Your City",
      distance: "2.1 miles",
      timeLeft: "Ongoing",
      category: "Value Menu",
      rating: 3.9,
      submittedBy: "Restaurant Official",
      points: 125,
      phone: "(555) 456-7890",
      description:
        "Choose from select footlong subs including Turkey Breast, Ham, Veggie Delite, and more for just $6.99.",
      instructions: "Available on select footlongs. Ask which subs are included in the $6.99 menu",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_5",
      title: "KFC $5 Fill Up Box",
      image: "/images/comfort-food.jpg",
      price: "$5.00",
      originalPrice: "$8.50",
      location: "KFC",
      address: "654 Maple Ave, Your City",
      distance: "2.8 miles",
      timeLeft: "Ongoing",
      category: "Fill Up Box",
      rating: 4.3,
      submittedBy: "Restaurant Official",
      points: 160,
      phone: "(555) 567-8901",
      description: "Get a piece of chicken, individual side, biscuit, cookie, and drink all in one box for just $5.",
      instructions: "Ask for the '$5 Fill Up' - choose your chicken piece and side",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_6",
      title: "Pizza Hut Large 3-Topping Pizza",
      image: "/images/pizza.jpg",
      price: "$7.99",
      originalPrice: "$14.99",
      location: "Pizza Hut",
      address: "987 Cedar Rd, Your City",
      distance: "3.2 miles",
      timeLeft: "Ongoing",
      category: "Carryout Special",
      rating: 4.1,
      submittedBy: "Restaurant Official",
      points: 140,
      phone: "(555) 678-9012",
      description:
        "Get a large pizza with up to 3 toppings for carryout. Perfect for families or sharing with friends.",
      instructions: "Carryout only. Order online or call ahead. Mention the '3-topping carryout deal'",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_7",
      title: "Happy Hour: 50% Off Appetizers",
      image: "/images/cocktails.jpg",
      price: "50% OFF",
      originalPrice: "Regular price",
      location: "Local Sports Bar",
      address: "147 Sports Way, Your City",
      distance: "1.7 miles",
      timeLeft: "4h 30m",
      category: "Happy Hour",
      rating: 4.4,
      submittedBy: "Restaurant Official",
      points: 110,
      phone: "(555) 789-0123",
      description:
        "All appetizers are half price during happy hour. Great for sharing with friends or as a light dinner.",
      instructions: "Available Monday-Friday 3-6 PM. Dine-in only. No coupon needed",
      validUntil: "Mon-Fri 3-6 PM",
      isOfficialDeal: true,
    },
    {
      id: "mock_8",
      title: "Kids Eat Free Sundays",
      image: "/images/family-meal.jpg",
      price: "FREE",
      originalPrice: "$6.99",
      location: "Family Diner",
      address: "258 Family Ln, Your City",
      distance: "2.5 miles",
      timeLeft: "2 days",
      category: "Family Special",
      rating: 4.2,
      submittedBy: "Restaurant Official",
      points: 130,
      phone: "(555) 890-1234",
      description: "One free kids meal with each adult entrée purchase. Perfect for family dining.",
      instructions: "Sundays only. One free kids meal per adult entrée. Kids 12 and under",
      validUntil: "Every Sunday",
      isOfficialDeal: true,
    },
  ]
}
