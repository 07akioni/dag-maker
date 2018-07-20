<template>
  <div class="main-panel">
    <div class="dag-description-panel">
      <div class="dag-style">
        <el-card shadow="never">
          <el-form>
            <el-form-item prop="dagDescription">
              <el-input
                type="textarea"
                :rows="24"
                placeholder="(id)[label]-[label]->(id)[label]"
                v-model="dagTextDescription"
                :class="{ isError: parseErrored }"
              >
              </el-input>
            </el-form-item>
            <el-collapse accordion>
              <el-collapse-item>
                <template slot="title">
                  样式选项
                </template>
                <el-form-item label="排列方向">
                  <el-select v-model="rankdir">
                    <el-option value="TB" label="从上到下">从上到下</el-option>
                    <el-option value="BT" label="从下到上">从下到上</el-option>
                    <el-option value="LR" label="从左到右">从左到右</el-option>
                    <el-option value="RL" label="从右到左">从右到左</el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="排布方式">
                  <el-select v-model="align">
                    <el-option value="undefined" label="默认">默认</el-option>
                    <el-option value="UL" label="左上">左上</el-option>
                    <el-option value="UR" label="右上">右上</el-option>
                    <el-option value="DL" label="左下">左下</el-option>
                    <el-option value="DR" label="右下">右下</el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="连线方式">
                  <el-select v-model="curve">
                    <el-option value="curveBasis" label="curveBasis">curveBasis</el-option>
                    <el-option value="curveLinear" label="curveLinear">curveLinear</el-option>
                    <el-option value="curveMonotoneX" label="curveMonotoneX">curveMonotoneX</el-option>
                    <el-option value="curveMonotoneY" label="curveMonotoneY">curveMonotoneY</el-option>
                    <el-option value="curveStep" label="curveStep">curveStep</el-option>
                    <el-option value="curveNatural" label="curveNatural">curveNatural</el-option>
                    <el-option value="curveBundle" label="curveBundle">curveBundle</el-option>
                    <el-option value="curveCatmullRom" label="curveCatmullRom">curveCatmullRom</el-option>
                  </el-select>
                </el-form-item>
                  </el-collapse-item>
            </el-collapse>
            
          </el-form>
        </el-card>
      </div>
    </div>
    <div class="dag-panel">
      <el-card shadow="never" class="svg-card">
        <svg id="svg-canvas" ref="root" width="800">
        </svg>
      </el-card>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import dagreD3 from 'dagre-d3'

function makeBG(elem) {
  const svgns = 'http://www.w3.org/2000/svg';
  const bounds = elem.getBBox();
  const bg = document.createElementNS(svgns, 'rect');
  const style = getComputedStyle(elem);
  const paddingTop = parseInt(style['padding-top'], 10);
  const paddingLeft = parseInt(style['padding-left'], 10);
  const paddingRight = parseInt(style['padding-right'], 10);
  const paddingBottom = parseInt(style['padding-bottom'], 10);
  bg.setAttribute('x', bounds.x - parseInt(style['padding-left'], 10));
  bg.setAttribute('y', bounds.y - parseInt(style['padding-top'], 10));
  bg.setAttribute('width', bounds.width + paddingLeft + paddingRight);
  bg.setAttribute('height', bounds.height + paddingTop + paddingBottom);
  bg.setAttribute('fill', style['background-color']);
  bg.setAttribute('rx', style['border-radius']);
  bg.setAttribute('stroke-width', style['border-top-width']);
  bg.setAttribute('stroke', style['border-top-color']);
  if (elem.hasAttribute('transform')) {
    bg.setAttribute('transform', elem.getAttribute('transform'));
  }
  elem.parentNode.insertBefore(bg, elem);
}

function parseDagDescription (description) {
  let parseErrored = false
  try {
    const lines = description.split('\n')
    const lineRegExp = /^\((.*?)\)(\[(.*?)\])?(-\[(.*?)\])?-(>)?\((.*?)\)(\[(.*?)\])?$/ // /^\((?<sid>.*?)\)(\[(?<slabel>.*?)\])?(-\[(?<label>.*?)\])?->\((?<tid>.*?)\)(\[(?<tlabel>.*?)\])$/
    const parsedData = []
    lines.forEach(line => {
      line = line.trim()
      if (!line) return
      try {
        const execRes  = lineRegExp.exec(line)
        if (!execRes[1] || !execRes[7]) return
        parsedData.push({
          source: {
            id: execRes[1],
            label: execRes[3]
          },
          target: {
            id: execRes[7],
            label: execRes[9],
          },
          label: execRes[5],
          option: {
            undirected: execRes[6] === '>' ? false : true
          }
        })
      } catch (err) {
        parseErrored = true
        // console.error(err)
      }
    })
    if (parseErrored) {
      this.parseErrored = true
    } else {
      this.parseErrored = false
    }
    return parsedData
  } catch (err) {
    this.parseErrored = true
    console.error(err)
    return false
  }
}

export default {
  name: 'DagMaker',
  data () {
    return {
      dagTextDescription: `(1)[状态1]-[A]->(2)[状态2]
(1)-[B]->(3)[状态3]
(1)-[C]->(4)[状态4]
(1)-[D]->(5)[状态5]
(2)-[E]->(2)
(3)-[F]->(3)
(4)-[G]->(4)
(5)-[H]->(5)
(2)-[I]->(6)[状态6]
(3)-[J]->(6)
(4)-[K]->(6)
(5)-[L]->(6)
(3)-[M]->(4)
(5)-[N]->(4)
(5)-[O]->(2)
`,
      data: [],
      align: 'undefined',
      rankdir: 'TB',
      curve: 'curveBasis',
      parseErrored: false
    }
  },
  watch: {
    dagTextDescription: function (val, oldVal) {
      this.renderSVG()
    },
    align () {
      this.renderSVG()
    },
    rankdir () {
      this.renderSVG()
    },
    curve () {
      this.renderSVG()
    }
  },
  methods: {
    parseDagDescription: parseDagDescription,
    renderSVG () {
      const dagreData = this.parseDagDescription(this.dagTextDescription);
      if (!dagreData.length) return

      // console.log(dagreData)

      const g = new dagreD3.graphlib.Graph()
        .setGraph({
          rankdir: this.rankdir,
          align: this.align === 'undefined' ? undefined : this.align
        })
        .setDefaultEdgeLabel(() => { return {}; });
      const nodes = new Map();
      /*
      * 记录所有点
      */
      dagreData.forEach(v => {
        if (!nodes.has(v.source.id) || (nodes.has(v.source.id) && !nodes.get(v.source.id).label)) {
          nodes.set(v.source.id, v.source);
        }
        if (!nodes.has(v.target.id) || (nodes.has(v.target.id) && !nodes.get(v.target.id).label)) {
          nodes.set(v.target.id, v.target);
        }
      });
      Array.from(nodes.keys()).forEach(nodeId => {
        const node = nodes.get(nodeId);
        g.setNode(nodeId, { label: node.label ? node.label : String(node.id), class: node.class });
      });
      g.nodes().forEach(v => {
        const node = g.node(v);
        // Round the corners of the nodes
        node.rx = 5;
        node.ry = 5;
      });
      /*
      * 设置全部边
      */
      dagreData.forEach(v => {
        console.log(v.option)
        g.setEdge(v.source.id, v.target.id, {
          label: v.label,
          labelpos: 'c',
          curve: d3[this.curve],
          arrowhead: v.option.undirected ? 'undirected' : undefined
        });
      });

      const render = new dagreD3.render();
      // Set up an SVG group so that we can translate the final graph.
      const svg = d3.select('#svg-canvas');
      const svgGroup = svg.append('g');
      const inner = d3.select('#svg-canvas g');
      // Run the renderer. This is what draws the final graph.
      render(d3.select('#svg-canvas g'), g);
      const xCenterOffset = (svg.attr('width') - g.graph().width) / 2;
      const zoom = d3.zoom().on('zoom', () => {
        inner.attr('transform', d3.event.transform);
      });
      svg.call(zoom);
      svg.call(zoom.transform, d3.zoomIdentity.translate(xCenterOffset, 60));
      svgGroup.attr('transform', `translate(${xCenterOffset}, 60)`);
      /*
      * 修改连线 label 的样子
      */
      const texts = this.$refs.root.querySelectorAll('.edgeLabel text');
      for (let i = 0; i < texts.length; i++) {
        makeBG(texts[i]);
      }
    }
  },
  mounted () {
    this.renderSVG()
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-panel {
  width: 1200px;
  margin: auto;
  display: flex;
}

.dag-description-panel {
  width: 400px;
}

.dag-panel {
  width: 800px;
  margin-top: 14px;
  height: calc(100vh - 28px);
}

.dag-style {
  margin-top: 14px;
  padding-right: 14px;
}

#svg-canvas {
  width: 100%;
  height: calc(100vh - 30px);
  min-height: 764px;
}

#svg-canvas >>> text {
  font-weight: 500;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serf;
  font-size: 14px;
}

#svg-canvas >>> .node rect {
  stroke: #8cc9d6;
  fill: #c8e4ea;
  stroke-width: 1.5px;
}

#svg-canvas >>> .edgePath path {
  stroke: #ededed;
  stroke-width: 1.5px;
}

#svg-canvas >>> .edgePath marker {
  fill: #ededed;
}

#svg-canvas >>> .edgeLabel text {
  background: #ededed;
  border-radius: 4px;
  padding: 4px
}

textarea.error {
  background: rgb(255, 125, 125);
}

.el-textarea >>> .el-textarea__inner {
  color: black;
  font-family: 'Courier New', Courier, monospace
}

.svg-card >>> .el-card__body {
  padding: 0;
  height: calc(100vh - 30px);
  min-height: 764px;
}

.el-textarea.isError >>> textarea {
  border-color: #f56c6c;
}

.el-card >>> .el-collapse {
  border: 0;
}
</style>
