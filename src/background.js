chrome.runtime.onInstalled.addListener(async  ()=> {
  chrome.contextMenus.create(
    {
      "title": "Create NFT",
      "id": "image",
      "contexts": ['image']
    })
})

chrome.contextMenus.onClicked.addListener(async (item, tab) => {
  const url = new URL(item.srcUrl);

  let urls=await chrome.storage.local.get("urls")
  urls=urls+","+url.href
  await chrome.storage.local.set({urls:urls})

  let notification_id=await chrome.notifications.create({
    type: "basic",
    iconUrl:"assets/icon_ldpi.png",
    title: "Ready to build NFT",
    message: url.href,
  })


});


