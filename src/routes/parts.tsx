import { createFileRoute } from "@tanstack/react-router";
import { PartsScreen } from "@/components/floor/parts-screen";

export const Route = createFileRoute("/parts")({ component: PartsScreen });
