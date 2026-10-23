import {Children,isValidElement,useEffect,useMemo,useRef,type ReactNode} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {CanvasTexture,SRGBColorSpace,Vector3,type Sprite} from 'three';
function labelText(node:ReactNode):string {
  return Children.toArray(node).map(child=>isValidElement<{children?:ReactNode}>(child)?labelText(child.props.children):String(child)).join('');
}
export default function SceneLabel({children,position}:{children:ReactNode;position:[number,number,number];center?:boolean;className?:string}) {
  const text=labelText(children),sprite=useRef<Sprite>(null);
  const {camera,viewport,size}=useThree();
  const target=useMemo(()=>new Vector3(...position),[...position]);
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!;
    ctx.font='500 28px "Microsoft YaHei", sans-serif';
    canvas.width=Math.ceil(ctx.measureText(text).width)+28;canvas.height=52;
    ctx.fillStyle='#0c1729ee';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#496176';ctx.strokeRect(.5,.5,canvas.width-1,canvas.height-1);
    ctx.font='500 28px "Microsoft YaHei", sans-serif';ctx.fillStyle='#d8e8ef';ctx.textBaseline='middle';ctx.fillText(text,14,26);
    const result=new CanvasTexture(canvas);result.colorSpace=SRGBColorSpace;return result;
  },[text]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  // Keep labels inside WebGL: separate DOM roots can race during Canvas teardown.
  useFrame(()=>{if(sprite.current){const height=viewport.getCurrentViewport(camera,target).height/size.height*27;sprite.current.scale.set(height*texture.image.width/52,height,1);}});
  return <sprite ref={sprite} position={position} renderOrder={100}><spriteMaterial map={texture} transparent depthTest={false} depthWrite={false}/></sprite>;
}