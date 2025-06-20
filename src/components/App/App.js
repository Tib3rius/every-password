import React from "react";
import styled from "styled-components";
import Header from "../Header/Header";
import Scrollbar from "../Scrollbar/Scrollbar";
import PasswordDisplay from "../PasswordDisplay";
import LengthInput from "../LengthInput";
import { ASCII_COUNT, indexToPassword } from "../../../lib/passwordTools";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100svh;
  max-height: 100svh;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
`;

const HeaderAndContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const Content = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  overscroll-behavior: none;
`;

function App() {
  const [virtualPosition, setVirtualPosition] = React.useState(0n);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [targetPosition, setTargetPosition] = React.useState(null);
  const [itemsToShow, setItemsToShow] = React.useState(40);
  const [length, setLength] = React.useState(8);
  const animationRef = React.useRef(null);

  const maxIndex = React.useMemo(() => {
    return ASCII_COUNT ** BigInt(length);
  }, [length]);

  const MAX_POSITION = React.useMemo(() => {
    const itemsToShowBig = BigInt(itemsToShow);
    if (maxIndex > itemsToShowBig) {
      return maxIndex - itemsToShowBig;
    }
    return 0n;
  }, [itemsToShow, maxIndex]);

  const animateToPosition = React.useCallback(
    (targetPos) => {
      setTargetPosition(targetPos);
      setIsAnimating(true);
    },
    [setTargetPosition, setIsAnimating]
  );

  React.useEffect(() => {
    if (isAnimating && targetPosition !== null) {
      const startPosition = virtualPosition;
      const startTime = performance.now();
      const duration = 300;

      const animate = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentPos =
          startPosition +
          ((targetPosition - startPosition) * BigInt(Math.floor(easeProgress * 1000))) /
            1000n;

        setVirtualPosition(currentPos);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setVirtualPosition(targetPosition);
          setIsAnimating(false);
          setTargetPosition(null);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isAnimating, targetPosition, virtualPosition]);

  const displayedPasswords = React.useMemo(() => {
    return Array.from({ length: itemsToShow }, (_, i) => {
      const index = virtualPosition + BigInt(i);
      if (index < 0n || index >= maxIndex) {
        return null;
      }
      const password = indexToPassword(index, length);
      return { index, password };
    }).filter(Boolean);
  }, [virtualPosition, itemsToShow, length, maxIndex]);

  return (
    <>
      <LengthInput length={length} setLength={setLength} />
      <Wrapper>
        <HeaderAndContent>
          <Header />
          <Content>
            <PasswordDisplay
              itemsToShow={itemsToShow}
              setItemsToShow={setItemsToShow}
              virtualPosition={virtualPosition}
              setVirtualPosition={setVirtualPosition}
              isAnimating={isAnimating}
              MAX_POSITION={MAX_POSITION}
              animateToPosition={animateToPosition}
              displayedPasswords={displayedPasswords}
            />
          </Content>
        </HeaderAndContent>
        <Scrollbar
          virtualPosition={virtualPosition}
          MAX_POSITION={MAX_POSITION}
          animateToPosition={animateToPosition}
          setVirtualPosition={setVirtualPosition}
          setIsAnimating={setIsAnimating}
        />
      </Wrapper>
    </>
  );
}

export default App;
