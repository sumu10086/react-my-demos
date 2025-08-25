import { create } from 'zustand';

export interface IListState {
  readonly dataList: ReadonlyArray<any>;
  readonly page: {
    pageNum: number; // 页码
    pageSize: number; // 每页数量
  };
  readonly total: number;
  readonly getListLoading: boolean;
  readonly hasMore: boolean;
  readonly refreshLoading: boolean;
}

const initialState: IListState = {
  dataList: [],
  page: {
    pageNum: 0,
    pageSize: 10,
  },
  total: 0,
  getListLoading: false,
  hasMore: true,
  refreshLoading: false,
};

export const useListStore = create<IListState>(
  () => initialState,
);