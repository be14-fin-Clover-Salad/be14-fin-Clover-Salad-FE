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
        label: "사업별 실적 조회",
        path: "/performance/business",
        // component: () =>
        //   import("@/views/performance/BusinessPerformanceView.vue"),
      },
      {
        label: "상품별 매출 조회",
        path: "/performance/product",
        // component: () =>
        //   import("@/views/performance/ProductPerformanceView.vue"),
      },
      {
        label: "영업부 매출 조회",
        path: "/performance/department",
        // component: () =>
        //   import("@/views/performance/DepartmentPerformanceView.vue"),
      },
      {
        label: "개인 실적 목표 관리",
        path: "/performance/individual-target",
        // component: () => import("@/views/performance/IndividualTargetView.vue"),
      },
      {
        label: "팀 실적 목표 관리",
        path: "/performance/team-target",
        // component: () => import("@/views/performance/TeamTargetView.vue"),
      },
      {
        label: "매출 관리",
        path: "/performance/revenue",
        // component: () =>
        //   import("@/views/performance/RevenueManagementView.vue"),
      },
    ],
  },
  {
    group: "계약",
    items: [
      {
        label: "계약 관리",
        path: "/contract/manage",
        // component: () => import("@/views/contract/ContractManagementView.vue"),
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
    group: "관리",
    items: [
      {
        label: "결제 관리",
        path: "/admin/payment",
        // component: () => import("@/views/admin/PaymentManagementView.vue"),
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
  },
];
