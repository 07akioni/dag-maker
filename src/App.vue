<template>
  <div id="app">
    <dag-maker/>
  </div>
</template>

<script>
import DagMaker from './components/DagMaker'

export default {
  name: 'App',
  components: {
    DagMaker
  }
}
</script>

<style>
body {
  margin: 0;
  background: #f6f6f6;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
