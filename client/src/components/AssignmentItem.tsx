import { LucideIcon } from "lucide-react";
import { Link } from "wouter";

interface AssignmentItemProps {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  isActive: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export function AssignmentItem({
  id,
  title,
  course,
  dueDate,
  isActive,
  icon: Icon,
  iconColor,
  iconBgColor,
}: AssignmentItemProps) {
  return (
    <Link
      to={`/admin/assignments/${id}`}
      className="block p-4 bg-white dark:bg-dark-surface rounded-lg border border-light-border dark:border-dark-border hover:border-primary dark:hover:border-primary transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {course}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Due: {new Date(dueDate).toLocaleDateString()}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 