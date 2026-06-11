import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Artworks from '@/components/Artworks';
import Videos from '@/components/Videos';
import Footer from '@/components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Artworks />
        <Videos />
      </main>
      <Footer />
    </div>
  );
}
