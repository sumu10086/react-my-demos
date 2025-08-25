// 引入axios
import axios from "axios";

// 配置axios
// axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.timeout = 5000;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

// 请求拦截器
axios.interceptors.request.use((config) => {
  // 在发送请求之前做些什么
  return config;
});
// 响应拦截器
axios.interceptors.response.use((response) => {
  // 对响应数据做点什么
  return response;
});

export const getListData = async (params: object) => {
  return await axios
    .post("/api/list", JSON.stringify(params))
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      return { error: true, message: error.message };
    });
};
export const getDetailData = (id: number) => {
  return axios.get(`/api/detail/${id}`);
};
export const getTableData = () => {
  return axios.get("/api/table");
};
