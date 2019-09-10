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

  /**
   *
   */
  constructor(private appService:AppServiceService) {
    
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

  reachNode(){
    this.appService.publish(`${this.xValue}-${this.yValue}-visit`,{});
  }

}
