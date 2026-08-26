// About page — Waypoint content types
// The template is fixed in code; only content is editable through Admin.

export interface AboutWaypointNowItem {
  /** Lucide icon name, e.g. "Laptop", "MapPin", "BookOpen" */
  icon: string;
  /** Category label, e.g. "Building", "Exploring" */
  label: string;
  /** Value/text, e.g. "Prime", "Dharchula" */
  value: string;
}

export interface AboutData {
  intro: {
    eyebrow: string;
    heading: string;
    text: string;
    signature: string;
    image: string;
    imageAlt: string;
  };
  making: {
    heading: string;
    text: string;
    image: string;
    imageAlt: string;
    linkLabel: string;
    linkUrl: string;
  };
  mountains: {
    heading: string;
    text: string;
    location: string;
    image: string;
    imageAlt: string;
  };
  reading: {
    heading: string;
    text: string;
    bookTitle: string;
    bookAuthor: string;
    bookCover: string;
    bookCoverAlt: string;
  };
  now: AboutWaypointNowItem[];
  closing: {
    eyebrow: string;
    heading: string;
    text: string;
    signature: string;
  };
}
