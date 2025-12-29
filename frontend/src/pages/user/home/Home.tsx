import { TrustStrip } from '@/components/common/TrustStrip'
import Category from './Category'
import Hero from './Hero'
import PopularProducts from './PopularProducts'
import TodayBestDeal from './TodayBestDeal'
import CtaSection from './CTASection'

const Home = () => {
  return (
    <>
      <Hero />
      <TrustStrip />
      <PopularProducts />
      <Category />
      <TodayBestDeal />
      <CtaSection />
    </>
  )
}

export default Home
