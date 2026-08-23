import { MapPin, Laptop, Gamepad2, BookOpen, Coffee } from "lucide-react";
import type { Heartbeat } from "@/types/heartbeat";

export const heartbeats: Heartbeat[] = [
  {
    id: "exploring-dharchula",
    icon: MapPin,
    text: "Exploring Dharchula",
    href: "/journal",
  },
  {
    id: "building-prime",
    icon: Laptop,
    text: "Building Prime",
    href: "/projects/prime",
  },
  {
    id: "designing-wayfarer",
    icon: Gamepad2,
    text: "Designing Wayfarer",
    href: "/projects/wayfarer",
  },
  {
    id: "reading-sapiens",
    icon: BookOpen,
    text: "Reading Sapiens",
    href: "/journal/the-book-that-made-me-question-everything",
  },
  {
    id: "coffee",
    icon: Coffee,
    text: "Probably making another cup of coffee.",
  },
];