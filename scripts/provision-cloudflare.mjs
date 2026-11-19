import { spawnSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const root = process.cwd()
const configPath = resolve(root, 'wrangler.jsonc')
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT ?? 'tellezsoftware'
const names = {
  productionDatabase: projectName,
  previewDatabase: `${projectName}-preview`,
  productionBucket: `${projectName}-files-production`,
  previewBucket: `${projectName}-files-preview`,
}
const apply = process.argv.includes('--apply')
const check = process.argv.includes('--check')

function wrangler(args, { allowFailure = false } = {}) {
  const command = resolve(root, 'node_modules/wrangler/bin/wrangler.js')
  const result = spawnSync(process.execPath, [command, ...args], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  })

  if (result.error) throw result.error
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`wrangler ${args.join(' ')} failed (exit ${result.status}).\n${output}`)
  }
  return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '', output }
}

function parseJson(output, description) {
  try {
    return JSON.parse(output)
  } catch {
    throw new Error(`Could not parse Wrangler JSON for ${description}.\n${output}`)
  }
}

function readDatabaseList(output) {
  const value = parseJson(output, 'D1 database list')
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray(value.result)) return value.result
  if (value && typeof value === 'object' && Array.isArray(value.results)) return value.results
  throw new Error('Wrangler returned an unexpected D1 database list shape.')
}

function readPagesProjectList(output) {
  const value = parseJson(output, 'Pages project list')
  if (!Array.isArray(value)) throw new Error('Wrangler returned an unexpected Pages project list shape.')
  return value
}

function getDatabaseId(database, expectedName) {
  if (!database || typeof database !== 'object' || database.name !== expectedName) {
    throw new Error(`D1 database "${expectedName}" was not found or has an unexpected response.`)
  }
  const id = database.uuid ?? database.database_id ?? database.id
  if (typeof id !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu.test(id)) {
    throw new Error(`D1 database "${expectedName}" does not have a valid Cloudflare UUID.`)
  }
  if (/^0{8}-0{4}-0{4}-0{4}-0{12}$/u.test(id)) {
    throw new Error(`D1 database "${expectedName}" returned the all-zero placeholder UUID.`)
  }
  return id
}

function getBucketName(info, expectedName) {
  if (!info || typeof info !== 'object' || info.name !== expectedName) {
    throw new Error(`R2 bucket "${expectedName}" was not found or has an unexpected response.`)
  }
  return info.name
}

async function loadProductionConfig() {
  let contents
  try {
    contents = await readFile(configPath, 'utf8')
  } catch (error) {
    throw new Error(`Cannot read ${configPath}: ${error.message}`)
  }

  let config
  try {
    config = JSON.parse(contents)
  } catch {
    throw new Error('wrangler.jsonc must contain valid JSON (JSONC comments are not accepted by this provisioning check).')
  }
  return config
}

function validateProductionConfig(config) {
  if (config.name !== projectName) {
    throw new Error(`Expected Pages project "${projectName}" in wrangler.jsonc, found "${config.name ?? '(missing)'}".`)
  }
  if (config.pages_build_output_dir !== './dist') {
    throw new Error('wrangler.jsonc must publish the Vite build directory "./dist".')
  }
  const productionDb = config.d1_databases?.find((binding) => binding.binding === 'DB')
  const previewDb = config.env?.preview?.d1_databases?.find((binding) => binding.binding === 'DB')
  const productionR2 = config.r2_buckets?.find((binding) => binding.binding === 'FILES')
  const previewR2 = config.env?.preview?.r2_buckets?.find((binding) => binding.binding === 'FILES')

  for (const [label, binding, expectedName] of [
    ['production D1', productionDb, names.productionDatabase],
    ['preview D1', previewDb, names.previewDatabase],
  ]) {
    if (!binding || binding.database_name !== expectedName) {
      throw new Error(`${label} binding is missing or points to an unexpected database.`)
    }
    getDatabaseId({ name: binding.database_name, uuid: binding.database_id }, expectedName)
  }
  for (const [label, binding, expectedName] of [
    ['production R2', productionR2, names.productionBucket],
    ['preview R2', previewR2, names.previewBucket],
  ]) {
    if (!binding || binding.bucket_name !== expectedName) {
      throw new Error(`${label} binding is missing or points to an unexpected bucket.`)
    }
  }
  return { productionDb, previewDb, productionR2, previewR2 }
}

async function checkOnly() {
  const config = await loadProductionConfig()
  const bindings = validateProductionConfig(config)
  console.log('Production and preview Wrangler bindings are configured.')
  console.log(`Pages project: ${projectName}`)
  console.log(`Production D1: ${names.productionDatabase} (${bindings.productionDb.database_id})`)
  console.log(`Preview D1: ${names.previewDatabase} (${bindings.previewDb.database_id})`)
  console.log(`Production R2: ${names.productionBucket}`)
  console.log(`Preview R2: ${names.previewBucket}`)
}

async function listDatabases() {
  const result = wrangler(['d1', 'list', '--json'])
  return readDatabaseList(result.stdout)
}

function verifyPagesProject() {
  const result = wrangler(['pages', 'project', 'list', '--json'])
  const projects = readPagesProjectList(result.stdout)
  const project = projects.find((item) => item?.['Project Name'] === projectName)
  if (!project) {
    throw new Error(`Cloudflare Pages project "${projectName}" was not found in the authenticated account.`)
  }
  if (project['Git Provider'] !== 'Yes') {
    throw new Error(`Cloudflare Pages project "${projectName}" is not connected to a Git provider.`)
  }
  console.log(`Verified Git-connected Pages project "${projectName}".`)
}

async function ensureDatabase(existing, name) {
  const found = existing.find((database) => database?.name === name)
  if (found) {
    console.log(`Using existing D1 database "${name}".`)
    return getDatabaseId(found, name)
  }

  console.log(`Creating D1 database "${name}"...`)
  const result = wrangler(['d1', 'create', name])
  const refreshed = await listDatabases()
  const created = refreshed.find((database) => database?.name === name)
  if (created) return getDatabaseId(created, name)

  const uuid = result.output.match(/\b[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\b/iu)?.[0]
  if (!uuid) throw new Error(`D1 database "${name}" was created, but Wrangler did not return its UUID. Rerun provisioning to discover it.`)
  return getDatabaseId({ name, uuid }, name)
}

function inspectBucket(name) {
  const result = wrangler(['r2', 'bucket', 'info', name, '--json'], { allowFailure: true })
  if (result.status !== 0) return null
  return getBucketName(parseJson(result.stdout, `R2 bucket "${name}"`), name)
}

function ensureBucket(name) {
  const existing = inspectBucket(name)
  if (existing) {
    console.log(`Using existing R2 bucket "${name}".`)
    return existing
  }

  console.log(`Creating R2 bucket "${name}"...`)
  const created = wrangler(['r2', 'bucket', 'create', name], { allowFailure: true })
  if (created.status === 0) return name

  const appeared = inspectBucket(name)
  if (appeared) {
    console.log(`R2 bucket "${name}" already existed; verified with Wrangler.`)
    return appeared
  }
  throw new Error(`Could not create or verify R2 bucket "${name}".\n${created.output}`)
}

function buildConfig(ids) {
  return {
    $schema: 'node_modules/wrangler/config-schema.json',
    name: projectName,
    compatibility_date: '2026-11-12',
    pages_build_output_dir: './dist',
    d1_databases: [
      {
        binding: 'DB',
        database_name: names.productionDatabase,
        database_id: ids.productionDatabase,
        migrations_dir: 'migrations',
      },
    ],
    r2_buckets: [
      { binding: 'FILES', bucket_name: names.productionBucket },
    ],
    env: {
      preview: {
        d1_databases: [
          {
            binding: 'DB',
            database_name: names.previewDatabase,
            database_id: ids.previewDatabase,
            migrations_dir: 'migrations',
          },
        ],
        r2_buckets: [
          { binding: 'FILES', bucket_name: names.previewBucket },
        ],
      },
    },
  }
}

function promptForConfirmation() {
  return createInterface({ input: stdin, output: stdout })
}

async function provision() {
  if (!apply) {
    console.log('No changes made. Run `npm run infra:provision -- --apply` to create/verify resources and apply migrations.')
    console.log(`Resources: ${Object.values(names).join(', ')}`)
    return
  }

  const terminal = promptForConfirmation()
  try {
    const answer = await terminal.question(
      `This will create/verify four Cloudflare resources and apply SQL migrations to production and preview D1. Continue? Type "yes": `,
    )
    if (answer.trim().toLowerCase() !== 'yes') {
      console.log('Cancelled; no Cloudflare resources were changed.')
      return
    }
  } finally {
    terminal.close()
  }

  verifyPagesProject()
  const currentDatabases = await listDatabases()
  const ids = {
    productionDatabase: await ensureDatabase(currentDatabases, names.productionDatabase),
    previewDatabase: await ensureDatabase(currentDatabases, names.previewDatabase),
  }
  ensureBucket(names.productionBucket)
  ensureBucket(names.previewBucket)

  const config = buildConfig(ids)
  validateProductionConfig(config)
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
  console.log('Wrote wrangler.jsonc with verified Cloudflare resource identifiers.')

  wrangler(['types', '--config', 'wrangler.local.jsonc'])
  wrangler(['d1', 'migrations', 'apply', names.productionDatabase, '--remote', '--config', 'wrangler.jsonc'])
  wrangler(['d1', 'migrations', 'apply', names.previewDatabase, '--remote', '--config', 'wrangler.jsonc', '--env', 'preview'])
  console.log('Provisioning complete. The Wrangler config is now the Pages Functions production/preview source of truth.')
}

try {
  if (check) await checkOnly()
  else await provision()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
