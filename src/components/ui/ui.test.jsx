import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Button from "./Button.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import DataStatus from "./DataStatus.jsx";
import EmptyState from "./EmptyState.jsx";
import ErrorState from "./ErrorState.jsx";
import FilterBar from "./FilterBar.jsx";
import FormField from "./FormField.jsx";
import LoadingState from "./LoadingState.jsx";
import SectionHeading from "./SectionHeading.jsx";
import TagList from "./TagList.jsx";
import Toast from "./Toast.jsx";

describe("Button", () => {
  it("클릭하면 onClick을 호출한다", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>저장</Button>);

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("isLoading이면 비활성화되고 진행 중 문구를 보여준다", () => {
    render(
      <Button isLoading loadingText="저장 중...">
        저장
      </Button>,
    );

    const button = screen.getByRole("button", { name: "저장 중..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("variant에 따라 클래스가 바뀐다", () => {
    render(<Button variant="danger">삭제</Button>);
    expect(screen.getByRole("button")).toHaveClass("button", "button-danger");
  });

  it("to가 있으면 링크로 그린다", () => {
    render(
      <MemoryRouter>
        <Button to="/projects" icon="→">
          목록
        </Button>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /목록/ })).toHaveAttribute("href", "/projects");
  });
});

describe("FormField", () => {
  function ControlledField(props) {
    const [value, setValue] = useState("");
    return (
      <>
        <FormField label="제목" name="title" value={value} onChange={e => setValue(e.target.value)} {...props} />
        <output>{value}</output>
      </>
    );
  }

  it("입력값이 부모 state로 반영된다 (controlled input)", async () => {
    render(<ControlledField />);

    await userEvent.type(screen.getByLabelText("제목"), "시간한끗");

    expect(screen.getByRole("status")).toHaveTextContent("시간한끗");
  });

  it("error가 있으면 오류 문구를 보여주고 입력칸과 연결한다", () => {
    render(<ControlledField error="제목을 입력하세요." required />);

    const input = screen.getByRole("textbox", { name: /제목/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("제목을 입력하세요.");
  });

  it("as 값에 따라 textarea와 select를 그린다", () => {
    const options = [
      { value: "planning", label: "기획" },
      { value: "ai", label: "AI" },
    ];
    render(
      <>
        <FormField label="설명" name="description" as="textarea" value="" onChange={() => {}} />
        <FormField label="분류" name="category" as="select" options={options} value="ai" onChange={() => {}} />
      </>,
    );

    expect(screen.getByLabelText("설명").tagName).toBe("TEXTAREA");
    expect(screen.getByRole("combobox", { name: "분류" })).toHaveValue("ai");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});

describe("상태 컴포넌트", () => {
  it("LoadingState는 기본 문구를 보여준다", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중입니다.");
  });

  it("ErrorState는 onRetry가 있을 때만 다시 시도 버튼을 보여준다", async () => {
    const handleRetry = vi.fn();
    const { rerender } = render(<ErrorState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<ErrorState onRetry={handleRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("EmptyState는 message와 action을 보여준다", () => {
    render(<EmptyState message="아직 프로젝트가 없습니다." action={<button>등록</button>} />);
    expect(screen.getByText("아직 프로젝트가 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "등록" })).toBeInTheDocument();
  });
});

describe("DataStatus", () => {
  const renderStatus = props =>
    render(
      <DataStatus isLoading={false} error={null} {...props}>
        <p>실제 내용</p>
      </DataStatus>,
    );

  it("로딩 중이면 로딩 화면만 보여준다", () => {
    renderStatus({ isLoading: true, error: "무시됨" });
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("오류가 있으면 오류 화면을 보여준다", () => {
    renderStatus({ error: "네트워크 오류" });
    expect(screen.getByRole("alert")).toHaveTextContent("네트워크 오류");
  });

  it("비어 있으면 빈 화면을 보여준다", () => {
    renderStatus({ isEmpty: true });
    expect(screen.getByText("표시할 데이터가 없습니다.")).toBeInTheDocument();
  });

  it("문제가 없으면 children을 보여준다", () => {
    renderStatus({});
    expect(screen.getByText("실제 내용")).toBeInTheDocument();
  });
});

describe("FilterBar", () => {
  it("누른 선택지 값을 onChange로 알리고 선택된 버튼을 표시한다", async () => {
    function Example() {
      const [value, setValue] = useState("all");
      const options = [
        { value: "all", label: "전체" },
        { value: "ai", label: "AI" },
      ];
      return <FilterBar label="분류 필터" options={options} value={value} onChange={setValue} />;
    }
    render(<Example />);

    await userEvent.click(screen.getByRole("button", { name: "AI" }));

    expect(screen.getByRole("button", { name: "AI" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("TagList", () => {
  it("태그 수만큼 항목을 그린다", () => {
    render(<TagList tags={["React", "Supabase"]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("태그가 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(<TagList tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SectionHeading", () => {
  it("as로 제목 단계를 바꿀 수 있다", () => {
    render(<SectionHeading eyebrow="ABOUT" title="소개" as="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "소개" })).toBeInTheDocument();
  });
});

describe("Toast", () => {
  afterEach(() => vi.useRealTimers());

  it("message가 없으면 숨긴다", () => {
    const { container } = render(<Toast message="" onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("duration이 지나면 onClose를 호출한다", () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    render(<Toast message="저장했습니다." onClose={handleClose} duration={2000} />);

    expect(screen.getByRole("status")).toHaveTextContent("저장했습니다.");
    act(() => vi.advanceTimersByTime(2000));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("error 타입은 alert로 알린다", () => {
    render(<Toast message="실패했습니다." type="error" onClose={() => {}} />);
    expect(screen.getByRole("alert")).toHaveClass("toast-error");
  });
});

describe("ConfirmDialog", () => {
  const baseProps = {
    title: "프로젝트 삭제",
    message: "정말 삭제할까요?",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  afterEach(() => vi.clearAllMocks());

  it("open이 false면 그리지 않는다", () => {
    render(<ConfirmDialog {...baseProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("확인·취소·Esc가 각각 알맞은 함수를 호출한다", async () => {
    render(<ConfirmDialog {...baseProps} open />);

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    await userEvent.keyboard("{Escape}");

    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(baseProps.onCancel).toHaveBeenCalledTimes(2);
  });

  it("열리면 창으로 포커스가 가고, Tab은 창 안에서만 돌며, 닫히면 원래 버튼으로 돌아온다", async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>열기</button>
          <ConfirmDialog {...baseProps} open={open} cancelLabel="Cancel" onCancel={() => setOpen(false)} />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    const opener = screen.getByRole("button", { name: "열기" });

    await user.click(opener);
    expect(screen.getByRole("dialog")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("진행 중이면 버튼이 비활성화되고 Esc로 닫히지 않는다", async () => {
    render(<ConfirmDialog {...baseProps} open isLoading />);

    expect(screen.getByRole("button", { name: "삭제 중..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");

    expect(baseProps.onCancel).not.toHaveBeenCalled();
  });
});
