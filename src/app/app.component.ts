import { Component, OnInit } from '@angular/core';
import { AppServiceService } from './services/app-service.service';
import { Exploration } from './models/exploration-type';
import { NodeType } from './models/node-type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
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
  targetNode: NodeType;
  visitedList: Exploration[] = [];

  constructor(private appService: AppServiceService) { }

  ngOnInit(): void {

    this.appService.on('targetNode').subscribe((target: NodeType) => {
      this.targetNode = target;
    })

    this.appService.on('target-found').subscribe(() => {
      this.stopExploration();
      // find the best path to target
      let path = [];
      debugger;
      const visiteds = this.mergeSort(this.visitedList);
      let state: NodeType;

      const end = visiteds.find(a => a.node.isTarget == true);
      for (const key in visiteds) {
        if (path.length == 0) {
          path.push(end.node.costFrom);
          state = end.node.costFrom;
        } else {
          const next = visiteds.find(a => a.node.xCord == state.xCord && a.node.yCord == state.yCord);
          if (next != null) {
            path.push(next.node.costFrom);
            state = next.node.costFrom;
          }
        }

        if (state != null && state.isStart == true) {
          path.forEach(el => {
            this.appService.publish(`${el.xCord}-${el.yCord}-color`, {});
          })
          break;
        }
      }
    });

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
      this.appService.publish(this.getActionNodeName() + '-' + this.selectedMode, {});
      this.selectedMode = 'target';
    } else if (this.selectedMode == 'target') {
      this.appService.publish(this.getActionNodeName() + '-' + this.selectedMode, {});
      this.selectedMode = 'rock';
    } else {
      this.appService.publish(this.getActionNodeName() + '-' + this.selectedMode, {});
    }
  }

  getActionNodeName(): string {
    return `${this.xValue}-${this.yValue}`;
  }

  stepper;
  startExploration() {
    this.stepper = setInterval(() => {
      this.explore();
    }, this.timeInterval * 100)
  }

  stopExploration() {
    clearInterval(this.stepper);
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
        else {
          break;

        }
      }

      this.visitedList.push(node);
      this.lastSelectedNode = node;
      this.appService.publish(`${node.node.xCord}-${node.node.yCord}-select`, {});
      this.appService.removeExploration(node.node);
    }

  }

  resetStatus() {
    // block last selected
    this.blockedNodes.push(this.lastSelectedNode.from)
    this.appService.publish(`${this.lastSelectedNode.node.xCord}-${this.lastSelectedNode.node.yCord}-block`, {})
    // set all visiteds false
    this.lastSelectedNode = null;
    this.appService.publish('reset-path', {});
    // start from Begining node again
    this.appService.resetPath();
    this.explore();
  }

  chooseSelected(i): Exploration {
    try {

      let explored = this.appService.getExploredNodes();
      // if (i + 1 >= explored.length) {
      //   this.resetStatus();
      // }

      const mergeSorted = this.mergeSort(explored);

      const g = explored.sort((a, b) => a.node.fCost <= b.node.fCost ? a.node.fCost : b.node.fCost);
      let first = mergeSorted[i];
      let second = mergeSorted[i + 1];

      if (first.node.fCost == second.node.fCost) {
        if (first.node.gCost > second.node.gCost) {
          return first;
        } else {
          return second;
        }
      } else {
        return first.node.fCost < second.node.fCost ? first : second;
      }

    } catch (error) {
      console.log('Error on iteration number: ' + i);
      return null;

    }

  }

  setAction(xc, yc) {
    let name = `${xc}-${yc}`;
    if (this.selectedMode == 'start') {
      this.startNode = name;
      this.appService.publish(name + '-' + this.selectedMode, {});
      this.selectedMode = 'target';
    } else if (this.selectedMode == 'target') {
      this.appService.publish(name + '-' + this.selectedMode, {});
      this.selectedMode = 'rock';
    } else {
      this.appService.publish(name + '-' + this.selectedMode, {});
    }
  }

  mergeSort(list: Exploration[]): Exploration[] {
    const len = list.length
    // an array of length == 1 is technically a sorted list
    if (len == 1) {
      return list
    }

    // get mid item
    const middleIndex = Math.ceil(len / 2)

    // split current list into two: left and right list
    let leftList = list.slice(0, middleIndex)
    let rightList = list.slice(middleIndex, len)

    leftList = this.mergeSort(leftList)
    rightList = this.mergeSort(rightList)

    return this.merge(leftList, rightList)
  }

  // Solve the sub-problems and merge them together
  merge(leftList: Exploration[], rightList: Exploration[]) {
    const sorted = [];
    while (leftList.length > 0 && rightList.length > 0) {
      const leftItem = leftList[0];
      const rightItem = rightList[0];
      if (leftItem.node.fCost > rightItem.node.fCost) {
        sorted.push(rightItem);
        rightList.shift();
      } else if (leftItem.node.fCost == rightItem.node.fCost) {
        let left = leftItem.node;
        let right = rightItem.node;
        let Xstate = 0;
        let Ystate = 0;
        if (this.lastSelectedNode != null) {

          Xstate = this.targetNode.xCord - this.lastSelectedNode.node.xCord;
          Ystate = this.targetNode.yCord - this.lastSelectedNode.node.yCord;
        }

        if (Xstate < 0 && Ystate < 0) {
          if (left.xCord >= right.xCord && left.yCord >= right.yCord) {
            sorted.push(rightItem);
            rightList.shift();
          } else {
            sorted.push(leftItem);
            leftList.shift();
          }
        } else {
          if (left.xCord >= right.xCord && left.yCord >= right.yCord) {
            sorted.push(leftItem);
            leftList.shift();
          } else {
            sorted.push(rightItem);
            rightList.shift();
          }
        }
      }
      else {
        sorted.push(leftItem);
        leftList.shift();
      }
    }

    // if left list has items, add what is left to the results
    while (leftList.length !== 0) {
      sorted.push(leftList[0])
      leftList.shift()
    }

    // if right list has items, add what is left to the results
    while (rightList.length !== 0) {
      sorted.push(rightList[0])
      rightList.shift()
    }

    // merge the left and right list
    return sorted
  }
}
