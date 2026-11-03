// 문의 폼 메시지를 Formspree로 보낸다. 폼 ID는 공개용 식별자이며 비밀키가 아니다.
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || "mvkzqbrk";

/** 문의 메시지를 전송한다. 실패하면 오류를 던진다. */
export async function sendContactMessage({ name, email, message }) {
  const body = new FormData();
  body.append("name", name.trim());
  body.append("email", email.trim());
  body.append("message", message.trim());

  const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: "POST",
    body,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
