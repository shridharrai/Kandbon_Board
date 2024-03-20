import { SortableData } from "@dnd-kit/sortable";
import { DataTypes } from "./constants";

export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

export type MetaData = {
  type: DataTypes;
  column?: Column;
  task?: Task;
};

export type CustomData = SortableData & MetaData;

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
};
