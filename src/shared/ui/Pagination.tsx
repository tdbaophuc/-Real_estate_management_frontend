import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ onPageChange, page, totalPages }: PaginationProps) {
  return (
    <div className="pagination">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
        Previous
      </Button>
      <span>
        Page {page + 1} of {Math.max(totalPages, 1)}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

