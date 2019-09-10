import { Injectable } from '@angular/core';
import { AppServiceService } from './app-service.service';
import { NodeType } from '../models/node-type';

@Injectable({
  providedIn: 'root'
})
export class PathService {

  rocks:NodeType[] = [];

  constructor(private appService: AppServiceService) {
    this.appService.on("rocks").subscribe((rock:NodeType) => {
      this.rocks.push(rock);
    })
  }
  
}
