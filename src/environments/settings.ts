export const settings={
  contract_addr:"erd1qqqqqqqqqqqqqpgql36f6pa8d6x44858l59q4u5qmzwrv4u6835sgcxfvg",
  ihm_level:2,
  version: "0.91",
  appname: "NFTNow Devnet",
  appli:"https://devnet.nftnow.af10.fr",
  network: "elrond-devnet",
  intro: "Create your NFT on the devnet network in one minute"
}

export const abi={
  "buildInfo": {
    "rustc": {
      "version": "1.85.0",
      "commitHash": "4d91de4e48198da2e33413efdcd9cd2cc0c46688",
      "commitDate": "2025-02-17",
      "channel": "Stable",
      "short": "rustc 1.85.0 (4d91de4e4 2025-02-17)"
    },
    "contractCrate": {
      "name": "secretvault",
      "version": "0.0.1"
    },
    "framework": {
      "name": "multiversx-sc",
      "version": "0.57.0"
    }
  },
  "docs": [
    "An empty contract. To be used as a template when starting a new contract from scratch."
  ],
  "name": "SecretVault",
  "constructor": {
    "inputs": [],
    "outputs": []
  },
  "endpoints": [
    {
      "name": "documents",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<Document>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "withdraw",
      "mutability": "readonly",
      "inputs": [],
      "outputs": [
        {
          "type": "variadic<u32>",
          "multi_result": true
        }
      ]
    },
    {
      "name": "upload",
      "mutability": "mutable",
      "payableInTokens": [
        "*"
      ],
      "inputs": [],
      "outputs": [
        {
          "type": "u32"
        }
      ]
    },
    {
      "name": "transfer",
      "onlyOwner": true,
      "mutability": "mutable",
      "inputs": [
        {
          "name": "key",
          "type": "u32"
        },
        {
          "name": "dest",
          "type": "Address"
        }
      ],
      "outputs": []
    }
  ],
  "esdtAttributes": [],
  "hasCallback": false,
  "types": {
    "Document": {
      "type": "struct",
      "fields": [
        {
          "name": "owner",
          "type": "Address"
        },
        {
          "name": "coin",
          "type": "EgldOrEsdtTokenIdentifier"
        },
        {
          "name": "amount",
          "type": "BigUint"
        }
      ]
    }
  }
}

