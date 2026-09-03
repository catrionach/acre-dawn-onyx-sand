import { createFileRoute } from "@tanstack/react-router";
import { BuildOrderScreen } from "@/components/floor/build-order-screen";

export const Route = createFileRoute("/")({ component: BuildOrderScreen });
