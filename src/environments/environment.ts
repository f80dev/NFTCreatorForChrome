export const environment = {
  production: false,
  forum: "https://discord.gg/BfC2E2ent",
  mail: "contact@nfluent.io",
  telegram: "https://t.me/NFTNow_official",

  server: "http://localhost:5000",
  networks: [
    {label: "MultiversX Test", value: "elrond-devnet"},
    {label: "MultiversX", value: "elrond-mainnet"},
    {label: "MultiversX Test v2", value: "elrond-devnet2"},
  ],
  storage:"github",
  visual: "./assets/logo.png",
  logo: "./assets/logo.png",
  claim: "Valoriser vos contenus en quelques clics",
  token: {
    "elrond-devnet":"LIFEPOINT-30c75e",
    "elrond-mainnet":"LIFEPOINT-30c75e"
  },
  token_market: "https://tokemon.f80.fr/faucet",
  max_file_size:50000000,
  shorter_service:"",
  transfer_page:"https://t.f80.fr",


  offset_lat:0,
  offset_lng:0,
  render_server: "https://api.f80.fr:9876",
  fee: 10,
  style:"promptmarket.css",


  // faqs:[
  //   {
  //     index: "aquoicasert",
  //     title: "Qu'est ce que {{appname}} ?",
  //     order: 0,
  //     format: "html",
  //     content:"{{appname}} est une place de marché permettant à des acheteurs de faire des annonces sous forme de prompt IA et à des possesseurs de puissances de calcul de répondre à ses prompts en proposant des images"
  //   },
  //   {
  //     index: "install_server",
  //     title: "Comment générer des images depuis son ordinateur",
  //     order: 0,
  //     format: "html",
  //     content:""
  //   }
  // ],

  dictionnary:{
    "fr":{
      pv:"PV"
    },
    "en":{
      pv:"LP"
    }
  },

  scale_factor:100,
  translate_factor:1000000000,

  website: "https://af10.fr",
  company:"AF10",
  seuil_capture: 10,
  max_pv_loading: 1000,
  nft_market: {
    "elrond-devnet":"https://devnet.xspotlight.com/",
    "elrond-mainnet":"https://xspotlight.com/",
  },
  gaz_for_transaction:  200000000n,
  gaz_by_nft: 10000000n,
  max_gaz:    600000000n,
  geoloc_interval: 10000,
  accuracy_limit: 50,
  generators: [
    {label: "Emojis", value: "https://emojipedia.com/apple/"},
    {label: "Stable Diffusion", value: "https://gen.akash.network/"},
    {label: "Grok", value: "https://grok.com/"},
    {label: "Pixabay", value: "https://pixabay.com/"},
    {label: "Google Image", value: "https://images.google.com/"},
    {label: "Icons", value: "https://fonts.google.com/icons"},
    {label: "Images IA", value: "https://civitai.com/"},
  ],
  PINATA_JWT:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1ZTY2NTFkNy0yMGRlLTRhMjgtOTYxZC02Yzk5M2VjMjU3YmMiLCJlbWFpbCI6Imhob2FyZWF1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzOWJiMWExNDJkMzhjZDYxMmMxZCIsInNjb3BlZEtleVNlY3JldCI6IjJjYzcyODMyNmIxMTQwOWZiYmNlM2IwMTE4OWEwOGJiNzg3MWE2MDBmMWE5OGUzNTBkNjBjOTJiODZhMjMxNmMiLCJleHAiOjE3NzI4MTU4Njl9.FBHAjuEWRzaArbwkgs5f_M02-wj-FTEd5v9ork8-FVw",
  PINATA_API_KEY:"39bb1a142d38cd612c1d",
  PINATA_GATEWAY_URL:"cyan-revolutionary-haddock-289.mypinata.cloud",
  PINATA_API_SECRET:"2cc728326b11409fbbce3b01189a08bb7871a600f1a98e350d60c92b86a2316c",

  NFT_STORAGE_KEY:"70e9232c.fd46ec266cc940dcbe27ab485cea2243",
  PINATA_BASE_URL: "https://api.pinata.cloud/",

  collection_viewer_old:"https://devnet.xoxno.com/collection/%collection%?listingType=All",
  nft_viewer: "https://devnet.xoxno.com/nft/%identifier%",
  account_viewer_old: "https://devnet.xoxno.com/profile/%address%",

  collection_viewer:"https://devnet.xspotlight.com/collections/%collection%",
  nft_viewer_old: "https://devnet.xspotlight.com/nfts/%identifier%",
  account_viewer: "https://devnet.xspotlight.com/%address%",
  share_appli: "https://devnet.vault.af10.fr",


}
