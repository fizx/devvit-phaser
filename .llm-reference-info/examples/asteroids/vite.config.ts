import { defineConfig } from "vite";

export default defineConfig({
  root: "src/client",
  build: {
    outDir: "../../webroot",
    emptyOutDir: true,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"], // Separate Phaser into its own chunk
          vendor: ["@devvit/public-api", "devvit", "devvit-hub"], // Group Devvit dependencies
        },
      },
      treeshake: {
        moduleSideEffects: false, // Assume modules have no side effects
        propertyReadSideEffects: false, // More aggressive property access optimization
        tryCatchDeoptimization: false, // More aggressive try-catch optimization
      },
    },
    terserOptions: {
      compress: {
        passes: 2, // Multiple compression passes
        pure_funcs: ["console.log", "console.info", "console.debug"], // Remove debug logs
        drop_console: true, // Remove all console.* calls in production
        unsafe: true, // Enable "unsafe" optimizations
        unsafe_math: true, // Enable "unsafe" math optimizations
      },
    },
  },
});
