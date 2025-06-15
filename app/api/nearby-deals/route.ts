import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat") || "40.7128"
  const lng = searchParams.get("lng") || "-74.0060"
  const radius = searchParams.get("radius") || "32000" // 20 miles in meters

  const apiKey = process.env.GEOAPIFY_API_KEY

  try {
    // Fetch restaurants from Geoapify
    const url = `https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.fast_food,catering.cafe,catering.bar,catering.pub&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=50&apiKey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && Array.isArray(data.features)) {
      // Generate realistic deals for real restaurants
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

          // Generate realistic deals for each restaurant
          return generateDealForRestaurant(restaurant, index)
        })
        .filter((deal) => deal !== null) // Remove null deals

      return NextResponse.json({
        success: true,
        deals: dealsWithRestaurants.slice(0, 20), // Limit to 20 deals
        isRealData: true,
      })
    } else {
      // Return mock data if API fails
      return NextResponse.json({
        success: true,
        deals: getMockDeals(),
        isRealData: false,
      })
    }
  } catch (error) {
    console.error("Error fetching nearby deals:", error)
    return NextResponse.json({
      success: true,
      deals: getMockDeals(),
      isRealData: false,
    })
  }
}

function generateDealForRestaurant(restaurant: any, index: number) {
  // Only generate deals for some restaurants (not all)
  if (Math.random() < 0.4) return null // 40% chance of having a deal

  // Categorize by meal type, dining style, and occasion rather than ethnicity
  const dealTypes = [
    // Breakfast & Brunch
    {
      title: "Early Bird Breakfast Special",
      discount: 0.3,
      category: "Breakfast",
      image: "/images/breakfast.jpg",
      timeRange: "morning",
    },
    {
      title: "Weekend Brunch Deal",
      discount: 0.25,
      category: "Brunch",
      image: "/images/brunch.jpg",
      timeRange: "weekend",
    },

    // Lunch Specials
    {
      title: "Business Lunch Special",
      discount: 0.35,
      category: "Lunch",
      image: "/images/lunch.jpg",
      timeRange: "midday",
    },
    {
      title: "Quick Bite Combo",
      discount: 0.4,
      category: "Fast Casual",
      image: "/images/combo.jpg",
      timeRange: "midday",
    },

    // Dinner & Evening
    {
      title: "Date Night Special",
      discount: 0.2,
      category: "Fine Dining",
      image: "/images/fine-dining.jpg",
      timeRange: "evening",
    },
    {
      title: "Family Dinner Deal",
      discount: 0.3,
      category: "Family Style",
      image: "/images/family-meal.jpg",
      timeRange: "evening",
    },

    // Happy Hour & Drinks
    {
      title: "Happy Hour Special",
      discount: 0.5,
      category: "Happy Hour",
      image: "/images/cocktails.jpg",
      timeRange: "afternoon",
    },
    {
      title: "After Work Drinks",
      discount: 0.4,
      category: "Bar & Grill",
      image: "/images/beer.jpg",
      timeRange: "evening",
    },

    // Comfort Food
    {
      title: "Comfort Food Special",
      discount: 0.35,
      category: "Comfort Food",
      image: "/images/comfort-food.jpg",
      timeRange: "any",
    },
    {
      title: "Hearty Meal Deal",
      discount: 0.3,
      category: "Hearty Meals",
      image: "/images/hearty-meal.jpg",
      timeRange: "any",
    },

    // Healthy & Fresh
    {
      title: "Fresh & Healthy Special",
      discount: 0.25,
      category: "Healthy",
      image: "/images/salad.jpg",
      timeRange: "lunch",
    },
    {
      title: "Power Bowl Deal",
      discount: 0.3,
      category: "Health Food",
      image: "/images/bowl.jpg",
      timeRange: "any",
    },

    // Street Food & Casual
    {
      title: "Street Food Special",
      discount: 0.45,
      category: "Street Food",
      image: "/images/street-food.jpg",
      timeRange: "any",
    },
    {
      title: "Grab & Go Deal",
      discount: 0.4,
      category: "Quick Eats",
      image: "/images/grab-go.jpg",
      timeRange: "any",
    },

    // Dessert & Sweets
    {
      title: "Sweet Treats Special",
      discount: 0.3,
      category: "Desserts",
      image: "/images/dessert.jpg",
      timeRange: "any",
    },

    // Late Night
    {
      title: "Late Night Munchies",
      discount: 0.35,
      category: "Late Night",
      image: "/images/late-night.jpg",
      timeRange: "night",
    },
  ]

  // Smart deal selection based on restaurant characteristics
  let selectedDeal = dealTypes[Math.floor(Math.random() * dealTypes.length)]

  // Override based on restaurant name/type patterns
  const restaurantName = restaurant.name.toLowerCase()
  const categories = restaurant.categories || []
  const cuisine = restaurant.cuisine || []

  // Match deals to restaurant types
  if (restaurantName.includes("coffee") || restaurantName.includes("cafe") || categories.includes("catering.cafe")) {
    selectedDeal = dealTypes.find((d) => d.category === "Breakfast") || selectedDeal
  } else if (restaurantName.includes("bar") || restaurantName.includes("pub") || categories.includes("catering.bar")) {
    selectedDeal = dealTypes.find((d) => d.category === "Happy Hour") || selectedDeal
  } else if (restaurantName.includes("pizza")) {
    selectedDeal = {
      ...selectedDeal,
      title: "Pizza Night Special",
      image: "/images/pizza.jpg",
      category: "Comfort Food",
    }
  } else if (restaurantName.includes("burger")) {
    selectedDeal = {
      ...selectedDeal,
      title: "Burger & Fries Deal",
      image: "/images/burger.jpg",
      category: "Comfort Food",
    }
  } else if (restaurantName.includes("taco") || cuisine.includes("mexican")) {
    selectedDeal = {
      ...selectedDeal,
      title: "Taco Tuesday Special",
      image: "/images/tacos.jpg",
      category: "Street Food",
    }
  } else if (restaurantName.includes("sushi") || cuisine.includes("japanese")) {
    selectedDeal = {
      ...selectedDeal,
      title: "Fresh Sushi Special",
      image: "/images/sushi.jpg",
      category: "Fine Dining",
    }
  } else if (restaurantName.includes("wing")) {
    selectedDeal = { ...selectedDeal, title: "Wing Night Special", image: "/images/wings.jpg", category: "Bar & Grill" }
  } else if (restaurantName.includes("bbq") || restaurantName.includes("grill")) {
    selectedDeal = { ...selectedDeal, title: "BBQ Platter Special", image: "/images/bbq.jpg", category: "Hearty Meals" }
  } else if (categories.includes("catering.fast_food")) {
    selectedDeal = dealTypes.find((d) => d.category === "Quick Eats") || selectedDeal
  }

  const originalPrice = 15 + Math.random() * 25 // $15-40
  const dealPrice = originalPrice * (1 - selectedDeal.discount)

  // Generate time left based on deal type
  let hoursLeft, minutesLeft
  if (selectedDeal.timeRange === "morning") {
    hoursLeft = Math.floor(1 + Math.random() * 3) // 1-4 hours for morning deals
    minutesLeft = Math.floor(Math.random() * 60)
  } else if (selectedDeal.timeRange === "afternoon") {
    hoursLeft = Math.floor(2 + Math.random() * 4) // 2-6 hours for afternoon deals
    minutesLeft = Math.floor(Math.random() * 60)
  } else {
    hoursLeft = Math.floor(1 + Math.random() * 7) // 1-8 hours for general deals
    minutesLeft = Math.floor(Math.random() * 60)
  }

  // Determine if featured (10% chance)
  const isFeatured = Math.random() < 0.1

  return {
    id: `deal_${restaurant.id}`,
    title: `${selectedDeal.title} - ${Math.round(selectedDeal.discount * 100)}% Off`,
    image: selectedDeal.image,
    price: `$${dealPrice.toFixed(2)}`,
    originalPrice: `$${originalPrice.toFixed(2)}`,
    location: restaurant.name,
    address: restaurant.address,
    distance: restaurant.distance
      ? `${(restaurant.distance / 1609.34).toFixed(1)} miles`
      : `${(Math.random() * 20).toFixed(1)} miles`,
    timeLeft: `${hoursLeft}h ${minutesLeft}m`,
    category: selectedDeal.category,
    rating: Number(restaurant.rating.toFixed(1)),
    isFeatured: isFeatured,
    submittedBy: generateSubmitterName(),
    points: Math.floor(100 + Math.random() * 200),
    phone: restaurant.phone,
    website: restaurant.website,
    coordinates: restaurant.coordinates,
    facilities: restaurant.facilities,
  }
}

function generateSubmitterName() {
  const names = [
    "FoodieExplorer",
    "LocalEats",
    "DealHunter",
    "TasteSeeker",
    "CheapEatsUser",
    "RestaurantScout",
    "FoodLover",
    "DealFinder",
    "LocalFoodie",
    "EatsExpert",
    "FoodDeals",
    "LocalTaste",
    "DealMaster",
    "FoodieFinds",
    "EatsDeals",
    "MealDeals",
    "FoodSaver",
    "EatSmart",
    "DealSpotter",
    "FoodieFinds",
  ]
  return names[Math.floor(Math.random() * names.length)]
}

function getMockDeals() {
  return [
    {
      id: "1",
      title: "Business Lunch Special - 35% Off",
      image: "/images/lunch.jpg",
      price: "$12.99",
      originalPrice: "$19.99",
      location: "Downtown Bistro",
      address: "123 Main St, Your City",
      distance: "2.3 miles",
      timeLeft: "2h 15m",
      category: "Lunch",
      rating: 4.8,
      isFeatured: true,
      submittedBy: "LocalEats",
      points: 150,
    },
    {
      id: "2",
      title: "Happy Hour Special - 50% Off",
      image: "/images/cocktails.jpg",
      price: "$6.00",
      originalPrice: "$12.00",
      location: "Rooftop Bar & Grill",
      address: "456 Oak Ave, Your City",
      distance: "4.8 miles",
      timeLeft: "1h 45m",
      category: "Happy Hour",
      rating: 4.5,
      submittedBy: "DealHunter",
      points: 200,
    },
  ]
}
