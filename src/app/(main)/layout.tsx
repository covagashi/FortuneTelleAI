// src/app/(main)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import {
  MessageSquare,
  Home,
  BookCheck,
  BrainCircuit,
  Settings,
  Loader2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HerLogo } from "@/components/ui/her-logo";
import { useLanguage } from "@/hooks/use-language";
import { useCapacitor } from "@/hooks/use-capacitor";


export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { dict } = useLanguage();
  useCapacitor(); // Initialize Capacitor hooks

  const menuItems = [
    { href: `/home`, label: dict.mainLayout.sidebar.home, icon: Home },
    { href: `/chat`, label: dict.mainLayout.sidebar.chat, icon: MessageSquare },
    { href: `/summary`, label: dict.mainLayout.sidebar.summary, icon: BookCheck },
    { href: `/memory`, label: dict.mainLayout.sidebar.memory, icon: BrainCircuit },
    { href: `/settings`, label: dict.mainLayout.sidebar.settings, icon: Settings },
  ];

  const getPageTitle = () => {
    // Special case for offline page, which is not in the menu
    if (pathname === '/offline') {
      return dict.common.offlineErrorTitle;
    }
    const currentItem = menuItems.find(item => pathname.startsWith(item.href));
    return currentItem ? currentItem.label : dict.mainLayout.defaultTitle;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background/50">
      <Sidebar>
        <SidebarHeader>
           <Link href="/" className="block">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/50">
                  <AvatarFallback className="bg-transparent text-primary">
                    <HerLogo className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-lg font-headline tracking-tight text-foreground">
                    {dict.mainMenu.reflections.title}
                  </span>
                  <span className="text-sm font-body text-muted-foreground">{dict.mainLayout.subtitle}</span>
                </div>
              </div>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  size="lg"
                >
                  <Link href={item.href} onClick={handleLinkClick}>
                    <item.icon className="h-5 w-5" />
                    <span className="font-body">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col w-full">
        <header className="flex h-14 items-center gap-4 border-b border-primary/20 bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
             <h1 className="text-xl font-headline md:text-2xl">{getPageTitle()}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-transparent overflow-auto">
          <Suspense fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
