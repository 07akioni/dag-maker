# dag-maker
`dag-maker` is a web app that paint a DAG(Directed Acyclic Graph) using relative friendly json input(although not as friendly as GUI).

## Demo
[https://07akioni.github.io/dag-maker/](https://07akioni.github.io/dag-maker/)

## TODO
- friendly error message
- abstract an npm package for dag utils
- skeleton for the loading page

## Note
- `/src/utils/dagUtils.js` can be used seperately to render a DAG. I will publish it as an npm package later.
- `/src/components/Dag.vue` is a wrapper Vue functional component for `dagUtils.js`. It can be used seperately too.