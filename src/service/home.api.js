import goApi from "../Api/Api";

const homeApi = {
  async getHome() {
    try {
      const res = await goApi.get("/home");
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.error ||
          "Failed to load home data",
      };
    }
  },
};

export default homeApi;
