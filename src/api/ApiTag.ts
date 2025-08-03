import Api from "@/api/Api";

const END_POINTS = {
    GET_ALL_BY_LIMIT: "Tag",
};

class ApiTag {
    GetAllByLimit = async (pageParams: any) => {
        return await Api.get(`${END_POINTS.GET_ALL_BY_LIMIT}`, {
            params: {
                name: pageParams.name,
                pageSize: pageParams.pageSize,
            },
        });
    };
}

export default new ApiTag();
