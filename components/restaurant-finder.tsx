"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Clock, DollarSign, RefreshCw, AlertCircle, Phone, Globe, Utensils } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  address: string
  rating: number
  userRatingsTotal: number
  priceLevel?: number
  isOpen?: boolean
  types: string[]
  coordinates?: [number, number]
  distance?: number
  phone?: string
  website?: string
  cuisine?: string[]
  facilities?: string[]
}

interface RestaurantResponse {
  success: boolean
  restaurants: Restaurant[]
  isMockData?: boolean
}

export default function RestaurantFinder() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const [location, setLocation] = useState({ lat: "40.7128", lng: "-74.0060" })
  const [radius, setRadius] = useState("1500")

  const fetchRestaurants = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/restaurants?lat=${location.lat}&lng=${location.lng}&radius=${radius}`)

      if (!response.ok) {
        throw new Error("Failed to fetch restaurants")
      }

      const data: RestaurantResponse = await response.json()

      if (data.success) {
        setRestaurants(data.restaurants)
        setIsMockData(data.isMockData || false)
      } else {
        throw new Error("API returned error status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const getPriceLevelText = (level?: number) => {
    if (!level) return "Price not available"
    const symbols = ["$", "$$", "$$$", "$$$$"]
    return symbols[level - 1] || "$"
  }

  const getOpenStatusColor = (isOpen?: boolean) => {
    if (isOpen === undefined) return "bg-gray-500"
    return isOpen ? "bg-green-500" : "bg-red-500"
  }

  const getOpenStatusText = (isOpen?: boolean) => {
    if (isOpen === undefined) return "Hours unknown"
    return isOpen ? "Open now" : "Closed"
  }

  const formatDistance = (distance?: number) => {
    if (!distance) return ""
    if (distance < 1000) {
      return `${Math.round(distance)}m away`
    }
    return `${(distance / 1000).toFixed(1)}km away`
  }

  const formatCuisine = (cuisine?: string[]) => {
    if (!cuisine || cuisine.length === 0) return []
    return cuisine.map((c) => c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
  }

  const formatFacilities = (facilities?: string[]) => {
    if (!facilities || facilities.length === 0) return []
    return facilities.map((f) => f.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Finder</h1>
        <p className="text-gray-600">Discover nearby restaurants using Geoapify Places API</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Search Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <Input
                value={location.lat}
                onChange={(e) => setLocation((prev) => ({ ...prev, lat: e.target.value }))}
                placeholder="40.7128"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <Input
                value={location.lng}
                onChange={(e) => setLocation((prev) => ({ ...prev, lng: e.target.value }))}
                placeholder="-74.0060"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Radius (meters)</label>
              <Input value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="1500" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchRestaurants} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Restaurants
                </>
              )}
            </Button>

            <Button onClick={getCurrentLocation} variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Use My Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mock Data Warning */}
      {isMockData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Using Mock Data</h3>
              <p className="text-sm text-yellow-700">
                Geoapify API key not configured. Showing sample restaurant data from NYC.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Found {restaurants.length} restaurants</h2>

        {restaurants.map((restaurant) => (
          <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{restaurant.address}</span>
                  </div>
                  {restaurant.distance && (
                    <div className="text-sm text-blue-600 font-medium">{formatDistance(restaurant.distance)}</div>
                  )}
                </div>

                <Badge className={`${getOpenStatusColor(restaurant.isOpen)} text-white`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {getOpenStatusText(restaurant.isOpen)}
                </Badge>
              </div>

              {/* Rating and Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {restaurant.rating > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{restaurant.rating.toFixed(1)}</span>
                      {restaurant.userRatingsTotal > 0 && (
                        <span className="text-gray-500 text-sm ml-1">
                          ({restaurant.userRatingsTotal.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {restaurant.priceLevel && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">{getPriceLevelText(restaurant.priceLevel)}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-2">
                  {restaurant.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${restaurant.phone}`}>
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </a>
                    </Button>
                  )}
                  {restaurant.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-3 h-3 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Cuisine Types */}
              {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <Utensils className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm font-medium text-gray-700">Cuisine:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formatCuisine(restaurant.cuisine).map((cuisine) => (
                      <Badge key={cuisine} variant="secondary" className="text-xs">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {restaurant.facilities && restaurant.facilities.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Available:</div>
                  <div className="flex flex-wrap gap-1">
                    {formatFacilities(restaurant.facilities).map((facility) => (
                      <Badge key={facility} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {restaurants.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600">Try adjusting your search parameters or increasing the radius</p>
        </div>
      )}
    </div>
  )
}
