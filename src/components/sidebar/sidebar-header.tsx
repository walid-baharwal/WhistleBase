import React from "react";
import { SidebarTrigger } from "../ui/sidebar";

import ThemeSwitch from "../theme/theme-switch";
import { Separator } from "../ui/separator";

const SidebarHeader = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      </div>
      <div className="ml-auto px-4">
        <ThemeSwitch />
      </div>
    </header>
  );
};

export default SidebarHeader;
