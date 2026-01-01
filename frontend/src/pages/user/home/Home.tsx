import { TrustStrip } from '@/components/common/TrustStrip'
import Banner from './Banner'
import BestSeller from './BestSeller'
import Category from './Category'
import Hero from './Hero'
import TodayBestDeal from './TodayBestDeal'

const Home = () => {
  return (
    <>
      <Hero />
      <TrustStrip />
      <BestSeller />
      <Category />
      <TodayBestDeal />
      <Banner />
    </>
  )
}

export default Home
