import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturedCategories from '@/components/FeaturedCategories';
import DiscountedProductsSlider from '@/components/DiscountedProductsSlider';
import TopProducts from '@/components/TopProducts';
import HomeAiToolsSection from '@/components/HomeAiToolsSection';
import HomeBestSellerSection from '@/components/HomeBestSellerSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import OtherWebsites from '@/components/OtherWebsites';
import Footer from '@/components/Footer';
import RandomPurchaseNotification from '@/components/RandomPurchaseNotification';
import SectionReveal from '@/components/SectionReveal';
import './home.css';

export default function Home() {
  return (
    <div className="home-page relative min-h-screen overflow-x-clip bg-[#fafbff]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-72 -right-20 h-80 w-80 rounded-full bg-brand-emerald/15 blur-3xl [animation-duration:4s] animate-float"
      />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <SectionReveal delayMs={80}>
          <FeaturedCategories />
        </SectionReveal>
        <SectionReveal delayMs={100}>
          <HomeAiToolsSection />
        </SectionReveal>
        <SectionReveal delayMs={120} className="home-soft-section">
          <HomeBestSellerSection />
        </SectionReveal>
        <SectionReveal delayMs={160}>
          <DiscountedProductsSlider />
        </SectionReveal>
        <SectionReveal delayMs={200}>
          <TopProducts />
        </SectionReveal>
        <SectionReveal delayMs={120} className="home-soft-section">
          <WhyChooseUs />
        </SectionReveal>
        <SectionReveal delayMs={100}>
          <Testimonials />
        </SectionReveal>
        <SectionReveal delayMs={100} className="home-soft-section">
          <FAQ />
        </SectionReveal>
        <SectionReveal delayMs={100}>
          <OtherWebsites />
        </SectionReveal>
      </main>
      {/* Notify giả lập khách hàng thêm vào giỏ hàng */}
      <RandomPurchaseNotification />
      <Footer />
    </div>
  );
}
