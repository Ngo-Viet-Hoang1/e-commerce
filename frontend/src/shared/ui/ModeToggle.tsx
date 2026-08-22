import { useTheme } from '@/shared/hooks'
import { ThemeSwitcher } from './shadcn-io/theme-switcher'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return <ThemeSwitcher className="w-fit" value={theme} onChange={setTheme} />
}
