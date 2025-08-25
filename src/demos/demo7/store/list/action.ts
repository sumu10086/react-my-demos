import { useListStore } from ".";
import { getList } from "../../api";
import { loopHandler } from "../../utils";

const { setState, getState } = useListStore;

/**
 * 获取dataList
 */
export const getDataList = async () => {
    try {
        const { dataList, page } = getState();
        const newPage = { ...page, pageNum: page.pageNum + 1 };

        setState({ getListLoading: true });
        const { list, total_size } = await getList(
            newPage.pageNum,
            newPage.pageSize,
        );
        if (Array.isArray(list)) {
            const newDataList = [...dataList, ...list];
            const hasMore =
                total_size > newDataList.length;

            setState({
                dataList: newDataList,
                total: total_size,
                hasMore,
                page: { ...newPage },
            });
        }

    } catch (error) {
        console.error('getDataList error.', error);

    }
    setState({ getListLoading: false });
};

/**
 * 刷新所有dataList
 */
const loopRefreshDataList = async () => {
    const { page } = getState();
    const curPage = page.pageNum || 1;
    const dataList = [];
    let newTotal = 0;
    let lastPage = curPage;

    setState({ refreshLoading: true });
    try {
        for (let i = 1; i <= curPage; i++) {
            const { list, total_size } =
                await getList(i, page.pageSize);
            if (!list) {
                break;
            }
            newTotal = total_size;
            dataList.push(...list);
            if (
                list.length <= page.pageSize &&
                dataList.length === total_size
            ) {
                lastPage = i;
                break;
            }
        }
        const hasMore = newTotal > dataList.length;
        setState({
            dataList,
            hasMore,
            page: { ...page, pageNum: lastPage },
            total: newTotal,
        });
    } catch (error) {
        console.error('loopRefreshDataList error.', error);
    }
    setState({ refreshLoading: false });
};

// 每三十秒刷新dataList
export const refreshDataList = async () => {
    const loopInterval = 30 * 1000;
    return await loopHandler(loopRefreshDataList, loopInterval)();
};