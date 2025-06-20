import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  padding: 0.5rem;
  background-color: var(--slate-50);
  z-index: 1000;
`;

const Input = styled.input`
  width: 4rem;
  font-family: monospace;
`;

function LengthInput({ length, setLength }) {
  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const clamped = Math.min(32, Math.max(1, value));
      setLength(clamped);
    }
  };
  return (
    <Wrapper>
      <label>
        Length:
        <Input type="number" min="1" max="32" value={length} onChange={handleChange} />
      </label>
    </Wrapper>
  );
}

export default LengthInput;
