import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment, useMemo } from 'react'
import { Link, useMatches } from 'react-router-dom'

interface BreadcrumbConfig {
  label: string
  path: string
  isLast?: boolean
}

const hiddenPaths = ['/', '/auth/login', '/auth/register', '/forbidden']

interface DynamicBreadcrumbProps {
  customLabel?: string
  className?: string
}

export default function DynamicBreadcrumb({
  customLabel,
  className = '',
}: DynamicBreadcrumbProps) {
  const matches = useMatches()

  const breadcrumbItems = useMemo(() => {
    const items: BreadcrumbConfig[] = []

    const validMatches = matches.filter((match) => {
      return (
        match.pathname !== '/' &&
        !hiddenPaths.includes(match.pathname) &&
        !match.pathname.startsWith('/auth')
      )
    })

    if (validMatches.length === 0) {
      return []
    }

    validMatches.forEach((match, index) => {
      const isLast = index === validMatches.length - 1

      let label = (match.handle as { breadcrumb?: string })?.breadcrumb

      if (!label) {
        const pathSegments = match.pathname.split('/').filter(Boolean)
        const lastSegment = pathSegments[pathSegments.length - 1]

        label = lastSegment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      if (isLast && customLabel) {
        label = customLabel
      }

      items.push({
        label,
        path: match.pathname,
        isLast,
      })
    })

    return items
  }, [matches, customLabel])

  if (breadcrumbItems.length === 0) return null

  return (
    <Breadcrumb className={`mb-6 ${className}`}>
      <BreadcrumbList>
        {/* Home link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/"
              className="flex items-center gap-1.5 transition-colors hover:text-emerald-500"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.map((item, index) => (
          <Fragment key={`${item.path}-${index}`}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="text-foreground max-w-[200px] truncate font-medium">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={item.path}
                    className="max-w-[150px] truncate transition-colors hover:text-emerald-500"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
