import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('department', {
  state: () => ({
    selectedDepartmentId: null,
    departmentTree: []  // 배열로 초기화
  }),
  
  actions: {
    setSelectedDepartment(id) {
      this.selectedDepartmentId = id
    },
    
    setDepartmentTree(tree) {
      this.departmentTree = Array.isArray(tree) ? tree : [tree]  // 배열이 아니면 배열로 변환
    },

    // 선택된 부서의 상위 부서 정보를 찾는 함수
    findParentDepartment(deptId) {
      if (!this.departmentTree || !deptId) return null
      
      const findParent = (nodes, targetId) => {
        for (const node of nodes) {
          // 현재 노드가 타겟인 경우
          if (node.id === targetId) {
            return {
              parent: node.parent,
              current: node
            }
          }
          
          // 자식 노드들에서 찾기
          if (node.children && node.children.length > 0) {
            const result = findParent(node.children, targetId)
            if (result) return result
          }
        }
        return null
      }

      return findParent(this.departmentTree, deptId)
    }
  }
}) 