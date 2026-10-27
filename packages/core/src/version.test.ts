import { describe, expect, it } from "vitest";
import { getMajorVersion } from './version.js';

describe('getMajorVersion', () => {
  it('it extracts the version of StripeAPI', () => {
    expect(getMajorVersion("^14.2.0")).toBe(14);
    expect(getMajorVersion("~13.0.1")).toBe(13);
    expect(getMajorVersion("")).toBe(null);
    expect(getMajorVersion("latest")).toBe(null);
  })
})