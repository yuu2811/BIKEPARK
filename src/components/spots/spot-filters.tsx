'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, X, ParkingSquare } from 'lucide-react'
import type { ParkingLargeBike } from '@/types/database'

interface SpotFilters {
  query: string
  parkingFilter: ParkingLargeBike | 'all'
  selectedCategories: number[]
  prefecture: string
}

interface Category {
  id: number
  name_ja: string
  slug: string
  color: string
}

interface SpotFiltersProps {
  filters: SpotFilters
  onFiltersChange: (filters: SpotFilters) => void
  categories: Category[]
}

export function SpotFilters({ filters, onFiltersChange, categories }: SpotFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  const updateFilter = (partial: Partial<SpotFilters>) => {
    onFiltersChange({ ...filters, ...partial })
  }

  const toggleCategory = (categoryId: number) => {
    const current = filters.selectedCategories
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]
    updateFilter({ selectedCategories: next })
  }

  const hasActiveFilters =
    filters.parkingFilter !== 'all' ||
    filters.selectedCategories.length > 0 ||
    filters.prefecture !== ''

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => updateFilter({ query: e.target.value })}
            placeholder="スポット名で検索..."
            className="pl-9"
          />
        </div>
        <Button
          variant={expanded ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Large bike OK toggle (always visible) */}
      <div className="flex items-center gap-2">
        <Button
          variant={filters.parkingFilter === 'ok' ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            updateFilter({
              parkingFilter: filters.parkingFilter === 'ok' ? 'all' : 'ok',
            })
          }
          className="gap-1.5"
        >
          <ParkingSquare className="h-4 w-4" />
          大型バイクOKのみ
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateFilter({
                parkingFilter: 'all',
                selectedCategories: [],
                prefecture: '',
              })
            }
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            フィルタをリセット
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="space-y-3 rounded-lg border bg-card p-3">
          {/* Categories */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">カテゴリ</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={
                    filters.selectedCategories.includes(cat.id)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleCategory(cat.id)}
                  style={
                    filters.selectedCategories.includes(cat.id)
                      ? { backgroundColor: cat.color }
                      : undefined
                  }
                >
                  {cat.name_ja}
                </Badge>
              ))}
            </div>
          </div>

          {/* Parking filter */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">駐車場</p>
            <div className="flex gap-1.5">
              {(['all', 'ok', 'ng', 'unknown'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filters.parkingFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter({ parkingFilter: status })}
                >
                  {status === 'all' && 'すべて'}
                  {status === 'ok' && '大型OK'}
                  {status === 'ng' && '大型NG'}
                  {status === 'unknown' && '未確認'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
