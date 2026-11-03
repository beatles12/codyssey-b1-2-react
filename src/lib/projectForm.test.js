import { EMPTY_PROJECT_FORM, parseTechStack, toFormValues, toProjectInput, validateProjectForm } from "./projectForm.js";
import { mockProjects } from "../test/mockProjects.js";

const validForm = { ...EMPTY_PROJECT_FORM, title: "제목", summary: "요약", description: "설명" };

describe("projectForm", () => {
  it("빈 폼은 필수값 오류를 낸다", () => {
    expect(validateProjectForm(EMPTY_PROJECT_FORM)).toEqual({
      title: "validation.titleRequired",
      summary: "validation.summaryRequired",
      description: "validation.descriptionRequired",
    });
  });

  it("공백만 입력해도 비어 있는 것으로 본다", () => {
    expect(validateProjectForm({ ...validForm, title: "   " }).title).toBe("validation.titleRequired");
  });

  it("글자 수 제한과 URL 형식을 검사한다", () => {
    const errors = validateProjectForm({ ...validForm, title: "가".repeat(61), summary: "나".repeat(121), githubUrl: "github.com/x" });
    expect(errors).toEqual({ title: "validation.titleTooLong", summary: "validation.summaryTooLong", githubUrl: "validation.urlInvalid" });
  });

  it("올바른 폼은 오류가 없다 (이미지는 사이트 안 경로도 허용)", () => {
    expect(validateProjectForm({ ...validForm, demoUrl: "https://demo.example.com", imageUrl: "/images/budget.png" })).toEqual({});
  });

  it("이미지 주소가 형식에 맞지 않으면 오류를 낸다", () => {
    expect(validateProjectForm({ ...validForm, imageUrl: "budget.png" }).imageUrl).toBe("validation.imageUrlInvalid");
  });

  it("기술 스택 문자열을 공백·중복 없이 배열로 바꾼다", () => {
    expect(parseTechStack(" React,Supabase , React,, ")).toEqual(["React", "Supabase"]);
  });

  it("프로젝트 ↔ 폼 값을 바꿔도 내용이 유지된다", () => {
    const values = toFormValues(mockProjects[0]);
    expect(values.techStack).toBe("React, Supabase");
    expect(toProjectInput(values)).toMatchObject({ title: mockProjects[0].title, techStack: ["React", "Supabase"], isFeatured: true });
  });
});
