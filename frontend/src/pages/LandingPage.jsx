import Hero from "../components/landing/Hero";
import UploadArea from "../components/landing/UploadArea";
import FeatureCards from "../components/landing/FeatureCards";

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <UploadArea />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rule-gold" />
      </div>
      <FeatureCards />
    </div>
  );
}
