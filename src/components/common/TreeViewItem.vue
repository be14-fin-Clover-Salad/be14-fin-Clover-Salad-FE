<template>
  <li>
    <div
      class="tree-item"
      :class="{ selected: isSelected, isTop: isTopLevel }"
      @click.stop="selectDept(dept.id)"
    >
      <span
        v-if="children.length"
        class="toggle-icon"
        @click.stop="toggle"
      >
        {{ isOpen ? '▾' : '▸' }}
      </span>
      <span class="dept-name">
        {{ dept.name }}
      </span>
    </div>

    <transition name="fade">
      <ul v-if="isOpen && children.length" class="child-tree">
        <TreeViewItem
          v-for="child in children"
          :key="child.id"
          :dept="child"
          :departments="departments"
          :selected-dept-id="selectedDeptId"
          :is-top-level="false"
          @select="selectDept"
        />
      </ul>
    </transition>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue'
import TreeViewItem from './TreeViewItem.vue'

const props = defineProps({
  dept: Object,
  departments: Array,
  selectedDeptId: [Number, String],
  isTopLevel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select'])

const isSelected = computed(() => props.selectedDeptId === props.dept.id)

const children = computed(() =>
  props.departments.filter(d => d?.supDeptId === props.dept.id)
)

const isOpen = ref(false)
const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectDept = (id) => {
  emit('select', id)
}
</script>

<style scoped>
.tree-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  padding: 6px 8px;
  cursor: pointer;
}
.tree-item:hover {
  background-color: #eaf7f3; /* 연한 그린 hover */
}
.tree-item.selected {
  background-color: #d4f6ed;
  border-left: 4px solid #00a86b;
}

.toggle-icon {
  width: 1rem;
  text-align: center;
  user-select: none;
  font-size: 1.1rem;
}

.dept-name {
  font-size: 1rem;
  font-weight: 400;
}

.tree-item.isTop .dept-name {
  font-size: 1.15rem;
  font-weight: 700;
}

.child-tree {
  padding-left: 1rem;
  list-style: none;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: scaleY(0.95);
}
</style>
