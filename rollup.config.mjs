import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import * as path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);


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
      nodeResolve(),
      typescript({ exclude: ['**/__tests__/**'] })
    ]
  },
  // ES Module
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({ exclude: ['**/__tests__/**'] })
    ]
  }
];
