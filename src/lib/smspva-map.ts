// Static mapping of SMSPVA service opt codes → display info
// Logo slug is a SimpleIcons slug (https://cdn.simpleicons.org/{slug})
export interface SvcInfo { name: string; c: string; slug?: string }

export const SMSPVA_MAP: Record<string, SvcInfo> = {
  // ── Messaging ──────────────────────────────────────────
  opt29:  { name: 'Telegram',    c: '#2CA5E0', slug: 'telegram'    },
  opt20:  { name: 'WhatsApp',    c: '#25D366', slug: 'whatsapp'    },
  opt30:  { name: 'Viber',       c: '#7360F2', slug: 'viber'       },
  opt59:  { name: 'Signal',      c: '#3A76F0', slug: 'signal'      },
  opt10:  { name: 'WeChat',      c: '#07C160', slug: 'wechat'      },
  opt11:  { name: 'Line',        c: '#00B900', slug: 'line'        },
  opt21:  { name: 'KakaoTalk',   c: '#FFCD00', slug: 'kakaotalk'   },
  opt51:  { name: 'Skype',       c: '#00AFF0', slug: 'skype'       },
  opt28:  { name: 'TamTam',      c: '#0088CC', slug: undefined     },

  // ── Social ─────────────────────────────────────────────
  opt2:   { name: 'Facebook',    c: '#1877F2', slug: 'facebook'    },
  opt16:  { name: 'Instagram',   c: '#E1306C', slug: 'instagram'   },
  opt8:   { name: 'Twitter',     c: '#000000', slug: 'x'           },
  opt19:  { name: 'Snapchat',    c: '#FFFC00', slug: 'snapchat'    },
  opt104: { name: 'TikTok',      c: '#010101', slug: 'tiktok'      },
  opt105: { name: 'YouTube',     c: '#FF0000', slug: 'youtube'     },
  opt107: { name: 'Twitch',      c: '#9146FF', slug: 'twitch'      },
  opt40:  { name: 'Pinterest',   c: '#E60023', slug: 'pinterest'   },
  opt38:  { name: 'LinkedIn',    c: '#0A66C2', slug: 'linkedin'    },
  opt47:  { name: 'Tumblr',      c: '#35465C', slug: 'tumblr'      },
  opt3:   { name: 'VK',          c: '#0077FF', slug: 'vk'          },
  opt4:   { name: 'OK.ru',       c: '#F7931E', slug: 'odnoklassniki'},
  opt55:  { name: 'Quora',       c: '#B92B27', slug: 'quora'       },

  // ── Dating ─────────────────────────────────────────────
  opt9:   { name: 'Tinder',      c: '#FF6B6B', slug: 'tinder'      },
  opt13:  { name: 'Badoo',       c: '#E10060', slug: undefined      },
  opt49:  { name: 'Zoosk',       c: '#0066CC', slug: undefined      },
  opt48:  { name: 'Grindr',      c: '#FEE731', slug: undefined      },

  // ── Google / Apple / Microsoft ────────────────────────
  opt1:   { name: 'Google',      c: '#4285F4', slug: 'google'      },
  opt15:  { name: 'Microsoft',   c: '#0078D4', slug: 'microsoft'   },
  opt31:  { name: 'Apple',       c: '#000000', slug: 'apple'       },

  // ── AI / Tech ──────────────────────────────────────────
  opt132: { name: 'OpenAI',      c: '#412991', slug: 'openai'      },
  opt45:  { name: 'Discord',     c: '#5865F2', slug: 'discord'     },
  opt46:  { name: 'Blizzard',    c: '#148EFF', slug: 'battlenet'   },

  // ── E-Commerce / Shopping ──────────────────────────────
  opt44:  { name: 'Amazon',      c: '#FF9900', slug: 'amazon'      },
  opt6:   { name: 'eBay',        c: '#E53238', slug: 'ebay'        },
  opt12:  { name: 'AliExpress',  c: '#FF6A00', slug: 'aliexpress'  },
  opt95:  { name: 'Shopify',     c: '#96BF48', slug: 'shopify'     },
  opt26:  { name: 'OZON',        c: '#005BFF', slug: undefined      },
  opt5:   { name: 'Avito',       c: '#00AAFF', slug: undefined      },
  opt17:  { name: 'Wildberries', c: '#CB11AB', slug: undefined      },
  opt27:  { name: 'Lazada',      c: '#F57224', slug: undefined      },
  opt32:  { name: 'Shopee',      c: '#EE4D2D', slug: 'shopee'      },
  opt23:  { name: 'OLX',         c: '#3DB34A', slug: undefined      },

  // ── Streaming ──────────────────────────────────────────
  opt101: { name: 'Netflix',     c: '#E50914', slug: 'netflix'     },
  opt102: { name: 'Hulu',        c: '#1CE783', slug: 'hulu'        },
  opt103: { name: 'HBO Max',     c: '#B000D4', slug: undefined      },
  opt54:  { name: 'Spotify',     c: '#1ED760', slug: 'spotify'     },
  opt110: { name: 'Deezer',      c: '#EF5466', slug: 'deezer'      },
  opt111: { name: 'Tidal',       c: '#000000', slug: 'tidal'       },
  opt106: { name: 'Vimeo',       c: '#1AB7EA', slug: 'vimeo'       },
  opt108: { name: 'Dailymotion', c: '#0066DC', slug: 'dailymotion' },
  opt109: { name: 'SoundCloud',  c: '#FF3300', slug: 'soundcloud'  },

  // ── Gaming ─────────────────────────────────────────────
  opt58:  { name: 'Steam',       c: '#1B2838', slug: 'steam'       },
  opt60:  { name: 'PUBG Mobile', c: '#F5A623', slug: undefined      },

  // ── Payments / Fintech ─────────────────────────────────
  opt83:  { name: 'PayPal',      c: '#003087', slug: 'paypal'      },
  opt84:  { name: 'Revolut',     c: '#191C1F', slug: 'revolut'     },
  opt85:  { name: 'Wise',        c: '#9FE870', slug: 'wise'        },
  opt97:  { name: 'Stripe',      c: '#635BFF', slug: 'stripe'      },
  opt99:  { name: 'Klarna',      c: '#FFB3C7', slug: 'klarna'      },
  opt87:  { name: 'Qiwi',        c: '#FF8C00', slug: undefined      },
  opt53:  { name: 'Alipay',      c: '#1677FF', slug: 'alipay'      },

  // ── Crypto ─────────────────────────────────────────────
  opt112: { name: 'Coinbase',    c: '#0052FF', slug: 'coinbase'    },
  opt81:  { name: 'Binance',     c: '#F0B90B', slug: 'binance'     },
  opt82:  { name: 'Bybit',       c: '#F7A600', slug: undefined      },
  opt113: { name: 'Kraken',      c: '#5741D9', slug: undefined      },
  opt116: { name: 'OKX',         c: '#000000', slug: 'okx'         },
  opt120: { name: 'Gate.io',     c: '#2354E6', slug: undefined      },
  opt123: { name: 'MEXC',        c: '#2C4BE2', slug: undefined      },
  opt129: { name: 'MetaMask',    c: '#F6851B', slug: 'metamask'    },
  opt130: { name: 'Trust Wallet',c: '#3375BB', slug: undefined      },

  // ── Ride / Delivery ────────────────────────────────────
  opt72:  { name: 'Uber',        c: '#000000', slug: 'uber'        },
  opt70:  { name: 'Lyft',        c: '#FF00BF', slug: 'lyft'        },
  opt73:  { name: 'foodpanda',   c: '#D70F64', slug: 'foodpanda'   },
  opt74:  { name: 'Grab',        c: '#01B14F', slug: 'grab'        },
  opt43:  { name: 'Bolt',        c: '#34D186', slug: 'bolt'        },
  opt65:  { name: 'Deliveroo',   c: '#00CCBC', slug: 'deliveroo'   },
  opt78:  { name: 'Wolt',        c: '#009DE0', slug: 'wolt'        },
  opt92:  { name: 'DiDi',        c: '#FF6600', slug: undefined      },

  // ── Professional / Freelance ───────────────────────────
  opt36:  { name: 'Freelancer',  c: '#29B2FE', slug: undefined      },
  opt56:  { name: 'Fiverr',      c: '#1DBF73', slug: 'fiverr'      },
  opt57:  { name: 'Upwork',      c: '#14A800', slug: 'upwork'      },

  // ── Travel / Accommodation ─────────────────────────────
  opt37:  { name: 'Airbnb',      c: '#FF385C', slug: 'airbnb'      },

  // ── Other ──────────────────────────────────────────────
  opt7:   { name: 'Yahoo',       c: '#6001D2', slug: 'yahoo'       },
  opt18:  { name: 'Yandex',      c: '#FC3F1D', slug: 'yandex'      },
  opt24:  { name: 'Naver',       c: '#03C75A', slug: 'naver'       },
  opt25:  { name: 'Mamba',       c: '#FF4F00', slug: undefined      },
  opt39:  { name: 'Twilio',      c: '#F22F46', slug: 'twilio'      },
  opt41:  { name: 'Letgo',       c: '#59CBE8', slug: undefined      },
};
