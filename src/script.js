let imageUrls:any[] = [];
let imgElements = document.querySelectorAll('img'); // Select all <img> tags

imgElements.forEach(img => {
  const src = img.getAttribute('src'); // Get the 'src' attribute
  const srcset = img.getAttribute('srcset'); // Get the 'srcset' attribute (for responsive images)

  if (src) {
    imageUrls.push(src);
  }

  if (srcset) {
    // Handle srcset (can contain multiple URLs)
    srcset.split(',').forEach(source => {
      const url = source.trim().split(' ')[0]; // Extract the URL
      if(url) imageUrls.push(url);
    });
  }
});
return imageUrls;
