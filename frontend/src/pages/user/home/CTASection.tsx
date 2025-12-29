import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const CtaSection = () => {
  return (
    <section className="w-full py-16 sm:py-24">
      <div className="space-y-6 py-6 sm:py-8">
        <div className="space-y-2 text-center">
          <h2 className="text-4xl font-bold">Subscribe to Our Community</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Get exclusive access to cutting-edge tech insights, industry trends,
            and expert advice delivered straight to your inbox. Join our growing
            community today!
          </p>
        </div>

        <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
          <Input type="email" placeholder="Enter your email here" />
          <Button className="cursor-pointer">Join Now</Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="*:ring-background flex -space-x-2 *:size-8 *:ring-2">
            <Avatar className="bg-muted">
              <AvatarImage
                src="https://notion-avatars.netlify.app/api/avatar?preset=male-1"
                alt="User 1"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="bg-muted">
              <AvatarImage
                src="https://notion-avatars.netlify.app/api/avatar?preset=female-5"
                alt="User 2"
              />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar className="bg-muted">
              <AvatarImage
                src="https://notion-avatars.netlify.app/api/avatar?preset=male-2"
                alt="User 3"
              />
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
            <Avatar className="bg-muted">
              <AvatarImage
                src="https://notion-avatars.netlify.app/api/avatar?preset=female-3"
                alt="User 4"
              />
              <AvatarFallback>DG</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-sm">5,000+ happy members</span>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
