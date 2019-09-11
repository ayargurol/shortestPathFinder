import { Component } from '@angular/core';
import { AppServiceService } from './services/app-service.service';

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

  startNode;
  explore() {
    let explored = this.appService.getExploredNodes();
    if (explored.length == 0) {
      this.appService.publish(this.startNode + '-select', {});
    } else {
      let node = explored.sort(a => a.node.fCost)[explored.length-1];
      this.appService.publish(`${node.node.xCord}-${node.node.yCord}-select`, {});
    }
  }

}
