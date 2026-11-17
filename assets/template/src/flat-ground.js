import {LatheGeometry, Vector2} from 'three';

// A level, closed island: the upper surface is continuous and the shallow
// rounded rim meets the surrounding plane, including at grazing camera angles.
export const groundHeight = .12;
export function createFlatGroundGeometry(){
 return new LatheGeometry([
  new Vector2(0,-.46),new Vector2(6.82,-.46),
  new Vector2(6.96,-.37),new Vector2(7,-.12),
  new Vector2(6.98,.04),new Vector2(6.90,groundHeight),
  new Vector2(0,groundHeight)
 ],192);
}
