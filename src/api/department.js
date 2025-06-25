import api from "./auth";

export const getDepartments = () => {
  return api.get("/department/hierarchy");
};
