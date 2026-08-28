import type { ReactNode } from "react";
import type { AboutData } from "@/types/about";
import AboutBoard from "./pinboard/AboutBoard";
import MakingBoard from "./pinboard/MakingBoard";
import MountainsBoard from "./pinboard/MountainsBoard";
import ReadingBoard from "./pinboard/ReadingBoard";
import RightNowBoard from "./pinboard/RightNowBoard";
import ClosingBoard from "./pinboard/ClosingBoard";

/**
 * Orchestrates the About page as a stack of physical boards.
 * Each board is its own ~viewport "scene"; scrolling moves the visitor from
 * one board to the next. The sheets are sticky so the effect is scroll-driven
 * without scroll-jacking; a subtle view()-driven rise gives the physical feel.
 */

function Scene({ children }: { children: ReactNode }) {
  return (
    <div className="pinboard-scene">
      <div className="pinboard-sheet">
        <div className="pinboard-board">{children}</div>
      </div>
    </div>
  );
}

export default function AboutPinboard({ about }: { about: AboutData }) {
  const { intro, making, mountains, reading, now, closing } = about;

  return (
    <div className="pinboard-root">
      <Scene>
        <AboutBoard
          eyebrow={intro.eyebrow}
          heading={intro.heading}
          text={intro.text}
          signature={intro.signature}
          image={intro.image}
          imageAlt={intro.imageAlt}
        />
      </Scene>

      <Scene>
        <MakingBoard
          heading={making.heading}
          text={making.text}
          image={making.image}
          imageAlt={making.imageAlt}
          linkLabel={making.linkLabel}
          linkUrl={making.linkUrl}
        />
      </Scene>

      <Scene>
        <MountainsBoard
          heading={mountains.heading}
          text={mountains.text}
          location={mountains.location}
          image={mountains.image}
          imageAlt={mountains.imageAlt}
        />
      </Scene>

      <Scene>
        <ReadingBoard
          heading={reading.heading}
          text={reading.text}
          bookTitle={reading.bookTitle}
          bookAuthor={reading.bookAuthor}
          bookCover={reading.bookCover}
          bookCoverAlt={reading.bookCoverAlt}
        />
      </Scene>

      <Scene>
        <RightNowBoard items={now} />
      </Scene>

      <Scene>
        <ClosingBoard
          eyebrow={closing.eyebrow}
          heading={closing.heading}
          text={closing.text}
          signature={closing.signature}
        />
      </Scene>
    </div>
  );
}
