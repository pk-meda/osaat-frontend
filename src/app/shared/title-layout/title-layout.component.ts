import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'page-title-layout',
  templateUrl: './title-layout.component.html',
  styleUrls: ['./title-layout.component.scss'],
  imports: [CommonModule]
})
export class TitleLayoutComponent  implements OnInit {
  @Input() content:titleContent = { title: 'No Title', disc: '' };

  constructor() { }

  ngOnInit() {}

}

interface titleContent {
  title: string,
  disc: string,
  other?: any
}
