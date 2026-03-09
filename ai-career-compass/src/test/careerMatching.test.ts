import { describe, it, expect } from "vitest";
import { analyzeInterests } from "../utils/careerData";

describe("Career Matching", () => {
  it("should filter careers based on AI interests - coding example", () => {
    const result = analyzeInterests("I love coding, programming, and building software applications");
    
    // Should return relevant tech careers, not all careers
    expect(result.careers.length).toBeLessThan(20);
    
    // Top matches should be tech-related
    const topCareer = result.careers[0];
    expect(['Tech', 'Science']).toContain(topCareer.category);
  });

  it("should filter careers based on AI interests - healthcare example", () => {
    const result = analyzeInterests("I want to help people, work in hospitals, and study medicine");
    
    // Should return relevant healthcare careers
    expect(result.careers.length).toBeLessThan(20);
    
    // Top matches should be healthcare-related
    const topCareer = result.careers[0];
    expect(topCareer.category).toBe('Healthcare');
  });

  it("should show limited careers when interests are very specific", () => {
    const result = analyzeInterests("I love animals and want to be a veterinarian");
    
    // Should not show all 20 careers
    expect(result.careers.length).toBeLessThan(15);
  });

  it("should show top 10 careers when no strong matches found", () => {
    const result = analyzeInterests("I like things");
    
    // Should show at least some careers even with vague input
    expect(result.careers.length).toBeGreaterThan(0);
    expect(result.careers.length).toBeLessThanOrEqual(10);
  });
});
