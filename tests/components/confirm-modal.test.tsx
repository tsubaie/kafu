import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

afterEach(cleanup);

describe("ConfirmModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmModal open={false} title="test" confirmLabel="ok" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title and description when open", () => {
    render(
      <ConfirmModal open={true} title="حذف الكفو" description="هل أنت متأكد؟" confirmLabel="حذف" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText("حذف الكفو")).toBeInTheDocument();
    expect(screen.getByText("هل أنت متأكد؟")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal open={true} title="test" confirmLabel="تأكيد" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText("تأكيد"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal open={true} title="test" confirmLabel="تأكيد" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText("إلغاء"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("shows loading text when loading", () => {
    render(
      <ConfirmModal open={true} title="test" confirmLabel="حذف" loading={true} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText("جارٍ...")).toBeInTheDocument();
  });
});
