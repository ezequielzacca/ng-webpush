import { Component, OnInit } from '@angular/core';
import { NgWebPushService } from 'ng-webpush';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'pwa-web-push';
  notification: any;
  
  constructor(private qp: NgWebPushService) { }

  ngOnInit() {
    this.qp.token.subscribe(token => {
      console.log("FCM TOKEN: ", token);
    })

    this.qp.push.subscribe(push => {
      this.notification = push
    })
  }
}
