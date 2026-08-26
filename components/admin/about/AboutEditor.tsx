"use client";

import { useState, useCallback } from "react";
import type { AboutData } from "@/types/about";
import AboutSection from "./AboutSection";
import AboutNowItems from "./AboutNowItems";
import ImageUpload from "@/components/admin/editor/ImageUpload";

interface AboutEditorProps {
  initial: AboutData;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AboutEditor({ initial }: AboutEditorProps) {
  const [data, setData] = useState<AboutData>(initial);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const update = useCallback(
    <K extends keyof AboutData>(section: K, field: keyof AboutData[K], value: unknown) => {
      setData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
      setSaveStatus("idle");
    },
    []
  );

  async function handleSave() {
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }

  const inputClass =
    "w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500";
  const textareaClass =
    "w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 resize-y";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">About Page</h1>
        <div className="flex items-center gap-4">
          {saveStatus === "saved" && (
            <span className="text-sm text-green-600">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">Error saving</span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saveStatus === "saving" ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Introduction */}
      <AboutSection title="01 — Introduction">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Eyebrow</label>
            <input
              type="text"
              value={data.intro.eyebrow}
              onChange={(e) => update("intro", "eyebrow", e.target.value)}
              placeholder="ABOUT"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Heading</label>
            <input
              type="text"
              value={data.intro.heading}
              onChange={(e) => update("intro", "heading", e.target.value)}
              placeholder="A little about me."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Text</label>
            <textarea
              value={data.intro.text}
              onChange={(e) => update("intro", "text", e.target.value)}
              rows={4}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Signature</label>
            <input
              type="text"
              value={data.intro.signature}
              onChange={(e) => update("intro", "signature", e.target.value)}
              placeholder="Prateek"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Portrait</label>
            <ImageUpload
              value={data.intro.image}
              onChange={(url) => update("intro", "image", url)}
              label="Portrait image"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image alt text</label>
            <input
              type="text"
              value={data.intro.imageAlt}
              onChange={(e) => update("intro", "imageAlt", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </AboutSection>

      {/* Making Things */}
      <AboutSection title="02 — Making Things">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Heading</label>
            <input
              type="text"
              value={data.making.heading}
              onChange={(e) => update("making", "heading", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={data.making.text}
              onChange={(e) => update("making", "text", e.target.value)}
              rows={4}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
            <ImageUpload
              value={data.making.image}
              onChange={(url) => update("making", "image", url)}
              label="Making things image"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image alt text</label>
            <input
              type="text"
              value={data.making.imageAlt}
              onChange={(e) => update("making", "imageAlt", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Link label</label>
              <input
                type="text"
                value={data.making.linkLabel}
                onChange={(e) => update("making", "linkLabel", e.target.value)}
                placeholder="See projects"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Link URL</label>
              <input
                type="text"
                value={data.making.linkUrl}
                onChange={(e) => update("making", "linkUrl", e.target.value)}
                placeholder="/projects"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </AboutSection>

      {/* Mountains */}
      <AboutSection title="03 — Mountains">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Heading</label>
            <input
              type="text"
              value={data.mountains.heading}
              onChange={(e) => update("mountains", "heading", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={data.mountains.text}
              onChange={(e) => update("mountains", "text", e.target.value)}
              rows={4}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location line</label>
            <input
              type="text"
              value={data.mountains.location}
              onChange={(e) => update("mountains", "location", e.target.value)}
              placeholder="Dharchula, Kumaon"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>
            <ImageUpload
              value={data.mountains.image}
              onChange={(url) => update("mountains", "image", url)}
              label="Mountains image"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image alt text</label>
            <input
              type="text"
              value={data.mountains.imageAlt}
              onChange={(e) => update("mountains", "imageAlt", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </AboutSection>

      {/* Reading */}
      <AboutSection title="04 — Reading">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Heading</label>
            <input
              type="text"
              value={data.reading.heading}
              onChange={(e) => update("reading", "heading", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={data.reading.text}
              onChange={(e) => update("reading", "text", e.target.value)}
              rows={4}
              className={textareaClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current book</label>
              <input
                type="text"
                value={data.reading.bookTitle}
                onChange={(e) => update("reading", "bookTitle", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Author</label>
              <input
                type="text"
                value={data.reading.bookAuthor}
                onChange={(e) => update("reading", "bookAuthor", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Book cover</label>
            <ImageUpload
              value={data.reading.bookCover}
              onChange={(url) => update("reading", "bookCover", url)}
              label="Book cover"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cover alt text</label>
            <input
              type="text"
              value={data.reading.bookCoverAlt}
              onChange={(e) => update("reading", "bookCoverAlt", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </AboutSection>

      {/* Right Now */}
      <AboutSection title="05 — Right Now">
        <p className="mb-3 text-xs text-gray-500">
          Available icons: Laptop, MapPin, BookOpen, Headphones, Coffee, Lightbulb, Compass, Gamepad2, Music, Camera, PenTool, Code, Globe, Heart, Star
        </p>
        <AboutNowItems
          items={data.now}
          onChange={(now) => {
            setData((prev) => ({ ...prev, now }));
            setSaveStatus("idle");
          }}
        />
      </AboutSection>

      {/* Closing */}
      <AboutSection title="06 — Closing">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Eyebrow</label>
            <input
              type="text"
              value={data.closing.eyebrow}
              onChange={(e) => update("closing", "eyebrow", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Heading</label>
            <input
              type="text"
              value={data.closing.heading}
              onChange={(e) => update("closing", "heading", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Text</label>
            <textarea
              value={data.closing.text}
              onChange={(e) => update("closing", "text", e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Signature</label>
            <input
              type="text"
              value={data.closing.signature}
              onChange={(e) => update("closing", "signature", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </AboutSection>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
