import { render, waitFor } from "@testing-library/react";
import {
  FunctionComponent,
  PropsWithChildren,
  useState,
  useEffect,
} from "react";
import { act } from "react-dom/test-utils";
import { useIncrementer, useSquare, BaseProvider } from "./App";

const wrapper = ({ children }: PropsWithChildren<Record<string, never>>) => (
  <BaseProvider>{children}</BaseProvider>
);

function prepareRenderMultipleHooks(options: {
  wrapper: FunctionComponent<PropsWithChildren<Record<string, never>>>;
}): { renderHook: (key: string, callback: () => unknown) => {} } {
  const RENDER_HOOK_EVENT = "RENDER_HOOK_EVENT";

  function TestComponents({
    addValues,
  }: {
    addValues: (vals: { key: string; value: unknown }[]) => void;
  }) {
    const [components, setComponents] = useState<JSX.Element[]>([]);

    useEffect(() => {
      const listener = (
        e: CustomEvent<{ key: string; callback: () => unknown }>
      ) => {
        function TestComponent() {
          const hook = e.detail.callback();

          useEffect(() => {
            addValues([{ key: e.detail.key, value: hook }]);
          });
          return <></>;
        }
        act(() => {
          setComponents((prev) => [...prev, <TestComponent />]);
        });
      };
      //@ts-ignore
      window.addEventListener(RENDER_HOOK_EVENT, listener);
      return () => {
        //@ts-ignore
        window.removeEventListener(RENDER_HOOK_EVENT, listener);
      };
    }, []);

    return (
      <>
        {components.map((c, i) => {
          return <div key={i}>{c}</div>;
        })}
      </>
    );
  }
  const values: { key: string; value: unknown }[] = [];
  render(
    <options.wrapper>
      <TestComponents
        addValues={(vals) => {
          values.unshift(...vals);
        }}
      />
    </options.wrapper>
  );

  return {
    renderHook: (key: string, callback: () => void) => {
      const event = new CustomEvent(RENDER_HOOK_EVENT, {
        detail: { key, callback },
      });
      //@ts-ignore
      window.dispatchEvent(event);
      return {
        result: new Proxy(values, {
          get: (target, prop) => {
            if (prop === "current") {
              return target.find((v) => v.key === key)?.value;
            }
            if (prop === "all") {
              return target.filter((v) => v.key === key).map((v) => v.value);
            }
          },
        }),
        waitFor: waitFor,
      };
    },
  };
}

describe("useIncrementer and useSquare hooks", () => {
  it("should increment and square the value", async () => {
    const { renderHook } = prepareRenderMultipleHooks({ wrapper });

    const { result } = renderHook("inc", () => useIncrementer());

    expect(result.current).toBe(1);

    const { result: result2 } = renderHook("inc", () => useIncrementer());
    expect(result.current).toBe(2);

    const { result: result3 } = renderHook("square", () => useSquare());

    expect(result3.current).toBe(4);
  });
});
