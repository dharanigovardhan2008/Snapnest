import Navigation from '../components/shared/Navigation';
import Footer from '../components/shared/Footer';
import Banner from '../components/customer/Banner';
import Hero from '../components/customer/Hero';
import ProductShowcase from '../components/customer/ProductShowcase';
import Reviews from '../components/customer/Reviews';
import FAQ from '../components/customer/FAQ';
export default function Home() {
  return (
    <>
      <Navigation />
      <Banner />
      <main className="min-h-screen">
        <Hero />
        <ProductShowcase />
        <Reviews />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}