import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav'
import { Router } from '@angular/router';
import { CFPService } from 'src/app/services/cfp.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('cfpSideNav', { static: true })
  public sidenav?: MatSidenav;

  constructor(
    private router: Router,
    public cfpService: CFPService,
    public userService: UserService
  ) { }

  ngOnInit(): void {
    // this.router.navigate(['category'])
  }

  public toggle(): void {
    if (this.sidenav !== undefined)
      this.sidenav.toggle();
  }

  public signoff(): void {
    this.cfpService.removeToken()
    this.cfpService.setOwner({ id: 0, email: '' })
    this.cfpService.setCategoryTabIndex(0)
    this.router.navigate(['sign'])
  }

}
