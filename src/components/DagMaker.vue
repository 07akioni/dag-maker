<template>
  <div class="main-panel">
    <div class="control-panel" ref="editor" :class="{ inactive: fullScreen }"></div>
    <div class="dag-panel">
      <dag :graph="editorValue"/>
    </div>
    <button @click="displayFullScreen" class="full-screen-button" v-if="!fullScreen">全屏</button>
    <button @click="displayFullScreen" class="full-screen-button" v-else>关闭全屏</button>
  </div>
</template>

<script>
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import Dag from './Dag'
import initialEditorValue from '../utils/demoText'

export default {
  name: 'DagMaker',
  components: {
    Dag
  },
  data () {
    return {
      resizeListenerId: null,
      fullScreen: false,
      editorValue: initialEditorValue
    }
  },
  methods: {
    displayFullScreen () {
      this.fullScreen = !this.fullScreen
    },
    renderEditor () {
      const editor = monaco.editor.create(this.$refs.editor, {
        value: initialEditorValue,
        language: 'javascript',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        theme: 'vs-dark',
        fontSize: 14,
        minimap: {
          enabled: false
        }
      })
      editor.onDidChangeModelContent(e => {
        this.editorValue = editor.getValue()
      })
    }
  },
  mounted () {
    this.renderEditor()
  }
}
</script>

<style scoped>
.main-panel {
  position: fixed;
  display: flex;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.control-panel {
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 700px;
  transition: transform .5s ease-in-out;
}
.control-panel.inactive {
  transform: translateX(-100%);
}

.dag-panel {
  flex-grow: 1;
  height: 100vh;
}

.full-screen-button {
  position: absolute;
  top: 14px;
  right: 14px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  cursor: pointer;
  padding: 12px 20px;
  border-radius: 4px;
  transition: .1s;
  font-weight: 500;
  outline: none;
  transition: .1s;
}
.full-screen-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}
</style>
