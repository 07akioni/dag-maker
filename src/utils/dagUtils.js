import dagreD3 from 'dagre-d3'
import * as d3 from './dagD3importer'


/**
 * Generate a graphId for the graph to support multi graph rendering
 */
function graphId () {
  return parseInt((1 + Math.random()) * (Number.MAX_SAFE_INTEGER / 2)).toString(16).slice(0, 8)
}

function createSvgElement (tag) {
  const svgns = 'http://www.w3.org/2000/svg'
  return document.createElementNS(svgns, tag)
}

/**
 * Stringify the style object to generate valid input for dagreD3
 */
function stringifyStyle (style) {
  if (!style) return null
  return Object.keys(style)
    .map(key => `${key}: ${style[key]};`)
    .reduce((p, c) => p + c, '')
}

/**
 * Generate options for the graph
 */
function graphOptions (options) {
  const rankdirOptions = ['TB', 'LR', 'BT', 'RL']
  const alignOptions = ['UL', 'UR', 'DL', 'DR']
  const defaultOptions = {
    rankdir: 'TB',
    align: undefined
  }
  if (!options) return defaultOptions
  else return Object.assign(defaultOptions, options)
}

/**
 * TODO: More friendly error message.
 * @param {object} graph 
 */
function validateGraph (graph) {
  if (!graph || typeof graph !== 'object') {
    throw new Error('Input graph is not an object.')
  }
  if (graph.options && typeof graph.options !== 'object') {
    throw new Error('Options of the graph is not an object.')
  }
  const { nodes, links } = graph
  if (!Array.isArray(links)) {
    throw new Error('`links` of the graph is not an Array.')
  }
  if (!Array.isArray(nodes)) {
    throw new Error('`nodes` of the graph is not an Array.')
  }
  if (!nodes.every(node => node.id)) {
    throw new Error('Some nodes don\'t have `id` property.')
  }
  if (!links.every(link => (link.from && link.to))) {
    throw new Error('Some links don\'t have `from` or `to` property.')
  }
  const nodeIds = new Set(nodes.map(node => node.id))
  if (!links.every(link => nodeIds.has(link.from) && nodeIds.has(link.to))) {
    throw new Error('Some links\' vertexes don\'t appear in nodes.')
  }
  return graph
}

/**
 * Generate node's options based on default node options
 */
function nodeOptions (node) {
  const shapeOptions = ['rect', 'circle', 'ellipse', 'diamond']
  const defaultStyle = {
    rx: '5px',
    ry: '5px',
    stroke: '#8cc9d6',
    fill: '#c8e4ea',
    'stroke-width': '1.5px'
  }
  const defaultLabelStyle = {
    'font-weight': '500',
    'font-family': "'Helvetica Neue', Helvetica, Arial, sans-serf",
    'font-size': '14px'
  }
  const defaultOption = {
    label: String(node.id),
    shape: node.shape ? node.shape : shapeOptions[0]
  }
  return Object.assign(defaultOption, node, {
    style: stringifyStyle(Object.assign(defaultStyle, node.style)),
    labelStyle: stringifyStyle(Object.assign(defaultLabelStyle, node.labelStyle)),
  })
}

/**
 * Generate link's options based on default link options
 */
function linkOptions (link) {
  const curveOptions = ['curveBasis', 'curveLinear', 'curveMonotoneX',
    'curveMonotoneY', 'curveStep', 'curveNatural', 'curveBundle',
    'curveCatmullRom']
  const arrowheadOptions = ['normal', 'vee', 'undirected']
  const labelposOptions = ['c', 'l', 'r']
  const defaultStyle = {
    fill: 'none',
    stroke: '#ededed',
    'stroke-width': '1.5px'
  }
  const defaultLabelStyle = {
    'font-weight': '500',
    'font-family': "'Helvetica Neue', Helvetica, Arial, sans-serf",
    'font-size': '14px',
    background: '#ededed',
    'border-radius': '4px',
    padding: '4px 8px 5px 8px'
  }
  const defaultArrawheadStyle = {
    fill: '#ededed',
  }
  const defaultOptions = {
    label: '',
    arrowhead: arrowheadOptions[0],
    labelpos: labelposOptions[0],
    curve: d3['curveBasis'],
    
  }
  return Object.assign(defaultOptions, link, {
    style: stringifyStyle(Object.assign(defaultStyle, link.style)),
    labelStyle: stringifyStyle(Object.assign(defaultLabelStyle, link.labelStyle)),
    arrowheadStyle: stringifyStyle(Object.assign(defaultArrawheadStyle, link.arrowheadStyle))
  })
}

/**
 * Polyfill background related styles for a svg element
 */
function setBackgroundFor (elem) {
  const svgns = 'http://www.w3.org/2000/svg'
  const bounds = elem.getBBox()
  if (!bounds.width && !bounds.height) return
  const background = document.createElementNS(svgns, 'rect')
  const style = getComputedStyle(elem)
  const paddingTop = parseInt(style['padding-top'], 10)
  const paddingLeft = parseInt(style['padding-left'], 10)
  const paddingRight = parseInt(style['padding-right'], 10)
  const paddingBottom = parseInt(style['padding-bottom'], 10)
  background.setAttribute('x', bounds.x - parseInt(style['padding-left'], 10))
  background.setAttribute('y', bounds.y - parseInt(style['padding-top'], 10))
  background.setAttribute('width', bounds.width + paddingLeft + paddingRight)
  background.setAttribute('height', bounds.height + paddingTop + paddingBottom)
  background.setAttribute('fill', style['background-color'])
  background.setAttribute('rx', style['border-radius'])
  background.setAttribute('stroke-width', style['border-top-width'])
  background.setAttribute('stroke', style['border-top-color'])
  if (elem.hasAttribute('transform')) {
    background.setAttribute('transform', elem.getAttribute('transform'))
  }
  elem.parentNode.insertBefore(background, elem)
}

/**
 * Generate a d3 dag graph based on input graph and options
 */
function d3DagGraph (graph, options) {
  const d3Graph = new dagreD3.graphlib.Graph().setGraph(options)
  const { nodes, links } = graph
  nodes.forEach(node => d3Graph.setNode(node.id, nodeOptions(node)))
  links.forEach(link => d3Graph.setEdge(link.from, link.to, linkOptions(link)))
  return d3Graph
}

/**
 * 
 * @param {string} el selector for svg
 */
function setBackgroundForText (el) {
  const textEls = document.querySelectorAll(`${el} text`)
  textEls.forEach(textEl => setBackgroundFor(textEl))
}

function calculateOffset (defaultOffset, offset, containerLength, graphLength) {
  if (typeof offset === 'function') {
    return offset(containerLength, graphLength)
  } else if (Number.isInteger(offset)) {
    return offset
  }
  if (typeof defaultOffset === 'function') {
    return defaultOffset(containerLength, graphLength)
  }
  return defaultOffset
}

/**
 *
 * @param {Element} group 
 * @param {object} graph 
 * @param {string} el selector for svg
 */
function setInitOffsetAndZoom (group, graph, el, graphOptions) {
  const svg = d3.select(el)
  const { width: svgWidth, height: svgHeight } = document.querySelector(el).getBoundingClientRect()
  const { width: graphWidth, height: graphHeight } = graph.graph()
  const xOffset = calculateOffset((svgWidth - graphWidth) / 2, graphOptions.xOffset, svgWidth, graphWidth)
  const yOffset = calculateOffset(60, graphOptions.yOffset, svgHeight, graphHeight)
  /** When there is no node, graphWidth is -Infinity */
  if (!Number.isFinite(xOffset)) return
  const zoom = d3.zoom().on('zoom', () => {
    group.attr('transform', d3.event.transform)
  })
  svg.call(zoom)
  svg.call(zoom.transform, d3.zoomIdentity.translate(xOffset, yOffset))
  group.attr('transform', `translate(${xOffset}, ${yOffset})`)
}

/**
 * @param {string} el selector for svg
 */
function renderDag (el, graph) {
  const svg = document.querySelector(el)
  {
    /** Validate selected element */
    if (!svg) throw Error(`No element is selected using \`${el}\`.`)
    else if (svg && svg.tagName !== 'svg') throw Error(`Selected element's tag is not \'svg\'.`)
  }
  {
    /** Clean svg and append a group to it */
    const g = createSvgElement('g')
    svg.innerHTML = ""
    svg.appendChild(g)
  }
  let options = graphOptions(graph.options)
  try {
    /** convert input graph to a D3 graph */
    graph = d3DagGraph(validateGraph(graph), options)
  } catch (err) {
    console.log('catch', err.message)
    return
  }
  {
    /** Render the graph */
    const render = new dagreD3.render()
    const group = d3.select(`${el} > g`)
    render(group, graph)
    setInitOffsetAndZoom(group, graph, el, options)
  }
  /** Set background for labels of links */
  setBackgroundForText(el)
}

export {
  graphId,
  renderDag
}