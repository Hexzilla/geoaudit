import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'geoaudit-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit {

  id: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  details() {
    this.router.navigate([`/home/jobs/job/${this.id}/details`]);
  }

  attachments() {
    this.router.navigate([`/home/jobs/job/${this.id}/attachments`]);
  }

  surveys() {
    this.router.navigate([`/home/jobs/job/${this.id}/surveys`]);
  }

}
