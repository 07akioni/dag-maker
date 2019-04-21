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
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
