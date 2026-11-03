import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppProviders from "../AppProviders.jsx";

/** 실제 앱과 같은 전역 Provider와 라우터로 감싸서 렌더링한다. */
export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders>{ui}</AppProviders>
    </MemoryRouter>,
  );
}
