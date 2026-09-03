import { createFileRoute } from "@tanstack/react-router";
import { ShippingScreen } from "@/components/floor/shipping-screen";

export const Route = createFileRoute("/shipping")({ component: ShippingScreen });
