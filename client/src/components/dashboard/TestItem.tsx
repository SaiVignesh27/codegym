import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TestItemProps {
  id: string;
  title: string;
  course: string;
  questionCount: number;
  isActive: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
}

export default function TestItem({
  id,
  title,
  course,
  questionCount,
  isActive,
  icon: Icon,
  iconColor,
  iconBgColor,
  onEdit,
  onToggleStatus,
  onDelete
}: TestItemProps) {
  return (
    <div className="flex items-center p-3 border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border">
      <div className={cn("p-2 rounded-md", iconBgColor)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{course} • {questionCount} questions</p>
      </div>
      
      <div className="flex items-center">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          isActive 
            ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" 
            : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
        )}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              aria-label="More options"
              className="ml-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
            )}
            {/* {onToggleStatus && (
              <DropdownMenuItem onClick={onToggleStatus}>
                {isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
            )} */}
            {onDelete && (
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400"
                onClick={onDelete}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
