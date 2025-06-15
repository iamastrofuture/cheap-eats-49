"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Phone, Globe, MapPin, Clock, Star, Share2, CheckCircle } from "lucide-react"

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
  phone?: string
  website?: string
  submittedBy: string
  description?: string
  instructions?: string
  validUntil?: string
  isOfficialDeal?: boolean
}

interface CouponModalProps {
  deal: Deal | null
  isOpen: boolean
  onClose: () => void
}

export default function CouponModal({ deal, isOpen, onClose }: CouponModalProps) {
  const [isCopied, setIsCopied] = useState(false)

  if (!deal) return null

  const getDiscount = () => {
    if (deal.price === "FREE") return "FREE"
    if (deal.price.includes("%")) return deal.price
    if (!deal.originalPrice) return "Special Price"
    const original = Number.parseFloat(deal.originalPrice.replace("$", ""))
    const current = Number.parseFloat(deal.price.replace("$", ""))
    if (isNaN(original) || isNaN(current)) return "Special Price"
    return Math.round(((original - current) / original) * 100) + "% OFF"
  }

  const handleCopyInstructions = async () => {
    const copyText = `${deal.title}\n\nHow to get this deal:\n${deal.instructions}\n\nValid: ${deal.validUntil}\n\nRestaurant: ${deal.location}\nPhone: ${deal.phone || "Not available"}`

    await navigator.clipboard.writeText(copyText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleShare = async () => {
    const shareText = `🍽️ Found a great deal at ${deal.location}!\n💰 ${deal.title}\n📋 ${deal.instructions}\n⏰ ${deal.validUntil}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Great Deal at ${deal.location}`,
          text: shareText,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      alert("Deal details copied to clipboard!")
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "")

    // Format as (XXX) XXX-XXXX if it's a 10-digit US number
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }

    // Return original if not a standard format
    return phone
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-600">
            {deal.isOfficialDeal ? "🏪 Official Restaurant Deal" : "🎉 Community Deal"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Restaurant Info */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{deal.location}</h3>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{deal.rating}</span>
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{deal.address || deal.location}</span>
              </div>

              <div className="text-sm text-gray-600">{deal.distance}</div>

              {deal.isOfficialDeal && (
                <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Restaurant Deal
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Deal Details */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">{deal.title}</h4>
              <p className="text-sm text-blue-800 mb-3">{deal.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">{deal.price}</span>
                  {deal.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">{deal.originalPrice}</span>
                  )}
                </div>
                <Badge className="bg-red-500 text-white">{getDiscount()}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* How to Get This Deal */}
          <Card className="bg-green-50 border-green-200 border-2">
            <CardContent className="p-4">
              <h5 className="font-semibold text-green-800 text-sm mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                How to Get This Deal:
              </h5>

              <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
                <p className="text-sm text-gray-800">{deal.instructions}</p>
              </div>

              <div className="flex items-center text-xs text-green-700 mb-3">
                <Clock className="w-3 h-3 mr-1" />
                <span className="font-medium">Valid: {deal.validUntil}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleCopyInstructions}
                  variant="outline"
                  className="flex-1 border-green-300 text-green-700"
                  size="sm"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {isCopied ? "Copied!" : "Copy Details"}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 border-green-300 text-green-700"
                  size="sm"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share Deal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          <div className="grid grid-cols-1 gap-3">
            {deal.phone && (
              <Button variant="outline" asChild className="border-blue-300 text-blue-700">
                <a href={`tel:${deal.phone.replace(/\D/g, "")}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call {formatPhoneNumber(deal.phone)}
                </a>
              </Button>
            )}
            {deal.website && (
              <Button variant="outline" asChild className="border-blue-300 text-blue-700">
                <a href={deal.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>

          {/* Pro Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <h5 className="font-semibold text-yellow-800 text-sm mb-2">💡 Pro Tips:</h5>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Call ahead to confirm the deal is still available</li>
                <li>• Ask about any restrictions or limitations</li>
                <li>• Some deals may require minimum purchase</li>
                <li>• Download restaurant apps for exclusive offers</li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            {deal.isOfficialDeal ? "Official restaurant promotion" : `Deal submitted by ${deal.submittedBy}`} •
            CheapEats Community
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
