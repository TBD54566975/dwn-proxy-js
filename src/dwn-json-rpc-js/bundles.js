import esbuild from 'esbuild';

// cjs bundle. external dependencies **not** bundled
esbuild.buildSync({
  platform       : 'node',
  bundle         : true,
  format         : 'cjs',
  packages       : 'external',
  sourcemap      : true,
  entryPoints    : ['./src/main.ts'],
  outfile        : './dist/cjs/main.cjs',
  allowOverwrite : true,
});

// esm bundle. external dependencies **not** bundled
esbuild.buildSync({
  platform       : 'node',
  bundle         : true,
  format         : 'esm',
  packages       : 'external',
  sourcemap      : true,
  entryPoints    : ['./src/main.ts'],
  outfile        : './dist/esm/main.mjs',
  allowOverwrite : true,
});
