import api from "./auth";

// 상담 검색 (필터링 기능 포함)
export const searchConsults = (params) => {
  return api.get("/api/consult", { params });
};

// 모든 상담 목록 조회 (관리자)
export const getAllConsults = () => {
  return api.get("/api/consult");
};

// ID로 상담 상세 조회 (관리자/사원 분기)
export const getConsultById = (id, isAdmin = false) => {
  if (isAdmin) {
    return api.get(`/api/consult/${id}`);
  } else {
    return api.get(`/api/consult/my/${id}`);
  }
};

// 로그인한 사원의 상담 목록 조회
export const getMyConsults = () => {
  return api.get("/api/consult/my");
};

// 상담 등록
export const createConsult = (consultData) => {
  return api.post("/api/consult", consultData);
};

// 상담 삭제
export const deleteConsult = (id) => {
  return api.delete(`/api/consult/${id}`);
};

// 특정 고객의 상담 목록 조회
export const getConsultsByCustomerId = (customerId) => {
  return api.get(`/api/customer/${customerId}/consults`);
};

// 상담 수정 (관리자/사원 분기)
export const updateConsult = (id, payload, isAdmin = false) => {
  if (isAdmin) {
    return api.patch(`/api/consult/${id}`, payload);
  } else {
    return api.patch(`/api/consult/my/${id}`, payload);
  }
};
