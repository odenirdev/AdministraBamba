import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:1337",
    headers: {
        Authorization: localStorage.getItem("token"),
    },
});

export const requestPublic = {
    headers: { Authorization: "" },
};

export default api;
