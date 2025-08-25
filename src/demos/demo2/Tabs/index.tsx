// Tabs.tsx
import React from "react";
import classNames from "classnames";
import "./index.scss";

interface IProps {
  readonly tabs: Array<Itab>;
  readonly activeTab: string;
  readonly tabActiveHandle: (tabActive: string) => void;
}

interface Itab {
  readonly key: string;
  readonly label: string;
}

export const Tabs = (props: IProps) => {
  const tabsChange = (key: string) => {
    props.tabActiveHandle(key);
  };

  return (
    <div className='setting-tab'>
      {props.tabs.map((item, i) => (
        <div
          key={i}
          onClick={() => tabsChange(item.key)}
          className={classNames(
            "tabs",
            props.activeTab === item.key && "tabs-active"
          )}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};
