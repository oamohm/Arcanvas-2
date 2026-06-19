/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_ARC_CHAIN_ID: '2222',
    NEXT_PUBLIC_ARC_RPC: 'https://rpc.testnet.arc.io',
    NEXT_PUBLIC_ARCSCAN: 'https://testnet.arcscan.app',
    NEXT_PUBLIC_USDC_ADDRESS: '0x0000000000000000000000000000000000000000',
    NEXT_PUBLIC_ROYALTY_BPS: '50',
  },
  webpack(config, { isServer }) {
    if (!isServer) config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};
