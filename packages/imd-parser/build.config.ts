import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    dts: {
      tsconfig: 'tsconfig.src.json',
      compilerOptions: {
        composite: false,
      },
    },
  },
})
