import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import TrustSection from "../components/TrustSection";
import ProblemsSection from "../components/ProblemsSection";
import SolutionsSection from "../components/SolutionsSection";
import WhySKALORASection from "../components/WhySKALORASection";
import AIAvatarSection from "../components/AIAvatarSection";
import ProcessSection from "../components/ProcessSection";
import WhatYouGetSection from "../components/WhatYouGetSection";
import ResultsSection from "../components/ResultsSection";
import TransformationSection from "../components/TransformationSection";
import CaseStudySection from "../components/CaseStudySection";
import ForWhomSection from "../components/ForWhomSection";
import FAQSection from "../components/FAQSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";

const Index = () => {
  return (
    <div className="bg-skalora-bg min-h-screen">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ProblemsSection />
      <SolutionsSection />
      <WhySKALORASection />
      <AIAvatarSection />
      <ProcessSection />
      <WhatYouGetSection />
      <ResultsSection />
      <TransformationSection />
      <CaseStudySection />
      <ForWhomSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
