"use client";

import * as React from "react";
import { BookOpen, Bot, GalleryVerticalEnd, Settings2, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

const data = {
  teams: [
    {
      name: "Whistle Base",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Cases",
      url: "#",
      icon: BookOpen,
      isActive: false,
    },
    {
      title: "Channels",
      url: "/dashboard/channels",
      icon: Bot,
      isActive: false,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userInfo } = useSession();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo?.user as User} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
