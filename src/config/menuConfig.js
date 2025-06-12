export const menuList = [
  {
    group: "대시보드",
    items: [
      {
        label: "사원별 실적 조회",
        path: "/dashboard/employee",
        // component: () =>
        // import("@/views/dashboard/EmployeePerformanceView.vue"),
      },
      {
        label: "상품별 매출 조회",
        path: "/dashboard/product",
        // component: () => import("@/views/dashboard/ProductSalesView.vue"),
      },
      {
        label: "영업부 매출 조회",
        path: "/dashboard/department",
        // component: () => import("@/views/dashboard/DepartmentSalesView.vue"),
      },
    ],
  },
  {
    group: "실적",
    items: [
      {
        label: "실적 관리",
        path: "/performance",
        // component: () =>
        //   import("@/views/performance/PerformanceManagementView.vue"),
      },
      {
        label: "매출 내역",
        path: "/sales",
        component: () => import("@/views/sales/SalesView.vue"),
      },
    ],
  },
  {
    group: "계약",
    items: [
      {
        label: "계약 관리",
        path: "/contract/manage",
        component: () => import("@/views/contract/ContractManagementView.vue"),
      },
      {
        label: "계약서 양식 관리",
        path: "/contract/template",
        // component: () => import("@/views/contract/ContractTemplateView.vue"),
      },
    ],
  },
  {
    group: "고객",
    items: [
      {
        label: "고객 등록",
        path: "/customer/register",
        component: () => import("@/views/customer/CustomerRegister.vue"),
      },
      {
        label: "고객 관리",
        path: "/customer",
        component: () => import("@/views/customer/CustomerView.vue"),
      },
      {
        label: "상담 관리",
        path: "/consulting",
        component: () => import("@/views/consulting/ConsultingView.vue"),
      },
    ],
  },
  {
    group: "상품",
    items: [
      {
        label: "상품 관리",
        path: "/product",
        // component: () => import("@/views/product/ProductView.vue"),
      },
    ],
  },
  {
    group: "고객 지원",
    items: [
      {
        label: "공지 사항",
        path: "/support/notice",
        component: () => import("@/views/support/notice/NoticeView.vue"),
      },
      {
        label: "문의 사항",
        path: "/support/qna",
        component: () => import("@/views/support/qna/QnaView.vue"),
      },
    ],
  },
  {
    group: "관리",
    items: [
      {
        label: "결재 관리",
        path: "/admin/approval",
        component: () => import("@/views/approval/Approval.vue"),
      },
      {
        label: "사업 조회",
        path: "/admin/business",
        // component: () => import("@/views/admin/BusinessLookupView.vue"),
      },
      {
        label: "알림 관리",
        path: "/admin/notifications",
        // component: () => import("@/views/admin/NotificationManagementView.vue"),
      },
      {
        label: "로그인 관리",
        path: "/admin/login",
        // component: () => import("@/views/admin/LoginManagementView.vue"),
      },
    ],
  }
];

// 탭에서만 사용할 메뉴 항목들
export const tabOnlyMenuItems = [
  {
    label: "내 정보 수정",
    path: "/mypage",
    component: () => import("@/views/user/Mypage.vue"),
    meta: {
      group: "마이페이지"
    }
  }
];
