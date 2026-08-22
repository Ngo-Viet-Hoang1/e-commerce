import { TrustStrip } from '@/shared/ui/TrustStrip'
import {
  Hero,
  BestSeller,
  Brand,
  TodayBestDeal,
  Banner,
} from '@/widgets/home'

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
