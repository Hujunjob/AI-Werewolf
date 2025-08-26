/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
    LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY || '',
    LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY || '',
    LANGFUSE_BASEURL: process.env.LANGFUSE_BASEURL || '',
  },
}

module.exports = nextConfig