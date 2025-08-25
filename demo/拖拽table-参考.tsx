// import * as React from "react";
// import "./index.scss";
// import { Button, Input, InputNumber, message, Radio, Select } from "antd";
// import {
//   AddressVideoInfoFields,
//   COS_PATH_SERVICE_ACTIVITY_FOLDER,
//   DefaultAddressVideoInfo,
//   getImageConfig,
//   IPublicVideoRoomConf,
//   LIVE_PLATFORM_VIDEO_OPTIONS,
//   Option,
//   PlatformVideoFields,
// } from "../../../model";
// import { LauncherModal } from "../../components/launcher-modal/modal";
// import {
//   PUBLIC_VIDEO_ROOM_OWNER_EXIST,
//   PUBLIC_VIDEO_ACCOUNT_TYPE,
// } from "./config";
// import { FormWrap } from "../../components/form/form";
// import { FormRow } from "../../components/form/row";
// import { LauncherUpload } from "../../components/launcher-upload/upload";
// import { ILauncherUploadVerifyRes } from "../../components/launcher-upload/model";
// import {
//   addPublicVideoRoomConfig,
//   updatePublicVideoRoomConfig,
// } from "../../../api";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// interface IProps {
//   readonly onClose: () => void;
//   readonly publicVideoRoomConfForm: IPublicVideoRoomConf;
//   readonly tagList: Array<any>;
//   readonly refreshPublicVideoRoom: () => void;
// }

// export const PublicVideoRoomDialog = (props: IProps) => {
//   const imgConfig = getImageConfig(100, 100);
//   const [loading, setLoading] = React.useState<boolean>(false);
//   const [formItem, setFormItem] = React.useState<IPublicVideoRoomConf>(
//     props.publicVideoRoomConfForm
//   );

//   const getUploadURL = (url: string) => {
//     return url ? [url] : [];
//   };

//   const onOk = async () => {
//     const verify = verifyForm();
//     if (!verify) {
//       return;
//     }
//     setLoading(true);
//     let res;
//     let sucText = "添加成功";
//     const videoList = formItem.video_info.filter(
//       (item) => item.videoId !== "" && item.platform !== ""
//     );
//     const params = {
//       ...formItem,
//       video_info: videoList,
//       created_at: undefined,
//       room_id: undefined,
//     };
//     console.log("onOk", params);
//     if (params.id) {
//       res = await updatePublicVideoRoomConfig(params);
//       sucText = "保存成功";
//     } else {
//       res = await addPublicVideoRoomConfig(params);
//     }
//     if (res) {
//       message.success(sucText);
//       await props.refreshPublicVideoRoom();
//       props.onClose();
//     }
//     setLoading(false);
//   };

//   const onChangeInput =
//     (field: string) => (event: React.ChangeEvent<HTMLInputElement> | any) => {
//       const { value } = event.target;
//       onUpdateFormItem(field)(value);
//     };

//   const onUpdateFormItem = (field: string) => (value: any) => {
//     setFormItem(Object.assign({}, formItem, { [field]: value }));
//   };

//   const onChangeAddressInfo = (options: Option) => {
//     return (
//       fields: AddressVideoInfoFields,
//       index?: number,
//       field?: PlatformVideoFields
//     ) => {
//       return (value?: string) => {
//         const info = [...formItem[fields]];
//         switch (options) {
//           case Option.add:
//             info.push({ ...DefaultAddressVideoInfo });
//             break;
//           case Option.delete:
//             if (typeof index === "number") {
//               info.splice(index, 1);
//             }
//             break;
//           case Option.edit:
//             if (index !== undefined && field) {
//               info[index][field] = value || "";
//             }
//             break;
//         }
//         setFormItem(Object.assign({}, formItem, { [fields]: info }));
//       };
//     };
//   };
//   const onUploadError = (err: ILauncherUploadVerifyRes) => {
//     message.error(err.errorMsg);
//   };
//   const verifyForm = () => {
//     console.log("formItem", formItem);
//     if (!formItem.room_title?.trim()) {
//       message.warn("请填写房间名称");
//       return false;
//     }
//     if (formItem?.owner_exists === 1 && !formItem.gopenid?.trim()) {
//       message.warn("房主真实存在时，请填写房主gopenid");
//       return false;
//     }
//     if (formItem?.owner_exists !== 1 && !formItem.display_name?.trim()) {
//       message.warn("房主不是真实存在，请填写外显名字");
//       return false;
//     }
//     if (formItem?.owner_exists !== 1 && !formItem.avatar_url?.trim()) {
//       message.warn("房主不是真实存在，请填写外显头像");
//       return false;
//     }
//     return true;
//   };

//   const renderAddressInfo = (
//     fields: "video_info",
//     draggableEnabled = false
//   ) => {
//     const addressInfo = [...formItem[fields]];
//     if (addressInfo.length === 0) {
//       addressInfo.push({ ...DefaultAddressVideoInfo });
//     }

//     const handleOnDragEnd = (result: any) => {
//       const { source, destination } = result;
//       if (!destination) return;
//       const items = Array.from(addressInfo);
//       const [reorderedItem] = items.splice(source.index, 1);
//       items.splice(destination.index, 0, reorderedItem);
//       setFormItem((prevFormItem) => ({
//         ...prevFormItem,
//         [fields]: items,
//       }));
//     };

//     return (
//       <div>
//         {/* Table Header */}
//         <div className='videoroom-tableheader'>
//           <div className='flex1 font-bold'>序号</div>
//           <div className='flex1 font-bold'>平台</div>
//           <div className='flex1 font-bold'>视频ID</div>
//           <div className='flex1 font-bold'>标题</div>
//           <div className='flex1 font-bold'>封面图</div>
//           <div className='flex1 font-bold'>时长</div>
//           <div className='flex1 font-bold'>标签</div>
//           <div className='flex1 font-bold'>操作</div>
//         </div>
//         <DragDropContext onDragEnd={handleOnDragEnd}>
//           <Droppable droppableId='addressInfoList'>
//             {(provided) => (
//               <div ref={provided.innerRef} {...provided.droppableProps}>
//                 {/* Table Body */}
//                 {addressInfo.map((item, index) => {
//                   const key = `${fields}${index}`;
//                   return (
//                     <Draggable
//                       key={key}
//                       draggableId={key}
//                       index={index}
//                       isDragDisabled={!draggableEnabled}
//                     >
//                       {(provided) => (
//                         <div
//                           className='info-item videoroom-table-body'
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                         >
//                           <div className='flex1'>{index + 1}</div>
//                           <Select
//                             className='flex1'
//                             value={item.platform || undefined}
//                             options={LIVE_PLATFORM_VIDEO_OPTIONS}
//                             onChange={onChangeAddressInfo(Option.edit)(
//                               fields,
//                               index,
//                               "platform"
//                             )}
//                             placeholder='请选择'
//                             allowClear={true}
//                           />

//                           <Input
//                             className='flex1'
//                             type='text'
//                             value={item.videoId}
//                             onChange={(e) =>
//                               onChangeAddressInfo(Option.edit)(
//                                 fields,
//                                 index,
//                                 "videoId"
//                               )(e.target.value)
//                             }
//                             placeholder='请输入'
//                             allowClear={true}
//                           />

//                           <Input
//                             className='flex1'
//                             type='text'
//                             value={item.title}
//                             onChange={(e) =>
//                               onChangeAddressInfo(Option.edit)(
//                                 fields,
//                                 index,
//                                 "title"
//                               )(e.target.value)
//                             }
//                             placeholder='请输入'
//                             allowClear={true}
//                           />
//                           <LauncherUpload
//                             className='flex1'
//                             url={getUploadURL(item.img || "")}
//                             onUpload={(value) =>
//                               onChangeAddressInfo(Option.edit)(
//                                 fields,
//                                 index,
//                                 "img"
//                               )(value[0])
//                             }
//                             onDelete={() =>
//                               onChangeAddressInfo(Option.edit)(
//                                 fields,
//                                 index,
//                                 "img"
//                               )("")
//                             }
//                             onError={onUploadError}
//                             accept='image/png'
//                           />
//                           <Input
//                             className='flex1'
//                             type='text'
//                             value={item.duration}
//                             onChange={(e) =>
//                               onChangeAddressInfo(Option.edit)(
//                                 fields,
//                                 index,
//                                 "duration"
//                               )(e.target.value)
//                             }
//                             placeholder='请输入'
//                             allowClear={true}
//                           />
//                           <Select
//                             className='flex1'
//                             style={{ width: "100%", flex: 1 }}
//                             value={item.label || undefined}
//                             options={props.tagList.map((item, index) => ({
//                               label: item.tag_name,
//                               value: item.tag_id,
//                             }))}
//                             onChange={onChangeAddressInfo(Option.edit)(
//                               fields,
//                               index,
//                               "label"
//                             )}
//                             placeholder='请选择'
//                             allowClear={true}
//                           />

//                           <Button
//                             type='link'
//                             onClick={() =>
//                               onChangeAddressInfo(
//                                 index > 0 ? Option.delete : Option.add
//                               )(fields, index)()
//                             }
//                           >
//                             {index > 0 ? "删除" : "新增"}
//                           </Button>

//                           {draggableEnabled && (
//                             <div
//                               className='drag-handle'
//                               {...provided.dragHandleProps}
//                             >
//                               ☰
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </Draggable>
//                   );
//                 })}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         </DragDropContext>
//       </div>
//     );
//   };

//   const labelStyle = { minWidth: "115px" };

//   const renderFormContent = () => {
//     return (
//       <FormWrap className='videoroom'>
//         <FormRow title='房间名称' labelStyle={labelStyle}>
//           <Input
//             type='text'
//             value={formItem.room_title}
//             onChange={onChangeInput("room_title")}
//             placeholder='请输入'
//             className='gl-input'
//             allowClear={true}
//           ></Input>
//         </FormRow>
//         <FormRow title='麦位数' required={false} labelStyle={labelStyle}>
//           <InputNumber
//             value={formItem.mic_count}
//             onChange={onUpdateFormItem("mic_count")}
//             placeholder='请输入'
//             min={0}
//             max={8}
//           />
//           <span className='m-l'>支持填写0-8，如果填写0，则不支持开放麦位</span>
//         </FormRow>
//         <FormRow
//           title='房主是否真实存在'
//           required={false}
//           labelStyle={labelStyle}
//         >
//           <Radio.Group
//             value={formItem.owner_exists}
//             options={PUBLIC_VIDEO_ROOM_OWNER_EXIST}
//             onChange={onChangeInput("owner_exists")}
//           ></Radio.Group>
//           <span className='m-l expla'>
//             选择“是”，需要填写gopenid，这样未来玩家可以访问房主主页&加好友等，可以配置官号
//           </span>
//         </FormRow>
//         <FormRow title='房主gopenid' required={false} labelStyle={labelStyle}>
//           <Input
//             type='text'
//             value={formItem.gopenid}
//             onChange={onChangeInput("gopenid")}
//             placeholder='请输入'
//             className='gl-input'
//             allowClear={true}
//           ></Input>
//         </FormRow>
//         <FormRow title='账号平台' required={false} labelStyle={labelStyle}>
//           <Radio.Group
//             value={formItem.account_type}
//             options={PUBLIC_VIDEO_ACCOUNT_TYPE}
//             onChange={onChangeInput("account_type")}
//           ></Radio.Group>
//         </FormRow>
//         <FormRow title='外显名字' required={false} labelStyle={labelStyle}>
//           <Input
//             type='text'
//             value={formItem.display_name}
//             onChange={onChangeInput("display_name")}
//             placeholder='请输入'
//             className='gl-input'
//             allowClear={true}
//           ></Input>
//           <span className='m-l expla'>
//             若配置了房主gopenid，优先拉取账号头像和名字，若没有配置gopenid，则必须填写外显名字，缺省名字：公共房间
//           </span>
//         </FormRow>
//         <FormRow title='外显头像' required={false} labelStyle={labelStyle}>
//           <LauncherUpload
//             url={[formItem.avatar_url]}
//             onUpload={(value) => onUpdateFormItem("avatar_url")(value[0])}
//             onDelete={() => onUpdateFormItem("avatar_url")("")}
//             onError={onUploadError}
//             filename={COS_PATH_SERVICE_ACTIVITY_FOLDER}
//             accept={imgConfig.accept}
//             verifyRules={imgConfig.rules}
//           />
//           <span className='m-l'>头像尺寸：100*100</span>
//         </FormRow>
//         <FormRow title='视频地址' required={false} labelStyle={labelStyle}>
//           {renderAddressInfo("video_info")}
//         </FormRow>
//       </FormWrap>
//     );
//   };

//   return (
//     <LauncherModal
//       onClose={props.onClose}
//       title='公共视频房间配置'
//       className='public-room-dialog'
//       loading={loading}
//       onOk={onOk}
//       visible={true}
//       width='900px'
//     >
//       <div className='public-room'>{renderFormContent()}</div>
//     </LauncherModal>
//   );
// };
