import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { WhyAppFlow } from '@/components/landing/WhyAppFlow'
import { Stats } from '@/components/landing/Stats'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhyAppFlow />
        <Stats />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
