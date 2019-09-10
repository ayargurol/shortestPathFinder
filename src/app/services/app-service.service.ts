import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { PathValues } from '../models/pathValues-type';
import { NodeType } from '../models/node-type';
import { Exploration } from '../models/exploration-type';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {
  private subjects: Subject<any>[] = [];
  targetNode: NodeType;
  exploredNodes: Exploration[];


  constructor() { }


  publish(eventName: string, data: any) {
    this.subjects[eventName] = this.subjects[eventName] || new Subject<any>();

    this.subjects[eventName].next(data);
  }

  on(eventName: string): Observable<any> {
    this.subjects[eventName] = this.subjects[eventName] || new Subject<any>();

    return this.subjects[eventName].asObservable();
  }

  getPathValues(): PathValues {
    return { diagonal: 14, straight: 10 }
  }

  setTargetNode(targetNode: NodeType): void {
    this.targetNode = targetNode;
  }

  getTargetNode(): NodeType {
    return this.targetNode;
  }

  setExploration(node: NodeType, fromNode: NodeType) {
    let exist = this.exploredNodes.find(a => a.node.xCord == node.xCord && a.node.yCord == node.yCord)
    if (exist != undefined) {
      exist.node = node;
      exist.from = fromNode;
    } else {
      this.exploredNodes.push({ node, from: fromNode })
    }
  }
}
