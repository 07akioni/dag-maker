<template>
  <svg :class="{ [`graph-${graphId}`]: true }" ref="svg">
  </svg>
</template>

<script>
import {
  graphId,
  renderDag
} from '@/utils/dagUtils'

/**
 * @prop {object} graph
 */
export default {
  name: 'dag',
  props: ['graph'],
  watch: {
    graph: function () {
      this.renderDag()
    }
  },
  data: function () {
    return {
      graphId: graphId()
    }
  },
  methods: {
    renderDag () {
      let graph = this.graph
      if (typeof this.graph === 'string') {
        try {
          // eslint-disable-next-line no-eval
          if (this.graph.startsWith('{')) graph = eval(`graph = ${this.graph}`)
          // eslint-disable-next-line no-eval
          else graph = eval(`${this.graph}`)
        } catch (err) {
          // console.log('parsing error')
          return
        }
      }
      renderDag(`svg.graph-${this.graphId}`, graph)
    }
  },
  mounted () {
    this.renderDag()
  }
}
</script>

<style scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
