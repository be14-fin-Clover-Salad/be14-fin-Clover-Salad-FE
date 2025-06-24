import api from "./auth.js";

// 고객 목록 조회 (내 고객)
export const getMyCustomers = async () => {
  try {
    const response = await api.get("/api/customer/my");
    return response.data;
  } catch (error) {
    console.error("고객 목록 조회 실패:", error);
    throw error;
  }
};

// 고객 단건 조회 (내 고객)
export const getMyCustomerById = async (customerId) => {
  try {
    const response = await api.get(`/api/customer/my/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("고객 조회 실패:", error);
    throw error;
  }
};

// 고객 등록
export const createCustomer = async (customerData) => {
  try {
    const response = await api.post("/api/customer", customerData);
    return response.data;
  } catch (error) {
    console.error("고객 등록 실패:", error);
    throw error;
  }
};

// 고객 수정
export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await api.patch(
      `/api/customer/${customerId}`,
      customerData
    );
    return response.data;
  } catch (error) {
    console.error("고객 수정 실패:", error);
    throw error;
  }
};

// 고객 삭제
export const deleteCustomer = async (customerId) => {
  try {
    const response = await api.delete(`/api/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("고객 삭제 실패:", error);
    throw error;
  }
};

// 고객 검색 (현재는 내 고객 전체 조회)
export const searchCustomers = async (params) => {
  try {
    const response = await api.get("/api/customer/my", { params });
    const customers = response.data;
    // BaseDataTable 컴포넌트 형식에 맞추기 위해 임시로 페이징 객체 생성
    return {
      data: {
        content: customers,
        totalElements: customers.length,
      },
    };
  } catch (error) {
    console.error("고객 검색 실패:", error);
    throw error;
  }
};

// 특정 고객의 상담 내역 조회
export const getCustomerConsults = async (customerId) => {
  try {
    const response = await api.get(`/api/customer/${customerId}/consults`);
    return response.data;
  } catch (error) {
    console.error(`ID(${customerId}) 고객의 상담 내역 조회 실패:`, error);
    throw error;
  }
};
