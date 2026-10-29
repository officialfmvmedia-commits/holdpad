export const CONFIG={MINT:'9M4Ukvsh2LGjbxWsgmFBnykynuJpTUvP7sAAobbrFF6K',DEV:'HurAwDG4KCLb8Y38JWcXUcU6ZvHYoND7XntiomyvZAfv',
RPC:['https://solana-rpc.publicnode.com','https://api.mainnet-beta.solana.com'],
SPLIT:[{k:'Holders',d:'by hold time',p:50,c:'#E8FF3A'},{k:'Buy $HOLD',d:'buyback',p:30,c:'#EDEBE4'},{k:'Creator',d:'coin dev',p:10,c:'#8A877E'},{k:'Treasury',d:'ops',p:10,c:'#3a3a34'}],
// Quote tokens. Every mint verified on-chain (Token-2022, metadata symbol matches) on 2026-10-29.
// Quote tokens. Each mint verified on-chain AND each has a Raydium LaunchLab global config; a create tx simulated PASS for every one (2026-10-29).
// raise = bonding-curve graduation target in quote units (~$15k for stocks at Oct-29 prices; 85 SOL for SOL). Decision pending.
PAIRS:[{s:'SOL',n:'Solana',m:'So11111111111111111111111111111111111111112',config:'6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX',raise:85},
{s:'SPCXx',n:'SpaceX xStock',m:'Xs3oZwbHvqis4NYcf4YKWmEia2eC84wSiVrcYcTqpH8',config:'9mfQRzhyaACD49VhrSwCWKjrHVLcNfhxSdhg2hDSwCd8',raise:50},
{s:'TSLAx',n:'Tesla xStock',m:'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB',config:'Fny7wPYnkeR5AU285YLSJv9giQUbxDA2DpXQAinTe2nR',raise:35},
{s:'NVDAx',n:'NVIDIA xStock',m:'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh',config:'2NuVPU5ViAyQsZamVfJ1vU6Cp77WSzret4LtNTMiWFQ4',raise:80},
{s:'AAPLx',n:'Apple xStock',m:'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp',config:'9RkoV181ksAPNnZmGMyici4MgswhewW2hqvhkVd4DoHi',raise:58},
{s:'GOOGLx',n:'Alphabet xStock',m:'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN',config:'3exefyTZ6ves3Z6cvQ9nf1NtSPAnHX95ZtvKWedf7JX6',raise:52},
{s:'METAx',n:'Meta xStock',m:'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu',config:'G9NjYUD96DfCBUnduDHoZ7TCRrvdG41GLUkuoRch6qFC',raise:20},
{s:'AMZNx',n:'Amazon xStock',m:'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg',config:'EuXxVmsJ6Go46J8AQrBQKBAEki1zsFNYDvyimTxrepdg',raise:65},
{s:'MSTRx',n:'MicroStrategy xStock',m:'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ',config:'t9CXBViTixE8jEHzLwZXZYRdzojg9rAArYGoK4Vut4u',raise:50},
{s:'COINx',n:'Coinbase xStock',m:'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu',config:'3iXUeMAmCcMw5ydJR3GooYGh1TyVLUmVEgTHTrn3bFwK',raise:45},
{s:'HOODx',n:'Robinhood xStock',m:'XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg',config:'2g2cjjSs8YLAesHXwszZqd1SreCbdVSE3AYpm6fzvv9N',raise:115},
{s:'CRCLx',n:'Circle xStock',m:'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1',config:'CW9f7d56a4idicgJ1CgTegjTMifgD3cKUnW5pkRRjA9V',raise:125},
{s:'SPYx',n:'S&P 500 xStock',m:'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',config:'B7ctMMdGvy46Am56myTtzfkNzt9kWZVTNGM2BWrJ9adg',raise:22},
{s:'QQQx',n:'Nasdaq xStock',m:'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ',config:'83KjqrTThSwY5dL1nDAf3Mi8eM9nZi33yM8Ntx2aJYuE',raise:25}],
LAUNCH:{supply:'1000000000000000',totalSellA:'793100000000000',slippageBps:100},
PLATFORM_ID:'', // set after the HoldPad LaunchLab platform is created (tools/create-platform.mjs). Empty = Raydium default platform, and Launches list stays empty.
IPFS_ENDPOINT:'', // URL of worker/ipfs-worker.js once deployed (holds the Pinata key server-side).
RPC_GPA:['https://api.mainnet-beta.solana.com'],
SIM_PAYER:'5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9', // any funded pubkey, used only to simulate when no wallet is connected
weight:(t,d)=>Math.max(0,t)*Math.max(0,d),
LAUNCHLAB:'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj',
PLATFORM_ADMIN:'HurAwDG4KCLb8Y38JWcXUcU6ZvHYoND7XntiomyvZAfv',
PLATFORM_EXPECTED:'5Rp57pG59yQSbR2ZxQA9bVcH1Tr7QMk98aC9KDCsTWLN', // PDA from admin; becomes PLATFORM_ID once created
WALLETS:{fee:'',buyback:'',treasury:''}, // set once decided; empty = shown as 'not set'
DATA_URL:'data/analytics.json', // written by keeper/keeper.mjs
SCHEDULE:{snapshotEveryHours:24,payoutUtcHour:16}, // decision pending
};
