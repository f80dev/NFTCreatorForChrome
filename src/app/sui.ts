import {UserService} from "./user.service";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';


export async function makeNFTTransaction(identifier:string,name:string,visual:string,user:UserService,
                                         quantity=1,royalties=0,uris:string[]=[],metadata="",metadata_url="",hash="") {

  const client = new SuiClient({ url: getFullnodeUrl('devnet') });

  const transaction = {
      // Define the transaction details here
      // Include the metadataCID and other required parameters
    };

    //const response = await client.executeTransaction(transaction);
    //console.log('Minted NFT:', response);
    //console.log('Minted NFT:', response);

}


export async function login(user:UserService) {
  //const availableWallets = getWallets().get();
}
