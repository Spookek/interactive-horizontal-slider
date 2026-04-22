/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/unity/Build/:file*.framework.js.br",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Content-Encoding", value: "br" }
        ]
      },
      {
        source: "/unity/Build/:file*.wasm.br",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Content-Encoding", value: "br" }
        ]
      },
      {
        source: "/unity/Build/:file*.data.br",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Content-Encoding", value: "br" }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
