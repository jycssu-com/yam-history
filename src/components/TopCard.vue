<template>
  <q-card>
    <q-card-section>
      <div class="row q-mb-sm">
        <div class="col">
          <div class="text-subtitle1" v-text="title" />
        </div>
        <div class="col-auto">
          <q-btn-toggle
            v-model="displayedMonth"
            no-caps
            rounded
            unelevated
            size="sm"
            :options="[
              {label: 'This month', value: 'current'},
              {label: 'Last month', value: 'last'}
            ]"
          />
        </div>
      </div>

      <template v-if="displayedMonthValue.length === 0">
        <div class="row justify-center">
          <div class="col-auto">
            <span class="text-h6">No data</span>
          </div>
        </div>
      </template>

      <template
        v-for="(item, index) in displayedMonthValue"
        :key="item.id"
      >
        <div class="row items-center">
          <div class="col-auto">
            <span class="text-h6">{{ index + 1 }}</span>
          </div>
          <div class="col-auto q-px-sm">
            <router-link :to="item.route">
              <div v-text="item.name" />
            </router-link>
          </div>
          <div class="col" />
          <div class="col-auto">
            <div v-text="item.value" />
          </div>
        </div>
        <q-separator v-if="index < displayedMonthValue.length - 1" />
      </template>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs, ref, computed } from 'vue'
import { RouteLocationRaw } from 'vue-router'

interface Model {
  currentMonth: {
    id: string;
    name: string;
    value: string;
    route: RouteLocationRaw;
  }[];
  lastMonth: {
    id: string;
    name: string;
    value: string;
    route: RouteLocationRaw;
  }[];
}

export default defineComponent({
  name: 'TopTokenVolumes',
  props: {
    modelValue: {
      type: Object as PropType<Model>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  setup (props) {
    const { modelValue } = toRefs(props)
    const displayedMonth = ref<'current' | 'last'>('current')

    const displayedMonthValue = computed(() => {
      return displayedMonth.value === 'current'
        ? modelValue.value.currentMonth
        : modelValue.value.lastMonth
    })

    return {
      displayedMonth,
      displayedMonthValue,
    }
  },
})
</script>
