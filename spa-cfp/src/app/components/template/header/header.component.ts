import { HomeComponent } from '../../../views/home/home.component';
import { Component } from '@angular/core';
import { CFPService } from 'src/app/services/cfp.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(
    private home: HomeComponent,
    public cfpService: CFPService) { }

  toggleMenu(): void {
    this.home.toggle()
  }

}
