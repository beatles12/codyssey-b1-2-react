/**
 * 새 프로젝트용 UUID(v4)를 만든다.
 * https가 아닌 주소(예: 같은 와이파이의 다른 PC에서 접속)처럼 crypto.randomUUID가 없는 환경에서는 getRandomValues로 만든다.
 */
export function createProjectId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
