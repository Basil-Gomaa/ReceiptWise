import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ReceiptText, 
  Moon, 
  Sun, 
  Settings, 
  BellRing, 
  Sparkles, 
  LogOut, 
  Upload, 
  PlusCircle 
} from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ReceiptText className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
                Receipt<span className="text-primary">Scanner</span>
              </h1>
            </div>
          </Link>
          
          {!isMobile && (
            <>
              <Separator orientation="vertical" className="mx-4 h-6" />
              <nav className="space-x-1">
                <Button variant="ghost" size="sm" className="text-sm font-medium rounded-md" asChild>
                  <Link href="/">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-sm font-medium rounded-md" asChild>
                  <Link href="/receipts">Receipts</Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-sm font-medium rounded-md" asChild>
                  <Link href="/categories">Categories</Link>
                </Button>
              </nav>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Button size="sm" className="gap-1.5 h-9 rounded-md">
              <Upload className="h-4 w-4" />
              <span>Upload Receipt</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full h-9 w-9"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 h-9 w-9">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    JS
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">John Smith</p>
                  <p className="text-xs text-muted-foreground">john.smith@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>New Receipt</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade Plan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer rounded-lg text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
