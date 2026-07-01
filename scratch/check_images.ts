
import fetch from 'node-fetch';
import { mockProducts } from './frontend/src/lib/mockProducts.ts';

async function checkImages() {
  for (const product of mockProducts) {
    try {
      const res = await fetch(product.imageUrl, { method: 'HEAD' });
      if (!res.ok) {
        console.log(`Broken image for ID ${product.id} (${product.name}): ${product.imageUrl} - Status: ${res.status}`);
      }
    } catch (e) {
      console.log(`Failed to fetch image for ID ${product.id} (${product.name}): ${product.imageUrl} - Error: ${e.message}`);
    }
  }
}

checkImages();
