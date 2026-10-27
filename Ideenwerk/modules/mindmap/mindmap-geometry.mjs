export function edgeGeometry(from,to) {
  const x1=from.x+75,y1=from.y+27,x2=to.x+75,y2=to.y+27;
  return {path:`M${x1} ${y1} Q${(x1+x2)/2} ${y1} ${x2} ${y2}`,labelX:(x1+x2)/2,labelY:(3*y1+y2)/4-9};
}
