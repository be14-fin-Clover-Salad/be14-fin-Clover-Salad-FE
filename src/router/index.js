import { createRouter, createWebHistory } from "vue-router";
import { menuList } from "@/config/menuConfig";
import LoginView from "@/views/user/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import { useAuthStore } from "@/stores/auth";
import ResetPassword from "@/views/user/ResetPassword.vue";
import Mypage from "@/views/user/Mypage.vue";

const routes = menuList.flatMap((group) =>
  group.items.map((item) => ({
    path: item.path,
    component: item.component,
    meta: {
      title: item.label,
      requiresAuth: true, // 인증 필요 여부. 필요 없으면 false
      basePath: item.path, // 상세 경로 포함 대비
    },
  }))
);

// 기본 홈 화면
routes.unshift({
  path: "/login",
  component: LoginView,
  meta: { layout: "none", title: "로그인" },
});

routes.unshift({
  path: "/reset-password",
  component: ResetPassword,
  meta: { layout: "none", title: "비밀번호 재설정" },
});

routes.unshift({
  path: "/",
  component: HomeView,
  meta: { title: "홈", requiresAuth: true },
});

routes.push({
  path: "/:pathMatch(.*)*",
  redirect: "/",
});

// 공지사항 상세 화면
routes.push({
  path: "/support/notice/:id",
  component: () => import("@/views/support/notice/NoticeDetail.vue"),
  meta: {
    title: "공지 사항",
    basePath: "/support/notice", // 이 경로 기준으로 탭 유지
  },
});

// 공지사항 등록 화면 추가
routes.push({
  path: "/support/notice/create",
  component: () => import("@/views/support/notice/NoticeCreate.vue"),
  meta: {
    title: "공지 등록",
    basePath: "/support/notice",
  },
});

routes.push({
  path: "/support/notice/edit/:id",
  component: () => import("@/views/support/notice/NoticeEdit.vue"),
  meta: {
    title: "공지 수정",
    basePath: "/support/notice",
  },
});

routes.push({
  path: "/support/qna/:id",
  component: () => import("@/views/support/qna/QnaDetail.vue"),
  meta: {
    title: "문의사항",
    basePath: "/support/qna",
  },
});

routes.push({
  path: "/support/qna/create",
  component: () => import("@/views/support/qna/QnaCreate.vue"),
  meta: {
    title: "문의 등록",
    basePath: "/support/qna",
  },
});

// 상담 등록 화면
routes.push({
  path: "/consult/register",
  component: () => import("@/views/consult/ConsultRegister.vue"),
  meta: {
    title: "상담 등록",
    basePath: "/consult",
  },
});

// 상담 상세 조회 화면
routes.push({
  path: "/consult/detail/:id",
  component: () => import("@/views/consult/ConsultDetailView.vue"),
  meta: {
    title: "상담 상세",
    basePath: "/consult",
  },
});

// 마이페이지 라우트 추가
routes.push({
  path: "/mypage",
  component: Mypage,
  meta: {
    title: "내 정보 수정",
    requiresAuth: true,
    basePath: "/mypage",
  },
});

// 결재 관리 라우트 직접 추가
routes.push({
  path: "/approval",
  component: () => import("@/views/approval/Approval.vue"),
  meta: {
    title: "결재 관리",
    requiresAuth: true,
    basePath: "/approval",
  },
});

// 상품 리스트
routes.push({
  path: "/product/list",
  component: () => import("@/views/product/ProductList.vue"),
  meta: {
    title: "상품 목록",
    basePath: "/product/list",
  },
});

// 상품 상세 조회
routes.push({
  path: "/product/detail/:productId",
  component: () => import("@/views/product/ProductDetail.vue"),
  meta: {
    title: "상품 상세 조회",
    basePath: "/product/list",
  },
});

// 상품 등록
routes.push({
  path: "/product/register",
  component: () => import("@/views/product/ProductRegister.vue"),
  meta: {
    title: "상품 등록",
    basePath: "/product/list",
  },
});

// 상품 수정
routes.push({
  path: "/product/update/:productId",
  component: () => import("@/views/product/ProductUpdate.vue"),
  meta: {
    title: "상품 등록",
    basePath: "/product/list",
  },
});

// 고객 상세 화면
routes.push({
  path: "/customer/:id",
  name: "CustomerDetail",
  component: () => import("@/views/customer/CustomerDetail.vue"),
  meta: {
    title: "고객 상세",
    basePath: "/customer",
  },
});

// 실적 목표 등록
routes.push({
  path: "/goal/register",
  component: () => import("@/views/goal/EmployeeGoalRegister.vue"),
  meta: {
    title: "실적 목표 등록",
    basePath: "/goal/employee",
  },
});

// 실적 목표 상세 조회
routes.push({
  path: "/goal/detail/:gotEmployeeCode/:gotTargetYear",
  component: () => import("@/views/goal/EmployeeGoalDetail.vue"),
  meta: {
    title: "실적 목표 상세 조회",
    basePath: "/goal/employee",
  },
});

// 실적 목표 수정
routes.push({
  path: "/goal/update/:gotEmployeeCode/:gotTargetYear",
  component: () => import("@/views/goal/EmployeeGoalUpdate.vue"),
  meta: {
    title: "실적 목표 수정",
    basePath: "/goal/employee",
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.accessToken) {
      try {
        await authStore.refreshToken();
        next();
      } catch {
        next("/login");
      }
    } else if (!authStore.userInfo) {
      // 토큰은 있지만 사용자 정보가 없는 경우 (유실된 경우)
      try {
        console.warn("[Router] 사용자 정보가 유실됨, 복구 시도 중...");
        await authStore.recoverUserInfo();
        console.log("[Router] 사용자 정보 복구 성공");
        next();
      } catch (error) {
        console.error("[Router] 사용자 정보 복구 실패:", error);
        // 복구 실패 시 토큰도 클리어하고 로그인 페이지로
        authStore.clearToken();
        next("/login");
      }
    } else {
      next();
    }
  } else {
    if (to.path === "/login" && authStore.accessToken) {
      next("/");
    } else {
      next();
    }
  }
});

export default router;
