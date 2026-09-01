import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        iconSrc="/icons/icons8-star.svg"
        title="أول كفو في الطريق!"
        description="ابدأ بإرسال كفو لزملاءك."
      />
    );
    expect(screen.getByText("أول كفو في الطريق!")).toBeInTheDocument();
    expect(screen.getByText("ابدأ بإرسال كفو لزملاءك.")).toBeInTheDocument();
  });

  it("renders icon image", () => {
    const { container } = render(
      <EmptyState
        iconSrc="/icons/icons8-trophy.svg"
        title="test"
        description="desc"
      />
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/icons/icons8-trophy.svg");
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState
        iconSrc="/icons/icons8-star.svg"
        title="test"
        description="desc"
        className="mt-10"
      />
    );
    expect(container.firstChild).toHaveClass("mt-10");
  });
});
