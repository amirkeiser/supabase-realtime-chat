'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import AdminReviewActions from './admin-review-actions'
import { ChevronDown, ChevronUp } from 'lucide-react'

type ProfileData = {
  id: string
  name: string
  email: string | null
  photo_url: string | null
  gender: string | null
  location: string | null
  date_of_birth: string | null
  bio: string | null
  religious_info: Record<string, unknown> | null
  preferences: Record<string, unknown> | null
  submitted_at: string | null
}

export default function ExpandableProfileRow({ profileData }: { profileData: ProfileData }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const age = profileData.date_of_birth
    ? new Date().getFullYear() - new Date(profileData.date_of_birth).getFullYear()
    : null

  return (
    <Card className={`overflow-hidden transition-colors ${!isExpanded ? 'hover:bg-muted/50 cursor-pointer' : ''}`}>
      {/* Compact Row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4"
      >
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <div className="shrink-0">
            {profileData.photo_url ? (
              <img
                src={profileData.photo_url}
                alt="Profile"
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs">No Photo</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="flex-1 text-left">
            <p className="font-medium">{profileData.email || 'No email'}</p>
            <p className="text-sm text-muted-foreground">{profileData.name}</p>
          </div>

          {/* Expand Icon */}
          <div className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t p-6 space-y-4">
          <div className="flex gap-6">
            {/* Profile Photo (larger) */}
            {profileData.photo_url && (
              <div className="shrink-0">
                <img
                  src={profileData.photo_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}

            {/* Profile Details */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {profileData.email && <span>{profileData.email}</span>}
                  {profileData.gender && ` • ${profileData.gender}`}
                  {profileData.location && ` • ${profileData.location}`}
                  {age && ` • ${age} years old`}
                </p>
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Bio:</h4>
                  <p className="text-sm">{profileData.bio}</p>
                </div>
              )}

              {/* Religious Info */}
              {profileData.religious_info && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Religious Information:</h4>
                  <div className="text-sm space-y-1">
                    {Object.entries(profileData.religious_info).map(([key, value]) => (
                      <p key={key}>
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>{' '}
                        {String(value)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences */}
              {profileData.preferences && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Preferences:</h4>
                  <div className="text-sm space-y-1">
                    {Object.entries(profileData.preferences).map(([key, value]) => (
                      <p key={key}>
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>{' '}
                        {String(value)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Submitted:{' '}
                {profileData.submitted_at
                  ? new Date(profileData.submitted_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <AdminReviewActions userId={profileData.id} />
        </div>
      )}
    </Card>
  )
}

