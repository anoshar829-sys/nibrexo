import { CoreStory } from "@/components/home/CoreStory";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { Portfolio } from "@/components/home/Portfolio";
import { Resources } from "@/components/home/Resources";
import { Testimonials } from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <main id="main-content">
      <Hero />
      <CoreStory />
      <Portfolio />
      <Resources />
      <Testimonials />
      <Faq />
      <Newsletter />
      <FinalCta />
    </main>
  );
}
