import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import * as path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// 빌드 시 압축된 date-index를 사용하도록 alias 설정
const aliasPlugin = alias({
  entries: [
    {
      find: /^(.*)\/data\/date-index$/,
      replacement: '$1/data/date-index-compressed'
    }
  ]
});

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      aliasPlugin,
      nodeResolve(),
      typescript()
    ]
  },
  // ES Module
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      aliasPlugin,
      nodeResolve(),
      typescript()
    ]
  }
];
