import React from "react";
import styled from "styled-components";
import UnstyledButton from "../UnstyledButton/UnstyledButton";
import { ClipboardCopy } from "../Icons";
import {
  SCROLLBAR_WIDTH,
  ITEM_HEIGHT,
  WIDTH_TO_SHOW_DOUBLE_HEIGHT,
  querySmallScreen,
  queryVerySmallScreen,
} from "../../../lib/constants";

const Wrapper = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  outline: none;

  --text-size: 0.875rem;

  @media ${queryVerySmallScreen} {
    --text-size: 0.75rem;
  }
`;

const List = styled.div`
  height: 100%;
  padding-bottom: 2rem;
`;

const RowWrapper = styled.div`
  display: grid;
  padding: 0.25rem 0;
  grid-template-areas: "index colon password copy copied";
  grid-template-rows: 100%;
  grid-template-columns: repeat(4, fit-content(15px));
  gap: 0.25rem 0.5rem;
  align-items: center;
  margin-left: ${SCROLLBAR_WIDTH}px;
  font-family: monospace;
  white-space: nowrap;
  font-size: var(--text-size);
  border-bottom: 1px solid var(--border-color);
  height: ${ITEM_HEIGHT}px;

  @media (hover: hover) {
    &:hover {
      background-color: var(--slate-400);
    }
  }

  background-color: var(--row-background, transparent);
  transition: background-color 0.1s ease-in-out;

  @media ${querySmallScreen} {
    grid-template-columns: repeat(2, fit-content(0));
    grid-template-areas: "index copy" "password copy";
    grid-template-rows: 50% 50%;
    height: ${ITEM_HEIGHT * 2}px;
    justify-content: center;
    gap: 0.25rem 0.5rem;
    padding: 0.5rem 0;
    margin-left: 0;
  }
`;

const BaseButton = styled(UnstyledButton)`
  height: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s ease-in-out;
  @media ${querySmallScreen} {
    height: 60%;
  }
  &:focus {
    outline: none;
    background-color: transparent;
  }
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-tap-highlight-color: transparent;
`;

const CopyButton = styled(BaseButton)`
  grid-area: copy;
  color: var(--slate-700);
  @media (hover: hover) {
    &:hover {
      color: var(--slate-900);
    }
  }
  transform: ${(props) => (props.$rowMouseDown ? "scale(0.8)" : "none")};
  &:active {
    transform: scale(0.8);
  }
`;

const CopiedText = styled.div`
  grid-area: copied;
  font-size: var(--text-size);
  color: var(--green-900);
  animation: fadeOut 0.6s ease-in both;
  user-select: none;

  @keyframes fadeOut {
    0% { opacity: 0; }
    20% { opacity: 1; }
    100% { opacity: 0; }
  }

  @media ${querySmallScreen} {
    position: absolute;
    backdrop-filter: blur(10px);
    background-color: var(--slate-100);
    border-radius: 0.5rem;
    padding: 0.5rem;
    left: 100%;
    animation: fadeOutSide 1s ease-out both;
    @keyframes fadeOutSide {
      0% { opacity: 0; transform: translateX(0); }
      30% { opacity: 1; transform: translateX(-110%); }
      50% { opacity: 1; transform: translateX(-110%); }
      100% { transform: translateX(0); }
    }
  }
`;

const Index = styled.span`
  opacity: 0.7;
  user-select: none;
`;

const Padding = styled.span`
  opacity: 0.3;
  user-select: none;
`;

const IndexWithPadding = styled.div`
  display: inline-block;
`;

const Colon = styled.span`
  grid-area: colon;
  &::after {
    content: "";
  }
  @media ${querySmallScreen} {
    display: none;
  }
`;

const PasswordText = styled.span`
  grid-area: password;
  color: var(--uuid-color);
  display: block;
  width: fit-content;
  @media ${querySmallScreen} {
    justify-self: end;
  }
`;

function Row({ index, password }) {
  const indexString = index.toString();
  const padLength = 37;
  const paddingLength = padLength - indexString.length;
  const padding = paddingLength > 0 ? "0".repeat(paddingLength) : "";
  const [mouseDown, setMouseDown] = React.useState(false);
  const [justCopied, setJustCopied] = React.useState(0);
  const timeoutRef = React.useRef(null);

  const handleCopy = React.useCallback(async () => {
    clearTimeout(timeoutRef.current);
    await navigator.clipboard
      .writeText(password)
      .catch(() => {
        setJustCopied(0);
      })
      .then(() => {
        setJustCopied((prev) => prev + 1);
        timeoutRef.current = setTimeout(() => {
          setJustCopied(0);
        }, 1000);
      });
  }, [password]);

  React.useEffect(() => {
    const handleMouseUp = () => {
      if (mouseDown) {
        setMouseDown(false);
        handleCopy();
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseDown, handleCopy]);

  return (
    <RowWrapper
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setMouseDown(true);
        }
      }}
      style={{ backgroundColor: mouseDown ? "var(--slate-500)" : null }}
    >
      <IndexWithPadding style={{ gridArea: "index" }}>
        <Padding>{padding}</Padding>
        <Index>{indexString}</Index>
      </IndexWithPadding>
      <Colon />
      <PasswordText>{password}</PasswordText>
      <CopyButton onClick={handleCopy} $rowMouseDown={mouseDown}>
        <ClipboardCopy style={{ height: "100%", aspectRatio: 1 }} />
      </CopyButton>
      {justCopied !== 0 && <CopiedText key={justCopied}>copied!</CopiedText>}
    </RowWrapper>
  );
}

function PasswordDisplay({
  itemsToShow,
  setItemsToShow,
  virtualPosition,
  setVirtualPosition,
  isAnimating,
  MAX_POSITION,
  animateToPosition,
  displayedPasswords,
}) {
  const ref = React.useRef(null);

  const movePosition = React.useCallback(
    (delta) => {
      if (isAnimating) return;
      setVirtualPosition((prev) => {
        const newPos = prev + delta;
        const ret = newPos < 0n ? 0n : newPos > MAX_POSITION ? MAX_POSITION : newPos;
        return ret;
      });
    },
    [isAnimating, MAX_POSITION, setVirtualPosition]
  );

  React.useEffect(() => {
    if (ref.current === null) return;
    const computeItemsToShow = () => {
      const rect = ref.current.getBoundingClientRect();
      const height = rect.height;
      const width = rect.width + SCROLLBAR_WIDTH;
      const showDoubleHeight = width < WIDTH_TO_SHOW_DOUBLE_HEIGHT;
      const items = Math.floor(height / (showDoubleHeight ? ITEM_HEIGHT * 2 : ITEM_HEIGHT));
      setItemsToShow(items);
    };
    computeItemsToShow();
    window.addEventListener("resize", computeItemsToShow);
    return () => {
      window.removeEventListener("resize", computeItemsToShow);
    };
  }, [setItemsToShow]);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  React.useEffect(() => {
    if (!ref.current) return;
    const handleWheel = (e) => {
      if (isAnimating) return;
      e.preventDefault();
      movePosition(BigInt(Math.floor(e.deltaY)));
    };
    ref.current.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      ref.current.removeEventListener("wheel", handleWheel);
    };
  }, [movePosition, isAnimating]);

  const handleKeyDown = React.useCallback(
    (e) => {
      if (isAnimating) return;
      const PAGE_SIZE = BigInt(itemsToShow);
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      const shiftKey = e.shiftKey;

      const handleAndPrevent = (action) => {
        e.preventDefault();
        action();
      };

      const hasKeyAndModifier = (key, modifiers = []) => {
        return e.key === key && modifiers.every((mod) => mod);
      };

      const handleKeyAndPrevent = (key, modifiers = [], action) => {
        if (hasKeyAndModifier(key, modifiers)) {
          handleAndPrevent(action);
          return true;
        }
        return false;
      };

      const animateWithDelta = (delta) => {
        let target = virtualPosition + delta;
        if (target < 0n) {
          target = 0n;
        } else if (target > MAX_POSITION) {
          target = MAX_POSITION;
        }
        animateToPosition(target);
      };

      switch (true) {
        case handleKeyAndPrevent("ArrowDown", [cmdKey], () => {
          animateWithDelta(MAX_POSITION);
        }):
          return;
        case handleKeyAndPrevent("ArrowUp", [cmdKey], () =>
          animateWithDelta(-MAX_POSITION)
        ):
          return;
        case handleKeyAndPrevent(" ", [shiftKey], () => {
          animateWithDelta(-PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent(" ", [], () => {
          animateWithDelta(PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent("PageDown", [cmdKey], () => {
          animateWithDelta(MAX_POSITION);
        }):
          return;
        case handleKeyAndPrevent("PageUp", [cmdKey], () => {
          animateWithDelta(0n);
        }):
          return;
        case handleKeyAndPrevent("PageDown", [], () => {
          animateWithDelta(PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent("PageUp", [], () => {
          animateWithDelta(-PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent("Home", [], () => animateWithDelta(0n)):
          return;
        case handleKeyAndPrevent("End", [], () =>
          animateWithDelta(MAX_POSITION)
        ):
          return;
        case handleKeyAndPrevent("ArrowDown", [], () => movePosition(1n)):
          return;
        case handleKeyAndPrevent("ArrowUp", [], () => movePosition(-1n)):
          return;
        case handleKeyAndPrevent("j", [], () => movePosition(1n)):
          return;
        case handleKeyAndPrevent("k", [], () => movePosition(-1n)):
          return;
        default:
          break;
      }
    },
    [isAnimating, virtualPosition, movePosition, MAX_POSITION, itemsToShow, animateToPosition]
  );

  return (
    <Wrapper ref={ref} onKeyDown={handleKeyDown} tabIndex={0}>
      <List>
        {displayedPasswords.map(({ index, password }, i) => (
          <Row key={i} index={index} password={password} />
        ))}
      </List>
    </Wrapper>
  );
}

export default PasswordDisplay;
