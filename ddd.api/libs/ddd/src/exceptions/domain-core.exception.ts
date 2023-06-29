export class DomainException extends Error {
  constructor(message: string) {
    super();

    const className: string = (<unknown>this.constructor.name) as string;
    this.message = `${className}: `;
    this.message += message;
  }
}
