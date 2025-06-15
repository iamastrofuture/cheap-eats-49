"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Navigation, CheckCircle, Loader2 } from "lucide-react"

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void
  currentLocation: string
}

export default function LocationSelector({
  isOpen,
  onClose,
  onLocationSelect,
  currentLocation,
}: LocationSelectorProps) {
  const [zipCode, setZipCode] = useState("")
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState("")
  const [recentLocations, setRecentLocations] = useState<Array<{ name: string; lat: number; lng: number }>>([])

  const handleZipCodeSearch = async () => {
    if (!zipCode.trim()) {
      setError("Please enter a zip code")
      return
    }

    // Validate zip code format (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipRegex.test(zipCode.trim())) {
      setError("Please enter a valid zip code (e.g., 12345 or 12345-6789)")
      return
    }

    setIsGeocoding(true)
    setError("")

    try {
      // Use a free geocoding service for zip codes
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode.trim()}`)

      if (!response.ok) {
        throw new Error("Zip code not found")
      }

      const data = await response.json()

      if (data.places && data.places.length > 0) {
        const place = data.places[0]
        const location = {
          lat: Number.parseFloat(place.latitude),
          lng: Number.parseFloat(place.longitude),
          name: `${place["place name"]}, ${place["state abbreviation"]} ${zipCode.trim()}`,
        }

        // Add to recent locations
        const newRecentLocations = [location, ...recentLocations.filter((loc) => loc.name !== location.name)].slice(
          0,
          5,
        )
        setRecentLocations(newRecentLocations)

        onLocationSelect(location)
        onClose()
      } else {
        throw new Error("Location data not available")
      }
    } catch (error) {
      console.error("Error geocoding zip code:", error)
      setError("Could not find location for this zip code. Please check and try again.")
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGeocoding(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocode to get zip code and city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
            )

            if (response.ok) {
              const data = await response.json()
              const locationName = data.postcode
                ? `${data.city || data.locality}, ${data.principalSubdivision} ${data.postcode}`
                : `${data.city || data.locality}, ${data.principalSubdivision}`

              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                name: locationName || "Current Location",
              }

              // Add to recent locations
              const newRecentLocations = [
                location,
                ...recentLocations.filter((loc) => loc.name !== location.name),
              ].slice(0, 5)
              setRecentLocations(newRecentLocations)

              onLocationSelect(location)
              onClose()
            } else {
              throw new Error("Could not get location details")
            }
          } catch (error) {
            console.error("Error getting location details:", error)
            // Fallback to just coordinates
            onLocationSelect({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              name: "Current Location",
            })
            onClose()
          } finally {
            setIsGeocoding(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your current location. Please enter a zip code instead.")
          setIsGeocoding(false)
        },
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  const handleRecentLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    onLocationSelect(location)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-orange-600">📍 Choose Your Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Location */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Current: {currentLocation}</h3>
                  <p className="text-sm text-blue-700">Use GPS to find nearby deals</p>
                </div>
                <Button
                  onClick={handleCurrentLocation}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isGeocoding}
                >
                  {isGeocoding ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-1" />
                  )}
                  Use GPS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Zip Code Search */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Enter Your Zip Code</h4>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter zip code (e.g., 90210)"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value)
                    setError("")
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleZipCodeSearch()}
                  maxLength={10}
                />
                <Button
                  onClick={handleZipCodeSearch}
                  disabled={isGeocoding}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</div>}

              <div className="text-xs text-gray-500">💡 Works with any US zip code (e.g., 10001, 90210, 60601)</div>
            </div>
          </div>

          {/* Recent Locations */}
          {recentLocations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Recent Locations</h4>
              <div className="space-y-1">
                {recentLocations.map((location, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRecentLocationSelect(location)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="font-medium text-sm">{location.name}</span>
                        </div>
                        {currentLocation === location.name && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Popular Examples */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h5 className="font-semibold text-gray-900 text-sm mb-2">Popular Zip Codes:</h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>• 10001 (NYC)</div>
                <div>• 90210 (Beverly Hills)</div>
                <div>• 60601 (Chicago)</div>
                <div>• 77001 (Houston)</div>
                <div>• 33101 (Miami)</div>
                <div>• 98101 (Seattle)</div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-xs text-green-800">
              <strong>🎯 Find deals anywhere in the US!</strong>
              <br />
              Enter any zip code to see restaurants and deals in that area. Perfect for travel or finding deals in
              specific neighborhoods.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
