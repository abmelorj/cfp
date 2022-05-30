import { CFPService } from './../../../services/cfp.service';
import { Component, Input, DoCheck } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements DoCheck {

  @Input() shallLabel: string = '';
  @Input() shallValue: number = 0;
  @Input() balanceLabel: string = '';
  @Input() balanceValue: number = 0;
  @Input() finalBalanceLabel: string = '';
  @Input() finalBalanceValue: number = 0;

  constructor(private cfpService: CFPService) { }

  ngDoCheck(): void {
    this.shallLabel = this.cfpService.shallLabel
    this.shallValue = this.cfpService.shallValue
    this.balanceLabel = this.cfpService.balanceLabel
    this.balanceValue = this.cfpService.balanceValue
    this.finalBalanceLabel = this.cfpService.finalBalanceLabel
    this.finalBalanceValue = this.cfpService.finalBalanceValue
  }

}
