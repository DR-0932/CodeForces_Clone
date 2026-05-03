import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)
const ISOLATE = '/usr/local/bin/isolate'

export interface SandboxResult {
  stdout: string
  timeUsed: number   // ms
  memoryUsed: number  // KB
  status: 'OK' | 'TLE' | 'MLE' | 'RE'
}

export async function initBox(boxId: number): Promise<void> {
  await execAsync(`${ISOLATE} --box-id=${boxId} --init`)
}

export async function cleanupBox(boxId: number): Promise<void> {
  await execAsync(`${ISOLATE} --box-id=${boxId} --cleanup`)
}

export async function runInSandbox(
  boxId: number,
  run: string,
  input: string,
  timeLimit: number,    // ms
  memoryLimit: number   // MB
): Promise<SandboxResult> {
  const boxDir = `/var/local/lib/isolate/${boxId}/box`
  const metaFile = `/tmp/meta-${boxId}.txt`
  const inputFile = path.join(boxDir, 'input.txt')

  await writeFile(inputFile, input)

  const timeLimitSec = (timeLimit / 1000).toFixed(3)
  const wallLimit = (parseFloat(timeLimitSec) * 3).toFixed(3)

  const cmd = [
    ISOLATE,
    `--box-id=${boxId}`,
    `--mem=${memoryLimit * 1024}`,
    `--time=${timeLimitSec}`,
    `--wall-time=${wallLimit}`,
    `--meta=${metaFile}`,
    '--stdin=input.txt',
    '--run', '--',
    ...run.split(' '),
  ].join(' ')

  let stdout = ''
  let exitCode = 0

  try {
    const result = await execAsync(cmd, { cwd: boxDir })
    stdout = result.stdout
  } catch (err: any) {
    stdout = err.stdout || ''
    exitCode = err.code || 1
  }

  let timeUsed = 0
  let memoryUsed = 0
  let status: SandboxResult['status'] = 'OK'

  try {
    const meta = await readFile(metaFile, 'utf-8')
    for (const line of meta.split('\n')) {
      const [key, value] = line.split(':')
      if (key === 'time') timeUsed = Math.round(parseFloat(value) * 1000)
      if (key === 'max-rss') memoryUsed = parseInt(value)
      if (key === 'status') {
        if (value?.trim() === 'TO') status = 'TLE'
        else if (value?.trim() === 'SG') status = 'MLE'
        else if (value?.trim() === 'RE') status = 'RE'
      }
    }
  } catch {}

  if (exitCode !== 0 && status === 'OK') status = 'RE'

  return { stdout, timeUsed, memoryUsed, status }
}
