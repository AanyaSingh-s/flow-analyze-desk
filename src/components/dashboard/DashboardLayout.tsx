import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  sidebar: ReactNode;
  title?: string;
  description?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  className?: string;
  contentWrapperClassName?: string;
};

const DashboardLayout = ({
  sidebar,
  title,
  description,
  children,
  headerActions,
  className,
  contentWrapperClassName,
}: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full text-foreground">
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar/90 backdrop-blur">
          <SidebarContent>{sidebar}</SidebarContent>
        </Sidebar>
        <SidebarRail />
        <SidebarInset className={cn("bg-transparent", contentWrapperClassName)}>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur">
            <SidebarTrigger className="-ml-2" />
            <div className="flex flex-1 flex-col">
              {title ? <h1 className="text-lg font-semibold">{title}</h1> : null}
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {headerActions}
          </header>
          <main className={cn("flex-1 overflow-y-auto p-6", className)}>{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

