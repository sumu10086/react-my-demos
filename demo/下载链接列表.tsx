// import moment from "moment";
// import { Button, Modal, Select, Space, Table, Typography } from "antd";
// import { useEffect, useState } from "react";
// import "./index.scss";
// import { downCSVTemplate, downloadFile } from "../../../../lib";
// import {
//   getLinkDolphinChannel,
//   getPipelineDownloadLink,
// } from "../../../../api";
// import { IDownloadLinkItem } from "../../../../model";
// const { Paragraph, Link } = Typography;

// interface IProps {
//   readonly onClose: () => void;
// }

// interface IDolphinChannelOptions {
//   readonly value: Number;
//   readonly label: String;
//   readonly children?: ReadonlyArray<IDolphinChannelOptions>;
// }

// interface ICopyLinkProps {
//   link: string;
// }

// const CopyLink: React.FC<ICopyLinkProps> = ({ link }) => {
//   const onOpenUrl = (url: string) => {
//     if (url) {
//       downloadFile(url);
//     }
//   };
//   return (
//     <Space align='center'>
//       <Link className='link-container' onClick={() => onOpenUrl(link)}>
//         {link}
//       </Link>
//       <Paragraph copyable={{ text: link }}></Paragraph>
//     </Space>
//   );
// };

// export const DownloadLinkDialog = (props: IProps) => {
//   const [loading, setLoading] = useState<boolean>(false);
//   const [loadingDownload, setLoadingDownload] = useState<boolean>(false);
//   const [dataList, setDataList] = useState<ReadonlyArray<IDownloadLinkItem>>(
//     []
//   );
//   const [dolphinChannelOptions, setDolphinChannelOptions] = useState<
//     Array<IDolphinChannelOptions>
//   >([]);
//   const [filterList, setFilterList] = useState<
//     ReadonlyArray<IDownloadLinkItem>
//   >([]);

//   useEffect(() => {
//     getDolphinChannelList();
//     getList();
//     return () => {};
//   }, []);

//   const getList = async () => {
//     setLoading(true);
//     const res = await getPipelineDownloadLink();
//     const list = res?.list || [];
//     setDataList(list);
//     setFilterList(list);
//     setLoading(false);
//   };

//   const getDolphinChannelList = async () => {
//     const res = (await getLinkDolphinChannel()) || [];
//     setDolphinChannelOptions(
//       res.map((item) => ({
//         value: item.ChannelId,
//         label: item.ChannelName,
//       }))
//     );
//   };

//   const handleSelectChange = (value: number) => {
//     const filterList = dataList.filter(
//       (item) => item.DolphinChannelId === value
//     );
//     setFilterList(filterList);
//   };

//   const onExport = () => {
//     setLoadingDownload(true);
//     const dataArr: any = [];
//     const title: string[] = [];
//     getTableColumns().forEach((cloumn) => {
//       title.push(cloumn.title);
//     });
//     dataArr.push(title);
//     filterList.forEach((item: IDownloadLinkItem) => {
//       dataArr.push([
//         item.MsdkChannelId,
//         item.DefaultLink,
//         item.RedirectLink,
//         item.PackageSize,
//         `${item.UpdatedBy} ${item.UpdatedAt}`,
//       ]);
//     });
//     const time = moment().format("YYYYMMDDHHmmss");
//     const filename = `渠道下载链接_${time}`;
//     downCSVTemplate(filename, dataArr);
//     setLoadingDownload(false);
//   };

//   const getTableColumns = () => {
//     return [
//       {
//         title: "渠道ID",
//         dataIndex: "MsdkChannelId",
//         render: (value: number) => value,
//       },
//       {
//         title: "渠道固定链接",
//         dataIndex: "DefaultLink",
//         width: 200,
//         render: (value: string) => <CopyLink link={value}></CopyLink>,
//       },
//       {
//         title: "指向下载链接",
//         dataIndex: "RedirectLink",
//         width: 200,
//         render: (value: string) => <CopyLink link={value}></CopyLink>,
//       },
//       {
//         title: "包体大小",
//         dataIndex: "PackageSize",
//         render: (value: string) => value,
//       },
//       {
//         title: "最近更新",
//         dataIndex: "UpdatedAt",
//         render: (value: string, item: IDownloadLinkItem) => {
//           return (
//             <>
//               <Space
//                 direction='vertical'
//                 size={0}
//                 style={{
//                   display: "flex",
//                   fontSize: 12,
//                   color: "gray",
//                 }}
//               >
//                 <>{item.UpdatedBy}</>
//                 <>{value}</>
//               </Space>
//             </>
//           );
//         },
//       },
//     ];
//   };

//   const modalTitleNode = () => {
//     return (
//       <Space className='modal-title'>
//         <div>下载链接列表</div>
//         <Space>
//           <div>
//             <Space style={{ fontSize: 14 }}>launcher更新渠道</Space>
//             <Select
//               className='select'
//               onChange={handleSelectChange}
//               options={dolphinChannelOptions}
//               disabled={loading}
//             />
//           </div>
//           <Button
//             type='primary'
//             className='gl-button m-r'
//             onClick={() => onExport()}
//             disabled={loading}
//             loading={loadingDownload}
//           >
//             导出列表
//           </Button>
//         </Space>
//       </Space>
//     );
//   };

//   return (
//     <Modal
//       className='download-link-modal'
//       title={modalTitleNode()}
//       open={true}
//       onCancel={() => props.onClose()}
//       width={850}
//       footer={null}
//       closable={false}
//     >
//       <Table
//         className='download-link-table'
//         rowKey={(record) => `${record.MsdkChannelId}`}
//         columns={getTableColumns()}
//         dataSource={filterList}
//         pagination={false}
//         size='middle'
//         loading={loading}
//         scroll={{ y: 550 }}
//       />
//     </Modal>
//   );
// };
