// 引入Mock.js
const Mock = require("mockjs");
const Random = Mock.Random;

export const listData = Mock.mock("/api/list", "post", (options) => {
  // 获取查询参数，例如页码、每页数量等
  const {
    page = 1,
    pageSize = 10000,
    name,
    title,
  } = JSON.parse(options.body) || {};
  // 生成20到60条数据
  const data = Mock.mock({
    "list|500-1000": [
      {
        id: "@increment()",
        name: "@cname",
        title: "@ctitle",
        content: "@cparagraph",
        add_time: "@date(yyyy-MM-dd hh:mm:ss)",
      },
    ],
  }).list;

  // 基于页码和每页数量来计算需要返回的数据
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  // 截取对应页的数据
  const result = data.slice(startIndex, endIndex);

  // 根据查询条件进行过滤
  const filteredData = result.filter((item) => {
    return true;
    // return (
    //   (!name || item.name.includes(name)) && // 根据 name 过滤
    //   (!title || item.title.includes(title)) // 根据 title 过滤
    // );
  });

  return {
    list: filteredData,
    total: filteredData.length, // 返回过滤后的数据总数
  };
});
