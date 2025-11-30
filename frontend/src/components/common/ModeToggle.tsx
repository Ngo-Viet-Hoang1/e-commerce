import useTheme from '@/hooks/useTheme'
import { ThemeSwitcher } from '../ui/shadcn-io/theme-switcher'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return <ThemeSwitcher className="w-fit" value={theme} onChange={setTheme} />
}
