import { useMemo, useState } from "react";
import PlusIcon from "../icons/PlusIcon";
import { Column, CustomData, Id, Task } from "../types";
import { generateId } from "../utils";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { DataTypes } from "../constants";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const columnsId = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const createNewColumn = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: Id) => {
    const filteredColumns = columns.filter((column) => column.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(newTasks);
  };

  const updateColumnTitle = (id: Id, title: string) => {
    const updatedColumns = columns.map((column) => {
      if (column.id !== id) return column;
      return { ...column, title };
    });

    setColumns(updatedColumns);
  };

  const createTask = (columnId: Id) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (taskId: Id) => {
    const filteredTasks = tasks.filter((task) => task.id !== taskId);
    setTasks([...filteredTasks]);
  };

  const updateTask = (taskId: Id, content: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      return { ...task, content };
    });

    setTasks(updatedTasks);
  };

  const onDragStart = (event: DragStartEvent) => {
    const customData = event.active.data.current as CustomData;
    if (customData?.type === DataTypes.COLUMN) {
      setActiveColumn(customData.column as Column);
      return;
    }

    if (customData?.type === DataTypes.TASK) {
      setActiveTask(customData.task as Task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask =
      (active.data.current as CustomData)?.type === DataTypes.TASK;
    const isOverATask =
      (over.data.current as CustomData)?.type === DataTypes.TASK;

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((task) => task.id === activeId);
        const overIndex = prevTasks.findIndex((task) => task.id === overId);

        prevTasks[activeIndex].columnId = prevTasks[overIndex].columnId;

        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }

    // Dropping a task over a column
    const isOverAColumn =
      (over.data.current as CustomData)?.type === DataTypes.COLUMN;
    if (isActiveATask && isOverAColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((task) => task.id === activeId);

        prevTasks[activeIndex].columnId = overId;

        return arrayMove(prevTasks, activeIndex, activeIndex);
      });
    }
  };

  return (
    <div
      className="m-auto flex w-full min-h-screen items-center overflow-x-auto overflow-y-hidden 
    px-[40px]"
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  key={column.id}
                  column={column}
                  deleteColumn={deleteColumn}
                  updateColumnTitle={updateColumnTitle}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>

          <button
            onClick={createNewColumn}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer bg-mainBackgroundColor 
            rounded-lg border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 
            flex gap-2"
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
