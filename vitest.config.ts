import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        // Archivos de configuración
        'commitlint.config.js',
        'release.config.js',
        '.eslintrc.js',
        'vitest.config.ts',
        
        // Ejemplos y documentación
        'examples/**',
        'docs/**',
                
        // Otros archivos que no necesitan cobertura
        'node_modules/**',
        'dist/**',
        'test/**'
      ],
      include: [
        'src/**/*.ts'
      ],
    }
  }
})