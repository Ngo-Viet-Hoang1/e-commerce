import { TrustStrip } from '@/components/common/TrustStrip'
import Banner from './Banner'
import Category from './Category'
import Hero from './Hero'
import PopularProducts from './PopularProducts'
import TodayBestDeal from './TodayBestDeal'

const Home = () => {
  return (
    <>
      <Hero />
      <div className="py-8">
        <TrustStrip />
      </div>
      <PopularProducts />
      <Category />
      <TodayBestDeal />
      <Banner />
    </>
  )
}

export default Home
