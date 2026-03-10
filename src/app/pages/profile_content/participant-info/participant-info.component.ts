import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-participant-info',
  templateUrl: './participant-info.component.html',
  styleUrls: ['./participant-info.component.scss'],
  standalone:false
})
export class ParticipantInfoComponent  implements OnInit {
  @Input() participant: {
    id: string;
    name: string;
    age: number;
    grade: string;
    school: string;
  } | any;
  constructor(
  ) {

   }

  ngOnInit() {}
  
  @Output() profileClicked = new EventEmitter<void>();

  viewProfile() {
    this.profileClicked.emit();
  }

}
