import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  timestamp: Date;
  isLast?: boolean;
}

export default function ActivityItem({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  timestamp,
  isLast = false
}: ActivityItemProps) {
  return (
    <div className={cn(
      "flex items-start relative pl-8",
      !isLast && "pb-4"
    )}>
      <div className={cn(
        "absolute left-0 p-1 rounded-full z-10 mt-0.5",
        iconBgColor
      )}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description} • {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
