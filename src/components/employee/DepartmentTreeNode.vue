<template>
  <div class="tree-node">
    <div
      class="node-label"
      :class="{ selected: isSelected, hasChildren: hasChildren, open: isOpen }"
      @click="handleClick"
    >
      <img
        class="folder-icon"
        :src="folderIconSrc"
        alt="folder"
      />
      <span>{{ node.name }}</span>
    </div>
    <div v-if="hasChildren && isOpen" class="children">
      <DepartmentTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :opened-path="openedPath"
        :on-toggle="onToggle"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/departmentStore'

const props = defineProps({
  node: Object,
  openedPath: Array,
  onToggle: Function
})

const departmentStore = useDepartmentStore()
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isSelected = computed(() => departmentStore.selectedDepartmentId === props.node.id)
const isOpen = computed(() => props.openedPath && props.openedPath.includes(props.node.id))

const folderIconSrc = computed(() => {
  if (!isOpen.value) return '/close.svg'
  const idx = props.openedPath ? props.openedPath.indexOf(props.node.id) : -1
  if (
    props.openedPath &&
    idx === props.openedPath.length - 1 &&
    !hasChildren.value
  ) {
    return '/open.svg'
  }
  return '/close.svg'
})

function handleClick(e) {
  e.stopPropagation()
  props.onToggle(props.node)
  
  departmentStore.setSelectedDepartment(props.node.id)
}
</script>

<style scoped>
.tree-node {
  font-size: 15px;
  user-select: none;
}
.node-label {
  display: flex;
  align-items: center;
  padding: 3px 8px 3px 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 2px;
}
.node-label.selected,
.node-label:hover {
  background: #f3f8e7;
}
.node-label.selected {
  background: #eaf6c7;
  font-weight: 600;
}

/* Focus outline 제거 */
.node-label:focus {
  outline: none !important;
}

.folder-icon {
  width: 18px;
  height: 18px;
  margin-right: 6px;
  object-fit: contain;
  vertical-align: middle;
}
.children {
  margin-left: 18px;
  border-left: 1.5px solid #e6e6e6;
  padding-left: 4px;
}
</style> 