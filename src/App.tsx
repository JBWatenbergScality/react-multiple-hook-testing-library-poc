import { createContext, useContext, useEffect, useState } from "react";
import "./styles.css";

const SimpleContext = createContext<{
  value: number;
  setValue: (val: number) => void;
} | null>(null);

export const useIncrementer = () => {
  const ctx = useContext(SimpleContext);
  if (!ctx) {
    throw new Error("Cant use outside provider");
  }

  useEffect(() => {
    ctx.setValue(ctx.value + 1);
  }, []);

  return ctx.value;
};

export const useSquare = () => {
  const ctx = useContext(SimpleContext);
  if (!ctx) {
    throw new Error("Cant use outside provider");
  }
  useEffect(() => {
    ctx.setValue(ctx.value ** 2);
  }, []);

  return ctx.value;
};

export function BaseProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState(0);

  return (
    <SimpleContext.Provider value={{ value, setValue }}>
      {children}
    </SimpleContext.Provider>
  );
}

export default function App() {
  return (
    <div className="App">
      <>
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
      </>
    </div>
  );
}
