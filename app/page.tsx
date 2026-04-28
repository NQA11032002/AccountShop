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
import RandomPurchaseNotification from '@/components/RandomPurchaseNotification';
import SectionReveal from '@/components/SectionReveal';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-72 -right-20 h-80 w-80 rounded-full bg-brand-emerald/15 blur-3xl [animation-duration:4s] animate-float"
      />
      <Header />
      <main className="relative z-10 bg-white/90 backdrop-blur-[1px]">
        <SectionReveal className="animate-fade-in">
          <HeroSection />
        </SectionReveal>
        <SectionReveal delayMs={80}>
          <FeaturedCategories />
        </SectionReveal>
        <SectionReveal delayMs={120}>
          <HomeBestSellerSection />
        </SectionReveal>
        <SectionReveal delayMs={160}>
          <DiscountedProductsSlider />
        </SectionReveal>
        <SectionReveal delayMs={200}>
          <TopProducts />
        </SectionReveal>
        <SectionReveal delayMs={240}>
          <WhyChooseUs />
        </SectionReveal>
        <SectionReveal delayMs={280}>
          <Testimonials />
        </SectionReveal>
        <SectionReveal delayMs={320}>
          <FAQ />
        </SectionReveal>
      </main>
      {/* Notify giả lập khách hàng thêm vào giỏ hàng */}
      <RandomPurchaseNotification />
      <Footer />
    </div>
  );
}
