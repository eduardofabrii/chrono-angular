import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-release-time',
  templateUrl: './release-time.component.html',
  styleUrls: ['./release-time.component.scss']
})
export class ReleaseTimeComponent {
  isVisibleReleaseTimeDialog = false;
  releaseTimeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.releaseTimeForm = this.fb.group({
      date: [''],
      hours: [''],
      description: ['']
    });
  }

  openDialog() {
    this.isVisibleReleaseTimeDialog = true;
  }

  onCloseDialog() {
    this.isVisibleReleaseTimeDialog = false;
  }

  releaseTime() {
    // Logic to release time
    this.onCloseDialog();
  }
}
