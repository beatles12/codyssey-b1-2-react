import { act, renderHook, waitFor } from "@testing-library/react";
import useProject from "./useProject.js";
import useProjectActions from "./useProjectActions.js";
import useProjects from "./useProjects.js";
import { AppError } from "../lib/errors.js";
import * as api from "../lib/projectsApi.js";
import { mockProjects } from "../test/mockProjects.js";

vi.mock("../lib/projectsApi.js");

describe("useProjects", () => {
  it("처음엔 로딩, 성공하면 목록을 돌려준다", async () => {
    api.fetchProjects.mockResolvedValue(mockProjects);
    const { result } = renderHook(() => useProjects());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.projects).toHaveLength(2);
    expect(result.current.error).toBe("");
  });

  it("실패하면 오류 key를 돌려주고 reload로 다시 요청한다", async () => {
    api.fetchProjects.mockRejectedValueOnce(new AppError("config")).mockResolvedValueOnce(mockProjects);
    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.error).toBe("errors.config"));
    act(() => result.current.reload());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.projects).toHaveLength(2));
    expect(api.fetchProjects).toHaveBeenCalledTimes(2);
  });
});

describe("useProject", () => {
  it("id가 바뀌면 그 id로 다시 불러온다", async () => {
    api.fetchProjectById.mockImplementation(async id => mockProjects.find(project => project.id === id));
    const { result, rerender } = renderHook(({ id }) => useProject(id), { initialProps: { id: mockProjects[0].id } });

    await waitFor(() => expect(result.current.project?.title).toBe("시간 관리 도우미"));
    rerender({ id: mockProjects[1].id });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.project?.title).toBe("코딩 교육 커리큘럼"));
  });
});

describe("useProjectActions", () => {
  it("실행 중에는 isSubmitting이 true이고 성공 결과를 돌려준다", async () => {
    let finish;
    api.createProject.mockImplementation(() => new Promise(resolve => (finish = resolve)));
    const { result } = renderHook(() => useProjectActions());

    let promise;
    act(() => {
      promise = result.current.create({ title: "새 프로젝트" });
    });
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      finish(mockProjects[0]);
      expect(await promise).toEqual(mockProjects[0]);
    });
    expect(result.current.isSubmitting).toBe(false);
  });

  it("실패하면 null을 돌려주고 error를 채운다", async () => {
    api.deleteProject.mockRejectedValue(new AppError("notChanged"));
    const { result } = renderHook(() => useProjectActions());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove("p1");
    });

    expect(outcome).toBeNull();
    expect(result.current.error).toBe("errors.notChanged");
  });
});
