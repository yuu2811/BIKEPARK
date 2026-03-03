'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Map,
  Plus,
  FolderOpen,
  Route,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  LayoutDashboard,
} from 'lucide-react'

interface HeaderProps {
  user: { id: string; email?: string; display_name?: string; avatar_url?: string } | null
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/explore', label: '探索', icon: Map },
    { href: '/spots', label: 'スポット', icon: Map },
    { href: '/collections', label: 'コレクション', icon: FolderOpen },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Map className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">BIKEPARK</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center space-x-2">
          {user ? (
            <>
              <Link href="/spots/new" className="hidden md:block">
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  スポット登録
                </Button>
              </Link>
              <Link href="/route-builder" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Route className="h-4 w-4" />
                  ルート作成
                </Button>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                >
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={`${user.display_name || 'ユーザー'}のアバター`} width={32} height={32} className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover p-1 shadow-lg">
                      <div className="border-b px-3 py-2">
                        <p className="text-sm font-medium">{user.display_name || 'ライダー'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        ダッシュボード
                      </Link>
                      <Link
                        href="/my-collections"
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FolderOpen className="h-4 w-4" />
                        マイコレクション
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        設定
                      </Link>
                      <div className="border-t">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent"
                        >
                          <LogOut className="h-4 w-4" />
                          ログアウト
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">ログイン</Button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="container mx-auto space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <div className="border-t pt-1">
                  <Link
                    href="/spots/new"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    スポット登録
                  </Link>
                  <Link
                    href="/route-builder"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Route className="h-4 w-4" />
                    ルート作成
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
