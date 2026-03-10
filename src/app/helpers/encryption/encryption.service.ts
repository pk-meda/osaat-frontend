import { Injectable } from '@angular/core';
import * as aesjs from 'aes-js';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  AES_KEY_256:any =  atob(environment.key_as).split('@')
  Aes_initializationVector:any = atob(environment.key_vec).split('@')
  Aes_KEY_256_BUFFER:any;

  constructor() { 
    this.AES_KEY_256 = this.AES_KEY_256.map((item:any) => { return parseInt(item)} );
    this.Aes_initializationVector = this.Aes_initializationVector.map((item:any) => { return parseInt(item)} );
    this.Aes_KEY_256_BUFFER = new Uint8Array(this.AES_KEY_256);
  }

  encrypt (text:any) {
    const textBytes = aesjs.utils.utf8.toBytes(text);
    const aesCbc = new aesjs.ModeOfOperation.ofb(
      this.Aes_KEY_256_BUFFER,
      this.Aes_initializationVector,
    );
    const encryptedBytes = aesCbc.encrypt(textBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
  }

  decryptData (value:any) {
    var encryptedBytes = aesjs.utils.hex.toBytes(value);
    var aesOfb = new aesjs.ModeOfOperation.ofb(
      this.Aes_KEY_256_BUFFER,
      this.Aes_initializationVector,
    );
    var decryptedBytes = aesOfb.decrypt(encryptedBytes);
  
    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
  };

  encode(newValue: any) {
    return newValue ? this.encrypt(newValue) : newValue;
  }

  decode(newValue: any) {
    return newValue ? this.decryptData(newValue) : newValue;
  }

  getDecode(res:any, def = []) {
    if (!res.error) {
      if (res.body) {
        res.body = this.decryptData(res.body);
        res.body = res.body ? JSON.parse(res.body) : def;
      }
    }
    return res;
  }

}
