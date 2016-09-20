import { Injectable } from "@angular/core";
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {CookieService} from 'angular2-cookie/core';


@Injectable()
export class ApiHelper {

    constructor(private _cookieService: CookieService) { }

    public AuthOptions(): RequestOptions {
        let token = this._cookieService.get('token');
        let args = new RequestOptions();
        args.withCredentials = true;
        let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
        args.headers = headers;
        return args;
    }
    public handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

    public extractJson(res: Response) {
        return res.json();
    }


}