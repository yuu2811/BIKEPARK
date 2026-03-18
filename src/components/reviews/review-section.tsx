'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createReview } from '@/actions/reviews'
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import type { Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  profiles: { display_name: string; avatar_url: string | null } | null
}

interface ReviewSectionProps {
  spotId: string
  reviews: Review[]
}

export function ReviewSection({ spotId, reviews }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [parkingAccurate, setParkingAccurate] = useState<boolean | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) return
    setLoading(true)
    setError('')

    const result = await createReview({
      spot_id: spotId,
      rating,
      comment: comment || undefined,
      parking_accurate: parkingAccurate,
    })

    if (result.success) {
      toast.success('レビューを投稿しました')
      setShowForm(false)
      setRating(0)
      setComment('')
      setParkingAccurate(undefined)
    } else {
      setError(result.error)
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">レビュー ({reviews.length})</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'キャンセル' : 'レビューを書く'}
        </Button>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="mb-6 rounded-lg border bg-card p-4">
          {error && (
            <p className="mb-3 text-sm text-destructive">{error}</p>
          )}
          <div className="mb-4 space-y-2">
            <Label>評価 *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <Label>駐車場情報は正確でしたか？</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={parkingAccurate === true ? 'default' : 'outline'}
                onClick={() => setParkingAccurate(true)}
                className="gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                正確
              </Button>
              <Button
                size="sm"
                variant={parkingAccurate === false ? 'destructive' : 'outline'}
                onClick={() => setParkingAccurate(false)}
                className="gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                不正確
              </Button>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <Label>コメント</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="訪問した感想を書いてください..."
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? '投稿中...' : 'レビューを投稿'}
          </Button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            まだレビューがありません。最初のレビューを書いてみましょう！
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {review.profiles?.avatar_url && (
                    <img
                      src={review.profiles.avatar_url}
                      alt=""
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {review.profiles?.display_name || 'ライダー'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="mb-2 text-sm">{review.comment}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                {review.parking_accurate !== null && (
                  <span className="flex items-center gap-1">
                    {review.parking_accurate ? (
                      <>
                        <ThumbsUp className="h-3 w-3 text-green-500" />
                        駐車場情報は正確
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="h-3 w-3 text-red-500" />
                        駐車場情報に差異あり
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
