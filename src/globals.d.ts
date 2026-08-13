// @mermaid-js/tiny ships no type declarations; it loads as a classic
// script via Vite's ?url asset import (typed by vite/client's *?url).
declare module '@mermaid-js/tiny/dist/mermaid.tiny.js?url' {
  const url: string;
  export default url;
}
