"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, X, User, Moon, Sun, Heart, LogOut, Settings, Grid3X3, ChevronDown, MapPin, Phone, Wallet, Shield } from 'lucide-react';
import DataSyncHelper from '@/lib/syncHelper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { itemsCount } = useCart();
  const [realtimeCartCount, setRealtimeCartCount] = useState(itemsCount);
  const { favorites } = useFavorites();
  const { balance, formatCoins } = useWallet();
  const { user, logout, setRole, setSessionId } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // console.log("ENHANCED Header component rendered", {
  //   isMenuOpen,
  //   itemsCount,
  //   realtimeCartCount,
  //   user: user?.email,
  //   favoritesCount: favorites.length
  // });

  // Enhanced real-time cart sync for Header
  useEffect(() => {
    if (!user) {
      setRealtimeCartCount(0);
      return;
    }


    // Sync realtime count with context
    setRealtimeCartCount(itemsCount);

    // Subscribe to cart sync events
    const unsubscribe = DataSyncHelper.subscribeToCartSync((eventData) => {

      if (eventData.userId === user.id) {
        if (eventData.type === 'delete') {
          const newCount = eventData.updatedCart?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          setRealtimeCartCount(newCount);
        } else if (eventData.type === 'clear') {
          setRealtimeCartCount(0);
        } else if (eventData.type === 'update') {
          setRealtimeCartCount(eventData.newCount || 0);
        }
      }
    });

    return unsubscribe;
  }, [user, itemsCount]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi Admin Panel.",
    });
    localStorage.clear();
    setRole('');
    setSessionId('');
    router.push('/login');
  };

  // Sync realtime count with context changes
  useEffect(() => {
    setRealtimeCartCount(itemsCount);
  }, [itemsCount]);

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Giới thiệu', href: '/about' },
    { name: 'Danh mục sản phẩm', href: '/products' },
    { name: 'Chính sách mua hàng', href: '/how-to-buy' },
    { name: 'Tin tức công nghệ', href: '/news' },
    { name: 'Liên hệ', href: '/contact' },
    { name: 'Prompt GPT', href: '/prompt' },
  ];

  const productCategories = [
    {
      title: 'HỌC TẬP, KHÓA HỌC',
      icon: '📚',
      items: [
        { name: 'Học ngoại ngữ', href: '/products?category=language' },
        { name: 'Khóa học giá rẻ', href: '/products?category=cheap-courses' },
        { name: 'Học lập trình', href: '/products?category=programming' },
        { name: 'Tài khoản học tập khác', href: '/products?category=education' }
      ]
    },
    {
      title: 'PHẦN MỀM, CÔNG CỤ AI',
      icon: '🤖',
      items: [
        { name: 'Chat GPT - Open AI', href: '/products?category=chatgpt' },
        { name: 'Piktory AI', href: '/products?category=piktory' },
        { name: 'Heygen', href: '/products?category=heygen' },
        { name: 'Veed.io', href: '/products?category=veed' },
        { name: 'Midjourney', href: '/products?category=midjourney' },
        { name: 'Công cụ AI khác', href: '/products?category=ai-tools' }
      ]
    },
    {
      title: 'GIẢI TRÍ, NGHỆ NHẠC',
      icon: '🎵',
      items: [
        { name: 'Youtube Premium', href: '/products?category=youtube' },
        { name: 'Spotify Premium', href: '/products?category=spotify' },
        { name: 'Netflix', href: '/products?category=netflix' },
        { name: 'Veon, FPT Play', href: '/products?category=streaming' },
        { name: 'Apple Music', href: '/products?category=apple-music' },
        { name: 'Phần mềm khác', href: '/products?category=entertainment' }
      ]
    },
    {
      title: 'ĐỒ HỌA, EDIT VIDEO',
      icon: '🎨',
      items: [
        { name: 'Adobe', href: '/products?category=adobe' },
        { name: 'Canva Pro', href: '/products?category=canva' },
        { name: 'Capcut Pro', href: '/products?category=capcut' },
        { name: 'Freepik, Pingtree, Pikbest', href: '/products?category=design-resources' },
        { name: 'Tài khoản đồ họa khác', href: '/products?category=graphics' }
      ]
    },
    {
      title: 'BẢO MẬT, VPN',
      icon: '🔒',
      items: [
        { name: 'Key, Phần mềm VPN', href: '/products?category=vpn' },
        { name: 'Phần mềm chống virus', href: '/products?category=antivirus' },
        { name: 'Thuê Proxy', href: '/products?category=proxy' }
      ]
    },
    {
      title: 'NÂNG CẤP DUNG LƯỢNG',
      icon: '☁️',
      items: [
        { name: 'Google One', href: '/products?category=google-one' },
        { name: 'One Drive', href: '/products?category=onedrive' },
        { name: 'ICloud', href: '/products?category=icloud' }
      ]
    },
    {
      title: 'KEY, PHẦN MỀM BẢN QUYỀN',
      icon: '🔑',
      items: [
        { name: 'Microsoft Office 365', href: '/products?category=office' },
        { name: 'Zoom Pro', href: '/products?category=zoom' },
        { name: 'Key, Tài khoản Adobe', href: '/products?category=adobe-key' }
      ]
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCartClick = () => {
    window.location.href = '/cart';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: Handle search functionality
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 border-b border-gray-200">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10  rounded-lg flex items-center justify-center">
              {/* <span className="text-white font-bold text-lg">5K</span> */}
              <img src="/images/logo.png" alt="" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-800 leading-tight">
                QAI STORE
              </h1>
              <p className="text-gray-400 text-sm">SHOP TÀI KHOẢN</p>
            </div>
          </div>

          {/* Center - Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm tài khoản, khóa học, phần mềm..."
                className="pl-12 pr-4 py-3 w-full rounded-lg border-gray-200 bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all duration-300"
              />
              <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-blue hover:bg-brand-blue/90 p-2 rounded-md">
                <Search className="w-4 h-4 text-white" />
              </Button>
            </div>
          </form>

          {/* Right - Contact Info & Cart */}
          <div className="flex items-center space-x-6 text-gray-800 text-sm">
            {/* Location */}
            <div className="hidden lg:flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <div>
                <p className="text-xs text-gray-500">Địa Chỉ</p>
                <p className="font-medium">96 Ngô Tất Thành</p>
              </div>
            </div>

            {/* Phone */}
            <div className="hidden lg:flex items-center space-x-2">
              <Phone className="w-4 h-4 text-brand-blue" />
              <div>
                <p className="text-xs text-gray-500">Hotline</p>
                <p className="font-medium">038.966.0305</p>
              </div>
            </div>

            {/* Cart */}
            <Button variant="ghost" onClick={handleCartClick} className="relative text-gray-800 hover:bg-gray-100 p-3 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="ml-2 hidden sm:inline">Giỏ hàng</span>
              {realtimeCartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold transition-all duration-300 transform hover:scale-110">
                  {realtimeCartCount > 99 ? '99+' : realtimeCartCount}
                </Badge>
              )}
            </Button>

            {/* User Account - Mobile/Small screens */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-800 hover:bg-gray-100 p-2 rounded-lg">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs bg-gray-100 text-gray-800 border border-gray-300">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2 hidden sm:inline text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-md  border-white/20 text-gray-800 shadow-xl rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex items-center px-4 py-3 cursor-grab hover:bg-green-50 rounded-lg">
                      <Wallet className="mr-3 h-4 w-4 text-green-600" />
                      <div>
                        <span>Ví của tôi</span>
                        <div className="text-xs text-green-600 font-medium">{formatCoins(user.coins)}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/accounts" className="flex items-center px-4 py-3 cursor-grab hover:bg-purple-50 rounded-lg">
                      <Shield className="mr-3 h-4 w-4 text-purple-600" />
                      <span>Tài khoản của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center px-4 py-3 cursor-grab hover:bg-blue-50 rounded-lg">
                      <ShoppingCart className="mr-3 h-4 w-4 text-blue-600" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center px-4 py-3 cursor-grab hover:bg-pink-50 rounded-lg">
                      <Heart className="mr-3 h-4 w-4 text-pink-600" />
                      <span>Yêu thích</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-ranking" className="flex items-center px-4 py-3 cursor-grab hover:bg-yellow-50 rounded-lg">
                      <span className="mr-3 text-yellow-600">👑</span>
                      <span>Hạng khách hàng</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center px-4 py-3 cursor-grab hover:bg-red-50 text-red-600 rounded-lg">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-gray-800 hover:bg-gray-100 text-sm rounded-lg px-4 py-2">
                  <User className="w-4 h-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="lg:hidden text-gray-800 hover:bg-gray-100 p-2 rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-center h-12 space-x-8">
          {navigation.map((item) => (
            <div key={item.name} className="relative group">
              {item.name === 'Danh mục sản phẩm' ? (
                <>
                  <a
                    href={item.href}
                    className="text-gray-700 hover:text-brand-blue font-medium text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200 flex items-center"
                  >
                    {item.name}
                    <ChevronDown className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform duration-300" />
                  </a>

                  {/* Mega Menu Dropdown */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-5xl bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 mt-1">
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-6">
                        {productCategories.slice(0, 6).map((category, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                              <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-emerald rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white text-sm">{category.icon}</span>
                              </div>
                              <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">
                                {category.title}
                              </h3>
                            </div>
                            <ul className="space-y-1">
                              {category.items.slice(0, 4).map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <a
                                    href={item.href}
                                    className="block text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 px-2 py-1.5 rounded-md transition-all duration-200 hover:translate-x-1"
                                  >
                                    {item.name}
                                  </a>
                                </li>
                              ))}
                              {category.items.length > 4 && (
                                <li>
                                  <a
                                    href="/products"
                                    className="block text-xs text-blue-600 font-medium px-2 py-1.5 hover:text-blue-700"
                                  >
                                    + {category.items.length - 4} sản phẩm khác
                                  </a>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Streamlined Footer */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-500 text-sm">Khám phá hàng trăm sản phẩm chất lượng</p>
                          <div className="flex space-x-3">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-brand-blue to-brand-emerald hover:from-brand-blue/90 hover:to-brand-emerald/90 text-white text-xs px-4 py-2 shadow-md"
                            >
                              Xem tất cả
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs px-4 py-2"
                            >
                              Hỗ trợ
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <a
                  href={item.href}
                  className="text-gray-700 hover:text-brand-blue font-medium text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-200 flex items-center"
                >
                  {item.name}
                </a>
              )}
            </div>
          ))}
        </nav>


        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-6 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm tài khoản, khóa học, phần mềm..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-200 bg-white text-gray-800 placeholder-gray-500"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-3 text-gray-700 hover:text-brand-blue font-medium text-base rounded-lg hover:bg-gray-100 px-4 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile Contact Info */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center space-x-3 text-gray-800">
                <MapPin className="w-4 h-4 text-brand-blue" />
                <div>
                  <p className="text-xs text-gray-500">Vận chuyển</p>
                  <p className="font-medium text-sm">31 Nguyễn Đình Khởi</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-800">
                <Phone className="w-4 h-4 text-brand-blue" />
                <div>
                  <p className="text-xs text-gray-500">Hotline</p>
                  <p className="font-medium text-sm">0987.022.876</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}