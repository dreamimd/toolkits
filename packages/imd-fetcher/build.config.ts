import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/main',
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
