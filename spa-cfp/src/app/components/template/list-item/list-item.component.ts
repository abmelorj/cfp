import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.css']
})
export class ListItemComponent {
  @Input() date: string
  @Input() name: string
  @Input() value: number
  @Input() action: string
  @Input() route: string

  constructor() {
    this.date = 'none'
    this.name = ''
    this.value = 0
    this.action = 'none'
    this.route = ''
  }
}

