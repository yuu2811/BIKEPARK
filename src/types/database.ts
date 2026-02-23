export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ParkingLargeBike = 'ok' | 'ng' | 'unknown'
export type ParkingSurface = 'paved' | 'gravel' | 'dirt' | 'grass' | 'mixed'
export type ParkingSlope = 'flat' | 'slight' | 'steep'
export type VerificationTier = 'unverified' | 'rider_verified' | 'community_trusted' | 'well_established'
export type Visibility = 'private' | 'unlisted' | 'public'
export type BikeType = 'touring' | 'adventure' | 'sport' | 'cruiser' | 'naked' | 'off-road' | 'scooter' | 'other'
export type StopType = 'origin' | 'destination' | 'stop' | 'via'
export type AdvisoryType = 'road_closure' | 'construction' | 'weather' | 'seasonal_closure' | 'other'
export type Severity = 'info' | 'warning' | 'danger'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          home_prefecture: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          home_prefecture?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          home_prefecture?: string | null
          updated_at?: string
        }
      }
      user_bikes: {
        Row: {
          id: string
          user_id: string
          manufacturer: string
          model: string
          displacement_cc: number | null
          bike_type: BikeType | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          manufacturer: string
          model: string
          displacement_cc?: number | null
          bike_type?: BikeType | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          manufacturer?: string
          model?: string
          displacement_cc?: number | null
          bike_type?: BikeType | null
          is_primary?: boolean
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          earned_at?: string
        }
        Update: {
          badge_type?: string
        }
      }
      categories: {
        Row: {
          id: number
          name_ja: string
          name_en: string
          slug: string
          icon: string
          color: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name_ja: string
          name_en: string
          slug: string
          icon: string
          color: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          name_ja?: string
          name_en?: string
          slug?: string
          icon?: string
          color?: string
          sort_order?: number
        }
      }
      spots: {
        Row: {
          id: string
          created_by: string
          name: string
          description: string | null
          latitude: number
          longitude: number
          formatted_address: string | null
          prefecture: string | null
          city: string | null
          google_place_id: string | null
          website_url: string | null
          phone: string | null
          parking_large_bike: ParkingLargeBike
          parking_spots_estimate: number | null
          parking_surface: ParkingSurface | null
          parking_slope: ParkingSlope | null
          parking_covered: boolean | null
          parking_free: boolean | null
          parking_notes: string | null
          best_season: string[] | null
          operating_hours: Json | null
          access_notes: string | null
          average_rating: number
          review_count: number
          verification_count: number
          verification_tier: VerificationTier
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          name: string
          description?: string | null
          latitude: number
          longitude: number
          formatted_address?: string | null
          prefecture?: string | null
          city?: string | null
          google_place_id?: string | null
          website_url?: string | null
          phone?: string | null
          parking_large_bike?: ParkingLargeBike
          parking_spots_estimate?: number | null
          parking_surface?: ParkingSurface | null
          parking_slope?: ParkingSlope | null
          parking_covered?: boolean | null
          parking_free?: boolean | null
          parking_notes?: string | null
          best_season?: string[] | null
          operating_hours?: Json | null
          access_notes?: string | null
          average_rating?: number
          review_count?: number
          verification_count?: number
          verification_tier?: VerificationTier
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          latitude?: number
          longitude?: number
          formatted_address?: string | null
          prefecture?: string | null
          city?: string | null
          google_place_id?: string | null
          website_url?: string | null
          phone?: string | null
          parking_large_bike?: ParkingLargeBike
          parking_spots_estimate?: number | null
          parking_surface?: ParkingSurface | null
          parking_slope?: ParkingSlope | null
          parking_covered?: boolean | null
          parking_free?: boolean | null
          parking_notes?: string | null
          best_season?: string[] | null
          operating_hours?: Json | null
          access_notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      spot_categories: {
        Row: {
          spot_id: string
          category_id: number
        }
        Insert: {
          spot_id: string
          category_id: number
        }
        Update: {
          spot_id?: string
          category_id?: number
        }
      }
      spot_photos: {
        Row: {
          id: string
          spot_id: string
          uploaded_by: string
          storage_path: string
          thumbnail_path: string | null
          caption: string | null
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          uploaded_by: string
          storage_path: string
          thumbnail_path?: string | null
          caption?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          caption?: string | null
          is_primary?: boolean
          sort_order?: number
        }
      }
      reviews: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          rating: number
          comment: string | null
          visit_date: string | null
          parking_accurate: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          rating: number
          comment?: string | null
          visit_date?: string | null
          parking_accurate?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: number
          comment?: string | null
          visit_date?: string | null
          parking_accurate?: boolean | null
          updated_at?: string
        }
      }
      review_photos: {
        Row: {
          id: string
          review_id: string
          storage_path: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          storage_path: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          sort_order?: number
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_image_path: string | null
          visibility: Visibility
          forked_from: string | null
          fork_count: number
          spot_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cover_image_path?: string | null
          visibility?: Visibility
          forked_from?: string | null
          fork_count?: number
          spot_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          cover_image_path?: string | null
          visibility?: Visibility
          updated_at?: string
        }
      }
      collection_items: {
        Row: {
          id: string
          collection_id: string
          spot_id: string
          sort_order: number
          note: string | null
          added_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          spot_id: string
          sort_order?: number
          note?: string | null
          added_at?: string
        }
        Update: {
          sort_order?: number
          note?: string | null
        }
      }
      routes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          visibility: Visibility
          total_distance_km: number | null
          estimated_duration_minutes: number | null
          google_maps_url: string | null
          route_polyline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          visibility?: Visibility
          total_distance_km?: number | null
          estimated_duration_minutes?: number | null
          google_maps_url?: string | null
          route_polyline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          visibility?: Visibility
          total_distance_km?: number | null
          estimated_duration_minutes?: number | null
          google_maps_url?: string | null
          route_polyline?: string | null
          updated_at?: string
        }
      }
      route_stops: {
        Row: {
          id: string
          route_id: string
          spot_id: string | null
          custom_name: string | null
          latitude: number
          longitude: number
          stop_type: StopType
          sort_order: number
          notes: string | null
        }
        Insert: {
          id?: string
          route_id: string
          spot_id?: string | null
          custom_name?: string | null
          latitude: number
          longitude: number
          stop_type?: StopType
          sort_order: number
          notes?: string | null
        }
        Update: {
          spot_id?: string | null
          custom_name?: string | null
          latitude?: number
          longitude?: number
          stop_type?: StopType
          sort_order?: number
          notes?: string | null
        }
      }
      spot_advisories: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          advisory_type: AdvisoryType
          message: string
          severity: Severity
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          advisory_type: AdvisoryType
          message: string
          severity?: Severity
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          message?: string
          severity?: Severity
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
      parking_verifications: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          parking_large_bike: ParkingLargeBike
          verified_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          parking_large_bike: ParkingLargeBike
          verified_at?: string
        }
        Update: {
          parking_large_bike?: ParkingLargeBike
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
