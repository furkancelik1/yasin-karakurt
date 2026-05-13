declare module 'iyzipay' {
  export default class Iyzipay {
    constructor(options: {
      apiKey: string;
      secretKey: string;
      uri: string;
    });
    checkoutFormInitialize: {
      create(request: Record<string, any>, callback: (err: any, result: any) => void): void;
    };
    checkoutForm: {
      retrieve(request: Record<string, any>, callback: (err: any, result: any) => void): void;
    };
  }
}