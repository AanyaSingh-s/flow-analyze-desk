import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useUploadHistory } from "@/contexts/UploadHistoryContext";
import { FlaskConical, History, LayoutDashboard, LogOut, PauseCircle, Upload } from "lucide-react";

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const { history, paused, togglePause } = useUploadHistory();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3">
          <div className="rounded-md bg-primary/20 p-2">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">Flow Analyze Desk</span>
            <span className="text-xs text-muted-foreground">Equipment Insights Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#overview" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#uploads" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload CSV</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>History Controls</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3 text-sm">
            <div className="flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">Pause history</span>
                <span className="text-xs text-muted-foreground">Stop recording new uploads</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="history-pause" className="sr-only">
                Pause upload history
              </Label>
              <Switch id="history-pause" checked={paused} onCheckedChange={togglePause} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background p-3 text-sm">
            <span>Total uploads</span>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="rounded-lg border border-border/50 bg-background p-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user?.email ?? "Guest"}</span>
            <span className="text-xs text-muted-foreground">Logged in</span>
          </div>
        </div>
        <Button variant="ghost" className="justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </>
  );
};

export default DashboardSidebar;

