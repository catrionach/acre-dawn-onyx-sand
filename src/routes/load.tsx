import { createFileRoute } from "@tanstack/react-router";
import { LoadScreen } from "@/components/floor/load-screen";

export const Route = createFileRoute("/load")({ component: LoadScreen });
