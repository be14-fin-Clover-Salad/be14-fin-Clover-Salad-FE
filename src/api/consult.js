import api from "./auth";

// 모든 상담 목록 조회 (관리자)
export const getAllConsults = () => {
  return api.get("/api/consult");
};

// ID로 상담 상세 조회 (관리자)
export const getConsultById = (id) => {
  return api.get(`/api/consult/${id}`);
};

// 로그인한 사원의 상담 목록 조회
export const getMyConsults = () => {
  return api.get("/api/consult/my");
};

// 로그인한 사원의 상담 단건 조회
export const getMyConsultById = (id) => {
  return api.get(`/api/consult/my/${id}`);
};

// 상담 등록
export const createConsult = (consultData) => {
  return api.post("/api/consult", consultData);
};
