import useInView from "../../hooks/useInView.js";
import useTypingEffect from "../../hooks/useTypingEffect.js";

/**
 * 화면에 보이면 한 글자씩 타이핑되는 제목. 아직 안 나온 글자는 투명하게 자리를 잡아 레이아웃이 흔들리지 않는다.
 * @param {string} text 제목 (줄바꿈은 \n)
 * @param {"h1"|"h2"} [as] 제목 태그
 * @param {number} [startDelay] 보이기 시작한 뒤 타이핑 시작까지 기다릴 시간(ms)
 */
function TypingHeading({ text, as: Tag = "h2", startDelay = 0, className }) {
  const [ref, isInView] = useInView({ threshold: 0.7 });
  const typedText = useTypingEffect(text, isInView, startDelay);

  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\n/g, " ")}>
      <span aria-hidden="true">{typedText}</span>
      <span aria-hidden="true" className="typing-rest">
        {text.slice(typedText.length)}
      </span>
    </Tag>
  );
}

export default TypingHeading;
