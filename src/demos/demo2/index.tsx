// FunctionSetting.tsx
import { useEffect, useState } from "react";
import { Tabs } from "./Tabs";
import { debounce } from "lodash";
import React from "react";

const CONSTANTS = {
  CONTENT_ID: "content",
  TABS: [
    {
      key: "tab1",
      label: "tab1",
    },
    {
      key: "tab2",
      label: "tab2",
    },
  ],
};

export default function FunctionSetting() {
  const [activeTab, setActiveTab] = useState<string>(CONSTANTS.TABS[1].key);

  // 默认执行一遍
  useEffect(() => {
    tabActiveHandle(activeTab);
  }, [activeTab]);

  // 滚动函数
  const handleScroll = debounce(() => {
    const containerId = CONSTANTS.CONTENT_ID;
    const reversedTabs = [...Object.values(CONSTANTS.TABS)].reverse();
    // 使用循环检查每个 tab 是否在视口中
    for (const tab of reversedTabs) {
      if (isElementInViewport(containerId, tab.key)) {
        setActiveTab(tab.key);
        break; // 找到第一个符合条件的 tab，跳出循环
      }
    }
  }, 100);

  // 滚动条监听
  useEffect(() => {
    const container = document.getElementById(CONSTANTS.CONTENT_ID);
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // 判断元素是否在容器内
  const isElementInViewport = (boxId: string, elId: string) => {
    const container = document.getElementById(boxId);
    const el = document.getElementById(elId);
    if (container && el) {
      const containerRect = container.getBoundingClientRect() || {
        top: 0,
        bottom: 0,
      };
      const rect = el.getBoundingClientRect();
      return (
        rect.top < containerRect.bottom && rect.bottom >= containerRect.top
      );
    }
    return false;
  };

  // 执行滚动到具体tab
  const tabActiveHandle = (tabActive: string) => {
    setActiveTab(tabActive);
    const targetElement = document.getElementById(tabActive);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 组件1
  const renderComponent1 = () => {
    const data = [];
    for (let i = 1; i <= 10; i++) {
      data.push(`数据项 ${i}`);
    }
    return (
      <div>
        <h3>组件1</h3>
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  // 组件2
  const renderComponent2 = () => {
    return (
      <div>
        <h3>组件2</h3>
        <ul>
          <li>123</li>
        </ul>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "200px",
        backgroundColor: "ghostwhite",
      }}
    >
      <Tabs
        tabs={CONSTANTS.TABS}
        activeTab={activeTab}
        tabActiveHandle={tabActiveHandle}
      />
      <div
        id={CONSTANTS.CONTENT_ID}
        style={{
          flex: 1,
          overflowY: "auto",
          height: "100%",
          paddingLeft: "33px",
        }}
      >
        <div id={CONSTANTS.TABS[0].key}>{renderComponent1()}</div>
        <div id={CONSTANTS.TABS[1].key}>{renderComponent2()}</div>
      </div>
    </div>
  );
}
