import { CFPService } from './../../../services/cfp.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  @Input() shallValue: number = 0;
  @Input() balanceValue: number = 0;
  @Input() finalBalanceValue: number = 0;

  constructor(private cfpService: CFPService) { }

  ngOnInit(): void {
    this.updateValues()
  }

  updateValues(): void {
    this.shallValue = this.cfpService.shallValue
    this.balanceValue = this.cfpService.balanceValue
    this.finalBalanceValue = this.cfpService.finalBalanceValue
  }

}