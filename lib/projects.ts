export type ProjectSlug = "palm-court" | "bay-window" | "tide-house";

export type ProjectNote = {
  id: string;
  title: string;
  observation?: string;
  text: string;
  image: string;
  alt: string;
  width: number;
  height: number;
  crop?: { x: number; y: number; width: number; height: number };
};

export type Project = {
  slug: ProjectSlug;
  title: string;
  category: string;
  description: string;
  image: string;
  alt: string;
  width: number;
  height: number;
  seoDescription: string;
  opening: string;
  question: string;
  response: string;
  notes: ProjectNote[];
  palette: string[];
  closing: string;
  next: ProjectSlug;
};

export const projects: Project[] = [
  {
    slug: "palm-court",
    title: "Palm Court",
    category: "Living room & dining / Residential study",
    description:
      "A room for conversation, with enough separation to let the day unfold around it.",
    image: "/images/palm-court.webp",
    alt: "A blue sofa and leather chair face a low timber table, with a courtyard window, slatted screen and dark shelves around the room.",
    width: 1536,
    height: 1024,
    seoDescription:
      "An imagined living and dining room shaped by filtered daylight, a timber screen and the objects of everyday life. A JBX Web Studio concept study.",
    opening:
      "Palm Court imagines a living room with a little space between activities, and a strong sense of connection between them. A courtyard provides the daylight. The room’s layers decide how that light is lived with.",
    question:
      "How can living and dining feel connected without becoming one undifferentiated space?",
    response:
      "A timber screen establishes an edge, a blue sofa grounds the seating area, and dark shelving gives the room somewhere to hold its ordinary objects. The proposal is a home that feels composed without needing to be cleared of life.",
    notes: [
      {
        id: "light",
        title: "Light, softened",
        observation:
          "Sheer curtains sit between the bright courtyard and the places to settle.",
        text: "The curtain filters the edge of the daylight without closing the room away from the garden. The intention is a gentler place to read, with the changing light still part of the room.",
        image: "/images/palm-court-light.webp",
        alt: "Filtered courtyard light falls through sheer curtains beside the leather reading chair.",
        width: 800,
        height: 600,
        crop: { x: 0, y: 60, width: 800, height: 600 },
      },
      {
        id: "layout",
        title: "Together, with room",
        observation:
          "A timber screen gives the dining area an edge while keeping it connected.",
        text: "The vertical screen marks the dining space without making a solid wall. You can read the two areas separately while still seeing light and activity beyond. It is separation with a sense of company.",
        image: "/images/palm-court-layout.webp",
        alt: "Timber slats separate the blue sofa from the dining area while leaving glimpses through the room.",
        width: 800,
        height: 600,
        crop: { x: 360, y: 50, width: 800, height: 600 },
      },
      {
        id: "material",
        title: "A place for the ordinary",
        observation:
          "Open shelves leave room for books and the objects used every day.",
        text: "The dark joinery gives the light room a quieter, heavier edge. Books and useful ceramics sit within the composition, so the room does not depend on everything being put away to feel considered.",
        image: "/images/palm-court-material.webp",
        alt: "Books and ceramics sit in open dark timber shelves beside the blue sofa.",
        width: 686,
        height: 514,
        crop: { x: 850, y: 40, width: 686, height: 514 },
      },
    ],
    palette: ["Filtered daylight", "Mineral-blue upholstery", "Dark timber"],
    closing:
      "A room can make space for company and still leave somewhere quiet to settle.",
    next: "bay-window",
  },
  {
    slug: "bay-window",
    title: "Bay Window",
    category: "Breakfast corner / Residential study",
    description:
      "A sunny corner becomes a place to stay a little longer. Built-in seating brings breakfast, reading and the everyday pile of books into one small space.",
    image: "/images/bay-window.webp",
    alt: "A blue window bench with striped cushions sits beside a rounded timber table and a tall bookcase.",
    width: 1024,
    height: 1536,
    seoDescription:
      "An imagined breakfast and reading corner where a window seat, compact table and nearby shelves make a small space useful. A JBX concept study.",
    opening:
      "Bay Window begins with a simple possibility: the brightest corner of the home could become more than a place to pass through. This study brings a table, a window seat and a collection of books into the same daily orbit.",
    question: "How much life can a small corner hold without feeling crowded?",
    response:
      "Seating follows the window instead of filling the floor with extra chairs. A rounded table keeps its edge gentle, and the dark shelf gives books and familiar objects a place close by.",
    notes: [
      {
        id: "light",
        title: "Stay by the light",
        text: "The seat sits directly beside the window. The arrangement makes the view and the daylight part of an ordinary breakfast, while cushions give the built-in bench a softer place to settle.",
        image: "/images/bay-window-light.webp",
        alt: "Daylight reaches a blue built-in window seat with striped cushions.",
        width: 494,
        height: 1000,
        crop: { x: 530, y: 120, width: 494, height: 1000 },
      },
      {
        id: "table",
        title: "A softer edge",
        text: "The rounded table meets the bench without introducing another hard corner into the space. Its compact shape gives the chair a clear place and lets the window seat remain the visual anchor.",
        image: "/images/bay-window-table.webp",
        alt: "A rounded timber table sits between the window bench and a curved chair.",
        width: 720,
        height: 720,
        crop: { x: 20, y: 680, width: 720, height: 720 },
      },
      {
        id: "shelf",
        title: "Books within reach",
        text: "The tall shelf holds the objects that give the corner a daily use beyond mealtimes. Dark timber frames the lighter wall and fabric, so the collection reads as part of the room rather than an afterthought.",
        image: "/images/bay-window-shelf.webp",
        alt: "A narrow dark timber bookcase holds books and ceramics beside the breakfast corner.",
        width: 360,
        height: 900,
        crop: { x: 0, y: 0, width: 360, height: 900 },
      },
    ],
    palette: ["Mineral-blue seating", "Striped linen", "Warm timber"],
    closing: "Sometimes a whole new routine begins with a better place to sit.",
    next: "tide-house",
  },
  {
    slug: "tide-house",
    title: "Tide House",
    category: "Kitchen & dining / Residential study",
    description:
      "Cooking and gathering share the same room. A grounded material palette gives each area its own character without interrupting the conversation.",
    image: "/images/tide-house.webp",
    alt: "A pale-stone kitchen island with timber cabinetry opens toward a dining table beside a large window.",
    width: 1536,
    height: 1024,
    seoDescription:
      "An imagined kitchen and dining room connected by warm timber, pale stone and a shared view of daily life. A JBX Web Studio concept study.",
    opening:
      "Tide House imagines the kitchen and dining table as parts of the same conversation. Warm timber and pale stone recur across the room, while each working surface and gathering place keeps its own clear identity.",
    question: "How can the kitchen belong to the room without taking it over?",
    response:
      "The island is given a quiet, grounded form. Recessed blue-gray cabinetry sits behind it, while the dining table brings the warmer timber forward. The framed opening connects the two areas without making them visually identical.",
    notes: [
      {
        id: "island",
        title: "A grounded center",
        text: "Pale stone wraps the island while dark timber gives its front a warm, substantial edge. The pairing establishes a working center without adding a second unrelated palette to the room.",
        image: "/images/tide-house-island.webp",
        alt: "Pale stone wraps a substantial kitchen island with a dark timber front.",
        width: 890,
        height: 600,
        crop: { x: 90, y: 300, width: 890, height: 600 },
      },
      {
        id: "table",
        title: "Space for the table",
        text: "The dining area keeps its own foreground and its own texture. A timber table, woven seats and a linen napkin bring a softer scale to the larger kitchen surfaces beyond.",
        image: "/images/tide-house-table.webp",
        alt: "A timber dining table, woven chair and linen napkin occupy the foreground of the kitchen.",
        width: 836,
        height: 484,
        crop: { x: 700, y: 540, width: 836, height: 484 },
      },
      {
        id: "frame",
        title: "Connection through a frame",
        text: "The large opening allows the kitchen to stay visible from the dining side. The timber edge makes that connection legible, while the recessed cabinetry gives the eye a quieter place to rest.",
        image: "/images/tide-house-frame.webp",
        alt: "A tall timber-framed opening separates the kitchen and dining area without closing the view.",
        width: 520,
        height: 800,
        crop: { x: 860, y: 0, width: 520, height: 800 },
      },
    ],
    palette: ["Pale stone", "Blue-gray cabinetry", "Warm timber"],
    closing:
      "A shared room works best when its different moments still have a place of their own.",
    next: "palm-court",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
