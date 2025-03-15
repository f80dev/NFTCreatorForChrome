export const settings={
  contract_addr:"",
  ihm_level:1,
  appname: "NFTNow",
  version: "0.5",
  appli:"https://nftnow.af10.fr",
  network: "elrond-mainnet",
  intro: "Create your NFT in one minute"
}

export const abi=[
  "constructor(string memory _name, string memory _symbol, string memory _baseURI)",
  "function mint(address recipient) public returns (uint256)",
  "function setBaseURI(string memory _newBaseURI) public",
  "function _baseURI() internal view virtual override returns (string memory)",
  "function baseURI() external view returns (string memory)",
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
];
