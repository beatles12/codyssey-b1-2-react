import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { assertPublicSupabaseKey } from "./scripts/supabaseKey.js";

export default defineConfig(({ mode }) => {
  // 비밀키가 공개용 환경변수에 들어 있으면 빌드를 멈춘다. (Vercel 환경변수도 여기서 검사됨)
  assertPublicSupabaseKey(loadEnv(mode, process.cwd(), "VITE_").VITE_SUPABASE_ANON_KEY);

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.js",
    },
  };
});
