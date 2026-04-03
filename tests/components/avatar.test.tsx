import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders single initial from Arabic name", () => {
    render(<Avatar name="سارة الراشد" />);
    expect(screen.getByText("س")).toBeInTheDocument();
  });

  it("renders single initial from English name", () => {
    render(<Avatar name="Sarah" />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("applies sm size classes", () => {
    const { container } = render(<Avatar name="سارة" size="sm" />);
    expect(container.firstChild).toHaveClass("h-8", "w-8");
  });

  it("applies md size classes (default)", () => {
    const { container } = render(<Avatar name="سارة" />);
    expect(container.firstChild).toHaveClass("h-10", "w-10");
  });

  it("applies lg size classes", () => {
    const { container } = render(<Avatar name="سارة" size="lg" />);
    expect(container.firstChild).toHaveClass("h-14", "w-14");
  });

  it("applies custom className", () => {
    const { container } = render(<Avatar name="سارة" className="ring-2" />);
    expect(container.firstChild).toHaveClass("ring-2");
  });

  it("returns consistent color for same name", () => {
    const { container: first } = render(<Avatar name="سارة" />);
    const { container: second } = render(<Avatar name="سارة" />);
    expect(first.firstChild?.className).toBe(second.firstChild?.className);
  });

  it("handles empty string gracefully", () => {
    const { container } = render(<Avatar name="" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
