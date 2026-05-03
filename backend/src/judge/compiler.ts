import { exec } from 'child_process'
import { promisify } from 'util'
import { LanguageConfig } from './languages.js'

const execAsync = promisify(exec)

export async function compile(
  boxId: number,
  config: LanguageConfig
): Promise<{ success: boolean; error?: string }> {
  if (!config.compile) return { success: true }

  const boxDir = `/var/local/lib/isolate/${boxId}/box`

  try {
    await execAsync(config.compile, { cwd: boxDir })
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.stderr || err.message }
  }
}
