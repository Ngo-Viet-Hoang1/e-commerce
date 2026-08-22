import * as React from 'react'

import { NavMain } from '@/widgets/admin-sidebar/NavMain'
import { NavProjects } from '@/widgets/admin-sidebar/NavProjects'
import { NavUser } from '@/widgets/admin-sidebar/NavUser'
import { TeamSwitcher } from '@/widgets/admin-sidebar/TeamSwitcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/shared/ui/sidebar'

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
