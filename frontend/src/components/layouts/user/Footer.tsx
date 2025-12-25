import { Link } from "react-router-dom";
import {
  Layers,
  LifeBuoy,
  Share2,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { useCategories } from "@/pages/admin/CategoryMangement/category.queries";

const FOOTER_CATEGORY_PARAMS = {
  page: 1,
  limit: 6,
};

export default function Footer() {
  const { data, isLoading } = useCategories(FOOTER_CATEGORY_PARAMS);
  const categories = data?.data ?? [];

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-lg font-semibold">TechStore</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Chuyên cung cấp điện thoại, laptop và thiết bị công nghệ chính hãng.
            </p>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Danh mục</h3>
            </div>

            <ul className="mt-3 space-y-2 text-sm">
              {isLoading && (
                <>
                  <li className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <li className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <li className="h-4 w-28 rounded bg-muted animate-pulse" />
                </>
              )}

              {!isLoading && categories.length === 0 && (
                <li className="text-muted-foreground">
                  Chưa có danh mục
                </li>
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

          {/* Support */}
          <div>
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-muted-foreground" />
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

          {/* Social */}
          <div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Kết nối</h3>
            </div>

            <div className="mt-4 flex gap-4 text-muted-foreground">
              <Facebook className="h-5 w-5 hover:text-foreground transition" />
              <Instagram className="h-5 w-5 hover:text-foreground transition" />
              <Twitter className="h-5 w-5 hover:text-foreground transition" />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 TechStore. All rights reserved.</p>
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
  );
}