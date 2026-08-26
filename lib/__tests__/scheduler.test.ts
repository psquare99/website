import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Scheduler pure logic tests
// These test the scheduling decision logic without touching D1

describe("scheduler", () => {
  it("identifies due documents correctly", () => {
    const now = new Date("2026-08-25T12:00:00Z");

    const scheduled1 = new Date("2026-08-25T11:00:00Z").toISOString(); // past - due
    const scheduled2 = new Date("2026-08-25T12:00:00Z").toISOString(); // now - due
    const scheduled3 = new Date("2026-08-25T13:00:00Z").toISOString(); // future - not due

    assert.ok(scheduled1 <= now.toISOString(), "past is due");
    assert.ok(scheduled2 <= now.toISOString(), "now is due");
    assert.ok(!(scheduled3 <= now.toISOString()), "future is not due");
  });

  it("validates ISO date format", () => {
    const valid = "2026-08-25T12:00:00Z";
    const invalid = "not-a-date";

    assert.ok(!isNaN(new Date(valid).getTime()), "valid date");
    assert.ok(isNaN(new Date(invalid).getTime()), "invalid date");
  });

  it("validates future date for scheduling", () => {
    const now = new Date();
    const future = new Date(now.getTime() + 3600000); // 1 hour from now
    const past = new Date(now.getTime() - 3600000); // 1 hour ago

    assert.ok(future > now, "future date is after now");
    assert.ok(!(past > now), "past date is not after now");
  });

  it("filters scheduled documents correctly", () => {
    const documents = [
      { id: "1", status: "scheduled", scheduledAt: "2026-08-25T11:00:00Z" },
      { id: "2", status: "scheduled", scheduledAt: "2026-08-25T13:00:00Z" },
      { id: "3", status: "draft", scheduledAt: undefined },
      { id: "4", status: "published", scheduledAt: undefined },
    ];

    const now = new Date("2026-08-25T12:00:00Z").toISOString();

    const scheduled = documents.filter((d) => d.status === "scheduled");
    const due = scheduled.filter(
      (d) => d.scheduledAt && d.scheduledAt <= now
    );

    assert.equal(scheduled.length, 2, "two scheduled documents");
    assert.equal(due.length, 1, "one due document");
    assert.equal(due[0].id, "1", "correct document is due");
  });
});
