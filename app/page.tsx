import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import DiscountedProductsSlider from '@/components/DiscountedProductsSlider';
import TopProducts from '@/components/TopProducts';
import HomeBestSellerSection from '@/components/HomeBestSellerSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { CustomerRankDisplay } from '@/components/CustomerRankingSystem';
import Zalo from '@/components/Zalo';
import RandomPurchaseNotification from '@/components/RandomPurchaseNotification';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-white">
        <HeroSection />
        <FeaturedCategories />
        <HomeBestSellerSection />
        <DiscountedProductsSlider />
        <TopProducts />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
        <Zalo />
      </main>
      {/* Notify giả lập khách hàng thêm vào giỏ hàng */}
      <RandomPurchaseNotification />
      <Footer />
    </div>
  );
}
