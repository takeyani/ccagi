import { describe, it, expect } from "vitest";
import { calculateAge, isAdult, parseDateOfBirth } from "@/lib/age";

describe("calculateAge", () => {
  it("returns exact age on birthday", () => {
    const dob = new Date("2000-06-15T00:00:00");
    const today = new Date("2020-06-15T12:00:00");
    expect(calculateAge(dob, today)).toBe(20);
  });

  it("returns age - 1 on the day before birthday", () => {
    const dob = new Date("2000-06-15T00:00:00");
    const today = new Date("2020-06-14T23:59:59");
    expect(calculateAge(dob, today)).toBe(19);
  });

  it("handles leap-year births correctly (Feb 29 → treated Mar 1 in non-leap)", () => {
    const dob = new Date("2000-02-29T00:00:00");
    const today = new Date("2021-02-28T00:00:00");
    expect(calculateAge(dob, today)).toBe(20);
  });

  it("returns 0 on the day of birth", () => {
    const dob = new Date("2024-01-10T00:00:00");
    const today = new Date("2024-01-10T00:00:00");
    expect(calculateAge(dob, today)).toBe(0);
  });
});

describe("isAdult", () => {
  it("returns true on exact 20th birthday", () => {
    const dob = new Date("2000-01-01T00:00:00");
    const today = new Date("2020-01-01T00:00:00");
    expect(isAdult(dob, 20, today)).toBe(true);
  });

  it("returns false one day before 20th birthday", () => {
    const dob = new Date("2000-06-15T00:00:00");
    const today = new Date("2020-06-14T00:00:00");
    expect(isAdult(dob, 20, today)).toBe(false);
  });

  it("returns false for future date of birth", () => {
    const dob = new Date("2030-01-01T00:00:00");
    const today = new Date("2026-04-17T00:00:00");
    expect(isAdult(dob, 20, today)).toBe(false);
  });

  it("supports custom minAge (18)", () => {
    const dob = new Date("2008-04-17T00:00:00");
    const today = new Date("2026-04-17T00:00:00");
    expect(isAdult(dob, 18, today)).toBe(true);
    expect(isAdult(dob, 20, today)).toBe(false);
  });
});

describe("parseDateOfBirth", () => {
  it("parses valid YYYY-MM-DD", () => {
    const d = parseDateOfBirth("1990-06-15");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(1990);
    expect(d!.getMonth()).toBe(5);
    expect(d!.getDate()).toBe(15);
  });

  it("rejects invalid format", () => {
    expect(parseDateOfBirth("1990/06/15")).toBeNull();
    expect(parseDateOfBirth("90-6-15")).toBeNull();
    expect(parseDateOfBirth("")).toBeNull();
  });

  it("rejects non-existent dates (Feb 30)", () => {
    expect(parseDateOfBirth("2000-02-30")).toBeNull();
  });

  it("rejects out-of-range months", () => {
    expect(parseDateOfBirth("2000-13-01")).toBeNull();
    expect(parseDateOfBirth("2000-00-01")).toBeNull();
  });
});
