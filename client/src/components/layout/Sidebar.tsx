import React from 'react';
import { Link, useLocation } from 'wouter';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/providers/AuthProvider';
import { Code, Users, School, VideoIcon, FileQuestion, ClipboardList, Trophy, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: {
    count: number;
    color: string;
  };
  isActive: boolean;
}

const NavItem = ({ href, icon, label, badge, isActive }: NavItemProps) => {
  return (
    <li>
      <Link href={href}>
        <a className={cn(
          "flex items-center px-3 py-2 rounded-md transition-colors",
          isActive 
            ? "text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-dark-border" 
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border"
        )}>
          <span className="w-5 h-5 mr-3">{icon}</span>
          <span>{label}</span>
          {badge && (
            <span className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full text-white",
              badge.color
            )}>
              {badge.count}
            </span>
          )}
        </a>
      </Link>
    </li>
  );
};

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
}

const NavSection = ({ title, children }: NavSectionProps) => {
  return (
    <>
      <p className="px-3 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">{title}</p>
      <ul className="space-y-1">
        {children}
      </ul>
    </>
  );
};

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { isAdmin, isStudent } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 transition-all transform bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border shadow-lg md:relative",
      isSidebarOpen ? "md:translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-light-border dark:border-dark-border">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white">
              <Code className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-heading text-primary dark:text-white">CodeGym</span>
          </a>
        </Link>
        <button 
          onClick={closeSidebar}
          className="p-1 rounded-full md:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <span className="sr-only">Close sidebar</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation area */}
      <div className="py-4 px-3 h-full overflow-y-auto">
        {isAdmin && (
          <>
            <NavSection title="Main">
              <NavItem 
                href="/admin/dashboard" 
                icon={<Code className="text-primary" />}
                label="Dashboard" 
                isActive={isActive("/admin/dashboard")} 
              />
              <NavItem 
                href="/admin/users" 
                icon={<Users />}
                label="Users" 
                isActive={isActive("/admin/users")} 
              />
              <NavItem 
                href="/admin/courses" 
                icon={<School />}
                label="Courses" 
                isActive={isActive("/admin/courses")} 
              />
              <NavItem 
                href="/admin/classes" 
                icon={<VideoIcon />}
                label="Classes" 
                isActive={isActive("/admin/classes")} 
              />
              <NavItem 
                href="/admin/tests" 
                icon={<FileQuestion />}
                label="Tests" 
                isActive={isActive("/admin/tests")} 
              />
              <NavItem 
                href="/admin/assignments" 
                icon={<ClipboardList />}
                label="Assignments" 
                isActive={isActive("/admin/assignments")} 
              />
              <NavItem 
                href="/admin/leaderboard" 
                icon={<Trophy />}
                label="Leaderboard" 
                isActive={isActive("/admin/leaderboard")} 
              />
            </NavSection>

            <NavSection title="Account">
              <NavItem 
                href="/admin/profile" 
                icon={<User />}
                label="Profile" 
                isActive={isActive("/admin/profile")} 
              />
              {/* <NavItem 
                href="/admin/settings" 
                icon={<Settings />}
                label="Settings" 
                isActive={isActive("/admin/settings")} 
              /> */}
              <NavItem 
                href="/logout" 
                icon={<LogOut />}
                label="Logout" 
                isActive={false} 
              />
            </NavSection>
          </>
        )}

        {isStudent && (
          <>
            <NavSection title="Learning">
              <NavItem 
                href="/student/dashboard" 
                icon={<Code />}
                label="Dashboard" 
                isActive={isActive("/student/dashboard")} 
              />
              <NavItem 
                href="/student/courses" 
                icon={<School />}
                label="My Courses" 
                isActive={isActive("/student/courses")} 
              />
              <NavItem 
                href="/student/daily-tests" 
                icon={<FileQuestion />}
                label="Daily Tests" 
                isActive={isActive("/student/daily-tests")} 
              />
              <NavItem 
                href="/student/assignments" 
                icon={<ClipboardList />}
                label="Assignments" 
                isActive={isActive("/student/assignments")} 
              />
              <NavItem 
                href="/student/leaderboard" 
                icon={<Trophy />}
                label="Leaderboard" 
                isActive={isActive("/student/leaderboard")} 
              />
            </NavSection>

            <NavSection title="Account">
              <NavItem 
                href="/student/profile" 
                icon={<User />}
                label="Profile" 
                isActive={isActive("/student/profile")} 
              />
              <NavItem 
                href="/logout" 
                icon={<LogOut />}
                label="Logout" 
                isActive={false} 
              />
            </NavSection>
          </>
        )}
      </div>
    </aside>
  );
}
