"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, ChevronsLeft, Folder, User, LogOut } from "lucide-react";
import { BmvLogo } from "@/components/icons";

import { allData } from "@/lib/data";
import type { Fazenda } from "@/lib/types";
import DashboardOverview from "@/components/app/dashboard-overview";
import FarmChecklist from "@/components/app/farm-checklist";
import AuthGuard from "@/components/auth/auth-guard";

function DashboardContent() {
  const { data: session } = useSession();
  const [selectedFarm, setSelectedFarm] = React.useState<Fazenda | null>(null);
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  const handleSelectFarm = (farm: Fazenda) => {
    setSelectedFarm(farm);
  };

  const handleGoToDashboard = () => {
    setSelectedFarm(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const user = session?.user;
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "U";

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside
        className={`relative flex-col border-r bg-background transition-all duration-300 ${
          isSidebarOpen ? "w-72" : "w-20"
        } hidden md:flex`}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a href="#" className="flex items-center gap-2 font-semibold">
              <BmvLogo className="h-8 w-8 object-contain rounded-sm" />
              {isSidebarOpen && <span className="text-primary">BMV Docs</span>}
            </a>
            <Button
              variant="outline"
              size="icon"
              className="ml-auto h-8 w-8"
              onClick={toggleSidebar}
            >
              <ChevronsLeft
                className={`h-4 w-4 transition-transform ${
                  isSidebarOpen ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Button
                variant={!selectedFarm ? "secondary" : "ghost"}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary transition-all hover:text-primary justify-start"
                onClick={handleGoToDashboard}
              >
                <Home className="h-4 w-4" />
                {isSidebarOpen && "Dashboard"}
              </Button>
              {isSidebarOpen ? (
                <Accordion type="multiple" className="w-full" defaultValue={allData.nucleos.map(n => n.id)}>
                  {allData.nucleos.map((nucleo) => (
                    <AccordionItem value={nucleo.id} key={nucleo.id}>
                      <AccordionTrigger className="text-base py-3 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Folder className="h-4 w-4" />
                          <span>{nucleo.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col space-y-1 pl-4">
                          {nucleo.fazendas.map((fazenda) => (
                            <Button
                              key={fazenda.id}
                              variant={
                                selectedFarm?.id === fazenda.id
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start font-normal"
                              onClick={() => handleSelectFarm(fazenda)}
                            >
                              {fazenda.name.replace('Fazenda ', '')}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                    aria-label="Dashboard"
                    onClick={handleGoToDashboard}
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                  {allData.nucleos.map((nucleo) => (
                    <DropdownMenu key={nucleo.id}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                          aria-label={nucleo.name}
                        >
                          <Folder className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right">
                        <DropdownMenuLabel>{nucleo.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {nucleo.fazendas.map((fazenda) => (
                          <DropdownMenuItem
                            key={fazenda.id}
                            onClick={() => handleSelectFarm(fazenda)}
                          >
                            {fazenda.name.replace('Fazenda ', '')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <div className="w-full flex-1">
            {/* Search can be implemented later */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src={user?.image || ""} alt={user?.name || "User avatar"} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || "Minha Conta"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="pr-4">
              {selectedFarm ? (
                <FarmChecklist
                  key={selectedFarm.id}
                  farm={selectedFarm}
                  onBack={handleGoToDashboard}
                />
              ) : (
                <DashboardOverview />
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
