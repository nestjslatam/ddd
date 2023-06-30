import { DomainEntity } from '@nestjslatam/ddd';
import { Name } from './name';

interface ParentProps {
  Name: Name;
}

export class Parent extends DomainEntity<ParentProps> {
  businessRules(): void {
    throw new Error('Method not implemented.');
  }
}
