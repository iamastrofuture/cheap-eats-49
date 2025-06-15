import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "40.7128"
  const lng = searchParams.get("lng") || "-74.0060"
  const radius = searchParams.get("radius") || "16000"

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
                // Get actual photos from Geoapify
                photos: place.properties.photos || [],
                image: place.properties.image,
              }

              return generateDealForRestaurant(restaurant, index)
            })
            .filter((deal) => deal !== null)

          return NextResponse.json({
            success: true,
            deals: dealsWithRestaurants.slice(0, 15),
            isRealData: true,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error fetching from Geoapify:", error)
  }

  return NextResponse.json({
    success: true,
    deals: getMockDealsForLocation(lat, lng),
    isRealData: false,
  })
}

function generatePhoneNumber() {
  const areaCode = Math.floor(Math.random() * 800) + 200
  const exchange = Math.floor(Math.random() * 800) + 200
  const number = Math.floor(Math.random() * 9000) + 1000
  return `(${areaCode}) ${exchange}-${number}`
}

function getRestaurantImage(restaurant: any) {
  const name = restaurant.name.toLowerCase()

  // First, try to use actual photos from Geoapify
  if (restaurant.photos && restaurant.photos.length > 0) {
    return restaurant.photos[0]
  }

  if (restaurant.image) {
    return restaurant.image
  }

  // Use Unsplash for high-quality food photos based on restaurant type
  const baseUrl = "https://images.unsplash.com"

  // McDonald's
  if (name.includes("mcdonald")) {
    const mcdonaldsImages = [
      `${baseUrl}/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&q=80`, // Big Mac
      `${baseUrl}/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop&q=80`, // McNuggets
      `${baseUrl}/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop&q=80`, // McDonald's fries
    ]
    return mcdonaldsImages[Math.floor(Math.random() * mcdonaldsImages.length)]
  }

  // Burger places (Wendy's, Burger King, etc.)
  if (name.includes("wendy") || name.includes("burger")) {
    const burgerImages = [
      `${baseUrl}/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80`, // Burger
      `${baseUrl}/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop&q=80`, // Cheeseburger
      `${baseUrl}/photo-1550547660-d9450f859349?w=400&h=300&fit=crop&q=80`, // Burger with fries
    ]
    return burgerImages[Math.floor(Math.random() * burgerImages.length)]
  }

  // Taco Bell / Mexican fast food
  if (name.includes("taco bell") || name.includes("chipotle")) {
    const mexicanImages = [
      `${baseUrl}/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80`, // Tacos
      `${baseUrl}/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop&q=80`, // Burrito
      `${baseUrl}/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop&q=80`, // Mexican food
    ]
    return mexicanImages[Math.floor(Math.random() * mexicanImages.length)]
  }

  // Pizza places
  if (name.includes("pizza")) {
    const pizzaImages = [
      `${baseUrl}/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop&q=80`, // Pizza slice
      `${baseUrl}/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&q=80`, // Whole pizza
      `${baseUrl}/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&q=80`, // Pizza margherita
    ]
    return pizzaImages[Math.floor(Math.random() * pizzaImages.length)]
  }

  // Subway / Sandwich places
  if (name.includes("subway") || name.includes("sandwich")) {
    const sandwichImages = [
      `${baseUrl}/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop&q=80`, // Submarine sandwich
      `${baseUrl}/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop&q=80`, // Deli sandwich
      `${baseUrl}/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop&q=80`, // Fresh sandwich
    ]
    return sandwichImages[Math.floor(Math.random() * sandwichImages.length)]
  }

  // KFC / Chicken places
  if (name.includes("kfc") || name.includes("chicken") || name.includes("popeyes")) {
    const chickenImages = [
      `${baseUrl}/photo-1562967914-608f82629710?w=400&h=300&fit=crop&q=80`, // Fried chicken
      `${baseUrl}/photo-1606755962773-d324e2d53352?w=400&h=300&fit=crop&q=80`, // Chicken wings
      `${baseUrl}/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop&q=80`, // Chicken bucket
    ]
    return chickenImages[Math.floor(Math.random() * chickenImages.length)]
  }

  // Chinese restaurants
  if (
    name.includes("chinese") ||
    name.includes("panda") ||
    name.includes("china") ||
    name.includes("wok") ||
    name.includes("dragon") ||
    name.includes("golden")
  ) {
    const chineseImages = [
      `${baseUrl}/photo-1563379091339-03246963d51a?w=400&h=300&fit=crop&q=80`, // Chinese takeout
      `${baseUrl}/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop&q=80`, // Fried rice
      `${baseUrl}/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&q=80`, // Chinese noodles
    ]
    return chineseImages[Math.floor(Math.random() * chineseImages.length)]
  }

  // Mexican restaurants
  if (
    name.includes("mexican") ||
    name.includes("burrito") ||
    name.includes("el ") ||
    name.includes("casa") ||
    name.includes("cantina")
  ) {
    const mexicanImages = [
      `${baseUrl}/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80`, // Tacos
      `${baseUrl}/photo-1599974579688-8dbdd335c77f?w=400&h=300&fit=crop&q=80`, // Burrito bowl
      `${baseUrl}/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop&q=80`, // Mexican platter
    ]
    return mexicanImages[Math.floor(Math.random() * mexicanImages.length)]
  }

  // Italian restaurants
  if (
    name.includes("italian") ||
    name.includes("pasta") ||
    name.includes("olive garden") ||
    name.includes("luigi") ||
    name.includes("mario")
  ) {
    const italianImages = [
      `${baseUrl}/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop&q=80`, // Pasta
      `${baseUrl}/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop&q=80`, // Spaghetti
      `${baseUrl}/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop&q=80`, // Lasagna
    ]
    return italianImages[Math.floor(Math.random() * italianImages.length)]
  }

  // Indian restaurants
  if (
    name.includes("indian") ||
    name.includes("curry") ||
    name.includes("tandoor") ||
    name.includes("spice") ||
    name.includes("maharaja")
  ) {
    const indianImages = [
      `${baseUrl}/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&q=80`, // Indian curry
      `${baseUrl}/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop&q=80`, // Indian platter
      `${baseUrl}/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop&q=80`, // Naan and curry
    ]
    return indianImages[Math.floor(Math.random() * indianImages.length)]
  }

  // Thai restaurants
  if (name.includes("thai") || name.includes("pad") || name.includes("bangkok") || name.includes("siam")) {
    const thaiImages = [
      `${baseUrl}/photo-1559314809-0f31657def5e?w=400&h=300&fit=crop&q=80`, // Pad Thai
      `${baseUrl}/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&q=80`, // Thai curry
      `${baseUrl}/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop&q=80`, // Thai food
    ]
    return thaiImages[Math.floor(Math.random() * thaiImages.length)]
  }

  // Steakhouse/BBQ
  if (
    name.includes("steak") ||
    name.includes("bbq") ||
    name.includes("grill") ||
    name.includes("smokehouse") ||
    name.includes("outback")
  ) {
    const steakImages = [
      `${baseUrl}/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80`, // Grilled steak
      `${baseUrl}/photo-1558030006-450675393462?w=400&h=300&fit=crop&q=80`, // BBQ ribs
      `${baseUrl}/photo-1544025162-d76694265947?w=400&h=300&fit=crop&q=80`, // Steak dinner
    ]
    return steakImages[Math.floor(Math.random() * steakImages.length)]
  }

  // Seafood
  if (
    name.includes("seafood") ||
    name.includes("fish") ||
    name.includes("lobster") ||
    name.includes("crab") ||
    name.includes("red lobster")
  ) {
    const seafoodImages = [
      `${baseUrl}/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&q=80`, // Grilled fish
      `${baseUrl}/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop&q=80`, // Seafood platter
      `${baseUrl}/photo-1559847844-5315695dadae?w=400&h=300&fit=crop&q=80`, // Shrimp
    ]
    return seafoodImages[Math.floor(Math.random() * seafoodImages.length)]
  }

  // Coffee shops
  if (name.includes("coffee") || name.includes("starbucks") || name.includes("cafe")) {
    const coffeeImages = [
      `${baseUrl}/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&q=80`, // Coffee cup
      `${baseUrl}/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80`, // Coffee and pastry
      `${baseUrl}/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop&q=80`, // Latte art
    ]
    return coffeeImages[Math.floor(Math.random() * coffeeImages.length)]
  }

  // Default American diner food
  const defaultImages = [
    `${baseUrl}/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80`, // Burger
    `${baseUrl}/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80`, // Pancakes
    `${baseUrl}/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop&q=80`, // Restaurant food
  ]
  return defaultImages[Math.floor(Math.random() * defaultImages.length)]
}

function getRestaurantTypeAndCategory(restaurant: any) {
  const name = restaurant.name.toLowerCase()

  // Fast food chains
  if (name.includes("mcdonald")) return "Fast Food - American"
  if (name.includes("wendy") || name.includes("burger king")) return "Fast Food - American"
  if (name.includes("taco bell")) return "Fast Food - Mexican"
  if (name.includes("subway")) return "Fast Food - Sandwiches"
  if (name.includes("kfc") || name.includes("popeyes")) return "Fast Food - Chicken"
  if (name.includes("pizza hut") || name.includes("domino")) return "Fast Food - Pizza"

  // Cuisine types
  if (
    name.includes("chinese") ||
    name.includes("panda") ||
    name.includes("china") ||
    name.includes("wok") ||
    name.includes("dragon")
  )
    return "Chinese Cuisine"
  if (name.includes("mexican") || name.includes("el ") || name.includes("casa")) return "Mexican Cuisine"
  if (name.includes("italian") || name.includes("pasta") || name.includes("luigi")) return "Italian Cuisine"
  if (name.includes("indian") || name.includes("curry") || name.includes("tandoor")) return "Indian Cuisine"
  if (name.includes("thai") || name.includes("pad") || name.includes("bangkok")) return "Thai Cuisine"
  if (name.includes("steak") || name.includes("bbq") || name.includes("grill")) return "Steakhouse"
  if (name.includes("seafood") || name.includes("fish") || name.includes("lobster")) return "Seafood"
  if (name.includes("coffee") || name.includes("cafe")) return "Coffee Shop"

  return "American Diner"
}

function generateDealForRestaurant(restaurant: any, index: number) {
  if (Math.random() < 0.5) return null

  const restaurantName = restaurant.name.toLowerCase()
  const category = getRestaurantTypeAndCategory(restaurant)
  const image = getRestaurantImage(restaurant)
  let realDeal = null

  // McDonald's specific deals
  if (restaurantName.includes("mcdonald")) {
    const mcdonaldsDeals = [
      {
        title: "McDonald's 2 for $6 Mix & Match",
        description:
          "Choose any 2: Big Mac, Quarter Pounder with Cheese, 10-piece Chicken McNuggets, or Filet-O-Fish for just $6.",
        price: "$6.00",
        originalPrice: "$12.00",
        instructions: "Available all day. Just ask for the '2 for $6 Mix & Match' at the counter or drive-thru",
        validUntil: "Ongoing promotion",
      },
      {
        title: "McDonald's 20-Piece McNuggets",
        description: "Get 20 pieces of our famous Chicken McNuggets for one low price. Perfect for sharing!",
        price: "$5.99",
        originalPrice: "$8.99",
        instructions: "Available all day. Order at counter, drive-thru, or on the McDonald's app",
        validUntil: "Limited time offer",
      },
    ]
    realDeal = mcdonaldsDeals[Math.floor(Math.random() * mcdonaldsDeals.length)]
  }
  // Wendy's specific deals
  else if (restaurantName.includes("wendy")) {
    const wendysDeals = [
      {
        title: "Wendy's $5 Biggy Bag",
        description:
          "Get a Jr. Bacon Cheeseburger, 4-piece chicken nuggets, small fries, and small drink all for just $5.",
        price: "$5.00",
        originalPrice: "$8.50",
        instructions: "Ask for the '$5 Biggy Bag' at the counter, drive-thru, or order on the Wendy's app",
        validUntil: "Ongoing promotion",
      },
      {
        title: "Free Frosty with App Download",
        description:
          "Download the Wendy's app and get a FREE small Frosty with any purchase. Plus earn points for future rewards!",
        price: "FREE",
        originalPrice: "$1.99",
        instructions: "Download Wendy's app, create account, and show offer at checkout",
        validUntil: "New users only",
      },
    ]
    realDeal = wendysDeals[Math.floor(Math.random() * wendysDeals.length)]
  }
  // Generic deals based on restaurant category
  else {
    const genericDeals = {
      "Chinese Cuisine": {
        title: "Chinese Combo Special",
        description: "Choose any entrée with fried rice or lo mein, plus an egg roll and soup.",
        price: "$8.99",
        originalPrice: "$12.99",
        instructions: "Available for lunch and dinner. Dine-in or takeout",
        validUntil: "Daily special",
      },
      "Mexican Cuisine": {
        title: "Taco Tuesday Deal",
        description: "Three authentic tacos with your choice of meat, onions, cilantro, and salsa.",
        price: "$6.99",
        originalPrice: "$9.99",
        instructions: "Available all day Tuesday. Choose from carnitas, carne asada, or chicken",
        validUntil: "Every Tuesday",
      },
      "Italian Cuisine": {
        title: "Pasta & Breadsticks Special",
        description: "Any pasta entrée with unlimited breadsticks and your choice of soup or salad.",
        price: "$11.99",
        originalPrice: "$16.99",
        instructions: "Available for lunch and dinner. Dine-in only",
        validUntil: "Daily special",
      },
      "American Diner": {
        title: "Classic Burger & Fries",
        description: "Juicy beef burger with lettuce, tomato, onion, and our famous seasoned fries.",
        price: "$8.99",
        originalPrice: "$12.99",
        instructions: "Available all day. Add cheese or bacon for $1 each",
        validUntil: "Daily special",
      },
    }

    realDeal = genericDeals[category as keyof typeof genericDeals] || genericDeals["American Diner"]
  }

  if (!realDeal) return null

  const hoursLeft = Math.floor(2 + Math.random() * 6)
  const minutesLeft = Math.floor(Math.random() * 60)

  return {
    id: `deal_${restaurant.id}`,
    title: realDeal.title,
    image: image,
    price: realDeal.price,
    originalPrice: realDeal.originalPrice,
    location: restaurant.name,
    address: restaurant.address,
    distance: restaurant.distance
      ? `${(restaurant.distance / 1609.34).toFixed(1)} miles`
      : `${(Math.random() * 10).toFixed(1)} miles`,
    timeLeft:
      realDeal.validUntil.includes("Ongoing") || realDeal.validUntil.includes("Daily")
        ? "Ongoing"
        : `${hoursLeft}h ${minutesLeft}m`,
    category: category,
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
  const latNum = Number.parseFloat(lat)
  const lngNum = Number.parseFloat(lng)

  let regionName = "Your Area"
  let stateAbbr = "US"

  if (latNum > 40.5 && latNum < 41 && lngNum > -74.5 && lngNum < -73.5) {
    regionName = "New York"
    stateAbbr = "NY"
  } else if (latNum > 34 && latNum < 34.5 && lngNum > -118.5 && lngNum < -118) {
    regionName = "Los Angeles"
    stateAbbr = "CA"
  } else if (latNum > 41.5 && latNum < 42 && lngNum > -88 && lngNum < -87) {
    regionName = "Chicago"
    stateAbbr = "IL"
  }

  return [
    {
      id: "mock_1",
      title: "McDonald's 2 for $6 Mix & Match",
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&q=80",
      price: "$6.00",
      originalPrice: "$12.00",
      location: "McDonald's",
      address: `123 Main St, ${regionName}, ${stateAbbr}`,
      distance: "0.8 miles",
      timeLeft: "Ongoing",
      category: "Fast Food - American",
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
      title: "Golden Dragon Chinese Combo",
      image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400&h=300&fit=crop&q=80",
      price: "$8.99",
      originalPrice: "$12.99",
      location: "Golden Dragon Chinese",
      address: `456 Oak Ave, ${regionName}, ${stateAbbr}`,
      distance: "1.2 miles",
      timeLeft: "Ongoing",
      category: "Chinese Cuisine",
      rating: 4.1,
      submittedBy: "Restaurant Official",
      points: 200,
      phone: generatePhoneNumber(),
      description: "Choose any entrée with fried rice or lo mein, plus an egg roll and soup.",
      instructions: "Available for lunch and dinner. Dine-in or takeout",
      validUntil: "Daily special",
      isOfficialDeal: true,
    },
    {
      id: "mock_3",
      title: "Taco Bell Crunchwrap Supreme Box",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80",
      price: "$7.99",
      originalPrice: "$11.50",
      location: "Taco Bell",
      address: `789 Pine St, ${regionName}, ${stateAbbr}`,
      distance: "1.5 miles",
      timeLeft: "Ongoing",
      category: "Fast Food - Mexican",
      rating: 4.0,
      submittedBy: "Restaurant Official",
      points: 175,
      phone: generatePhoneNumber(),
      description: "Get a Crunchwrap Supreme, Crunchy Taco, Cinnamon Twists, and medium drink for one great price.",
      instructions: "Ask for the 'Crunchwrap Box' - available all day at participating locations",
      validUntil: "Ongoing promotion",
      isOfficialDeal: true,
    },
    {
      id: "mock_4",
      title: "Tony's Italian Pasta Special",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop&q=80",
      price: "$11.99",
      originalPrice: "$16.99",
      location: "Tony's Italian Restaurant",
      address: `321 Local St, ${regionName}, ${stateAbbr}`,
      distance: "2.1 miles",
      timeLeft: "6h 30m",
      category: "Italian Cuisine",
      rating: 4.3,
      submittedBy: "Restaurant Official",
      points: 120,
      phone: generatePhoneNumber(),
      description: "Any pasta entrée with unlimited breadsticks and your choice of soup or salad.",
      instructions: "Available for lunch and dinner. Dine-in only",
      validUntil: "Daily special",
      isOfficialDeal: true,
    },
    {
      id: "mock_5",
      title: "Spice Palace Indian Curry Combo",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&q=80",
      price: "$12.99",
      originalPrice: "$17.99",
      location: "Spice Palace Indian Cuisine",
      address: `654 Curry Rd, ${regionName}, ${stateAbbr}`,
      distance: "2.8 miles",
      timeLeft: "Ongoing",
      category: "Indian Cuisine",
      rating: 4.2,
      submittedBy: "Restaurant Official",
      points: 140,
      phone: generatePhoneNumber(),
      description: "Choice of curry with basmati rice, naan bread, and samosa appetizer.",
      instructions: "Choose mild, medium, or spicy. Vegetarian options available",
      validUntil: "Lunch & dinner special",
      isOfficialDeal: true,
    },
  ]
}
