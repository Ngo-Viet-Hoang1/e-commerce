import { TrustStrip } from '@/components/common/TrustStrip'
import Category from './Category'
import Hero from './Hero'
import PopularProducts from './PopularProducts'
import TodayBestDeal from './TodayBestDeal'

const Home = () => {
  return (
    <>
      <Hero />
      <PopularProducts />
      <Category />
      <TodayBestDeal />
      <TrustStrip />
    </>
  )
}

export default Home
