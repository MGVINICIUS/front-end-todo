import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, CalendarDays, CheckCircle2, ArrowDownAZ } from "lucide-react"

export type SortOption = 'dueDate' | 'title' | 'completed'
export type SortDirection = 'asc' | 'desc'

interface SortButtonProps {
  currentSort: SortOption
  direction: SortDirection
  onSort: (option: SortOption, direction: SortDirection) => void
}

export function SortButton({ currentSort, direction, onSort }: SortButtonProps) {
  const toggleDirection = (option: SortOption) => {
    if (currentSort === option) {
      onSort(option, direction === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(option, 'asc')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DropdownMenuItem 
          className="focus:bg-zinc-100 dark:focus:bg-zinc-800"
          onClick={() => toggleDirection('dueDate')}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          <span>Due Date</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="focus:bg-zinc-100 dark:focus:bg-zinc-800"
          onClick={() => toggleDirection('title')}
        >
          <ArrowDownAZ className="mr-2 h-4 w-4" />
          <span>Title</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="focus:bg-zinc-100 dark:focus:bg-zinc-800"
          onClick={() => toggleDirection('completed')}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          <span>Completion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 