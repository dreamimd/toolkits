// 删除所有 workspace 中的 node_modules 目录
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rm } from 'node:fs/promises'
import { findWorkspacePackages } from '@pnpm/find-workspace-packages'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function dir(...paths: string[]) {
  return resolve(__dirname, '..', ...paths)
}

const rootDir = dir()
const workspaces = await findWorkspacePackages(rootDir)
const nodeModulePaths = workspaces.map(item => resolve(item.dir, 'node_modules'))

for (let i = 0; i < nodeModulePaths.length; i++) {
  const modulePath = nodeModulePaths[i]
  console.log(`Removing ${modulePath}`)
  try {
    await rm(modulePath, { force: true, recursive: true })
  }
  catch (e) {
    console.error(e)
  }
}
