/**
 * 라벨·입력칸·오류 문구를 한 묶음으로 보여주는 폼 필드.
 * 값은 부모가 state로 가지고 있고(controlled input), 바뀔 때 onChange로 알린다.
 * @param {"input"|"textarea"|"select"} [as] 입력칸 종류
 * @param {{value: string, label: string}[]} [options] select 선택지
 * @param {string} [error] 비어 있지 않으면 입력칸 아래에 오류로 표시
 */
function FormField({
  label,
  name,
  value,
  onChange,
  as = "input",
  type = "text",
  error = "",
  required = false,
  placeholder,
  options = [],
  rows = 4,
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const fieldProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>

      {as === "textarea" && <textarea rows={rows} {...fieldProps} />}
      {as === "select" && (
        <select {...fieldProps}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {as === "input" && <input type={type} {...fieldProps} />}

      <p id={errorId} className="error-message">
        {error}
      </p>
    </div>
  );
}

export default FormField;
