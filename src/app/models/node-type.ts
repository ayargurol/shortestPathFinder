export class NodeType {
    xCord: number
    yCord: number
    isExplored?: boolean = false;
    isPath?: boolean = false;
    isVisited?: boolean = false;
    isSelected?: boolean = false;
    isRock?: boolean = false;
    isStart?: boolean = false;
    isTarget?: boolean = false;
    gCost?:number;
    hCost?:number;
    fCost?:number;
}
