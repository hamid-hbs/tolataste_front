import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function walk(dir, ext, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'tolataste_back') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, ext, files)
    else if (entry.name.endsWith(ext)) files.push(full)
  }
  return files
}

function stripTsFromJsLike(content) {
  let s = content
  s = s.replace(/^export type \{[^}]+\}\s*from\s+.+;\s*$/gm, '')
  s = s.replace(/^export type \{[^}]+\}\s*$/gm, '')
  s = s.replace(/^export \{ type [^}]+\} from\s+.+;\s*$/gm, '')
  s = s.replace(/^export type \w+ = .+;\s*$/gm, '')
  s = s.replace(/^export interface \w+[^{]*\{[\s\S]*?\n\}\s*$/gm, '')
  s = s.replace(/^interface \w+[^{]*\{[\s\S]*?\n\}\s*$/gm, '')
  s = s.replace(/import \{([^}]*), type ([^}]+)\} from/g, 'import {$1, $2} from')
  s = s.replace(/import \{ type ([^,}]+)([^}]*)\} from/g, 'import {$1$2} from')
  s = s.replace(/import type \{([^}]+)\} from/g, 'import {$1} from')
  s = s.replace(/import type (\w+) from/g, 'import $1 from')
  s = s.replace(/, type \w+/g, '')
  s = s.replace(/\btype RouteRecordRaw\b/g, '')
  s = s.replace(/\btype Component\b/g, '')
  s = s.replace(/\btype Role\b/g, '')
  s = s.replace(/\btype User\b/g, '')
  s = s.replace(/\btype MenuItem\b/g, '')
  s = s.replace(/\btype MenuCategory\b/g, '')
  s = s.replace(/\btype ApiOrder\b/g, '')
  s = s.replace(/\btype OrderStatus\b/g, '')
  s = s.replace(/\btype PaymentMethod\b/g, '')
  s = s.replace(/\btype AppSettings\b/g, '')
  s = s.replace(/\btype RestaurantTable\b/g, '')
  s = s.replace(/\btype TableStatus\b/g, '')
  s = s.replace(/\btype CategoryId\b/g, '')
  s = s.replace(/\btype Product\b/g, '')
  s = s.replace(/:\s*RouteRecordRaw\[\]/g, '')
  s = s.replace(/:\s*Record<[^>]+>/g, '')
  s = s.replace(/:\s*Exclude<[^>]+>/g, '')
  s = s.replace(/:\s*Promise<[^>]+>/g, '')
  s = s.replace(/:\s*Partial<[^>]+>/g, '')
  s = s.replace(/:\s*Omit<[^>]+>/g, '')
  s = s.replace(/:\s*ApiOptions/g, '')
  s = s.replace(/:\s*ApiOrder/g, '')
  s = s.replace(/:\s*OrderStatus/g, '')
  s = s.replace(/:\s*PaymentMethod/g, '')
  s = s.replace(/:\s*OrderType/g, '')
  s = s.replace(/:\s*Role/g, '')
  s = s.replace(/:\s*User/g, '')
  s = s.replace(/:\s*MenuItem(\[\])?/g, '$1')
  s = s.replace(/:\s*MenuCategory(\[\])?/g, '$1')
  s = s.replace(/:\s*TableStatus/g, '')
  s = s.replace(/:\s*RestaurantTable/g, '')
  s = s.replace(/:\s*AppSettings/g, '')
  s = s.replace(/:\s*ApiCategory(\[\])?/g, '$1')
  s = s.replace(/:\s*ApiProduct(\[\])?/g, '$1')
  s = s.replace(/:\s*ApiTable/g, '')
  s = s.replace(/:\s*AppNotif(\[\])?/g, '$1')
  s = s.replace(/:\s*OrderItem(\[\])?/g, '$1')
  s = s.replace(/:\s*Order(\[\])?/g, '$1')
  s = s.replace(/:\s*CartItem(\[\])?/g, '$1')
  s = s.replace(/:\s*CartLine(\[\])?/g, '$1')
  s = s.replace(/:\s*Toast(\[\])?/g, '$1')
  s = s.replace(/:\s*CategoryId/g, '')
  s = s.replace(/:\s*Product/g, '')
  s = s.replace(/:\s*Category/g, '')
  s = s.replace(/:\s*string \| null/g, '')
  s = s.replace(/:\s*number \| null/g, '')
  s = s.replace(/:\s*number \| undefined/g, '')
  s = s.replace(/:\s*string \| undefined/g, '')
  s = s.replace(/:\s*boolean/g, '')
  s = s.replace(/:\s*number/g, '')
  s = s.replace(/:\s*string/g, '')
  s = s.replace(/:\s*void/g, '')
  s = s.replace(/:\s*unknown/g, '')
  s = s.replace(/:\s*any/g, '')
  s = s.replace(/:\s*Event/g, '')
  s = s.replace(/:\s*Component/g, '')
  s = s.replace(/:\s*NavLink\[\]/g, '')
  s = s.replace(/ref<[^>]+>/g, 'ref')
  s = s.replace(/computed<[^>]+>/g, 'computed')
  s = s.replace(/ as string/g, '')
  s = s.replace(/ as HTMLImageElement/g, '')
  s = s.replace(/ as HTMLInputElement/g, '')
  s = s.replace(/ as PaymentMethod/g, '')
  s = s.replace(/ as any/g, '')
  s = s.replace(/ as T/g, '')
  s = s.replace(/ as number\[\]/g, '')
  s = s.replace(/ as CartItem\[\]/g, '')
  s = s.replace(/ as const/g, '')
  s = s.replace(/ as Order\['source'\]/g, '')
  s = s.replace(/ as OrderStatus/g, '')
  s = s.replace(/undefined as T/g, 'undefined')
  s = s.replace(/api\.get<[^>]+>/g, 'api.get')
  s = s.replace(/api\.post<[^>]+>/g, 'api.post')
  s = s.replace(/api\.patch<[^>]+>/g, 'api.patch')
  s = s.replace(/api\.del<[^>]+>/g, 'api.del')
  s = s.replace(/api\.unwrapList<[^>]+>/g, 'api.unwrapList')
  s = s.replace(/request<[^>]+>/g, 'request')
  s = s.replace(/unwrapList<[^>]+>/g, 'unwrapList')
  s = s.replace(/get: <T>/g, 'get:')
  s = s.replace(/post: <T>/g, 'post:')
  s = s.replace(/patch: <T>/g, 'patch:')
  s = s.replace(/del: <T>/g, 'del:')
  s = s.replace(/async function request<T>/g, 'async function request')
  s = s.replace(/function unwrapList<T>/g, 'function unwrapList')
  s = s.replace(/\(headers as Record<string, string>\)/g, 'headers')
  s = s.replace(/extends RequestInit \{[\s\S]*?\}/g, '')
  s = s.replace(/\.filter\(\([^)]+\): [^)]+\)/g, (m) => m.replace(/: [^)]+$/, ')'))
  s = s.replace(/catch \(e: any\)/g, 'catch (e)')
  s = s.replace(/export const formatPrice = \(price: number\): string =>/g, 'export const formatPrice = (price) =>')
  s = s.replace(/export const getProductById = \(id: string\): Product \| undefined =>/g, 'export const getProductById = (id) =>')
  s = s.replace(/export const getCategoryById = \(id: CategoryId\): Category \| undefined =>/g, 'export const getCategoryById = (id) =>')
  s = s.replace(/export const getPopularProducts = \(\): Product\[\] =>/g, 'export const getPopularProducts = () =>')
  s = s.replace(/export type CategoryId =[\s\S]*?\n\nexport interface Category[\s\S]*?\n\}\s*\n\nexport interface Product[\s\S]*?\n\}\s*\n\n/, '')
  s = s.replace(/export type \{ MenuItem \}\s*\n/, '')
  s = s.replace(/export \{ MenuCategory \}\s*\n/, '')
  s = s.replace(/export type \{ OrderStatus, PaymentMethod \}\s*\n/, '')
  s = s.replace(/export type OrderType =[^\n]+\n\n/, '')
  s = s.replace(/export interface OrderItem[\s\S]*?\n\}\s*\n\nexport interface Order[\s\S]*?\n\}\s*\n\n/, '')
  s = s.replace(/export type \{ AppSettings \}\s*\n/, '')
  s = s.replace(/export type PaymentMethod =[^\n]+\n\n/, '')
  s = s.replace(/export type \{ RestaurantTable, TableStatus \}\s*\n/, '')
  s = s.replace(/export interface Toast[\s\S]*?\n\}\s*\n\n/, '')
  s = s.replace(/export interface CartItem[\s\S]*?\n\}\s*\n\nexport interface CartLine[\s\S]*?\n\}\s*\n\n/, '')
  s = s.replace(/export interface CartItem[\s\S]*?\n\}\s*\n\n/, '')
  s = s.replace(/export type \{ Role, User \}\s*\n/, '')
  s = s.replace(/export type \{ MenuItem as MenuProduct, MenuCategory \} from[^\n]+\n/, '')
  s = s.replace(/if \(!auth\.hasRole\(role as any\)\)/g, 'if (!auth.hasRole(role))')
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim() + '\n'
}

function convertVue(content) {
  let s = content
  s = s.replace(/<script setup lang="ts">/g, '<script setup>')
  s = stripTsFromJsLike(s)

  s = s.replace(
    /defineProps<\{ modelValue: string \}>\(\)/g,
    "defineProps({ modelValue: { type: String, required: true } })",
  )
  s = s.replace(
    /const emit = defineEmits<\{ \(e: 'update:modelValue', value: string\): void; \(e: 'filter'\): void \}>\(\)/g,
    "const emit = defineEmits(['update:modelValue', 'filter'])",
  )
  s = s.replace(
    /defineEmits<\{ \(e: 'update:modelValue', value: string\): void; \(e: 'filter'\): void \}>\(\)/g,
    "defineEmits(['update:modelValue', 'filter'])",
  )
  s = s.replace(
    /defineEmits<\{ \(e: 'increment'\): void; \(e: 'decrement'\): void; \(e: 'remove'\): void \}>\(\)/g,
    "defineEmits(['increment', 'decrement', 'remove'])",
  )
  s = s.replace(
    /defineEmits<\{ \(e: 'action'\): void \}>\(\)/g,
    "defineEmits(['action'])",
  )
  s = s.replace(
    /defineEmits<\{ \(e: 'update:modelValue', value: CategoryId \| 'all'\): void \}>\(\)/g,
    "defineEmits(['update:modelValue'])",
  )
  s = s.replace(
    /const props = defineProps<\{ id: string \}>\(\)/g,
    "const props = defineProps({ id: { type: String, required: true } })",
  )
  s = s.replace(
    /withDefaults\(defineProps<\{ size\?: number \}>\(\), \{ size: 36 \}\)/g,
    "defineProps({ size: { type: Number, default: 36 } })",
  )
  s = s.replace(
    /withDefaults\(defineProps<\{ price: number; size\?: 'sm' \| 'md' \| 'lg' \}>\(\), \{ size: 'md' \}\)/g,
    "defineProps({ price: { type: Number, required: true }, size: { type: String, default: 'md' } })",
  )
  s = s.replace(
    /withDefaults\(defineProps<\{ rating: number; size\?: 'sm' \| 'md' \}>\(\), \{ size: 'md' \}\)/g,
    "defineProps({ rating: { type: Number, required: true }, size: { type: String, default: 'md' } })",
  )
  s = s.replace(
    /withDefaults\(\s*defineProps<\{ variant\?: 'primary' \| 'secondary' \| 'ghost' \| 'dark' \| 'outline'; block\?: boolean; disabled\?: boolean \}>\(\),\s*\{ variant: 'primary', block: false, disabled: false \},\s*\)/g,
    "defineProps({ variant: { type: String, default: 'primary' }, block: { type: Boolean, default: false }, disabled: { type: Boolean, default: false } })",
  )
  s = s.replace(
    /withDefaults\(defineProps<\{ icon\?: Component; title: string; subtitle\?: string; action\?: string \}>\(\), \{[^}]+\}\)/g,
    "defineProps({ icon: { type: Object, default: undefined }, title: { type: String, required: true }, subtitle: { type: String, default: undefined }, action: { type: String, default: undefined } })",
  )
  s = s.replace(
    /const props = withDefaults\(defineProps<\{ productId: number; size\?: 'sm' \| 'md' \| 'lg' \}>\(\), \{\s*size: 'md',\s*\}\)/g,
    "const props = defineProps({ productId: { type: Number, required: true }, size: { type: String, default: 'md' } })",
  )
  s = s.replace(
    /const props = defineProps<\{ product: MenuItem; compact\?: boolean \}>\(\)/g,
    "const props = defineProps({ product: { type: Object, required: true }, compact: { type: Boolean, default: false } })",
  )
  s = s.replace(
    /defineProps<\{ product: Product; qty: number \}>\(\)/g,
    "defineProps({ product: { type: Object, required: true }, qty: { type: Number, required: true } })",
  )
  s = s.replace(
    /defineProps<\{\s*modelValue: CategoryId \| 'all'\s*\}>\(\)/g,
    "defineProps({ modelValue: { type: String, required: true } })",
  )
  s = s.replace(
    /const props = defineProps<\{\s*name: string\s*category\?: string[^}]*size\?: 'sm' \| 'md' \| 'lg'\s*\}>\(\)/g,
    "const props = defineProps({ name: { type: String, required: true }, category: { type: String, default: undefined }, size: { type: String, default: undefined } })",
  )
  s = s.replace(
    /const props = defineProps<\{\n  name: string\n  category\?: string[^\n]*\n  size\?: 'sm' \| 'md' \| 'lg'\n}>\(\)/g,
    "const props = defineProps({ name: { type: String, required: true }, category: { type: String, default: undefined }, size: { type: String, default: undefined } })",
  )
  s = s.replace(/import type \{ MenuItem \} from '@\/stores\/menu'\n/g, '')
  s = s.replace(/import type \{ Product \} from '@\/data\/menu'\n/g, '')
  s = s.replace(/import type \{ OrderStatus \} from '@\/stores\/orders'\n/g, '')
  s = s.replace(/import type \{ Component \} from 'vue'\n/g, '')
  s = s.replace(/, type Component/g, '')
  s = s.replace(/import \{ useAuthStore, type Role \} from '@\/stores\/auth'/g, "import { useAuthStore } from '@/stores/auth'")
  s = s.replace(/interface NavLink \{[\s\S]*?\n\}\s*\n/g, '')
  s = s.replace(/@error="\(e: any\) =>/g, '@error="(e) =>')
  s = s.replace(/@error="\(\$event\) => \{ const el = \$event\.target; el\.src/g, '@error="($event) => { const el = $event.target; el.src')
  return s
}

// Convert .ts -> .js
for (const file of walk(root, '.ts')) {
  if (file.endsWith('.d.ts')) {
    fs.unlinkSync(file)
    continue
  }
  const jsFile = file.replace(/\.ts$/, '.js')
  const content = fs.readFileSync(file, 'utf8')
  fs.writeFileSync(jsFile, stripTsFromJsLike(content))
  fs.unlinkSync(file)
  console.log('Converted', path.relative(root, file), '->', path.relative(root, jsFile))
}

// Convert Vue SFC scripts
for (const file of walk(path.join(root, 'src'), '.vue')) {
  const content = fs.readFileSync(file, 'utf8')
  fs.writeFileSync(file, convertVue(content))
  console.log('Updated Vue', path.relative(root, file))
}

// Update index.html
const indexHtml = path.join(root, 'index.html')
fs.writeFileSync(indexHtml, fs.readFileSync(indexHtml, 'utf8').replace('/src/main.ts', '/src/main.js'))

// Remove tsconfig files
for (const f of ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'tsconfig.app.tsbuildinfo', 'tsconfig.node.tsbuildinfo']) {
  const p = path.join(root, f)
  if (fs.existsSync(p)) fs.unlinkSync(p)
}

console.log('Done.')
