import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AppServiceService } from 'src/app/services/app-service.service';
import { PathService } from 'src/app/services/path.service';
import { NodeType } from 'src/app/models/node-type';
import { PathValues } from 'src/app/models/pathValues-type';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent implements OnInit, OnDestroy {

  isExplored: boolean = false;
  isPath: boolean = false;
  isVisited: boolean = false;
  isSelected: boolean = false;
  isRock: boolean = false;
  isStart: boolean = false;
  isTarget: boolean = false;
  @Input() xCoord: number;
  @Input() yCoord: number;

  gCost: number;
  hCost: number;
  fCost: number;

  costFrom: NodeType;

  nodeName: string;

  pathValues: PathValues;
  targetNode: NodeType;

  constructor(private appService: AppServiceService, private pathService: PathService) {
    this.pathValues = appService.getPathValues();
  }

  ngOnInit() {
    this.nodeName = `${this.xCoord}-${this.yCoord}`;

    this.appService.on(this.nodeName + '-explore').subscribe(() => {
      this.isExplored = true;
    })

    this.appService.on(this.nodeName + '-visit').subscribe(() => {
      this.isVisited = true;
    })

    this.appService.on(this.nodeName + '-start').subscribe(() => {
      this.isStart = true;
    })

    this.appService.on(this.nodeName + '-target').subscribe(() => {
      this.isTarget = true;
    })

    this.appService.on(this.nodeName + '-setRock').subscribe(() => {
      this.appService.publish('rocks', { xCord: this.xCoord, yCord: this.yCoord });
    })

    this.appService.on("targetNode").subscribe((targetNode: NodeType) => {
      this.targetNode = targetNode;
    })

    this.appService.on(this.nodeName + '-explore').subscribe((fromNode: NodeType) => {
      if (fromNode.xCord != this.xCoord && fromNode.yCord != this.yCoord) {
        if (this.gCost > fromNode.gCost + this.pathValues.diagonal) {
          this.gCost = fromNode.gCost + this.pathValues.diagonal;
          this.costFrom = fromNode;
          this.calculatefCost();
        }
      } else {
        if (this.gCost > fromNode.gCost + this.pathValues.straight) {
          this.gCost = fromNode.gCost + this.pathValues.straight;
          this.costFrom = fromNode;
          this.calculatefCost();
        }
      }
      
    });

    // if this node is selected.
    this.appService.on(this.nodeName+'-select').subscribe(()=>{
      this.isVisited = true;
      this.exploreSurround();
    })
  }

  calculatefCost() {
    let cost = 0;
    let xFar = this.targetNode.xCord - this.xCoord;
    let yFar = this.targetNode.yCord - this.yCoord;
    xFar = xFar < 0 ? -xFar : xFar;
    yFar = yFar < 0 ? -yFar : yFar;

    while (xFar > 0) {
      while (yFar > 0) {
        if (xFar - 1 >= 0 && yFar - 1 >= 0) {
          // can go diagonal
          cost += this.pathValues.diagonal;
          xFar--;
          yFar--;
        } else {
          if (yFar - 1 >= 0) {
            // can go straight on Y plane
            cost += this.pathValues.straight;
            yFar--;
          }
        }
      }
      if (xFar - 1 >= 0) {
        // can go straight on X plane
        cost += this.pathValues.straight;
        xFar--;
      }
    }
    this.hCost = cost;

    if (this.gCost && this.hCost) {
      this.fCost = this.gCost + this.hCost;
    }
  }

  exploreSurround(){
    // 8 node will be explored
    this.publishExplore(this.xCoord-1,this.yCoord-1);
    this.publishExplore(this.xCoord-1,this.yCoord);
    this.publishExplore(this.xCoord-1,this.yCoord+1);
    this.publishExplore(this.xCoord,this.yCoord-1);
    this.publishExplore(this.xCoord,this.yCoord+1);
    this.publishExplore(this.xCoord+1,this.yCoord-1);
    this.publishExplore(this.xCoord+1,this.yCoord);
    this.publishExplore(this.xCoord+1,this.yCoord+1);
  }

  publishExplore(xCord,yCord){
    this.appService.publish(`${xCord}-${yCord}-explore`,this.getNodeType());
  }

  getNodeType():NodeType{
    return {
      xCord : this.xCoord,
      yCord : this.yCoord,
      gCost : this.gCost,
      hCost : this.hCost,
      fCost : this.fCost,
      isExplored : this.isExplored,
      isPath : this.isPath,
      isRock : this.isRock,
      isSelected : this.isSelected,
      isStart : this.isStart,
      isTarget : this.isTarget,
      isVisited : this.isVisited
    }
  }

  ngOnDestroy() {
  }

}
