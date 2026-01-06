import { TrustStrip } from '@/components/common/TrustStrip'
import Banner from './Banner'
import BestSeller from './BestSeller'
import Brand from './Brand'
import Hero from './Hero'
import TodayBestDeal from './TodayBestDeal'

const Home = () => {
  return (
    <>
      <Hero />
      <TrustStrip />
      <BestSeller />
      <Brand />
      <TodayBestDeal />
      <Banner />
    </>
  )
}

export default Home
