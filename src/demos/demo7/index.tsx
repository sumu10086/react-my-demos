import React, { useEffect, useRef } from "react";
import { Spin } from "antd";
import InfiniteScroll from "react-infinite-scroll-component";
import { useListStore } from "./store/list";
import { getDataList, refreshDataList } from "./store/list/action";

export default function DataList() {
  const { dataList, total, getListLoading, hasMore, refreshLoading } =
    useListStore();

  const clearDataListTimer = useRef<() => void>(() => { });

  const init = async () => {
    await getDataList();

    const dataListTimer = await refreshDataList();
    clearDataListTimer.current = () => {
      clearInterval(dataListTimer);
    };
  };

  useEffect(() => {
    (async () => {
      await init();
    })();
    return () => {
      clearDataListTimer.current();
    };
  }, []);

  return (
    <div>
      <h2>Data List total: {total}</h2>
      {refreshLoading && <p>Refreshing...</p>}
      {hasMore && !getListLoading && (
        <button onClick={getDataList}>Click：Load More</button>
      )}
      <div id='list' style={{ height: "400px", overflowY: "auto" }}>
        <Spin spinning={getListLoading}>
          <InfiniteScroll
            dataLength={dataList.length}
            next={getDataList}
            hasMore={!!hasMore}
            loader={null}
            scrollableTarget={"list"}
          >
            {dataList.map((item) => (
              <div key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </InfiniteScroll>
          {!dataList.length && <p>No data</p>}
        </Spin>
      </div>
    </div>
  );
}
