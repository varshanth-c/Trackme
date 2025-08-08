import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Import your custom auth hook

// UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Icons
import { User as UserIcon, Settings, LogOut, LayoutDashboard } from 'lucide-react';

export function UserNav() {
  // Use your custom hook to get the user object and signOut function
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    // The AuthGuard component will automatically redirect to the login screen
  };
  
  // A helper function to get initials from a full name
  const getInitials = (name: string | null | undefined) => (name || '').split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  // If the user data hasn't been loaded yet by the hook, don't render anything.
  // The AuthGuard ensures this component only renders for authenticated users anyway.
  if (!user) {
    return null; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            {/* Use the user object from the hook */}
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
            <AvatarFallback className="text-lg bg-muted">{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {/* Use the user object from the hook */}
            <p className="text-sm font-medium leading-none">{user.full_name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* The onClick handler now calls the signOut function from the hook */}
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
