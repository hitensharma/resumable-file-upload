import { Component, OnInit } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEventType
} from "@angular/common/http";
import { FormBuilder } from "@angular/forms";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "resumable-upload-file";

  selectedFile; //Resumable File Upload Variable
  name; //Resumable File Upload Variable
  uploadPercent; //Resumable File Upload Variable
  color = "primary"; //Mat Spinner Variable (Resumable)
  mode = "determinate"; //Mat Spinner Variable (Resumable)
  value = 50.25890809809; //Mat Spinner Variable (Resumable)

  constructor(private http: HttpClient, private form: FormBuilder) {}
  ngOnInit() {}

  /* Code For Resumable File Upload Start*/
  goToLink(url: string) {
    window.open(url, "_blank");
  }

  onFileSelect(event) {
    this.selectedFile = event.target.files[0]; //User selected File
    this.name = this.selectedFile.name;
    console.log(this.selectedFile);
  }

  resumableUpload() {
    //checks file id exists or not, checks on name and last modified
    let fileId = `${this.selectedFile.name}-${this.selectedFile.lastModified}`;
    let headers = new HttpHeaders({
      size: this.selectedFile.size.toString(),
      "x-file-id": fileId,
      name: this.name
    });

    //To know whether file exist or not before making upload
    this.http
      .get("http://localhost:3000/status", { headers: headers })
      .subscribe((res: any) => {
        console.log(JSON.stringify(res));
        if (res.status === "file is present") {
          alert("File already exists. Please choose a different file.");
          return;
        }
        let uploadedBytes = res.uploaded; //GET response how much file is uploaded
        let headers2 = new HttpHeaders({
          size: this.selectedFile.size.toString(),
          "x-file-id": fileId,
          "x-start-byte": uploadedBytes.toString(),
          name: this.name
        });
        // Useful for showing animation of Mat Spinner
        const req = new HttpRequest(
          "POST",
          "http://localhost:3000/upload",
          this.selectedFile.slice(uploadedBytes, this.selectedFile.size + 1),
          {
            headers: headers2,
            reportProgress: true //continously fetch data from server of how much file is uploaded
          }
        );
        this.http.request(req).subscribe(
          (res: any) => {
            if (res.type === HttpEventType.UploadProgress) {
              this.uploadPercent = Math.round((100 * res.loaded) / res.total);
              console.log(this.uploadPercent);
              if (this.uploadPercent >= 100) {
                this.name = "";
                this.selectedFile = null;
              }
            } else {
              console.log(JSON.stringify(res));
              if (this.uploadPercent >= 100) {
                this.name = "";
                this.selectedFile = null;
              }
            }
          },
          err => {}
        );
      });
  }
}
