import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type ExportLayoutFixture = {
  targetType: "book" | "article";
  sdCardRoot: string;
  libraryRootDirectory: string;
  targetDirectory: string;
  outputFileExtension: string;
  relativePathTemplate: string;
  exampleSourceTitle: string;
  exampleSanitizedSlug: string;
  exampleOutputPath: string;
};

const root = path.resolve(import.meta.dirname, "../..");
const exportLayoutDir = path.join(root, "fixtures", "expected", "export-layout");
const requiredTargets = ["book", "article"] as const;

function readLayoutFixture(target: (typeof requiredTargets)[number]): ExportLayoutFixture {
  return JSON.parse(
    fs.readFileSync(path.join(exportLayoutDir, `${target}.json`), "utf8"),
  ) as ExportLayoutFixture;
}

describe("Export layout fixtures", () => {
  it("includes book and article layout fixture files", () => {
    for (const target of requiredTargets) {
      expect(fs.existsSync(path.join(exportLayoutDir, `${target}.json`))).toBe(true);
    }
  });

  it("locks target path templates with an inline snapshot baseline", () => {
    const layouts = Object.fromEntries(
      requiredTargets.map((target) => [target, readLayoutFixture(target)]),
    );

    expect(layouts).toMatchInlineSnapshot(`
      {
        "article": {
          "exampleOutputPath": "/books/articles/momentum-in-two-minutes.rsvp",
          "exampleSanitizedSlug": "momentum-in-two-minutes",
          "exampleSourceTitle": "Momentum In Two Minutes",
          "libraryRootDirectory": "books",
          "outputFileExtension": ".rsvp",
          "relativePathTemplate": "books/articles/{sanitized-slug}.rsvp",
          "sdCardRoot": "/",
          "targetDirectory": "books/articles",
          "targetType": "article",
        },
        "book": {
          "exampleOutputPath": "/books/books/deep-work-session-notes.rsvp",
          "exampleSanitizedSlug": "deep-work-session-notes",
          "exampleSourceTitle": "Deep Work Session Notes",
          "libraryRootDirectory": "books",
          "outputFileExtension": ".rsvp",
          "relativePathTemplate": "books/books/{sanitized-slug}.rsvp",
          "sdCardRoot": "/",
          "targetDirectory": "books/books",
          "targetType": "book",
        },
      }
    `);
  });

  it("uses example outputs consistent with target directories", () => {
    for (const target of requiredTargets) {
      const layout = readLayoutFixture(target);
      const expectedSuffix = `${layout.targetDirectory}/${layout.exampleSanitizedSlug}${layout.outputFileExtension}`;

      expect(layout.exampleOutputPath.startsWith("/")).toBe(true);
      expect(layout.exampleOutputPath.endsWith(expectedSuffix)).toBe(true);
      expect(layout.relativePathTemplate.startsWith(`${layout.targetDirectory}/`)).toBe(true);
    }
  });
});
