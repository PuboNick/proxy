import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve({
      customResolveOptions: {
        moduleDirectories: ['node_modules'],
      },
    }),
    commonjs(),
    json(),
    babel({ babelHelpers: 'bundled' }),
  ],
  external: [
    'express',
    'log4js',
    'connect-multiparty',
    'dotenv',
    'axios',
    'moment',
    'qs',
    'form-data',
  ],
};
