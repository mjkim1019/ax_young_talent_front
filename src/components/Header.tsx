import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, User } from "lucide-react";

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              PM
            </div>
            <span className="text-xl font-medium">promptMate</span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={() => onNavigate('home')}
            >
              Home
            </Button>
            <Button
              variant={currentView === 'create' ? 'default' : 'ghost'}
              onClick={() => onNavigate('create')}
            >
              Create Prompt
            </Button>
            <Button
              variant={currentView === 'templates' ? 'default' : 'ghost'}
              onClick={() => onNavigate('templates')}
            >
              Templates
            </Button>
            <Button
              variant={currentView === 'profile' ? 'default' : 'ghost'}
              onClick={() => onNavigate('profile')}
            >
              My Profile
            </Button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search prompts..."
              className="w-64 bg-muted rounded-lg border-0 pl-10 pr-4 py-2 text-sm"
            />
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}