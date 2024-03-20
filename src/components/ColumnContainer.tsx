import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";
import { DataTypes } from "../constants";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumnTitle?: (id: Id, title: string) => void;
  tasks: Task[];
  createTask?: (columnId: Id) => void;
  deleteTask?: (taskId: Id) => void;
  updateTask?: (taskId: Id, content: string) => void;
}

const ColumnContainer: React.FC<Props> = (props) => {
  const {
    column,
    deleteColumn,
    updateColumnTitle,
    tasks,
    createTask,
    deleteTask = () => {},
    updateTask = () => {},
  } = props;
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const tasksId = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: isEditMode,
    data: { type: DataTypes.COLUMN, column },
  });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging)
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-columnBackgroundColor opacity-40 border-2 border-rose-500 
        w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      ></div>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-columnBackgroundColor w-[350px] h-[500px] max-h-[500px] rounded-md 
    flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => setIsEditMode(true)}
        className="bg-mainBackgroundColor text-base h-[60px] cursor-grab rounded-md 
      rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center 
      justify-between"
      >
        <div className="flex gap-2">
          <div
            className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 
          text-sm rounded-full"
          >
            0
          </div>
          {isEditMode ? (
            <input
              className="bg-black focus:border-rose-500 border rounded outline-none px-2"
              value={column.title}
              onChange={(event) =>
                updateColumnTitle &&
                updateColumnTitle(column.id, event.target.value)
              }
              autoFocus
              onBlur={() => setIsEditMode(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") setIsEditMode(false);
              }}
            />
          ) : (
            column.title
          )}
        </div>

        <button
          className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor 
        rounded px-1 py-2"
          onClick={() => {
            deleteColumn(column.id);
          }}
        >
          <TrashIcon />
        </button>
      </div>

      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksId}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>

      <button
        className="flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md 
      p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500
       active:bg-black"
        onClick={() => createTask && createTask(column.id)}
      >
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
};

export default ColumnContainer;
