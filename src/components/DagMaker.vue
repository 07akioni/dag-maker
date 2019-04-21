<template>
  <div class="main-panel">
    <div class="control-panel" ref="editor" :class="{ inactive: fullScreen }"></div>
    <div class="dag-panel">
      <dag :graph="editorValue"/>
    </div>
    <el-button @click="displayFullScreen" style="position: absolute; top: 14px; right: 14px;" v-if="!fullScreen">全屏</el-button>
    <el-button @click="displayFullScreen" style="position: absolute; top: 14px; right: 14px;" v-else>关闭全屏</el-button>
  </div>
</template>

<script>
import * as monaco from "monaco-editor";
import Dag from "./Dag";

const initialEditorValue = `graph = {
  /**
   * for more graph options, node options, link options
   * see https://github.com/dagrejs/dagre/wiki#configuring-the-layout
   * and https://github.com/dagrejs/dagre-d3/wiki#demos
   */
  options: {
    xOffset (svgWidth, graphWidth) {
      return 600 + (svgWidth - 600 - graphWidth) / 2
    },
    yOffset (svgHeight, graphHeight) {
      return 60
    },
    align: void 0, /** 'UL', 'UR', 'DL', 'DR', undefined */
    rankdir: 'TB', /** 'TB', 'LR', 'BT', 'RL' */
    // ranker: 'longest-path', /** network-simplex, tight-tree, longest-path */
    nodesep: 100,
    ranksep: 100,
    edgesep: 100
  },
  nodes: [
    {
      id: 1,
      label: "hello",
      shape: "circle",
      height: 150,
      style: {
        "stroke-width": "4px",
        stroke: "red",
        fill: "yellow",
      },
      labelStyle: {
        "font-size":
        "50px",
        "font-style": "italic",
        "text-decoration": "underline"
      }
    },
    {
      id: 2,
      label: "world",
      width: 90,
      style: {
        rx: "10px",
        ry: "5px"
      }
    },
    {
      id: 3,
      label: "jsfuck",
      shape: "circle",
    },
    { id: 4, label: "js"}
  ],
  links: [
    {
      from: 1, to: 3,
      labelpos: 'l',
      labeloffset: 10,
      label: "arrowhead: vee",
      arrowhead: "vee"
    },
    {
      from: 2, to: 3,
      label: "costum label style",
      arrowhead: "vee",
      labelStyle: {
        "background-color": "red",
        "border-radius": 0,
        padding: 10
      }
    },
    {
      from: 3,
      to: 4,
      label: "eggplant",
      arrowhead: "normal"
    },
    {
      from: 4,
      to: 1,
      weight: 1,
      label: "arrowhead: undirected",
      arrowhead: "undirected"
    }
  ]
}`

export default {
  name: "DagMaker",
  components: {
    Dag
  },
  data() {
    return {
      resizeListenerId: null,
      fullScreen: false,
      editorValue: initialEditorValue
    };
  },
  methods: {
    displayFullScreen() {
      this.fullScreen = !this.fullScreen;
    },
    renderEditor() {
      const editor = monaco.editor.create(this.$refs.editor, {
        value: initialEditorValue,
        language: "javascript",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        theme: "vs-dark",
        fontSize: 14,
        minimap: {
          enabled: false
        }
      })
      editor.onDidChangeModelContent(e => {
        this.editorValue = editor.getValue()
      });
    }
  },
  mounted() {
    this.renderEditor();
  }
};
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
</style>
