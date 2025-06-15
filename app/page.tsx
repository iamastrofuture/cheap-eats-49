"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Clock,
  Search,
  Plus,
  Bell,
  Trophy,
  Star,
  DollarSign,
  Camera,
  Settings,
  Navigation,
  Phone,
  Globe,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import RestaurantFinder from "@/components/restaurant-finder"

interface Deal {
  id: string
  title: string
  image: string
  price: string
  originalPrice?: string
  location: string
  address?: string
  distance: string
  timeLeft: string
  category: string
  rating: number
  isFeatured?: boolean
  submittedBy: string
  points?: number
  phone?: string
  website?: string
  coordinates?: [number, number]
  facilities?: string[]
}

interface DealsResponse {
  success: boolean
  deals: Deal[]
  isRealData?: boolean
}

const leaderboardData = [
  { rank: 1, name: "PizzaFan", points: 2450, deals: 15 },
  { rank: 2, name: "BBQMaster", points: 2280, deals: 14 },
  { rank: 3, name: "SushiMaster", points: 2200, deals: 12 },
  { rank: 4, name: "CocktailConnoisseur", points: 1950, deals: 11 },
  { rank: 5, name: "TacoTuesday", points: 1800, deals: 10 },
  { rank: 6, name: "WingLover23", points: 1650, deals: 9 },
  { rank: 7, name: "BurgerKing", points: 1500, deals: 8 },
  { rank: 8, name: "PastaLover", points: 1350, deals: 7 },
]

export default function CheapEatsApp() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentLocation, setCurrentLocation] = useState("Your Area")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(false)
  const [isRealData, setIsRealData] = useState(false)

  // Updated categories based on meal types and dining occasions
  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Happy Hour",
    "Fine Dining",
    "Comfort Food",
    "Healthy",
    "Street Food",
    "Late Night",
    "Family Style",
    "Quick Eats",
    "Desserts",
  ]

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  // Fetch deals when location changes
  useEffect(() => {
    fetchDeals()
  }, [userLocation])

  const fetchDeals = async () => {
    setLoading(true)
    try {
      const lat = userLocation?.lat || 40.7128
      const lng = userLocation?.lng || -74.006

      const response = await fetch(`/api/nearby-deals?lat=${lat}&lng=${lng}&radius=32000`)
      const data: DealsResponse = await response.json()

      if (data.success) {
        setDeals(data.deals)
        setIsRealData(data.isRealData || false)
      }
    } catch (error) {
      console.error("Error fetching deals:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || deal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredDeals = filteredDeals.filter((deal) => deal.isFeatured)
  const regularDeals = filteredDeals.filter((deal) => !deal.isFeatured)

  // Filter deals within 20 miles for "Near Me" tab
  const nearbyDeals = filteredDeals.filter((deal) => {
    const distance = Number.parseFloat(deal.distance.replace(" miles", ""))
    return distance <= 20
  })

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card
      className={`mb-4 overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${deal.isFeatured ? "ring-2 ring-yellow-400" : ""}`}
    >
      {deal.isFeatured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 text-center">
          ⭐ FEATURED DEAL
        </div>
      )}
      <div className="relative">
        <Image
          src={deal.image || "/placeholder.svg"}
          alt={deal.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
          priority
        />
        <Badge className="absolute top-3 right-3 bg-red-500 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {deal.timeLeft}
        </Badge>
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
          {deal.category}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">{deal.title}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{deal.price}</div>
            {deal.originalPrice && <div className="text-sm text-gray-500 line-through">{deal.originalPrice}</div>}
          </div>
        </div>

        <div className="flex items-center mb-3">
          <MapPin className="w-4 h-4 text-gray-500 mr-1 flex-shrink-0" />
          <div>
            <span className="text-sm text-gray-700 font-medium block">{deal.location}</span>
            {deal.address && <span className="text-xs text-gray-500">{deal.address}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{deal.rating}</span>
            </div>
            <div className="text-sm text-gray-500">• {deal.distance}</div>
          </div>
          <div className="text-xs text-gray-500">by {deal.submittedBy}</div>
        </div>

        {/* Contact buttons for real restaurants */}
        {(deal.phone || deal.website) && (
          <div className="flex space-x-2 pt-2 border-t">
            {deal.phone && (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={`tel:${deal.phone}`}>
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </a>
              </Button>
            )}
            {deal.website && (
              <Button variant="outline" size="sm" asChild className="flex-1">
                <a href={deal.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-3 h-3 mr-1" />
                  Website
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const SubmitDealForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Deal Title</label>
        <Input placeholder="e.g., Happy Hour Special, Business Lunch Deal" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Restaurant/Business</label>
        <Input placeholder="Restaurant name" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Food Photo</label>
        <Button variant="outline" className="w-full">
          <Camera className="w-4 h-4 mr-2" />
          Upload Food Photo
        </Button>
        <p className="text-xs text-gray-500 mt-1">High-quality photos get more engagement!</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Deal Price</label>
          <Input placeholder="$12.99" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Original Price</label>
          <Input placeholder="$19.99" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select className="w-full p-2 border rounded-md">
          <option>Select category</option>
          {categories.slice(1).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input placeholder="Restaurant address" />
        {userLocation && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              console.log("Current location:", userLocation)
            }}
          >
            <Navigation className="w-3 h-3 mr-1" />
            Use Current Location
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <Input type="time" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <Input type="time" />
        </div>
      </div>

      <Button className="w-full bg-orange-600 hover:bg-orange-700">Submit Deal & Earn Points</Button>

      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <p className="text-xs text-green-800 text-center">
          🏆 Earn 100-300 points for verified deals! Points help you climb the leaderboard and unlock rewards.
        </p>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-orange-600">CheapEats</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsAdmin(!isAdmin)}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search deals or restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>
      </div>

      {/* Real Data Indicator */}
      {isRealData && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center text-green-800 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Showing real restaurants and deals in your area
          </div>
        </div>
      )}

      {/* Main Content with Tabs */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white border-b text-xs">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="nearby">Near Me</TabsTrigger>
          <TabsTrigger value="restaurants">Find</TabsTrigger>
          <TabsTrigger value="submit">Submit</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranks</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="px-4 py-4">
          {/* Refresh Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Live Deals</h2>
            <Button variant="outline" size="sm" onClick={fetchDeals} disabled={loading}>
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Finding deals near you...</p>
            </div>
          )}

          {/* Featured Deals Section */}
          {!loading && featuredDeals.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Featured Deals
              </h2>
              {featuredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}

          {/* Regular Deals */}
          {!loading && (
            <div>
              <h2 className="text-lg font-bold mb-3">All Deals</h2>
              {regularDeals.length > 0 ? (
                regularDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No deals found matching your criteria.</p>
                  <p className="text-sm">Try adjusting your search or category filter.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Near Me Tab */}
        <TabsContent value="nearby" className="px-4 py-4">
          <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-lg font-bold mb-2 text-blue-900">Deals Near {currentLocation}</h2>
            <p className="text-sm text-blue-700">Within 20 miles of your location</p>
            <div className="mt-2 text-xs text-blue-600">📍 {nearbyDeals.length} deals found in your area</div>
            {isRealData && <div className="mt-2 text-xs text-green-600">✅ Real restaurant data</div>}
          </div>

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Finding nearby deals...</p>
            </div>
          )}

          {!loading &&
            nearbyDeals
              .sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance))
              .map((deal) => <DealCard key={deal.id} deal={deal} />)}

          {!loading && nearbyDeals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No deals found within 20 miles.</p>
              <p className="text-sm">Check back later or try expanding your search area.</p>
            </div>
          )}
        </TabsContent>

        {/* Restaurant Finder Tab */}
        <TabsContent value="restaurants" className="p-0">
          <div className="bg-white min-h-screen">
            <RestaurantFinder />
          </div>
        </TabsContent>

        {/* Submit Deal Tab */}
        <TabsContent value="submit" className="px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Submit a Deal
              </CardTitle>
              <p className="text-sm text-gray-600">Help your community discover great food deals!</p>
            </CardHeader>
            <CardContent>
              <SubmitDealForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="px-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Local Food Scouts Leaderboard
              </CardTitle>
              <p className="text-sm text-gray-600">Top contributors in your area</p>
            </CardHeader>
            <CardContent>
              {leaderboardData.map((user) => (
                <div key={user.rank} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                        user.rank === 1
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                          : user.rank === 2
                            ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
                            : user.rank === 3
                              ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                              : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.deals} verified deals</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600 text-lg">{user.points}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-800 text-center">
                  🎯 Submit quality deals to earn points and climb the rankings!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Panel */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4">
          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="p-3">
              <div className="text-xs font-medium text-blue-800 mb-2">Admin Panel</div>
              <Button size="sm" className="w-full mb-2 bg-blue-600 hover:bg-blue-700">
                <DollarSign className="w-3 h-3 mr-1" />
                Manage Featured
              </Button>
              <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700">
                Verify Deals
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
