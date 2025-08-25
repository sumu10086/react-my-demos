import { sleep } from "./utils";

interface PaginatedResponse<T> {
    page: number;
    page_size: number;
    total_size: number;
    list: T[];
}

export const getList = async (
    page: number,
    pageSize: number,
): Promise<PaginatedResponse<any>> => {
    //   return await request<PaginatedResponse<any>>(
    //     `/get_list`,
    //     { page: page, page_size: pageSize },
    //   );
    // 模拟虚拟数据
    await sleep(500)
    const list = Array.from({ length: pageSize }, (_, index) => ({
        id: `item-${(page - 1) * pageSize + index + 1}`,
        name: `Item ${(page - 1) * pageSize + index + 1}`,
        description: `This is item ${(page - 1) * pageSize + index + 1}`,
    }));

    const total_size = 100; // 模拟总数据量为 100

    return {
        page,
        page_size: pageSize,
        total_size,
        list,
    };
}

