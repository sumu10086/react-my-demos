import React from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useWindowSize } from "../../hooks/useWindowSize";
import { useURLParams } from "../../hooks/useURLParams";

export default function CounterComponent() {
  const [count, setCount] = useLocalStorage<number>("count", 0);
  const { height, width } = useWindowSize();
  const [myParam, setMyParam] = useURLParams("myParam", "defaultValue", true);

  return (
    <>
      <div>
        <p>{count}</p>
        <button onClick={() => setCount(count - 1)}>-1</button>
        <button onClick={() => setCount(count + 1)}>+1</button>
        <button onClick={() => setCount(0)}>reset</button>
        <p>Width: {width}</p>
        <p>Height: {height}</p>
      </div>
      <div>
        <p>Current Param: {myParam}</p>
        <button onClick={() => setMyParam("333")}>Update URL Param</button>
      </div>
    </>
  );
}
