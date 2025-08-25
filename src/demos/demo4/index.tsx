import React, {
  useState,
  useEffect,
  useTransition,
  useDeferredValue,
} from "react";
import { getListData } from "../../api";

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition(); // 使用useTransition来控制渲染的优先级
  const deferredQuery = useDeferredValue(query); // 使用useDeferredValue来延迟query的更新
  const loading = deferredQuery !== query; // 判断query是否更新

  useEffect(() => {
    if (deferredQuery !== "") {
      const fetchData = async () => {
        const res = await getListData({ name: deferredQuery });
        startTransition(() => {
          setList(res.list);
        });
      };
      fetchData();
    } else {
      setList([]);
    }
  }, [deferredQuery]);

  return (
    <div>
      <input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search...'
      />
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {list.map((item: any) => (
            <li
              key={item.id}
              style={{
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
