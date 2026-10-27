// WebP RIFF container: https://developers.google.com/speed/webp/docs/riff_container
export function inspectWebP(bytes) {
  if(bytes.length<30||bytes.length>2*1024*1024)throw Error('图片须小于 2 MB');
  const data=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const tag=o=>String.fromCharCode(...bytes.subarray(o,o+4));
  if(tag(0)!=='RIFF'||tag(8)!=='WEBP'||data.getUint32(4,true)+8!==bytes.length)throw Error('不是有效的 WebP 图片');
  let image=null,canvas=null;
  for(let offset=12;offset<bytes.length;){
    if(offset+8>bytes.length)throw Error('图片容器不完整');
    const type=tag(offset),size=data.getUint32(offset+4,true),o=offset+8;
    if(o+size>bytes.length||!size)throw Error('图片数据不完整');
    if(type==='ANIM'||type==='ANMF')throw Error('请使用静态图片');
    if(type==='VP8X'){
      if(size!==10||(bytes[o]&2))throw Error('不支持的图片类型');
      canvas={width:1+bytes[o+4]+(bytes[o+5]<<8)+(bytes[o+6]<<16),height:1+bytes[o+7]+(bytes[o+8]<<8)+(bytes[o+9]<<16)};
    }else if(type==='VP8 '){
      if(image||size<10||(bytes[o]&1)||bytes[o+3]!==0x9d||bytes[o+4]!==1||bytes[o+5]!==0x2a)throw Error('无效的静态图片帧');
      image={width:data.getUint16(o+6,true)&0x3fff,height:data.getUint16(o+8,true)&0x3fff};
    }else if(type==='VP8L'){
      if(image||size<5||bytes[o]!==0x2f)throw Error('无效的图片帧');
      const n=data.getUint32(o+1,true);image={width:1+(n&0x3fff),height:1+((n>>>14)&0x3fff)};
    }else if(!['ALPH','ICCP','EXIF','XMP '].includes(type))throw Error('不支持的图片数据');
    offset=o+size+(size%2);
    if(offset>bytes.length)throw Error('图片容器不完整');
  }
  if(!image||image.width<1||image.height<1||image.width>2000||image.height>2000||image.width*image.height>4000000)throw Error('图片尺寸须在 2000 × 2000 内');
  if(canvas&&(canvas.width!==image.width||canvas.height!==image.height))throw Error('图片尺寸信息不一致');
  return image;
}
