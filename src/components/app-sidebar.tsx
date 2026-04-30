'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bug,
  Crosshair,
  Globe,
  Server,
  Shield,
  ShieldAlert,
  Zap,
  AlertTriangle,
  Eye,
  KeyRound,
  Binary,
  Hash,
  FileText,
  LayoutDashboard,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "Reconnaissance",
    items: [
      { title: "Target Analyzer", href: "/analyze", icon: Crosshair },
      { title: "Subdomain Finder", href: "/subdomains", icon: Globe },
      { title: "DNS Recon", href: "/dns", icon: Server },
      { title: "Security Headers", href: "/headers", icon: Shield },
      { title: "WAF Detector", href: "/waf", icon: ShieldAlert },
    ],
  },
  {
    label: "Attack & Exploit",
    items: [
      { title: "Payload Generator", href: "/payloads", icon: Zap },
      { title: "CVE Lookup", href: "/cve", icon: AlertTriangle },
      { title: "Secret Scanner", href: "/secrets", icon: Eye },
    ],
  },
  {
    label: "Utilities",
    items: [
      { title: "JWT Analyzer", href: "/jwt", icon: KeyRound },
      { title: "Encoder/Decoder", href: "/encoder", icon: Binary },
      { title: "Hash Identifier", href: "/hash", icon: Hash },
    ],
  },
  {
    label: "Reporting",
    items: [
      { title: "Report Writer", href: "/report", icon: FileText },
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Bug className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-white">BugBuddy AI</span>
                  <span className="text-xs text-zinc-500">Security Assistant</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href} className="text-zinc-400 hover:text-emerald-400 data-[active=true]:text-emerald-400 data-[active=true]:bg-emerald-500/10">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1">
          <p className="text-[10px] text-zinc-600 font-mono text-center">
            v1.0.0 • For authorized use only
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
