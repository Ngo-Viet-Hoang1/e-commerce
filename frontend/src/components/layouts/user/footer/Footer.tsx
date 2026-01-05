import { Link } from 'react-router-dom'
import {
  Layers,
  LifeBuoy,
  Share2,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react'
import { useCategories } from '@/pages/admin/CategoryMangement/category.queries'
import CtaSection from './CTASection'

const FOOTER_CATEGORY_PARAMS = {
  page: 1,
  limit: 6,
}

export default function Footer() {
  const { data, isLoading } = useCategories(FOOTER_CATEGORY_PARAMS)
  const categories = data?.data ?? []

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold">TechStore</h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm sm:mx-0">
              Chuyên cung cấp điện thoại, laptop và thiết bị công nghệ chính
              hãng.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Layers className="text-muted-foreground h-4 w-4" />
              <h3 className="text-sm font-semibold">Danh mục</h3>
            </div>

            <ul className="mt-3 space-y-2 text-sm">
              {isLoading && (
                <>
                  <li className="bg-muted mx-auto h-4 w-24 animate-pulse rounded sm:mx-0" />
                  <li className="bg-muted mx-auto h-4 w-20 animate-pulse rounded sm:mx-0" />
                  <li className="bg-muted mx-auto h-4 w-28 animate-pulse rounded sm:mx-0" />
                </>
              )}

              {!isLoading && categories.length === 0 && (
                <li className="text-muted-foreground">Chưa có danh mục</li>
              )}

              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <LifeBuoy className="text-muted-foreground h-4 w-4" />
              <h3 className="text-sm font-semibold">Hỗ trợ</h3>
            </div>

            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Vận chuyển & giao hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Share2 className="text-muted-foreground h-4 w-4" />
              <h3 className="text-sm font-semibold">Kết nối</h3>
            </div>

            <div className="text-muted-foreground mt-4 flex justify-center gap-6 sm:justify-start">
              <Facebook className="hover:text-foreground h-6 w-6 transition" />
              <Instagram className="hover:text-foreground h-6 w-6 transition" />
              <Twitter className="hover:text-foreground h-6 w-6 transition" />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-10">
          <CtaSection />
        </div>

        <div className="text-muted-foreground mt-4 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm sm:mt-12 md:flex-row">
          <p className="text-center md:text-left">
            © 2025 TechStore. All rights reserved.
          </p>

          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-foreground transition">
              Điều khoản
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition">
              Quyền riêng tư
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
