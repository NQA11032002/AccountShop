// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   calculateCustomerRank,
//   calculateNextRankProgress,
//   CustomerRankDisplay
// } from '@/components/CustomerRankingSystem';
// import {
//   Crown,
//   Trophy,
//   Gift,
//   Star,
//   TrendingUp,
//   Users,
//   Award,
//   Search,
//   ArrowRight,
//   Target,
//   Zap
// } from 'lucide-react';
// import Header from '@/components/Header';
// import { CustomerRank } from '@/types/RankingData.interface';

// // interface CustomerData {
// //   email: string;
// //   name: string;
// //   totalSpent: number;
// //   totalOrders: number;
// // }

// export default function RankingsPage() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [customerData, setCustomerData] = useState<CustomerRank[]>([]);
//   const [userEmail, setUserEmail] = useState('');

//   useEffect(() => {
//     console.log("Loading customer ranking data");

//     // Simulate customer data - in real app, this would come from database
//     const sampleData: CustomerRank[] = [
//       { email: 'nguyenvana@gmail.com', name: 'Nguyễn Văn A', totalSpent: 2500000, totalOrders: 15 },
//       { email: 'tranthib@gmail.com', name: 'Trần Thị B', totalSpent: 750000, totalOrders: 5 },
//       { email: 'levanc@gmail.com', name: 'Lê Văn C', totalSpent: 8500000, totalOrders: 25 },
//       { email: 'phamthid@gmail.com', name: 'Phạm Thị D', totalSpent: 18500000, totalOrders: 65 },
//       { email: 'hoangvane@gmail.com', name: 'Hoàng Văn E', totalSpent: 320000, totalOrders: 2 },
//     ];

//     setCustomerData(sampleData);

//     // Get user's email from localStorage or context
//     const storedUser = localStorage.getItem('qai_user');
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setUserEmail(user.email);
//     }
//   }, []);

//   const getUserData = () => {
//     return customerData.find(customer => customer.email === userEmail) ||
//       { email: userEmail, name: 'Guest User', totalSpent: 0, totalOrders: 0 };
//   };

//   const getLeaderboard = () => {
//     return customerData
//       .map(customer => ({
//         ...customer,
//         rank: calculateCustomerRank(customer.totalSpent, customer.totalOrders)
//       }))
//       .sort((a, b) => {
//         // Sort by rank order (diamond first, then platinum, etc.)
//         const rankOrder = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
//         const aIndex = rankOrder.indexOf(a.rank.id);
//         const bIndex = rankOrder.indexOf(b.rank.id);
//         if (aIndex !== bIndex) return aIndex - bIndex;
//         // If same rank, sort by total spent
//         return b.totalSpent - a.totalSpent;
//       })
//       .filter(customer =>
//         customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         customer.email.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//   };

//   const userData = getUserData();
//   const userRank = calculateCustomerRank(userData.totalSpent, userData.totalOrders);
//   const nextRankInfo = calculateNextRankProgress(userRank, userData.totalSpent, userData.totalOrders);
//   const leaderboard = getLeaderboard();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
//       <Header />

//       <div className="container mx-auto px-4 py-8">
//         {/* Page Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center space-x-3 mb-4">
//             <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-crown">
//               <Crown className="w-8 h-8 text-white drop-shadow-lg" />
//             </div>
//             <div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
//                 Hệ Thống Hạng Khách Hàng
//               </h1>
//               <p className="text-amber-700 mt-2 font-medium">Mua nhiều hơn, nhận nhiều ưu đãi hơn!</p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* User's Current Rank */}
//           <div className="lg:col-span-1">
//             <CustomerRankDisplay
//               customerEmail={userData.email}
//               totalSpent={userData.totalSpent}
//               totalOrders={userData.totalOrders}
//               className="mb-6"
//             />

//             {/* Quick Tips */}
//             <Card className="border-2 border-brand-purple/20">
//               <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
//                 <CardTitle className="flex items-center space-x-2">
//                   <Target className="w-5 h-5 text-brand-purple" />
//                   <span>Mẹo nâng hạng</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <div className="space-y-4">
//                   <div className="flex items-start space-x-3">
//                     <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium text-sm">Mua theo combo</p>
//                       <p className="text-xs text-gray-600">Combo nhiều tài khoản tiết kiệm hơn</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start space-x-3">
//                     <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium text-sm">Gia hạn sớm</p>
//                       <p className="text-xs text-gray-600">Gia hạn trước khi hết hạn để tích lũy</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start space-x-3">
//                     <Users className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="font-medium text-sm">Giới thiệu bạn bè</p>
//                       <p className="text-xs text-gray-600">Nhận hoa hồng từ người giới thiệu</p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* All Ranks Information & Leaderboard */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* All Ranks Overview */}
//             <Card className="border-2 border-gray-200">
//               <CardHeader>
//                 <CardTitle className="flex items-center space-x-2">
//                   <Trophy className="w-5 h-5 text-yellow-600" />
//                   <span>Tất cả các hạng khách hàng</span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {customerRanks.map((rank, index) => {
//                     const RankIcon = rank.icon;
//                     return (
//                       <Card
//                         key={rank.id}
//                         className={`border-2 hover:scale-105 transition-all duration-300 ${userRank.id === rank.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
//                           }`}
//                         style={{ borderColor: `${rank.color}50` }}
//                       >
//                         <CardContent className="p-4">
//                           <div className="text-center space-y-3">
//                             <div
//                               className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${rank.backgroundColor} shadow-lg`}
//                             >
//                               <RankIcon className="w-6 h-6 text-white" />
//                             </div>
//                             <div>
//                               <h3 className="font-bold text-lg" style={{ color: rank.color }}>
//                                 {rank.name}
//                               </h3>
//                               <div className="text-xs text-gray-600 space-y-1">
//                                 <p>Chi tiêu: {rank.minSpent.toLocaleString('vi-VN')}đ+</p>
//                                 <p>Đơn hàng: {rank.minOrders}+</p>
//                               </div>
//                             </div>
//                             <div className="space-y-2">
//                               <p className="text-xs font-medium text-gray-700">Phần thưởng:</p>
//                               <div className="space-y-1">
//                                 {rank.gifts.slice(0, 2).map((gift, giftIndex) => (
//                                   <div key={giftIndex} className="flex items-center space-x-2 text-xs">
//                                     <span>{gift.icon}</span>
//                                     <span className="text-gray-600 truncate">{gift.name}</span>
//                                   </div>
//                                 ))}
//                                 {rank.gifts.length > 2 && (
//                                   <p className="text-xs text-gray-500">+{rank.gifts.length - 2} thêm...</p>
//                                 )}
//                               </div>
//                             </div>
//                             {userRank.id === rank.id && (
//                               <Badge className="bg-blue-500 text-white">Hạng hiện tại</Badge>
//                             )}
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Leaderboard */}
//             <Card className="border-2 border-gray-200">
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="flex items-center space-x-2">
//                     <Award className="w-5 h-5 text-purple-600" />
//                     <span>Bảng xếp hạng khách hàng</span>
//                   </CardTitle>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                     <Input
//                       placeholder="Tìm khách hàng..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-10 w-64"
//                     />
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {leaderboard.map((customer, index) => {
//                     const RankIcon = customer.rank.icon;
//                     const isCurrentUser = customer.email === userEmail;

//                     return (
//                       <div
//                         key={customer.email}
//                         className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${isCurrentUser
//                           ? 'bg-blue-50 border-blue-200 shadow-md'
//                           : 'bg-white border-gray-100 hover:border-gray-200'
//                           }`}
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
//                             index === 1 ? 'bg-gray-400' :
//                               index === 2 ? 'bg-amber-600' :
//                                 'bg-gray-300'
//                             }`}>
//                             {index + 1}
//                           </div>

//                           <div
//                             className={`w-10 h-10 rounded-full flex items-center justify-center ${customer.rank.backgroundColor} shadow-lg`}
//                           >
//                             <RankIcon className="w-5 h-5 text-white" />
//                           </div>

//                           <div>
//                             <p className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
//                               {customer.name} {isCurrentUser && '(Bạn)'}
//                             </p>
//                             <p className="text-sm text-gray-600">{customer.email}</p>
//                           </div>
//                         </div>

//                         <div className="text-right space-y-1">
//                           <Badge
//                             variant="outline"
//                             className="text-xs font-medium border-2"
//                             style={{
//                               borderColor: customer.rank.color,
//                               color: customer.rank.color,
//                               backgroundColor: `${customer.rank.color}15`
//                             }}
//                           >
//                             {customer.rank.name}
//                           </Badge>
//                           <div className="text-sm text-gray-600">
//                             <p>{customer.totalSpent.toLocaleString('vi-VN')}đ</p>
//                             <p>{customer.totalOrders} đơn hàng</p>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <Card className="mt-12 border-2 border-amber-300 bg-gradient-to-r from-yellow-100 to-amber-100 shadow-amber">
//           <CardContent className="p-8 text-center">
//             <div className="space-y-6">
//               <div className="flex items-center justify-center space-x-3">
//                 <Gift className="w-8 h-8 text-amber-600" />
//                 <h2 className="text-2xl font-bold text-amber-800">
//                   Nâng cao hạng ngay hôm nay!
//                 </h2>
//               </div>
//               <p className="text-amber-700 max-w-2xl mx-auto font-medium">
//                 Mua thêm sản phẩm để nâng cao hạng và nhận được nhiều ưu đãi độc quyền hơn.
//                 Khách hàng Kim Cương sẽ nhận được quà tặng trị giá hàng triệu đồng!
//               </p>
//               <div className="flex items-center justify-center space-x-4">
//                 <Button
//                   size="lg"
//                   className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-200"
//                   onClick={() => window.location.href = '/products'}
//                 >
//                   Xem sản phẩm
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Button>
//                 <Button
//                   size="lg"
//                   variant="outline"
//                   className="border-2 border-amber-500 text-amber-700 hover:bg-amber-500 hover:text-white px-8 transition-all duration-200"
//                   onClick={() => window.location.href = '/accounts'}
//                 >
//                   Xem tài khoản của tôi
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }