import { Test, TestingModule } from '@nestjs/testing';
import { SystemSagas } from './system.saga';
import { of } from 'rxjs';
import { SingerCreatedDomainEvent } from '../../domain/events';

describe('SystemSagas', () => {
    let sagas: SystemSagas;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SystemSagas],
        }).compile();

        sagas = module.get<SystemSagas>(SystemSagas);
    });

    it('should be defined', () => {
        expect(sagas).toBeDefined();
    });

    describe('systemCreated', () => {
        it('should react to SingerCreatedDomainEvent', (done) => {
            const event = new SingerCreatedDomainEvent('1', 'Singer Name');

            const events$ = of(event);

            sagas.systemCreated(events$).subscribe((result) => {
                // The saga maps to void (console.log). 
                // We just verify it emits and completes.
                expect(result).toBeUndefined(); // map returns void implies undefined value or we check what map returns.
                // map((event) => console.log(...)) returns result of console.log which is undefined.
                done();
            });
        });
    });
});
