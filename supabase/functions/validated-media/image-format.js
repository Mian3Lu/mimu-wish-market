import {inspectWebP} from './webp.js';
export function inspectImage(bytes,claimedType){
 if(bytes.length<24||bytes.length>2097152)throw Error('图片须小于 2 MB');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let width,height,type,extension;
 if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47){
  if(bytes[4]!==13||bytes[5]!==10||bytes[6]!==26||bytes[7]!==10||view.getUint32(8)!==13||view.getUint32(12)!==0x49484452)throw Error('PNG 图片头不完整');
  width=view.getUint32(16);height=view.getUint32(20);type='image/png';extension='png';
  let offset=8,hasData=false,ended=false;while(offset+12<=bytes.length){const size=view.getUint32(offset),chunk=view.getUint32(offset+4);if(offset+12+size>bytes.length)throw Error('PNG 图片数据不完整');if(chunk===0x49444154)hasData=true;offset+=12+size;if(chunk===0x49454e44){if(size!==0||offset!==bytes.length)throw Error('PNG 图片尾无效');ended=true;break;}}if(!hasData||!ended)throw Error('PNG 图片数据不完整');
 }else if(bytes[0]===0xff&&bytes[1]===0xd8){
  type='image/jpeg';extension='jpg';if(bytes.at(-2)!==0xff||bytes.at(-1)!==0xd9)throw Error('JPEG 图片数据不完整');let offset=2;
  while(offset+4<=bytes.length){
   if(bytes[offset++]!==0xff)throw Error('JPEG 图片数据无效');while(bytes[offset]===0xff)offset++;const marker=bytes[offset++];
   if(marker===0xd9||marker===0xda)break;
   const size=view.getUint16(offset);if(size<2||offset+size>bytes.length)throw Error('JPEG 图片数据不完整');
   if([0xc0,0xc1,0xc2].includes(marker)){if(size<8)throw Error('JPEG 尺寸数据无效');height=view.getUint16(offset+3);width=view.getUint16(offset+5);break;}offset+=size;
  }
 }else{const result=inspectWebP(bytes);width=result.width;height=result.height;type='image/webp';extension='webp';}
 if(type!==claimedType)throw Error('图片实际格式与文件类型不一致');
 if(!width||!height||width>2000||height>2000||width*height>4000000)throw Error('图片尺寸须在 2000 × 2000 内');
 return {width,height,type,extension};
}
