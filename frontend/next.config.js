/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  images: {
    domains: ['res.cloudinary.com']
  }
}

module.exports = nextConfig