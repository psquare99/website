import Image from "next/image";
import type { JournalEntry } from "@/types/journal";

const content = (
  <>
    <p>
      paragraph above the image so that the image goes below it
    </p>

    <p>
      <strong>A monsoon is a seasonal shift in the direction of prevailing winds, resulting in major changes in precipitation</strong>. Driven by temperature differences between landmasses and oceans, summer monsoons bring moisture-laden air and heavy rains, while winter monsoons carry dry air from continental interiors.
    </p>

    <p>
      <strong>What Causes a Monsoon</strong>
    </p>

    <ul>
      <li>
        <p>
          <strong>Land vs. Sea Heating:</strong> Land heats up much faster than water during warmer months, creating low-pressure zones over continents that pull in cool, heavy air from the ocean. [1]
        </p>
      </li>
      <li>
        <p>
          <strong>Wind Reversal:</strong> Summer winds blow from sea to land carrying moisture; winter winds reverse and blow from land to sea producing drier conditions. [1, 2, 3]
        </p>
      </li>
      <li>
        <p>
          <strong>Topography:</strong> Mountain ranges like the Himalayas block or redirect wind and moisture, shaping regional climate patterns. [1]
        </p>
      </li>
    </ul>

    <figure className="mx-auto my-12 max-w-2xl">
      <div className="overflow-hidden rounded-2xl">
        <Image
          src="/images/journal/reflection/image-layout-test/frontier-valley.jpg"
          alt="monsoon clouds in valley"
          width={4592}
          height={8160}
          className="h-auto w-full object-cover"
        />
      </div>
      <figcaption className="mt-2.5 font-sans text-sm text-neutral-500">
        dharchula in monsoon
      </figcaption>
    </figure>

    <p>
      the paragraph below the image, above this is the test image
    </p>

    <p>
      <strong>Major Global Monsoons</strong>
    </p>

    <ul>
      <li>
        <p>
          <strong>South Asian / Indian Monsoon:</strong> The world's most prominent system, bringing heavy southwest rains from June to September vital for regional agriculture. [1, 2]
        </p>
      </li>
      <li>
        <p>
          <strong>North American Monsoon:</strong> Affects northwestern Mexico and the southwestern United States from mid-June through September. [1]
        </p>
      </li>
      <li>
        <p>
          <strong>West African and Australian Systems:</strong> Driven by similar equatorial shifts in atmospheric circulation and the Intertropical Convergence Zone. [1]
        </p>
      </li>
    </ul>

    <p>
      <strong>Impact and Climate Changes</strong>
    </p>

    <ul>
      <li>
        <p>
          <strong>Agriculture and Economy:</strong> Monsoon rains supply crucial water for crops, making crop yields heavily dependent on the timing and volume of rainfall. [1, 2, 3]
        </p>
      </li>
      <li>
        <p>
          <strong>Extreme Weather:</strong> Higher ocean temperatures and global warming add more moisture to the atmosphere, increasing the frequency of intense flooding, landslides, and shifting rainfall patterns.
        </p>
      </li>
    </ul>
  </>
);

export const imagelayouttest: JournalEntry = {
  slug: "image-layout-test",

  title: "Image Layout Test",

  excerpt: "",

  published: "2026-08-08",

  category: "reflection",

  paper: "cream",

  readingTime: "2 min",

  content,

  status: "draft",
};
