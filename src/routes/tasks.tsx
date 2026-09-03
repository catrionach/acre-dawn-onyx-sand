import { createFileRoute } from "@tanstack/react-router";
import { TasksScreen } from "@/components/floor/tasks-screen";

export const Route = createFileRoute("/tasks")({
  component: TasksScreen,
});
