import { Component } from '@angular/core';
import { AppServiceService } from './services/app-service.service';
import { Exploration } from './models/exploration-type';
import { NodeType } from './models/node-type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ShortestPathFinder';

  xValue = 0;
  yValue = 0;
  gridVisible: boolean = false;
  grid = [];
  timeInterval: number;
  mode: string[] = [
    "start",
    "target",
    "rock"
  ];
  selectedMode: string = "start";

  constructor(private appService: AppServiceService) {
    appService.on('target-found').subscribe(() => {
      alert('Target Found');
      this.stopExploration();
    })
  }

  setUpGrid() {
    this.grid = [];
    for (let x = 0; x < this.xValue; x++) {
      this.grid.push([]);
      this.grid[x] = [];
      for (let y = 0; y < this.yValue; y++) {
        this.grid[x].push({ x, y });
      }
    }
    this.gridVisible = true;
  }

  action() {
    if (this.selectedMode == 'start') {
      this.startNode = this.getActionNodeName();
    }
    this.appService.publish(this.getActionNodeName() + '-' + this.selectedMode, {});
  }

  getActionNodeName(): string {
    return `${this.xValue}-${this.yValue}`;
  }

  stepper: NodeJS.Timer;
  startExploration() {
    this.stepper = setInterval(() => {
      this.explore();
    }, this.timeInterval * 100)
  }

  stopExploration() {
    this.stepper.unref();
  }


  blockedNodes: NodeType[] = [];
  lastSelectedNode: Exploration;
  startNode;
  explore() {
    let explored = this.appService.getExploredNodes();
    if (explored.length == 0) {
      this.appService.publish(this.startNode + '-select', {});
    } else {
      let node: Exploration;
      let count = 0;
      while (true) {
        node = this.chooseSelected(count);
        if (this.lastSelectedNode == null || this.lastSelectedNode == undefined) {
          break;
        }
        else if (node != null && node.from.xCord != this.lastSelectedNode.node.xCord && node.from.yCord != this.lastSelectedNode.node.yCord) {
          count++;
          continue;
        }
        else if (node != null && !this.blockedNodes.some(a => a.xCord == node.node.xCord && a.yCord == node.node.yCord)) {
          break;
        }
        else {
          // block last selected
          this.blockedNodes.push(this.lastSelectedNode.from)
          // set all visiteds false
          this.lastSelectedNode = null;
          this.appService.publish('reset-path', {});
          // start from Begining node again
          this.appService.resetPath();
          this.explore();
        }
      }


      this.lastSelectedNode = node;
      this.appService.publish(`${node.node.xCord}-${node.node.yCord}-select`, {});
      this.appService.removeExploration(node.node);
    }
  }

  chooseSelected(i): Exploration {
    try {

      let explored = this.appService.getExploredNodes();

      let first = explored.sort(a => a.node.fCost)[i];
      let last = explored.sort(a => a.node.fCost)[explored.length - (i + 1)];
      return first.node.fCost < last.node.fCost ? first : last;

    } catch (error) {
      console.log('Error on iteration number: ' + i);
      return null;

    }

  }

}
