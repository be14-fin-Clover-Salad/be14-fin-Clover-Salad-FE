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
import { computed } from 'vue'
const props = defineProps({
  node: Object,
  openedPath: Array,
  onToggle: Function
})

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
const isSelected = computed(() => false) // 추후 선택 기능 구현 시 활용
const isOpen = computed(() => props.openedPath && props.openedPath.includes(props.node.id))

// 상위부서만 open된 경우에는 항상 defaultFolder.svg, 하위가 없고 마지막 노드일 때만 openedFolder.svg
const folderIconSrc = computed(() => {
  if (!isOpen.value) return '/defaultFolder.svg'
  const idx = props.openedPath ? props.openedPath.indexOf(props.node.id) : -1
  // 마지막 노드이면서 하위가 없는 경우만 openedFolder.svg
  if (
    props.openedPath &&
    idx === props.openedPath.length - 1 &&
    !hasChildren.value
  ) {
    return '/openedFolder.svg'
  }
  return '/defaultFolder.svg'
})

function handleClick(e) {
  e.stopPropagation()
  props.onToggle(props.node)
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