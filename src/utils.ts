// GOAT-OS External Links Configuration
// Centralized management of all external URLs and social media links

export const EXTERNAL_LINKS = {
  // Trading & DEX Links
  BUY: 'https://pump.fun/coin/9G3Q9Hxpebi36YzqnGsbf5ZDyCd6hDGMXJXAN7qLpump',
  DEXSCREENER: 'https://dexscreener.com/solana/9G3Q9Hxpebi36YzqnGsbf5ZDyCd6hDGMXJXAN7qLpump',
  DEXSCREENER_TOKEN: (contractAddress: string) => `https://dexscreener.com/solana/${contractAddress}`,
  
  // Social Media Links
  TWITTER: 'https://x.com/Goat__OS',
  TWITTER_COMMUNITY: '',
  TELEGRAM: '', // Placeholder - update with actual link
  
  // Website & Documentation
  WEBSITE: 'https://goat-os.fun',
  WHITEPAPER: '/whitepaper.pdf',
  
  // Embedded Content - Twitter embed removed
  
  // External Services
  SUPABASE_URL: 'https://zfasxsiqjlxjaqojtvzt.supabase.co',
  GOOGLE_FONTS_ICONS: 'https://fonts.googleapis.com/icon?family=Material+Icons',
  SUPABASE_CDN: 'https://unpkg.com/@supabase/supabase-js@2'
} as const;

// Contract Information
export const CONTRACT_INFO = {
  // This should be updated with the actual contract address
  ADDRESS: '9G3Q9Hxpebi36YzqnGsbf5ZDyCd6hDGMXJXAN7qLpump', // Will be set dynamically or from environment
  NETWORK: 'solana'
};

// Utility functions for link management
export const LinkUtils = {
  /**
   * Opens a link in a new tab
   */
  openInNewTab: (url: string) => {
    window.open(url, '_blank');
  },
  
  /**
   * Gets the DexScreener link for a specific token
   */
  getDexScreenerLink: (contractAddress: string) => {
    return EXTERNAL_LINKS.DEXSCREENER_TOKEN(contractAddress);
  },
  
  /**
   * Copies text to clipboard
   */
  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }
};

// Export individual links for easier imports
export const {
  BUY,
  DEXSCREENER,
  DEXSCREENER_TOKEN,
  TWITTER,
  TWITTER_COMMUNITY,
  TELEGRAM,
  WEBSITE,
  WHITEPAPER,
  SUPABASE_URL,
  GOOGLE_FONTS_ICONS,
  SUPABASE_CDN
} = EXTERNAL_LINKS;