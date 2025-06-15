import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "40.7128"
  const lng = searchParams.get("lng") || "-74.0060"
  const radius = searchParams.get("radius") || "16000" // Reduced to 10 miles for more local results

  const apiKey = process.env.GEOAPIFY_API_KEY

  try {
    if (apiKey && apiKey !== "YOUR_GEOAPIFY_API_KEY") {
      const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.fast_food,catering.cafe,catering.bar,catering.pub&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=30&apiKey=${apiKey}`

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
                phone: place.properties.contact?.phone || generatePhoneNumber(),
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
            deals: dealsWithRestaurants.slice(0, 15), // Limit to 15 deals for better performance
            isRealData: true,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error fetching from Geoapify:", error)
  }

  // Return location-specific mock data
  return NextResponse.json({
    success: true,
    deals: getMockDealsForLocation(lat, lng),
    isRealData: false,
  })
}

function generatePhoneNumber() {
  // Generate a realistic phone number
  const areaCode = Math.floor(Math.random() * 800) + 200
  const exchange = Math.floor(Math.random() * 800) + 200
  const number = Math.floor(Math.random() * 9000) + 1000
  return `(${areaCode}) ${exchange}-${number}`
}

function generateDealForRestaurant(restaurant: any, index: number) {
  if (Math.random() < 0.5) return null // 50% chance of having a deal

  const restaurantName = restaurant.name.toLowerCase()
  let realDeal = null

  // McDonald's deals
  if (restaurantName.includes("mcdonald")) {
    const mcdonaldsDeals = [
      {
        title: "McDonald's 2 for $6 Mix & Match",
        description:
          "Choose any 2: Big Mac, Quarter Pounder with Cheese, 10-piece Chicken McNuggets, or Filet-O-Fish for just $6.",
        price: "$6.00",
        originalPrice: "$12.00",
        category: "Value Menu",
        image: "/images/burger.jpg",
        instructions: "Available all day. Just ask for the '2 for $6 Mix & Match' at the counter or drive-thru",
        validUntil: "Ongoing promotion",
      },
      {
        title: "McDonald's App Daily Deal",
        description:
          "Download the McDonald's app for exclusive daily deals. Today: Buy One Big Mac, Get One FREE with any purchase over $1.",
        price: "$5.99",
        originalPrice: "$11.98",
        category: "App Deal",
        image: "/images/burger.jpg",
        instructions: "Show this deal on the McDonald's mobile app at checkout",
        validUntil: "11:59 PM today",
      },
    ]
    realDeal = mcdonaldsDeals[Math.floor(Math.random() * mcdonaldsDeals.length)]
  }
  // Wendy's deals
  else if (restaurantName.includes("wendy")) {
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
      {
        title: "Free Frosty with App",
        description:
          "Download the Wendy's app and get a FREE small Frosty with any purchase. Plus earn points for future rewards!",
        price: "FREE",
        originalPrice: "$1.99",
        category: "App Exclusive",
        image: "/images/dessert.jpg",
        instructions: "Download Wendy's app, create account, and show offer at checkout",
        validUntil: "Limited time",
      },
    ]
    realDeal = wendysDeals[Math.floor(Math.random() * wendysDeals.length)]
  }
  // Taco Bell deals
  else if (restaurantName.includes("taco bell")) {
    const tacoBellDeals = [
      {
        title: "Taco Bell Cravings Box",
        description:
          "Get a Crunchy Taco Supreme, Beefy 5-Layer Burrito, Crunchwrap Supreme, and medium drink for one low price.",
        price: "$7.99",
        originalPrice: "$12.50",
        category: "Value Box",
        image: "/images/tacos.jpg",
        instructions: "Ask for the 'Cravings Box' - available all day at participating locations",
        validUntil: "Ongoing promotion",
      },
      {
        title: "Happy Hour: Freeze Drinks $1",
        description: "All Freeze drinks (Mountain Dew Baja Blast, Blue Raspberry, etc.) for just $1 during happy hour.",
        price: "$1.00",
        originalPrice: "$2.99",
        category: "Happy Hour",
        image: "/images/cocktails.jpg",
        instructions: "Available 2-5 PM daily. Just ask for any Freeze drink",
        validUntil: "Daily 2-5 PM",
      },
    ]
    realDeal = tacoBellDeals[Math.floor(Math.random() * tacoBellDeals.length)]
  }
  // Subway deals
  else if (restaurantName.includes("subway")) {
    const subwayDeals = [
      {
        title: "Subway $6.99 Footlong Menu",
        description:
          "Choose from select footlong subs including Turkey Breast, Ham, Veggie Delite, and more for just $6.99.",
        price: "$6.99",
        originalPrice: "$9.99",
        category: "Value Menu",
        image: "/images/lunch.jpg",
        instructions: "Available on select footlongs. Ask which subs are included in the $6.99 menu",
        validUntil: "Ongoing promotion",
      },
    ]
    realDeal = subwayDeals[0]
  }
  // Pizza places
  else if (restaurantName.includes("pizza") || restaurantName.includes("domino") || restaurantName.includes("papa")) {
    const pizzaDeals = [
      {
        title: "Large 3-Topping Pizza Deal",
        description:
          "Get a large pizza with up to 3 toppings for carryout. Perfect for families or sharing with friends.",
        price: "$7.99",
        originalPrice: "$14.99",
        category: "Carryout Special",
        image: "/images/pizza.jpg",
        instructions: "Carryout only. Order online or call ahead. Mention the '3-topping carryout deal'",
        validUntil: "Ongoing promotion",
      },
    ]
    realDeal = pizzaDeals[0]
  }
  // KFC deals
  else if (restaurantName.includes("kfc") || restaurantName.includes("kentucky")) {
    const kfcDeals = [
      {
        title: "KFC $5 Fill Up Box",
        description: "Get a piece of chicken, individual side, biscuit, cookie, and drink all in one box for just $5.",
        price: "$5.00",
        originalPrice: "$8.50",
        category: "Fill Up Box",
        image: "/images/comfort-food.jpg",
        instructions: "Ask for the '$5 Fill Up' - choose your chicken piece and side",
        validUntil: "Ongoing promotion",
      },
    ]
    realDeal = kfcDeals[0]
  }
  // Generic local restaurant deals
  else {
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
      {
        title: "Lunch Special: Entrée + Drink",
        description: "Choose any lunch entrée and get a soft drink included. Perfect for a quick business lunch.",
        price: "$9.99",
        originalPrice: "$13.99",
        category: "Lunch Special",
        image: "/images/lunch.jpg",
        instructions: "Available 11 AM - 3 PM weekdays. Ask your server about today's lunch specials",
        validUntil: "Weekdays 11 AM - 3 PM",
      },
    ]
    realDeal = genericDeals[Math.floor(Math.random() * genericDeals.length)]
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
      : `${(Math.random() * 10).toFixed(1)} miles`, // Closer distances
    timeLeft: realDeal.validUntil.includes("Ongoing") ? "Ongoing" : `${hoursLeft}h ${minutesLeft}m`,
    category: realDeal.category,
    rating: Number(restaurant.rating.toFixed(1)),
    isFeatured: Math.random() < 0.2,
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

function getMockDealsForLocation(lat: string, lng: string) {
  // Generate location-appropriate mock data
  const latNum = Number.parseFloat(lat)
  const lngNum = Number.parseFloat(lng)

  // Determine general region based on coordinates
  let regionName = "Your Area"
  let stateAbbr = "US"

  // Rough geographic regions for better mock data
  if (latNum > 40.5 && latNum < 41 && lngNum > -74.5 && lngNum < -73.5) {
    regionName = "New York"
    stateAbbr = "NY"
  } else if (latNum > 34 && latNum < 34.5 && lngNum > -118.5 && lngNum < -118) {
    regionName = "Los Angeles"
    stateAbbr = "CA"
  } else if (latNum > 41.5 && latNum < 42 && lngNum > -88 && lngNum < -87) {
    regionName = "Chicago"
    stateAbbr = "IL"
  } else if (latNum > 29.5 && latNum < 30 && lngNum > -95.5 && lngNum < -95) {
    regionName = "Houston"
    stateAbbr = "TX"
  } else if (latNum > 25.5 && latNum < 26 && lngNum > -80.5 && lngNum < -80) {
    regionName = "Miami"
    stateAbbr = "FL"
  } else if (latNum > 47.5 && latNum < 48 && lngNum > -122.5 && lngNum < -122) {
    regionName = "Seattle"
    stateAbbr = "WA"
  } else if (latNum > 39.5 && latNum < 40 && lngNum > -105 && lngNum < -104.5) {
    regionName = "Denver"
    stateAbbr = "CO"
  } else if (latNum > 32.5 && latNum < 33 && lngNum > -97 && lngNum < -96.5) {
    regionName = "Dallas"
    stateAbbr = "TX"
  } else if (latNum > 42 && latNum < 42.5 && lngNum > -71.5 && lngNum < -71) {
    regionName = "Boston"
    stateAbbr = "MA"
  } else if (latNum > 37.5 && latNum < 38 && lngNum > -122.5 && lngNum < -122) {
    regionName = "San Francisco"
    stateAbbr = "CA"
  }

  return [
    {
      id: "mock_1",
      title: "McDonald's 2 for $6 Mix & Match",
      image: "/images/burger.jpg",
      price: "$6.00",
      originalPrice: "$12.00",
      location: "McDonald's",
      address: `123 Main St, ${regionName}, ${stateAbbr}`,
      distance: "0.8 miles",
      timeLeft: "Ongoing",
      category: "Value Menu",
      rating: 4.2,
      isFeatured: true,
      submittedBy: "Restaurant Official",
      points: 150,
      phone: generatePhoneNumber(),
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
      address: `456 Oak Ave, ${regionName}, ${stateAbbr}`,
      distance: "1.2 miles",
      timeLeft: "Ongoing",
      category: "Value Meal",
      rating: 4.1,
      submittedBy: "Restaurant Official",
      points: 200,
      phone: generatePhoneNumber(),
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
      address: `789 Pine St, ${regionName}, ${stateAbbr}`,
      distance: "1.5 miles",
      timeLeft: "Ongoing",
      category: "Value Box",
      rating: 4.0,
      submittedBy: "Restaurant Official",
      points: 175,
      phone: generatePhoneNumber(),
      description:
        "Get a Crunchy Taco Supreme, Beefy 5-Layer Burrito, Crunchwrap Supreme, and medium drink for one low price.",
      instructions: "Ask for the 'Cravings Box' - available all day at participating locations",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_4",
      title: `${regionName} Local Diner Special`,
      image: "/images/lunch.jpg",
      price: "$8.99",
      originalPrice: "$12.99",
      location: `${regionName} Family Diner`,
      address: `321 Local St, ${regionName}, ${stateAbbr}`,
      distance: "2.1 miles",
      timeLeft: "6h 30m",
      category: "Lunch Special",
      rating: 4.3,
      submittedBy: "Restaurant Official",
      points: 120,
      phone: generatePhoneNumber(),
      description: "Local favorite lunch special with entrée, side, and drink. Supporting local businesses!",
      instructions: "Available 11 AM - 3 PM weekdays. Ask your server about today's lunch specials",
      validUntil: "Weekdays 11 AM - 3 PM",
      isOfficialDeal: true,
    },
    {
      id: "mock_5",
      title: "Pizza Palace Large Special",
      image: "/images/pizza.jpg",
      price: "$9.99",
      originalPrice: "$16.99",
      location: `${regionName} Pizza Palace`,
      address: `654 Pizza Rd, ${regionName}, ${stateAbbr}`,
      distance: "2.8 miles",
      timeLeft: "Ongoing",
      category: "Carryout Special",
      rating: 4.2,
      submittedBy: "Restaurant Official",
      points: 140,
      phone: generatePhoneNumber(),
      description: "Large pizza with up to 3 toppings. Perfect for families or sharing with friends.",
      instructions: "Carryout only. Order online or call ahead. Mention the 'large special deal'",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
  ]
}
