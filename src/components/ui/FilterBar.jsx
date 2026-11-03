/**
 * 여러 선택지 중 하나를 고르는 버튼 묶음. 고른 값은 부모 state에 있다.
 * @param {{value: string, label: string}[]} options 선택지
 * @param {string} value 현재 선택된 값
 * @param {(value: string) => void} onChange 다른 선택지를 눌렀을 때 호출
 * @param {string} label 화면 낭독기용 묶음 이름
 */
function FilterBar({ options, value, onChange, label }) {
  return (
    <div className="filter-bar" role="group" aria-label={label}>
      {options.map(option => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            className={`filter-button${isActive ? " active" : ""}`}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
