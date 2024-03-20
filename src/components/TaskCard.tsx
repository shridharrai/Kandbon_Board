import { useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Id, Task } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DataTypes } from "../constants";

interface Props {
  task: Task;
  deleteTask: (taskId: Id) => void;
  updateTask: (taskId: Id, content: string) => void;
}

const TaskCard: React.FC<Props> = (props) => {
  const { task, deleteTask, updateTask } = props;
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: DataTypes.TASK, task },
    disabled: isEditMode,
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
    setIsMouseOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] rounded-xl 
      border-2 border-rose-500 cursor-grab"
      />
    );
  }

  return (
    <>
      {isEditMode ? (
        <div
          className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left 
          rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab"
        >
          <textarea
            className="h-[90%] w-full resize-none border-none rounded bg-transparent
           text-white focus:outline-none"
            value={task.content}
            placeholder="Task content here"
            autoFocus
            onChange={(e) => updateTask(task.id, e.target.value)}
            onBlur={toggleEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) toggleEditMode();
            }}
          ></textarea>
        </div>
      ) : (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] flex items-center text-left 
          rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
          onClick={toggleEditMode}
          onMouseEnter={() => setIsMouseOver(true)}
          onMouseLeave={() => setIsMouseOver(false)}
        >
          <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
            {task.content}
          </p>

          {isMouseOver && (
            <button
              className="stroke-white absolute right-4 top-1/2 -translate-y-1/2
               bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100"
              onClick={() => deleteTask && deleteTask(task.id)}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default TaskCard;
