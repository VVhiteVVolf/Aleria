export async function importLocalImage(file) {
  if(!['image/png','image/jpeg','image/webp'].includes(file?.type))throw new Error('Bitte ein PNG-, JPEG- oder WebP-Bild auswählen.');
  if(file.size>12*1024*1024)throw new Error('Bitte ein Bild unter 12 MB verwenden.');
  const bitmap=await createImageBitmap(file).catch(()=>{throw new Error('Dieses Bild konnte nicht gelesen werden.');});
  try{
    const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/webp',.88);
  }finally{bitmap.close();}
}
