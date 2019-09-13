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

  gCost: number = 0;
  hCost: number;
  fCost: number;

  costFrom: NodeType;

  nodeName: string;

  pathValues: PathValues;
  targetNode: NodeType;

  constructor(private appService: AppServiceService, private pathService: PathService) {
    this.pathValues = appService.getPathValues();
    if (this.pathValues == null) {
      this.pathValues = { diagonal: 14, straight: 10 };
    }
  }

  ngOnInit() {
    this.nodeName = `${this.xCoord}-${this.yCoord}`;


    this.appService.on(this.nodeName + '-visit').subscribe(() => {
      this.isVisited = true;
    })

    this.appService.on(this.nodeName + '-start').subscribe(() => {
      this.isStart = true;
    })

    this.appService.on(this.nodeName + '-target').subscribe(() => {
      this.isTarget = true;
      this.appService.publish('targetNode', this.getNodeType());
    })

    this.appService.on(this.nodeName + '-rock').subscribe(() => {
      this.isRock = true;
      this.appService.publish('rocks', { xCord: this.xCoord, yCord: this.yCoord });
    })

    this.appService.on("targetNode").subscribe((targetNode: NodeType) => {
      this.targetNode = targetNode;
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
    })

    //TODO: if prev G is lower keep it
    this.appService.on(this.nodeName + '-explore').subscribe((fromNode: NodeType) => {
      if (this.isRock == false && this.isVisited != true) {
        this.isExplored = true;
        if (fromNode.xCord != this.xCoord && fromNode.yCord != this.yCoord) {
          if ((this.gCost > fromNode.gCost + this.pathValues.diagonal) || this.gCost == 0) {
            this.gCost = fromNode.gCost + this.pathValues.diagonal;
            this.costFrom = fromNode;
            this.calculatefCost();
          }
        } else {
          if ((this.gCost > fromNode.gCost + this.pathValues.straight) || this.gCost == 0) {
            this.gCost = fromNode.gCost + this.pathValues.straight;
            this.costFrom = fromNode;
            this.calculatefCost();
          }
        }
        this.appService.setExploration(this.getNodeType(), this.costFrom);
      }
    });

    // if this node is selected.
    this.appService.on(this.nodeName + '-select').subscribe(() => {
      this.isVisited = true;
      if (this.isTarget == true) {
        this.appService.publish('target-found', this.getNodeType());
      }
      this.exploreSurround();
    })

    this.appService.on('reset-path').subscribe(() => {
      this.resetPath();
    });
  }

  calculatefCost() {
    let cost = 0;
    let xFar = this.targetNode.xCord - this.xCoord;
    let yFar = this.targetNode.yCord - this.yCoord;
    xFar = xFar < 0 ? -xFar : xFar;
    yFar = yFar < 0 ? -yFar : yFar;
    while (true) {
      if (xFar - 1 >= 0 && yFar - 1 >= 0) {
        cost += this.pathValues.diagonal;
        xFar--;
        yFar--;
      } else if (xFar - 1 >= 0) {
        cost += this.pathValues.straight;
        xFar--;
      } else if (yFar - 1 >= 0) {
        cost += this.pathValues.straight;
        yFar--;
      }
      if (xFar == 0 && yFar == 0) {
        break;
      }
    }
    this.hCost = cost;
    if (this.gCost && this.hCost) {
      this.fCost = this.gCost + this.hCost;
    }
  }

  exploreSurround() {
    // 8 node will be explored
    this.publishExplore(this.xCoord - 1, this.yCoord - 1);
    this.publishExplore(this.xCoord - 1, this.yCoord);
    this.publishExplore(this.xCoord - 1, this.yCoord + 1);
    this.publishExplore(this.xCoord, this.yCoord - 1);
    this.publishExplore(this.xCoord, this.yCoord + 1);
    this.publishExplore(this.xCoord + 1, this.yCoord - 1);
    this.publishExplore(this.xCoord + 1, this.yCoord);
    this.publishExplore(this.xCoord + 1, this.yCoord + 1);
  }

  publishExplore(xCord, yCord) {
    this.appService.publish(`${xCord}-${yCord}-explore`, this.getNodeType());
  }

  getNodeType(): NodeType {
    return {
      xCord: this.xCoord,
      yCord: this.yCoord,
      gCost: this.gCost,
      hCost: this.hCost,
      fCost: this.fCost,
      isExplored: this.isExplored,
      isPath: this.isPath,
      isRock: this.isRock,
      isSelected: this.isSelected,
      isStart: this.isStart,
      isTarget: this.isTarget,
      isVisited: this.isVisited
    }
  }

  resetPath() {
    this.isVisited = false;
    this.isExplored = false;
    this.fCost = 0;
    this.hCost = 0;
    this.gCost = 0;
  }

  ngOnDestroy() {
  }

}
