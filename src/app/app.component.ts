import { Component } from '@angular/core';
import { AppServiceService } from './services/app-service.service';
import { Exploration } from './models/exploration-type';

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

  mode: string[] = [
    "start",
    "target",
    "rock"
  ];
  selectedMode: string = "start";

  constructor(private appService: AppServiceService) {
    appService.on('target-found').subscribe(() => {
      alert('Target Found');
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

  lastSelectedNode;
  startNode;
  explore() {
    let explored = this.appService.getExploredNodes();
    if (explored.length == 0) {
      this.appService.publish(this.startNode + '-select', {});
    } else {
      let node;
      let count = 0;
      while (true) {
        node = this.chooseSelected(count);
        if(this.lastSelectedNode == null || this.lastSelectedNode == undefined){
          break;
        }
        else if (node.from.xCord != this.lastSelectedNode.node.xCord && node.from.yCord != this.lastSelectedNode.node.yCord) {
          count++;
          continue;
        }else{
          break;
        }
      }


      this.lastSelectedNode = node;
      this.appService.publish(`${node.node.xCord}-${node.node.yCord}-select`, {});
    }
  }

  chooseSelected(i): Exploration {
    let explored = this.appService.getExploredNodes();

    let first = explored.sort(a => a.node.fCost)[i];
    let last = explored.sort(a => a.node.fCost)[explored.length - (i + 1)];
    return first.node.fCost < last.node.fCost ? first : last;


  }

}
