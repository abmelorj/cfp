import { CFPService } from './../../../services/cfp.service';
import { Component, Input, DoCheck } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements DoCheck {

  @Input() shallValue: number = 0;
  @Input() balanceValue: number = 0;
  @Input() finalBalanceValue: number = 0;

  constructor(private cfpService: CFPService) { }

  ngDoCheck(): void {
    this.updateValues()
  }

  updateValues(): void {
    this.shallValue = this.cfpService.shallValue
    this.balanceValue = this.cfpService.balanceValue
    this.finalBalanceValue = this.cfpService.finalBalanceValue
  }

}
