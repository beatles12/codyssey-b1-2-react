-- =============================================================
-- 04. (선택) 예시 데이터 - B1-1 포트폴리오의 프로젝트 4개
-- B1-1에 있던 설명만 옮겼습니다. 역할·기간·자세한 설명은 화면에서 직접 보완하세요.
-- =============================================================

insert into public.projects (title, summary, description, category, tech_stack, github_url, image_url, is_featured)
values
  ('codyssey-b2-1-budget', '수입·지출을 기록하고 월별로 요약하는 Python 가계부 프로그램입니다.',
   '수입·지출을 기록하고 월별로 요약하는 Python 가계부 프로그램입니다. (예시 데이터 — 내용을 직접 보완하세요)',
   'development', '{Python}', 'https://github.com/beatles12/codyssey-b2-1-budget', '/images/budget.png', true),
  ('codyssey-mini-npu', '행렬 연산과 MAC 연산을 다루는 Python 미니 NPU 시뮬레이터입니다.',
   '행렬 연산과 MAC 연산을 다루는 Python 미니 NPU 시뮬레이터입니다. (예시 데이터 — 내용을 직접 보완하세요)',
   'ai', '{Python}', 'https://github.com/beatles12/codyssey-mini-npu', '/images/miniNPU.png', true),
  ('codyssey-quiz-game', '문제·정답·점수를 관리하는 Python 콘솔 퀴즈 게임입니다.',
   '문제·정답·점수를 관리하는 Python 콘솔 퀴즈 게임입니다. (예시 데이터 — 내용을 직접 보완하세요)',
   'education', '{Python}', 'https://github.com/beatles12/codyssey-quiz-game', '/images/quiz_game.png', true),
  ('codyssey', 'macOS에서 Git·Docker·Nginx 개발 환경을 직접 구성한 프로젝트입니다.',
   'macOS에서 Git·GitHub·OrbStack·Docker·Nginx를 직접 구성한 개발 워크스테이션 구축 프로젝트입니다. (예시 데이터 — 내용을 직접 보완하세요)',
   'development', '{Git,Docker,Nginx}', 'https://github.com/beatles12/codyssey', '/images/workstation.png', false);
