import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { MdDeleteOutline } from "react-icons/md";
import { IoAdd, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { cn } from "@/utils";

interface AnswerEditionToolbarProps extends ComponentProps<"div"> {
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAppend?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
}

export function AnswerEditionToolbar({
  className,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAppend,
  disableMoveUp,
  disableMoveDown,
}: AnswerEditionToolbarProps) {
  return (
    <div
      className={cn(
        "grid justify-center rounded border border-neutral-700 py-1",
        className
      )}
    >
      <div className="grid grid-cols-4 gap-5">
        <Button variant="transparent" size="min" onClick={onDelete}>
          <MdDeleteOutline size={18} />
        </Button>
        <Button
          variant="transparent"
          size="min"
          onClick={onMoveUp}
          disabled={disableMoveUp}
        >
          <IoChevronUp size={18} />
        </Button>
        <Button
          variant="transparent"
          size="min"
          onClick={onMoveDown}
          disabled={disableMoveDown}
        >
          <IoChevronDown size={18} />
        </Button>
        <Button variant="transparent" size="min" onClick={onAppend}>
          <IoAdd size={18} />
        </Button>
      </div>
    </div>
  );
}
