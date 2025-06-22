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
        path: "/sales-dashboard",
        component: () =>
          import("@/views/salesDashboard/SalesDashboardLayout.vue"),
      },
    ],
  },
  {
    group: "실적",
    items: [
      {
        label: "개인 실적 목표 관리",
        path: "/goal/employee",
        component: () => import("@/views/goal/EmployeeGoalList.vue"),
      },
      {
        label: "팀 실적 목표 조회",
        path: "/goal/department",
        component: () => import("@/views/goal/DepartmentGoalList.vue"),
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
        component: () =>
          import("@/views/contractTemplate/ContractTemplateView.vue"),
      },
    ],
  },
  {
    group: "고객",
    items: [
      // {
      //   label: "고객 등록",
      //   path: "/customer/register",
      //   component: () => import("@/views/customer/CustomerRegister.vue"),
      // },
      {
        label: "고객 관리",
        path: "/customer",
        component: () => import("@/views/customer/CustomerView.vue"),
      },
      {
        label: "상담 관리",
        path: "/consult",
        component: () => import("@/views/consult/ConsultingView.vue"),
      },
    ],
  },
  {
    group: "상품",
    items: [
      {
        label: "상품 관리",
        path: "/product/list",
        component: () => import("@/views/product/ProductList.vue"),
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
        path: "/approval",
        component: () => import("@/views/approval/Approval.vue"),
      },
      {
        label: "사원 조회",
        path: "/employee",
        component: () => import("@/views/employee/EmployeeLayout.vue"),
      },
      {
        label: "알림 관리",
        path: "/notification/list",
        component: () => import("@/views/notification/NotificationLayout.vue"),
      },
      {
        label: "로그 관리",
        path: "/admin/log",
        component: () => import("@/views/log/AccessLogView.vue"),
      },
    ],
  },
];

// 탭에서만 사용할 메뉴 항목들
export const tabOnlyMenuItems = [
  {
    label: "내 정보 수정",
    path: "/mypage",
    component: () => import("@/views/user/Mypage.vue"),
    meta: {
      group: "마이페이지",
    },
  },
];
