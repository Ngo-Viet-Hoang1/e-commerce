import * as React from 'react'

import { NavMain } from '@/components/layouts/admin/NavMain'
import { NavProjects } from '@/components/layouts/admin/NavProjects'
import { NavUser } from '@/components/layouts/admin/NavUser'
import { TeamSwitcher } from '@/components/layouts/admin/TeamSwitcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
