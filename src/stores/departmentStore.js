import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('department', {
  state: () => ({
    selectedDepartmentId: null,
    departmentTree: []
  }),
  
  actions: {
    setSelectedDepartment(id) {
      this.selectedDepartmentId = id
    },
    
    setDepartmentTree(tree) {
      this.departmentTree = Array.isArray(tree) ? tree : [tree]
    },

    // 선택된 부서의 상위 부서 정보를 찾는 함수
    findParentDepartment(deptId) {
      if (!this.departmentTree || !deptId) return null
      
      const findParent = (nodes, targetId) => {
        for (const node of nodes) {
          if (node.id === targetId) {
            return {
              parent: node.parent,
              current: node
            }
          }
          
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