import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  Ref,
} from "react";

interface IProps {
  readonly List?: Array<any>;
  readonly fun?: () => void;
}

export interface IRef {
  reset: () => void;
  increment: () => void;
  setInputFocus: () => void;
}

// 子组件，使用 forwardRef 和 useImperativeHandle
const MyComponent = forwardRef((props: IProps, ref: Ref<IRef>) => {
  const [count, setCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => setCount(0),
    increment: () => {
      setCount((prev) => prev + 1);
      setCount((prev) => prev + 1);
    },
    setInputFocus: () => inputRef.current?.focus(),
  }));

  return (
    <div>
      <h1>Count: {count}</h1>
      <input
        title='input'
        ref={inputRef}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
      ></input>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </div>
  );
});

// 父组件
const ParentComponent = () => {
  const myComponentRef = useRef<IRef>(null);

  const handleReset = () => {
    myComponentRef.current!.reset();
  };

  const handleIncrement = () => {
    myComponentRef.current!.increment();
  };

  const handleInputFocus = () => {
    myComponentRef.current!.setInputFocus();
  };

  return (
    <div>
      <h2>Parent Component</h2>
      <MyComponent ref={myComponentRef} />
      <button onClick={handleReset}>Reset Count</button>
      <button onClick={handleIncrement}>Increment Count</button>
      <button onClick={handleInputFocus}>InputFocus</button>
    </div>
  );
};

export default ParentComponent;
