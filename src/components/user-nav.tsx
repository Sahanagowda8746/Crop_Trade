'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext, UserRole, Language } from '@/context/app-context';
import { User, Users, Check, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles: UserRole[] = ['Farmer', 'Buyer', 'Transporter', 'Admin'];
const languages: Language[] = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam'];


export function UserNav() {
  const { role, setRole, language, setLanguage } = useAppContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://avatar.vercel.sh/${role}.png`} alt={role} />
            <AvatarFallback>{role.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Current Role</p>
            <p className="text-xs leading-none text-muted-foreground">
              {role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
          {roles.map(r => (
            <DropdownMenuItem key={r} onSelect={() => setRole(r)} disabled={r === role}>
              <User className="mr-2 h-4 w-4" />
              <span>{r}</span>
              {r === role && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Language</DropdownMenuLabel>
           {languages.map(l => (
            <DropdownMenuItem key={l} onSelect={() => setLanguage(l)} disabled={l === language}>
              <Languages className="mr-2 h-4 w-4" />
              <span>{l}</span>
              {l === language && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    