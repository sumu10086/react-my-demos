import { debounce } from "lodash";
import { useEffect, useState } from "react";
// import { Tabs } from "./Tabs";

export const FunctionSetting = () => {
  const [activeTab, setActiveTab] = useState<string>("live");
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
  const handleScroll = debounce(() => {
    const containerId = "content";
    if (isElementInViewport(containerId, "tab1")) {
      setActiveTab("tab1");
    } else if (isElementInViewport(containerId, "tab2")) {
      setActiveTab("tab2");
    }
  }, 100);

  useEffect(() => {
    const container = document.getElementById("content");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const tabActiveHandle = (tabActive: string) => {
    setActiveTab(tabActive);
    const targetElement = document.getElementById(tabActive);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderComponent1 = () => {
    return <div>组件1</div>;
  };

  const renderComponent2 = () => {
    return <div>组件2</div>;
  };

  return (
    <>
      {/* <Tabs activeTab={activeTab} tabActiveHandle={tabActiveHandle} /> */}
      <div id='content'>
        <div id='tab1'>{renderComponent1()}</div>
        <div id='tab2'>{renderComponent2()}</div>
      </div>
    </>
  );
};
